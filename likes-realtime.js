// SISTEMA DE LIKES EN TIEMPO REAL CON FIREBASE
import { 
  doc, 
  setDoc, 
  deleteDoc, 
  getDoc, 
  onSnapshot, 
  collection, 
  query, 
  where, 
  getDocs,
  updateDoc,
  increment 
} from 'https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js';

class RealtimeLikes {
  constructor(db) {
    this.db = db;
    this.listeners = new Map();
    this.productListeners = new Map();
  }

  // Obtener ID de usuario
  getUserId() {
    const currentUser = window.authModal?.currentUser || window.authFunctions?.getCurrentUser?.();
    if (currentUser && currentUser.uid) {
      return currentUser.uid;
    }
    
    let anonId = localStorage.getItem('anonymousUserId');
    if (!anonId) {
      anonId = Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
      localStorage.setItem('anonymousUserId', anonId);
    }
    return `anon_${anonId}`;
  }

  // TOGGLE LIKE CON ACTUALIZACIÓN INSTANTÁNEA
  async toggleLike(productId, buttonElement) {
    const userId = this.getUserId();
    const likeId = `${productId}_${userId}`;

    try {
      // Verificar estado actual
      const likeRef = doc(this.db, 'likes', likeId);
      const likeSnap = await getDoc(likeRef);
      const hasLiked = likeSnap.exists();

      // ACTUALIZAR UI INMEDIATAMENTE (Optimistic Update)
      this.updateLikeUI(productId, !hasLiked, buttonElement);

      if (hasLiked) {
        // Quitar like
        await deleteDoc(likeRef);
        
        // Decrementar contador en producto
        const productRef = doc(this.db, 'products', productId);
        await updateDoc(productRef, {
          likesCount: increment(-1),
          updatedAt: new Date()
        });
        // Actualizar contador en UI
        const countElement = document.querySelector(`.like-count[data-product-id="${productId}"]`);
        if(countElement) {
          countElement.textContent = Math.max(0, parseInt(countElement.textContent) - 1);
          countElement.classList.add('like-count-animate');
          setTimeout(() => countElement.classList.remove('like-count-animate'), 300); // Coincide con la duración de la animación
        }
      } else {
        // Dar like
        await setDoc(likeRef, {
          productId: productId,
          userId: userId,
          username: userId.startsWith('anon_') ? 'Anónimo' : 'Usuario',
          createdAt: new Date()
        });
        
        // Incrementar contador en producto
        const productRef = doc(this.db, 'products', productId);
        await updateDoc(productRef, {
          likesCount: increment(1),
          updatedAt: new Date()
        });
        // Actualizar contador en UI
        const countElement = document.querySelector(`.like-count[data-product-id="${productId}"]`);
        if(countElement) {
          countElement.textContent = parseInt(countElement.textContent) + 1;
          countElement.classList.add('like-count-animate');
          setTimeout(() => countElement.classList.remove('like-count-animate'), 300); // Coincide con la duración de la animación
        }
      }

      console.log(`✅ Like ${hasLiked ? 'removed' : 'added'} successfully`);

    } catch (error) {
      console.error('❌ Error toggling like:', error);
      // Revertir UI si falla
      this.updateLikeUI(productId, !buttonElement.classList.contains('liked'), buttonElement); // Revertir al estado anterior
      throw error;
    }
  }

  // Función para actualizar la UI del botón de like de forma instantánea
  updateLikeUI(productId, isLiked, buttonElement) {
    const btn = buttonElement || document.querySelector(`.like-btn[data-product-id="${productId}"]`);
    if (!btn) return;

    const heartIcon = btn.querySelector('.heart-icon');
    
    if (isLiked) {
      btn.classList.add('liked');
      // Forzar la actualización visual inmediata
      if (heartIcon) {
        heartIcon.src = '/img-galery/heart-filled.svg';
      }
      btn.style.setProperty('background-color', '#ff1744', 'important');
      btn.style.setProperty('border-radius', '50%', 'important');
    } else {
      btn.classList.remove('liked');
      // Forzar la actualización visual inmediata
      if (heartIcon) {
        heartIcon.src = '/img-galery/heartproduct.svg';
      }
      btn.style.removeProperty('background-color');
      btn.style.removeProperty('border-radius');
    }
  }

  // ACTUALIZAR UI AL INSTANTE - FORZADO
  updateUIInstantly(productId, isLiked) {
    const likeBtn = document.querySelector(`.like-btn[data-product-id="${productId}"]`);
    const heartIcon = likeBtn?.querySelector('.heart-icon');
    const countElement = document.querySelector(`.like-count[data-product-id="${productId}"]`);
    
    if (likeBtn && heartIcon) {
      // FORZAR CAMBIO VISUAL EXTREMO
      if (isLiked) {
        likeBtn.classList.add('liked');
        likeBtn.setAttribute('data-liked', 'true');
        heartIcon.src = '/img-galery/heart-filled.svg';
        
        // MÚLTIPLES MÉTODOS PARA FORZAR EL BACKGROUND ROJO
        likeBtn.style.cssText += 'background: #ff1744 !important; border-radius: 50% !important; padding: 4px !important;';
        likeBtn.style.setProperty('background-color', '#ff1744', 'important');
        likeBtn.style.setProperty('background', '#ff1744', 'important');
        
        // Crear elemento visual de respaldo
        if (!likeBtn.querySelector('.like-overlay')) {
          const overlay = document.createElement('div');
          overlay.className = 'like-overlay';
          overlay.style.cssText = 'position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: #ff1744; border-radius: 50%; z-index: -1; pointer-events: none;';
          likeBtn.style.position = 'relative';
          likeBtn.appendChild(overlay);
        }
        
      } else {
        likeBtn.classList.remove('liked');
        likeBtn.removeAttribute('data-liked');
        heartIcon.src = '/img-galery/heartproduct.svg';
        
        // REMOVER TODOS LOS ESTILOS
        likeBtn.style.cssText = likeBtn.style.cssText.replace(/background[^;]*;?/gi, '');
        likeBtn.style.removeProperty('background');
        likeBtn.style.removeProperty('background-color');
        
        // Remover overlay
        const overlay = likeBtn.querySelector('.like-overlay');
        if (overlay) overlay.remove();
      }
    }
    
  }

  // Revertir UI si falla la operación
  revertUI(productId) {
    const likeBtn = document.querySelector(`.like-btn[data-product-id="${productId}"]`);
    const heartIcon = likeBtn?.querySelector('.heart-icon');
    const countElement = document.querySelector(`.like-count[data-product-id="${productId}"]`);
    
    if (likeBtn && heartIcon) {
      const wasLiked = likeBtn.classList.contains('liked');
      if (wasLiked) {
        likeBtn.classList.remove('liked');
        heartIcon.src = '/img-galery/heartproduct.svg';
        likeBtn.style.background = '';
      } else {
        likeBtn.classList.add('liked');
        heartIcon.src = '/img-galery/heart-filled.svg';
        likeBtn.style.background = '#ff1744';
      }
      likeBtn.style.transform = 'scale(1)';
    }
    
    if (countElement) {
      const currentCount = parseInt(countElement.textContent) || 0;
      const revertedCount = likeBtn?.classList.contains('liked') ? currentCount + 1 : Math.max(0, currentCount - 1);
      countElement.textContent = revertedCount;
    }
  }

  // LISTENER EN TIEMPO REAL PARA UN PRODUCTO
  setupProductListener(productId) {
    if (this.productListeners.has(productId)) {
      return; // Ya existe listener
    }

    const productRef = doc(this.db, 'products', productId);
    const unsubscribe = onSnapshot(productRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        const countElement = document.querySelector(`.like-count[data-product-id="${productId}"]`);
        if (countElement && data.likesCount !== undefined) {
          countElement.textContent = data.likesCount;
        }
      }
    });

    this.productListeners.set(productId, unsubscribe);
  }

  // CARGAR ESTADO INICIAL DE LIKES
  async loadInitialState(productId) {
    try {
      const userId = this.getUserId();
      const likeId = `${productId}_${userId}`;
      
      // Verificar si el usuario dio like
      const likeRef = doc(this.db, 'likes', likeId);
      const likeSnap = await getDoc(likeRef);
      const hasLiked = likeSnap.exists();
      
      // Obtener contador de likes
      const productRef = doc(this.db, 'products', productId);
      const productSnap = await getDoc(productRef);
      const likesCount = productSnap.exists() ? (productSnap.data().likesCount || 0) : 0;
      
      // Actualizar UI con estado inicial correcto
      const likeBtn = document.querySelector(`.like-btn[data-product-id="${productId}"]`);
      const heartIcon = likeBtn?.querySelector('.heart-icon');
      const countElement = document.querySelector(`.like-count[data-product-id="${productId}"]`);
      
      if (likeBtn && heartIcon) {
        if (hasLiked) {
          // APLICAR ESTADO LIKED
          likeBtn.classList.add('liked');
          likeBtn.setAttribute('data-liked', 'true');
          heartIcon.src = '/img-galery/heart-filled.svg';
          likeBtn.style.cssText += 'background: #ff1744 !important; border-radius: 50% !important; padding: 4px !important;';
          
          // Crear overlay si no existe
          if (!likeBtn.querySelector('.like-overlay')) {
            const overlay = document.createElement('div');
            overlay.className = 'like-overlay';
            overlay.style.cssText = 'position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: #ff1744; border-radius: 50%; z-index: -1; pointer-events: none;';
            likeBtn.style.position = 'relative';
            likeBtn.appendChild(overlay);
          }
        } else {
          // APLICAR ESTADO NO LIKED
          likeBtn.classList.remove('liked');
          likeBtn.setAttribute('data-liked', 'false');
          heartIcon.src = '/img-galery/heartproduct.svg';
          likeBtn.style.removeProperty('background');
          
          // Remover overlay si existe
          const overlay = likeBtn.querySelector('.like-overlay');
          if (overlay) overlay.remove();
        }
      }
      
      if (countElement) {
        countElement.textContent = likesCount;
      }
      
      // Configurar listener en tiempo real
      this.setupProductListener(productId);
      
    } catch (error) {
      console.error('Error loading initial like state:', error);
    }
  }

  // Limpiar listeners
  cleanup() {
    this.productListeners.forEach(unsubscribe => unsubscribe());
    this.productListeners.clear();
  }
}

// Inicializar cuando Firebase esté listo
window.initRealtimeLikes = function() {
  if (window.firestoreManager && window.firestoreManager.db) {
    window.realtimeLikes = new RealtimeLikes(window.firestoreManager.db);
    console.log('✅ Realtime Likes initialized');
  }
};

// Auto-inicializar
setTimeout(() => {
  if (window.firestoreManager) {
    window.initRealtimeLikes();
  }
}, 1000);