// User Settings Loader - Minimal implementation
window.userSettingsLoader = {
  async loadUserSettings(userId) {
    try {
      if (!window.firestoreManager) {
        console.log('🔧 UserSettingsLoader: firestoreManager not available');
        return { profilePublic: false, activityVisible: false };
      }
      
      console.log('🔧 UserSettingsLoader: Loading settings for user:', userId);
      const settings = await window.firestoreManager.getUserSettings(userId);
      console.log('🔧 UserSettingsLoader: Settings loaded:', settings);
      return settings;
    } catch (error) {
      console.error('🔧 UserSettingsLoader: Error loading settings:', error);
      return { profilePublic: false, activityVisible: false };
    }
  }
};

console.log('✅ UserSettingsLoader initialized');