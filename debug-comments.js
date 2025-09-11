// Debug Comments - Minimal stub
window.debugComments = {
  log: (message, data) => {
    console.log('🔧 DebugComments:', message, data || '');
  },
  
  checkUserProfile: (userId) => {
    console.log('🔧 DebugComments: Checking user profile:', userId);
  },
  
  logCommentRender: (productId, commentsCount) => {
    console.log('🔧 DebugComments: Rendered comments for product:', productId, 'count:', commentsCount);
  },
  
  logUserSettings: (userId, settings) => {
    console.log('🔧 DebugComments: User settings for', userId, ':', settings);
  }
};

console.log('✅ DebugComments stub loaded');