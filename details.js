// Product Details Page JavaScript
let currentProduct = null;
let detailsCart = JSON.parse(localStorage.getItem('cart')) || [];

// Update cart count function
function updateCartCount() {
  const cartCount = document.getElementById('cartCount');
  if (cartCount) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
  }
}

// Get product ID from URL
function getProductIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');
  console.log('🆔 ID extraído de URL:', id);
  console.log('Todos los parámetros:', Object.fromEntries(urlParams));
  return id;
}

// Go back to previous page
function goBack() {
  console.log('🔙 Botón volver presionado');
  console.log('Referrer:', document.referrer);
  
  // Siempre ir a index.html para evitar problemas
  window.location.href = 'index.html';
}

// Load product data
async function loadProductData(productId) {
  try {
    console.log('🔍 Buscando producto con ID:', productId);
    console.log('Tipo de ID:', typeof productId);
    
    // Wait for Firebase to be ready
    let attempts = 0;
    while ((!window.firestoreManager || !window.loadProductsFromFirebase) && attempts < 10) {
      console.log('⏳ Esperando Firebase... intento', attempts + 1);
      await new Promise(resolve => setTimeout(resolve, 500));
      attempts++;
    }
    
    // Force load products from Firebase
    console.log('📦 Cargando productos desde Firebase...');
    if (window.loadProductsFromFirebase) {
      await window.loadProductsFromFirebase();
    }
    
    // Debug: Show all available products
    if (window.productos && window.productos.length > 0) {
      console.log('📋 Productos disponibles:');
      window.productos.forEach((p, i) => {
        console.log(`${i + 1}. ID: "${p.id}" (${typeof p.id}) - ${p.nombre}`);
      });
    }
    
    // Try to find product with different ID comparisons
    if (window.productos && window.productos.length > 0) {
      // Try exact match
      let product = window.productos.find(p => p.id === productId);
      if (product) {
        console.log('✅ Producto encontrado (exact match):', product);
        return product;
      }
      
      // Try string comparison
      product = window.productos.find(p => String(p.id) === String(productId));
      if (product) {
        console.log('✅ Producto encontrado (string match):', product);
        return product;
      }
      
      // Try case insensitive
      product = window.productos.find(p => 
        String(p.id).toLowerCase() === String(productId).toLowerCase()
      );
      if (product) {
        console.log('✅ Producto encontrado (case insensitive):', product);
        return product;
      }
    }
    
    // Try direct Firestore query
    if (window.firestoreManager) {
      console.log('🔍 Consultando Firestore directamente...');
      try {
        const doc = await window.firestoreManager.getDocument('products', productId);
        if (doc.exists()) {
          const product = { id: doc.id, ...doc.data() };
          console.log('✅ Producto encontrado en Firestore:', product);
          console.log('Imágenes de detalle:', {
            detalle1: product.detalle1,
            detalle2: product.detalle2,
            detalle3: product.detalle3
          });
          return product;
        }
      } catch (firestoreError) {
        console.error('❌ Error consultando Firestore:', firestoreError);
      }
    }
    
    console.log('❌ Producto no encontrado con ID:', productId);
    return null;
  } catch (error) {
    console.error('❌ Error loading product:', error);
    return null;
  }
}

// Render product details
function renderProductDetails(product) {
  const container = document.getElementById('productDetailContent');
  
  if (!product) {
    container.innerHTML = `
      <div class="product-not-found">
        <h2>Producto no encontrado</h2>
        <p>El producto que buscas no existe o ha sido eliminado.</p>
        <button class="action-btn add-to-cart-btn" onclick="goBack()">
          Volver al catálogo
        </button>
      </div>
    `;
    return;
  }

  currentProduct = product;
  
  // Update page title
  document.title = `${product.nombre} - webnoelazos`;
  
  // Color mapping for display
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
    'Multicolor': 'linear-gradient(45deg, #FF0000, #FFFF00, #0000FF)',
    'Naranja': '#FFA500',
    'Púrpura': '#800080'
  };

  const colorValue = colorMap[product.color] || product.color;
  const isOutOfStock = product.status === 'agotado';
  
  // Check if user is admin
  const currentUser = window.authFunctions?.getCurrentUser();
  let isAdmin = false;
  if (currentUser) {
    const userData = window.authFunctions?.getCurrentUserData();
    isAdmin = userData && userData.role === 'administrador';
  }
  
  container.innerHTML = `
    <div class="product-image-section">
      <div class="product-main-image-wrapper">
        <img 
          src="${product.imagen}" 
          alt="${product.nombre}" 
          class="product-main-image"
          onerror="this.src='/img-galery/logo.svg'"
          onclick="openImageZoom()"
        />
        
        <div class="product-like-overlay">
          <button class="like-btn-dedicated like-btn" data-product-id="${product.id}">
            <i class="fas fa-heart"></i>
            <span class="like-count" data-product-id="${product.id}">0</span>
          </button>
        </div>
        
        <div class="stats-overlay">
          <div class="stat-item">
            <i class="fas fa-eye"></i>
            <span id="viewCount-${product.id}">0</span>
          </div>
        </div>
        
        <div class="product-back-overlay">
          <button class="overlay-btn" onclick="goBack()">
            <i class="fas fa-arrow-left"></i>
          </button>
        </div>
        
        ${isAdmin ? `
          <div class="product-edit-overlay">
            <button class="overlay-btn" onclick="window.adminFunctions?.editProduct('${product.id}')">
              <i class="fas fa-edit"></i>
            </button>
          </div>
        ` : ''}
      </div>
      
      <div class="product-images-container">
        <img src="${product.imagen}" alt="${product.nombre}" class="product-detail-image active" onclick="switchMainImage('${product.imagen}', this)">
        ${product.detalle1 && product.detalle1.trim() && product.detalle1 !== '' ? `<img src="${product.detalle1}" alt="Detalle 1" class="product-detail-image" onclick="switchMainImage('${product.detalle1}', this)" onerror="this.style.display='none'">` : ''}
        ${product.detalle2 && product.detalle2.trim() && product.detalle2 !== '' ? `<img src="${product.detalle2}" alt="Detalle 2" class="product-detail-image" onclick="switchMainImage('${product.detalle2}', this)" onerror="this.style.display='none'">` : ''}
        ${product.detalle3 && product.detalle3.trim() && product.detalle3 !== '' ? `<img src="${product.detalle3}" alt="Detalle 3" class="product-detail-image" onclick="switchMainImage('${product.detalle3}', this)" onerror="this.style.display='none'">` : ''}
      </div>
    </div>
    
    <div class="product-info-section">
      <h1 class="product-title">${product.nombre}</h1>
      
      <div class="product-price">$${product.precio.toLocaleString('es-AR')}</div>
      
      ${product.status && product.status !== 'none' ? `
        <div class="product-status-badge status-${product.status}">
          ${product.status}
        </div>
      ` : ''}
      
      <div class="product-description">
        ${product.descripcion || 'Hermoso accesorio para el cabello de alta calidad.'}
      </div>
      
      <div class="product-details">
        <h3>Detalles del producto</h3>
        
        ${product.color ? `
          <div class="detail-item">
            <span class="detail-label">Color:</span>
            <span class="detail-value">${product.color}</span>
            <div class="color-indicator" style="background: ${colorValue}; ${product.color === 'Blanco' ? 'border-color: #ccc;' : ''}"></div>
          </div>
        ` : ''}
        
        ${product.tela ? `
          <div class="detail-item">
            <span class="detail-label">Material:</span>
            <span class="detail-value">${product.tela}</span>
          </div>
        ` : ''}
        
        ${product.categoria ? `
          <div class="detail-item">
            <span class="detail-label">Categoría:</span>
            <span class="detail-value">${getCategoryDisplayName(product.categoria)}</span>
          </div>
        ` : ''}
      </div>
      
      <div class="product-actions">
        ${!isOutOfStock ? `
          <div class="cart-section">
            <div class="quantity-controls">
              <button class="quantity-btn" onclick="changeQuantity(-1)" id="decreaseBtn">
                <i class="fas fa-minus"></i>
              </button>
              <span class="quantity-display" id="quantityDisplay">1</span>
              <button class="quantity-btn" onclick="changeQuantity(1)">
                <i class="fas fa-plus"></i>
              </button>
            </div>
            <button class="cart-add-btn" onclick="addToCart()">
              <i class="fas fa-shopping-cart"></i>
              Agregar al carrito
            </button>
          </div>
        ` : `
          <div class="cart-section">
            <button class="cart-add-btn" disabled>
              <i class="fas fa-shopping-cart"></i>
              Agotado
            </button>
          </div>
        `}
        
        <button class="action-btn whatsapp-btn" onclick="buyViaWhatsApp()">
          <i class="fab fa-whatsapp"></i>
          Comprar por WhatsApp
        </button>
      </div>
    </div>
  `;
  
  // Initialize like button state and listen for real-time updates
  if (window.realtimeLikesSystem) {
    setTimeout(() => {
      window.realtimeLikesSystem.updateLikeCount(product.id);
      window.realtimeLikesSystem.updateLikeButton(product.id);
      window.realtimeLikesSystem.listenToProductLikes(product.id);
    }, 100);
  }
  
  // Initialize view count
  initializeViewCount(product.id);
  
  // Track product view
  trackProductView(product.id);
  
  // Initialize comments system in subfooter
  renderCommentsInSubfooter(product.id);
  initializeComments(product.id);
  
  // Initialize touch events for mobile swipe
  setTimeout(() => {
    initializeTouchEvents();
  }, 100);
}

// Get category display name
function getCategoryDisplayName(category) {
  const categoryNames = {
    'lazos': 'Lazos',
    'monos': 'Moños',
    'colitas': 'Colitas',
    'scrunchies': 'Scrunchies',
    'setmonos': 'Set Moños'
  };
  return categoryNames[category] || category;
}

let currentQuantity = 1;

// Change quantity
function changeQuantity(change) {
  currentQuantity = Math.max(1, currentQuantity + change);
  const display = document.getElementById('quantityDisplay');
  const decreaseBtn = document.getElementById('decreaseBtn');
  
  if (display) display.textContent = currentQuantity;
  if (decreaseBtn) decreaseBtn.disabled = currentQuantity <= 1;
}

// Add product to cart
function addToCart() {
  if (!currentProduct || currentProduct.status === 'agotado') return;
  
  try {
    // Get current cart from localStorage
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Clean product data
    const cleanProduct = {
      id: currentProduct.id,
      nombre: currentProduct.nombre,
      precio: currentProduct.precio,
      imagen: currentProduct.imagen,
      color: currentProduct.color,
      categoria: currentProduct.categoria,
      quantity: currentQuantity,
      addedAt: Date.now()
    };
    
    const existingItem = cart.find(item => item.id === currentProduct.id);
    
    if (existingItem) {
      existingItem.quantity += currentQuantity;
    } else {
      cart.push(cleanProduct);
    }
    
    // Limit cart size
    if (cart.length > 50) {
      cart = cart.slice(-50);
    }
    
    try {
      localStorage.setItem('cart', JSON.stringify(cart));
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        // Limpiar localStorage y reintentar
        if (window.clearLocalStorageQuota) {
          window.clearLocalStorageQuota();
        }
        cart = [cleanProduct];
        try {
          localStorage.setItem('cart', JSON.stringify(cart));
          window.showWarning('El carrito se ha limpiado por falta de espacio. El producto se agregó correctamente.');
        } catch (retryError) {
          console.error('Error after cleanup:', retryError);
          window.showError('Error: No se pudo agregar el producto. Intenta recargar la página.');
          return;
        }
      } else {
        console.error('Error adding to cart:', error);
        window.showError('Error al agregar al carrito. Inténtalo de nuevo.');
        return;
      }
    }
    
    detailsCart = cart;
    
    // Show success message
    const btn = document.querySelector('.cart-add-btn');
    if (btn) {
      const originalText = btn.innerHTML;
      btn.innerHTML = `<i class="fas fa-check"></i> ¡${currentQuantity} agregado${currentQuantity > 1 ? 's' : ''}!`;
      btn.style.background = '#28a745';
      
      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.background = '';
      }, 2000);
    }
    
    // Reset quantity
    currentQuantity = 1;
    const display = document.getElementById('quantityDisplay');
    const decreaseBtn = document.getElementById('decreaseBtn');
    if (display) display.textContent = currentQuantity;
    if (decreaseBtn) decreaseBtn.disabled = true;
    
    // Update cart count
    updateCartCount();
    
    // Trigger cart update event
    window.dispatchEvent(new Event('cartUpdated'));
    
  } catch (error) {
    console.error('Error adding to cart:', error);
    window.showError('Error al agregar al carrito. Inténtalo de nuevo.');
  }
}

// Open image zoom
function openImageZoom() {
  const mainImage = document.querySelector('.product-main-image');
  if (!mainImage) return;
  
  const modal = document.createElement('div');
  modal.className = 'image-zoom-modal';
  modal.innerHTML = `
    <img src="${mainImage.src}" alt="Zoom" class="zoom-image">
    <button class="zoom-close" onclick="this.parentElement.remove()">
      <i class="fas fa-times"></i>
    </button>
  `;
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
  
  document.body.appendChild(modal);
}

// Buy via WhatsApp
function buyViaWhatsApp() {
  if (!currentProduct) return;
  
  const phoneNumber = '5491151012889';
  const message = `Hola, estoy interesado en comprar este producto:

${currentProduct.nombre}
Precio: $${currentProduct.precio.toLocaleString('es-AR')}
${currentProduct.color ? `Color: ${currentProduct.color}` : ''}
${currentProduct.tela ? `Material: ${currentProduct.tela}` : ''}

¿Está disponible?`;

  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, '_blank');
}

// Initialize page
async function initializePage() {
  console.log('🔄 Inicializando página de detalles...');
  
  // Mark user as online if authenticated
  setTimeout(async () => {
    const currentUser = window.authFunctions?.getCurrentUser();
    if (currentUser && window.userActivitySystem) {
      await window.userActivitySystem.setUserOnline(currentUser.uid);
    }
  }, 1000);
  
  const productId = getProductIdFromUrl();
  console.log('📦 Product ID desde URL:', productId);
  console.log('URL completa:', window.location.href);
  console.log('Search params:', window.location.search);
  
  if (!productId) {
    document.getElementById('productDetailContent').innerHTML = `
      <div class="product-not-found">
        <h2>Producto no especificado</h2>
        <p>No se ha especificado qué producto mostrar.</p>
        <p>URL: ${window.location.href}</p>
        <button class="action-btn add-to-cart-btn" onclick="goBack()">
          Volver al catálogo
        </button>
      </div>
    `;
    return;
  }
  
  // Wait for Firebase to initialize
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Try to load product
  await loadAndRenderProduct(productId);
  
  if (!currentProduct) {
    console.log('❌ No se pudo cargar el producto después de', maxAttempts, 'intentos');
  }
}

async function loadAndRenderProduct(productId) {
  try {
    // Load product data
    const product = await loadProductData(productId);
    console.log('📦 Producto cargado:', product);
    
    // Render product details
    renderProductDetails(product);
    
    // If product was found, track view
    if (product && window.trackUserAction) {
      window.trackUserAction('view_product', { productId: product.id });
    }
  } catch (error) {
    console.error('❌ Error en loadAndRenderProduct:', error);
    renderProductDetails(null);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializePage);
} else {
  setTimeout(initializePage, 100);
}

// Initialize likes system when available
function initializeLikesSystem() {
  if (window.realtimeLikesSystem && currentProduct) {
    window.realtimeLikesSystem.loadLikesForCurrentProducts();
  } else {
    setTimeout(initializeLikesSystem, 500);
  }
}

setTimeout(initializeLikesSystem, 1000);

// Listen for products loaded event
window.addEventListener('productsLoaded', () => {
  console.log('🔄 Productos cargados, reintentando cargar producto...');
  const productId = getProductIdFromUrl();
  if (productId && !currentProduct) {
    loadAndRenderProduct(productId);
  }
});

// Force initialization on window load
window.addEventListener('load', () => {
  const productId = getProductIdFromUrl();
  if (productId && !currentProduct) {
    setTimeout(() => loadAndRenderProduct(productId), 1000);
  }
});

// Additional retry mechanism
let retryCount = 0;
const maxRetries = 5;
const retryInterval = setInterval(() => {
  const productId = getProductIdFromUrl();
  if (productId && !currentProduct && window.productos && window.productos.length > 0) {
    console.log('🔄 Reintentando cargar producto... Intento:', retryCount + 1);
    loadAndRenderProduct(productId);
    retryCount++;
  }
  
  if (currentProduct || retryCount >= maxRetries) {
    clearInterval(retryInterval);
  }
}, 2000);

// Initialize view count for a product
async function initializeViewCount(productId) {
  try {
    if (window.firestoreManager) {
      const viewsDoc = await window.firestoreManager.getDocument('productViews', productId);
      const viewCount = viewsDoc.exists() ? viewsDoc.data().count || 0 : 0;
      
      const viewElement = document.getElementById(`viewCount-${productId}`);
      if (viewElement) {
        viewElement.textContent = viewCount;
      }
    }
  } catch (error) {
    console.error('Error loading view count:', error);
  }
}

// Track product view
async function trackProductView(productId) {
  try {
    if (window.firestoreManager) {
      // Get current view count
      const viewsDoc = await window.firestoreManager.getDocument('productViews', productId);
      const currentCount = viewsDoc.exists() ? viewsDoc.data().count || 0 : 0;
      
      // Increment view count
      await window.firestoreManager.setDocument('productViews', productId, {
        count: currentCount + 1,
        lastViewed: new Date()
      });
      
      // Update display
      const viewElement = document.getElementById(`viewCount-${productId}`);
      if (viewElement) {
        viewElement.textContent = currentCount + 1;
      }
    }
  } catch (error) {
    console.error('Error tracking view:', error);
  }
}

// Switch main image when detail image is clicked
function switchMainImage(newSrc, clickedElement) {
  const mainImage = document.querySelector('.product-main-image');
  if (mainImage) {
    mainImage.src = newSrc;
    
    // Update active state
    document.querySelectorAll('.product-detail-image').forEach(img => {
      img.classList.remove('active');
    });
    if (clickedElement) {
      clickedElement.classList.add('active');
    }
  }
}

// Get all product images
function getProductImages() {
  const images = [];
  if (currentProduct) {
    images.push(currentProduct.imagen);
    if (currentProduct.detalle1 && currentProduct.detalle1.trim()) images.push(currentProduct.detalle1);
    if (currentProduct.detalle2 && currentProduct.detalle2.trim()) images.push(currentProduct.detalle2);
    if (currentProduct.detalle3 && currentProduct.detalle3.trim()) images.push(currentProduct.detalle3);
  }
  return images;
}

// Switch to next/previous image
function switchToImage(direction) {
  const images = getProductImages();
  if (images.length <= 1) return;
  
  const mainImage = document.querySelector('.product-main-image');
  if (!mainImage) return;
  
  // Find current image index by comparing the actual src
  let currentIndex = 0;
  const currentSrc = mainImage.src;
  
  for (let i = 0; i < images.length; i++) {
    if (currentSrc.includes(images[i]) || images[i].includes(currentSrc.split('/').pop())) {
      currentIndex = i;
      break;
    }
  }
  
  let newIndex;
  if (direction === 'next') {
    newIndex = (currentIndex + 1) % images.length;
  } else {
    newIndex = currentIndex <= 0 ? images.length - 1 : currentIndex - 1;
  }
  
  // Update main image
  mainImage.src = images[newIndex];
  
  // Update active thumbnail
  const thumbnails = document.querySelectorAll('.product-detail-image');
  thumbnails.forEach((thumb, index) => {
    thumb.classList.remove('active');
    if (index === newIndex) {
      thumb.classList.add('active');
    }
  });
}

// Initialize touch events for mobile swipe
function initializeTouchEvents() {
  const mainImage = document.querySelector('.product-main-image');
  if (!mainImage) return;
  
  let startX = null;
  let isSwipeActive = false;
  
  mainImage.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    isSwipeActive = true;
  }, { passive: true });
  
  mainImage.addEventListener('touchmove', (e) => {
    if (!isSwipeActive || !startX) return;
    
    const currentX = e.touches[0].clientX;
    const diffX = startX - currentX;
    
    // Prevent default scroll if horizontal swipe is detected
    if (Math.abs(diffX) > 30) {
      e.preventDefault();
    }
  }, { passive: false });
  
  mainImage.addEventListener('touchend', (e) => {
    if (!isSwipeActive || !startX) {
      isSwipeActive = false;
      startX = null;
      return;
    }
    
    const endX = e.changedTouches[0].clientX;
    const diffX = startX - endX;
    
    // Only trigger if swipe is significant enough
    if (Math.abs(diffX) > 80) {
      if (diffX > 0) {
        switchToImage('next');
      } else {
        switchToImage('prev');
      }
    }
    
    // Reset values
    isSwipeActive = false;
    startX = null;
  }, { passive: true });
}

// Render comments in subfooter
function renderCommentsInSubfooter(productId) {
  const commentsSection = document.getElementById('commentsSection');
  if (commentsSection) {
    commentsSection.innerHTML = `
      <div class="comments-header">
        <h3 class="comments-title">Comentarios</h3>
        <span class="comments-count" id="comments-count-${productId}">0 comentarios</span>
      </div>
      
      <div class="comment-form" id="comment-form-${productId}">
        <textarea 
          class="comment-input" 
          id="comment-input-${productId}"
          placeholder="Escribe tu comentario..."
          maxlength="500"
        ></textarea>
        <div class="comment-form-actions">
          <span class="comment-char-count" id="char-count-${productId}">0/500</span>
          <button 
            class="comment-submit-btn" 
            id="submit-btn-${productId}"
            onclick="submitComment('${productId}')"
          >
            Comentar
          </button>
        </div>
      </div>
      
      <div class="comments-list" id="comments-${productId}">
        <div class="comments-loading">Cargando comentarios...</div>
      </div>
    `;
  }
}

// Comments functions
function initializeComments(productId) {
  if (!window.commentsSystem) {
    setTimeout(() => initializeComments(productId), 500);
    return;
  }
  
  // Setup character counter
  const input = document.getElementById(`comment-input-${productId}`);
  const charCount = document.getElementById(`char-count-${productId}`);
  const submitBtn = document.getElementById(`submit-btn-${productId}`);
  
  if (input && charCount) {
    input.addEventListener('input', () => {
      const length = input.value.length;
      charCount.textContent = `${length}/500`;
      
      charCount.className = 'comment-char-count';
      if (length > 400) charCount.classList.add('warning');
      if (length > 480) charCount.classList.add('error');
      
      if (submitBtn) {
        submitBtn.disabled = length === 0 || length > 500;
      }
    });
    
    // Add Enter key support
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (submitBtn && !submitBtn.disabled) {
          submitComment(productId);
        }
      }
    });
  }
  
  // Load and listen to comments
  window.commentsSystem.listenToComments(productId, (comments) => {
    window.commentsSystem.renderComments(productId, comments);
    updateCommentsCount(productId, comments.length);
  });
}

function submitComment(productId) {
  const input = document.getElementById(`comment-input-${productId}`);
  const submitBtn = document.getElementById(`submit-btn-${productId}`);
  
  if (!input || !window.commentsSystem) return;
  
  const text = input.value.trim();
  if (!text) return;
  
  submitBtn.disabled = true;
  submitBtn.textContent = 'Enviando...';
  
  window.commentsSystem.addComment(productId, text).then(success => {
    if (success) {
      input.value = '';
      const charCount = document.getElementById(`char-count-${productId}`);
      if (charCount) {
        charCount.textContent = '0/500';
        charCount.className = 'comment-char-count';
      }
    }
    
    submitBtn.disabled = false;
    submitBtn.textContent = 'Comentar';
  });
}

function updateCommentsCount(productId, count) {
  const countElement = document.getElementById(`comments-count-${productId}`);
  if (countElement) {
    countElement.textContent = `${count} comentario${count !== 1 ? 's' : ''}`;
  }
}

// Export functions for global access
window.goBack = goBack;
window.addToCart = addToCart;
window.buyViaWhatsApp = buyViaWhatsApp;
window.changeQuantity = changeQuantity;
window.openImageZoom = openImageZoom;
window.initializeViewCount = initializeViewCount;
window.trackProductView = trackProductView;
window.switchMainImage = switchMainImage;
window.submitComment = submitComment;
window.initializeComments = initializeComments;
window.renderCommentsInSubfooter = renderCommentsInSubfooter;