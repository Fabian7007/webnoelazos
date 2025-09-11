// User Activity Realtime - Minimal implementation
import { initializeApp, getApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getDatabase, ref, set, onValue, off, onDisconnect } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";

class UserActivitySystem {
  constructor() {
    this.db = null;
    this.listeners = new Map();
    this.init();
  }

  async init() {
    try {
      const app = getApp();
      this.db = getDatabase(app);
      console.log('✅ UserActivitySystem initialized');
    } catch (error) {
      console.error('❌ UserActivitySystem init error:', error);
    }
  }

  async setUserOnline(userId) {
    if (!this.db || !userId) return;
    try {
      const userRef = ref(this.db, `userActivity/${userId}`);
      const connectedRef = ref(this.db, '.info/connected');
      
      // Set user as online
      await set(userRef, {
        online: true,
        lastSeen: Date.now()
      });
      
      // Set up presence detection
      onValue(connectedRef, (snapshot) => {
        if (snapshot.val() === true) {
          // Connected - set online and setup disconnect handler
          set(userRef, {
            online: true,
            lastSeen: Date.now()
          });
          
          // When disconnected, set offline
          onDisconnect(userRef).set({
            online: false,
            lastSeen: Date.now()
          });
        }
      });
      
      console.log('🟢 User presence system initialized:', userId);
    } catch (error) {
      console.error('❌ Error setting user online:', error);
    }
  }

  listenToUserActivity(userId, callback) {
    if (!this.db || !userId) return;
    try {
      const userRef = ref(this.db, `userActivity/${userId}`);
      const listener = onValue(userRef, (snapshot) => {
        const activity = snapshot.exists() ? snapshot.val() : { online: false };
        callback(activity);
      });
      this.listeners.set(userId, listener);
      console.log('👂 Listening to user activity:', userId);
    } catch (error) {
      console.error('❌ Error listening to user activity:', error);
    }
  }

  stopListening(userId) {
    const listener = this.listeners.get(userId);
    if (listener) {
      off(listener);
      this.listeners.delete(userId);
      console.log('🔇 Stopped listening to user:', userId);
    }
  }

  async getUserActivity(userId) {
    if (!this.db || !userId) return { online: false };
    try {
      const userRef = ref(this.db, `userActivity/${userId}`);
      return new Promise((resolve) => {
        onValue(userRef, (snapshot) => {
          const activity = snapshot.exists() ? snapshot.val() : { online: false };
          resolve(activity);
        }, { once: true });
      });
    } catch (error) {
      console.error('❌ Error getting user activity:', error);
      return { online: false };
    }
  }

  formatLastSeen(timestamp) {
    if (!timestamp) return 'Desconocido';
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  }
}

window.userActivitySystem = new UserActivitySystem();

// Add page visibility and beforeunload handlers
if (typeof window !== 'undefined') {
  // Handle page visibility changes
  document.addEventListener('visibilitychange', async () => {
    const currentUser = window.authFunctions?.getCurrentUser();
    if (currentUser && window.userActivitySystem) {
      if (document.hidden) {
        // Page is hidden - user might be switching tabs
        console.log('🟡 Page hidden, user might be away');
      } else {
        // Page is visible again - user is back
        await window.userActivitySystem.setUserOnline(currentUser.uid);
        console.log('🟢 Page visible, user is back online');
      }
    }
  });
  
  // Handle page unload (closing tab/browser)
  window.addEventListener('beforeunload', async () => {
    const currentUser = window.authFunctions?.getCurrentUser();
    if (currentUser && window.userActivitySystem.db) {
      try {
        // Try to set user offline before leaving
        const { set } = await import("https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js");
        await set(ref(window.userActivitySystem.db, `userActivity/${currentUser.uid}`), {
          online: false,
          lastSeen: Date.now()
        });
        console.log('🔴 User set offline on page unload');
      } catch (error) {
        console.log('Could not set offline on unload:', error);
      }
    }
  });
  
  // Handle focus/blur events
  window.addEventListener('focus', async () => {
    const currentUser = window.authFunctions?.getCurrentUser();
    if (currentUser && window.userActivitySystem) {
      await window.userActivitySystem.setUserOnline(currentUser.uid);
      console.log('🟢 Window focused, user online');
    }
  });
}

console.log('✅ UserActivitySystem loaded');