// SCRIPT PARA PREVENIR PROBLEMAS DE SCROLL EN MÓVIL CON LIKES
(function() {
  'use strict';
  
  let isScrolling = false;
  let scrollTimeout;
  
  // Detectar cuando se está haciendo scroll
  function handleScroll() {
    isScrolling = true;
    
    // Limpiar timeout anterior
    clearTimeout(scrollTimeout);
    
    // Marcar que el scroll terminó después de 150ms
    scrollTimeout = setTimeout(() => {
      isScrolling = false;
      // Restaurar estados de likes después del scroll
      restoreLikeStates();
    }, 150);
  }
  
  // Función para restaurar estados de likes
  function restoreLikeStates() {
    if (!window.realtimeLikes) return;
    
    // Obtener todos los botones de like visibles
    const likeButtons = document.querySelectorAll('.like-btn[data-product-id]');
    
    likeButtons.forEach(btn => {
      const productId = btn.dataset.productId;
      if (productId) {
        // Restaurar estado desde cache local
        const userId = window.realtimeLikes.getUserId();
        const localLikes = JSON.parse(localStorage.getItem('userLikes') || '{}');
        const userLikesArray = localLikes[userId] || [];
        const isLiked = userLikesArray.includes(productId);
        
        // Aplicar estado correcto
        window.realtimeLikes.applyLikeState(productId, isLiked);
      }
    });
  }
  
  // Prevenir re-renderizados innecesarios durante el scroll
  function preventScrollRerender() {
    if (isScrolling) {
      return false; // Prevenir re-renderizado
    }
    return true; // Permitir re-renderizado
  }
  
  // Interceptar llamadas a applyFilters durante scroll
  if (window.applyFilters) {
    const originalApplyFilters = window.applyFilters;
    window.applyFilters = function(...args) {
      // Si estamos haciendo scroll en móvil, no re-renderizar
      if (isScrolling && window.innerWidth <= 768) {
        console.log('Scroll detected, skipping re-render');
        return;
      }
      return originalApplyFilters.apply(this, args);
    };
  }
  
  // Event listeners
  window.addEventListener('scroll', handleScroll, { passive: true });
  
  // También manejar resize que puede causar re-renderizados
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      if (!isScrolling) {
        restoreLikeStates();
      }
    }, 300);
  });
  
  // Restaurar estados cuando se carga la página
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(restoreLikeStates, 1000);
  });
  
  // Observar cambios en el DOM para restaurar likes
  const observer = new MutationObserver((mutations) => {
    let shouldRestore = false;
    
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        // Verificar si se agregaron productos
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1 && (node.classList?.contains('product') || node.querySelector?.('.like-btn'))) {
            shouldRestore = true;
          }
        });
      }
    });
    
    if (shouldRestore && !isScrolling) {
      setTimeout(restoreLikeStates, 100);
    }
  });
  
  // Observar cambios en los contenedores de productos
  setTimeout(() => {
    const containers = document.querySelectorAll('#inicio, #lazos, #monos, #colitas, #scrunchies, #setmonos');
    containers.forEach(container => {
      if (container) {
        observer.observe(container, {
          childList: true,
          subtree: true
        });
      }
    });
  }, 1000);
  
  // Función global para forzar restauración
  window.forceLikeRestore = restoreLikeStates;
  
})();