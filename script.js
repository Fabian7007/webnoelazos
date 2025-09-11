// Main Script - Simplified and Ordered
let currentSearch = '';
let currentColorFilter = '';
let currentTelaFilter = '';
let currentStatusFilter = '';
let currentSection = 'inicio';
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let currentPage = 1;
let isInitialized = false;
let currentHighlightIndex = -1;
let autocompleteResults = [];

// Initialize empty productos array
let productos = [];
if (typeof window.productos === 'undefined') {
  window.productos = productos;
}

// Items per page configuration
const ITEMS_PER_PAGE = {
  mobile: 6,
  tablet: 9,
  desktop: 18
};

function getItemsPerPage() {
  const width = window.innerWidth;
  if (width <= 768) return ITEMS_PER_PAGE.mobile;
  if (width <= 1024) return ITEMS_PER_PAGE.tablet;
  return ITEMS_PER_PAGE.desktop;
}

function removeAccents(str) {
  if (!str) return '';
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// Close all dropdowns
function closeAllDropdowns() {
  const elements = {
    mobileMenu: document.getElementById('mobileMenu'),
    searchDropdown: document.getElementById('searchDropdown'),
    cartDropdown: document.getElementById('cartDropdown'),
    menuOverlay: document.getElementById('menuOverlay'),
    menuToggle: document.getElementById('menuToggle'),
    userDropdown: document.getElementById('userDropdown')
  };

  if (elements.mobileMenu?.classList.contains('active')) {
    elements.mobileMenu.classList.remove('active');
  }
  if (elements.searchDropdown?.classList.contains('active')) {
    elements.searchDropdown.classList.remove('active');
  }
  if (elements.cartDropdown?.classList.contains('active')) {
    elements.cartDropdown.classList.remove('active');
  }
  if (elements.menuOverlay?.classList.contains('active')) {
    elements.menuOverlay.classList.remove('active');
  }
  if (elements.menuToggle?.classList.contains('active')) {
    elements.menuToggle.classList.remove('active');
  }
  if (elements.userDropdown) {
    elements.userDropdown.style.display = 'none';
    elements.userDropdown.classList.remove('show');
  }

  // Remove all body classes that prevent scrolling
  document.body.classList.remove('menu-open', 'cart-open', 'modal-open', 'no-scroll');
}

// Toggle functions
function toggleMenu(event) {
  event.preventDefault();
  event.stopPropagation();
  const mobileMenu = document.getElementById('mobileMenu');
  const menuToggle = document.getElementById('menuToggle');
  const menuOverlay = document.getElementById('menuOverlay');

  // Close other dropdowns
  const searchDropdown = document.getElementById('searchDropdown');
  const cartDropdown = document.getElementById('cartDropdown');
  if (searchDropdown?.classList.contains('active')) {
    searchDropdown.classList.remove('active');
  }
  if (cartDropdown?.classList.contains('active')) {
    cartDropdown.classList.remove('active');
    document.body.classList.remove('cart-open');
  }

  const isMenuActive = mobileMenu?.classList.contains('active');
  
  if (isMenuActive) {
    mobileMenu?.classList.remove('active');
    menuToggle?.classList.remove('active');
    menuOverlay?.classList.remove('active');
    document.body.classList.remove('menu-open');
  } else {
    mobileMenu?.classList.add('active');
    menuToggle?.classList.add('active');
    menuOverlay?.classList.add('active');
    document.body.classList.add('menu-open');
  }
}

function toggleSearch(event) {
  event.preventDefault();
  event.stopPropagation();
  const searchDropdown = document.getElementById('searchDropdown');
  const searchInput = document.getElementById('searchInput');
  const menuOverlay = document.getElementById('menuOverlay');

  // Close other dropdowns
  const mobileMenu = document.getElementById('mobileMenu');
  const cartDropdown = document.getElementById('cartDropdown');
  const menuToggle = document.getElementById('menuToggle');
  
  if (mobileMenu?.classList.contains('active')) {
    mobileMenu.classList.remove('active');
    menuToggle?.classList.remove('active');
    document.body.classList.remove('menu-open');
  }
  if (cartDropdown?.classList.contains('active')) {
    cartDropdown.classList.remove('active');
    document.body.classList.remove('cart-open');
  }

  const isSearchActive = searchDropdown?.classList.contains('active');
  
  if (isSearchActive) {
    searchDropdown?.classList.remove('active');
    menuOverlay?.classList.remove('active');
  } else {
    searchDropdown?.classList.add('active');
    menuOverlay?.classList.add('active');
    if (searchInput) {
      setTimeout(() => searchInput.focus(), 100);
    }
  }
}

function toggleCart(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  
  const cartDropdown = document.getElementById('cartDropdown');
  const menuOverlay = document.getElementById('menuOverlay');

  // Close other dropdowns
  const mobileMenu = document.getElementById('mobileMenu');
  const searchDropdown = document.getElementById('searchDropdown');
  const menuToggle = document.getElementById('menuToggle');
  
  if (mobileMenu?.classList.contains('active')) {
    mobileMenu.classList.remove('active');
    menuToggle?.classList.remove('active');
    document.body.classList.remove('menu-open');
  }
  if (searchDropdown?.classList.contains('active')) {
    searchDropdown.classList.remove('active');
  }

  const isCartActive = cartDropdown?.classList.contains('active');
  
  if (isCartActive) {
    cartDropdown?.classList.remove('active');
    menuOverlay?.classList.remove('active');
    document.body.classList.remove('cart-open');
  } else {
    cartDropdown?.classList.add('active');
    menuOverlay?.classList.add('active');
    document.body.classList.add('cart-open');
    renderCart();
  }
}

// Function specifically for closing cart
function closeCart() {
  const cartDropdown = document.getElementById('cartDropdown');
  const menuOverlay = document.getElementById('menuOverlay');
  
  if (cartDropdown?.classList.contains('active')) {
    cartDropdown.classList.remove('active');
    menuOverlay?.classList.remove('active');
    document.body.classList.remove('cart-open');
  }
}

// Section management
function getSectionDisplayName(section) {
  const sectionNames = {
    'inicio': 'Productos Destacados',
    'lazos': 'Lazos',
    'monos': 'Moños',
    'colitas': 'Colitas',
    'scrunchies': 'Scrunchies',
    'setmonos': 'Set Moños'
  };
  return sectionNames[section] || section.charAt(0).toUpperCase() + section.slice(1);
}

function showSection(seccion) {
  // Clear filters when changing sections
  currentSearch = '';
  currentColorFilter = '';
  currentTelaFilter = '';
  currentStatusFilter = '';

  // Clear UI fields
  const searchInput = document.getElementById('searchInput');
  if (searchInput) searchInput.value = '';
  
  // Hide autocomplete suggestions
  hideAutocompleteSuggestions();
  
  const colorFilter = document.getElementById('colorFilter');
  if (colorFilter) colorFilter.value = '';
  
  const telaFilter = document.getElementById('telaFilter');
  if (telaFilter) telaFilter.value = '';

  const statusFilter = document.getElementById('statusFilter');
  if (statusFilter) statusFilter.value = '';

  // Hide back button and reset search display
  const backButton = document.getElementById('backButton');
  if (backButton) {
    backButton.style.display = 'none';
  }
  
  const searchTermDisplay = document.getElementById('searchTermDisplay');
  if (searchTermDisplay) {
    searchTermDisplay.style.display = 'none';
  }

  // Update URL without hash to prevent scroll
  const url = new URL(window.location);
  url.searchParams.delete('search');
  url.searchParams.delete('pag');
  url.hash = '';
  window.history.replaceState({ section: seccion }, '', url);

  currentSection = seccion;
  currentPage = 1;
  
  // Update active section
  const sections = document.querySelectorAll('.section');
  sections.forEach(sec => sec.classList.remove('active'));

  const targetSection = document.getElementById(seccion);
  if (targetSection) {
    targetSection.classList.add('active');
  }

  // Update section title
  const sectionTitle = document.getElementById('sectionTitle');
  if (sectionTitle) {
    sectionTitle.textContent = getSectionDisplayName(seccion);
  }

  // Update menu active state
  const menuItems = document.querySelectorAll('.menu-list li');
  menuItems.forEach(item => {
    const link = item.querySelector('a[data-section]');
    if (link && link.dataset.section === seccion) {
      item.classList.add('active-section');
    } else {
      item.classList.remove('active-section');
    }
  });

  // Handle carousel visibility
  if (window.handleMinimalCarouselSectionChange) {
    window.handleMinimalCarouselSectionChange(seccion);
  }

  // Update admin controls
  updateAdminControlsVisibility();

  applyFilters();
  closeAllDropdowns();
}

// Product creation
function createProductElement(prod) {
  const div = document.createElement('div');
  div.className = 'product';
  if (prod.status) {
    div.classList.add(`product-status-${prod.status}`);
  }
  div.style.cursor = 'pointer';

  // Check if user is admin (will be updated asynchronously)
  const currentUserData = window.authFunctions?.getCurrentUserData?.();
  const isAdmin = currentUserData && currentUserData.role === 'administrador';

  div.innerHTML = `
    <div class="gray-square">
      <img src="${prod.imagen}" alt="${prod.nombre}" />

      <div class="product-overlay-actions">
        <button class="add-to-cart-btn" data-id="${prod.id}">
          <img src="/img-galery/icon-carrito.svg" alt="Agregar al carrito" class="cart-btn-icon" />
        </button>
      </div>
      <span class="added-text" style="display: none;">Agregado</span>
    </div>
    <div class="product-info">
      <h3>${prod.nombre}</h3>
      <div class="product-price-row">
        <p class="product-price">$${prod.precio.toLocaleString('es-AR')}</p>
        ${isAdmin ? `
          <div class="admin-actions">
            <button class="edit-product-btn" data-product-id="${prod.id}" title="Editar producto">
              <img src="/img-galery/edit.svg" alt="Editar" />
            </button>
            <button class="delete-product-btn" data-product-id="${prod.id}" title="Eliminar producto">
              <img src="/img-galery/trash.svg" alt="Eliminar" />
            </button>
          </div>
        ` : ''}
      </div>
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

  // Add color/fabric tag
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

  // Handle 'agotado' status
  if (prod.status === 'agotado') {
    const cartBtn = div.querySelector('.add-to-cart-btn');
    if (cartBtn) {
      cartBtn.remove();
    }
    div.style.cursor = 'default';
  }

  return div;
}

// Apply filters and pagination
function applyFilters(page = 1) {
  currentPage = page;

  // Update URL with pagination
  const url = new URL(window.location);
  if (page > 1) {
    url.searchParams.set('pag', page);
  } else {
    url.searchParams.delete('pag');
  }
  window.history.replaceState({}, '', url);

  const carouselSection = document.getElementById('carousel-section');
  const container = document.getElementById(currentSection);
  const infoFooter = document.getElementById('infoFooter');

  if (!container || !infoFooter) return;

  // Handle carousel visibility
  const hasActiveFilters = currentSearch.trim() !== '' || currentColorFilter !== '' || currentTelaFilter !== '' || currentStatusFilter !== '';
  if (carouselSection) {
    if (hasActiveFilters || currentSection !== 'inicio') {
      carouselSection.style.display = 'none';
    } else {
      carouselSection.style.display = 'block';
    }
  }

  // Clear containers
  container.innerHTML = "";
  infoFooter.innerHTML = "";

  // Don't show "no results" if products are still loading
  if (productos.length === 0 && !window.productsLoaded) {
    return; // Exit early, products are still loading
  }

  // Filter products
  const hasSearch = currentSearch.trim() !== '';

  let filteredProducts = productos.filter(p => {
    // Search match - buscar en múltiples campos
    const searchMatch = !hasSearch || 
      removeAccents(p.nombre.toLowerCase()).includes(removeAccents(currentSearch.toLowerCase())) || 
      removeAccents(p.descripcion.toLowerCase()).includes(removeAccents(currentSearch.toLowerCase())) ||
      (p.color && removeAccents(p.color.toLowerCase()).includes(removeAccents(currentSearch.toLowerCase()))) ||
      (p.tela && removeAccents(p.tela.toLowerCase()).includes(removeAccents(currentSearch.toLowerCase()))) ||
      (p.status && removeAccents(p.status.toLowerCase()).includes(removeAccents(currentSearch.toLowerCase()))) ||
      (p.categoria && removeAccents(p.categoria.toLowerCase()).includes(removeAccents(currentSearch.toLowerCase()))) ||
      p.precio.toString().includes(currentSearch);
    
    // Filter matches
    const colorMatch = currentColorFilter === '' || p.color === currentColorFilter;
    const fabricMatch = currentTelaFilter === '' || p.tela === currentTelaFilter;
    const statusMatch = currentStatusFilter === '' || (p.status || 'none') === currentStatusFilter;

    // Section match
    let sectionMatch = false;
    if (hasSearch) {
      sectionMatch = true; // Show all when searching
    } else if (currentSection === 'inicio') {
      sectionMatch = true; // Show all on inicio
    } else if (currentSection === 'monos') {
      sectionMatch = p.categoria === 'monos' || p.categoria === 'setmonos';
    } else {
      sectionMatch = p.categoria === currentSection;
    }

    return searchMatch && colorMatch && fabricMatch && statusMatch && sectionMatch;
  });

  // Pagination
  const itemsPerPage = getItemsPerPage();
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  // Show no results message only if products are loaded and there are no results
  if (filteredProducts.length === 0 && window.productsLoaded) {
    const noResultsMessage = document.createElement('div');
    noResultsMessage.className = 'no-results-message';
    noResultsMessage.innerHTML = `
      <p>Lo sentimos, no se encontraron productos que coincidan con tu búsqueda o filtros.</p>
      <p>Intenta ajustar tu búsqueda o <a href="#" onclick="clearFilters(); return false;">limpiar todos los filtros</a>.</p>
    `;
    container.appendChild(noResultsMessage);
    return;
  }

  // Create and show products
  paginatedProducts.forEach(prod => {
    const productElement = createProductElement(prod);
    
    // Event listener for navigation to details
    productElement.addEventListener('click', (e) => {
      if (!e.target.closest('.add-to-cart-btn') && !e.target.closest('.admin-actions')) {
        console.log('🔗 Navegando a detalles del producto:', prod.id);
        console.log('URL que se va a abrir:', `details.html?id=${encodeURIComponent(prod.id)}`);
        window.location.href = `details.html?id=${encodeURIComponent(prod.id)}`;
      }
    });

    // Event listener for cart button
    const cartBtn = productElement.querySelector('.add-to-cart-btn');
    if (cartBtn && prod.status !== 'agotado') {
      cartBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        addProductToCart(prod.id, cartBtn);
      });
    }



    // Event listeners for admin buttons
    const editBtn = productElement.querySelector('.edit-product-btn');
    const deleteBtn = productElement.querySelector('.delete-product-btn');
    
    if (editBtn && window.adminFunctions?.editProduct) {
      editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        window.adminFunctions.editProduct(prod.id);
      });
    }
    
    if (deleteBtn && window.adminFunctions?.deleteProduct) {
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        window.adminFunctions.deleteProduct(prod.id);
      });
    }

    container.appendChild(productElement);
  });

  // Create pagination if needed
  if (totalPages > 1) {
    const pagination = document.createElement('div');
    pagination.className = 'pagination';

    // Previous button
    if (currentPage > 1) {
      const prevBtn = document.createElement('button');
      prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
      prevBtn.onclick = (e) => {
        e.preventDefault();
        applyFilters(currentPage - 1);
      };
      pagination.appendChild(prevBtn);
    }

    // Page numbers
    let startPage = Math.max(1, currentPage - 1);
    let endPage = Math.min(totalPages, currentPage + 1);

    if (currentPage === 1) {
      endPage = Math.min(totalPages, 3);
    } else if (currentPage === totalPages) {
      startPage = Math.max(1, totalPages - 2);
    }

    for (let i = startPage; i <= endPage; i++) {
      const btn = document.createElement('button');
      btn.textContent = i;
      btn.className = (i === currentPage) ? 'active' : '';
      btn.onclick = (e) => {
        e.preventDefault();
        applyFilters(i);
      };
      pagination.appendChild(btn);
    }

    // Next button
    if (currentPage < totalPages) {
      const nextBtn = document.createElement('button');
      nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
      nextBtn.onclick = (e) => {
        e.preventDefault();
        applyFilters(currentPage + 1);
      };
      pagination.appendChild(nextBtn);
    }

    infoFooter.appendChild(pagination);
  }

  // Pagination summary
  const summary = document.createElement('div');
  summary.className = 'pagination-summary';
  const startProduct = startIndex + 1;
  const endProduct = startIndex + paginatedProducts.length;
  summary.textContent = `Mostrando ${startProduct} - ${endProduct} de ${filteredProducts.length} productos`;
  infoFooter.appendChild(summary);


}

// Clear filters
function clearFilters() {
  currentSearch = '';
  currentColorFilter = '';
  currentTelaFilter = '';
  currentStatusFilter = '';
  currentPage = 1;

  const searchInput = document.getElementById('searchInput');
  const colorFilter = document.getElementById('colorFilter');
  const telaFilter = document.getElementById('telaFilter');
  const statusFilter = document.getElementById('statusFilter');

  if (searchInput) searchInput.value = '';
  if (colorFilter) colorFilter.value = '';
  if (telaFilter) telaFilter.value = '';
  if (statusFilter) statusFilter.value = '';
  
  // Hide autocomplete suggestions
  hideAutocompleteSuggestions();

  // Clear URL parameters
  const url = new URL(window.location);
  url.searchParams.delete('search');
  url.searchParams.delete('pag');
  window.history.replaceState({}, '', url);

  // Restore section title and hide back button
  const sectionTitle = document.getElementById('sectionTitle');
  const searchTermDisplay = document.getElementById('searchTermDisplay');
  const backButton = document.getElementById('backButton');
  
  if (sectionTitle && searchTermDisplay) {
    sectionTitle.textContent = getSectionDisplayName(currentSection);
    searchTermDisplay.style.display = 'none';
  }
  
  if (backButton) {
    backButton.style.display = 'none';
  }

  applyFilters();
}

// Go back from search results
function goBackFromSearch() {
  clearFilters();
  closeAllDropdowns();
}

// Función para limpiar localStorage cuando se excede la cuota
function clearLocalStorageQuota() {
  try {
    // Limpiar datos no esenciales
    const keysToKeep = ['cart', 'user', 'authToken'];
    const allKeys = Object.keys(localStorage);
    
    allKeys.forEach(key => {
      if (!keysToKeep.includes(key)) {
        localStorage.removeItem(key);
      }
    });
    
    console.log('LocalStorage limpiado para liberar espacio');
  } catch (error) {
    console.error('Error limpiando localStorage:', error);
  }
}

// Cart functions
function addProductToCart(productId, buttonElement) {
  const normalizedId = String(productId);
  const product = productos.find(p => String(p.id) === normalizedId);
  if (product) {
    const existingItem = cart.find(item => String(item.id) === normalizedId);
    if (existingItem) {
      existingItem.quantity++;
    } else {
      // Mantener el orden de inserción agregando al final
      cart.push({ ...product, quantity: 1, addedAt: Date.now() });
    }
    
    try {
      localStorage.setItem('cart', JSON.stringify(cart));
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        // Limpiar localStorage y reintentar
        clearLocalStorageQuota();
        cart = [];
        cart.push({ ...product, quantity: 1, addedAt: Date.now() });
        try {
          localStorage.setItem('cart', JSON.stringify(cart));
          alert('El carrito se ha limpiado por falta de espacio. El producto se agregó correctamente.');
        } catch (retryError) {
          console.error('Error after cleanup:', retryError);
          alert('Error: No se pudo agregar el producto. Intenta recargar la página.');
          return;
        }
      } else {
        console.error('Error adding to cart:', error);
        return;
      }
    }
    
    updateCartCount();
    
    // Only render cart if it's open
    const cartDropdown = document.getElementById('cartDropdown');
    if (cartDropdown && cartDropdown.classList.contains('active')) {
      renderCart();
    }

    // Animation
    if (buttonElement) {
      const productElement = buttonElement.closest('.product');
      if (productElement) {
        productElement.classList.add('added-to-cart-glow');
        setTimeout(() => {
          productElement.classList.remove('added-to-cart-glow');
        }, 700);

        const addedText = productElement.querySelector('.added-text');
        if (addedText) {
          addedText.style.display = 'block';
          addedText.style.opacity = '1';
          setTimeout(() => {
            addedText.style.opacity = '0';
            setTimeout(() => {
              addedText.style.display = 'none';
            }, 500);
          }, 1000);
        }
      }
    }
  }
}

function removeProductFromCart(productId) {
  const normalizedId = String(productId);
  cart = cart.filter(item => String(item.id) !== normalizedId);
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
  
  const cartDropdown = document.getElementById('cartDropdown');
  if (cartDropdown && cartDropdown.classList.contains('active')) {
    renderCart();
  }
}

function updateCartItemQuantity(productId, change) {
  const normalizedId = String(productId);
  const item = cart.find(item => String(item.id) === normalizedId);
  if (item) {
    item.quantity += change;
    if (item.quantity <= 0) {
      removeProductFromCart(productId);
      return;
    } else {
      try {
        localStorage.setItem('cart', JSON.stringify(cart));
      } catch (error) {
        if (error.name === 'QuotaExceededError') {
          clearLocalStorageQuota();
          cart = [];
          try {
            localStorage.setItem('cart', JSON.stringify(cart));
            alert('El carrito se ha limpiado por falta de espacio.');
          } catch (retryError) {
            console.error('Error after cleanup:', retryError);
            alert('Error: Intenta recargar la página.');
          }
          updateCartCount();
          renderCart();
          return;
        }
      }
    }
  }
  updateCartCount();
  
  const cartDropdown = document.getElementById('cartDropdown');
  if (cartDropdown && cartDropdown.classList.contains('active')) {
    renderCart();
  }
}

function updateCartCount() {
  const cartCount = document.getElementById('cartCount');
  if (cartCount) {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
  }
}

function renderCart() {
  const cartItemsContainer = document.getElementById('cartItems');
  const cartTotalSpan = document.getElementById('cartTotal');
  const checkoutBtn = document.querySelector('.checkout-btn');

  if (!cartItemsContainer || !cartTotalSpan) return;

  cartItemsContainer.innerHTML = '';

  if (cart.length === 0) {
    const p = document.createElement('p');
    p.className = 'empty-cart-message';
    p.textContent = 'Tu carrito está vacío.';
    cartItemsContainer.appendChild(p);
    cartTotalSpan.textContent = '0';
    if (checkoutBtn) checkoutBtn.disabled = true;
    return;
  } else {
    if (checkoutBtn) checkoutBtn.disabled = false;
  }

  let total = 0;
  // Ordenar por fecha de agregado para mantener el orden de inserción
  const sortedCart = [...cart].sort((a, b) => (a.addedAt || 0) - (b.addedAt || 0));
  
  sortedCart.forEach(item => {
    total += item.precio * item.quantity;

    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <div class="cart-item-image">
        <img src="${item.imagen}" alt="${item.nombre}" />
      </div>
      <div class="cart-item-info">
        <h4>${item.nombre}</h4>
        <span class="cart-item-price">$${item.precio.toLocaleString('es-AR')}</span>
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

  cartTotalSpan.textContent = total.toLocaleString('es-AR');

  // Event listeners for cart buttons
  const removeButtons = cartItemsContainer.querySelectorAll('.remove-item-btn');
  const quantityButtons = cartItemsContainer.querySelectorAll('.quantity-btn');
  
  removeButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      const productId = e.currentTarget.dataset.id;
      removeProductFromCart(productId);
    });
  });

  quantityButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      const productId = e.currentTarget.dataset.id;
      const change = parseInt(e.currentTarget.dataset.change);
      updateCartItemQuantity(productId, change);
    });
  });
}

function sendWhatsAppMessage() {
  const phoneNumber = '5491151012889';
  let message = "Hola, quiero comprar estos productos:\n";

  if (cart.length === 0) {
    message = "Hola, estoy interesado en sus productos.";
  } else {
    cart.forEach(item => {
      message += `- ${item.nombre} (Cantidad: ${item.quantity})\n`;
    });
    const cartTotal = document.getElementById('cartTotal');
    const totalAmount = cartTotal ? cartTotal.textContent : '0';
    
    if (cartTotal) {
      message += `\nTotal: $${totalAmount}\n`;
    }
    message += "\n¿Están disponibles?";
  }

  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, '_blank');
}

// URL parameter handling
function handleUrlParameters() {
  const urlParams = new URLSearchParams(window.location.search);
  const hash = window.location.hash.substring(1);

  const searchParam = urlParams.get('search');
  const pageParam = urlParams.get('pag');

  if (searchParam) {
    currentSearch = searchParam;
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.value = searchParam;
    }
    const sectionTitle = document.getElementById('sectionTitle');
    const searchTermDisplay = document.getElementById('searchTermDisplay');
    if (sectionTitle && searchTermDisplay) {
      sectionTitle.textContent = 'Resultados de Búsqueda';
      searchTermDisplay.textContent = `"${searchParam}"`;
      searchTermDisplay.style.display = 'block';
    }

    const url = new URL(window.location);
    if (url.hash) {
      url.hash = '';
      window.history.replaceState({}, '', url);
    }

    applyFilters(1);
    return;
  }

  if (hash && ['inicio', 'lazos', 'monos', 'colitas', 'scrunchies', 'setmonos'].includes(hash)) {
    showSection(hash);
    return;
  }
  
  if (pageParam) {
    currentPage = parseInt(pageParam) || 1;
    applyFilters(currentPage);
    return;
  }

  showSection('inicio');
}

// Sync productos
function syncProductos() {
  if (window.productos && window.productos.length > 0) {
    productos = [...window.productos];
    console.log('✅ Productos sincronizados:', productos.length);
    
    if (window.initializeMinimalCarousel) {
      setTimeout(() => window.initializeMinimalCarousel(), 100);
    }
    
    return true;
  }
  return false;
}

// Initialize app
function initializeApp() {
  if (isInitialized) return;
  isInitialized = true;

  console.log('Inicializando aplicación...');
  
  // Show products loading if no products are loaded yet
  if (!window.productsLoaded && productos.length === 0) {
    showProductsLoading();
  }
  
  // Mark user as online if authenticated
  setTimeout(async () => {
    const currentUser = window.authFunctions?.getCurrentUser();
    if (currentUser && window.userActivitySystem) {
      await window.userActivitySystem.setUserOnline(currentUser.uid);
      console.log('🟢 Usuario marcado como online en script.js:', currentUser.uid);
    } else {
      console.log('⚠️ userActivitySystem no disponible en script.js');
    }
  }, 1000);

  syncProductos();
  handleUrlParameters();
  updateCartCount();

  // Event listeners
  const elements = {
    menuToggle: document.getElementById('menuToggle'),
    searchToggle: document.getElementById('searchToggle'),
    searchClose: document.getElementById('searchClose'),
    cartToggle: document.getElementById('cartToggle'),
    cartClose: document.getElementById('cartClose'),
    checkoutBtn: document.querySelector('.checkout-btn'),
    menuOverlay: document.getElementById('menuOverlay'),
    searchInput: document.getElementById('searchInput'),
    colorFilter: document.getElementById('colorFilter'),
    telaFilter: document.getElementById('telaFilter'),
    clearFiltersBtn: document.getElementById('clearFilters'),
    statusFilter: document.getElementById('statusFilter')
  };

  // Assign event listeners
  if (elements.menuToggle) {
    elements.menuToggle.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleMenu(e);
    });
  }
  
  if (elements.searchToggle) {
    elements.searchToggle.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleSearch(e);
    });
  }
  
  if (elements.searchClose) {
    elements.searchClose.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleSearch(e);
    });
  }
  
  if (elements.cartToggle) {
    elements.cartToggle.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleCart(e);
    });
  }
  
  if (elements.cartClose) {
    elements.cartClose.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      closeCart();
    });
  }
  
  if (elements.checkoutBtn) {
    elements.checkoutBtn.addEventListener('click', sendWhatsAppMessage);
  }
  
  if (elements.menuOverlay) {
    elements.menuOverlay.addEventListener('click', closeAllDropdowns);
  }

  // Search functionality with autocomplete
  if (elements.searchInput) {
    const autocompleteContainer = document.getElementById('autocomplete-results');
    
    // Input event for autocomplete
    elements.searchInput.addEventListener('input', function (e) {
      const query = e.target.value.trim();
      currentSearch = query;
      currentPage = 1;
      currentHighlightIndex = -1;

      const url = new URL(window.location);
      if (currentSearch.trim()) {
        url.searchParams.set('search', currentSearch);
      } else {
        url.searchParams.delete('search');
      }
      url.searchParams.delete('pag');
      url.hash = '';
      window.history.replaceState({}, '', url);

      // Show autocomplete suggestions
      if (query.length >= 2) {
        showAutocompleteSuggestions(query);
      } else {
        hideAutocompleteSuggestions();
      }

      applyFilters();

      const sectionTitle = document.getElementById('sectionTitle');
      const searchTermDisplay = document.getElementById('searchTermDisplay');
      const backButton = document.getElementById('backButton');
      
      if (sectionTitle && searchTermDisplay) {
        if (currentSearch.trim()) {
          sectionTitle.textContent = 'Resultados de Búsqueda';
          searchTermDisplay.textContent = `"${currentSearch}"`;
          searchTermDisplay.style.display = 'block';
          
          // Show back button
          if (backButton) {
            backButton.style.display = 'inline-flex';
          }
        } else {
          sectionTitle.textContent = getSectionDisplayName(currentSection);
          searchTermDisplay.style.display = 'none';
          
          // Hide back button
          if (backButton) {
            backButton.style.display = 'none';
          }
        }
      }
    });

    // Keyboard navigation for autocomplete
    elements.searchInput.addEventListener('keydown', function (e) {
      const suggestions = autocompleteContainer?.querySelectorAll('.autocomplete-item');
      
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (suggestions && suggestions.length > 0) {
          currentHighlightIndex = Math.min(currentHighlightIndex + 1, suggestions.length - 1);
          updateHighlight(suggestions);
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (suggestions && suggestions.length > 0) {
          currentHighlightIndex = Math.max(currentHighlightIndex - 1, -1);
          updateHighlight(suggestions);
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        
        let searchTerm = '';
        let shouldNavigateToDetails = false;
        
        if (currentHighlightIndex >= 0 && suggestions && suggestions[currentHighlightIndex]) {
          // Select highlighted suggestion
          const selectedSuggestion = suggestions[currentHighlightIndex];
          const suggestionText = selectedSuggestion.dataset.value;
          const suggestionType = selectedSuggestion.dataset.type;
          
          // If it's a product name, go to details page
          if (suggestionType === 'nombre') {
            const product = productos.find(p => p.nombre === suggestionText);
            if (product) {
              window.location.href = `details.html?id=${encodeURIComponent(product.id)}`;
              return;
            }
          }
          
          searchTerm = suggestionText;
        } else {
          // No suggestion selected, use current input
          searchTerm = elements.searchInput.value.trim();
        }
        
        // Perform search if we have a term - redirect to index.html
        if (searchTerm) {
          window.location.href = `index.html?search=${encodeURIComponent(searchTerm)}`;
          return;
        }
        
        // Always close the search dropdown
        toggleSearch();
      } else if (e.key === 'Escape') {
        hideAutocompleteSuggestions();
      }
    });

    // Hide suggestions when clicking outside
    document.addEventListener('click', function(e) {
      if (!e.target.closest('.search-container')) {
        hideAutocompleteSuggestions();
      }
    });
  }

  // Filter functionality
  if (elements.colorFilter) {
    elements.colorFilter.addEventListener('change', function (e) {
      currentColorFilter = e.target.value;
      currentPage = 1;
      applyFilters();
    });
  }

  if (elements.telaFilter) {
    elements.telaFilter.addEventListener('change', function (e) {
      currentTelaFilter = e.target.value;
      currentPage = 1;
      applyFilters();
    });
  }

  if (elements.statusFilter) {
    elements.statusFilter.addEventListener('change', function (e) {
      currentStatusFilter = e.target.value;
      currentPage = 1;
      applyFilters();
    });
  }

  if (elements.clearFiltersBtn) {
    elements.clearFiltersBtn.addEventListener('click', clearFilters);
  }

  // Global keyboard shortcuts
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeAllDropdowns();
    }
  });

  // Window resize handler
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      applyFilters(currentPage);  
    }, 150);
  });

  // Initialize admin controls
  updateAdminControlsVisibility();

  console.log('Aplicación inicializada correctamente');
}

// Show/hide products loading indicator
function showProductsLoading() {
  const productsLoading = document.getElementById('productsLoading');
  if (productsLoading) {
    productsLoading.style.display = 'flex';
  }
}

function hideProductsLoading() {
  const productsLoading = document.getElementById('productsLoading');
  if (productsLoading) {
    productsLoading.style.display = 'none';
  }
}

// Listen for products loaded
window.addEventListener('productsLoaded', () => {
  console.log('🔄 Productos cargados, sincronizando...');
  syncProductos();
  window.productsLoaded = true;
  hideProductsLoading();
  if (isInitialized) {
    applyFilters(currentPage);
  }
});

// Prevent all automatic scrolling
function preventAutoScroll() {
  let savedScrollPosition = 0;
  
  // Prevent scroll restoration
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  
  // Prevent hash scroll
  window.addEventListener('hashchange', function(e) {
    e.preventDefault();
  });
  
  // Handle mobile viewport changes
  if (window.innerWidth <= 768) {
    let viewportHeight = window.innerHeight;
    
    window.addEventListener('resize', function() {
      const currentHeight = window.innerHeight;
      if (Math.abs(currentHeight - viewportHeight) > 100) {
        // Browser bar appeared/disappeared
        window.scrollTo(0, savedScrollPosition);
      }
      viewportHeight = currentHeight;
    });
    
    // Save scroll position periodically
    window.addEventListener('scroll', function() {
      savedScrollPosition = window.pageYOffset;
    }, { passive: true });
  }
  
  // Prevent focus-induced scrolling
  document.addEventListener('focusin', function(e) {
    e.preventDefault();
  });
}

// Initialize scroll prevention immediately
preventAutoScroll();

// Additional scroll prevention for specific events
document.addEventListener('DOMContentLoaded', function() {
  // Prevent scroll on link clicks with preventDefault
  document.addEventListener('click', function(e) {
    if (e.target.matches('a[href="#"], a[onclick*="preventDefault"]')) {
      e.preventDefault();
    }
  });
});

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  setTimeout(initializeApp, 100);
}

// Initialize when window loads
window.addEventListener('load', () => {
  if (!isInitialized) {
    setTimeout(initializeApp, 200);
  }
});

// Update admin controls visibility
async function updateAdminControlsVisibility() {
  const currentUser = window.authFunctions?.getCurrentUser?.();
  let isAdmin = false;
  
  if (currentUser) {
    // Check localStorage first (updated by auth.js)
    const userData = window.authFunctions?.getCurrentUserData?.();
    if (userData && userData.role === 'administrador') {
      isAdmin = true;
    } else if (window.firestoreManager) {
      // Fallback to Firestore check
      try {
        const adminDoc = await window.firestoreManager.getDocument('admin', currentUser.uid);
        isAdmin = adminDoc.exists();
      } catch (error) {
        console.log('Error checking admin status:', error);
        isAdmin = false;
      }
    }
  }
  
  // Show/hide main admin controls (only on inicio)
  const adminControls = document.getElementById('adminControls');
  if (adminControls) {
    adminControls.style.display = (isAdmin && currentSection === 'inicio') ? 'block' : 'none';
  }
  
  // Show/hide section add buttons (on all sections except inicio)
  const sectionAddBtn = document.getElementById('sectionAddProductBtn');
  if (sectionAddBtn) {
    sectionAddBtn.style.display = (isAdmin && currentSection !== 'inicio') ? 'block' : 'none';
  }
  
  // Update product admin buttons visibility
  const adminButtons = document.querySelectorAll('.admin-actions');
  adminButtons.forEach(btn => {
    btn.style.display = isAdmin ? 'flex' : 'none';
  });
}

// Carousel autoplay management
window.minimalCarousel = {
  autoplayInterval: null,
  autoplayEnabled: true,
  
  startAutoplay() {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
    }
    
    this.autoplayEnabled = true;
    this.autoplayInterval = setInterval(() => {
      if (this.autoplayEnabled && currentSection === 'inicio') {
        const nextBtn = document.getElementById('minimalCarouselNext');
        if (nextBtn) {
          nextBtn.click();
        }
      }
    }, 4000); // Change slide every 4 seconds
    
    console.log('🎠 Carousel autoplay started');
  },
  
  stopAutoplay() {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
      this.autoplayInterval = null;
    }
    this.autoplayEnabled = false;
    console.log('🛑 Carousel autoplay stopped');
  },
  
  pauseAutoplay() {
    this.autoplayEnabled = false;
  },
  
  resumeAutoplay() {
    this.autoplayEnabled = true;
  }
};

// Initialize carousel autoplay when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Start autoplay by default
  setTimeout(() => {
    if (window.carouselAutoplayEnabled !== false) {
      window.minimalCarousel.startAutoplay();
    }
  }, 2000);
  
  // Pause autoplay on hover
  const carouselContainer = document.querySelector('.minimal-carousel-container');
  if (carouselContainer) {
    carouselContainer.addEventListener('mouseenter', () => {
      window.minimalCarousel.pauseAutoplay();
    });
    
    carouselContainer.addEventListener('mouseleave', () => {
      window.minimalCarousel.resumeAutoplay();
    });
  }
});

// Autocomplete functions
function showAutocompleteSuggestions(query) {
  const autocompleteContainer = document.getElementById('autocomplete-results');
  if (!autocompleteContainer) return;

  const normalizedQuery = removeAccents(query.toLowerCase());
  const suggestions = new Set();
  const maxSuggestions = 8;

  // Search in products
  productos.forEach(product => {
    const matches = [];
    
    // Check product name
    if (removeAccents(product.nombre.toLowerCase()).includes(normalizedQuery)) {
      matches.push({
        text: product.nombre,
        type: 'nombre',
        category: product.categoria,
        price: product.precio,
        status: product.status
      });
    }
    
    // Check color
    if (product.color && removeAccents(product.color.toLowerCase()).includes(normalizedQuery)) {
      matches.push({
        text: product.color,
        type: 'color',
        category: product.categoria,
        price: product.precio,
        status: product.status
      });
    }
    
    // Check fabric/material
    if (product.tela && removeAccents(product.tela.toLowerCase()).includes(normalizedQuery)) {
      matches.push({
        text: product.tela,
        type: 'tela',
        category: product.categoria,
        price: product.precio,
        status: product.status
      });
    }
    
    // Check status
    if (product.status && removeAccents(product.status.toLowerCase()).includes(normalizedQuery)) {
      matches.push({
        text: product.status,
        type: 'estado',
        category: product.categoria,
        price: product.precio,
        status: product.status
      });
    }
    
    // Check category
    if (product.categoria && removeAccents(product.categoria.toLowerCase()).includes(normalizedQuery)) {
      matches.push({
        text: product.categoria,
        type: 'categoria',
        category: product.categoria,
        price: product.precio,
        status: product.status
      });
    }
    
    // Check price range
    const priceStr = product.precio.toString();
    if (priceStr.includes(query)) {
      matches.push({
        text: `$${product.precio.toLocaleString('es-AR')}`,
        type: 'precio',
        category: product.categoria,
        price: product.precio,
        status: product.status
      });
    }
    
    matches.forEach(match => {
      if (suggestions.size < maxSuggestions) {
        const suggestionKey = `${match.text}-${match.type}`;
        if (!Array.from(suggestions).some(s => s.key === suggestionKey)) {
          suggestions.add({ ...match, key: suggestionKey });
        }
      }
    });
  });

  // Convert Set to Array and sort
  const sortedSuggestions = Array.from(suggestions).sort((a, b) => {
    // Prioritize exact matches
    const aExact = removeAccents(a.text.toLowerCase()) === normalizedQuery;
    const bExact = removeAccents(b.text.toLowerCase()) === normalizedQuery;
    if (aExact && !bExact) return -1;
    if (!aExact && bExact) return 1;
    
    // Then by type priority
    const typePriority = { 'nombre': 1, 'categoria': 2, 'color': 3, 'tela': 4, 'estado': 5, 'precio': 6 };
    return (typePriority[a.type] || 7) - (typePriority[b.type] || 7);
  });

  if (sortedSuggestions.length === 0) {
    autocompleteContainer.innerHTML = '<div class="autocomplete-no-results">No se encontraron sugerencias</div>';
  } else {
    autocompleteContainer.innerHTML = sortedSuggestions.map(suggestion => {
      const highlightedText = highlightMatch(suggestion.text, query);
      const typeLabels = {
        'nombre': 'Producto',
        'color': 'Color',
        'tela': 'Material',
        'estado': 'Estado',
        'categoria': 'Categoría',
        'precio': 'Precio'
      };
      
      return `
        <div class="autocomplete-item" data-value="${suggestion.text}" data-type="${suggestion.type}">
          <div class="suggestion-details">
            <div class="suggestion-name">${highlightedText}</div>
            <div class="suggestion-category">${typeLabels[suggestion.type]} • ${suggestion.category}</div>
          </div>
          <div class="suggestion-icon">
            <i class="fas fa-search"></i>
          </div>
        </div>
      `;
    }).join('');
    
    // Add click listeners to suggestions
    autocompleteContainer.querySelectorAll('.autocomplete-item').forEach(item => {
      item.addEventListener('click', function() {
        const value = this.dataset.value;
        const type = this.dataset.type;
        
        // If it's a product name, go to details page
        if (type === 'nombre') {
          const product = productos.find(p => p.nombre === value);
          if (product) {
            window.location.href = `details.html?id=${encodeURIComponent(product.id)}`;
            return;
          }
        }
        
        // Otherwise, search for the term - redirect to index.html
        window.location.href = `index.html?search=${encodeURIComponent(value)}`;
      });
    });
  }

  autocompleteContainer.style.display = 'block';
  autocompleteContainer.setAttribute('aria-expanded', 'true');
}

function hideAutocompleteSuggestions() {
  const autocompleteContainer = document.getElementById('autocomplete-results');
  if (autocompleteContainer) {
    autocompleteContainer.style.display = 'none';
    autocompleteContainer.setAttribute('aria-expanded', 'false');
  }
}

function highlightMatch(text, query) {
  if (!query) return text;
  
  const normalizedText = removeAccents(text.toLowerCase());
  const normalizedQuery = removeAccents(query.toLowerCase());
  const index = normalizedText.indexOf(normalizedQuery);
  
  if (index === -1) return text;
  
  const before = text.substring(0, index);
  const match = text.substring(index, index + query.length);
  const after = text.substring(index + query.length);
  
  return `${before}<strong>${match}</strong>${after}`;
}

function updateHighlight(suggestions) {
  suggestions.forEach((item, index) => {
    if (index === currentHighlightIndex) {
      item.classList.add('highlighted');
    } else {
      item.classList.remove('highlighted');
    }
  });
}

// Export global functions
window.showSection = showSection;
window.applyFilters = applyFilters;
window.toggleMenu = toggleMenu;
window.toggleSearch = toggleSearch;
window.toggleCart = toggleCart;
window.closeCart = closeCart;
window.closeAllDropdowns = closeAllDropdowns;
window.addProductToCart = addProductToCart;
window.updateAdminControlsVisibility = updateAdminControlsVisibility;
window.goBackFromSearch = goBackFromSearch;
window.clearFilters = clearFilters;
window.clearLocalStorageQuota = clearLocalStorageQuota;
window.showAutocompleteSuggestions = showAutocompleteSuggestions;
window.hideAutocompleteSuggestions = hideAutocompleteSuggestions;
window.showProductsLoading = showProductsLoading;
window.hideProductsLoading = hideProductsLoading;