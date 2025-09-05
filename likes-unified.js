// SISTEMA DE LIKES UNIFICADO CON FIREBASE Y FALLBACK LOCAL
import { 
  doc, 
  setDoc, 
  deleteDoc, 
  getDoc, 
  updateDoc,
  increment 
} from 'https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js';

class UnifiedLikes {
  constructor() {
    this.db = null;
    this.userLikes = new Set();
    this.localLikes = JSON.parse(localStorage.getItem('localLikes') || '{}');
    this.initialized = false;
    this.addStyles();
  }

  addStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .like-btn {
        background: #ff1744 !important;
        border-radius: 50% !important;
        padding: 4px !important;
        border: none !important;
        transition: all 0.3s ease !important;
      }
      
      .heart-icon {
        filter: brightness(0) invert(1) !important;
      }
      
      .like-btn:hover {
        transform: scale(1.1) !important;
        box-shadow: 0 4px 12px rgba(255, 23, 68, 0.4) !important;
      }
      
      .like-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ff1744;
        color: white;
        padding: 12px 20px;
        border-radius: 25px;
        font-weight: bold;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      }
      
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      
      .product-title {
        font-size: 1.8rem !important;
        font-weight: bold !important;
        line-height: 1.3 !important;
        margin-bottom: 10px !important;
      }
      
      .heart-icon {
        filter: brightness(0) invert(1) !important;
      }
      
      .like-count-animate {
        animation: bounce 0.3s ease;
      }
      
      @keyframes bounce {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.2); }
      }
    `;
    document.head.appendChild(style);
  }

  async init() {
    if (this.initialized) return;
    this.initialized = true;
    
    if (window.firestoreManager?.db) {
      this.db = window.firestoreManager.db;
    }
    
    await this.loadUserLikes();
    this.updateAllButtons();
    this.enlargeProductTitles();
  }

  enlargeProductTitles() {
    document.querySelectorAll('.product-title, .card-title, h3, h4, h5').forEach(title => {
      if (title.textContent.trim() && !title.classList.contains('enlarged')) {
        title.classList.add('enlarged');
        title.style.fontSize = '1.8rem';
        title.style.fontWeight = 'bold';
        title.style.lineHeight = '1.3';
        title.style.marginBottom = '10px';
      }
    });
  }

  getUserId() {
    const currentUser = window.authModal?.currentUser || window.authFunctions?.getCurrentUser?.();
    if (currentUser?.uid) return currentUser.uid;
    
    let anonId = localStorage.getItem('anonymousUserId');
    if (!anonId) {
      anonId = Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
      localStorage.setItem('anonymousUserId', anonId);
    }
    return `anon_${anonId}`;
  }

  async loadUserLikes() {
    try {
      if (!this.db) return;
      
      const userId = this.getUserId();
      const likesQuery = await this.db.collection('likes').where('userId', '==', userId).get();
      
      this.userLikes.clear();
      likesQuery.forEach(doc => {
        this.userLikes.add(doc.data().productId);
      });
    } catch (error) {
      console.log('Using local likes fallback');
      const userId = this.getUserId();
      const userLikesData = JSON.parse(localStorage.getItem('userLikes') || '{}');
      this.userLikes = new Set(userLikesData[userId] || []);
    }
  }

  updateAllButtons() {
    document.querySelectorAll('.like-btn').forEach(btn => {
      const productId = btn.dataset.productId;
      if (productId) {
        this.updateButton(productId);
      }
    });
  }

  updateButton(productId) {
    const btn = document.querySelector(`.like-btn[data-product-id="${productId}"]`);
    const icon = btn?.querySelector('.heart-icon');
    
    if (!btn || !icon) return;

    const isLiked = this.userLikes.has(productId);
    
    // Aplicar background rojo permanente
    btn.style.cssText = 'background: #ff1744 !important; border-radius: 50% !important; padding: 8px !important; border: none !important; transition: all 0.3s ease !important;';
    
    if (isLiked) {
      btn.classList.add('liked');
      icon.src = '/img-galery/heart-filled.svg';
    } else {
      btn.classList.remove('liked');
      icon.src = '/img-galery/heartproduct.svg';
    }
  }

  showNotification(message, isLike = true) {
    const notification = document.createElement('div');
    notification.className = 'like-notification';
    notification.textContent = message;
    notification.style.background = isLike ? '#ff1744' : '#666';
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideIn 0.3s ease reverse';
      setTimeout(() => notification.remove(), 300);
    }, 2000);
  }

  async toggleLike(productId) {
    const btn = document.querySelector(`.like-btn[data-product-id="${productId}"]`);
    const icon = btn?.querySelector('.heart-icon');
    const count = document.querySelector(`.like-count[data-product-id="${productId}"]`);
    
    if (!btn || !icon) return;

    const wasLiked = this.userLikes.has(productId);
    const newLikedState = !wasLiked;

    // Actualizar UI inmediatamente
    if (newLikedState) {
      this.userLikes.add(productId);
      btn.classList.add('liked');
      icon.src = '/img-galery/heart-filled.svg';
      this.showNotification('❤️ ¡Te gusta este producto!', true);
    } else {
      this.userLikes.delete(productId);
      btn.classList.remove('liked');
      icon.src = '/img-galery/heartproduct.svg';
      this.showNotification('💔 Ya no te gusta este producto', false);
    }

    // Actualizar contador con animación
    if (count) {
      const currentCount = parseInt(count.textContent) || 0;
      const newCount = newLikedState ? currentCount + 1 : Math.max(0, currentCount - 1);
      count.textContent = newCount;
      count.classList.add('like-count-animate');
      setTimeout(() => count.classList.remove('like-count-animate'), 300);
    }

    // Actualizar en Firebase o localStorage
    try {
      if (this.db) {
        await this.updateFirebase(productId, newLikedState);
      } else {
        this.updateLocalStorage(productId, newLikedState);
      }
    } catch (error) {
      console.error('Error updating like:', error);
      this.updateLocalStorage(productId, newLikedState);
    }
  }

  async updateFirebase(productId, isLiked) {
    const userId = this.getUserId();
    const likeId = `${productId}_${userId}`;
    const likeRef = doc(this.db, 'likes', likeId);
    const productRef = doc(this.db, 'products', productId);

    if (isLiked) {
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
      await deleteDoc(likeRef);
      await updateDoc(productRef, {
        likesCount: increment(-1),
        updatedAt: new Date()
      });
    }
  }

  updateLocalStorage(productId, isLiked) {
    const userId = this.getUserId();
    
    // Actualizar contador local
    if (isLiked) {
      this.localLikes[productId] = (this.localLikes[productId] || 0) + 1;
    } else {
      this.localLikes[productId] = Math.max(0, (this.localLikes[productId] || 0) - 1);
    }
    
    // Actualizar likes del usuario
    const userLikes = JSON.parse(localStorage.getItem('userLikes') || '{}');
    if (!userLikes[userId]) userLikes[userId] = [];
    
    if (isLiked) {
      if (!userLikes[userId].includes(productId)) {
        userLikes[userId].push(productId);
      }
    } else {
      userLikes[userId] = userLikes[userId].filter(id => id !== productId);
    }
    
    localStorage.setItem('localLikes', JSON.stringify(this.localLikes));
    localStorage.setItem('userLikes', JSON.stringify(userLikes));
  }

  // Forzar actualización de todos los elementos
  forceUpdate() {
    this.updateAllButtons();
    this.enlargeProductTitles();
    
    // Aplicar background rojo a todos los botones
    document.querySelectorAll('.like-btn').forEach(btn => {
      btn.style.cssText = 'background: #ff1744 !important; border-radius: 50% !important; padding: 8px !important; border: none !important; transition: all 0.3s ease !important;';
    });
  }
}

// Instancia global
window.unifiedLikes = new UnifiedLikes();

// Inicialización automática
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    window.unifiedLikes.init();
  }, 1000);
});

// Actualizar cuando cambie la sección
window.addEventListener('hashchange', () => {
  setTimeout(() => {
    window.unifiedLikes.forceUpdate();
  }, 500);
});

// Función global para usar en HTML
window.toggleLike = function(productId) {
  if (window.unifiedLikes) {
    window.unifiedLikes.toggleLike(productId);
  }
};

// Función para forzar actualización
window.forceLikesUpdate = function() {
  if (window.unifiedLikes) {
    window.unifiedLikes.forceUpdate();
  }
};