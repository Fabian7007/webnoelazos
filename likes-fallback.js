// Sistema de likes con fallback local cuando Firestore falla
class LikesFallback {
  constructor() {
    this.localLikes = JSON.parse(localStorage.getItem('localLikes') || '{}');
    this.userLikes = JSON.parse(localStorage.getItem('userLikes') || '{}');
  }

  // Generar ID de usuario anónimo
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

  // Dar like a un producto
  likeProduct(productId) {
    const userId = this.getUserId();
    
    // Incrementar contador
    this.localLikes[productId] = (this.localLikes[productId] || 0) + 1;
    
    // Marcar que el usuario dio like
    if (!this.userLikes[userId]) {
      this.userLikes[userId] = [];
    }
    if (!this.userLikes[userId].includes(productId)) {
      this.userLikes[userId].push(productId);
    }
    
    this.save();
  }

  // Quitar like de un producto
  unlikeProduct(productId) {
    const userId = this.getUserId();
    
    // Decrementar contador
    this.localLikes[productId] = Math.max(0, (this.localLikes[productId] || 0) - 1);
    
    // Quitar like del usuario
    if (this.userLikes[userId]) {
      this.userLikes[userId] = this.userLikes[userId].filter(id => id !== productId);
    }
    
    this.save();
  }

  // Verificar si el usuario dio like
  hasUserLiked(productId) {
    const userId = this.getUserId();
    return this.userLikes[userId]?.includes(productId) || false;
  }

  // Obtener contador de likes
  getLikeCount(productId) {
    return this.localLikes[productId] || 0;
  }

  // Guardar en localStorage
  save() {
    localStorage.setItem('localLikes', JSON.stringify(this.localLikes));
    localStorage.setItem('userLikes', JSON.stringify(this.userLikes));
  }
}

// Instancia global
window.likesFallback = new LikesFallback();