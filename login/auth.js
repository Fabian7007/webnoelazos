// Auth modal functionality - Simplified
class AuthModal {
  constructor() {
    this.modal = null;
    this.currentUser = null;
    this.captcha = { question: '', answer: '' };
    this.init();
  }

  closeAllModals() {
    // Eliminar modal específico de editar perfil
    const editModal = document.getElementById('editProfileModal');
    if (editModal) editModal.remove();
    
    // Eliminar modal específico de eliminar cuenta
    const deleteModal = document.getElementById('deleteAccountModal');
    if (deleteModal) deleteModal.remove();
    
    // Eliminar modal específico de timer
    const timerModal = document.getElementById('editTimerModal');
    if (timerModal) timerModal.remove();
    
    // Cerrar modal de ayuda
    const helpModal = document.getElementById('helpModal');
    if (helpModal) helpModal.classList.remove('show');
    
    // Cerrar modal de notificaciones
    const notifModal = document.getElementById('notificationsModal');
    if (notifModal) {
      notifModal.classList.remove('show');
      notifModal.style.display = 'none';
    }
    
    // Limpiar modal-open del body
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 100);
    
    const duration = type === 'success' ? 5000 : 3000;
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 400);
    }, duration);
  }

  init() {
    this.modal = document.getElementById('authModal');
    if (this.modal) {
      this.bindEvents();
      this.initPasswordToggles();
      this.checkAuthState();
      this.initTheme();
      setTimeout(() => this.generateCaptcha(), 100);
    }
  }
  
  initTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.body.classList.add('dark-theme');
      const themeBtn = document.getElementById('themeToggleBtn');
      if (themeBtn) {
        themeBtn.innerHTML = '<img src="/img-galery/sun.svg" alt="" class="dropdown-icon" /><span>Tema Claro</span>';
      }
    }
  }

  generateCaptcha() {
    // Generate 4-5 random numbers
    const length = Math.floor(Math.random() * 2) + 4; // 4 or 5 digits
    this.captcha.answer = '';
    for (let i = 0; i < length; i++) {
      this.captcha.answer += Math.floor(Math.random() * 10);
    }
    this.drawCaptcha();
  }

  drawCaptcha() {
    const canvas = document.getElementById('captchaCanvas');
    if (!canvas) return;
    
    canvas.width = 100;
    canvas.height = 30;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Background with noise
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, width, height);
    
    // Add noise lines
    for (let i = 0; i < 5; i++) {
      ctx.strokeStyle = `rgba(${Math.random()*255},${Math.random()*255},${Math.random()*255},0.3)`;
      ctx.beginPath();
      ctx.moveTo(Math.random() * width, Math.random() * height);
      ctx.lineTo(Math.random() * width, Math.random() * height);
      ctx.stroke();
    }
    
    // Draw numbers
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const numbers = this.captcha.answer.split('');
    const spacing = width / (numbers.length + 1);
    
    numbers.forEach((num, index) => {
      // Random color and position
      ctx.fillStyle = `rgb(${Math.random()*100},${Math.random()*100},${Math.random()*100})`;
      const x = spacing * (index + 1) + (Math.random() - 0.5) * 10;
      const y = height / 2 + (Math.random() - 0.5) * 10;
      
      // Random rotation
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((Math.random() - 0.5) * 0.5);
      ctx.fillText(num, 0, 0);
      ctx.restore();
    });
  }

  bindEvents() {
    const self = this;
    
    // Account button click
    document.addEventListener('click', function(e) {
      if (e.target.closest('.account-toggle')) {
        e.stopPropagation();
        if (self.currentUser) {
          self.toggleUserDropdown();
        } else {
          self.showModal();
        }
      }
    });

    // Close modal
    const closeBtn = document.querySelector('.auth-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.hideModal());
    }
    if (this.modal) {
      this.modal.addEventListener('click', (e) => {
        if (e.target === this.modal) this.hideModal();
      });
    }

    // Tab switching
    document.querySelectorAll('.auth-tab').forEach(tab => {
      tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
    });
    
    document.querySelectorAll('.user-tab').forEach(tab => {
      tab.addEventListener('click', () => this.switchUserTab(tab.dataset.tab));
    });

    // Captcha refresh
    const refreshBtn = document.getElementById('refreshCaptcha');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => this.generateCaptcha());
    }

    // Auth buttons
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const googleBtn = document.getElementById('googleLoginBtn');
    const logoutBtn = document.getElementById('logoutBtn');

    if (loginBtn) loginBtn.addEventListener('click', () => this.login());
    if (registerBtn) registerBtn.addEventListener('click', () => this.register());
    if (googleBtn) googleBtn.addEventListener('click', () => this.googleAuth());
    if (logoutBtn) logoutBtn.addEventListener('click', () => this.logout());

    // Dropdown events
    this.bindDropdownEvents();
  }
  

  
  bindDropdownEvents() {
    const self = this;
    
    // View profile button
    document.addEventListener('click', function(e) {
      if (e.target.closest('#viewProfileBtn')) {
        self.hideUserDropdown();
        // Close all other dropdowns before showing modal
        if (window.closeAllDropdowns) {
          window.closeAllDropdowns();
        }
        self.showModal();
      }
    });
    
    // View notifications button
    document.addEventListener('click', function(e) {
      if (e.target.closest('#viewNotificationsBtn')) {
        self.hideUserDropdown();
        if (window.closeAllDropdowns) {
          window.closeAllDropdowns();
        }
        self.showNotificationsModal();
      }
    });
    
    // Theme toggle button
    document.addEventListener('click', function(e) {
      if (e.target.closest('#themeToggleBtn')) {
        self.toggleTheme();
      }
    });
    
    // Logout button
    document.addEventListener('click', function(e) {
      if (e.target.closest('#logoutDropdownBtn')) {
        self.hideUserDropdown();
        self.logout();
      }
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
      const dropdown = document.getElementById('userDropdown');
      if (dropdown && !e.target.closest('.account-toggle') && !e.target.closest('.user-dropdown')) {
        self.hideUserDropdown();
      }
    });
  }
  
  toggleUserDropdown() {
    console.log('Toggle dropdown called');
    // Close all other dropdowns first
    if (window.closeAllDropdowns) {
      window.closeAllDropdowns();
    }
    
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) {
      const isVisible = dropdown.style.display === 'block';
      dropdown.style.display = isVisible ? 'none' : 'block';
      if (!isVisible) {
        dropdown.classList.add('show');
      } else {
        dropdown.classList.remove('show');
      }
    } else {
      console.log('Dropdown not found');
    }
  }
  
  showUserDropdown() {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) {
      dropdown.style.display = 'block';
      dropdown.classList.add('show');
    }
  }
  
  hideUserDropdown() {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) {
      dropdown.style.display = 'none';
      dropdown.classList.remove('show');
    }
  }
  
  toggleTheme() {
    const body = document.body;
    const themeBtn = document.getElementById('themeToggleBtn');
    const isDark = body.classList.contains('dark-theme');
    
    if (isDark) {
      body.classList.remove('dark-theme');
      if (themeBtn) {
        themeBtn.innerHTML = '<img src="/img-galery/moon.svg" alt="" class="dropdown-icon" /><span>Tema Oscuro</span>';
      }
      localStorage.setItem('theme', 'light');
    } else {
      body.classList.add('dark-theme');
      if (themeBtn) {
        themeBtn.innerHTML = '<img src="/img-galery/sun.svg" alt="" class="dropdown-icon" /><span>Tema Claro</span>';
      }
      localStorage.setItem('theme', 'dark');
    }
  }

  validateUsername(username) {
    const regex = /^[a-zA-Z0-9_]+$/;
    const input = document.getElementById('registerUsername');
    
    if (username && !regex.test(username)) {
      input.style.borderColor = '#f44336';
    } else {
      input.style.borderColor = '#e1e5e9';
    }
  }

  updatePasswordStrength(password) {
    const strengthBar = document.getElementById('passwordStrengthBar');
    if (!strengthBar) return;
    
    let strength = 0;
    
    if (password.length >= 6) strength++;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    
    strengthBar.className = 'password-strength-bar';
    if (strength === 1) strengthBar.classList.add('strength-weak');
    else if (strength === 2) strengthBar.classList.add('strength-medium');
    else if (strength === 3) strengthBar.classList.add('strength-strong');
  }

  initPasswordToggles() {
    document.addEventListener('click', (e) => {
      if (e.target.closest('.password-toggle')) {
        const button = e.target.closest('.password-toggle');
        const targetId = button.getAttribute('data-target');
        const input = document.getElementById(targetId);
        const img = button.querySelector('img');
        
        if (input && img) {
          if (input.type === 'password') {
            input.type = 'text';
            img.src = '/img-galery/ojos_abiertos.svg';
            img.alt = 'Ocultar contraseña';
          } else {
            input.type = 'password';
            img.src = '/img-galery/ojos.svg';
            img.alt = 'Mostrar contraseña';
          }
        }
      }
    });
  }

  showModal() {
    // Cerrar todos los modales antes de abrir el principal
    this.closeAllModals();
    
    this.modal.style.display = 'flex';
    document.body.classList.add('modal-open');
    
    if (this.currentUser) {
      this.updateUI(this.currentUser);
    }
  }

  hideModal() {
    this.modal.style.display = 'none';
    document.body.classList.remove('modal-open');
  }

  switchTab(tab) {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
    
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
    document.getElementById(tab === 'login' ? 'loginForm' : 'registerForm').classList.add('active');
    
    if (tab === 'register') {
      setTimeout(() => this.generateCaptcha(), 100);
    }
  }
  
  switchUserTab(tab) {
    // Hide all content including profile
    document.getElementById('userProfile').style.display = 'none';
    document.querySelectorAll('.user-content').forEach(c => c.style.display = 'none');
    
    // Remove active from all tabs
    document.querySelectorAll('.user-tab').forEach(t => t.classList.remove('active'));
    
    // Add active to clicked tab
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
    
    // Show corresponding content
    if (tab === 'profile') {
      document.getElementById('userProfile').style.display = 'block';
    } else if (tab === 'stats') {
      document.getElementById('userStats').style.display = 'block';
      // Mostrar loader primero, ocultar stats
      if (window.showStatsLoader) {
        window.showStatsLoader();
      }
      // Luego cargar stats
      this.updateUserStats();
    } else if (tab === 'likes') {
      document.getElementById('userLikes').style.display = 'block';
      this.setupClearLikesButton();
      // Force refresh likes when tab is opened
      setTimeout(() => {
        this.updateLikesDisplay();
      }, 100);
    } else if (tab === 'settings') {
      document.getElementById('userSettings').style.display = 'block';
      this.loadUserSettings();
    }
  }
  
  async updateUserStats() {
    try {
      // Mostrar loader
      if (window.showStatsLoader) {
        window.showStatsLoader();
      }
      
      const userId = this.currentUser ? this.currentUser.uid : (window.realtimeLikesSystem ? window.realtimeLikesSystem.getCurrentUserId() : null);
      if (!userId) return;
      
      // Simular delay para mostrar el loader
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Obtener stats reales del usuario
      const userStats = await window.userPanelConfig.generateUserStats(this.currentUser);
      
      // Actualizar UI con stats reales
      const totalLikesEl = document.getElementById('totalLikes');
      if (totalLikesEl) {
        totalLikesEl.textContent = userStats.totalLikes;
      }
      
      const accountAgeEl = document.getElementById('accountAge');
      if (accountAgeEl) {
        accountAgeEl.textContent = userStats.accountAge;
      }
      
      const totalViewsEl = document.getElementById('totalViews');
      if (totalViewsEl) {
        totalViewsEl.textContent = userStats.totalViews;
      }
      
      const totalCommentsEl = document.getElementById('totalComments');
      if (totalCommentsEl) {
        totalCommentsEl.textContent = userStats.totalComments;
      }
      
      // Ocultar loader
      if (window.hideStatsLoader) {
        window.hideStatsLoader();
      }
    } catch (error) {
      console.error('Error updating user stats:', error);
      // Ocultar loader en caso de error
      if (window.hideStatsLoader) {
        window.hideStatsLoader();
      }
    }
  }
  
  async updateLikesDisplay() {
    try {
      // Mostrar loader
      if (window.showLikesLoader) {
        window.showLikesLoader();
      }
      
      const userId = this.currentUser ? this.currentUser.uid : (window.realtimeLikesSystem ? window.realtimeLikesSystem.getCurrentUserId() : null);
      if (!userId) return;
      
      // Simular delay para mostrar el loader
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const likedProducts = await this.getUserLikedProducts(userId);
      
      // Actualizar contador
      const likesCountEl = document.getElementById('likesCount');
      if (likesCountEl) {
        likesCountEl.textContent = likedProducts.length;
      }
      
      // Actualizar grid
      const likesGrid = document.getElementById('likesGrid');
      if (likesGrid) {
        if (likedProducts.length === 0) {
          likesGrid.innerHTML = '<p class="empty-state">No tienes productos en favoritos aún</p>';
        } else {
          likesGrid.innerHTML = '';
          likedProducts.forEach(product => {
            const productCard = this.createMiniProductCard(product);
            likesGrid.appendChild(productCard);
          });
        }
      }
      
      // Ocultar loader
      if (window.hideLikesLoader) {
        window.hideLikesLoader();
      }
    } catch (error) {
      console.error('Error updating likes display:', error);
      // Ocultar loader en caso de error
      if (window.hideLikesLoader) {
        window.hideLikesLoader();
      }
    }
  }
  
  async getUserLikedProducts(userId) {
    try {
      if (!window.realtimeLikesSystem) return [];
      
      // Use the realtime likes system to get favorite products
      return await window.realtimeLikesSystem.getUserLikedProducts();
    } catch (error) {
      console.error('Error getting user liked products:', error);
      return [];
    }
  }
  
  createMiniProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card-mini';
    card.innerHTML = `
      <div style="position: relative;">
        <img src="${product.imagen}" alt="${product.nombre}" style="width: 100%; height: 80px; object-fit: cover; border-radius: 8px 8px 0 0;">
        <button class="remove-like-btn" data-product-id="${product.id}" title="Quitar de favoritos" style="position: absolute; top: 4px; right: 4px; background: rgba(255, 255, 255, 0.9); border: none; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.2); transition: all 0.2s ease;">
          <i class="fas fa-times" style="color: #ff4757; font-size: 12px;"></i>
        </button>
      </div>
      <div style="padding: 8px;">
        <h5 style="margin: 0; font-size: 0.8rem; color: #333;">${product.nombre}</h5>
        <p style="margin: 4px 0 0 0; font-size: 0.7rem; color: #666;">$${product.precio.toLocaleString('es-AR')}</p>
      </div>
    `;
    
    // Event listener para navegar al producto
    card.addEventListener('click', (e) => {
      if (!e.target.closest('.remove-like-btn')) {
        window.location.href = `details.html?id=${encodeURIComponent(product.id)}`;
      }
    });
    
    // Event listener para el botón de eliminar like
    const removeBtn = card.querySelector('.remove-like-btn');
    removeBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      await this.removeLikeFromProduct(product.id);
    });
    
    // Hover effects para el botón
    removeBtn.addEventListener('mouseenter', () => {
      removeBtn.style.background = 'rgba(255, 71, 87, 0.1)';
      removeBtn.style.transform = 'scale(1.1)';
    });
    
    removeBtn.addEventListener('mouseleave', () => {
      removeBtn.style.background = 'rgba(255, 255, 255, 0.9)';
      removeBtn.style.transform = 'scale(1)';
    });
    
    return card;
  }
  
  async removeLikeFromProduct(productId) {
    try {
      const userId = this.currentUser ? this.currentUser.uid : (window.realtimeLikesSystem ? window.realtimeLikesSystem.getCurrentUserId() : null);
      if (!userId) return;
      
      // Remove like from product using realtime system
      if (window.realtimeLikesSystem) {
        await window.realtimeLikesSystem.toggleLike(productId);
        
        // Force update like buttons immediately
        setTimeout(() => {
          window.realtimeLikesSystem.loadLikesForCurrentProducts();
        }, 100);
      }
      
      // Update UI
      setTimeout(async () => {
        await this.updateLikesDisplay();
        await this.updateUserStats();
      }, 200);
      
      this.showNotification('Producto eliminado de favoritos', 'success');
    } catch (error) {
      console.error('Error removing like from product:', error);
      this.showNotification('Error al eliminar de favoritos', 'error');
    }
  }
  
  async clearAllLikes() {
    if (!confirm('¿Estás seguro de que quieres quitar todos los productos de favoritos?')) {
      return;
    }
    
    try {
      const userId = this.currentUser ? this.currentUser.uid : (window.realtimeLikesSystem ? window.realtimeLikesSystem.getCurrentUserId() : null);
      if (!userId || !window.realtimeLikesSystem) return;
      
      const likedProducts = await this.getUserLikedProducts(userId);
      
      if (likedProducts.length === 0) {
        this.showNotification('No tienes productos en favoritos', 'info');
        return;
      }
      
      // Remove like from each product using realtime system
      for (const product of likedProducts) {
        try {
          await window.realtimeLikesSystem.toggleLike(product.id);
          // Small delay to avoid overwhelming the system
          await new Promise(resolve => setTimeout(resolve, 50));
        } catch (error) {
          console.error(`Error removing like from product ${product.id}:`, error);
        }
      }
      
      // Force update like buttons immediately
      setTimeout(() => {
        if (window.realtimeLikesSystem) {
          window.realtimeLikesSystem.loadLikesForCurrentProducts();
        }
      }, 100);
      
      // Update UI with delay
      setTimeout(async () => {
        await this.updateLikesDisplay();
        await this.updateUserStats();
      }, 500);
      
      this.showNotification('Todos los favoritos han sido eliminados', 'success');
    } catch (error) {
      console.error('Error clearing all likes:', error);
      this.showNotification('Error al eliminar favoritos', 'error');
    }
  }
  
  async loadUserSettings() {
    const userId = this.currentUser?.uid;
    if (!userId) return;
    
    try {
      // Obtener configuraciones de Firestore
      const firestoreSettings = await window.firestoreManager.getUserSettings(userId);
      console.log('🔧 Configuraciones cargadas desde Firestore:', firestoreSettings);
      
      // Configurar cada checkbox individualmente - SIN valores por defecto automáticos
      const settingKeys = ['profilePublic', 'activityVisible', 'emailNotifications', 'promotionNotifications', 'removeAnimations', 'compactMode'];
      
      settingKeys.forEach(key => {
        const checkbox = document.getElementById(key);
        if (checkbox) {
          // SOLO usar el valor exacto de Firestore, sin fallbacks automáticos
          // Para configuraciones de privacidad, false por defecto si no existe
          if (key === 'profilePublic' || key === 'activityVisible') {
            checkbox.checked = firestoreSettings[key] === true;
          } else {
            // Para otras configuraciones, usar el valor guardado o false
            checkbox.checked = firestoreSettings[key] === true;
          }
          
          // Solo aplicar cambios localmente, no guardar automáticamente
          const newHandler = () => {
            // Aplicar cambios inmediatamente
            this.applySettingChange(key, checkbox.checked);
            
            // Actualizar clase activa
            this.updateSettingItemState(checkbox);
            
            console.log(`🔄 Configuración ${key} cambiada localmente:`, checkbox.checked);
          };
          
          // Remover listeners anteriores y agregar el nuevo
          checkbox.removeEventListener('change', checkbox._settingHandler);
          checkbox._settingHandler = newHandler;
          checkbox.addEventListener('change', newHandler);
        }
      });
      
      // Cargar configuraciones de rendimiento
      await this.loadPerformanceSettings(userId, firestoreSettings);
      
      // Cargar configuraciones adicionales
      await this.loadAdditionalSettings(userId, firestoreSettings);
      
      // Configurar botones de ayuda
      this.setupHelpButtons();
      
      // Configurar funcionalidades adicionales
      this.setupDeleteAccount();
      this.setupEditProfile();
      this.setupSaveSettingsButton();
      
      // Aplicar configuraciones iniciales SOLO si existen valores guardados
      this.applyAllSettings(firestoreSettings);
      
      // Aplicar configuraciones de rendimiento
      if (firestoreSettings.performanceSettings && window.userPanelConfig) {
        window.userPanelConfig.applyPerformanceSettings(firestoreSettings.performanceSettings);
      }
      
      // Actualizar estados visuales
      settingKeys.forEach(key => {
        const checkbox = document.getElementById(key);
        if (checkbox) {
          this.updateSettingItemState(checkbox);
        }
      });
    } catch (error) {
      console.error('Error loading user settings:', error);
    }
  }
  
  async loadPerformanceSettings(userId, firestoreSettings) {
    let performanceSettings = firestoreSettings.performanceSettings || window.userPanelConfig.defaultPerformanceSettings;
    
    console.log('🔧 Loading performance settings:', performanceSettings);
    
    // Configurar checkboxes de rendimiento
    const perfKeys = ['lazyLoadImages', 'preloadNextPage', 'cacheProducts', 'lowBandwidthMode'];
    
    perfKeys.forEach(key => {
      const checkbox = document.getElementById(key);
      if (checkbox) {
        checkbox.checked = performanceSettings[key] === true;
        
        const newHandler = () => {
          // Update the current settings object locally only
          performanceSettings = {
            ...performanceSettings,
            [key]: checkbox.checked
          };
          
          console.log(`🔄 Configuración de rendimiento ${key} cambiada localmente:`, checkbox.checked);
          this.updateSettingItemState(checkbox);
        };
        
        checkbox.removeEventListener('change', checkbox._perfHandler);
        checkbox._perfHandler = newHandler;
        checkbox.addEventListener('change', newHandler);
        
        this.updateSettingItemState(checkbox);
      }
    });
    
    // Configurar select de calidad de imagen
    const imageQualitySelect = document.getElementById('imageQuality');
    if (imageQualitySelect) {
      imageQualitySelect.value = performanceSettings.imageQuality || 'high';
      
      const selectHandler = () => {
        // Update the current settings object locally only
        performanceSettings = {
          ...performanceSettings,
          imageQuality: imageQualitySelect.value
        };
        
        console.log('🔄 Calidad de imagen cambiada localmente:', imageQualitySelect.value);
      };
      
      imageQualitySelect.removeEventListener('change', imageQualitySelect._perfHandler);
      imageQualitySelect._perfHandler = selectHandler;
      imageQualitySelect.addEventListener('change', selectHandler);
    }
    
    // Aplicar configuraciones de rendimiento inmediatamente
    if (window.userPanelConfig) {
      setTimeout(() => {
        window.userPanelConfig.applyPerformanceSettings(performanceSettings);
      }, 100);
    }
  }
  
  async loadAdditionalSettings(userId, firestoreSettings) {
    // Configurar checkbox de autoplay carousel
    const autoPlayCheckbox = document.getElementById('autoPlayCarousel');
    if (autoPlayCheckbox) {
      autoPlayCheckbox.checked = firestoreSettings.performanceSettings?.autoPlayCarousel !== false;
      
      const handler = async () => {
        let currentSettings = firestoreSettings.performanceSettings || window.userPanelConfig.defaultPerformanceSettings;
        const newSettings = {
          ...currentSettings,
          autoPlayCarousel: autoPlayCheckbox.checked
        };
        
        console.log('🔄 Autoplay cambiado localmente:', autoPlayCheckbox.checked);
        this.updateSettingItemState(autoPlayCheckbox);
        
        // Update the reference for future changes
        firestoreSettings.performanceSettings = newSettings;
      };
      
      autoPlayCheckbox.removeEventListener('change', autoPlayCheckbox._handler);
      autoPlayCheckbox._handler = handler;
      autoPlayCheckbox.addEventListener('change', handler);
      
      this.updateSettingItemState(autoPlayCheckbox);
    }
  }
  
  applySettingChange(key, value) {
    switch (key) {
      case 'profilePublic':
        this.updateProfileVisibility(value);
        break;
      case 'activityVisible':
        this.updateActivityVisibility(value);
        break;
      case 'removeAnimations':
        this.updateAnimations(!value);
        break;
      case 'compactMode':
        this.updateCompactMode(value);
        break;
    }
  }
  
  applyAllSettings(settings) {
    // Solo aplicar configuraciones que están explícitamente definidas como true
    // Para configuraciones de privacidad, false por defecto
    this.updateProfileVisibility(settings.profilePublic === true);
    this.updateActivityVisibility(settings.activityVisible === true);
    
    if (settings.removeAnimations === true) {
      this.updateAnimations(false);
    }
    if (settings.compactMode === true) {
      this.updateCompactMode(true);
    }
  }
  
  setupHelpButtons() {
    const helpButtons = document.querySelectorAll('.setting-help-btn');
    helpButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        const helpType = btn.getAttribute('data-help');
        this.showHelpModal(helpType);
      });
    });
  }
  
  updateSettingItemState(checkbox) {
    const settingItem = checkbox.closest('.setting-item');
    if (settingItem) {
      if (checkbox.checked) {
        settingItem.classList.add('active');
      } else {
        settingItem.classList.remove('active');
      }
    }
  }
  
  updateAnimations(enabled) {
    if (enabled) {
      document.body.classList.remove('no-animations');
    } else {
      document.body.classList.add('no-animations');
    }
  }
  
  updateCompactMode(enabled) {
    if (enabled) {
      document.body.classList.add('compact-mode');
    } else {
      document.body.classList.remove('compact-mode');
    }
  }
  
  getUserSetting(key, userId, defaultValue) {
    if (userId) {
      const userSetting = localStorage.getItem(`${key}_${userId}`);
      if (userSetting !== null) {
        return userSetting === 'true';
      }
    }
    
    // Fallback a configuración global
    const globalSetting = localStorage.getItem(key);
    if (globalSetting !== null) {
      return globalSetting === 'true';
    }
    
    return defaultValue;
  }
  
  showNotificationsModal() {
    // Cerrar todos los modales antes de abrir este
    this.closeAllModals();
    
    const modal = document.getElementById('notificationsModal');
    if (modal) {
      modal.style.display = 'flex';
      modal.classList.add('show');
      document.body.classList.add('modal-open');
      this.loadNotificationsModal();
      this.setupNotificationsModal();
    }
  }
  
  hideNotificationsModal() {
    const modal = document.getElementById('notificationsModal');
    if (modal) {
      modal.classList.remove('show');
      setTimeout(() => {
        modal.style.display = 'none';
        document.body.classList.remove('modal-open');
      }, 300);
    }
  }
  
  setupNotificationsModal() {
    const modal = document.getElementById('notificationsModal');
    if (!modal) return;
    
    // Close button
    const closeBtn = modal.querySelector('.notifications-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.hideNotificationsModal());
    }
    
    // Click outside to close
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.hideNotificationsModal();
      }
    });
    
    // Filter buttons
    const filterBtns = modal.querySelectorAll('.notif-filter');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.filterNotifications(btn.dataset.filter);
      });
    });
    
    // Mark all as read button
    const markReadBtn = modal.querySelector('#markAllAsReadBtn');
    if (markReadBtn) {
      markReadBtn.addEventListener('click', () => this.markAllNotificationsAsRead());
    }
    
    // Clear all button
    const clearBtn = modal.querySelector('#clearNotificationsBtn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => this.clearAllNotifications());
    }
    
    // Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('show')) {
        this.hideNotificationsModal();
      }
    });
  }
  
  async loadNotificationsModal() {
    const notificationsList = document.getElementById('notificationsModalList');
    if (!notificationsList) return;
    
    const notifications = await this.getNotifications();
    
    if (notifications.length === 0) {
      notificationsList.innerHTML = `
        <div class="empty-notifications">
          <div class="empty-notif-icon">🔔</div>
          <div class="empty-notif-text">Sin notificaciones</div>
        </div>
      `;
    } else {
      notificationsList.innerHTML = '';
      notifications.forEach(notification => {
        const notifElement = this.createNotificationElement(notification);
        notificationsList.appendChild(notifElement);
      });
    }
  }
  
  async filterNotifications(filter) {
    const notifications = await this.getNotifications();
    const notificationsList = document.getElementById('notificationsModalList');
    
    let filteredNotifications = notifications;
    if (filter === 'unread') {
      filteredNotifications = notifications.filter(n => !n.read);
    }
    
    if (filteredNotifications.length === 0) {
      notificationsList.innerHTML = `
        <div class="empty-notifications">
          <div class="empty-notif-icon">🔔</div>
          <div class="empty-notif-text">${filter === 'unread' ? 'Sin notificaciones no leídas' : 'Sin notificaciones'}</div>
        </div>
      `;
    } else {
      notificationsList.innerHTML = '';
      filteredNotifications.forEach(notification => {
        const notifElement = this.createNotificationElement(notification);
        notificationsList.appendChild(notifElement);
      });
    }
  }
  
  async clearAllNotifications() {
    if (!confirm('¿Estás seguro de que quieres eliminar todas las notificaciones?')) {
      return;
    }
    
    const userId = this.currentUser?.uid;
    if (!userId) return;
    
    try {
      if (window.firestoreManager) {
        await window.firestoreManager.clearUserNotifications(userId);
      }
    } catch (error) {
      console.error('Error clearing notifications:', error);
      // Fallback to localStorage
      localStorage.removeItem(`notifications_${userId}`);
    }
    
    this.loadNotificationsModal();
    this.updateNotificationCount();
  }
  
  async loadNotifications() {
    const notificationsList = document.getElementById('notificationsList');
    if (!notificationsList) return;
    
    const notifications = await this.getNotifications();
    
    if (notifications.length === 0) {
      notificationsList.innerHTML = `
        <div class="empty-notifications">
          <div class="empty-notif-icon">🔔</div>
          <div class="empty-notif-text">Sin notificaciones</div>
        </div>
      `;
    } else {
      notificationsList.innerHTML = '';
      notifications.forEach(notification => {
        const notifElement = this.createNotificationElement(notification);
        notificationsList.appendChild(notifElement);
      });
    }
    
    this.updateNotificationCount();
  }
  
  async getNotifications() {
    const userId = this.currentUser?.uid;
    if (!userId) return [];
    
    try {
      if (window.firestoreManager) {
        return await window.firestoreManager.getUserNotifications(userId);
      }
    } catch (error) {
      console.error('Error getting notifications from Firestore:', error);
    }
    
    // Fallback to localStorage
    const notifications = JSON.parse(localStorage.getItem(`notifications_${userId}`)) || [];
    return notifications.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
  }
  
  createNotificationElement(notification) {
    const div = document.createElement('div');
    div.className = `notification-item ${notification.read ? '' : 'unread'}`;
    
    // Handle both old format (product object) and new format (direct fields)
    const productName = notification.productName || notification.product?.nombre || 'Producto';
    const productPrice = notification.productPrice || notification.product?.precio || 0;
    const productImage = notification.productImage || notification.product?.imagen || '/img-galery/logo.svg';
    const productId = notification.productId || notification.product?.id;
    const title = notification.title || 'Producto añadido';
    const message = notification.message || 'Se ha añadido un nuevo producto a la tienda';
    const date = notification.createdAt || notification.date;
    
    div.innerHTML = `
      <div class="notif-icon">
        <img src="/img-galery/logo.svg" alt="webnoelazos" class="notif-logo">
      </div>
      <div class="notif-content">
        <div class="notif-title">${title}</div>
        <div class="notif-text">${message}</div>
        <div class="notif-product">
          <img src="${productImage}" alt="${productName}" class="notif-product-img" onerror="this.src='/img-galery/logo.svg'">
          <div class="notif-product-info">
            <div class="notif-product-name">${productName}</div>
            <div class="notif-product-price">$${productPrice.toLocaleString('es-AR')}</div>
          </div>
        </div>
        <div class="notif-time">${this.formatNotificationTime(date)}</div>
      </div>
    `;
    
    div.addEventListener('click', () => {
      this.markNotificationAsRead(notification.id);
      this.hideNotificationsModal();
      if (productId) {
        window.location.href = `details.html?id=${encodeURIComponent(productId)}`;
      }
    });
    
    return div;
  }
  
  formatNotificationTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    return date.toLocaleDateString('es-ES');
  }
  
  async markNotificationAsRead(notificationId) {
    const userId = this.currentUser?.uid;
    if (!userId) return;
    
    try {
      if (window.firestoreManager) {
        await window.firestoreManager.markNotificationAsRead(notificationId);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // Fallback to localStorage
      const notifications = JSON.parse(localStorage.getItem(`notifications_${userId}`)) || [];
      const notification = notifications.find(n => n.id === notificationId);
      if (notification) {
        notification.read = true;
        localStorage.setItem(`notifications_${userId}`, JSON.stringify(notifications));
      }
    }
    
    await this.updateNotificationCount();
    
    // Actualizar vista del modal si está abierto
    const modal = document.getElementById('notificationsModal');
    if (modal && modal.classList.contains('show')) {
      await this.loadNotificationsModal();
    }
  }
  
  async markAllNotificationsAsRead() {
    const userId = this.currentUser?.uid;
    if (!userId) return;
    
    try {
      if (window.firestoreManager) {
        await window.firestoreManager.markAllNotificationsAsRead(userId);
        this.showNotification('Todas las notificaciones marcadas como leídas', 'success');
        
        // Actualizar contador y vista
        await this.updateNotificationCount();
        
        // Actualizar vista del modal si está abierto
        const modal = document.getElementById('notificationsModal');
        if (modal && modal.classList.contains('show')) {
          await this.loadNotificationsModal();
        }
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      this.showNotification('Error al marcar notificaciones como leídas', 'error');
    }
  }
  
  async updateNotificationCount() {
    const userId = this.currentUser?.uid;
    if (!userId) return;
    
    try {
      let unreadCount = 0;
      
      if (window.firestoreManager) {
        unreadCount = await window.firestoreManager.getUnreadNotificationsCount(userId);
      } else {
        // Fallback a localStorage
        const notifications = await this.getNotifications();
        unreadCount = notifications.filter(n => !n.read).length;
      }
      
      const countElement = document.getElementById('notificationCount');
      if (countElement) {
        if (unreadCount > 0) {
          countElement.textContent = unreadCount;
          countElement.style.display = 'inline-block';
        } else {
          countElement.style.display = 'none';
        }
      }
    } catch (error) {
      console.error('Error updating notification count:', error);
    }
  }
  
  static async addProductNotification(product) {
    // Evitar notificaciones duplicadas
    if (this.notificationSent) return;
    this.notificationSent = true;
    
    setTimeout(() => {
      this.notificationSent = false;
    }, 2000);
    
    try {
      if (window.firestoreManager) {
        await window.firestoreManager.createProductNotification(product);
        console.log('✅ Notificaciones globales creadas desde AuthModal');
      }
    } catch (error) {
      console.error('Error creando notificaciones desde AuthModal:', error);
    }
    
    // Actualizar contador si el usuario actual tiene el panel abierto
    if (window.authModal && window.authModal.currentUser) {
      setTimeout(async () => {
        await window.authModal.updateNotificationCount();
      }, 1000);
    }
  }
  
  showHelpModal(helpType) {
    // Cerrar todos los modales antes de abrir este
    this.closeAllModals();
    
    const helpContent = {
      profilePublic: {
        title: 'Perfil Público',
        content: `
          <p><strong>¿Qué hace esta configuración?</strong></p>
          <p>Cuando el "Perfil Público" está <strong>activado</strong>, otros usuarios pueden ver toda tu información de perfil incluyendo:</p>
          <ul>
            <li>Tu dirección de email</li>
            <li>La fecha en que creaste tu cuenta</li>
            <li>Tu última conexión</li>
          </ul>
          <p>Cuando está <strong>desactivado</strong>, esta información permanece privada y solo tú puedes verla.</p>
          <p><em>Recomendación: Mantén esta opción desactivada si prefieres mayor privacidad.</em></p>
        `
      },
      activityVisible: {
        title: 'Mostrar Actividad',
        content: `
          <p><strong>¿Qué hace esta configuración?</strong></p>
          <p>Cuando "Mostrar Actividad" está <strong>activado</strong>, otros usuarios pueden ver:</p>
          <ul>
            <li>Un indicador verde en tu foto de perfil cuando estás activo</li>
            <li>Tu estado de conexión en tiempo real</li>
          </ul>
          <p>Cuando está <strong>desactivado</strong>, tu estado de actividad permanece oculto para otros usuarios.</p>
          <p><em>Nota: Esta configuración no afecta tu capacidad de usar la plataforma, solo la visibilidad de tu actividad.</em></p>
        `
      },
      emailNotifications: {
        title: 'Notificaciones por Email',
        content: `
          <p><strong>¿Qué hace esta configuración?</strong></p>
          <p>Cuando está <strong>activado</strong>, recibirás notificaciones por correo electrónico sobre:</p>
          <ul>
            <li>Nuevos productos añadidos</li>
            <li>Actualizaciones de tu cuenta</li>
            <li>Mensajes importantes del sistema</li>
          </ul>
          <p>Cuando está <strong>desactivado</strong>, no recibirás emails de notificación.</p>
        `
      },
      promotionNotifications: {
        title: 'Ofertas y Promociones',
        content: `
          <p><strong>¿Qué hace esta configuración?</strong></p>
          <p>Cuando está <strong>activado</strong>, recibirás notificaciones en la web sobre:</p>
          <ul>
            <li>Ofertas especiales y descuentos</li>
            <li>Promociones limitadas</li>
            <li>Productos en liquidación</li>
          </ul>
          <p>Cuando está <strong>desactivado</strong>, no recibirás notificaciones promocionales.</p>
        `
      },
      removeAnimations: {
        title: 'Remover Animaciones',
        content: `
          <p><strong>¿Qué hace esta configuración?</strong></p>
          <p>Cuando está <strong>activado</strong>, se deshabilitarán todas las animaciones y transiciones de la interfaz:</p>
          <ul>
            <li>Animaciones de hover y botones</li>
            <li>Transiciones de páginas</li>
            <li>Efectos visuales dinámicos</li>
          </ul>
          <p>Útil para mejorar el rendimiento en dispositivos lentos o para usuarios que prefieren una interfaz más estática.</p>
        `
      },
      compactMode: {
        title: 'Modo Compacto',
        content: `
          <p><strong>¿Qué hace esta configuración?</strong></p>
          <p>Cuando está <strong>activado</strong>, la interfaz se vuelve más compacta:</p>
          <ul>
            <li>Espaciado reducido entre elementos</li>
            <li>Tamaños de fuente más pequeños</li>
            <li>Márgenes y padding minimizados</li>
          </ul>
          <p>Ideal para pantallas pequeñas o para mostrar más información en menos espacio.</p>
        `
      },
      lazyLoadImages: {
        title: 'Carga Diferida de Imágenes',
        content: `
          <p><strong>¿Qué hace esta configuración?</strong></p>
          <p>Cuando está <strong>activado</strong>, las imágenes se cargan solo cuando están visibles:</p>
          <ul>
            <li>Mejora la velocidad de carga inicial</li>
            <li>Reduce el uso de datos</li>
            <li>Optimiza el rendimiento en dispositivos lentos</li>
          </ul>
          <p>Recomendado para conexiones lentas o dispositivos con poca memoria.</p>
        `
      },
      lowBandwidthMode: {
        title: 'Modo Bajo Ancho de Banda',
        content: `
          <p><strong>¿Qué hace esta configuración?</strong></p>
          <p>Cuando está <strong>activado</strong>, optimiza la experiencia para conexiones lentas:</p>
          <ul>
            <li>Reduce la calidad de las imágenes automáticamente</li>
            <li>Desactiva animaciones pesadas</li>
            <li>Prioriza el contenido esencial</li>
          </ul>
          <p>Ideal para conexiones móviles o internet lento.</p>
        `
      },
      imageQuality: {
        title: 'Calidad de Imagen',
        content: `
          <p><strong>¿Qué hace esta configuración?</strong></p>
          <p>Controla la calidad de visualización de las imágenes:</p>
          <ul>
            <li><strong>Alta:</strong> Máxima calidad, mayor uso de datos</li>
            <li><strong>Media:</strong> Balance entre calidad y velocidad</li>
            <li><strong>Baja:</strong> Carga rápida, menor calidad visual</li>
          </ul>
          <p>Ajusta según tu conexión y preferencias visuales.</p>
        `
      }
    };
    
    const content = helpContent[helpType];
    if (!content) return;
    
    // Crear modal si no existe
    let modal = document.getElementById('helpModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'helpModal';
      modal.className = 'help-modal';
      modal.innerHTML = `
        <div class="help-modal-content">
          <div class="help-modal-header">
            <h3 class="help-modal-title"></h3>
            <button class="help-modal-close">&times;</button>
          </div>
          <div class="help-modal-body"></div>
        </div>
      `;
      document.body.appendChild(modal);
      
      // Event listeners
      modal.querySelector('.help-modal-close').addEventListener('click', () => {
        this.hideHelpModal();
      });
      
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.hideHelpModal();
        }
      });
      
      // Cerrar con Escape
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('show')) {
          this.hideHelpModal();
        }
      });
    }
    
    // Actualizar contenido
    modal.querySelector('.help-modal-title').textContent = content.title;
    modal.querySelector('.help-modal-body').innerHTML = content.content;
    
    // Mostrar modal
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
  }
  
  hideHelpModal() {
    const modal = document.getElementById('helpModal');
    if (modal) {
      modal.classList.remove('show');
      document.body.style.overflow = '';
    }
  }
  
  updateProfileVisibility(isPublic) {
    const privateFields = ['userEmail', 'userCreated', 'userLastLogin'];
    
    privateFields.forEach(fieldId => {
      const field = document.getElementById(fieldId);
      const fieldContainer = field?.closest('.user-info-item');
      
      if (fieldContainer) {
        if (isPublic) {
          fieldContainer.style.display = 'flex';
        } else {
          fieldContainer.style.display = 'none';
        }
      }
    });
  }
  
  updateActivityVisibility(isVisible) {
    const statusIndicators = document.querySelectorAll('.status-indicator, #userStatusIndicator, #headerStatusIndicator');
    
    statusIndicators.forEach(indicator => {
      if (isVisible) {
        indicator.style.display = 'block';
        indicator.classList.add('online');
      } else {
        indicator.style.display = 'none';
        indicator.classList.remove('online');
      }
    });
  }
  
  setupClearLikesButton() {
    // Agregar event listener para limpiar likes
    const clearLikesBtn = document.getElementById('clearLikesBtn');
    if (clearLikesBtn) {
      clearLikesBtn.removeEventListener('click', this.clearAllLikes);
      clearLikesBtn.addEventListener('click', () => this.clearAllLikes());
    }
  }

  // Funcionalidad de eliminar cuenta
  setupDeleteAccount() {
    const deleteBtn = document.getElementById('deleteAccountBtn');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => this.showDeleteAccountModal());
    }
  }

  showDeleteAccountModal() {
    // Cerrar todos los modales antes de abrir este
    this.closeAllModals();
    
    const modal = document.createElement('div');
    modal.id = 'deleteAccountModal';
    modal.className = 'delete-account-modal';
    modal.innerHTML = `
      <div class="delete-account-content">
        <div class="delete-account-icon">⚠️</div>
        <h3 class="delete-account-title">Eliminar Cuenta</h3>
        <p class="delete-account-text">
          Esta acción eliminará permanentemente tu cuenta y todos tus datos asociados.
          No podrás recuperar tu información una vez eliminada.
        </p>
        <div class="delete-account-actions">
          <button class="delete-cancel-btn">Cancelar</button>
          <button class="delete-confirm-btn">Eliminar Cuenta</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    document.body.classList.add('modal-open');

    const cancelBtn = modal.querySelector('.delete-cancel-btn');
    const confirmBtn = modal.querySelector('.delete-confirm-btn');
    let isClosing = false;

    const closeModal = () => {
      if (isClosing) return;
      isClosing = true;
      
      if (document.body.contains(modal)) {
        document.body.removeChild(modal);
      }
      document.body.classList.remove('modal-open');
    };

    cancelBtn.addEventListener('click', closeModal);
    confirmBtn.addEventListener('click', async () => {
      await this.deleteUserAccount();
      closeModal();
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
    
    const content = modal.querySelector('.delete-account-content');
    if (content) {
      content.addEventListener('click', (e) => e.stopPropagation());
    }
  }

  async deleteUserAccount() {
    try {
      const user = this.currentUser;
      if (!user) return;

      // Eliminar datos del usuario de Firestore
      if (window.firestoreManager) {
        await window.firestoreManager.deleteUserData(user.uid);
      }

      // Eliminar datos locales
      localStorage.removeItem(`user_${user.uid}`);
      localStorage.removeItem(`notifications_${user.uid}`);

      // Eliminar cuenta de Firebase Auth
      await user.delete();

      this.showNotification('Cuenta eliminada exitosamente', 'success');
      this.hideModal();
      
      // Recargar página
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Error deleting account:', error);
      this.showNotification('Error al eliminar la cuenta: ' + error.message, 'error');
    }
  }

  // Funcionalidad de editar perfil
  setupEditProfile() {
    // El botón ahora usa onclick="showEditProfilePanel()" directamente
    // No necesitamos configurar event listeners aquí
  }

  setupSaveSettingsButton() {
    const saveBtn = document.getElementById('saveSettingsBtn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => this.saveAllSettings());
    }
  }

  async saveAllSettings() {
    const userId = this.currentUser?.uid;
    if (!userId) {
      this.showNotification('Error: Usuario no autenticado', 'error');
      return;
    }

    try {
      // Recopilar todas las configuraciones actuales
      const settings = {};
      
      // Configuraciones básicas
      const basicSettings = ['profilePublic', 'activityVisible', 'emailNotifications', 'promotionNotifications', 'removeAnimations', 'compactMode'];
      basicSettings.forEach(key => {
        const checkbox = document.getElementById(key);
        if (checkbox) {
          settings[key] = checkbox.checked;
        }
      });

      // Configuraciones de rendimiento
      const perfSettings = {};
      const perfKeys = ['lazyLoadImages', 'preloadNextPage', 'cacheProducts', 'lowBandwidthMode', 'autoPlayCarousel'];
      perfKeys.forEach(key => {
        const checkbox = document.getElementById(key);
        if (checkbox) {
          perfSettings[key] = checkbox.checked;
        }
      });
      
      // Calidad de imagen
      const imageQualitySelect = document.getElementById('imageQuality');
      if (imageQualitySelect) {
        perfSettings.imageQuality = imageQualitySelect.value;
      }
      
      settings.performanceSettings = perfSettings;

      console.log('💾 Guardando todas las configuraciones:', settings);
      
      // Guardar en Firestore
      await window.firestoreManager.saveUserSettings(userId, settings);
      
      // Guardar configuraciones de rendimiento por separado si existe el sistema
      if (window.userPanelConfig && perfSettings) {
        await window.userPanelConfig.savePerformanceSettings(userId, perfSettings);
      }
      
      // Actualizar cache local
      window.updateUserSettingsCache(userId, settings);
      
      this.showNotification('✅ Configuraciones guardadas exitosamente', 'success');
      
    } catch (error) {
      console.error('❌ Error guardando configuraciones:', error);
      this.showNotification('Error al guardar configuraciones', 'error');
    }
  }

  async canEditProfile() {
    const user = this.currentUser;
    if (!user) return false;

    const userData = await window.firestoreManager.getUser(user.uid);
    if (!userData || !userData.lastProfileEdit) return true;

    const lastEdit = new Date(userData.lastProfileEdit.seconds * 1000);
    const now = new Date();
    const timeDiff = now - lastEdit;
    const minutesDiff = Math.floor(timeDiff / (1000 * 60));

    return minutesDiff >= 5;
  }

  async getTimeUntilNextEdit() {
    const user = this.currentUser;
    if (!user) return 0;

    const userData = await window.firestoreManager.getUser(user.uid);
    if (!userData || !userData.lastProfileEdit) return 0;

    const lastEdit = new Date(userData.lastProfileEdit.seconds * 1000);
    const now = new Date();
    const timeDiff = now - lastEdit;
    const minutesDiff = Math.floor(timeDiff / (1000 * 60));

    return Math.max(0, 5 - minutesDiff);
  }

  async showEditProfileForm() {
    // Cerrar todos los modales antes de abrir este
    this.closeAllModals();
    
    const canEdit = await this.canEditProfile();
    
    if (!canEdit) {
      const timeLeft = await this.getTimeUntilNextEdit();
      this.showEditProfileTimer(timeLeft);
      return;
    }

    const user = this.currentUser;
    if (!user) return;

    const userData = await window.firestoreManager.getUser(user.uid);
    const currentUsername = userData?.username || user.displayName || user.email.split('@')[0];
    const currentImage = userData?.profileImage || user.photoURL || '/img-galery/user-profile.png';
    const currentDescription = userData?.description || '';

    // Crear modal único con ID específico
    const form = document.createElement('div');
    form.id = 'editProfileModal';
    form.className = 'edit-profile-form';
    form.innerHTML = `
      <div class="edit-profile-container">
        <div class="edit-profile-header">
          <h3>✨ Editar Perfil</h3>
          <button class="edit-close-btn">
            <img src="/img-galery/close.svg" alt="Cerrar">
          </button>
        </div>
        <div class="edit-profile-content">
          <div class="edit-input-group">
            <label class="edit-input-label">👤 Nombre de usuario (máx. 20 caracteres)</label>
            <input type="text" class="edit-input" id="editUsername" value="${currentUsername}" maxlength="20">
            <div class="edit-error-message" id="usernameError"></div>
          </div>
          
          <div class="edit-input-group">
            <label class="edit-input-label">📝 Descripción (máx. 50 caracteres)</label>
            <input type="text" class="edit-input" id="editDescription" value="${currentDescription}" maxlength="50" placeholder="Cuéntanos algo sobre ti...">
            <div class="edit-error-message" id="descriptionError"></div>
          </div>
          
          <div class="edit-input-group">
            <label class="edit-input-label">📷 Foto de perfil (máx. 3MB)</label>
            <div class="file-upload-area edit-file-input" id="fileUploadArea">
              <div class="file-upload-icon">📸</div>
              <div class="file-upload-text">Haz clic para subir una imagen</div>
              <input type="file" id="editProfileImage" accept="image/*" style="display: none;">
            </div>
            <div class="edit-error-message" id="imageError"></div>
          </div>
          
          <div class="edit-preview-container">
            <div class="edit-preview-title">👀 Vista previa</div>
            <div class="edit-preview-profile">
              <img src="${currentImage}" alt="Vista previa" class="edit-preview-image" id="previewImage">
              <div class="edit-preview-info">
                <h4 id="previewUsername">${currentUsername}</h4>
                <p id="previewDescription">${currentDescription || 'Sin descripción'}</p>
              </div>
            </div>
          </div>
          
          <div class="edit-actions">
            <button class="edit-cancel-btn">❌ Cancelar</button>
            <button class="edit-save-btn" id="saveProfileBtn">💾 Guardar Cambios</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(form);
    document.body.classList.add('modal-open');

    this.setupEditProfileEvents(form);
  }

  setupEditProfileEvents(form) {
    const usernameInput = form.querySelector('#editUsername');
    const descriptionInput = form.querySelector('#editDescription');
    const imageInput = form.querySelector('#editProfileImage');
    const fileUploadArea = form.querySelector('#fileUploadArea');
    const previewImage = form.querySelector('#previewImage');
    const previewUsername = form.querySelector('#previewUsername');
    const previewDescription = form.querySelector('#previewDescription');
    const saveBtn = form.querySelector('#saveProfileBtn');
    const cancelBtn = form.querySelector('.edit-cancel-btn');
    const closeBtn = form.querySelector('.edit-close-btn');
    const usernameError = form.querySelector('#usernameError');
    const descriptionError = form.querySelector('#descriptionError');
    const imageError = form.querySelector('#imageError');

    let selectedImageFile = null;
    let isClosing = false;

    // Validación de username en tiempo real
    usernameInput.addEventListener('input', () => {
      const username = usernameInput.value.trim();
      const regex = /^[a-zA-Z0-9_]+$/;
      
      if (username.length === 0) {
        usernameError.textContent = 'El nombre de usuario es requerido';
        usernameInput.classList.add('error');
      } else if (username.length > 20) {
        usernameError.textContent = 'Máximo 20 caracteres';
        usernameInput.classList.add('error');
      } else if (!regex.test(username)) {
        usernameError.textContent = 'Solo letras, números y guiones bajos';
        usernameInput.classList.add('error');
      } else {
        usernameError.textContent = '';
        usernameInput.classList.remove('error');
      }
      
      previewUsername.textContent = username || 'Usuario';
    });

    // Validación de descripción en tiempo real
    descriptionInput.addEventListener('input', () => {
      const description = descriptionInput.value.trim();
      
      if (description.length > 50) {
        descriptionError.textContent = 'Máximo 50 caracteres';
        descriptionInput.classList.add('error');
      } else {
        descriptionError.textContent = '';
        descriptionInput.classList.remove('error');
      }
      
      previewDescription.textContent = description || 'Sin descripción';
    });

    // Área de subida de archivos
    fileUploadArea.addEventListener('click', () => {
      imageInput.click();
    });

    fileUploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      fileUploadArea.style.borderColor = '#ff6b9d';
      fileUploadArea.style.background = '#fff5f8';
    });

    fileUploadArea.addEventListener('dragleave', () => {
      fileUploadArea.style.borderColor = '#e1e5e9';
      fileUploadArea.style.background = '#f8f9fa';
    });

    fileUploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      fileUploadArea.style.borderColor = '#e1e5e9';
      fileUploadArea.style.background = '#f8f9fa';
      
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleImageFile(files[0]);
      }
    });

    // Manejo de imagen
    imageInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        handleImageFile(file);
      }
    });

    function handleImageFile(file) {
      // Validar tamaño (3MB)
      if (file.size > 3 * 1024 * 1024) {
        imageError.textContent = 'La imagen debe ser menor a 3MB';
        imageInput.value = '';
        return;
      }

      // Validar tipo
      if (!file.type.startsWith('image/')) {
        imageError.textContent = 'Solo se permiten imágenes';
        imageInput.value = '';
        return;
      }

      imageError.textContent = '';
      selectedImageFile = file;

      // Actualizar área de subida
      fileUploadArea.innerHTML = `
        <div class="file-upload-icon">✅</div>
        <div class="file-upload-text">Imagen seleccionada: ${file.name}</div>
      `;

      // Mostrar vista previa
      const reader = new FileReader();
      reader.onload = (e) => {
        previewImage.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }

    // Guardar cambios
    saveBtn.addEventListener('click', async () => {
      await this.saveProfileChanges(
        usernameInput.value.trim(), 
        descriptionInput.value.trim(),
        selectedImageFile, 
        form
      );
    });

    // Cerrar formulario
    const closeForm = () => {
      if (isClosing) return;
      isClosing = true;
      
      if (document.body.contains(form)) {
        document.body.removeChild(form);
      }
      document.body.classList.remove('modal-open');
    };

    cancelBtn.addEventListener('click', closeForm);
    closeBtn.addEventListener('click', closeForm);
    
    form.addEventListener('click', (e) => {
      if (e.target === form) closeForm();
    });
    
    const container = form.querySelector('.edit-profile-container');
    if (container) {
      container.addEventListener('click', (e) => e.stopPropagation());
    }
  }

  async saveProfileChanges(newUsername, newDescription, imageFile, form) {
    try {
      const user = this.currentUser;
      if (!user) return;

      // Validaciones finales
      if (!newUsername || newUsername.length > 20) {
        this.showNotification('Nombre de usuario inválido', 'error');
        return;
      }

      if (newDescription && newDescription.length > 50) {
        this.showNotification('La descripción es muy larga', 'error');
        return;
      }

      const regex = /^[a-zA-Z0-9_]+$/;
      if (!regex.test(newUsername)) {
        this.showNotification('El nombre solo puede contener letras, números y guiones bajos', 'error');
        return;
      }

      // Verificar si el username ya existe (solo si es diferente al actual)
      const currentUserData = await window.firestoreManager.getUser(user.uid);
      if (currentUserData && currentUserData.username !== newUsername) {
        const usernameExists = await this.checkUsernameExists(newUsername, user.uid);
        if (usernameExists) {
          this.showNotification('Este nombre de usuario ya está en uso', 'error');
          return;
        }
      }

      let profileImageUrl = null;

      // Subir imagen si se seleccionó una
      if (imageFile) {
        profileImageUrl = await this.uploadProfileImage(imageFile, user.uid);
      }

      // Actualizar datos en Firestore
      const updateData = {
        username: newUsername,
        description: newDescription || ''
      };

      if (profileImageUrl) {
        updateData.profileImage = profileImageUrl;
      }

      await window.firestoreManager.updateUser(user.uid, updateData);
      
      // Actualizar username en comentarios existentes
      if (window.commentsSystem) {
        await window.commentsSystem.updateUserCommentsUsername(
          user.uid, 
          newUsername, 
          profileImageUrl
        );
      }

      // Actualizar localStorage
      const storedData = JSON.parse(localStorage.getItem(`user_${user.uid}`)) || {};
      localStorage.setItem(`user_${user.uid}`, JSON.stringify({
        ...storedData,
        username: newUsername,
        description: newDescription || '',
        profileImage: profileImageUrl || storedData.profileImage
      }));

      // Actualizar UI
      await this.updateUI(user);

      // Cerrar formulario
      document.body.removeChild(form);
      document.body.classList.remove('modal-open');

      this.showNotification('Perfil actualizado exitosamente', 'success');
    } catch (error) {
      console.error('Error saving profile:', error);
      this.showNotification('Error al guardar el perfil: ' + error.message, 'error');
    }
  }

  async uploadProfileImage(file, userId) {
    // Convertir imagen a base64 para almacenamiento simple
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target.result);
      };
      reader.readAsDataURL(file);
    });
  }

  async checkUsernameExists(username, currentUserId) {
    try {
      // Verificar en localStorage primero (más rápido)
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('user_') && !key.includes(currentUserId)) {
          try {
            const userData = JSON.parse(localStorage.getItem(key));
            if (userData.username === username) {
              return true;
            }
          } catch (e) {
            continue;
          }
        }
      }
      
      // Si no se encuentra en localStorage, verificar en Firestore
      if (window.firestoreManager) {
        return await window.firestoreManager.checkUsernameExists(username, currentUserId);
      }
      
      return false;
    } catch (error) {
      console.error('Error checking username:', error);
      return false;
    }
  }

  showEditProfileTimer(minutesLeft) {
    // Cerrar todos los modales antes de abrir este
    this.closeAllModals();
    
    const modal = document.createElement('div');
    modal.id = 'editTimerModal';
    modal.className = 'delete-account-modal';
    modal.innerHTML = `
      <div class="delete-account-content">
        <div class="delete-account-icon">⏰</div>
        <h3 class="delete-account-title">Edición de Perfil Bloqueada</h3>
        <p class="delete-account-text">
          Puedes editar tu perfil cada 5 minutos.
        </p>
        <div class="edit-timer-display">
          <span id="timerMinutes">${minutesLeft}</span> minutos restantes
        </div>
        <div class="delete-account-actions">
          <button class="delete-cancel-btn">Entendido</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    document.body.classList.add('modal-open');

    const timerElement = modal.querySelector('#timerMinutes');
    const closeBtn = modal.querySelector('.delete-cancel-btn');
    let isClosing = false;

    const closeModal = () => {
      if (isClosing) return;
      isClosing = true;
      
      clearInterval(timerInterval);
      if (document.body.contains(modal)) {
        document.body.removeChild(modal);
      }
      document.body.classList.remove('modal-open');
    };

    // Actualizar temporizador cada minuto
    const timerInterval = setInterval(async () => {
      const timeLeft = await this.getTimeUntilNextEdit();
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        timerElement.textContent = '0';
        closeBtn.textContent = 'Editar Perfil';
        closeBtn.onclick = () => {
          closeModal();
          this.showEditProfileForm();
        };
      } else {
        timerElement.textContent = timeLeft;
      }
    }, 60000);

    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
    
    const content = modal.querySelector('.delete-account-content');
    if (content) {
      content.addEventListener('click', (e) => e.stopPropagation());
    }
  }
  

  

  


  async login() {
    const emailOrUsername = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    if (!emailOrUsername || !password) {
      this.showNotification('Por favor completa todos los campos', 'error');
      return;
    }

    try {
      let email = emailOrUsername;
      
      if (!emailOrUsername.includes('@')) {
        const result = this.findUserByUsername(emailOrUsername);
        if (!result) {
          this.showNotification('Usuario no encontrado', 'error');
          return;
        }
        email = result.email;
      }
      
      await window.authFunctions.signInWithEmail(email, password);
      this.hideModal();
      this.showNotification('¡Bienvenido de vuelta!', 'success');
      
      // Recargar la página después de iniciar sesión
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      this.showNotification('Error: ' + error.message, 'error');
    }
  }
  findUserByUsername(username) {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('user_')) {
        try {
          const userData = JSON.parse(localStorage.getItem(key));
          if (userData.username === username) {
            return { email: userData.email, userData: userData };
          }
        } catch (e) {
          continue;
        }
      }
    }
    return null;
  }

  async register() {
    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const captchaAnswer = document.getElementById('captchaInput').value.trim();

    if (!username || !email || !password || !confirmPassword) {
      this.showNotification('Por favor completa todos los campos', 'error');
      return;
    }

    if (password !== confirmPassword) {
      this.showNotification('Las contraseñas no coinciden', 'error');
      return;
    }

    if (password.length < 6) {
      this.showNotification('La contraseña debe tener al menos 6 caracteres', 'error');
      return;
    }

    if (captchaAnswer !== this.captcha.answer) {
      this.showNotification('Captcha incorrecto', 'error');
      this.generateCaptcha();
      document.getElementById('captchaInput').value = '';
      return;
    }

    try {
      const userCredential = await window.authFunctions.signUpWithEmail(email, password);
      
      const userData = {
        username: username,
        email: email,
        profileImage: '/img-galery/user-profile.png'
      };
      
      if (window.firestoreManager) {
        await window.firestoreManager.createUser(userCredential.user.uid, userData);
      }
      
      localStorage.setItem(`user_${userCredential.user.uid}`, JSON.stringify({
        ...userData,
        role: 'usuario',
        createdAt: new Date().toISOString()
      }));
      
      // Cargar notificaciones para el nuevo usuario
      setTimeout(async () => {
        await this.updateNotificationCount();
      }, 500);
      
      this.hideModal();
      this.showNotification('¡Cuenta creada exitosamente!', 'success');
      
      // Recargar la página después de registrarse
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      this.showNotification('Error: ' + error.message, 'error');
    }
  }



  async googleAuth() {
    try {
      const result = await window.authFunctions.signInWithGoogle();
      this.hideModal();
      this.showNotification('¡Bienvenido!', 'success');
      
      // Recargar la página después de iniciar sesión con Google
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      this.showNotification('Error: ' + error.message, 'error');
    }
  }




  async logout() {
    // Mostrar confirmación antes de cerrar sesión
    if (!confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      return;
    }
    
    try {
      await window.authFunctions.signOut();
      this.showNotification('Sesión cerrada', 'info');
      this.hideModal();
      
      // Recargar la página después de cerrar sesión
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      this.showNotification('Error: ' + error.message, 'error');
    }
  }



  


  checkAuthState() {
    if (window.authFunctions) {
      window.authFunctions.onAuthStateChanged(async (user) => {
        this.currentUser = user;
        
        // Get admin role from Firestore if user exists
        if (user && window.firestoreManager) {
          try {
            const role = await window.firestoreManager.getUserRole(user.uid);
            const storedData = localStorage.getItem(`user_${user.uid}`);
            const userData = storedData ? JSON.parse(storedData) : {};
            
            // Update localStorage with role from Firestore
            localStorage.setItem(`user_${user.uid}`, JSON.stringify({
              ...userData,
              role: role,
              isAdmin: role === 'administrador'
            }));
          } catch (error) {
            console.log('Error getting user role:', error);
          }
        }
        
        this.updateUI(user);
        
        // Update global reference
        window.currentUser = user;
        
        // Update admin controls visibility
        if (window.updateAdminControlsVisibility) {
          window.updateAdminControlsVisibility();
        }
      });
    }
  }



  async updateUI(user) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const userProfile = document.getElementById('userProfile');

    if (user) {
      // Cargar notificaciones para el usuario
      setTimeout(async () => {
        await this.updateNotificationCount();
      }, 1000);
      const authTabsEl = document.getElementById('authTabs');
      const userTabsEl = document.getElementById('userTabs');
      
      if (authTabsEl) authTabsEl.style.display = 'none';
      if (userTabsEl) userTabsEl.style.display = 'flex';
      
      if (loginForm) {
        loginForm.classList.remove('active');
        loginForm.style.display = 'none';
      }
      if (registerForm) {
        registerForm.classList.remove('active');
        registerForm.style.display = 'none';
      }
      
      document.querySelectorAll('.user-content').forEach(c => c.style.display = 'none');
      
      if (userProfile) userProfile.style.display = 'block';
      
      document.querySelectorAll('.user-tab').forEach(t => t.classList.remove('active'));
      const profileTab = document.querySelector('[data-tab="profile"]');
      if (profileTab) profileTab.classList.add('active');
      
      // Get user data
      const storedData = localStorage.getItem(`user_${user.uid}`);
      const userData = storedData ? JSON.parse(storedData) : {};
      
      const userName = userData.username || user.displayName || user.email.split('@')[0];
      const profileImage = userData.profileImage || user.photoURL;
      
      // Update profile information
      const emailEl = document.getElementById('userEmail');
      const displayNameHeaderEl = document.getElementById('userDisplayNameHeader');
      const descriptionHeaderEl = document.getElementById('userDescriptionHeader');
      const profilePicEl = document.getElementById('userProfilePic');
      const userCreatedEl = document.getElementById('userCreated');
      const userLastLoginEl = document.getElementById('userLastLogin');
      const userRoleEl = document.getElementById('userRole');
      
      if (displayNameHeaderEl) displayNameHeaderEl.textContent = userName;
      if (descriptionHeaderEl) {
        const description = userData?.description || '';
        descriptionHeaderEl.textContent = description || 'Sin descripción';
        descriptionHeaderEl.style.display = description ? 'block' : 'none';
      }
      if (emailEl) emailEl.textContent = user.email;
      if (profilePicEl) {
        const userProfileImage = profileImage || user.photoURL || '/img-galery/user-profile.png';
        profilePicEl.src = userProfileImage;
        profilePicEl.style.display = 'block';
        profilePicEl.onerror = function() {
          this.src = '/img-galery/user-profile.png';
        };
      }
      
      // Update user data
      if (userCreatedEl) {
        const createdDate = new Date(user.metadata.creationTime).toLocaleDateString('es-ES');
        userCreatedEl.textContent = createdDate;
      }
      if (userLastLoginEl) {
        const lastLogin = new Date(user.metadata.lastSignInTime).toLocaleDateString('es-ES');
        userLastLoginEl.textContent = lastLogin;
      }
      // Check admin status from Firebase
      if (userRoleEl && window.firestoreManager) {
        window.firestoreManager.getDocument('admin', user.uid)
          .then(adminDoc => {
            const isAdmin = adminDoc.exists();
            userRoleEl.textContent = isAdmin ? 'Administrador' : 'Usuario';
            
            // Store admin status for other functions
            userData.isAdmin = isAdmin;
            localStorage.setItem(`user_${user.uid}`, JSON.stringify({
              ...userData,
              role: isAdmin ? 'administrador' : 'usuario'
            }));
          })
          .catch(error => {
            console.log('Error checking admin status:', error);
            userRoleEl.textContent = 'Usuario';
          });
      }
      
      // Update account icon
      document.querySelectorAll('.account-toggle').forEach(btn => {
        const userProfileImage = profileImage || user.photoURL || '/img-galery/user-profile.png';
        btn.innerHTML = `<img src="${userProfileImage}" alt="Perfil" class="user-profile-pic">`;
        const img = btn.querySelector('img');
        img.onerror = () => { img.src = '/img-galery/user-profile.png'; };
      });
      

      
      // Auto-load all user settings immediately - SIN valores por defecto
      setTimeout(async () => {
        try {
          let userSettings = await window.firestoreManager.getUserSettings(user.uid);
          console.log('🔧 Configuraciones cargadas al iniciar sesión:', userSettings);
          
          // NO aplicar corrección automática de configuraciones de privacidad
          // Solo aplicar las configuraciones que realmente existen
          this.applyAllSettings(userSettings);
          
          // Aplicar configuraciones de rendimiento si existen
          if (userSettings.performanceSettings && window.userPanelConfig) {
            window.userPanelConfig.applyPerformanceSettings(userSettings.performanceSettings);
          }
        } catch (error) {
          console.error('Error loading user settings on login:', error);
          // NO aplicar configuraciones por defecto automáticamente
          this.applyAllSettings({});
        }
        
        // Marcar usuario como online
        if (window.userActivitySystem) {
          await window.userActivitySystem.setUserOnline(user.uid);
          console.log('🟢 Usuario marcado como online:', user.uid);
          
          // Force update activity indicators after user is online
          setTimeout(() => {
            if (window.commentsSystem && window.commentsSystem.updateActivityIndicators) {
              // Get all comments currently visible and update their indicators
              const allComments = document.querySelectorAll('.comment');
              const commentData = [];
              allComments.forEach(comment => {
                const userId = comment.querySelector('[data-user-id]')?.getAttribute('data-user-id');
                if (userId) {
                  commentData.push({ userId });
                }
              });
              if (commentData.length > 0) {
                window.commentsSystem.updateActivityIndicators(commentData);
              }
            }
          }, 2000);
        } else {
          console.log('⚠️ userActivitySystem no disponible');
        }
        
        // Configurar funcionalidades adicionales
        this.setupDeleteAccount();
        this.setupEditProfile();
        
        // Inicializar handlers de configuraciones de privacidad
        if (window.initPrivacySettingsHandlers) {
          window.initPrivacySettingsHandlers();
        }
        
        setTimeout(async () => {
          await this.updateNotificationCount();
        }, 500);
      }, 100);
    } else {
      const authTabsEl = document.getElementById('authTabs');
      const userTabsEl = document.getElementById('userTabs');
      
      if (authTabsEl) authTabsEl.style.display = 'flex';
      if (userTabsEl) userTabsEl.style.display = 'none';
      
      if (loginForm) {
        loginForm.classList.add('active');
        loginForm.style.display = 'block';
      }
      if (registerForm) {
        registerForm.classList.remove('active');
        registerForm.style.display = 'none';
      }
      if (userProfile) userProfile.style.display = 'none';
      
      document.querySelectorAll('.user-content').forEach(c => c.style.display = 'none');
      
      document.querySelectorAll('.account-toggle').forEach(btn => {
        btn.innerHTML = `<img src="/img-galery/account.svg" alt="Cuenta" class="account-icon">`;
      });
      

      
      // Limpiar indicadores de estado
      const statusIndicators = document.querySelectorAll('.status-indicator');
      statusIndicators.forEach(indicator => {
        indicator.style.display = 'none';
      });
    }
  }
}

// Export AuthModal class globally
window.AuthModal = AuthModal;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.authModal = new AuthModal();
  
  // Inicializar notificaciones al cargar la página
  setTimeout(async () => {
    if (window.authModal && window.authModal.currentUser) {
      await window.authModal.updateNotificationCount();
    }
  }, 1000);
  
  // Listener para nuevas notificaciones de productos
  window.addEventListener('newProductNotification', async () => {
    if (window.authModal && window.authModal.currentUser) {
      setTimeout(async () => {
        await window.authModal.updateNotificationCount();
      }, 2000);
    }
  });
});