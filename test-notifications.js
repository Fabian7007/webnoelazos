// Test script for the new notification system
console.log('🔔 Testing notification system...');

// Test function to create a sample notification
async function createTestNotification() {
  if (!window.firestoreManager || !window.authFunctions) {
    console.log('⚠️ Firebase not ready yet');
    return;
  }

  const user = window.authFunctions.getCurrentUser();
  if (!user) {
    console.log('⚠️ User not logged in');
    return;
  }

  try {
    // Create a test product notification
    const testProduct = {
      id: 'test-' + Date.now(),
      nombre: 'Producto de Prueba',
      precio: 1500,
      imagen: '/img-galery/logo.svg'
    };

    console.log('📧 Creating test notification...');
    await window.firestoreManager.createProductNotification(testProduct);
    console.log('✅ Test notification created!');

    // Update notification count
    if (window.notificationsManager) {
      setTimeout(() => {
        window.notificationsManager.loadUserNotifications();
      }, 1000);
    }

  } catch (error) {
    console.error('❌ Error creating test notification:', error);
  }
}

// Test function to show notifications panel
function showNotificationsTest() {
  if (window.notificationsManager) {
    window.notificationsManager.showNotificationsPanel();
  } else {
    console.log('⚠️ Notifications manager not available');
  }
}

// Add test functions to window for console access
window.createTestNotification = createTestNotification;
window.showNotificationsTest = showNotificationsTest;

console.log('✅ Notification test functions loaded');
console.log('📝 Use createTestNotification() to create a test notification');
console.log('📝 Use showNotificationsTest() to show the notifications panel');