// script.js - Versión corregida y optimizada
let currentSearch = '';
let currentColorFilter = '';
let currentTelaFilter = '';
let currentStatusFilter = '';
let currentSection = 'inicio';
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let currentPage = 1;
let isInitialized = false; // Flag para evitar inicialización múltiple

// CONFIGURACIÓN DE PRODUCTOS POR PÁGINA
const ITEMS_PER_PAGE = {
  mobile: 6,    // ≤ 768px
  tablet: 9,    // 769px - 1024px
  desktop: 18   // ≥ 1025px
};

// Función para obtener items por página según el tamaño de pantalla
function getItemsPerPage() {
  const width = window.innerWidth;
  if (width <= 768) return ITEMS_PER_PAGE.mobile;
  if (width <= 1024) return ITEMS_PER_PAGE.tablet;
  return ITEMS_PER_PAGE.desktop;
}

/**
 * Elimina los acentos de una cadena de texto para búsquedas flexibles.
 * @param {string} str La cadena de entrada.
 * @returns {string} La cadena sin acentos.
 */
function removeAccents(str) {
  if (!str) return '';
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
// Función para cerrar todos los overlays/dropdowns
function closeAllDropdowns() {
  const elements = {
    mobileMenu: document.getElementById('mobileMenu'),
    searchDropdown: document.getElementById('searchDropdown'),
    cartDropdown: document.getElementById('cartDropdown'),
    menuOverlay: document.getElementById('menuOverlay'),
    menuToggle: document.getElementById('menuToggle')
  };

  // Cerrar menú móvil
  if (elements.mobileMenu?.classList.contains('active')) {
    elements.mobileMenu.classList.remove('active');
  }

  // Cerrar búsqueda
  if (elements.searchDropdown?.classList.contains('active')) {
    elements.searchDropdown.classList.remove('active');
  }

  // Cerrar carrito
  if (elements.cartDropdown?.classList.contains('active')) {
    elements.cartDropdown.classList.remove('active');
  }

  // Cerrar overlay
  if (elements.menuOverlay?.classList.contains('active')) {
    elements.menuOverlay.classList.remove('active');
  }

  // Reset menu toggle
  if (elements.menuToggle?.classList.contains('active')) {
    elements.menuToggle.classList.remove('active');
  }

  // Remover clases de scroll bloqueado
  document.body.classList.remove('menu-open', 'cart-open');
}

// Función para mostrar/ocultar botón de volver
function updateBackButton() {
  let backButton = document.getElementById('backButton');

  if (currentSearch.trim() !== '') {
    if (!backButton) {
      backButton = document.createElement('button');
      backButton.id = 'backButton';
      backButton.className = 'back-button';
      backButton.innerHTML = '<i class="fas fa-arrow-left"></i> Volver';
      backButton.onclick = clearSearch;

      const sectionTitle = document.getElementById('sectionTitle');
      if (sectionTitle) {
        sectionTitle.parentNode.insertBefore(backButton, sectionTitle);
      }
    }
    backButton.style.display = 'block';
  } else {
    if (backButton) {
      backButton.style.display = 'none';
    }
  }
}

// Función para limpiar solo la búsqueda
function clearSearch() {
  currentSearch = '';
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.value = '';
  }
  currentPage = 1;

  // Limpiar parámetro de búsqueda de la URL
  const url = new URL(window.location);
  url.searchParams.delete('search');
  url.searchParams.delete('pag');
  window.history.replaceState({}, '', url);

  clearFilters();
}

// Función helper para obtener el nombre de display de las secciones
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

// Función para mostrar secciones
function showSection(seccion) {
  // Limpiar todos los filtros y la búsqueda al cambiar de sección
  currentSearch = '';
  currentColorFilter = '';
  currentTelaFilter = '';
  currentStatusFilter = '';

  // Limpiar los campos de la interfaz de usuario
  const searchInput = document.getElementById('searchInput');
  if (searchInput) searchInput.value = '';
  
  const colorFilter = document.getElementById('colorFilter');
  if (colorFilter) colorFilter.value = '';
  
  const telaFilter = document.getElementById('telaFilter');
  if (telaFilter) telaFilter.value = '';

  const statusFilter = document.getElementById('statusFilter');
  if (statusFilter) statusFilter.value = '';

  // Actualizar la URL con el hash de la sección y limpiar otros parámetros
  const url = new URL(window.location);
  url.searchParams.delete('search');
  url.searchParams.delete('pag');
  url.hash = seccion;
  // Usamos replaceState para actualizar la URL sin recargar la página.
  window.history.replaceState({ section: seccion }, ``, url);
  updateBackButton();

  currentSection = seccion;
  currentPage = 1;
  
  const sections = document.querySelectorAll('.section');
  sections.forEach(sec => sec.classList.remove('active'));

  const targetSection = document.getElementById(seccion);
  if (targetSection) {
    targetSection.classList.add('active');
  }

  // Actualizar título de sección solo si no hay búsqueda activa
  const sectionTitle = document.getElementById('sectionTitle');
  if (currentSearch.trim() === '' && sectionTitle) {
    // 1. Aplicar clase para que el título se desvanezca
    sectionTitle.classList.add('fade-out');

    // 2. Esperar a que la animación de salida termine
    setTimeout(() => {
      // 3. Cambiar el texto
      sectionTitle.textContent = getSectionDisplayName(seccion);
      // 4. Quitar la clase para que el título aparezca de nuevo
      sectionTitle.classList.remove('fade-out');
    }, 300); // NOTA: Este tiempo debe coincidir con la duración de la transición en CSS
  }

  // Actualizar clase activa para elementos del menú
  const menuItems = document.querySelectorAll('.menu-list li');
  menuItems.forEach(item => {
    const link = item.querySelector('a');
    if (link && link.getAttribute('onclick')?.includes(`showSection('${seccion}')`)) {
      item.classList.add('active-section');
    } else {
      item.classList.remove('active-section');
    }
  });

  applyFilters();
  closeAllDropdowns();

  // Scroll to the title after changing section
  const sectionTitleElement = document.getElementById('sectionTitle');
  if (sectionTitleElement) {
    setTimeout(() => {
      sectionTitleElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150); // Small delay to ensure DOM is updated
  }
}

// Funciones de toggle para menús
function toggleMenu() {
  const mobileMenu = document.getElementById('mobileMenu');
  const menuToggle = document.getElementById('menuToggle');
  const menuOverlay = document.getElementById('menuOverlay');
  const searchDropdown = document.getElementById('searchDropdown');
  const cartDropdown = document.getElementById('cartDropdown');

  // Cerrar otros dropdowns
  if (searchDropdown?.classList.contains('active')) {
    searchDropdown.classList.remove('active');
  }
  if (cartDropdown?.classList.contains('active')) {
    cartDropdown.classList.remove('active');
    document.body.classList.remove('cart-open');
  }

  // Toggle menú
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

function toggleSearch() {
  const searchDropdown = document.getElementById('searchDropdown');
  const searchInput = document.getElementById('searchInput');
  const menuOverlay = document.getElementById('menuOverlay');
  const mobileMenu = document.getElementById('mobileMenu');
  const cartDropdown = document.getElementById('cartDropdown');
  const menuToggle = document.getElementById('menuToggle');

  // Cerrar otros dropdowns
  if (mobileMenu?.classList.contains('active')) {
    mobileMenu.classList.remove('active');
    menuToggle?.classList.remove('active');
    document.body.classList.remove('menu-open');
  }
  if (cartDropdown?.classList.contains('active')) {
    cartDropdown.classList.remove('active');
    document.body.classList.remove('cart-open');
  }

  // Toggle búsqueda
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

function toggleCart() {
  const cartDropdown = document.getElementById('cartDropdown');
  const menuOverlay = document.getElementById('menuOverlay');
  const mobileMenu = document.getElementById('mobileMenu');
  const searchDropdown = document.getElementById('searchDropdown');
  const menuToggle = document.getElementById('menuToggle');

  // Cerrar otros dropdowns
  if (mobileMenu?.classList.contains('active')) {
    mobileMenu.classList.remove('active');
    menuToggle?.classList.remove('active');
    document.body.classList.remove('menu-open');
  }
  if (searchDropdown?.classList.contains('active')) {
    searchDropdown.classList.remove('active');
  }

  // Toggle carrito
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

// Enhanced product creation function integration
function createProductElement(prod) {
  // Always use this function, ignore enhanced version for now
  const div = document.createElement('div');
  div.className = 'product';
  if (prod.status) {
    div.classList.add(`product-status-${prod.status}`);
  }
  div.style.cursor = 'pointer';
  // Check if user is admin
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
      <p class="product-price">$${prod.precio.toLocaleString('es-AR')}</p>
      <div class="like-container">
        <button class="like-btn" data-product-id="${prod.id}" title="Me gusta">
          <img src="/img-galery/heartproduct.svg" alt="Like" class="heart-icon" />
        </button>
        <span class="like-count" data-product-id="${prod.id}">${prod.likesCount || 0}</span>
      </div>
      <div class="product-actions">
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

  if (prod.color && prod.tela) {
    const tag = document.createElement('div');
    tag.className = 'color-fabric-tag';
    
    // Mapa de colores
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

// FUNCIÓN PRINCIPAL PARA APLICAR FILTROS Y PAGINACIÓN - CORREGIDA
function applyFilters(page = 1) {
  currentPage = page;

  // Actualizar URL con paginación
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

  // Manejar visibilidad del carrusel
  const hasActiveFilters = currentSearch.trim() !== '' || currentColorFilter !== '' || currentTelaFilter !== '' || currentStatusFilter !== '';
  if (carouselSection) {
    if (hasActiveFilters || currentSection !== 'inicio') {
      carouselSection.style.display = 'none';
    } else {
      carouselSection.style.display = 'block';
    }
  }

  // Guardar scroll en móviles
  const isMobile = window.innerWidth <= 768;
  const scrollY = window.scrollY;

  // Limpiar contenedores
  container.innerHTML = "";
  infoFooter.innerHTML = "";

  // FILTRAR PRODUCTOS
  const hasSearch = currentSearch.trim() !== '';

  // Lógica de búsqueda avanzada: permite buscar por estado (ej: "moños nuevos")
  const statusMap = {
    'nuevo': 'nuevo', 'nuevos': 'nuevo',
    'oferta': 'oferta', 'ofertas': 'oferta',
    'agotado': 'agotado', 'agotados': 'agotado'
  };
  
  let searchStatus = '';
  const searchWords = removeAccents(currentSearch.toLowerCase()).split(' ').filter(w => w.length > 0);
  const remainingSearchWords = [];

  if (hasSearch) {
    searchWords.forEach(word => {
      if (statusMap[word]) {
        searchStatus = statusMap[word];
      } else {
        remainingSearchWords.push(word);
      }
    });
  }
  const finalSearchTerm = remainingSearchWords.join(' ');

  let filteredProducts = productos.filter(p => {
    // Búsqueda por texto (sin acentos)
    const searchMatch = !hasSearch || !finalSearchTerm ||
      removeAccents(p.nombre.toLowerCase()).includes(finalSearchTerm) || 
      removeAccents(p.descripcion.toLowerCase()).includes(finalSearchTerm);
    
    // Filtros de dropdown
    const colorMatch = currentColorFilter === '' || p.color === currentColorFilter;
    const fabricMatch = currentTelaFilter === '' || p.tela === currentTelaFilter;
    
    // Filtro de estado (la búsqueda por texto tiene prioridad)
    const effectiveStatusFilter = searchStatus || currentStatusFilter;
    const statusMatch = effectiveStatusFilter === '' || (p.status || 'none') === effectiveStatusFilter;

    // Si hay una búsqueda activa, se ignoran las categorías y se busca en todos los productos.
    if (hasSearch) {
      return searchMatch && colorMatch && fabricMatch && statusMatch;
    }

    // Si NO hay búsqueda, se aplica el filtro de sección además de los otros.
    let sectionMatch = false;
    if (currentSection === 'inicio') {
      sectionMatch = true; // Mostrar todos en la página de inicio
    } else if (currentSection === 'monos') {
      sectionMatch = p.categoria === 'monos' || p.categoria === 'setmonos';
    } else {
      sectionMatch = p.categoria === currentSection;
    }

    return sectionMatch && colorMatch && fabricMatch && statusMatch;
  });

  // PAGINACIÓN
  const itemsPerPage = getItemsPerPage();
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  // Mostrar mensaje si no hay resultados
  if (filteredProducts.length === 0) {
    const noResultsMessage = document.createElement('div');
    noResultsMessage.className = 'no-results-message';
    noResultsMessage.innerHTML = `
      <p>Lo sentimos, no se encontraron productos que coincidan con tu búsqueda o filtros.</p>
      <p>Intenta ajustar tu búsqueda o <a href="#" onclick="clearFilters(); return false;">limpiar todos los filtros</a>.</p>
    `;
    container.appendChild(noResultsMessage);
    return;
  }

  // CREAR Y MOSTRAR PRODUCTOS CON EVENT LISTENERS
  paginatedProducts.forEach(prod => {
    const productElement = createProductElement(prod);
    
    // Event listener para navegar a detalles
    if (prod.status !== 'agotado') {
      productElement.addEventListener('click', (e) => {
        if (!e.target.closest('.add-to-cart-btn') && !e.target.closest('.like-btn') && !e.target.closest('.admin-actions')) {
          window.location.href = `details/details.html?id=${prod.id}`;
        }
      });
    }

    // Event listener específico para el botón del carrito
    const cartBtn = productElement.querySelector('.add-to-cart-btn');
    if (cartBtn && prod.status !== 'agotado') {
      cartBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        addProductToCart(prod.id, cartBtn);
      });
    }

    // Event listener para el contenedor de like
    const likeContainer = productElement.querySelector('.like-container');
    if (likeContainer) {
      likeContainer.addEventListener('click', (e) => {
        e.stopPropagation();
        const likeBtn = likeContainer.querySelector('.like-btn');
        toggleProductLike(prod.id, likeBtn);
      });
    }

    // Event listeners para botones de admin
    const editBtn = productElement.querySelector('.edit-product-btn');
    const deleteBtn = productElement.querySelector('.delete-product-btn');
    
    if (editBtn && window.editProduct) {
      editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        window.editProduct(prod.id);
      });
    }
    
    if (deleteBtn && window.deleteProduct) {
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        window.deleteProduct(prod.id);
      });
    }

    container.appendChild(productElement);
    
    // Load like count and status for this product
    loadProductLikeData(prod.id);
  });
  
  // CREAR PAGINACIÓN si hay más de una página
  if (totalPages > 1) {
    const pagination = document.createElement('div');
    pagination.className = 'pagination';

    // Botón anterior
    if (currentPage > 1) {
      const prevBtn = document.createElement('button');
      prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
      prevBtn.onclick = (e) => {
        e.preventDefault();
        applyFilters(currentPage - 1);
        scrollToTop();
      };
      pagination.appendChild(prevBtn);
    }

    // Números de página (máximo 3 botones visibles)
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
        scrollToTop();
      };
      pagination.appendChild(btn);
    }

    // Botón siguiente
    if (currentPage < totalPages) {
      const nextBtn = document.createElement('button');
      nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
      nextBtn.onclick = (e) => {
        e.preventDefault();
        applyFilters(currentPage + 1);
        scrollToTop();
      };
      pagination.appendChild(nextBtn);
    }

    infoFooter.appendChild(pagination);
  }

  // Resumen de paginación
  const summary = document.createElement('div');
  summary.className = 'pagination-summary';
  const startProduct = startIndex + 1;
  const endProduct = startIndex + paginatedProducts.length;
  summary.textContent = `Mostrando ${startProduct} - ${endProduct} de ${filteredProducts.length} productos`;
  infoFooter.appendChild(summary);

  // Restaurar scroll en móvil
  if (isMobile) {
    window.scrollTo({
      top: scrollY,
      behavior: 'instant'
    });
  }
}

// Función para hacer scroll suave al top
function scrollToTop() {
  const sectionTitle = document.getElementById('sectionTitle');
  if (sectionTitle) {
    sectionTitle.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// Función para limpiar todos los filtros
function clearFilters() {
  currentSearch = '';
  currentColorFilter = '';
  currentTelaFilter = '';
  currentStatusFilter = '';
  currentPage = 1;

  const searchInput = document.getElementById('searchInput');
  const colorFilter = document.getElementById('colorFilter');
  const telaFilter = document.getElementById('telaFilter');

  if (searchInput) searchInput.value = '';
  if (colorFilter) colorFilter.value = '';
  if (telaFilter) telaFilter.value = '';
  const statusFilter = document.getElementById('statusFilter');
  if (statusFilter) statusFilter.value = '';

  // Limpiar parámetros de URL
  const url = new URL(window.location);
  url.searchParams.delete('search');
  url.searchParams.delete('pag');
  window.history.replaceState({}, '', url);

  // Restaurar título original de sección
  const sectionTitle = document.getElementById('sectionTitle');
  const searchTermDisplay = document.getElementById('searchTermDisplay');
  if (sectionTitle && searchTermDisplay) {
    sectionTitle.textContent = getSectionDisplayName(currentSection);
    searchTermDisplay.style.display = 'none';
  }

  updateBackButton();
  applyFilters();
}

// FUNCIÓN PARA AUTOCOMPLETADO DE BÚSQUEDA
function setupAutocomplete(inputElement) {
  const resultsContainer = document.getElementById('autocomplete-results');
  let activeSuggestionIndex = -1;

  inputElement.addEventListener('input', () => {
    const query = inputElement.value.trim();
    const normalizedQuery = removeAccents(query.toLowerCase());
    
    if (normalizedQuery.length < 2) { // Empezar a buscar después de 2 caracteres
      resultsContainer.innerHTML = '';
      resultsContainer.style.display = 'none';
      inputElement.setAttribute('aria-expanded', 'false');
      return;
    }

    // Recolectar sugerencias como objetos para tener más datos (nombre y categoría)
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
        
        // Resaltar el texto que coincide en la sugerencia
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
          inputElement.value = suggestion.nombre; // Usar el nombre original sin HTML
          resultsContainer.style.display = 'none';
          inputElement.setAttribute('aria-expanded', 'false');
          // Disparar el evento 'input' para que la búsqueda se aplique
          inputElement.dispatchEvent(new Event('input', { bubbles: true }));
        });
        resultsContainer.appendChild(item);
      });
      resultsContainer.style.display = 'block';
      inputElement.setAttribute('aria-expanded', 'true');
      activeSuggestionIndex = -1;
    } else {
      // Mostrar mensaje de "no resultados" si no hay sugerencias
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

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      items[activeSuggestionIndex]?.classList.remove('highlighted');
      activeSuggestionIndex = (activeSuggestionIndex + 1) % items.length;
      items[activeSuggestionIndex].classList.add('highlighted');
      inputElement.setAttribute('aria-activedescendant', items[activeSuggestionIndex].id);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      items[activeSuggestionIndex]?.classList.remove('highlighted');
      activeSuggestionIndex = (activeSuggestionIndex - 1 + items.length) % items.length;
      items[activeSuggestionIndex].classList.add('highlighted');
      inputElement.setAttribute('aria-activedescendant', items[activeSuggestionIndex].id);
    } else if (e.key === 'Enter' && activeSuggestionIndex > -1) {
      e.preventDefault(); // Prevenir que se cierre el dropdown de búsqueda
      items[activeSuggestionIndex].click();
    } else if (e.key === 'Escape') {
      resultsContainer.style.display = 'none';
      inputElement.setAttribute('aria-expanded', 'false');
    }
  });
}

// FUNCIONES DEL CARRITO
function addProductToCart(productId, buttonElement) {
  const product = productos.find(p => p.id === productId);
  if (product) {
    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
      existingItem.quantity++;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    renderCart();

    // Animación de producto agregado
    if (buttonElement) {
      const productElement = buttonElement.closest('.product');
      if (productElement) {
        productElement.classList.add('added-to-cart-glow');
        setTimeout(() => {
          productElement.classList.remove('added-to-cart-glow');
        }, 700);

        // Mostrar texto "Agregado"
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
  cart = cart.filter(item => item.id !== productId);
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
  renderCart();
}

function updateCartItemQuantity(productId, change) {
  const item = cart.find(item => item.id === productId);
  if (item) {
    item.quantity += change;
    if (item.quantity <= 0) {
      removeProductFromCart(productId);
    } else {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }
  updateCartCount();
  renderCart();
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

  cartTotalSpan.textContent = total.toLocaleString('es-AR');

  // Usar setTimeout para asegurar que los elementos estén en el DOM
  setTimeout(() => {
    // Event listeners para botones del carrito
    const removeButtons = cartItemsContainer.querySelectorAll('.remove-item-btn');
    const quantityButtons = cartItemsContainer.querySelectorAll('.quantity-btn');
    
    removeButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        const productId = parseInt(e.currentTarget.dataset.id);
        removeProductFromCart(productId);
      });
    });

    quantityButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        const productId = parseInt(e.currentTarget.dataset.id);
        const change = parseInt(e.currentTarget.dataset.change);
        updateCartItemQuantity(productId, change);
      });
    });
  }, 0);
}

function sendWhatsAppMessage() {
  const phoneNumber = '5491166135708';
  let message = "Hola, quiero comprar estos productos:\n";

  if (cart.length === 0) {
    message = "Hola, estoy interesado en sus productos, pero mi carrito está vacío.";
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
    
    // Add purchase to user history if user is logged in
    if (window.addPurchaseToHistory && cart.length > 0) {
      const purchaseProducts = cart.map(item => ({
        id: item.id,
        nombre: item.nombre,
        precio: item.precio,
        quantity: item.quantity,
        imagen: item.imagen
      }));
      
      const total = cart.reduce((sum, item) => sum + (item.precio * item.quantity), 0);
      window.addPurchaseToHistory(purchaseProducts, total);
    }
  }

  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, '_blank');
}

// Función para manejar parámetros de URL
function handleUrlParameters() {
  const urlParams = new URLSearchParams(window.location.search);
  const hash = window.location.hash.substring(1); // Get section from hash

  const searchParam = urlParams.get('search');
  const pageParam = urlParams.get('pag');

  // Priority 1: Search parameter
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

    // Si hay una búsqueda, nos aseguramos de que no haya un hash de sección en la URL
    const url = new URL(window.location);
    if (url.hash) {
      url.hash = '';
      window.history.replaceState({}, '', url);
    }

    updateBackButton();
    applyFilters(1);
    return;
  }

  // Priority 2: Section from hash in URL
  if (hash && ['inicio', 'lazos', 'monos', 'colitas', 'scrunchies', 'setmonos'].includes(hash)) {
    showSection(hash);
    return;
  }
  
  // Priority 3: Pagination parameter (less likely to be used alone)
  if (pageParam) {
    currentPage = parseInt(pageParam) || 1;
    applyFilters(currentPage);
    return;
  }

  // Default behavior: show 'inicio'
  showSection('inicio');
}

// INICIALIZACIÓN DE LA APLICACIÓN - CORREGIDA
function initializeApp() {
  if (isInitialized) return; // Evitar inicialización múltiple
  isInitialized = true;

  console.log('Inicializando aplicación...');

  // Verificar que productos esté disponible
  if (typeof productos === 'undefined') {
    console.error('Variable productos no está definida');
    setTimeout(initializeApp, 100);
    return;
  }

  // Manejar parámetros de URL antes de renderizar productos
  handleUrlParameters();

  // Inicializar contador del carrito
  updateCartCount();

  // Event listeners para navegación
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

  // Asignar event listeners solo una vez
  if (elements.menuToggle && !elements.menuToggle.hasEventListener) {
    elements.menuToggle.addEventListener('click', toggleMenu);
    elements.menuToggle.hasEventListener = true;
  }
  
  if (elements.searchToggle && !elements.searchToggle.hasEventListener) {
    elements.searchToggle.addEventListener('click', toggleSearch);
    elements.searchToggle.hasEventListener = true;
  }
  
  if (elements.searchClose && !elements.searchClose.hasEventListener) {
    elements.searchClose.addEventListener('click', toggleSearch);
    elements.searchClose.hasEventListener = true;
  }
  
  if (elements.cartToggle && !elements.cartToggle.hasEventListener) {
    elements.cartToggle.addEventListener('click', toggleCart);
    elements.cartToggle.hasEventListener = true;
  }
  
  if (elements.cartClose && !elements.cartClose.hasEventListener) {
    elements.cartClose.addEventListener('click', toggleCart);
    elements.cartClose.hasEventListener = true;
  }
  
  if (elements.checkoutBtn && !elements.checkoutBtn.hasEventListener) {
    elements.checkoutBtn.addEventListener('click', sendWhatsAppMessage);
    elements.checkoutBtn.hasEventListener = true;
  }
  
  if (elements.menuOverlay && !elements.menuOverlay.hasEventListener) {
    elements.menuOverlay.addEventListener('click', closeAllDropdowns);
    elements.menuOverlay.hasEventListener = true;
  }

  // Ocultar autocompletado al hacer clic fuera
  document.addEventListener('click', function(e) {
    const searchContainer = document.querySelector('.search-container');
    if (searchContainer && !searchContainer.contains(e.target)) {
      const resultsContainer = document.getElementById('autocomplete-results');
      if (resultsContainer) {
        resultsContainer.style.display = 'none';
        document.getElementById('searchInput')?.setAttribute('aria-expanded', 'false');
      }
    }
  });

  // Funcionalidad de búsqueda
  if (elements.searchInput && !elements.searchInput.hasEventListener) {
    setupAutocomplete(elements.searchInput); // Configurar autocompletado
    elements.searchInput.addEventListener('input', function (e) {
      currentSearch = e.target.value;
      currentPage = 1;

      const url = new URL(window.location);
      if (currentSearch.trim()) {
        url.searchParams.set('search', currentSearch);
      } else {
        url.searchParams.delete('search');
      }
      url.searchParams.delete('pag');
      url.hash = ''; // Limpiar el hash al buscar
      window.history.replaceState({}, '', url);

      applyFilters();

      const sectionTitle = document.getElementById('sectionTitle');
      const searchTermDisplay = document.getElementById('searchTermDisplay');
      if (sectionTitle && searchTermDisplay) {
        if (currentSearch.trim()) {
          sectionTitle.textContent = 'Resultados de Búsqueda';
          searchTermDisplay.textContent = `"${currentSearch}"`;
          searchTermDisplay.style.display = 'block';
        } else {
          sectionTitle.textContent = getSectionDisplayName(currentSection);
          searchTermDisplay.style.display = 'none';
        }
      }
      updateBackButton();
    });

    elements.searchInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        toggleSearch();
      }
    });

    elements.searchInput.hasEventListener = true;
  }

  // Funcionalidad de filtros
  if (elements.colorFilter && !elements.colorFilter.hasEventListener) {
    elements.colorFilter.addEventListener('change', function (e) {
      currentColorFilter = e.target.value;
      currentPage = 1;
      applyFilters();
    });
    elements.colorFilter.hasEventListener = true;
  }

  if (elements.telaFilter && !elements.telaFilter.hasEventListener) {
    elements.telaFilter.addEventListener('change', function (e) {
      currentTelaFilter = e.target.value;
      currentPage = 1;
      applyFilters();
    });
    elements.telaFilter.hasEventListener = true;
  }

  if (elements.statusFilter && !elements.statusFilter.hasEventListener) {
    elements.statusFilter.addEventListener('change', function (e) {
      currentStatusFilter = e.target.value;
      currentPage = 1;
      applyFilters();
    });
    elements.statusFilter.hasEventListener = true;
  }

  if (elements.clearFiltersBtn && !elements.clearFiltersBtn.hasEventListener) {
    elements.clearFiltersBtn.addEventListener('click', clearFilters);
    elements.clearFiltersBtn.hasEventListener = true;
  }

  // Atajos de teclado globales
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeAllDropdowns();
    }
  });

  // Manejador de redimensionamiento de ventana
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      applyFilters(currentPage);  
    }, 150);
  });

  // Lógica para mostrar/ocultar el botón de "Agregar Producto" para administradores
  const adminControls = document.getElementById('adminControls');
  if (adminControls) {
    const currentUserData = window.authFunctions?.getCurrentUserData?.();
    const isAdmin = currentUserData && currentUserData.role === 'administrador';
    adminControls.style.display = isAdmin ? 'block' : 'none';
  }


  console.log('Aplicación inicializada correctamente');
}

// Función de inicialización para el DOM
function initializeDOM() {
  // Asegurar que todos los elementos estén listos
  const checkElements = () => {
    const requiredElements = [
      'menuToggle', 'searchToggle', 'cartToggle', 
      'searchInput', 'colorFilter', 'telaFilter'
    ];
    
    const allElementsExist = requiredElements.every(id => 
      document.getElementById(id) !== null
    );

    if (allElementsExist && typeof productos !== 'undefined') {
      initializeApp();
    } else {
      setTimeout(checkElements, 50);
    }
  };

  checkElements();
}

// Múltiples puntos de entrada para garantizar inicialización
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeDOM);
} else {
  initializeDOM();
}

// FUNCIONES DE LIKES
async function toggleProductLike(productId, buttonElement) {
  // Verificar si el usuario está logueado
  const currentUser = window.authModal?.currentUser || window.authFunctions?.getCurrentUser?.();
  if (!currentUser) {
    if (window.authModal) {
      window.authModal.showNotification('Debes iniciar sesión para dar like a los productos', 'error');
      window.authModal.showModal();
    } else {
      alert('Debes iniciar sesión para dar like a los productos');
    }
    return;
  }

  if (!window.firestoreManager) {
    console.error('Firestore manager not available');
    return;
  }

  try {
    console.log('Toggling like for product:', productId, 'user:', currentUser.uid);
    const hasLiked = await window.firestoreManager.hasUserLiked(productId, currentUser.uid);
    
    if (hasLiked) {
      await window.firestoreManager.unlikeProduct(productId, currentUser.uid);
      buttonElement.classList.remove('liked');
      console.log('Removed like');
    } else {
      await window.firestoreManager.likeProduct(productId, currentUser.uid);
      buttonElement.classList.add('liked');
      console.log('Added like');
    }
    
    // Actualizar contador inmediatamente
    setTimeout(() => loadProductLikeData(productId), 100);
    
  } catch (error) {
    console.error('Error toggling like:', error);
    if (window.authModal) {
      window.authModal.showNotification('Error al procesar like', 'error');
    }
  }
}

async function loadProductLikeData(productId) {
  if (!window.firestoreManager) {
    console.log('Firestore manager not available for product:', productId);
    return;
  }
  
  try {
    // Cargar contador de likes
    const likeCount = await window.firestoreManager.getProductLikes(productId);
    const countElement = document.querySelector(`.like-count[data-product-id="${productId}"]`);
    if (countElement) {
      countElement.textContent = likeCount;
      console.log(`Loaded ${likeCount} likes for product ${productId}`);
    }
    
    // Verificar si el usuario actual dio like
    const currentUser = window.authModal?.currentUser || window.authFunctions?.getCurrentUser?.();
    if (currentUser) {
      const hasLiked = await window.firestoreManager.hasUserLiked(productId, currentUser.uid);      
      const likeContainer = document.querySelector(`.like-btn[data-product-id="${productId}"]`);
      if (likeContainer) {
        if (hasLiked) {
          likeContainer.classList.add('liked');
        } else {
          likeContainer.classList.remove('liked');
        }
      }
    }
  } catch (error) {
    console.error('Error loading like data for product', productId, ':', error);
  }
}

// Función global para exponer showSection (necesaria para el HTML)
window.showSection = showSection;
window.applyFilters = applyFilters;

// Limpiar funciones duplicadas del HTML
window.addEventListener('load', function() {
  // Remover cualquier renderizado duplicado del HTML
  const sections = ['inicio', 'lazos', 'monos', 'colitas', 'scrunchies', 'setmonos'];
  sections.forEach(sectionId => {
    const section = document.getElementById(sectionId);
    if (section && section.children.length > 0) {
      // Solo limpiar si no hay filtros activos para evitar conflictos
      if (!currentSearch && !currentColorFilter && !currentTelaFilter) {
        section.innerHTML = '';
      }
    }
  });
  
  // Forzar re-renderizado después de limpiar
  if (isInitialized) {
    setTimeout(() => {
      applyFilters(currentPage);
    }, 100);
  }
});