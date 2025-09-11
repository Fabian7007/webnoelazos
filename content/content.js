// Carrusel Fullwidth con navegación manual
class FullwidthCarousel {
  constructor() {
    this.currentSlide = 0;
    this.slides = [];
    this.isAnimating = false;
    this.carouselProducts = JSON.parse(localStorage.getItem('carouselProducts')) || [];
    this.selectionOrder = JSON.parse(localStorage.getItem('carouselSelectionOrder')) || [];
    this.originalProducts = [];
    this.originalOrder = [];
    this.autoPlay = false;
    this.autoPlayInterval = null;
    this.init();
  }

  async init() {
    if (window.productos && window.productos.length > 0) {
      await this.initializeCarouselInDatabase();
      await this.loadCarouselProducts();
      this.createCarousel();
      this.bindEvents();
      console.log('✅ Carrusel fullwidth inicializado con', this.slides.length, 'productos');
    }
  }

  async initializeCarouselInDatabase() {
    if (window.firestoreManager && window.firestoreManager.getDocument) {
      try {
        const doc = await window.firestoreManager.getDocument('settings', 'carousel');
        if (!doc.exists()) {
          // Crear documento vacío en Firestore
          const initialData = {
            products: [],
            selectionOrder: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          await window.firestoreManager.setDocument('settings', 'carousel', initialData);
          console.log('Carrusel inicializado en Firestore');
        }
      } catch (error) {
        console.error('Error inicializando carrusel en Firestore:', error);
      }
    }
  }

  async loadCarouselProducts() {
    // Solo cargar desde Firestore (base de datos en la nube)
    if (window.firestoreManager && window.firestoreManager.getDocument) {
      try {
        const doc = await window.firestoreManager.getDocument('settings', 'carousel');
        if (doc.exists()) {
          const data = doc.data();
          this.carouselProducts = data.products || [];
          this.selectionOrder = data.selectionOrder || [];
          console.log('Carrusel cargado desde Firestore:', this.carouselProducts);
        } else {
          // Si no existe el documento, crear uno vacío
          this.carouselProducts = [];
          this.selectionOrder = [];
        }
      } catch (error) {
        console.error('Error cargando carrusel desde Firestore:', error);
        this.carouselProducts = [];
        this.selectionOrder = [];
      }
    } else {
      this.carouselProducts = [];
      this.selectionOrder = [];
    }
    
    // Mapear productos
    if (this.carouselProducts.length > 0) {
      this.slides = this.carouselProducts.map(id => 
        window.productos.find(p => p.id === id)
      ).filter(Boolean);
    } else {
      this.slides = [];
    }
  }

  createCarousel() {
    const carouselSection = document.getElementById('carousel-section');
    if (!carouselSection) return;

    const isAdmin = this.checkAdminStatus();
    
    if (this.slides.length === 0) {
      carouselSection.innerHTML = `
        <div class="fullwidth-carousel carousel-empty">
          ${isAdmin ? '<button class="carousel-admin-btn" id="carouselAdminBtn"><i class="fas fa-edit"></i></button>' : ''}
          <div>Vacío</div>
        </div>
      `;
    } else {
      carouselSection.innerHTML = `
        <div class="fullwidth-carousel">
          <div class="carousel-container">
            ${isAdmin ? '<button class="carousel-admin-btn" id="carouselAdminBtn"><i class="fas fa-edit"></i></button>' : ''}
            <button class="carousel-auto-play" id="autoPlayBtn" title="Reproducción automática">
              <i class="fas fa-play"></i>
            </button>
            <div class="carousel-track" id="carouselTrack">
              ${this.slides.map((product, index) => this.createSlide(product, index, isAdmin)).join('')}
            </div>
            <button class="carousel-nav prev" id="prevBtn">
              <i class="fas fa-chevron-left"></i>
            </button>
            <button class="carousel-nav next" id="nextBtn">
              <i class="fas fa-chevron-right"></i>
            </button>
            <div class="carousel-indicators" id="indicators">
              ${this.slides.map((_, index) => `
                <button class="carousel-indicator ${index === 0 ? 'active' : ''}" data-slide="${index}"></button>
              `).join('')}
            </div>
          </div>
        </div>
      `;
    }

    if (isAdmin) {
      this.createAdminModal();
    }
    this.updateCarousel();
  }

  checkAdminStatus() {
    const currentUser = window.authFunctions?.getCurrentUser();
    if (!currentUser) return false;
    
    const userData = window.authFunctions?.getCurrentUserData();
    return userData && userData.role === 'administrador';
  }

  createSlide(product, index, isAdmin = false) {
    return `
      <div class="carousel-slide" style="background-image: url('${product.imagen}')">
        <div class="carousel-slide-overlay"></div>
        <div class="carousel-slide-number">${index + 1} / ${this.slides.length}</div>
        <div class="carousel-progress" style="width: ${((index + 1) / this.slides.length) * 100}%"></div>
        ${isAdmin ? `
          <div class="slide-admin-controls">
            <button class="slide-remove-btn" onclick="fullwidthCarousel.removeSlide(${index})">
              <i class="fas fa-times"></i>
            </button>
          </div>
        ` : ''}
        <div class="slide-content">
          <h3>${product.nombre}</h3>
          <p>$${product.precio?.toLocaleString('es-AR') || '0'}</p>
          <button class="slide-btn" onclick="console.log('Navegando desde carrusel a:', '${product.id}'); window.location.href='details.html?id=${encodeURIComponent(product.id)}'">
            Ver Producto
          </button>
        </div>
      </div>
    `;
  }

  bindEvents() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const indicators = document.getElementById('indicators');
    const adminBtn = document.getElementById('carouselAdminBtn');
    const autoPlayBtn = document.getElementById('autoPlayBtn');
    const carousel = document.querySelector('.fullwidth-carousel');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        this.stopAutoPlay();
        this.prevSlide();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        this.stopAutoPlay();
        this.nextSlide();
      });
    }

    if (indicators) {
      indicators.addEventListener('click', (e) => {
        if (e.target.classList.contains('carousel-indicator')) {
          this.stopAutoPlay();
          const slideIndex = parseInt(e.target.getAttribute('data-slide'));
          this.goToSlide(slideIndex);
        }
      });
    }

    if (adminBtn) {
      adminBtn.addEventListener('click', () => this.openAdminModal());
    }

    if (autoPlayBtn) {
      autoPlayBtn.addEventListener('click', () => this.toggleAutoPlay());
    }

    // Navegación con teclado
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        this.stopAutoPlay();
        this.prevSlide();
      }
      if (e.key === 'ArrowRight') {
        this.stopAutoPlay();
        this.nextSlide();
      }
      if (e.key === ' ') {
        e.preventDefault();
        this.toggleAutoPlay();
      }
    });

    // Navegación táctil (swipe)
    if (carousel) {
      let startX = 0;
      let startY = 0;
      let isDragging = false;
      let isHorizontalSwipe = false;

      carousel.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        isDragging = true;
        isHorizontalSwipe = false;
      });

      carousel.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        
        const currentX = e.touches[0].clientX;
        const currentY = e.touches[0].clientY;
        const diffX = Math.abs(startX - currentX);
        const diffY = Math.abs(startY - currentY);
        
        // Determinar si es swipe horizontal
        if (diffX > diffY && diffX > 10) {
          isHorizontalSwipe = true;
          e.preventDefault(); // Solo prevenir si es swipe horizontal
        }
      });

      carousel.addEventListener('touchend', (e) => {
        if (!isDragging) return;
        isDragging = false;
        
        if (isHorizontalSwipe) {
          const endX = e.changedTouches[0].clientX;
          const diffX = startX - endX;
          
          if (Math.abs(diffX) > 50) {
            this.stopAutoPlay();
            if (diffX > 0) {
              this.nextSlide();
            } else {
              this.prevSlide();
            }
          }
        }
      });
    }
  }

  nextSlide() {
    if (this.isAnimating) return;
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
    this.updateCarousel();
  }

  prevSlide() {
    if (this.isAnimating) return;
    this.currentSlide = this.currentSlide === 0 ? this.slides.length - 1 : this.currentSlide - 1;
    this.updateCarousel();
  }

  goToSlide(index) {
    if (this.isAnimating || index === this.currentSlide) return;
    this.currentSlide = index;
    this.updateCarousel();
  }

  updateCarousel() {
    this.isAnimating = true;
    const track = document.getElementById('carouselTrack');
    const indicators = document.querySelectorAll('.carousel-indicator');

    if (track) {
      const translateX = -this.currentSlide * 100; // 100% por slide
      track.style.transform = `translateX(${translateX}%)`;
    }

    indicators.forEach((indicator, index) => {
      indicator.classList.toggle('active', index === this.currentSlide);
    });

    setTimeout(() => {
      this.isAnimating = false;
    }, 500);
  }

  createAdminModal() {
    if (document.getElementById('carouselAdminModal')) return;
    
    const modal = document.createElement('div');
    modal.id = 'carouselAdminModal';
    modal.className = 'carousel-admin-modal';
    modal.innerHTML = `
      <div class="carousel-admin-content">
        <div class="carousel-admin-header">
          <h3><i class="fas fa-crown"></i> Panel de Administrador - Carrusel (Máx. 10 productos)</h3>
          <button class="carousel-admin-close" onclick="fullwidthCarousel.closeAdminModal()">&times;</button>
        </div>
        <div class="carousel-admin-actions" id="carouselAdminActions">
          <div class="carousel-product-counter" id="carouselProductCounter">0/10</div>
          <div>
            <button class="carousel-cancel-btn" onclick="fullwidthCarousel.closeAdminModal()">Cancelar</button>
            <button class="carousel-save-btn" onclick="fullwidthCarousel.saveCarouselProducts()">Guardar</button>
          </div>
        </div>
        <div class="carousel-admin-info">
          <h4><i class="fas fa-info-circle"></i> Instrucciones:</h4>
          <p>• Haz clic en los productos para agregarlos al carrusel</p>
          <p>• Máximo 10 productos permitidos</p>
          <p>• Los productos se muestran organizados por sección</p>
          <p>• Solo aparecen productos agregados desde el panel de administración</p>
          <p><strong>• Los cambios se guardan en la base de datos en la nube</strong></p>
          <p><strong>• Solo los administradores pueden modificar el carrusel</strong></p>
        </div>
        <div class="carousel-counter" id="carouselCounter">Seleccionados: 0/10</div>
        <div id="carouselProductsContainer"></div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  openAdminModal() {
    if (!this.checkAdminStatus()) {
      window.showError('Solo los administradores pueden gestionar el carrusel');
      return;
    }
    
    // Guardar estado original
    this.originalProducts = [...this.carouselProducts];
    this.originalOrder = [...this.selectionOrder];
    
    // Deshabilitar scroll del body
    document.body.style.overflow = 'hidden';
    
    const modal = document.getElementById('carouselAdminModal');
    const container = document.getElementById('carouselProductsContainer');
    
    if (container && window.productos) {
      const sections = {
        'lazos': 'Lazos',
        'monos': 'Moños', 
        'colitas': 'Colitas',
        'scrunchies': 'Scrunchies',
        'setmonos': 'Set Moños'
      };
      
      let html = '';
      
      Object.keys(sections).forEach(sectionKey => {
        const sectionProducts = window.productos.filter(p => p.categoria === sectionKey);
        
        if (sectionProducts.length > 0) {
          html += `
            <div class="carousel-section">
              <h5>${sections[sectionKey]}</h5>
              <div class="carousel-products-grid">
                ${sectionProducts.map(product => {
                  const isSelected = this.carouselProducts.includes(product.id);
                  const selectionNumber = isSelected ? this.selectionOrder.indexOf(product.id) + 1 : 0;
                  return `
                    <div class="carousel-product-item ${isSelected ? 'selected' : ''}" 
                         data-id="${product.id}" onclick="fullwidthCarousel.toggleProduct('${product.id}')">
                      ${isSelected ? `<div class="product-selection-number">${selectionNumber}</div>` : ''}
                      <img src="${product.imagen}" alt="${product.nombre}">
                      <h4>${product.nombre}</h4>
                      <p>$${product.precio?.toLocaleString('es-AR') || '0'}</p>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          `;
        }
      });
      
      container.innerHTML = html || '<p style="text-align: center; color: #666; padding: 20px;">No hay productos disponibles. Agrega productos desde el panel de administración.</p>';
    }
    
    this.updateCounter();
    this.checkForChanges();
    
    if (modal) {
      modal.style.display = 'flex';
    }
  }

  closeAdminModal() {
    const modal = document.getElementById('carouselAdminModal');
    if (modal) {
      modal.style.display = 'none';
    }
    // Rehabilitar scroll del body
    document.body.style.overflow = '';
  }

  toggleProduct(productId) {
    const index = this.carouselProducts.indexOf(productId);
    
    if (index > -1) {
      // Remover producto
      this.carouselProducts.splice(index, 1);
      const orderIndex = this.selectionOrder.indexOf(productId);
      if (orderIndex > -1) {
        this.selectionOrder.splice(orderIndex, 1);
      }
    } else if (this.carouselProducts.length < 10) {
      // Agregar producto
      this.carouselProducts.push(productId);
      this.selectionOrder.push(productId);
    } else {
      window.showWarning('Máximo 10 productos permitidos');
      return;
    }
    
    // Actualizar vista completa
    this.refreshProductsView();
    this.updateCounter();
    this.checkForChanges();
    this.checkForChanges();
  }
  
  updateCounter() {
    const counter = document.getElementById('carouselCounter');
    const productCounter = document.getElementById('carouselProductCounter');
    
    if (counter) {
      counter.textContent = `Seleccionados: ${this.carouselProducts.length}/10`;
    }
    
    if (productCounter) {
      productCounter.textContent = `${this.carouselProducts.length}/10`;
    }
  }

  checkForChanges() {
    const hasChanges = JSON.stringify(this.carouselProducts.sort()) !== JSON.stringify(this.originalProducts.sort()) ||
                      JSON.stringify(this.selectionOrder) !== JSON.stringify(this.originalOrder);
    
    const actionsDiv = document.getElementById('carouselAdminActions');
    if (actionsDiv) {
      if (hasChanges) {
        actionsDiv.classList.add('show');
      } else {
        actionsDiv.classList.remove('show');
      }
    }
  }

  async saveCarouselProducts() {
    if (!this.checkAdminStatus()) {
      window.showError('Solo los administradores pueden modificar el carrusel');
      return;
    }
    
    try {
      // Solo guardar en Firestore (base de datos en la nube)
      if (window.firestoreManager && window.firestoreManager.setDocument) {
        const carouselData = {
          products: this.carouselProducts,
          selectionOrder: this.selectionOrder,
          updatedAt: new Date().toISOString(),
          updatedBy: window.authFunctions?.getCurrentUser()?.uid
        };
        
        await window.firestoreManager.setDocument('settings', 'carousel', carouselData);
        console.log('Carrusel guardado en Firestore');
        
        // Recargar y actualizar carrusel
        await this.loadCarouselProducts();
        this.createCarousel();
        this.bindEvents();
        
        // Cerrar modal
        this.closeAdminModal();
        
        window.showSuccess('Carrusel guardado exitosamente en la base de datos');
      } else {
        throw new Error('No se pudo conectar con la base de datos');
      }
      
    } catch (error) {
      console.error('Error guardando carrusel:', error);
      window.showError('Error: No se pudo guardar en la base de datos. Verifica tu conexión.');
    }
  }
  

  
  toggleAutoPlay() {
    const btn = document.getElementById('autoPlayBtn');
    if (this.autoPlay) {
      this.stopAutoPlay();
      btn.innerHTML = '<i class="fas fa-play"></i>';
      btn.title = 'Reproducción automática';
    } else {
      this.startAutoPlay();
      btn.innerHTML = '<i class="fas fa-pause"></i>';
      btn.title = 'Pausar reproducción';
    }
  }
  
  startAutoPlay() {
    this.autoPlay = true;
    this.autoPlayInterval = setInterval(() => {
      this.nextSlide();
    }, 4000);
  }
  
  stopAutoPlay() {
    this.autoPlay = false;
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
      this.autoPlayInterval = null;
    }
  }
  
  refreshProductsView() {
    const container = document.getElementById('carouselProductsContainer');
    if (!container || !window.productos) return;
    
    const sections = {
      'lazos': 'Lazos',
      'monos': 'Moños', 
      'colitas': 'Colitas',
      'scrunchies': 'Scrunchies',
      'setmonos': 'Set Moños'
    };
    
    let html = '';
    
    Object.keys(sections).forEach(sectionKey => {
      const sectionProducts = window.productos.filter(p => p.categoria === sectionKey);
      
      if (sectionProducts.length > 0) {
        html += `
          <div class="carousel-section">
            <h5>${sections[sectionKey]}</h5>
            <div class="carousel-products-grid">
              ${sectionProducts.map(product => {
                const isSelected = this.carouselProducts.includes(product.id);
                const selectionNumber = isSelected ? this.selectionOrder.indexOf(product.id) + 1 : 0;
                return `
                  <div class="carousel-product-item ${isSelected ? 'selected' : ''}" 
                       data-id="${product.id}" onclick="fullwidthCarousel.toggleProduct('${product.id}')">
                    ${isSelected ? `<div class="product-selection-number">${selectionNumber}</div>` : ''}
                    <img src="${product.imagen}" alt="${product.nombre}">
                    <h4>${product.nombre}</h4>
                    <p>$${product.precio?.toLocaleString('es-AR') || '0'}</p>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        `;
      }
    });
    
    container.innerHTML = html || '<p style="text-align: center; color: #666; padding: 20px;">No hay productos disponibles.</p>';
  }

  async removeSlide(index) {
    if (!this.checkAdminStatus()) {
      window.showError('Solo los administradores pueden modificar el carrusel');
      return;
    }
    
    if (await window.confirm('¿Eliminar este producto del carrusel?')) {
      const productId = this.slides[index].id;
      this.carouselProducts = this.carouselProducts.filter(id => id !== productId);
      const orderIndex = this.selectionOrder.indexOf(productId);
      if (orderIndex > -1) {
        this.selectionOrder.splice(orderIndex, 1);
      }
      
      // Solo guardar en Firestore
      try {
        if (window.firestoreManager && window.firestoreManager.setDocument) {
          const carouselData = {
            products: this.carouselProducts,
            selectionOrder: this.selectionOrder,
            updatedAt: new Date().toISOString(),
            updatedBy: window.authFunctions?.getCurrentUser()?.uid
          };
          
          await window.firestoreManager.setDocument('settings', 'carousel', carouselData);
          console.log('Carrusel actualizado en Firestore');
          
          // Recargar productos del carrusel
          await this.loadCarouselProducts();
          
          // Ajustar slide actual si es necesario
          if (this.currentSlide >= this.slides.length && this.slides.length > 0) {
            this.currentSlide = this.slides.length - 1;
          } else if (this.slides.length === 0) {
            this.currentSlide = 0;
          }
          
          // Recrear carrusel
          this.createCarousel();
          this.bindEvents();
        } else {
          throw new Error('No se pudo conectar con la base de datos');
        }
      } catch (error) {
        console.error('Error actualizando carrusel:', error);
        window.showError('Error: No se pudo actualizar la base de datos');
      }
    }
  }

  handleSectionChange(section) {
    const carouselSection = document.getElementById('carousel-section');
    if (carouselSection) {
      carouselSection.style.display = section === 'inicio' ? 'block' : 'none';
    }
  }
}

// Instancia global del carrusel
let fullwidthCarousel = null;

// Inicializar carrusel
function initializeFullwidthCarousel() {
  if (!fullwidthCarousel && window.productos && window.productos.length > 0) {
    fullwidthCarousel = new FullwidthCarousel();
  }
}

// Manejar cambios de sección
function handleMinimalCarouselSectionChange(section) {
  if (fullwidthCarousel) {
    fullwidthCarousel.handleSectionChange(section);
  }
}

// Inicializar cuando se cargan los productos
window.addEventListener('productsLoaded', () => {
  console.log('Productos cargados, inicializando carrusel fullwidth...');
  setTimeout(initializeFullwidthCarousel, 100);
});



// Exportar funciones
window.handleMinimalCarouselSectionChange = handleMinimalCarouselSectionChange;
window.initializeMinimalCarousel = initializeFullwidthCarousel;

// Controlador del carrusel
window.carouselController = {
  next: () => fullwidthCarousel?.nextSlide(),
  prev: () => fullwidthCarousel?.prevSlide(),
  goTo: (index) => fullwidthCarousel?.goToSlide(index),
  getCurrentInfo: () => ({
    index: fullwidthCarousel?.currentSlide || 0,
    total: fullwidthCarousel?.slides.length || 0
  })
};