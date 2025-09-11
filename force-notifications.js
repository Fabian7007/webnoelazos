// Force Notifications - Simple Fix
console.log('🔔 Loading force notifications script...');

// Function to create test notifications for current user
window.createTestNotification = async function() {
  const currentUser = window.authFunctions?.getCurrentUser();
  if (!currentUser) {
    console.log('❌ No current user');
    return;
  }
  
  if (!window.firestoreManager) {
    console.log('❌ Firestore manager not available');
    return;
  }
  
  console.log('🧪 Creating test notification for user:', currentUser.uid);
  
  try {
    // Create a test product notification
    const testProduct = {
      id: 'test-' + Date.now(),
      nombre: 'Producto de Prueba',
      precio: 1500,
      imagen: '/img-galery/logo.svg'
    };
    
    const notifications = await window.firestoreManager.createProductNotification(testProduct);
    console.log('✅ Test notifications created:', notifications.length);
    
    // Update notification count
    if (window.authModal) {
      setTimeout(async () => {
        await window.authModal.updateNotificationCount();
      }, 1000);
    }
    
    return notifications;
  } catch (error) {
    console.error('❌ Error creating test notification:', error);
  }
};

// Function to force enable notifications for current user
window.enableNotificationsForCurrentUser = async function() {
  const currentUser = window.authFunctions?.getCurrentUser();
  if (!currentUser) {
    console.log('❌ No current user');
    return;
  }
  
  console.log('🔧 Enabling notifications for current user');
  
  try {
    await window.firestoreManager.saveUserSettings(currentUser.uid, {
      promotionNotifications: true,
      emailNotifications: true
    });
    
    console.log('✅ Notifications enabled for user');
    
    // Create test notification
    await window.createTestNotification();
    
  } catch (error) {
    console.error('❌ Error enabling notifications:', error);
  }
};

// Function to check notification settings for all users
window.checkAllUsersNotificationSettings = async function() {
  if (!window.firestoreManager) {
    console.log('❌ Firestore manager not available');
    return;
  }
  
  console.log('🔍 Checking notification settings for all users...');
  
  try {
    // This is a simplified check - in a real app you'd need proper permissions
    console.log('📋 Use the admin panel to check user settings');
    console.log('💡 Or run: enableNotificationsForCurrentUser() to enable for current user');
  } catch (error) {
    console.error('❌ Error checking user settings:', error);
  }
};

// Auto-enable notifications for current user when script loads
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(async () => {
    const currentUser = window.authFunctions?.getCurrentUser();
    if (currentUser) {
      console.log('🔧 Auto-enabling notifications for current user...');
      await window.enableNotificationsForCurrentUser();
    }
  }, 3000);
});

console.log('✅ Force notifications script loaded');
console.log('🔧 Available functions:');
console.log('- createTestNotification(): Create test notification');
console.log('- enableNotificationsForCurrentUser(): Enable notifications');
console.log('- checkAllUsersNotificationSettings(): Check settings');