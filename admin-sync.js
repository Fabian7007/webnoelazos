// Script para sincronizar administradores entre Firestore y Realtime Database
import { initializeApp, getApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";

class AdminSync {
  constructor() {
    this.db = null;
    this.init();
  }

  async init() {
    try {
      const app = getApp();
      this.db = getDatabase(app);
      console.log('✅ Admin Sync initialized');
    } catch (error) {
      console.error('Error initializing Admin Sync:', error);
    }
  }

  // Admin sync disabled - must be configured manually in Firebase Console
  async syncAdminToRealtimeDB(userId) {
    console.log('⚠️ Admin sync disabled for security. Configure manually in Firebase Console.');
    return false;
  }

  async checkAndSyncCurrentUser() {
    console.log('⚠️ Admin sync disabled. Configure admin nodes manually in Firebase Console.');
  }
}

// Initialize and auto-sync current user if admin
const adminSync = new AdminSync();
window.adminSync = adminSync;

// Auto-sync on load
window.addEventListener('load', () => {
  setTimeout(() => {
    adminSync.checkAndSyncCurrentUser();
  }, 2000);
});

export { AdminSync };