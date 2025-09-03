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
      this.checkAuthState();
      setTimeout(() => this.generateCaptcha(), 100);
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
    ctx.font = 'bold 20px Arial';
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
    document.querySelectorAll('.account-toggle').forEach(btn => {
      btn.addEventListener('click', () => this.showModal());
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

  showModal() {
    this.modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // Aggressively stop all carousel activity
    window.carouselStopped = true;
    
    // Clear all possible intervals
    for (let i = 1; i < 99999; i++) {
      window.clearInterval(i);
    }
    
    // Stop carousel functions
    if (window.pauseCarousel) window.pauseCarousel();
    if (window.stopCarousel) window.stopCarousel();
    if (window.clearCarouselInterval) window.clearCarouselInterval();
    
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
        if (profileImageFile.size > 1024 * 1024) {
          this.showNotification('La imagen debe ser menor a 1MB', 'error');
          return;
        }
        profileImageUrl = await this.convertToBase64(profileImageFile);
      }
      
      // Store additional user data in localStorage (in production use Firestore)
      const userData = {
        username: username,
        email: email,
        profileImage: profileImageUrl,
        createdAt: new Date().toISOString()
      };
      localStorage.setItem(`user_${userCredential.user.uid}`, JSON.stringify(userData));
      
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
      profileImage: profileImageUrl,
      isGoogleUser: true,
      createdAt: new Date().toISOString(),
      lastProfileEdit: null
    };
    
    localStorage.setItem(`user_${user.uid}`, JSON.stringify(userData));
    
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
    
    const storedData = localStorage.getItem(`user_${this.currentUser.uid}`);
    const userData = storedData ? JSON.parse(storedData) : {};
    
    // Check if 15 minutes have passed since last edit
    if (userData.lastProfileEdit) {
      const lastEdit = new Date(userData.lastProfileEdit);
      const now = new Date();
      const timeDiff = (now - lastEdit) / (1000 * 60); // minutes
      
      if (timeDiff < 15) {
        const remainingTime = Math.ceil(15 - timeDiff);
        this.showNotification(`Puedes editar tu perfil en ${remainingTime} minutos`, 'error');
        return;
      }
    }
    
    const currentUsername = userData.username || this.currentUser.displayName || this.currentUser.email.split('@')[0];
    
    const editHTML = `
      <div id="editProfile" class="auth-form active">
        <h3>Editar Perfil</h3>
        <div class="input-group">
          <input type="text" id="editUsername" placeholder="Nombre de usuario" maxlength="15" value="${currentUsername}" required>
          <div class="input-hint">Solo letras, números y guiones bajos</div>
        </div>
        <div class="profile-setup">
          <p style="font-weight: 600; margin-bottom: 0.75rem;">Cambiar foto de perfil:</p>
          <div class="profile-options">
            <label class="profile-option">
              <input type="radio" name="editProfileOption" value="current" checked>
              <img src="${userData.profileImage || this.currentUser.photoURL || '/img-galery/account.svg'}" class="user-profile-pic" alt="Foto actual">
              <span>Mantener foto actual</span>
            </label>
            <label class="profile-option">
              <input type="radio" name="editProfileOption" value="upload">
              <span>📷 Subir nueva foto</span>
            </label>
          </div>
          <input type="file" id="editProfileImage" accept="image/*" style="display: none;">
        </div>
        <button id="saveEditProfile" class="auth-btn">Guardar Cambios</button>
        <button id="cancelEditProfile" class="logout-btn">Cancelar</button>
      </div>
    `;
    
    // Hide profile and show edit form
    document.getElementById('userProfile').style.display = 'none';
    document.querySelector('.auth-modal-content').insertAdjacentHTML('beforeend', editHTML);
    
    // Bind events
    document.querySelector('input[value="upload"]').addEventListener('change', () => {
      document.getElementById('editProfileImage').style.display = 'block';
    });
    
    document.querySelector('input[value="current"]').addEventListener('change', () => {
      document.getElementById('editProfileImage').style.display = 'none';
    });
    
    document.getElementById('saveEditProfile').addEventListener('click', () => {
      this.saveEditProfile();
    });
    
    document.getElementById('cancelEditProfile').addEventListener('click', () => {
      this.cancelEditProfile();
    });
  }
  
  async saveEditProfile() {
    const username = document.getElementById('editUsername').value;
    const profileOption = document.querySelector('input[name="editProfileOption"]:checked').value;
    
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
    
    if (profileOption === 'upload') {
      const profileImageFile = document.getElementById('editProfileImage').files[0];
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
    
    const updatedUserData = {
      ...userData,
      username: username,
      profileImage: profileImageUrl,
      updatedAt: new Date().toISOString(),
      lastProfileEdit: new Date().toISOString()
    };
    
    localStorage.setItem(`user_${this.currentUser.uid}`, JSON.stringify(updatedUserData));
    
    this.cancelEditProfile();
    this.updateUI(this.currentUser);
    this.showNotification('¡Perfil actualizado exitosamente!', 'success');
  }
  
  cancelEditProfile() {
    const editForm = document.getElementById('editProfile');
    if (editForm) editForm.remove();
    document.getElementById('userProfile').style.display = 'block';
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
      // Configure custom action URL
      const actionCodeSettings = {
        url: window.location.origin + '/reset-password.html',
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

  updateUI(user) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const userProfile = document.getElementById('userProfile');
    const authTabs = document.querySelector('.auth-tabs');

    if (user) {
      // Hide login/register forms and tabs, show profile
      if (authTabs) authTabs.style.display = 'none';
      if (loginForm) {
        loginForm.classList.remove('active');
        loginForm.style.display = 'none';
      }
      if (registerForm) {
        registerForm.classList.remove('active');
        registerForm.style.display = 'none';
      }
      if (userProfile) userProfile.style.display = 'block';
      
      // Get stored user data
      const storedData = localStorage.getItem(`user_${user.uid}`);
      const userData = storedData ? JSON.parse(storedData) : {};
      
      const userName = userData.username || user.displayName || user.email.split('@')[0];
      const profileImage = userData.profileImage || user.photoURL;
      
      // Update profile information
      const emailEl = document.getElementById('userEmail');
      const createdEl = document.getElementById('userCreated');
      const lastLoginEl = document.getElementById('userLastLogin');
      const profilePicEl = document.getElementById('userProfilePic');
      const tempPasswordEl = document.getElementById('userTempPassword');
      const tempPasswordItem = document.getElementById('tempPasswordItem');
      
      // Update profile header name
      const displayNameHeaderEl = document.getElementById('userDisplayNameHeader');
      if (displayNameHeaderEl) displayNameHeaderEl.textContent = userName;
      if (emailEl) emailEl.textContent = user.email;
      if (createdEl) createdEl.textContent = this.formatDate(user.metadata.creationTime);
      if (lastLoginEl) lastLoginEl.textContent = this.formatDate(user.metadata.lastSignInTime);
      
      // Hide temp password for all users
      if (tempPasswordItem) tempPasswordItem.style.display = 'none';
      
      const loginOptionsEl = document.getElementById('userLoginOptions');
      const loginOptionsItem = document.getElementById('loginOptionsItem');
      if (loginOptionsItem) loginOptionsItem.style.display = 'none';
      
      // Update profile picture
      if (profilePicEl) {
        if (profileImage) {
          profilePicEl.src = profileImage;
          profilePicEl.style.display = 'block';
        } else {
          profilePicEl.style.display = 'none';
        }
      }
      
      // Update account icon with profile picture
      document.querySelectorAll('.account-toggle').forEach(btn => {
        if (profileImage) {
          btn.innerHTML = `<img src="${profileImage}" alt="Perfil" class="user-profile-pic">`;
        } else {
          btn.innerHTML = `<img src="/img-galery/account.svg" alt="Cuenta" class="account-icon" style="filter: hue-rotate(120deg) brightness(1.2);">`;
        }
      });
    } else {
      // Show login/register forms and tabs, hide profile
      if (authTabs) authTabs.style.display = 'flex';
      if (loginForm) {
        loginForm.classList.add('active');
        loginForm.style.display = 'block';
      }
      if (registerForm) {
        registerForm.classList.remove('active');
        registerForm.style.display = 'none';
      }
      if (userProfile) userProfile.style.display = 'none';
      
      // Reset account icon
      document.querySelectorAll('.account-toggle').forEach(btn => {
        btn.innerHTML = `<img src="/img-galery/account.svg" alt="Cuenta" class="account-icon">`;
      });
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new AuthModal();
});