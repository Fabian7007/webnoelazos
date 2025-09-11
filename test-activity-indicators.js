// Test Activity Indicators
console.log('🧪 Testing Activity Indicators...');

// Function to test activity indicators
window.testActivityIndicators = function() {
  console.log('=== TESTING ACTIVITY INDICATORS ===');
  
  // Check if systems are available
  console.log('1. Checking systems availability:');
  console.log('   - userActivitySystem:', !!window.userActivitySystem);
  console.log('   - commentsSystem:', !!window.commentsSystem);
  console.log('   - firestoreManager:', !!window.firestoreManager);
  console.log('   - authFunctions:', !!window.authFunctions);
  
  // Check current user
  const currentUser = window.authFunctions?.getCurrentUser();
  console.log('2. Current user:', currentUser?.uid || 'Not logged in');
  
  // Check if user is online
  if (currentUser && window.userActivitySystem) {
    window.userActivitySystem.getUserActivity(currentUser.uid).then(activity => {
      console.log('3. Current user activity:', activity);
    });
  }
  
  // Check activity indicators in DOM
  const indicators = document.querySelectorAll('.activity-indicator');
  console.log('4. Activity indicators found:', indicators.length);
  
  indicators.forEach((indicator, index) => {
    console.log(`   Indicator ${index + 1}:`, {
      id: indicator.id,
      classes: indicator.className,
      display: getComputedStyle(indicator).display,
      visibility: getComputedStyle(indicator).visibility
    });
  });
  
  // Check comment containers
  const commentContainers = document.querySelectorAll('.comment-avatar-container');
  console.log('5. Comment avatar containers:', commentContainers.length);
  
  commentContainers.forEach((container, index) => {
    const userId = container.getAttribute('data-user-id');
    const indicator = container.querySelector('.activity-indicator');
    console.log(`   Container ${index + 1}:`, {
      userId: userId,
      hasIndicator: !!indicator,
      indicatorDisplay: indicator ? getComputedStyle(indicator).display : 'N/A'
    });
  });
};

// Function to manually set a user as online (for testing)
window.setUserOnlineTest = async function(userId) {
  if (!userId) {
    const currentUser = window.authFunctions?.getCurrentUser();
    userId = currentUser?.uid;
  }
  
  if (!userId) {
    console.log('❌ No user ID provided and no current user');
    return;
  }
  
  console.log('🟢 Setting user online:', userId);
  
  if (window.userActivitySystem) {
    await window.userActivitySystem.setUserOnline(userId);
    console.log('✅ User set online');
    
    // Check activity after setting online
    setTimeout(async () => {
      const activity = await window.userActivitySystem.getUserActivity(userId);
      console.log('📊 User activity after setting online:', activity);
    }, 1000);
  } else {
    console.log('❌ userActivitySystem not available');
  }
};

// Function to test activity visibility settings
window.testActivitySettings = async function(userId) {
  if (!userId) {
    const currentUser = window.authFunctions?.getCurrentUser();
    userId = currentUser?.uid;
  }
  
  if (!userId) {
    console.log('❌ No user ID provided and no current user');
    return;
  }
  
  console.log('⚙️ Testing activity settings for user:', userId);
  
  if (window.firestoreManager) {
    try {
      const settings = await window.firestoreManager.getUserSettings(userId);
      console.log('📋 User settings:', settings);
      
      if (window.commentsSystem && window.commentsSystem.loadOtherUserSettings) {
        const processedSettings = await window.commentsSystem.loadOtherUserSettings(userId);
        console.log('🔄 Processed settings:', processedSettings);
      }
    } catch (error) {
      console.error('❌ Error loading settings:', error);
    }
  }
};

// Function to enable activity visibility for current user
window.enableActivityVisibility = async function() {
  const currentUser = window.authFunctions?.getCurrentUser();
  if (!currentUser) {
    console.log('❌ No current user');
    return;
  }
  
  console.log('🔧 Enabling activity visibility for current user');
  
  if (window.firestoreManager) {
    try {
      await window.firestoreManager.saveUserSettings(currentUser.uid, {
        activityVisible: true
      });
      console.log('✅ Activity visibility enabled');
      
      // Test the setting
      setTimeout(() => {
        window.testActivitySettings(currentUser.uid);
      }, 1000);
    } catch (error) {
      console.error('❌ Error saving settings:', error);
    }
  }
};

// Auto-run tests when page loads
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    console.log('🚀 Auto-running activity indicator tests...');
    window.testActivityIndicators();
  }, 3000);
});

console.log('🔧 Activity indicator test functions loaded:');
console.log('- testActivityIndicators(): Test current state');
console.log('- setUserOnlineTest(userId): Set user online');
console.log('- testActivitySettings(userId): Test user settings');
console.log('- enableActivityVisibility(): Enable for current user');