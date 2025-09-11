// Admin Products Management - Complete functionality
class AdminProductManager {
  constructor() {
    this.currentEditingId = null;
    this.init();
  }

  init() {
    this.bindEvents();
    console.log('✅ Admin Product Manager initialized');
  }

  bindEvents() {
    // Main add product button
    const addProductBtn = document.getElementById('addProductBtn');
    if (addProductBtn) {
      addProductBtn.addEventListener('click', () => this.showAddProductModal());
    }

    // Listen for auth state changes to update admin visibility
    window.addEventListener('productsLoaded', () => {
      if (window.updateAdminControlsVisibility) {
        window.updateAdminControlsVisibility();
      }
    });
  }

  showAddProductModal() {
    const modal = this.createProductModal();
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
  }

  createProductModal(product = null) {
    const isEdit = !!product;
    const modalId = isEdit ? 'editProductModal' : 'addProductModal';
    
    const modal = document.createElement('div');
    modal.id = modalId;
    modal.className = 'admin-modal';
    modal.innerHTML = `
      <div class="admin-modal-content">
        <div class="admin-modal-header">
          <h3>${isEdit ? 'Editar Producto' : 'Agregar Nuevo Producto'}</h3>
          <button class="admin-modal-close" onclick="this.closest('.admin-modal').remove(); document.body.style.overflow = 'auto';">×</button>
        </div>
        
        <div class="instructions-subtitle">
          <h4>📋 Instrucciones:</h4>
          <ol>
            <li>Completa el nombre del producto (máximo 30 caracteres)</li>
            <li>Añade una descripción breve (opcional,máximo 100 caracteres)</li>
            <li>Selecciona la categoría, estado, color y tipo de tela</li>
            <li>Sube la imagen principal (y opcionalmente hasta 3 imágenes de detalle)</li>
            <li>Revisa la vista previa del producto al final</li>
            <li>Haz clic en "${isEdit ? 'Actualizar' : 'Agregar'} Producto" para guardar</li>
          </ol>
        </div>
        
        <form class="admin-product-form" onsubmit="event.preventDefault(); window.adminFunctions.${isEdit ? 'updateProduct' : 'addProduct'}(this);">
          <div class="form-row">
            <div class="form-group">
              <label>Nombre del producto *</label>
              <input type="text" name="nombre" value="${product?.nombre || ''}" maxlength="30" required oninput="window.adminFunctions.updateCharCounter(this, 30)">
              <div class="char-counter">0/30 caracteres</div>
            </div>
            <div class="form-group">
              <label>Precio *</label>
              <input type="number" name="precio" value="${product?.precio || ''}" min="0" step="0.01" required>
            </div>
          </div>
          
          <div class="form-group">
            <label>Descripción</label>
            <textarea name="descripcion" rows="3" maxlength="100" placeholder="Descripción del producto..." oninput="window.adminFunctions.updateCharCounter(this, 100)">${product?.descripcion || ''}</textarea>
            <div class="char-counter">0/100 caracteres</div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>Categoría *</label>
              <select name="categoria" required>
                <option value="">Seleccionar categoría</option>
                <option value="lazos" ${product?.categoria === 'lazos' ? 'selected' : ''}>Lazos</option>
                <option value="monos" ${product?.categoria === 'monos' ? 'selected' : ''}>Moños</option>
                <option value="colitas" ${product?.categoria === 'colitas' ? 'selected' : ''}>Colitas</option>
                <option value="scrunchies" ${product?.categoria === 'scrunchies' ? 'selected' : ''}>Scrunchies</option>
                <option value="setmonos" ${product?.categoria === 'setmonos' ? 'selected' : ''}>Set Moños</option>
              </select>
            </div>
            <div class="form-group">
              <label>Estado</label>
              <select name="status">
                <option value="none" ${(product?.status || 'none') === 'none' ? 'selected' : ''}>Normal</option>
                <option value="nuevo" ${product?.status === 'nuevo' ? 'selected' : ''}>Nuevo</option>
                <option value="oferta" ${product?.status === 'oferta' ? 'selected' : ''}>En Oferta</option>
                <option value="agotado" ${product?.status === 'agotado' ? 'selected' : ''}>Agotado</option>
              </select>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>Color</label>
              <select name="color">
                <option value="">Seleccionar color</option>
                <option value="Rosa" ${product?.color === 'Rosa' ? 'selected' : ''}>Rosa</option>
                <option value="Azul" ${product?.color === 'Azul' ? 'selected' : ''}>Azul</option>
                <option value="Rojo" ${product?.color === 'Rojo' ? 'selected' : ''}>Rojo</option>
                <option value="Amarillo" ${product?.color === 'Amarillo' ? 'selected' : ''}>Amarillo</option>
                <option value="Blanco" ${product?.color === 'Blanco' ? 'selected' : ''}>Blanco</option>
                <option value="Gris" ${product?.color === 'Gris' ? 'selected' : ''}>Gris</option>
                <option value="Negro" ${product?.color === 'Negro' ? 'selected' : ''}>Negro</option>
                <option value="Verde" ${product?.color === 'Verde' ? 'selected' : ''}>Verde</option>
                <option value="Dorado" ${product?.color === 'Dorado' ? 'selected' : ''}>Dorado</option>
                <option value="Plateado" ${product?.color === 'Plateado' ? 'selected' : ''}>Plateado</option>
                <option value="Multicolor" ${product?.color === 'Multicolor' ? 'selected' : ''}>Multicolor</option>
                <option value="Naranja" ${product?.color === 'Naranja' ? 'selected' : ''}>Naranja</option>
                <option value="Púrpura" ${product?.color === 'Púrpura' ? 'selected' : ''}>Púrpura</option>
              </select>
            </div>
            <div class="form-group">
              <label>Tela</label>
              <select name="tela">
                <option value="">Seleccionar tela</option>
                <option value="Seda" ${product?.tela === 'Seda' ? 'selected' : ''}>Seda</option>
                <option value="Algodón" ${product?.tela === 'Algodón' ? 'selected' : ''}>Algodón</option>
                <option value="Gamuza" ${product?.tela === 'Gamuza' ? 'selected' : ''}>Gamuza</option>
                <option value="Lana" ${product?.tela === 'Lana' ? 'selected' : ''}>Lana</option>
                <option value="Sintético" ${product?.tela === 'Sintético' ? 'selected' : ''}>Sintético</option>
                <option value="Terciopelo" ${product?.tela === 'Terciopelo' ? 'selected' : ''}>Terciopelo</option>
                <option value="Licra" ${product?.tela === 'Licra' ? 'selected' : ''}>Licra</option>
                <option value="Poliéster" ${product?.tela === 'Poliéster' ? 'selected' : ''}>Poliéster</option>
              </select>
            </div>
          </div>
          
          <div class="image-upload-section">
            <h4>📸 Imágenes del Producto <span id="imageCounter" class="image-counter">0/4 imágenes</span></h4>
            
            <div class="image-upload-group">
              <label>Imagen Principal * (máx. 3MB)</label>
              <div class="image-input-container">
                <div class="image-input-row">
                  <input type="url" name="imagen" value="${product?.imagen || ''}" placeholder="https://ejemplo.com/imagen.jpg" oninput="window.adminFunctions.previewImageFromUrl(this, 'main')">
                  <span style="margin: 0 10px;">o</span>
                  <input type="file" name="imagenFile" accept="image/*" onchange="window.adminFunctions.previewImageFromFile(this, 'main')">
                </div>
                <div id="mainImagePreview" class="image-preview-container"></div>
              </div>
            </div>
            
            <div class="image-upload-group">
              <label>Imágenes de Detalle (opcional, máx. 3 imágenes, 3MB cada una)</label>
              <div class="image-input-container">
                <div class="image-input-row">
                  <input type="url" name="detalle1" placeholder="https://ejemplo.com/detalle1.jpg" oninput="window.adminFunctions.previewImageFromUrl(this, 'detail1')">
                  <span style="margin: 0 10px;">o</span>
                  <input type="file" name="detalle1File" accept="image/*" onchange="window.adminFunctions.previewImageFromFile(this, 'detail1')">
                </div>
                <div id="detail1ImagePreview" class="image-preview-container"></div>
              </div>
              
              <div class="image-input-container">
                <div class="image-input-row">
                  <input type="url" name="detalle2" placeholder="https://ejemplo.com/detalle2.jpg" oninput="window.adminFunctions.previewImageFromUrl(this, 'detail2')">
                  <span style="margin: 0 10px;">o</span>
                  <input type="file" name="detalle2File" accept="image/*" onchange="window.adminFunctions.previewImageFromFile(this, 'detail2')">
                </div>
                <div id="detail2ImagePreview" class="image-preview-container"></div>
              </div>
              
              <div class="image-input-container">
                <div class="image-input-row">
                  <input type="url" name="detalle3" placeholder="https://ejemplo.com/detalle3.jpg" oninput="window.adminFunctions.previewImageFromUrl(this, 'detail3')">
                  <span style="margin: 0 10px;">o</span>
                  <input type="file" name="detalle3File" accept="image/*" onchange="window.adminFunctions.previewImageFromFile(this, 'detail3')">
                </div>
                <div id="detail3ImagePreview" class="image-preview-container"></div>
              </div>
            </div>
          </div>
          
          <div class="product-preview-section">
            <h4>👁️ Vista Previa del Producto</h4>
            <div id="productPreviewContainer">
              <div class="preview-product-card">
                <div class="preview-product-image">
                  <img id="previewMainImage" src="" alt="Vista previa" style="display: none; width: 100%; height: 100%; object-fit: cover; border-radius: 19px 19px 0 0;">
                  <div id="previewNoImage" class="preview-no-image">📷 Sin imagen</div>

                  <div class="preview-cart-btn">
                    <img src="/img-galery/icon-carrito.svg" alt="Carrito" class="cart-btn-icon" style="width: 20px; height: 20px;">
                  </div>
                  <div class="preview-fabric-tag" id="previewFabricTag" style="display: none;">
                    <div class="preview-color-circle" id="previewColorCircle"></div>
                    <span class="preview-fabric-text" id="previewFabricText">Tela</span>
                  </div>
                </div>
                <div class="preview-product-info">
                  <h3 id="previewName">Nombre del producto</h3>
                  <div class="product-price-row">
                    <p class="preview-product-price" id="previewPrice">$0</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          ${isEdit ? `<input type="hidden" name="id" value="${product.id}">` : ''}
          <div class="form-actions">
            <button type="button" class="cancel-btn" onclick="this.closest('.admin-modal').remove(); document.body.style.overflow = 'auto';">Cancelar</button>
            <button type="submit" class="save-btn">${isEdit ? 'Actualizar' : 'Agregar'} Producto</button>
          </div>
        </form>
      </div>
    `;

    // Add event listeners for real-time preview
    setTimeout(() => {
      this.setupFormEventListeners(modal);
      this.updateCharCounters(modal);
      this.updateImageCounter(modal);
      if (product) {
        this.initializeExistingProductPreview(modal, product);
      }
      this.updatePreview(modal);
    }, 100);

    return modal;
  }

  async addProduct(form) {
    const formData = new FormData(form);
    
    // Handle main image - prioritize file over URL
    let mainImage = formData.get('imagen'); // URL input
    const imageFile = formData.get('imagenFile'); // File input
    
    if (imageFile && imageFile.size > 0) {
      // Convert file to base64 data URL
      mainImage = await this.fileToDataURL(imageFile);
    }
    
    // Handle detail images
    let detalle1 = formData.get('detalle1');
    let detalle2 = formData.get('detalle2');
    let detalle3 = formData.get('detalle3');
    
    const detalle1File = formData.get('detalle1File');
    const detalle2File = formData.get('detalle2File');
    const detalle3File = formData.get('detalle3File');
    
    if (detalle1File && detalle1File.size > 0) {
      detalle1 = await this.fileToDataURL(detalle1File);
    }
    if (detalle2File && detalle2File.size > 0) {
      detalle2 = await this.fileToDataURL(detalle2File);
    }
    if (detalle3File && detalle3File.size > 0) {
      detalle3 = await this.fileToDataURL(detalle3File);
    }
    
    const productData = {
      nombre: formData.get('nombre'),
      precio: parseFloat(formData.get('precio')),
      categoria: formData.get('categoria'),
      status: formData.get('status') || 'none',
      color: formData.get('color'),
      tela: formData.get('tela'),
      imagen: mainImage || '/img-galery/logo.svg',
      descripcion: formData.get('descripcion') || '',
      detalle1: detalle1 || '',
      detalle2: detalle2 || '',
      detalle3: detalle3 || ''
    };
    
    console.log('📦 Datos del producto a crear:', productData);
    console.log('Imágenes de detalle:', {
      detalle1: detalle1 ? 'SÍ' : 'NO',
      detalle2: detalle2 ? 'SÍ' : 'NO', 
      detalle3: detalle3 ? 'SÍ' : 'NO'
    });

    // Validate that product has an image
    if (!productData.imagen || productData.imagen === '/img-galery/logo.svg') {
      this.showNotification('Por favor agrega una imagen principal al producto.', 'error');
      return;
    }

    // Check total document size estimate
    const estimatedSize = this.estimateDocumentSize(productData);
    if (estimatedSize > 900000) { // 900KB limit to be safe
      this.showNotification('El producto es muy grande. Reduce el tamaño de las imágenes.', 'error');
      return;
    }

    // Show loading notification
    this.showNotification('Creando producto y notificaciones...', 'info');

    try {
      if (window.firestoreManager) {
        const productId = await window.firestoreManager.createProduct(productData);
        console.log('✅ Producto creado:', productId);
        
        // Initialize likes for new product in Realtime Database
        if (window.realtimeLikesSystem && window.realtimeLikesSystem.db) {
          try {
            const { ref, set } = await import('https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js');
            const countRef = ref(window.realtimeLikesSystem.db, `likes/${productId}/count`);
            await set(countRef, 0);
            console.log('✅ Likes inicializados para producto:', productId);
          } catch (error) {
            console.error('Error inicializando likes:', error);
          }
        }
        
        // Reload products
        await window.loadProductsFromFirebase();
        
        // Refresh current view
        if (window.applyFilters) {
          window.applyFilters();
        }
        
        // Close modal
        document.querySelector('.admin-modal').remove();
        document.body.style.overflow = 'auto';
        
        // Crear notificaciones globales para todos los usuarios
        const newProduct = { ...productData, id: productId };
        console.log('🚀 Iniciando creación de notificaciones para:', newProduct);
        
        try {
          const notifications = await window.firestoreManager.createProductNotification(newProduct);
          console.log(`✅ ${notifications.length} notificaciones globales creadas`);
          
          // Forzar actualización de notificaciones para todos los usuarios conectados
          setTimeout(async () => {
            // Actualizar contador para el usuario actual
            if (window.authModal && window.authModal.currentUser) {
              await window.authModal.updateNotificationCount();
            }
            
            // Disparar evento global para actualizar notificaciones
            window.dispatchEvent(new CustomEvent('newProductNotification', {
              detail: { product: newProduct, notifications: notifications }
            }));
          }, 1000);
        } catch (error) {
          console.error('❌ Error creando notificaciones:', error);
          console.error('Detalles del error:', error.message);
        }
        
        this.showNotification('Producto agregado exitosamente', 'success');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      this.showNotification('Error al agregar producto: ' + error.message, 'error');
    }
  }

  async editProduct(productId) {
    const product = window.productos?.find(p => p.id === productId);
    if (!product) {
      this.showNotification('Producto no encontrado', 'error');
      return;
    }

    const modal = this.createProductModal(product);
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
  }

  async updateProduct(form) {
    const formData = new FormData(form);
    const productId = formData.get('id');
    
    // Handle main image - prioritize file over URL
    let mainImage = formData.get('imagen'); // URL input
    const imageFile = formData.get('imagenFile'); // File input
    
    if (imageFile && imageFile.size > 0) {
      // Convert file to base64 data URL
      mainImage = await this.fileToDataURL(imageFile);
    }
    
    // Handle detail images
    let detalle1 = formData.get('detalle1');
    let detalle2 = formData.get('detalle2');
    let detalle3 = formData.get('detalle3');
    
    const detalle1File = formData.get('detalle1File');
    const detalle2File = formData.get('detalle2File');
    const detalle3File = formData.get('detalle3File');
    
    if (detalle1File && detalle1File.size > 0) {
      detalle1 = await this.fileToDataURL(detalle1File);
    }
    if (detalle2File && detalle2File.size > 0) {
      detalle2 = await this.fileToDataURL(detalle2File);
    }
    if (detalle3File && detalle3File.size > 0) {
      detalle3 = await this.fileToDataURL(detalle3File);
    }
    
    const productData = {
      nombre: formData.get('nombre'),
      precio: parseFloat(formData.get('precio')),
      categoria: formData.get('categoria'),
      status: formData.get('status') || 'none',
      color: formData.get('color'),
      tela: formData.get('tela'),
      imagen: mainImage,
      descripcion: formData.get('descripcion') || '',
      detalle1: detalle1 || '',
      detalle2: detalle2 || '',
      detalle3: detalle3 || ''
    };
    
    console.log('📦 Datos del producto a actualizar:', productData);
    console.log('Imágenes de detalle:', {
      detalle1: detalle1 ? 'SÍ' : 'NO',
      detalle2: detalle2 ? 'SÍ' : 'NO',
      detalle3: detalle3 ? 'SÍ' : 'NO'
    });

    // Validate that product has an image
    if (!productData.imagen) {
      this.showNotification('Por favor agrega una imagen principal al producto.', 'error');
      return;
    }

    // Check total document size estimate
    const estimatedSize = this.estimateDocumentSize(productData);
    if (estimatedSize > 900000) { // 900KB limit to be safe
      this.showNotification('El producto es muy grande. Reduce el tamaño de las imágenes.', 'error');
      return;
    }

    try {
      if (window.firestoreManager) {
        await window.firestoreManager.updateProduct(productId, productData);
        console.log('✅ Producto actualizado:', productId);
        
        // Reload products
        await window.loadProductsFromFirebase();
        
        // Refresh current view
        if (window.applyFilters) {
          window.applyFilters();
        }
        
        // Close modal
        document.querySelector('.admin-modal').remove();
        document.body.style.overflow = 'auto';
        
        this.showNotification('Producto actualizado exitosamente', 'success');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      this.showNotification('Error al actualizar producto: ' + error.message, 'error');
    }
  }

  async deleteProduct(productId) {
    const product = window.productos?.find(p => p.id === productId);
    if (!product) {
      this.showNotification('Producto no encontrado', 'error');
      return;
    }

    const confirmed = await window.notificationSystem.confirm(`¿Estás seguro de que quieres eliminar "${product.nombre}"?`);
    if (!confirmed) {
      return;
    }

    try {
      if (window.firestoreManager) {
        await window.firestoreManager.deleteProduct(productId);
        console.log('✅ Producto eliminado:', productId);
        
        // Reload products
        await window.loadProductsFromFirebase();
        
        // Refresh current view
        if (window.applyFilters) {
          window.applyFilters();
        }
        
        this.showNotification('Producto eliminado exitosamente', 'success');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      this.showNotification('Error al eliminar producto: ' + error.message, 'error');
    }
  }

  setupFormEventListeners(modal) {
    const form = modal.querySelector('.admin-product-form');
    const inputs = form.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
      input.addEventListener('input', () => this.updatePreview(modal));
      input.addEventListener('change', () => this.updatePreview(modal));
    });
    
    // Asegurar que el campo nombre permita espacios
    const nombreInput = form.querySelector('input[name="nombre"]');
    if (nombreInput) {
      nombreInput.addEventListener('keydown', (e) => {
        // Permitir espacios explícitamente
        if (e.key === ' ' || e.code === 'Space') {
          e.stopPropagation();
          return true;
        }
      });
    }
    
    // Asegurar que el campo descripción permita espacios
    const descripcionInput = form.querySelector('textarea[name="descripcion"]');
    if (descripcionInput) {
      descripcionInput.addEventListener('keydown', (e) => {
        // Permitir espacios explícitamente
        if (e.key === ' ' || e.code === 'Space') {
          e.stopPropagation();
          return true;
        }
      });
    }
  }

  initializeExistingProductPreview(modal, product) {
    // Show existing image preview if product has an image
    if (product.imagen && product.imagen !== '/img-galery/logo.svg') {
      this.showImagePreview(product.imagen, 'main', modal.querySelector('input[name="imagen"]'));
    }
    
    // Show existing detail images
    if (product.detalle1 && product.detalle1.trim()) {
      const detalle1Input = modal.querySelector('input[name="detalle1"]');
      if (detalle1Input) {
        detalle1Input.value = product.detalle1;
        this.showImagePreview(product.detalle1, 'detail1', detalle1Input);
      }
    }
    
    if (product.detalle2 && product.detalle2.trim()) {
      const detalle2Input = modal.querySelector('input[name="detalle2"]');
      if (detalle2Input) {
        detalle2Input.value = product.detalle2;
        this.showImagePreview(product.detalle2, 'detail2', detalle2Input);
      }
    }
    
    if (product.detalle3 && product.detalle3.trim()) {
      const detalle3Input = modal.querySelector('input[name="detalle3"]');
      if (detalle3Input) {
        detalle3Input.value = product.detalle3;
        this.showImagePreview(product.detalle3, 'detail3', detalle3Input);
      }
    }
  }

  updateCharCounters(modal) {
    const nameInput = modal.querySelector('input[name="nombre"]');
    const descInput = modal.querySelector('textarea[name="descripcion"]');
    
    if (nameInput) {
      this.updateCharCounter(nameInput, 30);
    }
    if (descInput) {
      this.updateCharCounter(descInput, 100);
    }
  }

  updateCharCounter(input, maxLength) {
    const counter = input.parentNode.querySelector('.char-counter');
    if (counter) {
      const currentLength = input.value.length;
      counter.textContent = `${currentLength}/${maxLength} caracteres`;
      
      counter.classList.remove('warning', 'error');
      if (currentLength > maxLength * 0.8) {
        counter.classList.add('warning');
      }
      if (currentLength >= maxLength) {
        counter.classList.add('error');
      }
    }
  }

  updatePreview(modal) {
    const form = modal.querySelector('.admin-product-form');
    const formData = new FormData(form);
    
    const previewCard = modal.querySelector('.preview-product-card');
    const previewName = modal.querySelector('#previewName');
    const previewPrice = modal.querySelector('#previewPrice');
    const previewMainImage = modal.querySelector('#previewMainImage');
    const previewNoImage = modal.querySelector('#previewNoImage');
    const previewFabricTag = modal.querySelector('#previewFabricTag');
    const previewColorCircle = modal.querySelector('#previewColorCircle');
    const previewFabricText = modal.querySelector('#previewFabricText');
    
    if (previewName) {
      previewName.textContent = formData.get('nombre') || 'Nombre del producto';
    }
    
    if (previewPrice) {
      const precio = formData.get('precio');
      previewPrice.textContent = precio ? `$${parseFloat(precio).toLocaleString('es-AR')}` : '$0';
    }
    
    // Update status badge
    const status = formData.get('status');
    this.updateStatusBadge(previewCard, status);
    
    // Update fabric tag
    const color = formData.get('color');
    const tela = formData.get('tela');
    if ((color || tela) && previewFabricTag) {
      previewFabricTag.style.display = 'flex';
      if (previewColorCircle && color) {
        const colorHex = this.getColorHex(color);
        if (color === 'Multicolor') {
          previewColorCircle.style.background = colorHex;
        } else {
          previewColorCircle.style.backgroundColor = colorHex;
        }
        if (color === 'Blanco') {
          previewColorCircle.style.border = '2px solid #ccc';
        }
      }
      if (previewFabricText && tela) {
        previewFabricText.textContent = tela;
      }
    } else if (previewFabricTag) {
      previewFabricTag.style.display = 'none';
    }
    
    // Update main image preview - check both URL and file inputs
    let mainImageSrc = formData.get('imagen'); // URL input
    const imageFile = formData.get('imagenFile'); // File input
    
    // If there's a file, use it (it will be converted to data URL)
    if (imageFile && imageFile.size > 0) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (previewMainImage && previewNoImage) {
          previewMainImage.src = e.target.result;
          previewMainImage.style.display = 'block';
          previewNoImage.style.display = 'none';
        }
      };
      reader.readAsDataURL(imageFile);
    } else if (mainImageSrc && previewMainImage && previewNoImage) {
      // Use URL input
      previewMainImage.src = mainImageSrc;
      previewMainImage.style.display = 'block';
      previewNoImage.style.display = 'none';
      
      previewMainImage.onerror = () => {
        previewMainImage.style.display = 'none';
        previewNoImage.style.display = 'flex';
      };
    } else if (previewMainImage && previewNoImage) {
      // No image
      previewMainImage.style.display = 'none';
      previewNoImage.style.display = 'flex';
    }
  }

  updateStatusBadge(previewCard, status) {
    // Remove existing status badge
    const existingBadge = previewCard.querySelector('.preview-status-badge');
    if (existingBadge) {
      existingBadge.remove();
    }
    
    // Add new status badge if status is not 'none' or empty
    if (status && status !== 'none') {
      const badge = document.createElement('div');
      badge.className = `preview-status-badge preview-status-${status}`;
      
      const statusTexts = {
        'nuevo': 'nuevo',
        'oferta': 'oferta', 
        'agotado': 'agotado'
      };
      
      badge.textContent = statusTexts[status] || status;
      
      // Agregar al contenedor de imagen, no al card
      const imageContainer = previewCard.querySelector('.preview-product-image');
      if (imageContainer) {
        imageContainer.appendChild(badge);
      }
    }
  }

  getColorHex(colorName) {
    const colors = {
      'Rosa': '#FFC0CB',
      'Azul': '#4169E1',
      'Rojo': '#DC143C',
      'Amarillo': '#FFD700',
      'Blanco': '#FFFFFF',
      'Gris': '#808080',
      'Negro': '#2F2F2F',
      'Verde': '#32CD32',
      'Dorado': '#FFD700',
      'Plateado': '#C0C0C0',
      'Multicolor': 'conic-gradient(from 0deg, #ff0000, #ff8000, #ffff00, #80ff00, #00ff00, #00ff80, #00ffff, #0080ff, #0000ff, #8000ff, #ff00ff, #ff0080, #ff0000)',
      'Naranja': '#FF8C00',
      'Púrpura': '#9932CC'
    };
    return colors[colorName] || '#CCCCCC';
  }

  previewImageFromUrl(input, type) {
    const url = input.value.trim();
    if (url) {
      // Clear the file input when URL is used
      const fileInput = input.form.querySelector(`input[name="${type === 'main' ? 'imagenFile' : type + 'File'}"]`);
      if (fileInput) {
        fileInput.value = '';
      }
      this.showImagePreview(url, type, input);
    } else {
      this.clearImagePreview(type);
    }
  }

  async previewImageFromFile(input, type) {
    const file = input.files[0];
    if (file) {
      // Check file size (10MB = 10 * 1024 * 1024 bytes) - increased limit since we compress
      if (file.size > 10 * 1024 * 1024) {
        this.showNotification('La imagen es muy grande. Máximo 10MB permitido.', 'error');
        input.value = '';
        return;
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        this.showNotification('Por favor selecciona un archivo de imagen válido.', 'error');
        input.value = '';
        return;
      }
      
      // Clear the URL input when file is used
      const urlInput = input.form.querySelector(`input[name="${type === 'main' ? 'imagen' : type}"]`);
      if (urlInput) {
        urlInput.value = '';
      }
      
      try {
        // Show loading notification for large files
        if (file.size > 1024 * 1024) {
          this.showNotification('Procesando imagen...', 'info');
        }
        
        // Compress and convert to data URL
        const compressedFile = await this.compressImage(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          this.showImagePreview(e.target.result, type, input);
          
          // Show compression info
          const originalSize = (file.size / 1024 / 1024).toFixed(2);
          const compressedSize = (compressedFile.size / 1024 / 1024).toFixed(2);
          if (file.size > 1024 * 1024) {
            this.showNotification(`Imagen comprimida: ${originalSize}MB → ${compressedSize}MB`, 'success');
          }
        };
        reader.readAsDataURL(compressedFile);
      } catch (error) {
        console.error('Error processing image:', error);
        this.showNotification('Error al procesar la imagen', 'error');
        input.value = '';
      }
    } else {
      this.clearImagePreview(type);
    }
  }

  showImagePreview(src, type, input) {
    const previewContainer = document.getElementById(`${type}ImagePreview`);
    if (!previewContainer) return;
    
    // Create image element to test if it loads
    const testImg = new Image();
    testImg.onload = () => {
      previewContainer.innerHTML = `
        <div class="image-preview-item">
          <img src="${src}" alt="Vista previa" style="max-width: 120px; max-height: 120px; object-fit: cover;">
          <button type="button" class="image-remove-btn" onclick="window.adminFunctions.removeImagePreview('${type}', this)">
            ×
          </button>
        </div>
      `;
      
      const modal = input.closest('.admin-modal');
      this.updateImageCounter(modal);
      
      // Update main preview if it's the main image
      if (type === 'main') {
        setTimeout(() => this.updatePreview(modal), 100);
      }
    };
    
    testImg.onerror = () => {
      this.showNotification('Error al cargar la imagen. Verifica la URL o el archivo.', 'error');
      this.clearImagePreview(type);
    };
    
    testImg.src = src;
  }

  clearImagePreview(type) {
    const previewContainer = document.getElementById(`${type}ImagePreview`);
    if (previewContainer) {
      previewContainer.innerHTML = '';
    }
  }

  updateImageCounter(modal) {
    const counter = modal.querySelector('#imageCounter');
    if (!counter) return;
    
    const previews = modal.querySelectorAll('.image-preview-item');
    const count = previews.length;
    counter.textContent = `${count}/4 imágenes`;
  }

  removeImagePreview(type, button) {
    const modal = button.closest('.admin-modal');
    const form = modal.querySelector('.admin-product-form');
    
    // Clear the corresponding inputs
    const urlInput = form.querySelector(`input[name="${type === 'main' ? 'imagen' : type}"]`);
    const fileInput = form.querySelector(`input[name="${type === 'main' ? 'imagenFile' : type + 'File'}"]`);
    
    if (urlInput) {
      urlInput.value = '';
      // Trigger input event to update preview
      urlInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
    if (fileInput) {
      fileInput.value = '';
      // Trigger change event to update preview
      fileInput.dispatchEvent(new Event('change', { bubbles: true }));
    }
    
    // Clear preview
    this.clearImagePreview(type);
    
    // Update counters and preview
    this.updateImageCounter(modal);
    if (type === 'main') {
      setTimeout(() => this.updatePreview(modal), 100);
    }
  }

  // Helper function to convert file to data URL with compression
  async fileToDataURL(file) {
    try {
      // Compress image before converting to data URL
      const compressedFile = await this.compressImage(file);
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(e);
        reader.readAsDataURL(compressedFile);
      });
    } catch (error) {
      console.error('Error processing image:', error);
      throw error;
    }
  }

  // Compress image to reduce file size
  compressImage(file, maxWidth = 800, maxHeight = 600, quality = 0.8) {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          resolve(blob);
        }, 'image/jpeg', quality);
      };
      
      img.src = URL.createObjectURL(file);
    });
  }

  // Estimate document size in bytes
  estimateDocumentSize(productData) {
    let totalSize = 0;
    
    // Estimate text fields (UTF-8 encoding)
    totalSize += (productData.nombre || '').length * 3;
    totalSize += (productData.descripcion || '').length * 3;
    totalSize += (productData.categoria || '').length * 3;
    totalSize += (productData.status || '').length * 3;
    totalSize += (productData.color || '').length * 3;
    totalSize += (productData.tela || '').length * 3;
    totalSize += 50; // Other fields (precio, timestamps, etc.)
    
    // Estimate image sizes (base64 is ~33% larger than binary)
    if (productData.imagen && productData.imagen.startsWith('data:')) {
      totalSize += productData.imagen.length * 0.75; // Convert base64 back to binary estimate
    }
    if (productData.detalle1 && productData.detalle1.startsWith('data:')) {
      totalSize += productData.detalle1.length * 0.75;
    }
    if (productData.detalle2 && productData.detalle2.startsWith('data:')) {
      totalSize += productData.detalle2.length * 0.75;
    }
    if (productData.detalle3 && productData.detalle3.startsWith('data:')) {
      totalSize += productData.detalle3.length * 0.75;
    }
    
    console.log(`📏 Estimated document size: ${(totalSize / 1024).toFixed(2)}KB`);
    return totalSize;
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `admin-notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 100);
    
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 400);
    }, 3000);
  }
}

// Note: Likes system moved to likes-realtime.js
// The new system uses Firebase Realtime Database instead of Firestore

// Initialize admin manager
const adminManager = new AdminProductManager();

// Export admin functions
window.adminFunctions = {
  showAddProductModal: () => adminManager.showAddProductModal(),
  addProduct: (form) => adminManager.addProduct(form),
  editProduct: (productId) => adminManager.editProduct(productId),
  updateProduct: (form) => adminManager.updateProduct(form),
  deleteProduct: (productId) => adminManager.deleteProduct(productId),
  updateCharCounter: (input, maxLength) => adminManager.updateCharCounter(input, maxLength),
  previewImageFromUrl: (input, type) => adminManager.previewImageFromUrl(input, type),
  previewImageFromFile: (input, type) => adminManager.previewImageFromFile(input, type),
  removeImagePreview: (type, button) => adminManager.removeImagePreview(type, button)
};

