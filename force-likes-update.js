// FORZAR ACTUALIZACIÓN DE LIKES AL CARGAR
window.forceLikesUpdate = function() {
  console.log('🔄 Forzando actualización de likes...');
  
  document.querySelectorAll('.like-btn').forEach(btn => {
    const productId = btn.dataset.productId;
    if (!productId) return;
    
    console.log('🔍 Procesando producto:', productId);
    
    // Aplicar estado inicial correcto
    if (window.realtimeLikes) {
      window.realtimeLikes.loadInitialState(productId);
    } else {
      // Fallback: aplicar estado por defecto
      btn.classList.remove('liked');
      btn.setAttribute('data-liked', 'false');
      const heartIcon = btn.querySelector('.heart-icon');
      if (heartIcon) {
        heartIcon.src = '/img-galery/heartproduct.svg';
      }
    }
  });
};

// Auto-ejecutar después de que se carguen los productos
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    window.forceLikesUpdate();
  }, 2000);
});

// También ejecutar cuando cambie la sección
window.addEventListener('hashchange', () => {
  setTimeout(() => {
    window.forceLikesUpdate();
  }, 1000);
});