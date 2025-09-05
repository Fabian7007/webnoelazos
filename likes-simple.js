// SISTEMA DE LIKES SIMPLE Y FUNCIONAL
class SimpleLikes {
  constructor() {
    this.userLikes = new Set();
    this.productCounts = {};
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;
    this.initialized = true;
    
    // Cargar datos iniciales
    await this.loadUserLikes();
    this.updateAllButtons();
  }

  async loadUserLikes() {
    try {
      if (!window.firestoreManager) return;
      
      const userId = this.getUserId();
      if (!userId) return;

      // Cargar likes del usuario
      const likesQuery = window.firestoreManager.db ? 
        await window.firestoreManager.db.collection('likes')
          .where('userId', '==', userId)
          .get() : null;
      
      if (likesQuery) {
        this.userLikes.clear();
        likesQuery.forEach(doc => {
          this.userLikes.add(doc.data().productId);
        });
      }
    } catch (error) {
      console.log('Using fallback likes');
    }
  }

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
    const count = document.querySelector(`.like-count[data-product-id="${productId}"]`);
    
    if (!btn || !icon) return;

    const isLiked = this.userLikes.has(productId);
    
    // Limpiar estilos previos
    btn.className = 'like-btn';
    btn.style.cssText = '';
    
    if (isLiked) {
      btn.classList.add('liked');
      icon.src = '/img-galery/heart-filled.svg';
    } else {
      icon.src = '/img-galery/heartproduct.svg';
    }
  }

  async toggleLike(productId) {
    const btn = document.querySelector(`.like-btn[data-product-id="${productId}"]`);
    const icon = btn?.querySelector('.heart-icon');
    const count = document.querySelector(`.like-count[data-product-id="${productId}"]`);
    
    if (!btn || !icon) return;

    const wasLiked = this.userLikes.has(productId);
    const newLikedState = !wasLiked;

    // Actualizar UI inmediatamente
    btn.className = 'like-btn';
    btn.style.cssText = '';
    
    if (newLikedState) {
      this.userLikes.add(productId);
      btn.classList.add('liked');
      icon.src = '/img-galery/heart-filled.svg';
    } else {
      this.userLikes.delete(productId);
      icon.src = '/img-galery/heartproduct.svg';
    }

    // Actualizar contador
    if (count) {
      const currentCount = parseInt(count.textContent) || 0;
      const newCount = newLikedState ? currentCount + 1 : Math.max(0, currentCount - 1);
      count.textContent = newCount;
    }

    // Actualizar en Firebase
    try {
      if (window.realtimeLikes) {
        await window.realtimeLikes.toggleLike(productId);
      }
    } catch (error) {
      console.log('Firebase update failed, using local state');
    }
  }
}

// Instancia global
window.simpleLikes = new SimpleLikes();

// Inicializar cuando esté listo
setTimeout(() => {
  if (window.simpleLikes) {
    window.simpleLikes.init();
  }
}, 1000);