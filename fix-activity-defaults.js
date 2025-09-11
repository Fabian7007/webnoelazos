// Fix Activity Defaults - Ensure all users have proper activity settings
console.log('🔧 Loading activity defaults fix...');

// Function to fix activity defaults for all users
window.fixActivityDefaults = async function() {
  console.log('🔧 Fixing activity defaults for all users...');
  
  const currentUser = window.authFunctions?.getCurrentUser();
  if (!currentUser) {
    console.log('❌ No current user');
    return;
  }
  
  if (!window.firestoreManager) {
    console.log('❌ Firestore manager not available');
    return;
  }
  
  try {
    // Get current user settings
    let userSettings = await window.firestoreManager.getUserSettings(currentUser.uid);
    
    // If no settings exist or activityVisible is not set, set it to true by default
    if (!userSettings || userSettings.activityVisible === undefined) {
      console.log('🔧 Setting default activity visibility to true for user:', currentUser.uid);
      
      const defaultSettings = {
        ...userSettings,
        activityVisible: true, // Default to visible
        profilePublic: userSettings?.profilePublic || false
      };
      
      await window.firestoreManager.saveUserSettings(currentUser.uid, defaultSettings);
      console.log('✅ Default settings saved');
      
      // Mark user as online after setting defaults
      if (window.userActivitySystem) {
        await window.userActivitySystem.setUserOnline(currentUser.uid);
        console.log('✅ User marked as online');
      }
    } else {
      console.log('✅ User already has activity settings:', userSettings);
    }
  } catch (error) {
    console.error('❌ Error fixing activity defaults:', error);
  }
};

// Auto-fix when user logs in
document.addEventListener('DOMContentLoaded', () => {
  // Wait for auth system to be ready
  setTimeout(async () => {
    const currentUser = window.authFunctions?.getCurrentUser();
    if (currentUser) {
      await window.fixActivityDefaults();
    }
  }, 2000);
  
  // Also listen for auth state changes
  if (window.authFunctions && window.authFunctions.onAuthStateChanged) {
    window.authFunctions.onAuthStateChanged(async (user) => {
      if (user) {
        setTimeout(async () => {
          await window.fixActivityDefaults();
        }, 1000);
      }
    });
  }
});

console.log('✅ Activity defaults fix loaded');