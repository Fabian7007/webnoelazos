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

  // TOGGLE LIKE CON ACTUALIZACIÓN INSTANTÁNEA Y CACHE LOCAL
  async toggleLike(productId, buttonElement) {
    const userId = this.getUserId();
    const likeId = `${productId}_${userId}`;

    try {
      // Verificar estado actual desde cache local primero
      const localLikes = JSON.parse(localStorage.getItem('userLikes') || '{}');
      const userLikesArray = localLikes[userId] || [];
      const hasLikedLocal = userLikesArray.includes(productId);
      
      const newLikedState = !hasLikedLocal;

      // ACTUALIZAR UI Y CACHE LOCAL INMEDIATAMENTE
      this.updateLikeUI(productId, newLikedState, buttonElement);
      this.updateLocalCache(productId, newLikedState);

      // Actualizar contador en UI inmediatamente
      const countElement = document.querySelector(`.like-count[data-product-id="${productId}"]`);
      if(countElement) {
        const currentCount = parseInt(countElement.textContent) || 0;
        const newCount = newLikedState ? currentCount + 1 : Math.max(0, currentCount - 1);
        countElement.textContent = newCount;
        countElement.classList.add('like-count-animate');
        setTimeout(() => countElement.classList.remove('like-count-animate'), 300);
      }

      // Luego actualizar Firebase si está disponible
      if (this.db) {
        const likeRef = doc(this.db, 'likes', likeId);
        const productRef = doc(this.db, 'products', productId);
        
        if (newLikedState) {
          // Dar like
          await setDoc(likeRef, {
            productId: productId,
            userId: userId,
            username: userId.startsWith('anon_') ? 'Anónimo' : 'Usuario',
            createdAt: new Date()
          });
          await updateDoc(productRef, {
            likesCount: increment(1),
            updatedAt: new Date()
          });
        } else {
          // Quitar like
          await deleteDoc(likeRef);
          await updateDoc(productRef, {
            likesCount: increment(-1),
            updatedAt: new Date()
          });
        }
      }

      console.log(`✅ Like ${newLikedState ? 'added' : 'removed'} successfully`);

    } catch (error) {
      console.error('❌ Error toggling like:', error);
      // Revertir UI y cache local si falla
      this.updateLikeUI(productId, !buttonElement.classList.contains('liked'), buttonElement);
      this.updateLocalCache(productId, !buttonElement.classList.contains('liked'));
      throw error;
    }
  }
  
  // Función para actualizar cache local
  updateLocalCache(productId, isLiked) {
    const userId = this.getUserId();
    const localLikes = JSON.parse(localStorage.getItem('userLikes') || '{}');
    
    if (!localLikes[userId]) {
      localLikes[userId] = [];
    }
    
    if (isLiked) {
      if (!localLikes[userId].includes(productId)) {
        localLikes[userId].push(productId);
      }
    } else {
      const index = localLikes[userId].indexOf(productId);
      if (index > -1) {
        localLikes[userId].splice(index, 1);
      }
    }
    
    localStorage.setItem('userLikes', JSON.stringify(localLikes));
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

  // CARGAR ESTADO INICIAL DE LIKES CON CACHE LOCAL
  async loadInitialState(productId) {
    try {
      const userId = this.getUserId();
      const likeId = `${productId}_${userId}`;
      
      // Usar cache local primero para respuesta inmediata
      const localLikes = JSON.parse(localStorage.getItem('userLikes') || '{}');
      const userLikesArray = localLikes[userId] || [];
      const hasLikedLocal = userLikesArray.includes(productId);
      
      // Aplicar estado local inmediatamente
      this.applyLikeState(productId, hasLikedLocal);
      
      // Luego verificar con Firebase si está disponible
      if (this.db) {
        const likeRef = doc(this.db, 'likes', likeId);
        const likeSnap = await getDoc(likeRef);
        const hasLikedFirebase = likeSnap.exists();
        
        // Obtener contador de likes
        const productRef = doc(this.db, 'products', productId);
        const productSnap = await getDoc(productRef);
        const likesCount = productSnap.exists() ? (productSnap.data().likesCount || 0) : 0;
        
        // Actualizar contador
        const countElement = document.querySelector(`.like-count[data-product-id="${productId}"]`);
        if (countElement) {
          countElement.textContent = likesCount;
        }
        
        // Si hay diferencia entre local y Firebase, usar Firebase
        if (hasLikedLocal !== hasLikedFirebase) {
          this.applyLikeState(productId, hasLikedFirebase);
          // Actualizar cache local
          if (hasLikedFirebase) {
            if (!userLikesArray.includes(productId)) {
              userLikesArray.push(productId);
            }
          } else {
            const index = userLikesArray.indexOf(productId);
            if (index > -1) {
              userLikesArray.splice(index, 1);
            }
          }
          localLikes[userId] = userLikesArray;
          localStorage.setItem('userLikes', JSON.stringify(localLikes));
        }
        
        // Configurar listener en tiempo real
        this.setupProductListener(productId);
      }
      
    } catch (error) {
      console.error('Error loading initial like state:', error);
      // Fallback a estado local
      const localLikes = JSON.parse(localStorage.getItem('userLikes') || '{}');
      const userId = this.getUserId();
      const userLikesArray = localLikes[userId] || [];
      const hasLikedLocal = userLikesArray.includes(productId);
      this.applyLikeState(productId, hasLikedLocal);
    }
  }
  
  // Función auxiliar para aplicar estado de like
  applyLikeState(productId, isLiked) {
    const likeBtn = document.querySelector(`.like-btn[data-product-id="${productId}"]`);
    const heartIcon = likeBtn?.querySelector('.heart-icon');
    
    if (likeBtn && heartIcon) {
      if (isLiked) {
        likeBtn.classList.add('liked');
        likeBtn.setAttribute('data-liked', 'true');
        heartIcon.src = '/img-galery/heart-filled.svg';
        // Aplicar múltiples métodos para asegurar el background rojo
        likeBtn.style.setProperty('background', '#ff1744', 'important');
        likeBtn.style.setProperty('background-color', '#ff1744', 'important');
        likeBtn.style.setProperty('border-radius', '50%', 'important');
        likeBtn.style.setProperty('padding', '6px', 'important');
      } else {
        likeBtn.classList.remove('liked');
        likeBtn.setAttribute('data-liked', 'false');
        heartIcon.src = '/img-galery/heartproduct.svg';
        // Aplicar background blanco para estado no liked
        likeBtn.style.setProperty('background', 'rgba(255, 255, 255, 0.9)', 'important');
        likeBtn.style.setProperty('background-color', 'rgba(255, 255, 255, 0.9)', 'important');
        likeBtn.style.setProperty('border-radius', '50%', 'important');
        likeBtn.style.setProperty('padding', '6px', 'important');
      }
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