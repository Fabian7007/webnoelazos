// Enhanced User Panel Functions
// Global functions for managing user interactions

// Like/Unlike product function
window.toggleProductLike = async function(productId) {
  const user = window.authFunctions?.getCurrentUser?.() || 
               (window.authModal?.currentUser) || null;

  if (!user) {
    window.authModal?.showModal();
    return false;
  }

  const userId = user.uid;

  if (!window.firestoreManager) {
    console.error('Firestore manager no está disponible');
    return false;
  }

  try {
    const likeBtn = document.querySelector(`.like-btn[data-product-id="${productId}"]`);
    const likeCountElement = document.querySelector(`.like-count[data-product-id="${productId}"]`);
    const currentLikes = parseInt(likeCountElement?.textContent || '0', 10);

    const hasLiked = await window.firestoreManager.hasUserLiked(productId, userId);

    if (hasLiked) {
      await window.firestoreManager.unlikeProduct(productId, userId);
      likeBtn?.classList.remove('active');
      likeBtn?.setAttribute('title', 'Agregar a favoritos');
      if (likeCountElement) {
        likeCountElement.textContent = Math.max(0, currentLikes - 1);
      }
      if (window.authModal) {
        window.authModal.showNotification('Eliminado de favoritos', 'info');
      }
    } else {
      const userData = {
        username: user.displayName || 'Usuario',
        email: user.email,
        profileImage: user.photoURL || '/img-galery/user-profile.png'
      };
      await window.firestoreManager.likeProduct(productId, userId, userData);
      likeBtn?.classList.add('active');
      likeBtn?.setAttribute('title', 'Quitar de favoritos');
      if (likeCountElement) {
        likeCountElement.textContent = currentLikes + 1;
      }
      if (window.authModal) {
        window.authModal.showNotification('Agregado a favoritos ❤️', 'success');
      }
    }
    return !hasLiked;
  } catch (error) {
    console.error('Error al alternar el like del producto:', error);
    if (window.authModal) {
      window.authModal.showNotification('Error al procesar el like', 'error');
    }
    return false;
  }
};

// Check if product is liked
window.isProductLiked = function(productId) {
  const user = window.authFunctions?.getCurrentUser?.() || 
               (window.authModal?.currentUser) || null;
  
  if (!user) return false;
  
  const likesKey = `likes_${user.uid}`;
  const userLikes = JSON.parse(localStorage.getItem(likesKey)) || [];
  return userLikes.includes(productId);
};

// Add purchase to user history
window.addPurchaseToHistory = function(products, total) {
  const user = window.authFunctions?.getCurrentUser?.() || 
               (window.authModal?.currentUser) || null;
  
  if (!user) return;
  
  const purchasesKey = `purchases_${user.uid}`;
  let userPurchases = JSON.parse(localStorage.getItem(purchasesKey)) || [];
  
  const purchase = {
    id: Date.now(),
    date: new Date().toISOString(),
    products: products,
    total: total,
    status: 'pending'
  };
  
  userPurchases.unshift(purchase); // Add to beginning
  
  // Keep only last 50 purchases
  if (userPurchases.length > 50) {
    userPurchases = userPurchases.slice(0, 50);
  }
  
  localStorage.setItem(purchasesKey, JSON.stringify(userPurchases));
  
  // Update activity timeline
  if (window.authModal && window.authModal.currentUser) {
    window.authModal.updateActivityTimeline();
  }
};

// Enhanced product creation with like/save buttons
window.createEnhancedProductElement = function(prod) {
  const div = document.createElement('div');
  div.className = 'product enhanced-product';
  if (prod.status) {
    div.classList.add(`product-status-${prod.status}`);
  }
  div.style.cursor = 'pointer';
  
  const isLiked = window.isProductLiked(prod.id);
  
  div.innerHTML = `
    <div class="gray-square">
      <img src="${prod.imagen}" alt="${prod.nombre}" />
      <div class="product-actions"> 
        <button class="add-to-cart-btn" data-id="${prod.id}">
          <img src="/img-galery/icon-carrito.svg" alt="Agregar al carrito" class="cart-btn-icon" />
        </button>
      </div>
      <span class="added-text" style="display: none;">Agregado</span>
    </div>
    <div class="product-info">
      <h3>${prod.nombre}</h3>
      <p class="product-price">$${prod.precio.toLocaleString('es-AR')}</p>
    </div>
  `;

  const graySquare = div.querySelector('.gray-square');

  // Add status badge
  if (prod.status && prod.status !== 'none') {
    const badge = document.createElement('div');
    badge.className = `product-badge status-${prod.status}`;
    badge.textContent = prod.status;
    graySquare.appendChild(badge);
  }

  // Add color and fabric tag
  if (prod.color && prod.tela) {
    const tag = document.createElement('div');
    tag.className = 'color-fabric-tag';
    
    const colorMap = {
      'Rosa': '#FFC0CB',
      'Azul': '#0000FF',
      'Rojo': '#FF0000',
      'Amarillo': '#FFFF00',
      'Blanco': '#FFFFFF',
      'Gris': '#808080',
      'Negro': '#000000',
      'Verde': '#008000',
      'Dorado': '#FFD700',
      'Plateado': '#C0C0C0',
      'Multicolor': 'linear-gradient(45deg, #FF0000,rgb(251, 255, 0), #0000FF)',
      'Naranja': '#FFA500',
      'Púrpura': '#800080'
    };

    const colorValue = colorMap[prod.color] || prod.color;
    
    tag.innerHTML = `
      <div class="color-circle" style="background: ${colorValue}; ${prod.color === 'Blanco' ? 'border: 2px solid #ccc;' : ''}"></div>
      <span class="fabric-text">${prod.tela}</span>
    `;
    graySquare.appendChild(tag);
  }

  // Event listeners for action buttons
  const likeBtn = div.querySelector('.like-btn');
  const cartBtn = div.querySelector('.add-to-cart-btn');

  if (likeBtn) {
    likeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const newState = window.toggleProductLike(prod.id);
      likeBtn.classList.toggle('active', newState);
      likeBtn.title = newState ? 'Quitar de favoritos' : 'Agregar a favoritos';
    });
  }

  if (cartBtn && prod.status !== 'agotado') {
    cartBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (window.addProductToCart) {
        window.addProductToCart(prod.id, cartBtn);
      }
    });
  }

  // Handle 'agotado' status
  if (prod.status === 'agotado') {
    const actions = div.querySelector('.product-actions');
    if (actions) {
      actions.style.opacity = '0.5';
      actions.style.pointerEvents = 'none';
    }
    div.style.cursor = 'default';
  } else {
    // Click to view details
    div.addEventListener('click', (e) => {
      if (!e.target.closest('.product-actions')) {
        window.location.href = `details/details.html?id=${prod.id}`;
      }
    });
  }

  return div;
};

// Initialize enhanced features when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  // Add CSS for enhanced product elements
  const style = document.createElement('style');
  style.textContent = `
    .enhanced-product .product-actions {
      position: absolute;
      top: 8px;
      right: 8px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    
    .enhanced-product:hover .product-actions {
      opacity: 1;
    }
    
    .action-btn {
      width: 32px;
      height: 32px;
      border: none;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.9);
      color: #666;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      font-size: 0.9rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    
    .action-btn:hover {
      transform: scale(1.1);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }
    
    .like-btn:hover,
    .like-btn.active {
      background: #ff6b9d;
      color: white;
    }
    
    .add-to-cart-btn {
      margin-top: 4px;
      width: 50px; /* Increased size */
      height: 50px; /* Increased size */
    }
    
    @media (max-width: 768px) {
      .enhanced-product .product-actions {
        opacity: 1;
      }
      
      .action-btn {
        width: 28px;
        height: 28px;
        font-size: 0.8rem;
      }
      
      .add-to-cart-btn {
        width: 40px; /* Adjusted size for smaller screens */
        height: 40px; /* Adjusted size for smaller screens */
      }
    }
  `;
  document.head.appendChild(style);
});