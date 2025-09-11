// Comments System using Firebase Realtime Database
import { initializeApp, getApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { 
  getDatabase, 
  ref, 
  push, 
  set, 
  get, 
  remove, 
  onValue, 
  off,
  query,
  orderByChild,
  limitToLast
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";

class RealtimeCommentsSystem {
  constructor() {
    this.db = null;
    this.listeners = new Map();
    this.profileLoading = new Set();
    this.init();
  }

  async init() {
    try {
      let app;
      try {
        app = getApp();
      } catch (error) {
        console.error('Firebase app not initialized');
        return;
      }

      this.db = getDatabase(app);
      console.log('✅ Comments Realtime Database initialized');
    } catch (error) {
      console.error('Error initializing Comments System:', error);
    }
  }

  getCurrentUser() {
    return window.authFunctions?.getCurrentUser?.();
  }

  getCurrentUserData() {
    return window.authFunctions?.getCurrentUserData?.();
  }

  async addComment(productId, text) {
    if (!this.db) {
      console.error('Database not initialized');
      return false;
    }

    const user = this.getCurrentUser();
    if (!user) {
      this.showAuthModal();
      return false;
    }

    try {
      // Get fresh user data from Firestore
      const firestoreUserData = await window.firestoreManager.getUser(user.uid);
      const username = firestoreUserData?.username || user.displayName || 'Usuario';
      const profileImage = firestoreUserData?.profileImage || user.photoURL || '/img-galery/user-profile.png';
      
      const commentsRef = ref(this.db, `comments/${productId}`);
      const newCommentRef = push(commentsRef);
      
      // Check if user is admin
      const isAdmin = await this.isCurrentUserAdmin();
      
      const comment = {
        id: newCommentRef.key,
        userId: user.uid,
        username: username,
        profileImage: profileImage,
        text: text,
        timestamp: Date.now(),
        productId: productId,
        isAdmin: isAdmin
      };

      await set(newCommentRef, comment);
      
      // Track user stats
      if (window.trackUserAction) {
        window.trackUserAction('add_comment', { productId });
      }

      console.log('✅ Comment added successfully');
      return true;
    } catch (error) {
      console.error('Error adding comment:', error);
      this.showError('Error al agregar comentario');
      return false;
    }
  }

  async deleteComment(productId, commentId, userId) {
    if (!this.db) return false;

    const currentUser = this.getCurrentUser();
    const isAdmin = await this.isCurrentUserAdmin();
    
    if (!currentUser || (currentUser.uid !== userId && !isAdmin)) {
      console.error('Unauthorized to delete comment');
      return false;
    }

    try {
      const commentRef = ref(this.db, `comments/${productId}/${commentId}`);
      await remove(commentRef);
      console.log('✅ Comment deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting comment:', error);
      return false;
    }
  }

  async editComment(productId, commentId, newText, userId) {
    if (!this.db) return false;

    const currentUser = this.getCurrentUser();
    const isAdmin = await this.isCurrentUserAdmin();
    
    if (!currentUser || (currentUser.uid !== userId && !isAdmin)) {
      console.error('Unauthorized to edit comment');
      return false;
    }

    try {
      const commentRef = ref(this.db, `comments/${productId}/${commentId}`);
      const { update } = await import("https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js");
      
      await update(commentRef, {
        text: newText,
        editedAt: Date.now(),
        editedBy: currentUser.uid
      });
      
      console.log('✅ Comment edited successfully');
      return true;
    } catch (error) {
      console.error('Error editing comment:', error);
      return false;
    }
  }

  async pinComment(productId, commentId, userId) {
    if (!this.db) return false;

    const isAdmin = await this.isCurrentUserAdmin();
    if (!isAdmin) {
      console.error('Only admins can pin comments');
      return false;
    }

    try {
      const commentRef = ref(this.db, `comments/${productId}/${commentId}`);
      const { update } = await import("https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js");
      
      await update(commentRef, {
        pinned: true,
        pinnedAt: Date.now(),
        pinnedBy: this.getCurrentUser().uid
      });
      
      console.log('✅ Comment pinned successfully');
      return true;
    } catch (error) {
      console.error('Error pinning comment:', error);
      return false;
    }
  }

  async unpinComment(productId, commentId) {
    if (!this.db) return false;

    const isAdmin = await this.isCurrentUserAdmin();
    if (!isAdmin) {
      console.error('Only admins can unpin comments');
      return false;
    }

    try {
      const commentRef = ref(this.db, `comments/${productId}/${commentId}`);
      const { update } = await import("https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js");
      
      await update(commentRef, {
        pinned: false,
        pinnedAt: null,
        pinnedBy: null
      });
      
      console.log('✅ Comment unpinned successfully');
      return true;
    } catch (error) {
      console.error('Error unpinning comment:', error);
      return false;
    }
  }

  async isCurrentUserAdmin() {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return false;
    
    try {
      // Check Firestore admin collection
      if (window.firestoreManager) {
        const adminDoc = await window.firestoreManager.getDocument('admin', currentUser.uid);
        const isAdmin = adminDoc && adminDoc.exists && adminDoc.exists();
        console.log('🔧 Current user admin check:', currentUser.uid, isAdmin);
        return isAdmin;
      }
      
      return false;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }
  
  async isUserAdmin(userId) {
    try {
      if (window.firestoreManager) {
        const adminDoc = await window.firestoreManager.getDocument('admin', userId);
        const isAdmin = adminDoc && adminDoc.exists && adminDoc.exists();
        console.log('🔧 Admin check for user', userId, ':', isAdmin);
        return isAdmin;
      }
      return false;
    } catch (error) {
      console.error('Error checking user admin status:', error);
      return false;
    }
  }

  async getComments(productId, limit = 50) {
    if (!this.db) return [];

    try {
      const commentsRef = ref(this.db, `comments/${productId}`);
      const commentsQuery = query(commentsRef, orderByChild('timestamp'), limitToLast(limit));
      const snapshot = await get(commentsQuery);
      
      if (!snapshot.exists()) return [];

      const comments = [];
      snapshot.forEach((childSnapshot) => {
        comments.push(childSnapshot.val());
      });

      return comments.reverse(); // Most recent first
    } catch (error) {
      console.error('Error getting comments:', error);
      return [];
    }
  }

  listenToComments(productId, callback) {
    if (!this.db) return null;

    const commentsRef = ref(this.db, `comments/${productId}`);
    const commentsQuery = query(commentsRef, orderByChild('timestamp'));
    
    const listener = onValue(commentsQuery, (snapshot) => {
      const comments = [];
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          comments.push(childSnapshot.val());
        });
      }
      callback(comments.reverse()); // Most recent first
    });

    this.listeners.set(productId, listener);
    return listener;
  }

  stopListeningToComments(productId) {
    const listener = this.listeners.get(productId);
    if (listener) {
      off(listener);
      this.listeners.delete(productId);
    }
  }

  async renderComments(productId, comments) {
    const container = document.getElementById(`comments-${productId}`);
    if (!container) return;

    if (!comments || comments.length === 0) {
      container.innerHTML = `
        <div class="no-comments">
          <div class="no-comments-icon">💬</div>
          <p>No hay comentarios aún</p>
          <span>¡Sé el primero en comentar!</span>
        </div>
      `;
      return;
    }

    const currentUser = this.getCurrentUser();
    const isAdmin = await this.isCurrentUserAdmin();
    
    // Sort comments: pinned first, then by timestamp
    const sortedComments = [...comments].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return b.timestamp - a.timestamp;
    });

    const commentsHtml = await Promise.all(sortedComments.map(async (comment, index) => {
      const canEdit = currentUser && (currentUser.uid === comment.userId || isAdmin);
      const canDelete = currentUser && (currentUser.uid === comment.userId || isAdmin);
      const canPin = isAdmin;
      
      // Check if comment author is admin (for existing comments without isAdmin field)
      const commentIsAdmin = comment.isAdmin !== undefined ? comment.isAdmin : await this.isUserAdmin(comment.userId);
      
      // Get current user data from Firestore to ensure we have the latest profile info
      let currentUserData = null;
      try {
        currentUserData = await window.firestoreManager.getUser(comment.userId);
      } catch (error) {
        console.log('Could not load current user data for comment:', comment.userId);
      }
      
      // Use current profile image and username from Firestore, fallback to comment data
      const currentProfileImage = currentUserData?.profileImage || comment.profileImage || '/img-galery/user-profile.png';
      const currentUsername = currentUserData?.username || comment.username;
      
      // Hide comments after the 6th one
      const isHidden = index >= 6 ? 'hidden' : '';
      
      return `
        <div class="comment ${comment.pinned ? 'pinned' : ''} ${isHidden}" data-comment-id="${comment.id}">
          <div class="comment-content">
            <div class="comment-user">
              <div class="comment-avatar-container" data-user-id="${comment.userId}" style="position: relative; display: inline-block;">
                <img src="${currentProfileImage}" 
                     alt="${currentUsername}" 
                     class="comment-avatar"
                     style="display: block; border-radius: 50%;"
                     onerror="this.src='/img-galery/user-profile.png'">
                <div class="activity-indicator" id="activity-${comment.userId}-${index}" style="position: absolute; bottom: 2px; right: 2px; width: 12px; height: 12px; background: #10b981; border: 2px solid white; border-radius: 50%; display: block;"></div>
              </div>
              <div class="comment-info">
                <div class="comment-header">
                  <span class="comment-username ${commentIsAdmin ? 'admin' : ''}" data-user-id="${comment.userId}">
                    ${currentUsername}
                    ${commentIsAdmin ? '<img src="/img-galery/admin-verify.svg" alt="Admin" class="admin-verify-icon">' : ''}
                  </span>
                  <span class="comment-time">${this.formatTime(comment.timestamp)}${comment.editedAt ? ' (editado)' : ''}</span>
                </div>
                <div class="comment-text" id="comment-text-${comment.id}">${this.escapeHtml(comment.text)}</div>
                <div class="comment-edit-form" id="edit-form-${comment.id}" style="display: none;">
                  <textarea class="comment-edit-input" id="edit-input-${comment.id}">${this.escapeHtml(comment.text)}</textarea>
                  <div class="comment-edit-actions">
                    <button class="comment-cancel-btn" onclick="window.commentsSystem.cancelEdit('${comment.id}')">Cancelar</button>
                    <button class="comment-save-btn" onclick="window.commentsSystem.saveEdit('${productId}', '${comment.id}', '${comment.userId}')">Guardar</button>
                  </div>
                </div>
              </div>
            </div>
            <div class="comment-actions">
              ${canEdit ? `
                <button class="edit-comment-btn" onclick="window.commentsSystem.startEdit('${comment.id}')" title="Editar comentario">
                  <i class="fas fa-edit"></i>
                </button>
              ` : ''}
              ${canPin ? `
                <button class="pin-comment-btn" onclick="window.commentsSystem.${comment.pinned ? 'unpinComment' : 'pinComment'}('${productId}', '${comment.id}', '${comment.userId}')" title="${comment.pinned ? 'Desfijar' : 'Fijar'} comentario">
                  <i class="fas fa-${comment.pinned ? 'times' : 'thumbtack'}"></i>
                </button>
              ` : ''}
              ${canDelete ? `
                <button class="delete-comment-btn" onclick="window.commentsSystem.deleteComment('${productId}', '${comment.id}', '${comment.userId}')" title="Eliminar comentario">
                  <i class="fas fa-trash"></i>
                </button>
              ` : ''}
            </div>
          </div>
        </div>
      `;
    }));

    // Add show more button if there are more than 6 comments
    const showMoreButton = sortedComments.length > 6 ? `
      <div class="show-more-comments">
        <button class="show-more-btn" onclick="window.commentsSystem.toggleShowMore('${productId}')">
          <span class="show-more-text">Ver más comentarios</span>
          <i class="fas fa-chevron-down"></i>
        </button>
      </div>
    ` : '';

    container.innerHTML = commentsHtml.join('') + showMoreButton;
    
    // Add event listeners for user profile clicks using event delegation
    container.addEventListener('click', (e) => {
      const clickedElement = e.target.closest('.comment-avatar-container[data-user-id], .comment-username[data-user-id]');
      if (clickedElement) {
        e.preventDefault();
        e.stopPropagation();
        
        // Prevent rapid clicks
        if (clickedElement.dataset.clicking) {
          return;
        }
        clickedElement.dataset.clicking = 'true';
        setTimeout(() => {
          delete clickedElement.dataset.clicking;
        }, 1000);
        
        const userId = clickedElement.getAttribute('data-user-id');
        console.log('🖱️ Clicked on user profile:', userId);
        
        if (userId) {
          this.showUserProfile(userId);
        } else {
          console.error('No userId found on element:', clickedElement);
        }
      }
    });
    
    // Update activity indicators after a short delay to ensure DOM is ready
    setTimeout(() => {
      this.updateActivityIndicators(sortedComments);
    }, 100);
  }

  toggleShowMore(productId) {
    const container = document.getElementById(`comments-${productId}`);
    if (!container) return;

    const showMoreBtn = container.querySelector('.show-more-btn');
    const showMoreText = showMoreBtn?.querySelector('.show-more-text');
    const showMoreIcon = showMoreBtn?.querySelector('i');
    const allComments = container.querySelectorAll('.comment');

    // Check if we're currently showing all comments (expanded state)
    const isExpanded = showMoreBtn?.classList.contains('expanded');

    if (isExpanded) {
      // Hide comments after 6th (collapse)
      allComments.forEach((comment, index) => {
        if (index >= 6) {
          comment.classList.add('hidden');
        }
      });
      if (showMoreText) showMoreText.textContent = 'Ver más comentarios';
      if (showMoreIcon) {
        showMoreIcon.className = 'fas fa-chevron-down';
        showMoreBtn.classList.remove('expanded');
      }
    } else {
      // Show all comments (expand)
      allComments.forEach(comment => {
        comment.classList.remove('hidden');
      });
      if (showMoreText) showMoreText.textContent = 'Ver menos comentarios';
      if (showMoreIcon) {
        showMoreIcon.className = 'fas fa-chevron-up';
        showMoreBtn.classList.add('expanded');
      }
    }
  }
  
  startEdit(commentId) {
    const textElement = document.getElementById(`comment-text-${commentId}`);
    const editForm = document.getElementById(`edit-form-${commentId}`);
    
    if (textElement && editForm) {
      textElement.style.display = 'none';
      editForm.style.display = 'block';
      
      const input = document.getElementById(`edit-input-${commentId}`);
      if (input) {
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
      }
    }
  }
  
  cancelEdit(commentId) {
    const textElement = document.getElementById(`comment-text-${commentId}`);
    const editForm = document.getElementById(`edit-form-${commentId}`);
    
    if (textElement && editForm) {
      textElement.style.display = 'block';
      editForm.style.display = 'none';
    }
  }
  
  async saveEdit(productId, commentId, userId) {
    const input = document.getElementById(`edit-input-${commentId}`);
    if (!input) return;
    
    const newText = input.value;
    if (!newText.trim()) {
      alert('El comentario no puede estar vacío');
      return;
    }
    
    const success = await this.editComment(productId, commentId, newText, userId);
    if (success) {
      this.cancelEdit(commentId);
    }
  }
  
  async loadOtherUserSettings(userId) {
    try {
      const userSettings = await window.firestoreManager.getUserSettings(userId);
      console.log('🔧 Raw user settings for', userId, ':', userSettings);
      
      // Si no hay configuraciones guardadas, usar valores por defecto más abiertos
      if (!userSettings) {
        console.log('🔧 No settings found for user', userId, '- using defaults');
        return {
          profilePublic: false,
          activityVisible: true // Por defecto, mostrar actividad
        };
      }
      
      // Interpretar configuraciones existentes - CAMBIO IMPORTANTE
      const settings = {
        profilePublic: userSettings.profilePublic === true,
        activityVisible: userSettings.activityVisible === true // Solo true si está explícitamente activado
      };
      
      console.log('🔧 Processed settings for', userId, ':', settings);
      return settings;
    } catch (error) {
      console.error('Error loading other user settings:', userId, error);
      // En caso de error, usar configuraciones por defecto
      return {
        profilePublic: false,
        activityVisible: true // Mostrar actividad por defecto
      };
    }
  }

  updateActivityIndicators(comments) {
    if (!window.userActivitySystem) {
      console.log('🔧 Details: userActivitySystem not available');
      return;
    }
    
    const uniqueUserIds = [...new Set(comments.map(c => c.userId))];
    console.log('🔧 Details: Updating activity indicators for users:', uniqueUserIds);
    
    uniqueUserIds.forEach(async (userId) => {
      try {
        console.log('🔧 Details: Loading settings for user:', userId);
        const userSettings = await this.loadOtherUserSettingsSafe(userId);
        
        // Get ALL indicators for this user (there might be multiple comments)
        const indicators = document.querySelectorAll(`[id^="activity-${userId}-"], #activity-${userId}`);
        console.log('🔧 Details: Found indicators for user', userId, ':', indicators.length);
        
        console.log('🔧 Details: User settings loaded:', userId, userSettings);
        console.log('🔧 Details: Found indicators:', indicators.length);
        
        // TEMPORAL: Mostrar siempre los indicadores para debug
        console.log('🔧 Details: Showing activity indicators for user:', userId);
        indicators.forEach(indicator => {
          indicator.style.display = 'block';
          indicator.className = 'activity-indicator';
          indicator.title = 'En línea';
        });
        
        console.log('🔧 Details: Activity is visible for user:', userId, '- setting up listeners');
        
        // Listen to activity and update ALL indicators for this user
        // This allows ALL users to see each other's activity indicators
        if (window.userActivitySystem.listenToUserActivity) {
          window.userActivitySystem.listenToUserActivity(userId, (activity) => {
            console.log('🔧 Details: Activity update received for user:', userId, activity);
            indicators.forEach(indicator => {
              if (indicator) {
                console.log('🔧 Details: Updating indicator for user:', userId, 'online:', activity?.online);
                indicator.style.display = 'block';
                if (activity?.online) {
                  indicator.className = 'activity-indicator';
                  indicator.title = 'En línea';
                } else {
                  indicator.className = 'activity-indicator offline';
                  indicator.title = activity?.lastSeen ? 
                    `Última vez: ${window.userActivitySystem.formatLastSeen(activity.lastSeen)}` : 
                    'Desconectado';
                }
              }
            });
          });
        } else {
          // Fallback: get current activity status
          console.log('🔧 Details: No listenToUserActivity, getting current status');
          const activity = await window.userActivitySystem.getUserActivity(userId);
          indicators.forEach(indicator => {
            if (indicator) {
              indicator.style.display = 'block';
              if (activity?.online) {
                indicator.className = 'activity-indicator';
                indicator.title = 'En línea';
              } else {
                indicator.className = 'activity-indicator offline';
                indicator.title = activity?.lastSeen ? 
                  `Última vez: ${window.userActivitySystem.formatLastSeen(activity.lastSeen)}` : 
                  'Desconectado';
              }
            }
          });
        }
      } catch (error) {
        console.error('❌ Details: Error updating activity for user:', userId, error);
        const indicators = document.querySelectorAll(`[id^="activity-${userId}"]`);
        indicators.forEach(indicator => {
          indicator.style.display = 'none';
          indicator.title = 'Error cargando estado';
        });
      }
    });
  }
  
  async loadOtherUserSettingsSafe(userId) {
    try {
      console.log('🔧 Details: Loading user settings safely for:', userId);
      
      if (window.userSettingsLoader) {
        const settings = await window.userSettingsLoader.loadUserSettings(userId);
        console.log('🔧 Details: Settings loaded via userSettingsLoader:', settings);
        return settings;
      }
      
      const settings = await this.loadOtherUserSettings(userId);
      console.log('🔧 Details: Settings loaded via loadOtherUserSettings:', settings);
      return settings;
    } catch (error) {
      console.error('❌ Details: Error loading user settings:', userId, error);
      return { profilePublic: false, activityVisible: false };
    }
  }

  async showUserProfile(userId) {
    try {
      // Prevent multiple calls - check and set immediately
      if (this.profileLoading.has(userId)) {
        console.log('⚠️ Profile already loading for user:', userId);
        return;
      }
      this.profileLoading.add(userId);
      
      // Close any existing modals first
      const existingModals = document.querySelectorAll('.user-profile-modal');
      existingModals.forEach(modal => modal.remove());
      
      // Also remove any profile loaders
      const existingLoaders = document.querySelectorAll('.profile-loader-modal');
      existingLoaders.forEach(loader => loader.remove());
      
      this.profileLoading.add(userId);
      this.showProfileLoader();
      
      console.log('🔍 Iniciando carga de perfil para usuario:', userId);
      
      if (!window.firestoreManager) {
        console.error('❌ firestoreManager no disponible');
        this.showError('Sistema no inicializado');
        return;
      }
      
      console.log('🔍 Cargando perfil de usuario:', userId);
      
      let userData, userSettings;
      
      try {
        console.log('🔧 Details: Attempting to load user data for:', userId);
        
        // Try direct document access first
        const userDoc = await window.firestoreManager.getDocument('users', userId);
        if (userDoc && userDoc.exists()) {
          userData = userDoc.data();
          console.log('👤 Details: User data loaded via getDocument:', userData);
        } else {
          // Fallback to getUser method
          userData = await window.firestoreManager.getUser(userId);
          console.log('👤 Details: User data loaded via getUser:', userData);
        }
      } catch (error) {
        console.error('❌ Details: Error loading user data:', userId, error);
        
        // Try one more fallback - create minimal user data from comment info
        const commentElements = document.querySelectorAll(`[data-user-id="${userId}"]`);
        if (commentElements.length > 0) {
          const usernameElement = document.querySelector(`.comment-username[data-user-id="${userId}"]`);
          const avatarElement = document.querySelector(`.comment-avatar-container[data-user-id="${userId}"] img`);
          
          userData = {
            uid: userId,
            username: usernameElement ? usernameElement.textContent.trim() : 'Usuario',
            profileImage: avatarElement ? avatarElement.src : '/img-galery/user-profile.png',
            createdAt: new Date() // Fallback date
          };
          console.log('👤 Details: Using fallback user data from comment:', userData);
        } else {
          this.showError('No se pudo cargar el perfil del usuario');
          return;
        }
      }
      
      if (!userData) {
        console.log('❌ Details: User data not found for:', userId);
        this.hideProfileLoader();
        this.profileLoading.delete(userId);
        this.showError('Usuario no encontrado');
        return;
      }
      
      console.log('✅ Details: User data successfully loaded:', userData);
      
      if (!userData.username) {
        console.log('⚠️ Details: User has no username, showing as "Usuario"');
        userData.username = 'Usuario';
      }
      
      // Simplify - always show basic profile for now
      console.log('✅ Details: Showing basic profile modal');
      
      // Get additional user data
      let isAdmin = false;
      let userStats = { totalLikes: 0, totalViews: 0, totalComments: 0, accountAge: 0 };
      let userActivity = null;
      
      try {
        isAdmin = await this.isUserAdmin(userId);
        userStats = await window.firestoreManager.getUserStats(userId);
        
        if (window.userActivitySystem && typeof window.userActivitySystem.getUserActivity === 'function') {
          userActivity = await window.userActivitySystem.getUserActivity(userId);
        }
      } catch (error) {
        console.log('Could not load additional user data:', error);
      }
      

      
      const modal = document.createElement('div');
      modal.className = 'user-profile-modal';
      modal.style.cssText = `
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        height: 100% !important;
        background: rgba(0, 0, 0, 0.8) !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        z-index: 99999 !important;
        opacity: 1 !important;
      `;
      modal.innerHTML = `
        <div style="background: white; border-radius: 16px; max-width: 550px; width: 90%; padding: 25px; position: relative; max-height: 80vh; overflow-y: auto;">
          <button onclick="this.closest('.user-profile-modal').remove()" style="position: absolute; top: 15px; right: 15px; background: rgba(255,107,157,0.1); border: none; font-size: 20px; cursor: pointer; width: 30px; height: 30px; border-radius: 50%; color: #ff6b9d;">&times;</button>
          
          <div style="text-align: center; margin-bottom: 25px;">
            <h3 style="margin: 0 0 20px 0; color: #ff6b9d; font-size: 1.5rem;">Perfil de Usuario</h3>
            
            <div style="position: relative; display: inline-block; margin-bottom: 15px;">
              <img src="${userData.profileImage || '/img-galery/user-profile.png'}" 
                   alt="${userData.username || 'Usuario'}" 
                   style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover; border: 4px solid #ff6b9d;"
                   onerror="this.src='/img-galery/user-profile.png'">
              ${userActivity && userActivity.online ? '<div style="position: absolute; bottom: 8px; right: 8px; width: 20px; height: 20px; background: #10b981; border: 4px solid white; border-radius: 50%;"></div>' : ''}
            </div>
            
            <h4 style="margin: 10px 0; color: ${isAdmin ? '#ff6b9d' : '#333'}; font-size: 1.4rem; ${isAdmin ? 'background: linear-gradient(45deg, #ff6b9d, #ff4081); -webkit-background-clip: text; -webkit-text-fill-color: transparent;' : ''}">
              ${userData.username || 'Usuario'}
              ${isAdmin ? ' ✓' : ''}
            </h4>
            
            <p style="color: #666; margin: 15px 0; font-style: italic;">${userData.description || 'Sin descripción'}</p>
            
            ${userActivity && userActivity.online ? '<p style="color: #10b981; font-weight: bold; margin: 10px 0;">En línea</p>' : userActivity && userActivity.lastSeen ? `<p style="color: #6b7280; margin: 10px 0;">Última vez: ${this.formatLastSeen(userActivity.lastSeen)}</p>` : ''}
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
            <div style="text-align: center; padding: 15px; background: linear-gradient(135deg, #fff5f8, #ffebf0); border-radius: 12px; border: 2px solid #ffcdd2;">
              <div style="font-size: 0.8rem; color: #ff6b9d; font-weight: bold; text-transform: uppercase; margin-bottom: 5px;">Miembro desde</div>
              <div style="font-size: 1.2rem; font-weight: bold; color: #333;">${this.formatDate(userData.createdAt)}</div>
            </div>
            
            <div style="text-align: center; padding: 15px; background: linear-gradient(135deg, #fff5f8, #ffebf0); border-radius: 12px; border: 2px solid #ffcdd2;">
              <div style="font-size: 0.8rem; color: #ff6b9d; font-weight: bold; text-transform: uppercase; margin-bottom: 5px;">Rango</div>
              <div style="font-size: 1.2rem; font-weight: bold; color: ${isAdmin ? '#ff6b9d' : '#333'};">${isAdmin ? 'Administrador' : 'Usuario'}</div>
            </div>
            
            <div style="text-align: center; padding: 15px; background: linear-gradient(135deg, #fff5f8, #ffebf0); border-radius: 12px; border: 2px solid #ffcdd2;">
              <div style="font-size: 0.8rem; color: #ff6b9d; font-weight: bold; text-transform: uppercase; margin-bottom: 5px;">Productos favoritos</div>
              <div style="font-size: 1.5rem; font-weight: bold; color: #333;">${userStats.totalLikes || 0}</div>
            </div>
            
            <div style="text-align: center; padding: 15px; background: linear-gradient(135deg, #fff5f8, #ffebf0); border-radius: 12px; border: 2px solid #ffcdd2;">
              <div style="font-size: 0.8rem; color: #ff6b9d; font-weight: bold; text-transform: uppercase; margin-bottom: 5px;">Comentarios</div>
              <div style="font-size: 1.5rem; font-weight: bold; color: #333;">${userStats.totalComments || 0}</div>
            </div>
            
            <div style="text-align: center; padding: 15px; background: linear-gradient(135deg, #fff5f8, #ffebf0); border-radius: 12px; border: 2px solid #ffcdd2;">
              <div style="font-size: 0.8rem; color: #ff6b9d; font-weight: bold; text-transform: uppercase; margin-bottom: 5px;">Productos vistos</div>
              <div style="font-size: 1.5rem; font-weight: bold; color: #333;">${userStats.totalViews || 0}</div>
            </div>
            
            <div style="text-align: center; padding: 15px; background: linear-gradient(135deg, #fff5f8, #ffebf0); border-radius: 12px; border: 2px solid #ffcdd2;">
              <div style="font-size: 0.8rem; color: #ff6b9d; font-weight: bold; text-transform: uppercase; margin-bottom: 5px;">Días activo</div>
              <div style="font-size: 1.5rem; font-weight: bold; color: #333;">${userStats.accountAge || 0}</div>
            </div>
          </div>
        </div>
      `;

      console.log('📝 Details: About to hide loader and show modal');
      this.hideProfileLoader();
      
      console.log('📝 Details: Adding modal to DOM');
      document.body.appendChild(modal);
      
      console.log('📝 Details: Modal added, no animation needed');
      
      console.log('✅ Details: Profile modal created and added to DOM');
      
      // Close on outside click
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.closeProfileModal(modal);
        }
      });
      
      console.log('📝 Details: Cleaning up loading state');
      this.profileLoading.delete(userId);
    } catch (error) {
      console.error('Error showing user profile:', error);
      this.hideProfileLoader();
      this.profileLoading.clear();
      this.showError('Error al cargar perfil');
    } finally {
      // Always ensure cleanup
      this.hideProfileLoader();
      this.profileLoading.delete(userId);
    }
  }

  formatTime(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 23) return `${hours}h`;
    
    // After 23 hours, show date only
    return new Date(timestamp).toLocaleDateString('es-AR');
  }
  
  formatLastSeen(timestamp) {
    if (!timestamp) return 'Desconocido';
    
    const now = Date.now();
    const diff = now - timestamp;
    const hours = Math.floor(diff / 3600000);
    
    if (hours < 24) {
      return `Hace ${hours}h`;
    }
    
    // After 24 hours, show date only
    return new Date(timestamp).toLocaleDateString('es-AR');
  }

  formatDate(dateValue) {
    if (!dateValue) return 'Desconocido';
    
    let date;
    if (dateValue.seconds) {
      date = new Date(dateValue.seconds * 1000);
    } else {
      date = new Date(dateValue);
    }
    
    return date.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  showAuthModal() {
    // Try to show the existing auth modal
    const authModal = document.getElementById('authModal');
    if (authModal) {
      authModal.style.display = 'block';
      return;
    }
    
    // If no auth modal exists, show error
    this.showError('Debes iniciar sesión para comentar');
  }

  showError(message) {
    const notification = document.createElement('div');
    notification.className = 'error-notification';
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #f44336;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      z-index: 10000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      transform: translateX(100%);
      transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 10);
    
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }

  async showLimitedProfile(userData, userActivity, showActivity) {
    const isAdmin = await this.isUserAdmin(userData.uid || userData.id);
    
    const modal = document.createElement('div');
    modal.className = 'user-profile-modal';
    modal.innerHTML = `
      <div class="user-profile-modal-content">
        <div class="user-profile-header">
          <button class="close-profile-btn" onclick="window.commentsSystem.closeProfileModal(this.closest('.user-profile-modal'))">
            <i class="fas fa-times"></i>
          </button>
          <h3>Perfil de Usuario</h3>
        </div>
        <div class="user-profile-body">
          <div class="profile-info">
            <div class="profile-image-container">
              <img src="${userData.profileImage || '/img-galery/user-profile.png'}" 
                   alt="${userData.username}" 
                   class="profile-image"
                   onerror="this.src='/img-galery/user-profile.png'">
              ${showActivity && userActivity ? `
                <div class="profile-activity-indicator ${userActivity.online ? '' : 'offline'}" 
                     title="${userActivity.online ? 'En línea' : 'Desconectado'}">
                </div>
              ` : ''}
            </div>
            <h4 class="${isAdmin ? 'admin' : ''}">
              ${userData.username}
              ${isAdmin ? '<img src="/img-galery/admin-verify.svg" alt="Admin" class="profile-admin-icon">' : ''}
            </h4>
            <p class="profile-description">Este perfil es privado</p>
            
            <div class="profile-stats">
              <div class="stat">
                <span class="stat-label">Miembro desde</span>
                <span class="stat-value">${this.formatDate(userData.createdAt)}</span>
              </div>
              
              ${showActivity && userActivity ? `
                <div class="stat">
                  <span class="stat-label">${userActivity.online ? 'Estado' : 'Última conexión'}</span>
                  <span class="stat-value">${userActivity.online ? 'En línea' : window.userActivitySystem.formatLastSeen(userActivity.lastSeen)}</span>
                </div>
              ` : ''}
              
              <div class="stat">
                <span class="stat-label">Rango</span>
                <span class="stat-value">${isAdmin ? 'Administrador' : 'Usuario'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    
    // Add animation
    requestAnimationFrame(() => {
      modal.classList.add('show');
    });
    
    // Close on outside click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.closeProfileModal(modal);
      }
    });
  }

  async updateUserCommentsUsername(userId, newUsername, newProfileImage = null) {
    if (!this.db) return false;
    
    try {
      console.log('🔄 Actualizando TODOS los comentarios del usuario:', userId, newUsername);
      
      // Get all comments from all products
      const commentsRef = ref(this.db, 'comments');
      const snapshot = await get(commentsRef);
      
      if (!snapshot.exists()) return true;
      
      const updates = {};
      let totalComments = 0;
      
      snapshot.forEach((productSnapshot) => {
        const productId = productSnapshot.key;
        productSnapshot.forEach((commentSnapshot) => {
          const commentId = commentSnapshot.key;
          const comment = commentSnapshot.val();
          
          if (comment.userId === userId) {
            updates[`comments/${productId}/${commentId}/username`] = newUsername;
            if (newProfileImage) {
              updates[`comments/${productId}/${commentId}/profileImage`] = newProfileImage;
            }
            totalComments++;
          }
        });
      });
      
      if (Object.keys(updates).length > 0) {
        const { update } = await import("https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js");
        await update(ref(this.db), updates);
        console.log(`✅ Actualizados ${totalComments} comentarios en Firebase`);
        
        // Trigger a global update event
        window.dispatchEvent(new CustomEvent('userProfileUpdated', {
          detail: { userId, newUsername, newProfileImage }
        }));
      }
      
      return true;
    } catch (error) {
      console.error('Error updating user data in comments:', error);
      return false;
    }
  }


  
  showProfileLoader() {
    const loader = document.createElement('div');
    loader.className = 'profile-loader-modal';
    loader.innerHTML = `
      <div class="profile-loader-content">
        <div class="profile-loader-spinner"></div>
        <p>Cargando perfil...</p>
      </div>
    `;
    document.body.appendChild(loader);
  }
  
  hideProfileLoader() {
    const loaders = document.querySelectorAll('.profile-loader-modal');
    loaders.forEach(loader => loader.remove());
  }
  
  closeProfileModal(modal) {
    modal.classList.add('hide');
    setTimeout(() => {
      modal.remove();
    }, 300);
  }
  
  cleanup() {
    this.listeners.forEach((listener, productId) => {
      off(listener);
    });
    this.listeners.clear();
    this.profileLoading.clear();
  }
}

// Initialize the system
let commentsSystem;
try {
  commentsSystem = new RealtimeCommentsSystem();
  window.commentsSystem = commentsSystem;
  console.log('✅ Comments System initialized');
  
  // Listen for global profile updates
  window.addEventListener('userProfileUpdated', (event) => {
    const { userId, newUsername, newProfileImage } = event.detail;
    console.log('🔄 Actualizando comentarios visibles para:', userId);
    
    // Update all visible comments for this user
    const userElements = document.querySelectorAll(`[data-user-id="${userId}"]`);
    userElements.forEach(element => {
      if (element.classList.contains('comment-username')) {
        // Keep admin icon if present
        const adminIcon = element.querySelector('.admin-verify-icon');
        const adminIconHtml = adminIcon ? adminIcon.outerHTML : '';
        element.innerHTML = newUsername + adminIconHtml;
      } else if (element.classList.contains('comment-avatar-container')) {
        const img = element.querySelector('img');
        if (img && newProfileImage) {
          img.src = newProfileImage;
        }
      }
    });
    
    console.log(`✅ Actualizados ${userElements.length} elementos visibles`);
  });
} catch (error) {
  console.error('❌ Error initializing Comments System:', error);
}

export { RealtimeCommentsSystem };

// Debug functions for comments system
window.debugComments = {
  // Check user settings
  async checkUserSettings(userId) {
    if (!window.firestoreManager) {
      console.log('❌ Firestore manager not available');
      return;
    }
    
    try {
      const userData = await window.firestoreManager.getUser(userId);
      const userSettings = await window.firestoreManager.getUserSettings(userId);
      
      console.log('👤 User Data:', userData);
      console.log('⚙️ User Settings:', userSettings);
      
      if (!userData) {
        console.log('❌ User not found');
        return;
      }
      
      if (!userSettings) {
        console.log('⚠️ No user settings found, creating defaults...');
        const defaultSettings = {
          profilePublic: false,
          activityVisible: true,
          emailNotifications: true,
          promotionNotifications: true
        };
        await window.firestoreManager.saveUserSettings(userId, defaultSettings);
        console.log('✅ Default settings created');
        return;
      }
      
      console.log('🔍 Profile Public:', userSettings.profilePublic);
      console.log('👁️ Activity Visible:', userSettings.activityVisible);
      
    } catch (error) {
      console.error('❌ Error checking user settings:', error);
    }
  },
  
  // Enable public profile for a user
  async enablePublicProfile(userId) {
    if (!window.firestoreManager) {
      console.log('❌ Firestore manager not available');
      return;
    }
    
    try {
      await window.firestoreManager.saveUserSettings(userId, {
        profilePublic: true,
        activityVisible: true
      });
      console.log('✅ Public profile enabled for user:', userId);
    } catch (error) {
      console.error('❌ Error enabling public profile:', error);
    }
  },
  
  // Test comment deletion
  async testDeleteComment(productId, commentId, userId) {
    if (!window.commentsSystem) {
      console.log('❌ Comments system not available');
      return;
    }
    
    const result = await window.commentsSystem.deleteComment(productId, commentId, userId);
    console.log('🗑️ Delete result:', result);
  },
  
  // List all comments for a product
  async listComments(productId) {
    if (!window.commentsSystem) {
      console.log('❌ Comments system not available');
      return;
    }
    
    const comments = await window.commentsSystem.getComments(productId);
    console.log('💬 Comments for product', productId, ':', comments);
  },
  
  // Get current user info
  getCurrentUserInfo() {
    const user = window.authFunctions?.getCurrentUser?.();
    const userData = window.authFunctions?.getCurrentUserData?.();
    
    console.log('👤 Current User:', user);
    console.log('📋 Current User Data:', userData);
    
    return { user, userData };
  }
};

// Auto-enable public profile for current user (for testing) - ONLY if DEBUG mode is enabled
window.addEventListener('load', () => {
  setTimeout(async () => {
    if (window.DEBUG !== true) return; // Only run in debug mode
    
    const user = window.authFunctions?.getCurrentUser?.();
    if (user) {
      console.log('🔧 Debug: Checking current user settings...');
      await window.debugComments.checkUserSettings(user.uid);
      
      // Auto-enable public profile for testing
      console.log('🔧 Debug: Auto-enabling public profile for testing...');
      await window.debugComments.enablePublicProfile(user.uid);
    }
  }, 3000);
});

console.log('🔧 Debug comments loaded. Use window.debugComments for testing.');

// Debug script para verificar productos
console.log('🔍 Debug de productos iniciado');

// Función para verificar el estado de los productos
function debugProducts() {
  console.log('=== DEBUG PRODUCTOS ===');
  console.log('window.productos:', window.productos);
  console.log('Cantidad de productos:', window.productos?.length || 0);
  
  if (window.productos && window.productos.length > 0) {
    console.log('Primeros 3 productos:');
    window.productos.slice(0, 3).forEach((p, i) => {
      console.log(`${i + 1}. ID: ${p.id}, Nombre: ${p.nombre}, Categoría: ${p.categoria}`);
    });
  }
  
  // Verificar localStorage
  const localProducts = JSON.parse(localStorage.getItem('productos')) || [];
  console.log('Productos en localStorage:', localProducts.length);
  
  // Verificar Firebase
  console.log('firestoreManager disponible:', !!window.firestoreManager);
  console.log('loadProductsFromFirebase disponible:', !!window.loadProductsFromFirebase);
}

// Ejecutar debug cada 3 segundos
setInterval(debugProducts, 3000);

// Función para probar la carga de un producto específico
window.testProductLoad = async function(productId) {
  console.log('🧪 Probando carga del producto:', productId);
  
  if (window.loadProductsFromFirebase) {
    await window.loadProductsFromFirebase();
  }
  
  const product = window.productos?.find(p => String(p.id) === String(productId));
  console.log('Producto encontrado:', product);
  
  if (product) {
    console.log('✅ Producto válido, navegando...');
    window.location.href = `details.html?id=${encodeURIComponent(productId)}`;
  } else {
    console.log('❌ Producto no encontrado');
  }
};

// Función para listar todos los IDs de productos
window.listProductIds = function() {
  if (window.productos && window.productos.length > 0) {
    console.log('📋 IDs de productos disponibles:');
    window.productos.forEach((p, i) => {
      console.log(`${i + 1}. ${p.id} - ${p.nombre}`);
    });
  } else {
    console.log('❌ No hay productos disponibles');
  }
};

console.log('🔧 Funciones de debug disponibles:');
console.log('- debugProducts(): Mostrar estado actual');
console.log('- testProductLoad(id): Probar carga de producto');
console.log('- listProductIds(): Listar todos los IDs');