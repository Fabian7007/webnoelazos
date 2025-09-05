// Variables globales para el carrito y galería
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let currentProduct = null;
let currentImageIndex = 0;
let productImages = [];
let productComments = [];

/**
 * Elimina los acentos de una cadena de texto para búsquedas flexibles.
 * @param {string} str La cadena de entrada.
 * @returns {string} La cadena sin acentos.
 */
function removeAccents(str) {
  if (!str) return '';
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// Función para cerrar todos los dropdowns
function closeAllDropdowns() {
  const mobileMenu = document.getElementById('mobileMenu');
  const searchDropdown = document.getElementById('searchDropdown');
  const cartDropdown = document.getElementById('cartDropdown');
  const menuOverlay = document.getElementById('menuOverlay');
  const menuToggle = document.getElementById('menuToggle');

  if (mobileMenu && mobileMenu.classList.contains('active')) {
    mobileMenu.classList.remove('active');
  }
  if (searchDropdown && searchDropdown.classList.contains('active')) {
    searchDropdown.classList.remove('active');
  }
  if (cartDropdown && cartDropdown.classList.contains('active')) {
    cartDropdown.classList.remove('active');
  }
  if (menuOverlay && menuOverlay.classList.contains('active')) {
    menuOverlay.classList.remove('active');
  }
  if (menuToggle && menuToggle.classList.contains('active')) {
    menuToggle.classList.remove('active');
  }
  
  // Remover clases de scroll bloqueado
  document.body.classList.remove('menu-open', 'cart-open');
}

// Función para alternar el menú mobile
function toggleMenu() {
  const mobileMenu = document.getElementById('mobileMenu');
  const menuToggle = document.getElementById('menuToggle');
  const menuOverlay = document.getElementById('menuOverlay');
  const searchDropdown = document.getElementById('searchDropdown');
  const cartDropdown = document.getElementById('cartDropdown');

  // Cerrar otros dropdowns
  if (searchDropdown && searchDropdown.classList.contains('active')) {
    searchDropdown.classList.remove('active');
  }
  if (cartDropdown && cartDropdown.classList.contains('active')) {
    cartDropdown.classList.remove('active');
    document.body.classList.remove('cart-open');
  }

  // Toggle menú
  const isMenuActive = mobileMenu && mobileMenu.classList.contains('active');

  if (isMenuActive) {
    mobileMenu.classList.remove('active');
    menuToggle.classList.remove('active');
    menuOverlay.classList.remove('active');
    document.body.classList.remove('menu-open');
  } else {
    mobileMenu.classList.add('active');
    menuToggle.classList.add('active');
    menuOverlay.classList.add('active');
    document.body.classList.add('menu-open');
  }
}

// Función para alternar la búsqueda
function toggleSearch() {
  const searchDropdown = document.getElementById('searchDropdown');
  const searchInput = document.getElementById('searchInput');
  const menuOverlay = document.getElementById('menuOverlay');
  const mobileMenu = document.getElementById('mobileMenu');
  const cartDropdown = document.getElementById('cartDropdown');
  const menuToggle = document.getElementById('menuToggle');

  // Cerrar otros dropdowns
  if (mobileMenu && mobileMenu.classList.contains('active')) {
    mobileMenu.classList.remove('active');
    menuToggle.classList.remove('active');
    document.body.classList.remove('menu-open');
  }
  if (cartDropdown && cartDropdown.classList.contains('active')) {
    cartDropdown.classList.remove('active');
    document.body.classList.remove('cart-open');
  }

  // Toggle búsqueda
  const isSearchActive = searchDropdown && searchDropdown.classList.contains('active');

  if (isSearchActive) {
    searchDropdown.classList.remove('active');
    menuOverlay.classList.remove('active');
  } else {
    searchDropdown.classList.add('active');
    menuOverlay.classList.add('active');
    if (searchInput) {
      setTimeout(() => searchInput.focus(), 100);
    }
  }
}

// Función para alternar el carrito
function toggleCart() {
  const cartDropdown = document.getElementById('cartDropdown');
  const menuOverlay = document.getElementById('menuOverlay');
  const mobileMenu = document.getElementById('mobileMenu');
  const searchDropdown = document.getElementById('searchDropdown');
  const menuToggle = document.getElementById('menuToggle');

  // Cerrar otros dropdowns
  if (mobileMenu && mobileMenu.classList.contains('active')) {
    mobileMenu.classList.remove('active');
    menuToggle.classList.remove('active');
    document.body.classList.remove('menu-open');
  }
  if (searchDropdown && searchDropdown.classList.contains('active')) {
    searchDropdown.classList.remove('active');
  }

  // Toggle carrito
  const isCartActive = cartDropdown && cartDropdown.classList.contains('active');

  if (isCartActive) {
    cartDropdown.classList.remove('active');
    menuOverlay.classList.remove('active');
    document.body.classList.remove('cart-open');
  } else {
    cartDropdown.classList.add('active');
    menuOverlay.classList.add('active');
    document.body.classList.add('cart-open');
    // Solo renderizar cuando se abre el carrito
    renderCart();
  }
}

// Función para cambiar imagen principal
function changeMainImage(imageIndex) {
  if (imageIndex < 0 || imageIndex >= productImages.length) return;
  
  currentImageIndex = imageIndex;
  const mainImage = document.querySelector('.main-image');
  const imageCounter = document.querySelector('.image-counter');
  const thumbnails = document.querySelectorAll('.thumbnail');
  
  if (mainImage) {
    mainImage.style.opacity = '0';
    setTimeout(() => {
      mainImage.src = productImages[currentImageIndex];
      mainImage.style.opacity = '1';
    }, 150);
  }
  
  if (imageCounter) {
    imageCounter.textContent = `${currentImageIndex + 1} / ${productImages.length}`;
  }
  
  // Actualizar thumbnails activos
  thumbnails.forEach((thumb, index) => {
    thumb.classList.toggle('active', index === currentImageIndex);
  });
}

// Función para navegar imágenes
function navigateImage(direction) {
  const newIndex = currentImageIndex + direction;
  if (newIndex >= 0 && newIndex < productImages.length) {
    changeMainImage(newIndex);
  }
}

// Función para abrir modal de zoom
function openZoomModal(imageIndex = currentImageIndex) {
  const modal = document.getElementById('imageZoomModal');
  const zoomImage = document.getElementById('zoomImage');
  const zoomCounter = document.getElementById('zoomCounter');
  
  if (modal && zoomImage) {
    currentImageIndex = imageIndex;
    zoomImage.src = productImages[currentImageIndex];
    zoomCounter.textContent = `${currentImageIndex + 1} / ${productImages.length}`;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

// Función para cerrar modal de zoom
function closeZoomModal() {
  const modal = document.getElementById('imageZoomModal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// Función para navegar en el zoom
function navigateZoom(direction) {
  const newIndex = currentImageIndex + direction;
  if (newIndex >= 0 && newIndex < productImages.length) {
    currentImageIndex = newIndex;
    const zoomImage = document.getElementById('zoomImage');
    const zoomCounter = document.getElementById('zoomCounter');
    
    if (zoomImage) {
      zoomImage.style.opacity = '0';
      setTimeout(() => {
        zoomImage.src = productImages[currentImageIndex];
        zoomImage.style.opacity = '1';
      }, 150);
    }
    
    if (zoomCounter) {
      zoomCounter.textContent = `${currentImageIndex + 1} / ${productImages.length}`;
    }
    
    // Sincronizar con la imagen principal
    changeMainImage(currentImageIndex);
  }
}

// Función para actualizar cantidad
function updateQuantity(change) {
  const quantityInput = document.getElementById('quantityInput');
  const minusBtn = document.querySelector('.quantity-btn[data-action="minus"]');
  const plusBtn = document.querySelector('.quantity-btn[data-action="plus"]');
  
  if (quantityInput) {
    let currentValue = parseInt(quantityInput.value) || 1;
    let newValue = Math.max(1, currentValue + change);
    
    // Limitar cantidad máxima (opcional)
    const maxQuantity = 99;
    newValue = Math.min(maxQuantity, newValue);
    
    quantityInput.value = newValue;
    
    // Actualizar estado de botones
    if (minusBtn) {
      minusBtn.disabled = newValue <= 1;
    }
    if (plusBtn) {
      plusBtn.disabled = newValue >= maxQuantity;
    }
  }
}

// Función para copiar el enlace del producto
function copyProductLink() {
  const url = window.location.href;
  navigator.clipboard.writeText(url).then(() => {
    const copyBtn = document.getElementById('copyLinkBtn');
    if (copyBtn) {
      const originalIcon = copyBtn.innerHTML;
      copyBtn.innerHTML = '<i class="fas fa-check"></i>';
      copyBtn.classList.add('success');
      copyBtn.setAttribute('data-tooltip', '¡Copiado!');
      setTimeout(() => {
        copyBtn.innerHTML = originalIcon;
        copyBtn.classList.remove('success');
        copyBtn.setAttribute('data-tooltip', 'Copiar Enlace');
      }, 2000);
    }
  }).catch(err => {
    console.error('Error al copiar el enlace: ', err);
    alert('No se pudo copiar el enlace al portapapeles.');
  });
}

// Función para agregar producto al carrito con cantidad
function addProductToCart(productId) {
  // Normalizar ID para comparación
  const normalizedId = String(productId);
  const product = productos.find(p => String(p.id) === normalizedId);
  const quantityInput = document.getElementById('quantityInput');
  const quantity = quantityInput ? parseInt(quantityInput.value) || 1 : 1;
  
  if (product) {
    const existingItem = cart.find(item => String(item.id) === normalizedId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({ ...product, quantity: quantity, imagen: product.imagen }); 
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    
    // Solo renderizar carrito si está abierto
    const cartDropdown = document.getElementById('cartDropdown');
    if (cartDropdown && cartDropdown.classList.contains('active')) {
      renderCart();
    }
    
    // Mostrar notificación
    showCartNotification(`Agregado: ${quantity} x ${product.nombre}`);
    
    // Resetear cantidad a 1
    if (quantityInput) {
      quantityInput.value = 1;
      updateQuantity(0);
    }
  }
}

// Función para mostrar notificación del carrito
function showCartNotification(message) {
  // Crear notificación si no existe
  let notification = document.getElementById('cart-notification');
  if (!notification) {
    notification = document.createElement('div');
    notification.id = 'cart-notification';
    notification.style.cssText = `
      position: fixed;
      top: 100px;
      right: 20px;
      background: #27ae60;
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      z-index: 1000;
      transform: translateX(100%);
      transition: transform 0.3s ease;
      font-family: 'Dosis', sans-serif;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    document.body.appendChild(notification);
  }
  
  notification.textContent = message;
  notification.style.transform = 'translateX(0)';
  
  setTimeout(() => {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

// Función para remover producto del carrito
function removeProductFromCart(productId) {
  // Normalizar ID para comparación
  const normalizedId = String(productId);
  cart = cart.filter(item => String(item.id) !== normalizedId);
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
  
  // Solo renderizar carrito si está abierto
  const cartDropdown = document.getElementById('cartDropdown');
  if (cartDropdown && cartDropdown.classList.contains('active')) {
    renderCart();
  }
}

// Función para actualizar cantidad de producto en carrito
function updateCartItemQuantity(productId, change) {
  // Normalizar ID para comparación
  const normalizedId = String(productId);
  const item = cart.find(item => String(item.id) === normalizedId);
  if (item) {
    item.quantity += change;
    if (item.quantity <= 0) {
      removeProductFromCart(productId);
      return;
    } else {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }
  updateCartCount();
  
  // Solo renderizar carrito si está abierto
  const cartDropdown = document.getElementById('cartDropdown');
  if (cartDropdown && cartDropdown.classList.contains('active')) {
    renderCart();
  }
}

// Función para actualizar contador del carrito
function updateCartCount() {
  const cartToggle = document.getElementById('cartToggle');
  if (cartToggle) {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    // Buscar o crear contador
    let cartCount = cartToggle.querySelector('.cart-count');
    if (!cartCount) {
      cartCount = document.createElement('span');
      cartCount.className = 'cart-count';
      cartToggle.appendChild(cartCount);
    }
    
    cartCount.textContent = totalItems;
    cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
  }
}

// Función para renderizar el carrito
function renderCart() {
  const cartItemsContainer = document.getElementById('cartItems');
  const cartTotalSpan = document.getElementById('cartTotal');
  const checkoutBtn = document.querySelector('.checkout-btn');

  if (!cartItemsContainer) return;

  cartItemsContainer.innerHTML = '';

  if (cart.length === 0) {
    const p = document.createElement('p');
    p.className = 'empty-cart-message';
    p.textContent = 'Tu carrito está vacío.';
    cartItemsContainer.appendChild(p);
    if (cartTotalSpan) cartTotalSpan.textContent = '0';
    if (checkoutBtn) checkoutBtn.disabled = true;
    return;
  } else {
    if (checkoutBtn) checkoutBtn.disabled = false;
  }

  let total = 0;
  cart.forEach(item => {
    total += item.precio * item.quantity;

    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <img src="${item.imagen}" alt="${item.nombre}">
      <div class="cart-item-details">
        <h4>${item.nombre}</h4>
        <p>$${item.precio.toLocaleString('es-AR')} x ${item.quantity}</p>
        <div class="cart-item-quantity">
          <button class="quantity-btn" data-id="${item.id}" data-change="-1">-</button>
          <span>${item.quantity}</span>
          <button class="quantity-btn" data-id="${item.id}" data-change="1">+</button>
        </div>
      </div>
      <button class="remove-item-btn" data-id="${item.id}">
        <i class="fas fa-trash-alt"></i>
      </button>
    `;
    cartItemsContainer.appendChild(div);
  });

  if (cartTotalSpan) {
    cartTotalSpan.textContent = total.toLocaleString('es-AR');
  }

  // Agregar event listeners para botones del carrito
  cartItemsContainer.querySelectorAll('.remove-item-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      const productId = e.currentTarget.dataset.id; // No convertir a int
      removeProductFromCart(productId);
    });
  });

  cartItemsContainer.querySelectorAll('.quantity-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      const productId = e.currentTarget.dataset.id; // No convertir a int
      const change = parseInt(e.currentTarget.dataset.change);
      updateCartItemQuantity(productId, change);
    });
  });
}

// Función para enviar mensaje de WhatsApp
function sendWhatsAppMessage() {
  const phoneNumber = '5491166135708';
  let message = "¡Hola! Quiero comprar estos productos:\n\n";

  if (cart.length === 0) {
    message = "Hola, estoy interesado en sus productos. ¿Podrían enviarme más información?";
  } else {
    cart.forEach(item => {
      message += `• ${item.nombre}\n  Cantidad: ${item.quantity}\n  Precio: $${item.precio.toLocaleString('es-AR')} c/u\n\n`;
    });
    const total = cart.reduce((sum, item) => sum + (item.precio * item.quantity), 0);
    message += `💰 Total: $${total.toLocaleString('es-AR')}\n\n`;
    message += "¿Están disponibles? ¿Cómo puedo proceder con la compra?";
  }

  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, '_blank');
}

// Función para buscar productos y redirigir
function searchProducts() {
  const searchTerm = document.getElementById('searchInput').value.trim();
  if (searchTerm) {
    window.location.href = `../index.html?search=${encodeURIComponent(searchTerm)}`;
  }
}

// FUNCIÓN PARA AUTOCOMPLETADO DE BÚSQUEDA (adaptada para details.js)
function setupAutocomplete(inputElement) {
  const resultsContainer = document.getElementById('autocomplete-results');
  let activeSuggestionIndex = -1;

  inputElement.addEventListener('input', () => {
    const query = inputElement.value.trim();
    const normalizedQuery = removeAccents(query.toLowerCase());
    
    if (normalizedQuery.length < 2) {
      resultsContainer.innerHTML = '';
      resultsContainer.style.display = 'none';
      inputElement.setAttribute('aria-expanded', 'false');
      return;
    }

    const suggestions = [];
    const addedNames = new Set();
    productos.forEach(p => {
        if (suggestions.length < 6 && removeAccents(p.nombre.toLowerCase()).includes(normalizedQuery) && !addedNames.has(p.nombre.toLowerCase())) {
            suggestions.push({ nombre: p.nombre, categoria: p.categoria });
            addedNames.add(p.nombre.toLowerCase());
        }
    });

    resultsContainer.innerHTML = '';
    if (suggestions.length > 0) {
      suggestions.forEach((suggestion, index) => {
        const item = document.createElement('div');
        item.className = 'autocomplete-item';
        
        const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        const highlightedName = suggestion.nombre.replace(regex, '<strong>$1</strong>');

        item.innerHTML = `
          <div class="suggestion-details">
            <span class="suggestion-name">${highlightedName}</span>
            <span class="suggestion-category">${suggestion.categoria}</span>
          </div>
          <i class="fas fa-search suggestion-icon"></i>
        `;

        item.id = `suggestion-${index}`;
        item.setAttribute('role', 'option');

        item.addEventListener('click', () => {
          inputElement.value = suggestion.nombre;
          searchProducts();
        });
        resultsContainer.appendChild(item);
      });
      resultsContainer.style.display = 'block';
      inputElement.setAttribute('aria-expanded', 'true');
      activeSuggestionIndex = -1;
    } else {
      if (normalizedQuery.length >= 2) {
        const noResultItem = document.createElement('div');
        noResultItem.className = 'autocomplete-no-results';
        noResultItem.textContent = 'No se encontraron sugerencias.';
        resultsContainer.appendChild(noResultItem);
        resultsContainer.style.display = 'block';
        inputElement.setAttribute('aria-expanded', 'true');
      }
    }
  });

  inputElement.addEventListener('keydown', (e) => {
    const items = resultsContainer.querySelectorAll('.autocomplete-item');
    if (items.length === 0 || resultsContainer.style.display === 'none') return;

    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      items[activeSuggestionIndex]?.classList.remove('highlighted');
      activeSuggestionIndex = e.key === 'ArrowDown' ? (activeSuggestionIndex + 1) % items.length : (activeSuggestionIndex - 1 + items.length) % items.length;
      items[activeSuggestionIndex].classList.add('highlighted');
      inputElement.setAttribute('aria-activedescendant', items[activeSuggestionIndex].id);
    } else if (e.key === 'Enter' && activeSuggestionIndex > -1) {
      e.preventDefault();
      items[activeSuggestionIndex].click();
    } else if (e.key === 'Escape') {
      resultsContainer.style.display = 'none';
      inputElement.setAttribute('aria-expanded', 'false');
    }
  });
}

// Función para crear galería de imágenes
function createImageGallery(product) {
  // Asegurarse de que product.imagenes sea un array
  productImages = Array.isArray(product.imagenes) ? product.imagenes : [product.imagen];
  currentImageIndex = 0;
  
  let galleryHTML = `
    <div class="main-image-container">
      <div class="zoom-hint">
        <i class="fas fa-search-plus"></i> Click para ampliar
      </div>
      <img class="main-image" src="${productImages[0]}" alt="${product.nombre}" loading="lazy" />
      ${productImages.length > 1 ? `
      <button class="image-navigation prev" onclick="navigateImage(-1)">
        <i class="fas fa-chevron-left"></i>
      </button>
      <button class="image-navigation next" onclick="navigateImage(1)">
        <i class="fas fa-chevron-right"></i>
      </button>
      ` : ''}
    </div>
  `;
  
  if (productImages.length > 1) {
    galleryHTML += `
      <div class="thumbnail-container">
        ${productImages.map((img, index) => 
          `<img class="thumbnail ${index === 0 ? 'active' : ''}" 
                src="${img}" 
                alt="${product.nombre} - Vista ${index + 1}" 
                onclick="changeMainImage(${index})"
                loading="lazy" />`
        ).join('')}
      </div>
      <div class="image-counter">1 / ${productImages.length}</div>
    `;
  }
  
  return galleryHTML;
}

// Cargar detalles del producto
function loadProductDetails() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id"); // No convertir a int, mantener como string
  
  // Esperar a que los productos se carguen si no están disponibles
  if (!productos || productos.length === 0) {
    setTimeout(loadProductDetails, 100);
    return;
  }
  
  // Buscar producto comparando IDs como strings
  const producto = productos.find((p) => String(p.id) === String(id));
  const contenedor = document.getElementById("detalle");

  if (producto) {
    currentProduct = producto;
    
    let badgeHTML = '';
    if (producto.status && producto.status !== 'none') {
        badgeHTML = `<div class="product-badge-details status-${producto.status}">${producto.status}</div>`;
    }
    const galleryHTML = createImageGallery(producto);
    
    contenedor.innerHTML = `
      <div class="detalle-container">
        <div class="product-primary-info">
          <div class="detalle-info-header mobile-header">
            <h1>${producto.nombre}</h1>
            <p class="detalle-precio">${producto.precio.toLocaleString('es-AR')}</p>
          </div>
          <div class="detalle-img ${producto.status ? `product-status-${producto.status}` : ''}">
            ${badgeHTML}
            ${galleryHTML}
          </div>
        </div>
        <div class="product-secondary-info">
          <div class="detalle-info-header mobile-header">
            <h1>${producto.nombre}</h1>
            <p class="detalle-precio">${producto.precio.toLocaleString('es-AR')}</p>
          </div>
          <div class="action-buttons-container">
            <div class="sub-actions">
              <a href="#" onclick="sendWhatsAppProductMessage(); return false;" class="boton-compra primary-action-btn">
                <i class="fab fa-whatsapp"></i> Comprar por WhatsApp
              </a>
              <button id="copyLinkBtn" class="copy-link-btn icon-btn" onclick="copyProductLink()" aria-label="Copiar Enlace" data-tooltip="Copiar Enlace"><i class="fas fa-link"></i></button>
            </div>
          </div>
          <div class="quantity-selector">
            <div class="quantity-labels">
              <label for="quantityInput">Cantidad:</label>
              <label>Agregar:</label>
            </div>
            <div class="quantity-controls">
              <button class="quantity-btn" data-action="minus" onclick="updateQuantity(-1)">-</button>
              <input type="number" id="quantityInput" class="quantity-input" value="1" min="1" max="99" readonly>
              <button class="quantity-btn" data-action="plus" onclick="updateQuantity(1)">+</button>
              <button class="quantity-icon-btn" onclick="addProductToCart(${producto.id})" aria-label="Agregar al carrito">
                <i class="fas fa-shopping-cart"></i>
              </button>
            </div>
          </div>
          <div class="product-details">
            <p><strong>Color:</strong> ${producto.color}</p>
            <p><strong>Tela:</strong> ${producto.tela}</p>
            <p><strong>Descripción:</strong> ${producto.descripcion}</p>
          </div>
        </div>
      </div>
    `;
    
    // Handle 'agotado' status
    if (producto.status === 'agotado') {
        const addToCartBtn = contenedor.querySelector('.add-to-cart-btn');
        const buyBtn = contenedor.querySelector('.boton-compra');
        const quantitySelector = contenedor.querySelector('.quantity-selector');

        if (addToCartBtn) {
            addToCartBtn.remove();
        }
        if (buyBtn) {
            buyBtn.style.display = 'none'; // Hide buy button
        }
        if (quantitySelector) {
            quantitySelector.style.display = 'none'; // Hide quantity selector
        }
    }

    // Configurar event listeners para las imágenes
    setupImageEventListeners();
    
    // Actualizar título de la página
    document.title = `${producto.nombre} - Detalles del Producto`;
    
  } else {
    contenedor.innerHTML = `
      <div class="detalle-container">
        <div style="text-align: center; padding: 3rem;">
          <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #ff69b4; margin-bottom: 1rem;"></i>
          <h2>Producto no encontrado</h2>
          <p>Lo sentimos, el producto que buscas no existe o ha sido eliminado.</p>
          <button class="back-button" onclick="window.location.href='../index.html'" style="margin-top: 1rem;">
            <i class="fas fa-home"></i> Volver al Inicio
          </button>
        </div>
      </div>
    `;
  }
}

// Configurar event listeners para las imágenes
function setupImageEventListeners() {
  // Event listener para abrir zoom al hacer click en imagen principal
  const mainImage = document.querySelector('.main-image');
  if (mainImage) {
    mainImage.addEventListener('click', () => openZoomModal());
  }
  
  // Event listeners para navegación con teclado
  document.addEventListener('keydown', handleKeyboardNavigation);
}

// Función para manejar navegación con teclado
function handleKeyboardNavigation(e) {
  const modal = document.getElementById('imageZoomModal');
  const isModalOpen = modal && modal.classList.contains('active');
  
  if (isModalOpen) {
    switch(e.key) {
      case 'Escape':
        closeZoomModal();
        break;
      case 'ArrowLeft':
        navigateZoom(-1);
        break;
      case 'ArrowRight':
        navigateZoom(1);
        break;
    }
  } else {
    switch(e.key) {
      case 'Escape':
        closeAllDropdowns();
        break;
      case 'ArrowLeft':
        if (productImages.length > 1) navigateImage(-1);
        break;
      case 'ArrowRight':
        if (productImages.length > 1) navigateImage(1);
        break;
    }
  }
}

// Función para enviar WhatsApp del producto específico
function sendWhatsAppProductMessage() {
  if (!currentProduct) return;
  
  const phoneNumber = '5491166135708';
  const quantity = document.getElementById('quantityInput')?.value || 1;
  const total = currentProduct.precio * quantity;
  
  let message = `¡Hola! Estoy interesado en este producto:\n\n`;
  message += `- ${currentProduct.nombre}\n`;
  message += `- Precio: $${currentProduct.precio.toLocaleString('es-AR')}\n`;
  message += `- Color: ${currentProduct.color}\n`;
  message += `- Cantidad: ${quantity}\n`;
  message += `- Total: $${total.toLocaleString('es-AR')}\n\n`;
  message += `¿Está disponible? ¿Cómo puedo comprarlo?`;

  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, '_blank');
}

// FUNCIONES DE COMENTARIOS
async function loadProductComments() {
  if (!currentProduct) return;
  
  try {
    if (window.firestoreManager) {
      productComments = await window.firestoreManager.getProductComments(currentProduct.id) || [];
    } else {
      const commentsKey = `comments_${currentProduct.id}`;
      productComments = JSON.parse(localStorage.getItem(commentsKey)) || [];
    }
  } catch (error) {
    console.error('Error loading comments:', error);
    productComments = [];
  }
  
  updateCommentsTitle();
  renderComments();
}

function updateCommentsTitle() {
  const title = document.getElementById('commentsTitle');
  if (title) {
    title.textContent = `Comentarios (${productComments.length})`;
  }
}

function renderComments() {
  const container = document.getElementById('commentsList');
  if (!container) return;
  
  if (productComments.length === 0) {
    container.innerHTML = '<div class="empty-comments">No hay comentarios aún. ¡Sé el primero en comentar!</div>';
    return;
  }
  
  container.innerHTML = productComments.map(comment => `
    <div class="comment-item">
      <div class="comment-header" onclick="showUserProfile('${comment.userId}')">
        <img class="comment-avatar" src="${comment.userAvatar}" alt="${comment.username}">
        <div class="comment-user-info">
          <p class="comment-username">${comment.username}</p>
          <p class="comment-date">${formatDate(comment.date)}</p>
        </div>
      </div>
      <p class="comment-text">${comment.text}</p>
    </div>
  `).join('');
}

async function postComment() {
  const input = document.getElementById('commentInput');
  const text = input.value.trim();
  
  if (!text) {
    alert('Por favor escribe un comentario');
    return;
  }
  
  // Verificar si el usuario está logueado
  const currentUser = window.authFunctions?.getCurrentUser?.();
  if (!currentUser) {
    alert('Debes iniciar sesión para comentar');
    return;
  }
  
  const userData = window.authFunctions?.getCurrentUserData?.() || {};
  
  const comment = {
    userId: currentUser.uid,
    username: userData.displayName || currentUser.email.split('@')[0],
    userAvatar: userData.photoURL || '/img-galery/user-profile.png',
    text: text,
    date: new Date().toISOString()
  };
  
  try {
    if (window.firestoreManager) {
      await window.firestoreManager.addProductComment(currentProduct.id, comment);
    } else {
      // Fallback a localStorage
      const commentsKey = `comments_${currentProduct.id}`;
      const localComments = JSON.parse(localStorage.getItem(commentsKey)) || [];
      localComments.unshift({...comment, id: Date.now().toString()});
      localStorage.setItem(commentsKey, JSON.stringify(localComments));
    }
    
    input.value = '';
    await loadProductComments(); // Recargar comentarios
  } catch (error) {
    console.error('Error posting comment:', error);
    alert('Error al publicar el comentario');
  }
}

function showUserProfile(userId) {
  // Buscar datos del usuario en los comentarios
  const comment = productComments.find(c => c.userId === userId);
  if (!comment) return;
  
  // Mostrar modal de auth con tabs de perfil y stats
  const modal = document.getElementById('authModal');
  const userTabs = document.getElementById('userTabs');
  const authTabs = document.getElementById('authTabs');
  const userProfile = document.getElementById('userProfile');
  const userStats = document.getElementById('userStats');
  
  if (modal) {
    // Ocultar tabs de auth y mostrar tabs de usuario
    authTabs.style.display = 'none';
    userTabs.style.display = 'flex';
    
    // Mostrar sección de perfil
    document.querySelectorAll('.auth-form, .user-content').forEach(el => el.style.display = 'none');
    userProfile.style.display = 'block';
    
    // Llenar datos del usuario
    const profilePic = document.getElementById('userProfilePic');
    const displayName = document.getElementById('userDisplayNameHeader');
    const email = document.getElementById('userEmail');
    const created = document.getElementById('userCreated');
    const role = document.getElementById('userRole');
    const totalLikes = document.getElementById('totalLikes');
    const userLevel = document.getElementById('userLevel');
    
    if (profilePic) profilePic.src = comment.userAvatar;
    if (displayName) displayName.textContent = comment.username;
    if (email) email.textContent = 'usuario@ejemplo.com';
    if (created) created.textContent = formatDate(comment.date);
    if (role) role.textContent = 'Usuario';
    if (totalLikes) totalLikes.textContent = Math.floor(Math.random() * 50);
    if (userLevel) userLevel.textContent = Math.floor(Math.random() * 5) + 1;
    
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }
}

function closeUserProfile() {
  const modal = document.getElementById('authModal');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = '';
    
    // Restaurar estado original del modal
    const authTabs = document.getElementById('authTabs');
    const userTabs = document.getElementById('userTabs');
    if (authTabs) authTabs.style.display = 'flex';
    if (userTabs) userTabs.style.display = 'none';
  }
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) return 'Hoy';
  if (days === 1) return 'Ayer';
  if (days < 7) return `Hace ${days} días`;
  
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// Inicialización cuando se carga la página
window.addEventListener('DOMContentLoaded', function() {
  // Esperar a que los productos se carguen desde data.js
  if (typeof productos === 'undefined') {
    // Cargar productos desde el archivo data.js del directorio padre
    const script = document.createElement('script');
    script.src = '../data.js';
    script.onload = () => {
      setTimeout(() => {
        loadProductDetails();
        loadProductComments();
      }, 500);
    };
    document.head.appendChild(script);
  } else {
    loadProductDetails();
    setTimeout(loadProductComments, 500);
  }
  
  // Inicializar contador del carrito
  updateCartCount();
  
  // Event listeners para el navbar
  const menuToggle = document.getElementById('menuToggle');
  const searchToggle = document.getElementById('searchToggle');
  const searchClose = document.getElementById('searchClose');
  const cartToggle = document.getElementById('cartToggle');
  const cartClose = document.getElementById('cartClose');
  const checkoutBtn = document.querySelector('.checkout-btn');
  const menuOverlay = document.getElementById('menuOverlay');
  const searchInput = document.getElementById('searchInput');

  if (menuToggle) menuToggle.addEventListener('click', toggleMenu);
  if (searchToggle) searchToggle.addEventListener('click', toggleSearch);
  if (searchClose) searchClose.addEventListener('click', toggleSearch);
  if (cartToggle) cartToggle.addEventListener('click', toggleCart);
  if (cartClose) cartClose.addEventListener('click', toggleCart);
  if (checkoutBtn) checkoutBtn.addEventListener('click', sendWhatsAppMessage);
  if (menuOverlay) menuOverlay.addEventListener('click', closeAllDropdowns);

  // Event listeners para el modal de zoom
  const zoomClose = document.getElementById('zoomClose');
  const zoomOverlay = document.getElementById('zoomOverlay');
  const zoomPrev = document.getElementById('zoomPrev');
  const zoomNext = document.getElementById('zoomNext');

  if (zoomClose) zoomClose.addEventListener('click', closeZoomModal);
  if (zoomOverlay) zoomOverlay.addEventListener('click', closeZoomModal);
  if (zoomPrev) zoomPrev.addEventListener('click', () => navigateZoom(-1));
  if (zoomNext) zoomNext.addEventListener('click', () => navigateZoom(1));

  // Event listeners para comentarios
  const postCommentBtn = document.getElementById('postCommentBtn');
  if (postCommentBtn) {
    postCommentBtn.addEventListener('click', postComment);
  }
  
  // Event listeners para modal de auth/perfil
  const authClose = document.querySelector('.auth-close');
  if (authClose) {
    authClose.addEventListener('click', closeUserProfile);
  }
  
  // Tabs del modal de usuario
  document.querySelectorAll('.user-tab').forEach(tab => {
    tab.addEventListener('click', function() {
      const tabName = this.dataset.tab;
      
      // Remover active de todos los tabs
      document.querySelectorAll('.user-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.user-content').forEach(c => c.style.display = 'none');
      
      // Activar tab seleccionado
      this.classList.add('active');
      const targetContent = document.getElementById('user' + tabName.charAt(0).toUpperCase() + tabName.slice(1));
      if (targetContent) targetContent.style.display = 'block';
    });
  });
  
  // Cerrar modal al hacer click fuera
  const authModal = document.getElementById('authModal');
  if (authModal) {
    authModal.addEventListener('click', function(e) {
      if (e.target === this) {
        closeUserProfile();
      }
    });
  }

  // Event listener para búsqueda
  if (searchInput) {
    searchInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        // Si hay una sugerencia resaltada, simula un clic en ella
        const highlighted = document.querySelector('.autocomplete-item.highlighted');
        if (highlighted) {
          e.preventDefault();
          highlighted.click();
          return;
        }
        // Si no, realiza la búsqueda con el texto actual
        e.preventDefault();
        searchProducts();
      }
    });

    // Configurar el autocompletado
    setupAutocomplete(searchInput);
  }

  // Prevenir scroll en modal de zoom
  const imageZoomModal = document.getElementById('imageZoomModal');
  if (imageZoomModal) {
    imageZoomModal.addEventListener('wheel', function(e) {
      e.preventDefault();
    }, { passive: false });
  }

  // Touch events para móviles en la galería
  let touchStartX = 0;
  let touchEndX = 0;
  
  const mainImageContainer = document.querySelector('.main-image-container');
  if (mainImageContainer) {
    mainImageContainer.addEventListener('touchstart', function(e) {
      touchStartX = e.changedTouches[0].screenX;
    });
    
    mainImageContainer.addEventListener('touchend', function(e) {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    });
  }
  
  function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        // Swipe left - siguiente imagen
        navigateImage(1);
      } else {
        // Swipe right - imagen anterior
        navigateImage(-1);
      }
    }
  }
  
  // Optimización de imágenes - lazy loading
  const images = document.querySelectorAll('img[loading="lazy"]');
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src || img.src;
          img.classList.remove('lazy');
          imageObserver.unobserve(img);
        }
      });
    });
    
    images.forEach(img => imageObserver.observe(img));
  }
});