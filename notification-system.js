// Custom Notification System
class NotificationSystem {
  constructor() {
    this.notifications = [];
    this.init();
  }

  init() {
    // Override native alert
    window.alert = (message) => {
      this.show(message, 'info');
    };

    // Override native confirm
    window.confirm = (message) => {
      return this.confirm(message);
    };

    // Override native prompt
    window.prompt = (message, defaultValue = '') => {
      return this.prompt(message, defaultValue);
    };

    console.log('✅ Custom notification system initialized');
  }

  show(message, type = 'default', duration = 4000) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Show notification
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);

    // Auto hide
    setTimeout(() => {
      this.hide(notification);
    }, duration);

    return notification;
  }

  hide(notification) {
    notification.classList.add('hide');
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }

  success(message, duration = 3000) {
    return this.show(message, 'success', duration);
  }

  error(message, duration = 5000) {
    return this.show(message, 'error', duration);
  }

  warning(message, duration = 4000) {
    return this.show(message, 'warning', duration);
  }

  info(message, duration = 3000) {
    return this.show(message, 'info', duration);
  }

  loading(message = 'Cargando...') {
    const notification = document.createElement('div');
    notification.className = 'loading-notification';
    notification.innerHTML = `
      <div class="loading-notification-spinner"></div>
      <span>${message}</span>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add('show');
    }, 10);

    return {
      hide: () => {
        notification.classList.remove('show');
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 300);
      }
    };
  }

  confirm(message) {
    return new Promise((resolve) => {
      const modal = document.createElement('div');
      modal.className = 'custom-confirm';
      modal.innerHTML = `
        <div class="custom-confirm-content">
          <h3 class="custom-confirm-title">Confirmar</h3>
          <p class="custom-confirm-message">${message}</p>
          <div class="custom-confirm-buttons">
            <button class="custom-confirm-btn cancel">Cancelar</button>
            <button class="custom-confirm-btn confirm">Aceptar</button>
          </div>
        </div>
      `;

      document.body.appendChild(modal);

      const confirmBtn = modal.querySelector('.confirm');
      const cancelBtn = modal.querySelector('.cancel');

      confirmBtn.onclick = () => {
        document.body.removeChild(modal);
        resolve(true);
      };

      cancelBtn.onclick = () => {
        document.body.removeChild(modal);
        resolve(false);
      };

      // Close on outside click
      modal.onclick = (e) => {
        if (e.target === modal) {
          document.body.removeChild(modal);
          resolve(false);
        }
      };
    });
  }

  prompt(message, defaultValue = '') {
    return new Promise((resolve) => {
      const modal = document.createElement('div');
      modal.className = 'custom-prompt';
      modal.innerHTML = `
        <div class="custom-prompt-content">
          <h3 class="custom-prompt-title">Entrada requerida</h3>
          <p class="custom-prompt-message">${message}</p>
          <input type="text" class="custom-prompt-input" value="${defaultValue}" />
          <div class="custom-prompt-buttons">
            <button class="custom-confirm-btn cancel">Cancelar</button>
            <button class="custom-confirm-btn confirm">Aceptar</button>
          </div>
        </div>
      `;

      document.body.appendChild(modal);

      const input = modal.querySelector('.custom-prompt-input');
      const confirmBtn = modal.querySelector('.confirm');
      const cancelBtn = modal.querySelector('.cancel');

      input.focus();
      input.select();

      confirmBtn.onclick = () => {
        const value = input.value;
        document.body.removeChild(modal);
        resolve(value);
      };

      cancelBtn.onclick = () => {
        document.body.removeChild(modal);
        resolve(null);
      };

      input.onkeydown = (e) => {
        if (e.key === 'Enter') {
          confirmBtn.click();
        } else if (e.key === 'Escape') {
          cancelBtn.click();
        }
      };

      // Close on outside click
      modal.onclick = (e) => {
        if (e.target === modal) {
          document.body.removeChild(modal);
          resolve(null);
        }
      };
    });
  }

  toast(message, type = 'info', duration = 3000) {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('show');
    }, 10);

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, duration);

    return toast;
  }
}

// Initialize notification system
window.notificationSystem = new NotificationSystem();

// Export for use in other files
window.showNotification = (message, type, duration) => window.notificationSystem.show(message, type, duration);
window.showSuccess = (message, duration) => window.notificationSystem.success(message, duration);
window.showError = (message, duration) => window.notificationSystem.error(message, duration);
window.showWarning = (message, duration) => window.notificationSystem.warning(message, duration);
window.showInfo = (message, duration) => window.notificationSystem.info(message, duration);
window.showLoading = (message) => window.notificationSystem.loading(message);
window.showToast = (message, type, duration) => window.notificationSystem.toast(message, type, duration);

console.log('✅ Notification system loaded');