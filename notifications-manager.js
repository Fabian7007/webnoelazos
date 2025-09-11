// Cloud-based Notifications Manager
class NotificationsManager {
  constructor() {
    this.currentUser = null;
    this.notifications = [];
    this.unreadCount = 0;
    this.init();
  }

  async init() {
    // Wait for auth to be ready
    if (window.authFunctions) {
      window.authFunctions.onAuthStateChanged((user) => {
        this.currentUser = user;
        if (user) {
          this.loadUserNotifications();
          this.startNotificationListener();
        } else {
          this.notifications = [];
          this.unreadCount = 0;
          this.updateNotificationUI();
        }
      });
    }
  }

  // Load user notifications from Firestore
  async loadUserNotifications() {
    if (!this.currentUser || !window.firestoreManager) return;

    try {
      const notifications = await window.firestoreManager.getUserNotifications(this.currentUser.uid);
      this.notifications = notifications;
      await this.updateUnreadCount();
      this.updateNotificationUI();
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  }

  // Update unread count
  async updateUnreadCount() {
    if (!this.currentUser || !window.firestoreManager) return;

    try {
      this.unreadCount = await window.firestoreManager.getUnreadNotificationsCount(this.currentUser.uid);
      this.updateNotificationBadge();
    } catch (error) {
      console.error('Error updating unread count:', error);
    }
  }

  // Mark notification as read
  async markAsRead(notificationId) {
    if (!window.firestoreManager) return;

    try {
      await window.firestoreManager.markNotificationAsRead(notificationId);
      
      // Update local notification
      const notification = this.notifications.find(n => n.id === notificationId);
      if (notification) {
        notification.read = true;
      }
      
      await this.updateUnreadCount();
      this.updateNotificationUI();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  // Mark all notifications as read
  async markAllAsRead() {
    if (!this.currentUser || !window.firestoreManager) return;

    try {
      await window.firestoreManager.markAllNotificationsAsRead(this.currentUser.uid);
      
      // Update local notifications
      this.notifications.forEach(n => n.read = true);
      this.unreadCount = 0;
      
      this.updateNotificationUI();
      this.updateNotificationBadge();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }

  // Update notification badge
  updateNotificationBadge() {
    const badge = document.querySelector('.notification-badge');
    if (badge) {
      if (this.unreadCount > 0) {
        badge.textContent = this.unreadCount > 99 ? '99+' : this.unreadCount;
        badge.style.display = 'block';
      } else {
        badge.style.display = 'none';
      }
    }
  }

  // Update notification UI
  updateNotificationUI() {
    const container = document.querySelector('.notifications-list');
    if (!container) return;

    if (this.notifications.length === 0) {
      container.innerHTML = '<div class="no-notifications">No tienes notificaciones</div>';
      return;
    }

    container.innerHTML = this.notifications.map(notification => {
      const isUnread = !notification.read;
      const date = this.formatDate(notification.createdAt);
      
      return `
        <div class="notification-item ${isUnread ? 'unread' : ''}" data-id="${notification.id}">
          <div class="notification-content">
            <div class="notification-header">
              <span class="notification-title">${notification.title}</span>
              <span class="notification-date">${date}</span>
            </div>
            <div class="notification-message">${notification.message}</div>
            ${notification.productId ? `
              <div class="notification-product" onclick="window.location.href='details.html?id=${notification.productId}'">
                <img src="${notification.productImage}" alt="${notification.productName}" class="notification-product-image">
                <span class="notification-product-name">${notification.productName}</span>
              </div>
            ` : ''}
          </div>
          ${isUnread ? `
            <button class="mark-read-btn" onclick="notificationsManager.markAsRead('${notification.id}')">
              <i class="fas fa-check"></i>
            </button>
          ` : ''}
        </div>
      `;
    }).join('');
  }

  // Format date for display
  formatDate(timestamp) {
    if (!timestamp) return '';
    
    const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    
    return date.toLocaleDateString('es-AR', { 
      day: '2-digit', 
      month: '2-digit' 
    });
  }

  // Start listening for new notifications
  startNotificationListener() {
    // Listen for new product notifications
    window.addEventListener('newProductNotification', () => {
      setTimeout(() => {
        this.loadUserNotifications();
      }, 1000);
    });

    // Refresh notifications every 30 seconds
    setInterval(() => {
      if (this.currentUser) {
        this.loadUserNotifications();
      }
    }, 30000);
  }

  // Show notifications panel
  showNotificationsPanel() {
    let panel = document.querySelector('.notifications-panel');
    
    if (!panel) {
      panel = document.createElement('div');
      panel.className = 'notifications-panel';
      panel.innerHTML = `
        <div class="notifications-header">
          <h3>Notificaciones</h3>
          <div class="notifications-actions">
            <button class="mark-all-read-btn" onclick="notificationsManager.markAllAsRead()">
              Marcar todas como leídas
            </button>
            <button class="close-notifications-btn" onclick="notificationsManager.hideNotificationsPanel()">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
        <div class="notifications-list"></div>
      `;
      document.body.appendChild(panel);
    }
    
    panel.classList.add('show');
    this.updateNotificationUI();
  }

  // Hide notifications panel
  hideNotificationsPanel() {
    const panel = document.querySelector('.notifications-panel');
    if (panel) {
      panel.classList.remove('show');
    }
  }
}

// Initialize notifications manager
window.notificationsManager = new NotificationsManager();

console.log('✅ Cloud notifications manager loaded');