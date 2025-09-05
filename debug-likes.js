// DEBUG PARA LIKES - Temporal para encontrar el problema
window.debugLikes = function(productId) {
  const likeBtn = document.querySelector(`.like-btn[data-product-id="${productId}"]`);
  const heartIcon = likeBtn?.querySelector('.heart-icon');
  const countElement = document.querySelector(`.like-count[data-product-id="${productId}"]`);
  
  console.log('🔍 DEBUG LIKES:');
  console.log('Product ID:', productId);
  console.log('Like Button:', likeBtn);
  console.log('Heart Icon:', heartIcon);
  console.log('Count Element:', countElement);
  
  if (likeBtn) {
    console.log('Button classes:', likeBtn.className);
    console.log('Button style:', likeBtn.style.cssText);
    console.log('Computed style background:', getComputedStyle(likeBtn).background);
    
    // Forzar cambio visual
    likeBtn.style.setProperty('background', '#ff1744', 'important');
    likeBtn.style.setProperty('border-radius', '50%', 'important');
    likeBtn.classList.add('liked');
    
    console.log('After forcing styles:');
    console.log('Button classes:', likeBtn.className);
    console.log('Button style:', likeBtn.style.cssText);
  }
};

// Auto-debug del primer producto
setTimeout(() => {
  const firstLikeBtn = document.querySelector('.like-btn');
  if (firstLikeBtn) {
    const productId = firstLikeBtn.dataset.productId;
    console.log('🚀 Auto-debugging first product:', productId);
    window.debugLikes(productId);
  }
}, 3000);