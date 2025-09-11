// Force Activity Indicators - Simple Fix
console.log('🔧 Forcing activity indicators to show...');

// Force show activity indicators for all users
window.forceShowActivityIndicators = function() {
  console.log('🟢 Forcing activity indicators to show for all users');
  
  // Find all activity indicators
  const indicators = document.querySelectorAll('.activity-indicator');
  console.log('Found indicators:', indicators.length);
  
  indicators.forEach((indicator, index) => {
    // Force show the indicator
    indicator.style.display = 'block';
    indicator.className = 'activity-indicator';
    indicator.title = 'En línea';
    console.log(`Indicator ${index + 1} forced to show`);
  });
  
  // Also check for comment containers without indicators and add them
  const containers = document.querySelectorAll('.comment-avatar-container');
  containers.forEach((container, index) => {
    if (!container.querySelector('.activity-indicator')) {
      const indicator = document.createElement('div');
      indicator.className = 'activity-indicator';
      indicator.style.display = 'block';
      indicator.title = 'En línea';
      container.appendChild(indicator);
      console.log(`Added missing indicator to container ${index + 1}`);
    }
  });
};

// Auto-run when page loads
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    window.forceShowActivityIndicators();
    
    // Run again after comments load
    setTimeout(() => {
      window.forceShowActivityIndicators();
    }, 3000);
  }, 2000);
});

// Run when comments are updated
const originalRenderComments = window.commentsSystem?.renderComments;
if (originalRenderComments) {
  window.commentsSystem.renderComments = function(...args) {
    const result = originalRenderComments.apply(this, args);
    setTimeout(() => {
      window.forceShowActivityIndicators();
    }, 500);
    return result;
  };
}

console.log('✅ Activity indicators force script loaded');