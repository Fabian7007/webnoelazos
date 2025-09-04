// Admin Product Management System

class AdminProductManager {
  constructor() {
    this.currentSection = 'inicio';
    this.init();
  }

  init() {
    this.bindEvents();
    this.checkAdminStatus();
  }

  bindEvents() {
    // Add product button
    document.addEventListener('click', (e) => {
      if (e.target.closest('#addProductBtn')) {
        this.showProductForm();
      }
    });

    // Track current section
    document.addEventListener('click', (e) => {
      if (e.target.closest('.menu-link')) {
        const href = e.target.closest('.menu-link').getAttribute('href');
        this.currentSection = href.replace('#', '') || 'inicio';
        // Update admin controls visibility based on section
        setTimeout(() => this.showAdminControls(), 100);
      }
    });

    // Edit product button
    document.addEventListener('click', (e) => {
      if (e.target.closest('.edit-product-btn')) {
        const productId = e.target.closest('.edit-product-btn').dataset.productId;
        this.showEditProductForm(productId);
      }
    });

    // Delete product button
    document.addEventListener('click', (e) => {
      if (e.target.closest('.delete-product-btn')) {
        const productId = e.target.closest('.delete-product-btn').dataset.productId;
        this.deleteProduct(productId);
      }
    });

    // Check admin status when profile is viewed
    document.addEventListener('click', (e) => {
      if (e.target.closest('#viewProfileBtn')) {
        setTimeout(() => this.updateAdminControls(), 500);
      }
    });
  }

  checkAdminStatus() {
    // Check current user immediately
    setTimeout(() => this.updateAdminControls(), 1000);

    // Listen for auth state changes
    if (window.authFunctions) {
      window.authFunctions.onAuthStateChanged((user) => {
        if (user) {
          setTimeout(() => this.updateAdminControls(), 1000);
        } else {
          this.hideAdminControls();
        }
      });
    }

    // Check when firestoreManager becomes available
    const checkFirestore = setInterval(() => {
      if (window.firestoreManager && window.authFunctions?.getCurrentUser?.()) {
        this.updateAdminControls();
        clearInterval(checkFirestore);
      }
    }, 500);

    // Clear interval after 10 seconds
    setTimeout(() => clearInterval(checkFirestore), 10000);
  }

  async updateAdminControls() {
    const user = window.authModal?.currentUser || window.authFunctions?.getCurrentUser?.();
    
    if (user) {
      console.log('Checking admin status for user:', user.email, 'UID:', user.uid);
      
      // Check Firestore first
      if (window.firestoreManager) {
        try {
          const isAdmin = await window.firestoreManager.isAdmin(user.uid);
          console.log('Firestore admin check result:', isAdmin);
          
          if (isAdmin) {
            // Update localStorage with admin role
            const storedData = localStorage.getItem(`user_${user.uid}`);
            const userData = storedData ? JSON.parse(storedData) : {};
            userData.role = 'administrador';
            localStorage.setItem(`user_${user.uid}`, JSON.stringify(userData));
            
            this.showAdminControls();
            return;
          }
        } catch (error) {
          console.error('Error checking admin status:', error);
        }
      }
      
      // Fallback to localStorage
      const storedData = localStorage.getItem(`user_${user.uid}`);
      const userData = storedData ? JSON.parse(storedData) : {};
      
      console.log('LocalStorage role:', userData.role);
      
      if (userData.role === 'administrador') {
        this.showAdminControls();
      } else {
        this.hideAdminControls();
      }
    } else {
      this.hideAdminControls();
    }
  }

  showAdminControls() {
    const adminControls = document.getElementById('adminControls');
    console.log('Looking for adminControls element:', adminControls);
    
    if (adminControls) {
      // Hide in inicio section, show in others
      if (this.currentSection === 'inicio') {
        adminControls.style.display = 'none';
      } else {
        adminControls.style.display = 'block';
      }
      console.log('Admin controls updated for section:', this.currentSection);
    } else {
      console.error('Admin controls element not found in DOM');
    }
  }

  hideAdminControls() {
    const adminControls = document.getElementById('adminControls');
    if (adminControls) {
      adminControls.style.display = 'none';
      console.log('Admin controls hidden');
    }
  }

  showProductForm() {
    const formHTML = `
      <div id="productFormModal" class="product-form-modal">
        <div class="product-form-container">
          <div class="product-form-header">
            <h3>Agregar Producto - ${this.getSectionName()}</h3>
            <button id="productCloseBtn" class="product-close-btn">×</button>
          </div>
          
          <div class="product-form-content">
            <div class="product-input-group">
              <label>Nombre del producto *</label>
              <input type="text" id="productName" required maxlength="100">
            </div>
            
            <div class="product-input-group">
              <label>Precio *</label>
              <input type="number" id="productPrice" required min="0" step="0.01">
            </div>
            
            <div class="product-input-group">
              <label>Imagen principal *</label>
              <div class="image-input-options">
                <input type="url" id="productImage" placeholder="https://ejemplo.com/imagen.jpg">
                <span class="input-separator">o</span>
                <input type="file" id="productImageFile" accept="image/*" class="file-input">
                <label for="productImageFile" class="file-label">Subir imagen (máx. 3MB)</label>
              </div>
            </div>
            
            <div class="product-input-group">
              <label>Color</label>
              <select id="productColor">
                <option value="">Seleccionar color</option>
                <option value="Rosa">Rosa</option>
                <option value="Azul">Azul</option>
                <option value="Rojo">Rojo</option>
                <option value="Amarillo">Amarillo</option>
                <option value="Blanco">Blanco</option>
                <option value="Gris">Gris</option>
                <option value="Negro">Negro</option>
                <option value="Verde">Verde</option>
                <option value="Dorado">Dorado</option>
                <option value="Plateado">Plateado</option>
                <option value="Multicolor">Multicolor</option>
                <option value="Naranja">Naranja</option>
                <option value="Púrpura">Púrpura</option>
              </select>
            </div>
            
            <div class="product-input-group">
              <label>Tela</label>
              <select id="productFabric">
                <option value="">Seleccionar tela</option>
                <option value="Seda">Seda</option>
                <option value="Algodón">Algodón</option>
                <option value="Gamuza">Gamuza</option>
                <option value="Lana">Lana</option>
                <option value="Sintético">Sintético</option>
                <option value="Terciopelo">Terciopelo</option>
                <option value="Licra">Licra</option>
                <option value="Poliéster">Poliéster</option>
              </select>
            </div>
            
            <div class="product-input-group">
              <label>Estado</label>
              <select id="productStatus">
                <option value="none">Normal</option>
                <option value="nuevo">Nuevo</option>
                <option value="oferta">En Oferta</option>
                <option value="agotado">Agotado</option>
              </select>
            </div>
            
            <div class="product-input-group">
              <label>Descripción</label>
              <textarea id="productDescription" placeholder="Descripción del producto..."></textarea>
            </div>
            
            <div class="product-input-group">
              <label>Imágenes adicionales</label>
              <div class="additional-images">
                <input type="file" id="additionalImages" accept="image/*" multiple class="file-input">
                <label for="additionalImages" class="file-label">Subir hasta 3 imágenes (máx. 3MB c/u)</label>
                <textarea id="productImages" placeholder="O pegar URLs separadas por comas" style="margin-top: 10px;"></textarea>
              </div>
            </div>
            
            <div class="product-form-actions">
              <button id="saveProductBtn" class="product-save-btn">Guardar Producto</button>
              <button id="cancelProductBtn" class="product-cancel-btn">Cancelar</button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', formHTML);
    document.body.style.overflow = 'hidden';

    // Bind form events
    document.getElementById('saveProductBtn').addEventListener('click', () => this.saveProduct());
    document.getElementById('cancelProductBtn').addEventListener('click', () => this.closeProductForm());
    document.getElementById('productCloseBtn').addEventListener('click', () => this.closeProductForm());
  }

  getSectionName() {
    const sectionNames = {
      'inicio': 'Inicio',
      'lazos': 'Lazos',
      'monos': 'Moños',
      'colitas': 'Colitas',
      'scrunchies': 'Scrunchies',
      'setmonos': 'Set Moños'
    };
    return sectionNames[this.currentSection] || 'Inicio';
  }

  async saveProduct() {
    const name = document.getElementById('productName').value.trim();
    const price = parseFloat(document.getElementById('productPrice').value);
    let image = document.getElementById('productImage').value.trim();

    // Handle image file upload
    const imageFile = document.getElementById('productImageFile').files[0];
    if (imageFile) {
      if (imageFile.size > 3 * 1024 * 1024) {
        if (window.authModal) {
          window.authModal.showNotification('La imagen debe ser menor a 3MB', 'error');
        }
        return;
      }
      image = await this.convertToBase64(imageFile);
    }

    // Validate required fields
    if (!name || !price || !image) {
      if (window.authModal) {
        window.authModal.showNotification('Por favor completa los campos obligatorios: nombre, precio e imagen', 'error');
      }
      return;
    }

    // Validate price
    if (price <= 0) {
      if (window.authModal) {
        window.authModal.showNotification('El precio debe ser mayor a 0', 'error');
      }
      return;
    }

    // Validate image URL
    if (!this.isValidURL(image)) {
      if (window.authModal) {
        window.authModal.showNotification('La URL de la imagen no es válida', 'error');
      }
      return;
    }

    // Handle additional images
    let imagenes = [image, image, image];
    const additionalFiles = document.getElementById('additionalImages').files;
    const additionalUrls = document.getElementById('productImages').value.trim();
    
    if (additionalFiles.length > 0) {
      const filePromises = Array.from(additionalFiles).slice(0, 3).map(async (file) => {
        if (file.size > 3 * 1024 * 1024) {
          throw new Error('Una de las imágenes adicionales supera los 3MB');
        }
        return await this.convertToBase64(file);
      });
      
      try {
        const fileImages = await Promise.all(filePromises);
        imagenes = fileImages;
        while (imagenes.length < 3) {
          imagenes.push(imagenes[0]);
        }
      } catch (error) {
        if (window.authModal) {
          window.authModal.showNotification(error.message, 'error');
        }
        return;
      }
    } else if (additionalUrls) {
      const imageUrls = additionalUrls.split(',').map(url => url.trim()).filter(url => url);
      if (imageUrls.length > 0) {
        imagenes = imageUrls.slice(0, 3);
        while (imagenes.length < 3) {
          imagenes.push(imagenes[0]);
        }
      }
    }

    const productData = {
      nombre: name,
      categoria: this.currentSection === 'inicio' ? 'lazos' : this.currentSection,
      precio: price,
      color: document.getElementById('productColor').value || '',
      tela: document.getElementById('productFabric').value || '',
      descripcion: document.getElementById('productDescription').value || '',
      estado: document.getElementById('productStatus').value || 'none',
      imagenes: imagenes,
      imagen: image,
      id: Date.now().toString(),
      fechaCreacion: new Date().toISOString()
    };

    try {
      console.log('Product to save:', productData);
      
      // Save to Firestore
      if (window.firestoreManager) {
        const productId = await window.firestoreManager.createProduct(productData);
        console.log('Product saved to Firestore with ID:', productId);
        
        // Add to local array immediately
        if (typeof productos !== 'undefined') {
          const newProduct = {
            ...productData,
            id: productId,
            compra: `details/details.html?id=${productId}`
          };
          productos.push(newProduct);
        }
        
        // Reload from Firestore in background
        if (window.loadProductsFromFirebase) {
          setTimeout(() => window.loadProductsFromFirebase(), 1000);
        }
      } else {
        // Fallback to local storage only
        if (typeof productos !== 'undefined') {
          const newProduct = {
            ...productData,
            id: Date.now(),
            compra: `details/details.html?id=${Date.now()}`
          };
          productos.push(newProduct);
        }
      }
      
      if (window.authModal) {
        window.authModal.showNotification('Producto guardado exitosamente', 'success');
      }
      
      this.closeProductForm();
      
      // Refresh current section
      if (window.showSection) {
        window.showSection(this.currentSection);
      }
      
    } catch (error) {
      console.error('Error saving product:', error);
      if (window.authModal) {
        window.authModal.showNotification('Error al guardar el producto: ' + error.message, 'error');
      }
    }
  }

  isValidURL(string) {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }

  showEditProductForm(productId) {
    const product = productos.find(p => p.id == productId);
    if (!product) return;

    const formHTML = `
      <div id="editProductFormModal" class="product-form-modal">
        <div class="product-form-container">
          <div class="product-form-header">
            <h3>Editar Producto - ${product.nombre}</h3>
            <button id="editProductCloseBtn" class="product-close-btn">×</button>
          </div>
          
          <div class="product-form-content">
            <div class="product-input-group">
              <label>Nombre del producto *</label>
              <input type="text" id="editProductName" required maxlength="100" value="${product.nombre}">
            </div>
            
            <div class="product-input-group">
              <label>Precio *</label>
              <input type="number" id="editProductPrice" required min="0" step="0.01" value="${product.precio}">
            </div>
            
            <div class="product-input-group">
              <label>Imagen principal *</label>
              <div class="image-input-options">
                <input type="url" id="editProductImage" placeholder="https://ejemplo.com/imagen.jpg" value="${product.imagen}">
                <span class="input-separator">o</span>
                <input type="file" id="editProductImageFile" accept="image/*" class="file-input">
                <label for="editProductImageFile" class="file-label">Cambiar imagen (máx. 3MB)</label>
              </div>
            </div>
            
            <div class="product-input-group">
              <label>Color</label>
              <select id="editProductColor">
                <option value="">Seleccionar color</option>
                ${['Rosa', 'Azul', 'Rojo', 'Amarillo', 'Blanco', 'Gris', 'Negro', 'Verde', 'Dorado', 'Plateado', 'Multicolor', 'Naranja', 'Púrpura'].map(color => 
                  `<option value="${color}" ${product.color === color ? 'selected' : ''}>${color}</option>`
                ).join('')}
              </select>
            </div>
            
            <div class="product-input-group">
              <label>Tela</label>
              <select id="editProductFabric">
                <option value="">Seleccionar tela</option>
                ${['Seda', 'Algodón', 'Gamuza', 'Lana', 'Sintético', 'Terciopelo', 'Licra', 'Poliéster'].map(fabric => 
                  `<option value="${fabric}" ${product.tela === fabric ? 'selected' : ''}>${fabric}</option>`
                ).join('')}
              </select>
            </div>
            
            <div class="product-input-group">
              <label>Estado</label>
              <select id="editProductStatus">
                <option value="none" ${product.estado === 'none' ? 'selected' : ''}>Normal</option>
                <option value="nuevo" ${product.estado === 'nuevo' ? 'selected' : ''}>Nuevo</option>
                <option value="oferta" ${product.estado === 'oferta' ? 'selected' : ''}>En Oferta</option>
                <option value="agotado" ${product.estado === 'agotado' ? 'selected' : ''}>Agotado</option>
              </select>
            </div>
            
            <div class="product-input-group">
              <label>Descripción</label>
              <textarea id="editProductDescription" placeholder="Descripción del producto...">${product.descripcion || ''}</textarea>
            </div>
            
            <div class="product-form-actions">
              <button id="updateProductBtn" class="product-save-btn">Actualizar Producto</button>
              <button id="deleteProductBtn" class="product-delete-btn">Eliminar Producto</button>
              <button id="cancelEditProductBtn" class="product-cancel-btn">Cancelar</button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', formHTML);
    document.body.style.overflow = 'hidden';

    // Bind events
    document.getElementById('updateProductBtn').addEventListener('click', () => this.updateProduct(productId));
    document.getElementById('deleteProductBtn').addEventListener('click', () => this.deleteProduct(productId));
    document.getElementById('cancelEditProductBtn').addEventListener('click', () => this.closeEditProductForm());
    document.getElementById('editProductCloseBtn').addEventListener('click', () => this.closeEditProductForm());
  }

  async updateProduct(productId) {
    const name = document.getElementById('editProductName').value.trim();
    const price = parseFloat(document.getElementById('editProductPrice').value);
    let image = document.getElementById('editProductImage').value.trim();

    if (!name || !price) {
      if (window.authModal) {
        window.authModal.showNotification('Por favor completa los campos obligatorios', 'error');
      }
      return;
    }

    // Handle image file upload
    const imageFile = document.getElementById('editProductImageFile').files[0];
    if (imageFile) {
      if (imageFile.size > 3 * 1024 * 1024) {
        if (window.authModal) {
          window.authModal.showNotification('La imagen debe ser menor a 3MB', 'error');
        }
        return;
      }
      image = await this.convertToBase64(imageFile);
    }

    const updatedData = {
      nombre: name,
      precio: price,
      imagen: image,
      color: document.getElementById('editProductColor').value || '',
      tela: document.getElementById('editProductFabric').value || '',
      estado: document.getElementById('editProductStatus').value || 'none',
      descripcion: document.getElementById('editProductDescription').value || ''
    };

    try {
      // Update in Firestore
      if (window.firestoreManager) {
        await window.firestoreManager.updateProduct(productId, updatedData);
      }

      // Update local array
      const productIndex = productos.findIndex(p => p.id == productId);
      if (productIndex !== -1) {
        productos[productIndex] = { ...productos[productIndex], ...updatedData };
      }

      if (window.authModal) {
        window.authModal.showNotification('Producto actualizado exitosamente', 'success');
      }

      this.closeEditProductForm();

      if (window.showSection) {
        window.showSection(this.currentSection);
      }

    } catch (error) {
      console.error('Error updating product:', error);
      if (window.authModal) {
        window.authModal.showNotification('Error al actualizar el producto', 'error');
      }
    }
  }

  async deleteProduct(productId) {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      return;
    }

    try {
      // Delete from Firestore
      if (window.firestoreManager) {
        await window.firestoreManager.deleteProduct(productId);
      }

      // Remove from local array
      const productIndex = productos.findIndex(p => p.id == productId);
      if (productIndex !== -1) {
        productos.splice(productIndex, 1);
      }

      if (window.authModal) {
        window.authModal.showNotification('Producto eliminado exitosamente', 'success');
      }

      this.closeEditProductForm();

      if (window.showSection) {
        window.showSection(this.currentSection);
      }

    } catch (error) {
      console.error('Error deleting product:', error);
      if (window.authModal) {
        window.authModal.showNotification('Error al eliminar el producto', 'error');
      }
    }
  }

  convertToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  }

  closeEditProductForm() {
    const modal = document.getElementById('editProductFormModal');
    if (modal) {
      modal.remove();
      document.body.style.overflow = '';
    }
  }

  closeProductForm() {
    const modal = document.getElementById('productFormModal');
    if (modal) {
      modal.remove();
      document.body.style.overflow = '';
    }
  }
}

// Initialize admin product manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  if (typeof window !== 'undefined') {
    window.adminProductManager = new AdminProductManager();
  }
});

// Also initialize if DOM is already loaded
if (document.readyState === 'loading') {
  // DOM is still loading
} else {
  // DOM is already loaded
  if (typeof window !== 'undefined' && !window.adminProductManager) {
    window.adminProductManager = new AdminProductManager();
  }
}

// Manual trigger for testing
window.forceAdminCheck = () => {
  if (window.adminProductManager) {
    console.log('Forcing admin check...');
    window.adminProductManager.updateAdminControls();
  } else {
    console.log('Admin product manager not initialized');
  }
};