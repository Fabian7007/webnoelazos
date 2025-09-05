// Sistema de likes en tiempo real
class RealtimeLikes {
  constructor() {
    this.listeners = new Map();
    this.init();
  }

  init() {
    // Inicializar cuando Firestore esté disponible
    const checkFirestore = () => {
      if (window.firestoreManager) {
        console.log('Sistema de likes en tiempo real inicializado');
      } else {
        setTimeout(checkFirestore, 100);
      }
    };
    checkFirestore();
  }

  // Configurar listener para un producto específico
  setupProductListener(productId) {
    if (!window.firestoreManager || this.listeners.has(productId)) {
      return;
    }

    const unsubscribe = window.firestoreManager.listenToProductLikes(productId, (newCount) => {
      this.updateAllProductCounters(productId, newCount);
    });

    this.listeners.set(productId, unsubscribe);
  }

  // Actualizar todos los contadores de un producto en la página
  updateAllProductCounters(productId, newCount) {
    const countElements = document.querySelectorAll(`.like-count[data-product-id="${productId}"]`);
    countElements.forEach(element => {
      element.textContent = newCount;
    });
  }

  // Limpiar todos los listeners
  cleanup() {
    this.listeners.forEach(unsubscribe => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    });
    this.listeners.clear();
  }

  // Configurar listeners para todos los productos visibles
  setupVisibleProducts() {
    const productElements = document.querySelectorAll('[data-product-id]');
    const productIds = new Set();
    
    productElements.forEach(element => {
      const productId = element.getAttribute('data-product-id');
      if (productId && !productIds.has(productId)) {
        productIds.add(productId);
        this.setupProductListener(productId);
      }
    });
  }
}

// Inicializar sistema global
window.realtimeLikes = new RealtimeLikes();

// Función global para configurar listeners
window.setupRealtimeLikes = function() {
  if (window.realtimeLikes) {
    window.realtimeLikes.setupVisibleProducts();
  }
};

// Función global para limpiar listeners
window.cleanupRealtimeLikes = function() {
  if (window.realtimeLikes) {
    window.realtimeLikes.cleanup();
  }
};