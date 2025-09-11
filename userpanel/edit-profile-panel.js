// Panel de Edición de Perfil - Idéntico al panel de eliminar cuenta
class EditProfilePanel {
  constructor() {
    this.modal = null;
    this.isClosing = false;
    this.selectedImageFile = null;
  }

  // Mostrar el panel de edición de perfil
  async show() {
    // Verificar si el usuario puede editar su perfil
    const canEdit = await this.canEditProfile();
    
    if (!canEdit) {
      const timeLeft = await this.getTimeUntilNextEdit();
      this.showEditProfileTimer(timeLeft);
      return;
    }

    // Cerrar todos los modales antes de abrir este
    this.closeAllModals();
    
    const user = window.authModal?.currentUser;
    if (!user) return;

    const userData = await window.firestoreManager.getUser(user.uid);
    const currentUsername = userData?.username || user.displayName || user.email.split('@')[0];
    const currentImage = userData?.profileImage || user.photoURL || '/img-galery/user-profile.png';
    const currentDescription = userData?.description || '';

    // Crear modal
    this.modal = document.createElement('div');
    this.modal.id = 'editProfilePanelModal';
    this.modal.className = 'edit-profile-panel-modal';
    this.modal.innerHTML = `
      <div class="edit-profile-panel-content">
        <div class="edit-profile-panel-icon">
          <img src="/img-galery/edit.svg" alt="Editar" style="width: 64px; height: 64px; filter: invert(0.5);">
        </div>
        <h3 class="edit-profile-panel-title">Editar Perfil</h3>
        <p class="edit-profile-panel-text">
          Actualiza tu información de perfil. Puedes cambiar tu nombre de usuario, descripción y foto de perfil.
        </p>
        
        <form class="edit-profile-panel-form">
          <div class="edit-profile-input-group">
            <label class="edit-profile-input-label">
              <img src="/img-galery/account.svg" alt="" style="width: 16px; height: 16px; margin-right: 8px; vertical-align: middle;">
              Nombre de usuario (máx. 20 caracteres)
            </label>
            <input type="text" class="edit-profile-input" id="editPanelUsername" value="${currentUsername}" maxlength="20">
            <div class="edit-profile-error-message" id="panelUsernameError"></div>
          </div>
          
          <div class="edit-profile-input-group">
            <label class="edit-profile-input-label">
              <img src="/img-galery/edit.svg" alt="" style="width: 16px; height: 16px; margin-right: 8px; vertical-align: middle;">
              Descripción (máx. 50 caracteres)
            </label>
            <input type="text" class="edit-profile-input" id="editPanelDescription" value="${currentDescription}" maxlength="50" placeholder="Cuéntanos algo sobre ti...">
            <div class="edit-profile-error-message" id="panelDescriptionError"></div>
          </div>
          
          <div class="edit-profile-input-group">
            <label class="edit-profile-input-label">
              <img src="/img-galery/profile.svg" alt="" style="width: 16px; height: 16px; margin-right: 8px; vertical-align: middle;">
              Foto de perfil (máx. 3MB)
            </label>
            <div class="file-upload-area" id="panelFileUploadArea">
              <div class="file-upload-icon">
                <img src="/img-galery/cloud.svg" alt="" style="width: 32px; height: 32px; filter: invert(0.5);">
              </div>
              <div class="file-upload-text">Haz clic para subir una imagen</div>
              <input type="file" id="editPanelProfileImage" accept="image/*" style="display: none;">
            </div>
            <div class="edit-profile-error-message" id="panelImageError"></div>
          </div>
          
          <div class="edit-profile-preview-container">
            <div class="edit-profile-preview-title">
              <img src="/img-galery/search-icon.svg" alt="" style="width: 16px; height: 16px; margin-right: 8px; vertical-align: middle;">
              Vista previa
            </div>
            <div class="edit-profile-preview-profile">
              <img src="${currentImage}" alt="Vista previa" class="edit-profile-preview-image" id="panelPreviewImage">
              <div class="edit-profile-preview-info">
                <h4 id="panelPreviewUsername">${currentUsername}</h4>
                <p id="panelPreviewDescription">${currentDescription || 'Sin descripción'}</p>
              </div>
            </div>
          </div>
        </form>
        
        <div class="edit-profile-panel-actions">
          <button class="edit-profile-cancel-btn">
            <img src="/img-galery/close.svg" alt="" style="width: 16px; height: 16px; margin-right: 8px; vertical-align: middle;">
            Cancelar
          </button>
          <button class="edit-profile-save-btn" id="panelSaveProfileBtn">
            <img src="/img-galery/valid.svg" alt="" style="width: 16px; height: 16px; margin-right: 8px; vertical-align: middle; filter: brightness(0) invert(1);">
            Guardar Cambios
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(this.modal);
    document.body.classList.add('modal-open');

    // Mostrar modal con animación
    setTimeout(() => {
      this.modal.classList.add('show');
    }, 10);

    this.setupEvents();
  }

  // Configurar eventos del panel
  setupEvents() {
    const usernameInput = this.modal.querySelector('#editPanelUsername');
    const descriptionInput = this.modal.querySelector('#editPanelDescription');
    const imageInput = this.modal.querySelector('#editPanelProfileImage');
    const fileUploadArea = this.modal.querySelector('#panelFileUploadArea');
    const previewImage = this.modal.querySelector('#panelPreviewImage');
    const previewUsername = this.modal.querySelector('#panelPreviewUsername');
    const previewDescription = this.modal.querySelector('#panelPreviewDescription');
    const saveBtn = this.modal.querySelector('#panelSaveProfileBtn');
    const cancelBtn = this.modal.querySelector('.edit-profile-cancel-btn');
    const usernameError = this.modal.querySelector('#panelUsernameError');
    const descriptionError = this.modal.querySelector('#panelDescriptionError');
    const imageError = this.modal.querySelector('#panelImageError');

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
        this.handleImageFile(files[0], fileUploadArea, imageError, previewImage);
      }
    });

    // Manejo de imagen
    imageInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        this.handleImageFile(file, fileUploadArea, imageError, previewImage);
      }
    });

    // Guardar cambios
    saveBtn.addEventListener('click', async () => {
      await this.saveProfileChanges(
        usernameInput.value.trim(), 
        descriptionInput.value.trim(),
        this.selectedImageFile
      );
    });

    // Cerrar panel
    cancelBtn.addEventListener('click', () => this.close());
    
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) this.close();
    });
    
    const content = this.modal.querySelector('.edit-profile-panel-content');
    if (content) {
      content.addEventListener('click', (e) => e.stopPropagation());
    }

    // Cerrar con Escape
    document.addEventListener('keydown', this.handleEscape = (e) => {
      if (e.key === 'Escape' && this.modal && this.modal.classList.contains('show')) {
        this.close();
      }
    });
  }

  // Manejar archivo de imagen
  handleImageFile(file, fileUploadArea, imageError, previewImage) {
    // Validar tamaño (3MB)
    if (file.size > 3 * 1024 * 1024) {
      imageError.textContent = 'La imagen debe ser menor a 3MB';
      return;
    }

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      imageError.textContent = 'Solo se permiten imágenes';
      return;
    }

    imageError.textContent = '';
    this.selectedImageFile = file;

    // Actualizar área de subida
    fileUploadArea.innerHTML = `
      <div class="file-upload-icon">
        <img src="/img-galery/valid.svg" alt="" style="width: 32px; height: 32px; filter: invert(0.3);">
      </div>
      <div class="file-upload-text">Imagen seleccionada: ${file.name}</div>
    `;

    // Mostrar vista previa
    const reader = new FileReader();
    reader.onload = (e) => {
      previewImage.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  // Guardar cambios del perfil
  async saveProfileChanges(newUsername, newDescription, imageFile) {
    try {
      const user = window.authModal?.currentUser;
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
        description: newDescription || '',
        lastProfileEdit: new Date()
      };

      if (profileImageUrl) {
        updateData.profileImage = profileImageUrl;
      }

      await window.firestoreManager.updateUser(user.uid, updateData);

      // Actualizar TODOS los comentarios del usuario en Firebase
      if (window.commentsSystem) {
        console.log('🔄 Iniciando actualización masiva de comentarios...');
        await window.commentsSystem.updateUserCommentsUsername(
          user.uid, 
          newUsername, 
          profileImageUrl || currentUserData?.profileImage
        );
      }

      // Actualizar localStorage de forma segura
      try {
        const storedData = JSON.parse(localStorage.getItem(`user_${user.uid}`)) || {};
        const newData = {
          uid: user.uid,
          username: newUsername,
          description: newDescription || '',
          profileImage: profileImageUrl || storedData.profileImage || user.photoURL,
          lastProfileEdit: new Date().toISOString()
        };
        localStorage.setItem(`user_${user.uid}`, JSON.stringify(newData));
      } catch (storageError) {
        console.warn('LocalStorage full, clearing old data:', storageError);
        // Clear old user data to make space
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const key = localStorage.key(i);
          if (key && key.startsWith('user_') && key !== `user_${user.uid}`) {
            localStorage.removeItem(key);
          }
        }
        // Try again with minimal data
        try {
          localStorage.setItem(`user_${user.uid}`, JSON.stringify({
            uid: user.uid,
            username: newUsername,
            profileImage: profileImageUrl || user.photoURL
          }));
        } catch (e) {
          console.error('Could not save to localStorage even after cleanup');
        }
      }

      // Actualizar UI
      if (window.authModal) {
        await window.authModal.updateUI(user);
      }
      
      // Esperar un poco para que Firebase se actualice
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Actualizar elementos del panel de usuario
      this.updateUserPanelElements(newUsername, newDescription, profileImageUrl || currentUserData?.profileImage);
      
      this.close();
      this.showNotification('Perfil actualizado exitosamente', 'success');
      
      // Forzar recarga de comentarios para mostrar todos los cambios
      this.forceCommentsReload();
    } catch (error) {
      console.error('Error saving profile:', error);
      this.showNotification('Error al guardar el perfil: ' + error.message, 'error');
    }
  }

  // Subir imagen de perfil
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

  // Verificar si el username ya existe
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

  // Verificar si puede editar el perfil
  async canEditProfile() {
    const user = window.authModal?.currentUser;
    if (!user) return false;

    try {
      const userData = await window.firestoreManager.getUser(user.uid);
      if (!userData || !userData.lastProfileEdit) return true;

      const lastEdit = new Date(userData.lastProfileEdit.seconds * 1000);
      const now = new Date();
      const timeDiff = now - lastEdit;
      const minutesDiff = Math.floor(timeDiff / (1000 * 60));

      return minutesDiff >= 5;
    } catch (error) {
      console.error('Error checking edit permissions:', error);
      return true; // Allow edit if there's an error
    }
  }

  // Obtener tiempo hasta la próxima edición
  async getTimeUntilNextEdit() {
    const user = window.authModal?.currentUser;
    if (!user) return 0;

    try {
      const userData = await window.firestoreManager.getUser(user.uid);
      if (!userData || !userData.lastProfileEdit) return 0;

      const lastEdit = new Date(userData.lastProfileEdit.seconds * 1000);
      const now = new Date();
      const timeDiff = now - lastEdit;
      const minutesDiff = Math.floor(timeDiff / (1000 * 60));

      return Math.max(0, 5 - minutesDiff);
    } catch (error) {
      console.error('Error getting time until next edit:', error);
      return 0;
    }
  }

  // Mostrar temporizador de edición
  showEditProfileTimer(minutesLeft) {
    this.closeAllModals();
    
    const modal = document.createElement('div');
    modal.id = 'editProfileTimerModal';
    modal.className = 'edit-profile-panel-modal';
    modal.innerHTML = `
      <div class="edit-profile-panel-content">
        <div class="edit-profile-panel-icon">
          <img src="/img-galery/close.svg" alt="Bloqueado" style="width: 64px; height: 64px; filter: invert(0.5);">
        </div>
        <h3 class="edit-profile-panel-title">Edición de Perfil Bloqueada</h3>
        <p class="edit-profile-panel-text">
          Puedes editar tu perfil cada 5 minutos para evitar cambios excesivos.
        </p>
        <div class="edit-timer-display" style="font-size: 1.2rem; font-weight: 600; color: #ff6b9d; margin: 1rem 0;">
          <span id="timerMinutes">${minutesLeft}</span> minutos restantes
        </div>
        <div class="edit-profile-panel-actions">
          <button class="edit-profile-cancel-btn">Entendido</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    document.body.classList.add('modal-open');

    setTimeout(() => {
      modal.classList.add('show');
    }, 10);

    const timerElement = modal.querySelector('#timerMinutes');
    const closeBtn = modal.querySelector('.edit-profile-cancel-btn');
    let isClosing = false;

    const closeModal = () => {
      if (isClosing) return;
      isClosing = true;
      
      clearInterval(timerInterval);
      modal.classList.remove('show');
      setTimeout(() => {
        if (document.body.contains(modal)) {
          document.body.removeChild(modal);
        }
        document.body.classList.remove('modal-open');
      }, 300);
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
          this.show();
        };
      } else {
        timerElement.textContent = timeLeft;
      }
    }, 60000);

    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
    
    const content = modal.querySelector('.edit-profile-panel-content');
    if (content) {
      content.addEventListener('click', (e) => e.stopPropagation());
    }
  }

  // Cerrar el panel
  close() {
    if (this.isClosing || !this.modal) return;
    this.isClosing = true;
    
    // Remover event listener de escape
    if (this.handleEscape) {
      document.removeEventListener('keydown', this.handleEscape);
    }
    
    this.modal.classList.remove('show');
    setTimeout(() => {
      if (document.body.contains(this.modal)) {
        document.body.removeChild(this.modal);
      }
      document.body.classList.remove('modal-open');
      this.modal = null;
      this.isClosing = false;
      this.selectedImageFile = null;
    }, 300);
  }

  // Cerrar todos los modales
  closeAllModals() {
    // Usar la función del AuthModal si está disponible
    if (window.authModal && window.authModal.closeAllModals) {
      window.authModal.closeAllModals();
    }
    
    // Cerrar este modal específico si existe
    const existingModal = document.getElementById('editProfilePanelModal');
    if (existingModal) {
      existingModal.remove();
    }
    
    document.body.classList.remove('modal-open');
  }

  // Actualizar elementos del panel de usuario
  updateUserPanelElements(newUsername, newDescription, newProfileImage) {
    try {
      console.log('🔄 Actualizando elementos del panel de usuario...');
      
      // Actualizar imagen de perfil del usuario
      const userProfilePic = document.getElementById('userProfilePic');
      if (userProfilePic && newProfileImage) {
        userProfilePic.src = newProfileImage;
      }
      
      // Actualizar nombre de usuario en el header
      const userDisplayNameHeader = document.getElementById('userDisplayNameHeader');
      if (userDisplayNameHeader) {
        userDisplayNameHeader.textContent = newUsername;
      }
      
      // Actualizar descripción en el header
      const userDescriptionHeader = document.getElementById('userDescriptionHeader');
      if (userDescriptionHeader) {
        userDescriptionHeader.textContent = newDescription || 'Sin descripción';
      }
      
      // Actualizar icono de cuenta (account-google)
      const accountIcon = document.querySelector('.account-icon');
      if (accountIcon && newProfileImage) {
        // Si hay imagen de perfil, reemplazar el icono con la imagen
        const accountToggle = document.querySelector('.account-toggle');
        if (accountToggle) {
          accountToggle.innerHTML = `<img src="${newProfileImage}" alt="Perfil" class="user-profile-pic" style="width: 24px; height: 24px; border-radius: 50%; object-fit: cover;">`;
        }
      }
      
      console.log('✅ Elementos del panel de usuario actualizados');
    } catch (error) {
      console.error('Error updating user panel elements:', error);
    }
  }

  // Forzar recarga de comentarios para mostrar cambios
  forceCommentsReload() {
    try {
      // Si estamos en una página de detalles, recargar comentarios
      if (window.location.pathname.includes('details.html')) {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');
        if (productId && window.commentsSystem) {
          console.log('🔄 Recargando comentarios para mostrar cambios...');
          setTimeout(() => {
            // Stop current listener and start new one
            window.commentsSystem.stopListeningToComments(productId);
            window.commentsSystem.listenToComments(productId, (comments) => {
              window.commentsSystem.renderComments(productId, comments);
            });
          }, 1000);
        }
      }
    } catch (error) {
      console.error('Error reloading comments:', error);
    }
  }

  // Mostrar notificación
  showNotification(message, type = 'info') {
    if (window.authModal && window.authModal.showNotification) {
      window.authModal.showNotification(message, type);
    } else {
      // Fallback simple
      alert(message);
    }
  }
}

// Crear instancia global
window.editProfilePanel = new EditProfilePanel();

// Función global para mostrar el panel
window.showEditProfilePanel = () => {
  window.editProfilePanel.show();
};