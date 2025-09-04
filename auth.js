// Auth modal functionality
class AuthModal {
  constructor() {
    this.modal = null;
    this.currentUser = null;
    this.captcha = { question: '', answer: '' };
    this.init();
  }

  // Notification system
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 100);
    
    const duration = type === 'success' ? 5000 : 3000; // Success messages stay longer
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
    // Account button click
    const self = this;
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
    
    // User tab switching
    document.querySelectorAll('.user-tab').forEach(tab => {
      tab.addEventListener('click', () => this.switchUserTab(tab.dataset.tab));
    });
    
    // Settings event listeners
    this.bindSettingsEvents();
    
    // Likes management
    this.bindLikesEvents();
    


    // Username validation
    const usernameInput = document.getElementById('registerUsername');
    if (usernameInput) {
      usernameInput.addEventListener('input', (e) => {
        this.validateUsername(e.target.value);
      });
    }

    // Password strength
    const passwordInput = document.getElementById('registerPassword');
    if (passwordInput) {
      passwordInput.addEventListener('input', (e) => {
        this.updatePasswordStrength(e.target.value);
      });
    }

    // Captcha refresh
    const refreshBtn = document.getElementById('refreshCaptcha');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        this.generateCaptcha();
      });
    }
    
    // Profile image validation
    const profileImageInput = document.getElementById('profileImage');
    if (profileImageInput) {
      profileImageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file && file.size > 1024 * 1024) {
          this.showNotification('La imagen debe ser menor a 1MB', 'error');
          e.target.value = '';
        }
      });
    }

    // Auth buttons
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const googleBtn = document.getElementById('googleLoginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const editProfileBtn = document.getElementById('editProfileBtn');
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');

    if (loginBtn) loginBtn.addEventListener('click', () => this.login());
    if (registerBtn) registerBtn.addEventListener('click', () => this.register());
    if (googleBtn) googleBtn.addEventListener('click', () => this.googleAuth());
    if (logoutBtn) logoutBtn.addEventListener('click', () => this.logout());
    if (editProfileBtn) editProfileBtn.addEventListener('click', () => this.showEditProfile());
    if (forgotPasswordLink) forgotPasswordLink.addEventListener('click', (e) => {
      e.preventDefault();
      this.showForgotPassword();
    });
  }
  
  bindSettingsEvents() {
    // Settings toggles
    document.addEventListener('change', (e) => {
      if (e.target.matches('#emailNotifications, #promotionNotifications, #animationsEnabled, #compactMode, #profilePublic, #activityVisible')) {
        this.saveUserSettings();
      }
    });
    
    // Delete account button
    const deleteBtn = document.getElementById('deleteAccountBtn');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => this.confirmDeleteAccount());
    }
  }
  
  bindLikesEvents() {
    // Clear likes button
    const clearLikesBtn = document.getElementById('clearLikesBtn');
    if (clearLikesBtn) {
      clearLikesBtn.addEventListener('click', () => this.clearAllLikes());
    }
    
    // Dropdown events
    setTimeout(() => this.bindDropdownEvents(), 100);
  }
  
  bindDropdownEvents() {
    const self = this;
    
    // View profile button
    document.addEventListener('click', function(e) {
      if (e.target.closest('#viewProfileBtn')) {
        self.hideUserDropdown();
        self.showModal();
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
    this.modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // Stop carousel activity
    window.carouselStopped = true;
    
    // If user is logged in, show profile directly
    if (this.currentUser) {
      this.updateUI(this.currentUser);
    }
  }

  hideModal() {
    this.modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    
    // Allow carousel to resume
    window.carouselStopped = false;
    
    // Resume carousel with delay
    setTimeout(() => {
      if (window.resumeCarousel) window.resumeCarousel();
      if (window.startCarousel) window.startCarousel();
      if (window.initCarouselInterval) window.initCarouselInterval();
    }, 100);
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
      this.updateUserStats();
    } else if (tab === 'likes') {
      document.getElementById('userLikes').style.display = 'block';
      this.updateLikesDisplay();
    } else if (tab === 'saved') {
      document.getElementById('userSaved').style.display = 'block';
      this.updateSavedDisplay();
    } else if (tab === 'settings') {
      document.getElementById('userSettings').style.display = 'block';
      this.loadUserSettings();
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
      let userData = null;
      
      // Check if input is username instead of email
      if (!emailOrUsername.includes('@')) {
        // Find email and user data by username
        const result = this.findUserByUsername(emailOrUsername);
        if (!result) {
          this.showNotification('Usuario no encontrado', 'error');
          return;
        }
        email = result.email;
        userData = result.userData;
      } else {
        // Find user data by email
        userData = this.findUserByEmail(email);
      }
      
      // Check if it's a Google user
      if (userData && userData.isGoogleUser) {
        // Google users must use Google sign-in
        try {
          const result = await window.authFunctions.signInWithGoogleEmail(email);
          // Verify the signed-in email matches the requested email
          if (result.user.email !== email) {
            await window.authFunctions.signOut();
            this.showNotification('Email incorrecto. Usa la cuenta de Google correcta.', 'error');
            return;
          }
        } catch (googleError) {
          this.showNotification('Error: Usa el botón "Continuar con Google"', 'error');
          return;
        }
      } else {
        // Regular email/password login
        await window.authFunctions.signInWithEmail(email, password);
      }
      
      this.hideModal();
      this.showNotification('¡Bienvenido de vuelta!', 'success');
    } catch (error) {
      this.showNotification('Error: ' + error.message, 'error');
    }
  }
  
  findEmailByUsername(username) {
    const result = this.findUserByUsername(username);
    return result ? result.email : null;
  }
  
  findUserByUsername(username) {
    // Search through localStorage for matching username
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
  
  findUserByEmail(email) {
    // Search through localStorage for matching email
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('user_')) {
        try {
          const userData = JSON.parse(localStorage.getItem(key));
          if (userData.email === email) {
            return userData;
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

    // Validate username format
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
      this.showNotification('El nombre de usuario solo puede contener letras, números y guiones bajos', 'error');
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
      
      // Handle profile image
      const profileImageFile = document.getElementById('profileImage').files[0];
      let profileImageUrl = null;
      
      if (profileImageFile) {
        profileImageUrl = await this.convertToBase64(profileImageFile);
      }
      
      // Store user data in Firestore
      const userData = {
        username: username,
        email: email,
        profileImage: profileImageUrl || '/img-galery/user-profile.png'
      };
      
      // Save to Firestore
      if (window.firestoreManager) {
        await window.firestoreManager.createUser(userCredential.user.uid, userData);
      }
      
      // Keep localStorage as backup
      localStorage.setItem(`user_${userCredential.user.uid}`, JSON.stringify({
        ...userData, // Corregido de .userData
        role: 'usuario',
        createdAt: new Date().toISOString()
      }));
      
      // Store password for recovery (in production, use encrypted storage)
      localStorage.setItem(`password_${email}`, password);
      
      this.hideModal();
      this.showNotification('¡Cuenta creada exitosamente!', 'success');
    } catch (error) {
      this.showNotification('Error: ' + error.message, 'error');
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

  async googleAuth() {
    try {
      const result = await window.authFunctions.signInWithGoogle();
      const user = result.user;
      
      // Check if user is new
      const isNewUser = result.additionalUserInfo?.isNewUser;
      
      if (isNewUser) {
        // Show username setup for new Google users
        this.showGoogleUserSetup(user);
      } else {
        this.hideModal();
        this.showNotification('¡Bienvenido de vuelta!', 'success');
      }
    } catch (error) {
      this.showNotification('Error: ' + error.message, 'error');
    }
  }

  showGoogleUserSetup(user) {
    // Generate username from Google name
    const suggestedUsername = user.displayName ? 
      user.displayName.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 15) : 
      user.email.split('@')[0].replace(/[^a-z0-9]/g, '').substring(0, 15);
    
    const setupHTML = `
      <div id="googleSetup" class="auth-form active">
        <h3>¿Cómo querés que te llamen?</h3>
        <p style="text-align: center; color: #666; margin-bottom: 1.5rem;">¡Hola ${user.displayName || 'Usuario'}! Personaliza tu perfil</p>
        <div class="input-group">
          <input type="text" id="googleUsername" placeholder="Nombre de usuario" maxlength="15" value="${suggestedUsername}" required>
          <div class="input-hint">Solo letras, números y guiones bajos</div>
        </div>
        <div class="profile-setup">
          <p style="font-weight: 600; margin-bottom: 0.75rem;">Elige tu foto de perfil:</p>
          <div class="profile-options">
            <label class="profile-option">
              <input type="radio" name="profileOption" value="google" checked>
              <img src="${user.photoURL || '/img-galery/account.svg'}" class="user-profile-pic" alt="Foto de Google">
              <span>Usar mi foto de Google</span>
            </label>
            <label class="profile-option">
              <input type="radio" name="profileOption" value="upload">
              <span>📷 Subir una foto nueva</span>
            </label>
          </div>
          <input type="file" id="googleProfileImage" accept="image/*" style="display: none;">
        </div>
        <button id="saveGoogleSetup" class="auth-btn">¡Listo, continuar!</button>
      </div>
    `;
    
    // Hide tabs and other forms
    document.querySelector('.auth-tabs').style.display = 'none';
    document.querySelectorAll('.auth-form').forEach(f => f.style.display = 'none');
    document.querySelector('.auth-modal-content').insertAdjacentHTML('beforeend', setupHTML);
    
    // Bind events
    document.querySelector('input[value="upload"]').addEventListener('change', () => {
      document.getElementById('googleProfileImage').style.display = 'block';
    });
    
    document.querySelector('input[value="google"]').addEventListener('change', () => {
      document.getElementById('googleProfileImage').style.display = 'none';
    });
    
    document.getElementById('saveGoogleSetup').addEventListener('click', () => {
      this.saveGoogleUserData(user);
    });
  }

  async saveGoogleUserData(user) {
    const username = document.getElementById('googleUsername').value;
    const profileOption = document.querySelector('input[name="profileOption"]:checked').value;
    
    if (!username) {
      this.showNotification('Por favor ingresa un nombre de usuario', 'error');
      return;
    }
    
    // Validate username format
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
      this.showNotification('El nombre de usuario solo puede contener letras, números y guiones bajos', 'error');
      return;
    }
    
    let profileImageUrl = user.photoURL;
    
    // Handle custom profile image
    if (profileOption === 'upload') {
      const profileImageFile = document.getElementById('googleProfileImage').files[0];
      if (profileImageFile) {
        if (profileImageFile.size > 1024 * 1024) {
          this.showNotification('La imagen debe ser menor a 1MB', 'error');
          return;
        }
        profileImageUrl = await this.convertToBase64(profileImageFile);
      } else {
        this.showNotification('Por favor selecciona una imagen', 'error');
        return;
      }
    }
    
    const userData = {
      username: username,
      email: user.email,
      profileImage: profileImageUrl || '/img-galery/user-profile.png',
      isGoogleUser: true,
      lastProfileEdit: null
    };
    
    // Save to Firestore
    if (window.firestoreManager) {
      await window.firestoreManager.createUser(user.uid, userData);
    }
    
    // Keep localStorage as backup
    localStorage.setItem(`user_${user.uid}`, JSON.stringify({
      ...userData, // Corregido de .userData
      role: 'usuario',
      createdAt: new Date().toISOString()
    }));
    
    // Remove setup form and restore tabs
    document.getElementById('googleSetup').remove();
    document.querySelector('.auth-tabs').style.display = 'flex';
    
    this.hideModal();
    this.showNotification('¡Perfil configurado! Usa "Continuar con Google" para iniciar sesión', 'success');
  }
  
  generateTempPassword() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  async logout() {
    try {
      await window.authFunctions.signOut();
      this.showNotification('Sesión cerrada', 'info');
      this.hideModal();
    } catch (error) {
      this.showNotification('Error: ' + error.message, 'error');
    }
  }

  showEditProfile() {
    if (!this.currentUser) return;
    
    // Cerrar el modal de usuario
    this.hideModal();
    
    const storedData = localStorage.getItem(`user_${this.currentUser.uid}`);
    const userData = storedData ? JSON.parse(storedData) : {};
    const currentUsername = userData.username || this.currentUser.displayName || this.currentUser.email.split('@')[0];
    const currentImage = userData.profileImage || this.currentUser.photoURL || '/img-galery/user-profile.png';
    
    const editHTML = `
      <div id="editProfile" class="edit-profile-form">
        <div class="edit-profile-container">
          <div class="edit-profile-header">
            <h3>Editar Perfil</h3>
            <button id="cancelEditProfile" class="edit-close-btn">×</button>
          </div>
          
          <div class="edit-profile-content">
            <div class="profile-preview">
              <img id="previewImage" class="profile-preview-img" src="${currentImage}" alt="Vista previa">
              <div class="profile-preview-info">
                <div class="profile-preview-name" id="previewName">${currentUsername}</div>
                <div class="profile-preview-email">${this.currentUser.email}</div>
              </div>
            </div>
            
            <div class="edit-input-group">
              <label>Nombre de usuario (máx. 20 caracteres)</label>
              <input type="text" id="editUsername" maxlength="20" value="${currentUsername}" required>
              <div class="character-count">0/20 caracteres</div>
            </div>
            
            <div class="edit-input-group">
              <label>Foto de perfil (máx. 1MB)</label>
              <input type="file" id="editProfileImage" accept="image/*">
              <div class="file-info" id="fileInfo">Ningún archivo seleccionado</div>
            </div>
            
            <div class="edit-input-group">
              <label>Cambiar contraseña</label>
              <div class="password-toggle-container">
                <input type="password" id="editPassword" placeholder="Nueva contraseña (opcional)">
                <button type="button" class="edit-password-toggle" data-target="editPassword">
                  <img src="/img-galery/ojos.svg" alt="Mostrar contraseña">
                </button>
              </div>
            </div>
            
            <div class="edit-profile-actions">
              <button id="saveEditProfile" class="edit-save-btn">Guardar Cambios</button>
              <button id="cancelEditProfileAlt" class="edit-cancel-btn">Cancelar</button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', editHTML);
    document.body.style.overflow = 'hidden';
    
    // Preview de imagen
    const editImageInput = document.getElementById('editProfileImage');
    const previewImage = document.getElementById('previewImage');
    const usernameInput = document.getElementById('editUsername');
    const previewName = document.getElementById('previewName');
    
    editImageInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        if (file.size > 1024 * 1024) {
          this.showNotification('La imagen debe ser menor a 1MB', 'error');
          e.target.value = '';
          return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
          previewImage.src = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    });
    
    usernameInput.addEventListener('input', (e) => {
      const value = e.target.value;
      previewName.textContent = value || 'Usuario';
      
      // Update character count
      const charCount = document.querySelector('.character-count');
      if (charCount) {
        charCount.textContent = `${value.length}/20 caracteres`;
        charCount.style.color = value.length > 15 ? '#ff6b9d' : '#6c757d';
      }
    });
    
    // File info display
    editImageInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      const fileInfo = document.getElementById('fileInfo');
      
      if (file) {
        if (file.size > 1024 * 1024) {
          this.showNotification('La imagen debe ser menor a 1MB', 'error');
          e.target.value = '';
          fileInfo.textContent = 'Ningún archivo seleccionado';
          fileInfo.style.color = '#6c757d';
          return;
        }
        
        const sizeKB = Math.round(file.size / 1024);
        fileInfo.textContent = `${file.name} (${sizeKB}KB)`;
        fileInfo.style.color = '#28a745';
        
        const reader = new FileReader();
        reader.onload = (e) => {
          previewImage.src = e.target.result;
        };
        reader.readAsDataURL(file);
      } else {
        fileInfo.textContent = 'Ningún archivo seleccionado';
        fileInfo.style.color = '#6c757d';
      }
    });
    
    // Password toggle
    document.addEventListener('click', (e) => {
      if (e.target.closest('.edit-password-toggle')) {
        const button = e.target.closest('.edit-password-toggle');
        const targetId = button.getAttribute('data-target');
        const input = document.getElementById(targetId);
        const img = button.querySelector('img');
        
        if (input && img) {
          if (input.type === 'password') {
            input.type = 'text';
            img.src = '/img-galery/ojos_abiertos.svg';
          } else {
            input.type = 'password';
            img.src = '/img-galery/ojos.svg';
          }
        }
      }
    });
    
    // Initialize character count
    const charCount = document.querySelector('.character-count');
    if (charCount) {
      charCount.textContent = `${currentUsername.length}/20 caracteres`;
    }
    
    document.getElementById('saveEditProfile').addEventListener('click', () => this.saveEditProfile());
    document.getElementById('cancelEditProfile').addEventListener('click', () => this.cancelEditProfile());
    document.getElementById('cancelEditProfileAlt').addEventListener('click', () => this.cancelEditProfile());
  }
  
  async saveEditProfile() {
    const username = document.getElementById('editUsername').value;
    
    if (!username) {
      this.showNotification('Por favor ingresa un nombre de usuario', 'error');
      return;
    }
    
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
      this.showNotification('El nombre de usuario solo puede contener letras, números y guiones bajos', 'error');
      return;
    }
    
    const storedData = localStorage.getItem(`user_${this.currentUser.uid}`);
    const userData = storedData ? JSON.parse(storedData) : {};
    let profileImageUrl = userData.profileImage || this.currentUser.photoURL;
    
    const profileImageFile = document.getElementById('editProfileImage').files[0];
    if (profileImageFile) {
      profileImageUrl = await this.convertToBase64(profileImageFile);
    }
    
    // Handle password change
    const newPassword = document.getElementById('editPassword').value;
    if (newPassword && newPassword.length >= 6) {
      try {
        await window.authFunctions.updatePassword(newPassword);
        this.showNotification('Contraseña actualizada', 'success');
      } catch (error) {
        this.showNotification('Error al actualizar contraseña: ' + error.message, 'error');
      }
    } else if (newPassword && newPassword.length < 6) {
      this.showNotification('La contraseña debe tener al menos 6 caracteres', 'error');
      return;
    }
    
    const updatedUserData = {
      ...userData,
      username: username,
      profileImage: profileImageUrl,
      updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem(`user_${this.currentUser.uid}`, JSON.stringify(updatedUserData));
    
    this.cancelEditProfile();
    this.updateUI(this.currentUser);
    this.showNotification('¡Perfil actualizado exitosamente!', 'success');
  }
  
  cancelEditProfile() {
    const editForm = document.getElementById('editProfile');
    if (editForm) editForm.remove();
    document.body.style.overflow = 'auto';
    
    // Reabrir el modal de usuario
    this.showModal();
  }
  
  async showForgotPassword() {
    const email = document.getElementById('loginEmail').value;
    
    if (!email) {
      this.showNotification('Ingresa tu email primero', 'error');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      this.showNotification('Ingresa un email válido', 'error');
      return;
    }
    
    try {
      // Store email for reset password page
      localStorage.setItem('reset_email', email);
      
      // Configure custom action URL
      const actionCodeSettings = {
        url: window.location.origin + '/reset-password.html?email=' + encodeURIComponent(email),
        handleCodeInApp: false
      };
      
      await window.authFunctions.sendPasswordResetEmail(email, actionCodeSettings);
      this.showNotification('Email de recuperación enviado. Revisa tu bandeja de entrada, spam y promociones.', 'success');
      
      setTimeout(() => {
        this.showNotification('Si no recibes el email en 5 minutos, verifica que el email sea correcto', 'info');
      }, 3000);
      
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        this.showNotification('No existe una cuenta con este email', 'error');
      } else if (error.code === 'auth/invalid-email') {
        this.showNotification('Email inválido', 'error');
      } else if (error.code === 'auth/too-many-requests') {
        this.showNotification('Demasiados intentos. Espera unos minutos e intenta de nuevo', 'error');
      } else {
        this.showNotification('Error al enviar email: ' + error.message, 'error');
      }
    }
  }
  


  checkAuthState() {
    if (window.authFunctions) {
      window.authFunctions.onAuthStateChanged((user) => {
        this.currentUser = user;
        this.updateUI(user);
        
        // Update global reference
        window.currentUser = user;
      });
    }
  }

  formatDate(timestamp) {
    if (!timestamp) return 'No disponible';
    const date = new Date(timestamp);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  updateUserStats() {
    if (!this.currentUser) return;
    
    const userLikes = JSON.parse(localStorage.getItem(`likes_${this.currentUser.uid}`)) || [];
    
    // Calculate user level based on likes
    const userLevel = Math.floor(userLikes.length / 5) + 1;
    
    // Update stats display
    document.getElementById('totalLikes').textContent = userLikes.length;
    document.getElementById('userLevel').textContent = userLevel;
  }
  
  updateActivityTimeline() {
    const timeline = document.getElementById('activityTimeline');
    const activities = [];
    
    if (this.currentUser) {
      activities.push({
        title: '¡Bienvenido!',
        date: 'Cuenta creada',
        time: this.currentUser.metadata.creationTime
      });
      
      if (this.currentUser.metadata.lastSignInTime !== this.currentUser.metadata.creationTime) {
        activities.push({
          title: 'Última conexión',
          date: this.formatDate(this.currentUser.metadata.lastSignInTime),
          time: this.currentUser.metadata.lastSignInTime
        });
      }
    }
    
    // Sort by time (most recent first)
    activities.sort((a, b) => new Date(b.time) - new Date(a.time));
    
    timeline.innerHTML = activities.map(activity => `
      <div class="timeline-item">
        <div class="timeline-dot"></div>
        <div class="timeline-content">
          <div class="timeline-title">${activity.title}</div>
          <div class="timeline-date">${activity.date}</div>
        </div>
      </div>
    `).join('');
  }
  
  updateLikesDisplay() {
    if (!this.currentUser) return;
    
    const userLikes = JSON.parse(localStorage.getItem(`likes_${this.currentUser.uid}`)) || [];
    const likesGrid = document.getElementById('likesGrid');
    const likesCount = document.getElementById('likesCount');
    
    if (likesCount) likesCount.textContent = userLikes.length;
    
    if (userLikes.length === 0) {
      likesGrid.innerHTML = '<p class="empty-state">No tienes productos en favoritos aún</p>';
      return;
    }
    
    // Assuming productos is available globally
    if (typeof productos !== 'undefined') {
      const likedProducts = productos.filter(p => userLikes.includes(p.id));
      
      likesGrid.innerHTML = likedProducts.map(product => `
        <div class="product-card-mini" onclick="window.location.href='details/details.html?id=${product.id}'">
          <img src="${product.imagen}" alt="${product.nombre}">
          <div class="info">
            <div class="name">${product.nombre}</div>
            <div class="price">$${product.precio.toLocaleString('es-AR')}</div>
          </div>
        </div>
      `).join('');
    }
  }
  
  updateSavedDisplay() {
    if (!this.currentUser) return;
    
    const userSaved = JSON.parse(localStorage.getItem(`saved_${this.currentUser.uid}`)) || [];
    const savedGrid = document.getElementById('savedGrid');
    
    if (userSaved.length === 0) {
      savedGrid.innerHTML = '<p class="empty-state">No tienes productos guardados aún</p>';
      return;
    }
    
    // Assuming productos is available globally
    if (typeof productos !== 'undefined') {
      const savedProducts = productos.filter(p => userSaved.includes(p.id));
      
      savedGrid.innerHTML = savedProducts.map(product => `
        <div class="product-card-mini" onclick="window.location.href='details/details.html?id=${product.id}'">
          <img src="${product.imagen}" alt="${product.nombre}">
          <div class="info">
            <div class="name">${product.nombre}</div>
            <div class="price">$${product.precio.toLocaleString('es-AR')}</div>
          </div>
        </div>
      `).join('');
    }
  }
  
  loadUserSettings() {
    if (!this.currentUser) return;
    
    const settings = JSON.parse(localStorage.getItem(`settings_${this.currentUser.uid}`)) || {
      emailNotifications: true,
      promotionNotifications: true,
      animationsEnabled: true,
      compactMode: false,
      profilePublic: false,
      activityVisible: false
    };
    
    // Apply settings to checkboxes
    Object.keys(settings).forEach(key => {
      const checkbox = document.getElementById(key);
      if (checkbox) {
        checkbox.checked = settings[key];
      }
    });
  }
  
  saveUserSettings() {
    if (!this.currentUser) return;
    
    const settings = {
      emailNotifications: document.getElementById('emailNotifications')?.checked || false,
      promotionNotifications: document.getElementById('promotionNotifications')?.checked || false,
      animationsEnabled: document.getElementById('animationsEnabled')?.checked || false,
      compactMode: document.getElementById('compactMode')?.checked || false,
      profilePublic: document.getElementById('profilePublic')?.checked || false,
      activityVisible: document.getElementById('activityVisible')?.checked || false
    };
    
    localStorage.setItem(`settings_${this.currentUser.uid}`, JSON.stringify(settings));
    this.showNotification('Configuración guardada', 'success');
  }
  
  clearAllLikes() {
    if (!this.currentUser) return;
    
    if (confirm('¿Estás seguro de que quieres eliminar todos tus productos favoritos?')) {
      localStorage.removeItem(`likes_${this.currentUser.uid}`);
      this.updateLikesDisplay();
      this.showNotification('Favoritos eliminados', 'info');
    }
  }
  
  confirmDeleteAccount() {
    if (!this.currentUser) return;
    
    const confirmation = prompt('Para eliminar tu cuenta, escribe "ELIMINAR" (en mayúsculas):');
    
    if (confirmation === 'ELIMINAR') {
      this.deleteUserAccount();
    } else if (confirmation !== null) {
      this.showNotification('Texto incorrecto. Cuenta no eliminada.', 'error');
    }
  }
  
  async deleteUserAccount() {
    if (!this.currentUser) return;
    
    try {
      // Clear all user data from localStorage
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.includes(this.currentUser.uid)) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      // Delete from Firebase Auth
      await this.currentUser.delete();
      
      this.showNotification('Cuenta eliminada exitosamente', 'success');
      this.hideModal();
    } catch (error) {
      this.showNotification('Error al eliminar la cuenta: ' + error.message, 'error');
    }
  }

  async updateUI(user) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const userProfile = document.getElementById('userProfile');
    const authTabs = document.querySelector('.auth-tabs');

    if (user) {
      // Hide login/register forms and tabs, show user tabs and profile
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
      
      // Hide all user content first
      document.querySelectorAll('.user-content').forEach(c => c.style.display = 'none');
      
      // Show profile by default
      if (userProfile) userProfile.style.display = 'block';
      
      // Set profile tab as active
      document.querySelectorAll('.user-tab').forEach(t => t.classList.remove('active'));
      const profileTab = document.querySelector('[data-tab="profile"]');
      if (profileTab) profileTab.classList.add('active');
      
      // Initialize user data
      this.updateUserStats();
      
      // Get user data and check admin status
      let userRole = 'usuario';
      
      // Check Firestore for admin status
      if (window.firestoreManager) {
        try {
          const isAdmin = await window.firestoreManager.isAdmin(user.uid);
          if (isAdmin) {
            userRole = 'administrador';
          }
        } catch (error) {
          console.error('Error checking admin status:', error);
        }
      }
      
      // Get other user data from localStorage
      const storedData = localStorage.getItem(`user_${user.uid}`);
      const userData = storedData ? JSON.parse(storedData) : {};
      
      // Update localStorage with correct role
      userData.role = userRole;
      localStorage.setItem(`user_${user.uid}`, JSON.stringify(userData));
      
      const userName = userData.username || user.displayName || user.email.split('@')[0];
      const profileImage = userData.profileImage || user.photoURL;
      
      // Update profile information
      const emailEl = document.getElementById('userEmail');
      const createdEl = document.getElementById('userCreated');
      const lastLoginEl = document.getElementById('userLastLogin');
      const profilePicEl = document.getElementById('userProfilePic');
      const tempPasswordEl = document.getElementById('userTempPassword');
      const tempPasswordItem = document.getElementById('tempPasswordItem');
      const roleEl = document.getElementById('userRole');
      
      // Update profile header name
      const displayNameHeaderEl = document.getElementById('userDisplayNameHeader');
      if (displayNameHeaderEl) {
        if (userRole === 'administrador') {
          displayNameHeaderEl.innerHTML = `<span class="admin-username">${userName}</span><img src="/img-galery/admin-verify.svg" alt="Verificado" class="admin-verify-icon">`;
        } else {
          displayNameHeaderEl.textContent = userName;
          displayNameHeaderEl.className = '';
        }
      }
      
      // Update profile fields with actual data
      if (emailEl) emailEl.textContent = user.email;
      if (createdEl) createdEl.textContent = this.formatDate(user.metadata.creationTime);
      if (lastLoginEl) lastLoginEl.textContent = this.formatDate(user.metadata.lastSignInTime);
      if (roleEl) {
        roleEl.textContent = userRole.charAt(0).toUpperCase() + userRole.slice(1);
        if (userRole === 'administrador') {
          roleEl.className = 'user-info-value admin-role';
        } else {
          roleEl.className = 'user-info-value';
        }
      }
      
      // Hide temp password for all users
      if (tempPasswordItem) tempPasswordItem.style.display = 'none';
      
      const loginOptionsEl = document.getElementById('userLoginOptions');
      const loginOptionsItem = document.getElementById('loginOptionsItem');
      if (loginOptionsItem) loginOptionsItem.style.display = 'none';
      
      // Update profile picture
      if (profilePicEl) {
        profilePicEl.src = profileImage || '/img-galery/user-profile.png';
        profilePicEl.style.display = 'block';
      }
      
      // Update status indicator
      const statusIndicator = document.getElementById('userStatusIndicator');
      if (statusIndicator) {
        statusIndicator.className = 'status-indicator online';
        statusIndicator.title = 'En línea';
      }
      
      // Update account icon with profile picture
      document.querySelectorAll('.account-toggle').forEach(btn => {
        const imgSrc = profileImage || '/img-galery/user-profile.png';
        btn.innerHTML = `<img src="${imgSrc}" alt="Perfil" class="user-profile-pic">`;
      });
    } else {
      // Show login/register forms and tabs, hide user tabs and profile
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
      
      // Hide all user content
      document.querySelectorAll('.user-content').forEach(c => c.style.display = 'none');
      
      // Reset account icon
      document.querySelectorAll('.account-toggle').forEach(btn => {
        btn.innerHTML = `<img src="/img-galery/account.svg" alt="Cuenta" class="account-icon">`;
      });
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.authModal = new AuthModal();
});