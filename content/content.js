// Minimal Carousel - Versión optimizada y corregida
class MinimalProductCarousel {
  constructor() {
    this.currentSlide = 0;
    this.slides = [];
    this.itemElements = []; // Almacenará los elementos del DOM del carrusel
    this.isInitialized = false;
    this.isMobile = window.innerWidth <= 768;
    this.isTablet = window.innerWidth > 768 && window.innerWidth <= 1024;
    this.isAnimating = false;
    
    // Bind methods
    this.handleResize = this.handleResize.bind(this);
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    this.handleKeydown = this.handleKeydown.bind(this);
    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
    this.handleTouchEnd = this.handleTouchEnd.bind(this);
    this.nextSlide = this.nextSlide.bind(this);
    this.prevSlide = this.prevSlide.bind(this);
    this.goToSlide = this.goToSlide.bind(this);
    
    // Touch variables
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.touchCurrentX = 0;
    this.isDragging = false;
    this.touchThreshold = 50; // Minimum distance for swipe
    
    // Esperar a que los productos estén disponibles
    this.waitForProducts();
  }

  waitForProducts() {
    const checkProducts = () => {
      // Ensure 'productos' is defined and has items
      if (typeof productos !== 'undefined' && productos.length > 0) {
        this.init();
      } else {
        setTimeout(checkProducts, 200);
      }
    };
    checkProducts();
  }

  init() {
    if (this.isInitialized) return;
    
    console.log('Inicializando carrusel minimalista con', productos.length, 'productos');
    
    // Seleccionar productos destacados para el carrusel
    this.selectFeaturedProducts();
    if (this.slides.length === 0) {
      console.warn('No hay productos destacados para el carrusel. Inicialización abortada.');
      return;
    }
    
    this.createCarouselElements();
    this.setupEventListeners();
    this.setupGlobalEventListeners();
    this.setupTouchEvents();
    
    this.isInitialized = true;
    console.log('Carrusel minimalista inicializado exitosamente');
  }

  selectFeaturedProducts() {
    // Seleccionar productos variados para el carrusel
    const categories = ['lazos', 'monos', 'scrunchies', 'setmonos', 'colitas'];
    this.slides = [];
    
    // Obtener 2 productos de cada categoría, máximo 10 productos
    categories.forEach(category => {
      const categoryProducts = productos.filter(p => p.categoria === category).slice(0, 2);
      this.slides.push(...categoryProducts);
    });
    
    // Si tenemos menos de 6 productos, agregar más de cualquier categoría hasta 10
    if (this.slides.length < 6) {
      const existingProductIds = new Set(this.slides.map(p => p.id));
      const remainingProducts = productos.filter(p => !existingProductIds.has(p.id));
      this.slides.push(...remainingProducts.slice(0, 10 - this.slides.length));
    }
    
    // Limitar a 10 productos máximo
    this.slides = this.slides.slice(0, 10);
    
    console.log('Productos seleccionados para carrusel:', this.slides.length);
  }

  createCarouselElements() {
    this.createCarouselShell();
    this.createIndicators();
    this.updateCurrentSlide();
  }

  createCarouselShell() {
    const trackElement = document.getElementById('minimalCarouselTrack');
    if (!trackElement) {
      console.error('Carousel track not found');
      return;
    }

    trackElement.innerHTML = ''; // Limpiar solo una vez
    this.itemElements = []; // Limpiar array de elementos
    const itemsToShow = this.getItemsToShow();

    for (let i = 0; i < itemsToShow; i++) {
      const item = document.createElement('li'); // Use list item for semantics
      item.className = 'minimal-carousel-item';
      item.innerHTML = `
        <img src="" alt="" loading="lazy" onerror="this.src='/img-galery/placeholder.jpg'">
        <div class="product-info-overlay">
          <h3></h3>
          <p></p>
          <button class="view-details-btn">Ver Detalles</button>
        </div>
        <div class="quick-view-overlay">
          <button class="quick-view-btn">Ver</button>
        </div>
        <div class="carousel-counter"></div>
      `;
      trackElement.appendChild(item);
      this.itemElements.push(item);
    }
  }

  updateView() {
    if (this.slides.length === 0 || this.itemElements.length === 0) return;

    const itemsToShow = this.getItemsToShow();
    const centerIndex = Math.floor(itemsToShow / 2);

    this.itemElements.forEach((item, i) => {
      const productIndex = (this.currentSlide - centerIndex + i + this.slides.length * 3) % this.slides.length;
      const product = this.slides[productIndex];

      if (!product) {
        item.style.display = 'none';
        return;
      }
      item.style.display = 'flex';

      // 1. Actualizar clases para estilos y animaciones
      item.classList.remove('main', 'side', 'far');
      item.removeAttribute('aria-current');
      item.setAttribute('tabindex', '-1'); // Not focusable by default

      if (i === centerIndex) {
        item.classList.add('main');
        item.setAttribute('aria-current', 'true');
        item.setAttribute('tabindex', '0'); // The main item is focusable
      } else if (Math.abs(i - centerIndex) === 1) {
        item.classList.add('side');
      } else {
        item.classList.add('far');
      }
      // 2. Actualizar contenido del item
      const img = item.querySelector('img');
      const h3 = item.querySelector('h3');
      const p = item.querySelector('p');
      const viewDetailsBtn = item.querySelector('.view-details-btn');
      const quickViewBtn = item.querySelector('.quick-view-btn');
      const counter = item.querySelector('.carousel-counter');
      // Actualizar solo si es necesario para evitar reflows
      if (img.src !== product.imagen) {
        img.src = product.imagen;
      }
      img.alt = product.nombre;
      h3.textContent = product.nombre;
      p.textContent = `$${product.precio.toLocaleString('es-AR')}`;
      counter.textContent = `${productIndex + 1}/${this.slides.length}`;

      // 3. Actualizar data-attributes para event delegation
      item.dataset.productId = product.id;
      item.setAttribute('role', 'group'); // ARIA role for slide
      item.setAttribute('aria-label', `Diapositiva ${productIndex + 1} de ${this.slides.length}: ${product.nombre}`);
      item.dataset.productIndex = productIndex;
      viewDetailsBtn.dataset.productId = product.id;
      quickViewBtn.dataset.productId = product.id;


    });
  }

  getItemsToShow() {
    if (this.isMobile) return 3; // Mobile: elemento central + 2 elementos laterales
    if (this.isTablet) return 3; // Tablet: igual que mobile
    return 5; // Desktop: elemento central + 4 elementos laterales
  }

  createIndicators() {
    const indicatorsContainer = document.getElementById('minimalCarouselIndicators');
    if (!indicatorsContainer) {
      console.error('Indicators container not found');
      return;
    }
    
    indicatorsContainer.innerHTML = '';
    
    this.slides.forEach((product, index) => {
      const indicator = document.createElement('button');
      indicator.className = `minimal-indicator ${index === 0 ? 'active' : ''}`;
      indicator.setAttribute('aria-label', `Ir a producto ${index + 1}: ${product.nombre}`);
      indicator.setAttribute('data-index', index);
      indicator.setAttribute('tabindex', '0');
      
      indicator.addEventListener('click', (e) => {
        e.preventDefault();
        this.goToSlide(index);
        this.trackCarouselInteraction('indicator_click', product.id, index);
      });
      
      indicatorsContainer.appendChild(indicator);
    });
  }

  setupEventListeners() {
    const prevBtn = document.getElementById('minimalCarouselPrev');
    const nextBtn = document.getElementById('minimalCarouselNext');
    const track = document.getElementById('minimalCarouselTrack');
    const indicatorsContainer = document.getElementById('minimalCarouselIndicators');

    // Botones de navegación
    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.prevSlide();
        this.trackCarouselInteraction('prev_button_click');
      });
    } else {
      console.warn('Previous button not found');
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.nextSlide();
        this.trackCarouselInteraction('next_button_click');
      });
    } else {
      console.warn('Next button not found');
    }

    // Event Delegation para clicks en los items
    if (track) {
      track.addEventListener('click', (e) => {
        const item = e.target.closest('.minimal-carousel-item');
        if (!item) return;

        e.preventDefault();
        const productId = parseInt(item.dataset.productId, 10);
        const productIndex = parseInt(item.dataset.productIndex, 10);

        if (e.target.closest('.view-details-btn') || e.target.closest('.quick-view-btn')) {
          this.openProductDetails(productId);
          this.trackCarouselInteraction('button_click', productId, productIndex);
        } else if (item.classList.contains('main')) {
          this.openProductDetails(productId);
          this.trackCarouselInteraction('main_item_click', productId, productIndex);
        } else {
          this.goToSlide(productIndex);
          this.trackCarouselInteraction('side_item_click', productId, productIndex);
        }
      });
    }

    // Event Delegation para los indicadores
    if (indicatorsContainer) {
      indicatorsContainer.addEventListener('click', (e) => {
        const indicator = e.target.closest('.minimal-indicator');
        if (!indicator) return;

        e.preventDefault();
        const index = parseInt(indicator.dataset.index, 10);
        this.goToSlide(index);
        this.trackCarouselInteraction('indicator_click', this.slides[index]?.id, index);
      });
    }

    // Eventos de mouse (sin auto-slide)
    const carouselContainer = document.querySelector('.minimal-carousel-container');
    if (carouselContainer) {
      // Eventos de mouse para efectos visuales si es necesario
    }
  }

  setupTouchEvents() {
    const carouselContainer = document.querySelector('.minimal-carousel-container');
    if (carouselContainer) {
      carouselContainer.addEventListener('touchstart', this.handleTouchStart, { passive: false });
      carouselContainer.addEventListener('touchmove', this.handleTouchMove, { passive: false });
      carouselContainer.addEventListener('touchend', this.handleTouchEnd, { passive: false });
    } else {
      console.warn('Carousel container not found for touch events');
    }
  }

  setupGlobalEventListeners() {
    // Resize handler
    window.addEventListener('resize', this.handleResize);
    
    // Visibility change handler
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
    
    // Keyboard navigation
    document.addEventListener('keydown', this.handleKeydown);
  }

  handleResize() {
    const wasMobile = this.isMobile;
    const wasTablet = this.isTablet;
    
    this.isMobile = window.innerWidth <= 768;
    this.isTablet = window.innerWidth > 768 && window.innerWidth <= 1024;
    
    // Recreate elements if device type changed
    if (wasMobile !== this.isMobile || wasTablet !== this.isTablet) {
      const currentItemsToShow = this.getItemsToShow();
      if (this.itemElements.length !== currentItemsToShow) {
        this.createCarouselShell();
      }
      this.updateCurrentSlide();
    }
  }

  handleVisibilityChange() {
    // Sin funcionalidad automática, no necesita hacer nada
  }

  handleKeydown(e) {
    if (!this.isCarouselVisible()) return;
    
    switch(e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        this.prevSlide();
        this.trackCarouselInteraction('keyboard_arrow_left');
        break;
      case 'ArrowRight':
        e.preventDefault();
        this.nextSlide();
        this.trackCarouselInteraction('keyboard_arrow_right');
        break;
      case 'Home':
        e.preventDefault();
        this.goToSlide(0);
        this.trackCarouselInteraction('keyboard_home');
        break;
      case 'End':
        e.preventDefault();
        this.goToSlide(this.slides.length - 1);
        this.trackCarouselInteraction('keyboard_end');
        break;
      case 'Enter':
      case ' ':
        if (e.target.classList.contains('minimal-carousel-item')) {
          e.preventDefault();
          const currentProduct = this.slides[this.currentSlide];
          if (currentProduct) {
            this.openProductDetails(currentProduct.id);
            this.trackCarouselInteraction('keyboard_enter_on_item', currentProduct.id, this.currentSlide);
          }
        }
        break;
    }
  }

  handleTouchStart(e) {
    if (e.touches.length > 1) return; // Solo un dedo
    
    this.touchStartX = e.touches[0].clientX;
    this.touchStartY = e.touches[0].clientY;
    this.touchCurrentX = this.touchStartX;
    this.isDragging = true;
  }

  handleTouchMove(e) {
    if (!this.isDragging || e.touches.length > 1) return;
    
    this.touchCurrentX = e.touches[0].clientX;
    const diffX = Math.abs(this.touchCurrentX - this.touchStartX);
    const diffY = Math.abs(e.touches[0].clientY - this.touchStartY);
    
    // Si es más deslizamiento horizontal que vertical, prevenir scroll
    if (diffX > diffY && diffX > 10) {
      e.preventDefault();
    }
  }

  handleTouchEnd(e) {
    if (!this.isDragging) return;
    
    const touchEndX = e.changedTouches[0]?.clientX || this.touchCurrentX;
    const touchEndY = e.changedTouches[0]?.clientY || this.touchStartY;
    
    const diffX = this.touchStartX - touchEndX;
    const diffY = Math.abs(this.touchStartY - touchEndY);
    
    // Solo procesar swipe si es más horizontal que vertical y supera el threshold
    if (Math.abs(diffX) > this.touchThreshold && Math.abs(diffX) > diffY) {
      if (diffX > 0) {
        this.nextSlide();
        this.trackCarouselInteraction('swipe_left');
      } else {
        this.prevSlide();
        this.trackCarouselInteraction('swipe_right');
      }
    }
    
    this.isDragging = false;
  }

  isCarouselVisible() {
    const carouselSection = document.getElementById('carousel-section');
    const inicioSection = document.getElementById('inicio');
    return carouselSection && 
           carouselSection.style.display !== 'none' && 
           inicioSection && 
           inicioSection.classList.contains('active');
  }

  goToSlide(index) {
    if (index < 0 || index >= this.slides.length || this.isAnimating || this.slides.length === 0) return;
    
    this.isAnimating = true;
    
    this.currentSlide = index;
    this.updateCurrentSlide();
    
    this.trackCarouselInteraction('go_to_slide', this.slides[index]?.id, index);

    // Announce the new slide for screen readers
    const announcer = document.getElementById('carousel-announcer');
    if (announcer && this.slides[index]) {
      announcer.textContent = `Mostrando producto ${index + 1} de ${this.slides.length}: ${this.slides[index].nombre}`;
    }

    // Manage focus for accessibility after the view is updated
    const mainItem = this.itemElements.find(el => el.classList.contains('main'));
    if (mainItem) {
      // A small delay can help ensure the browser is ready to move focus
      setTimeout(() => mainItem.focus(), 50);
    }

    // Finalizar animación después de un breve delay
    setTimeout(() => {
      this.isAnimating = false;
    }, 500);
  }

  nextSlide() {
    if (this.slides.length === 0) return;
    const nextIndex = (this.currentSlide + 1) % this.slides.length;
    this.goToSlide(nextIndex);
  }

  prevSlide() {
    if (this.slides.length === 0) return;
    const prevIndex = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
    this.goToSlide(prevIndex);
  }

  updateCurrentSlide() {
    this.updateView();
    this.updateIndicators();
  }



  updateIndicators() {
    const indicators = document.querySelectorAll('.minimal-indicator');
    indicators.forEach((indicator, index) => {
      indicator.classList.toggle('active', index === this.currentSlide);
      indicator.setAttribute('aria-selected', index === this.currentSlide);
    });
  }

  openProductDetails(productId) {
    if (!productId) return;
    window.location.href = `details/details.html?id=${productId}`;
  }



  handleSectionChange(newSection) {
    const carouselSection = document.getElementById('carousel-section');
    if (carouselSection) {
      if (newSection === 'inicio') {
        carouselSection.style.display = 'block';
        this.handleResize();
      } else {
        carouselSection.style.display = 'none';
      }
    }
  }

  trackCarouselInteraction(action, productId = null, slideIndex = null) {
    console.log('Carousel interaction:', {
      action,
      productId,
      slideIndex,
      timestamp: new Date().toISOString()
    });
    
    // Aquí puedes agregar código para Google Analytics, Facebook Pixel, etc.
    if (typeof gtag !== 'undefined') {
      gtag('event', 'carousel_interaction', {
        action: action,
        product_id: productId,
        slide_index: slideIndex
      });
    }
  }

  destroy() {
    // Remover event listeners globales
    window.removeEventListener('resize', this.handleResize);
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    document.removeEventListener('keydown', this.handleKeydown);
    
    // Remover eventos touch
    const carouselContainer = document.querySelector('.minimal-carousel-container');
    if (carouselContainer) {
      carouselContainer.removeEventListener('touchstart', this.handleTouchStart);
      carouselContainer.removeEventListener('touchmove', this.handleTouchMove);
      carouselContainer.removeEventListener('touchend', this.handleTouchEnd);
    }
    
    this.isInitialized = false;
    console.log('Carrusel minimalista destruido');
  }

  // Métodos públicos
  getCurrentSlideInfo() {
    const currentProduct = this.slides[this.currentSlide];
    return {
      index: this.currentSlide,
      total: this.slides.length,
      product: currentProduct,
      isPlaying: false // Siempre false ya que no hay auto-slide
    };
  }

  toggleAutoPlay() {
    // Sin funcionalidad automática, siempre retorna false
    return false;
  }

  goToProductById(productId) {
    const index = this.slides.findIndex(product => product.id === productId);
    if (index !== -1) {
      this.goToSlide(index);
      return true;
    }
    return false;
  }

  renderProductCard(product) {
    return `
      <div class="product-card">
        <img src="${product.imagen}" alt="${product.nombre}" class="product-image">
        <div class="product-info">
          <h4>${product.nombre}</h4>
          <p>$${product.precio?.toLocaleString('es-AR') || '0'}</p>
          <div class="product-actions">
            <button class="like-btn" data-id="${product.id}">
              <img src="/img-galery/heart-icon.svg" alt="Like" class="heart-icon">
            </button>
            <button class="add-to-cart-btn" data-id="${product.id}">
              <img src="/img-galery/cart-icon.svg" alt="Añadir al carrito" class="cart-btn-icon">
            </button>
          </div>
        </div>
      </div>
    `;
  }
}

// Instancia global del carrusel minimalista
let minimalCarousel = null;

// Función para inicializar el carrusel minimalista
function initializeMinimalCarousel() {
  if (!minimalCarousel) {
    minimalCarousel = new MinimalProductCarousel();
  }
}

// Función para manejar cambios de sección (llamada desde script.js)
function handleMinimalCarouselSectionChange(section) {
  if (minimalCarousel) {
    minimalCarousel.handleSectionChange(section);
  }
}

// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, preparing minimal carousel...');
  
  setTimeout(() => {
    initializeMinimalCarousel();
  }, 300);
});

// Inicialización de respaldo
window.addEventListener('load', () => {
  if (!minimalCarousel) {
    console.log('Window loaded, initializing minimal carousel as fallback...');
    setTimeout(initializeMinimalCarousel, 200);
  }
});

// Limpieza antes de descargar la página
window.addEventListener('beforeunload', () => {
  if (minimalCarousel) {
    minimalCarousel.destroy();
  }
});

// Exportar funciones para acceso global
window.handleMinimalCarouselSectionChange = handleMinimalCarouselSectionChange;

/* --- FUNCIONALIDAD HEREDADA PARA COMPATIBILIDAD --- */

// Mapa de colores - ACTUALIZADO con todos los colores del filtro
const colorMap = {
  "Rosa": "#ffc0cb",
  "Azul": "#0066cc", 
  "Rojo": "#ff0000",
  "Amarillo": "#ffff00",
  "Blanco": "#ffffff",
  "Gris": "#808080",
  "Negro": "#000000",
  "Verde": "#008000",
  "Dorado": "#ffd700",
  "Plateado": "#c0c0c0",
  "Multicolor": "linear-gradient(45deg, #ff69b4, #00bfff, #ffa500, #32cd32)",
  "Naranja": "#ffa500",
  "Púrpura": "#800080"
};

/**
 * Convierte color de texto a código hexadecimal o gradiente
 * @param {string} colorName - Nombre del color en texto
 * @returns {string} - Código CSS del color
 */
function getColorCode(colorName) {
  return colorMap[colorName] || "#cccccc"; // Gris por defecto si no se encuentra
}

/**
 * Crea HTML para la etiqueta de color y tela
 * @param {Object} productData - Datos del producto
 * @returns {string} - HTML completo de la etiqueta
 */
function createColorFabricTag(productData) {
  const colorCode = getColorCode(productData.color);
  const borderStyle = productData.color === 'Blanco' ? 'border: 2px solid #ccc;' : '';
  
  return `
    <div class="color-fabric-tag">
      <div class="color-circle" style="background: ${colorCode}; ${borderStyle}"></div>
      <span class="fabric-text">${productData.tela}</span>
    </div>
  `;
}

/**
 * Función actualizada para crear tarjetas de producto (compatibilidad)
 */
window.createProductCard = function (productData) {
  const productCard = document.createElement("div");
  productCard.className = "product";
  productCard.style.cursor = 'pointer';
  
  // Crear el HTML completo del producto
  productCard.innerHTML = `
    <div class="gray-square image-container">
      <img src="${productData.imagen}" alt="${productData.nombre}" onerror="handleImageError(this)"/>
      ${createColorFabricTag(productData)}
      <button class="add-to-cart-btn" data-id="${productData.id}">
        <img src="/img-galery/icon-carrito.svg" alt="Agregar al carrito" class="cart-btn-icon" />
      </button>
      <span class="added-text" style="display: none;">Agregado</span>
    </div>
    <div class="product-info">
      <h3>${productData.nombre}</h3>
      <p class="product-price">$${productData.precio.toLocaleString('es-AR')}</p>
    </div>
  `;

  // Event listener para navegar a detalles
  productCard.addEventListener('click', (e) => {
    if (!e.target.closest('.add-to-cart-btn')) {
      window.location.href = `details/details.html?id=${productData.id}`;
    }
  });

  return productCard;
};

// Función para manejar flash de botón (compatibilidad)
function flashButton(button) {
  if (!button) return;
  
  button.classList.add('flash');
  setTimeout(() => {
    button.classList.remove('flash');
  }, 300);
}

// Utilidades adicionales para el carrusel

/**
 * Función para precargar imágenes del carrusel
 */
function preloadCarouselImages() {
  if (!minimalCarousel || !minimalCarousel.slides) return;
  
  minimalCarousel.slides.forEach(product => {
    const img = new Image();
    img.src = product.imagen;
  });
}

/**
 * Función para obtener el producto actual del carrusel
 */
function getCurrentCarouselProduct() {
  if (!minimalCarousel) return null;
  return minimalCarousel.getCurrentSlideInfo();
}

/**
 * Controlador del carrusel para scripts externos
 */
window.carouselController = {
  next: () => minimalCarousel?.nextSlide(),
  prev: () => minimalCarousel?.prevSlide(),
  goTo: (index) => minimalCarousel?.goToSlide(index),
  getCurrentInfo: () => minimalCarousel?.getCurrentSlideInfo(),
  goToProduct: (productId) => minimalCarousel?.goToProductById(productId)
};

// Función para debug en desarrollo
function debugMinimalCarousel() {
  if (minimalCarousel) {
    const info = minimalCarousel.getCurrentSlideInfo();
    console.log('Minimal carousel state:', {
      currentSlide: info.index,
      totalSlides: info.total,
      currentProduct: info.product?.nombre,
      isPlaying: info.isPlaying,

      isVisible: minimalCarousel.isCarouselVisible(),
      isMobile: minimalCarousel.isMobile,
      isTablet: minimalCarousel.isTablet,
      isAnimating: minimalCarousel.isAnimating
    });
  } else {
    console.log('Minimal carousel not initialized');
  }
}

// Función para reiniciar el carrusel (útil para debugging)
function restartMinimalCarousel() {
  if (minimalCarousel) {
    minimalCarousel.destroy();
    minimalCarousel = null;
  }
  setTimeout(initializeMinimalCarousel, 500);
}

// Función para reinicializar cuando se cargan productos
function reinitializeCarouselWithProducts() {
  if (minimalCarousel && minimalCarousel.isInitialized) {
    minimalCarousel.selectFeaturedProducts();
    if (minimalCarousel.slides.length > 0) {
      minimalCarousel.createCarouselElements();
    }
  } else {
    initializeMinimalCarousel();
  }
}

// Exportar funciones de debug para consola
window.debugMinimalCarousel = debugMinimalCarousel;
window.restartMinimalCarousel = restartMinimalCarousel;
window.preloadCarouselImages = preloadCarouselImages;
window.reinitializeCarouselWithProducts = reinitializeCarouselWithProducts;

// Auto-precargar imágenes cuando el carrusel esté listo
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    if (typeof productos !== 'undefined') {
      preloadCarouselImages();
    }
  }, 1000);
});



// Función para manejar errores de carga de imagen
function handleImageError(img, fallbackSrc = '/img-galery/placeholder.jpg') {
  if (img.src !== fallbackSrc) { // Evitar bucle infinito
    img.onerror = null;
    img.src = fallbackSrc;
    img.classList.add('image-error');
  }
}

// Aplicar manejo de errores a imágenes del carrusel
document.addEventListener('DOMContentLoaded', () => {
  // Usar delegación de eventos para imágenes cargadas dinámicamente
  document.addEventListener('error', (e) => {
    if (e.target.tagName === 'IMG' && e.target.closest('.minimal-carousel-item')) {
      handleImageError(e.target);
    }
  }, true);
});

// Función para analytics/tracking (opcional)
function trackCarouselInteraction(action, productId = null, slideIndex = null) {
  // Aquí puedes agregar código para Google Analytics, Facebook Pixel, etc.
  console.log('Carousel interaction:', {
    action,
    productId,
    slideIndex,
    timestamp: new Date().toISOString()
  });
  
  // Ejemplo para Google Analytics (descomentar si usas GA)
  // if (typeof gtag !== 'undefined') {
  //   gtag('event', 'carousel_interaction', {
  //     action: action,
  //     product_id: productId,
  //     slide_index: slideIndex
  //   });
  // }
}

// Exportar función de tracking
window.trackCarouselInteraction = trackCarouselInteraction;