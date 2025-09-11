// User Panel Configuration - Simplified
class UserPanelConfig {
  constructor() {
    this.themes = {
      default: {
        primary: '#ff6b9d',
        secondary: '#8b5cf6',
        accent: '#06d6a0',
        background: '#ffffff',
        text: '#495057'
      },
      dark: {
        primary: '#ff6b9d',
        secondary: '#8b5cf6',
        accent: '#06d6a0',
        background: '#2d3748',
        text: '#e2e8f0'
      }
    };
    
    this.defaultPerformanceSettings = {
      lazyLoadImages: true,
      preloadNextPage: false,
      cacheProducts: true,
      lowBandwidthMode: false,
      imageQuality: 'high',
      autoPlayCarousel: true,
      showAnimations: true
    };
  }
  
  applyTheme(themeName) {
    const theme = this.themes[themeName];
    if (!theme) return;
    
    const root = document.documentElement;
    Object.keys(theme).forEach(key => {
      root.style.setProperty(`--user-panel-${key}`, theme[key]);
    });
    
    localStorage.setItem('userPanelTheme', themeName);
  }
  

  
  async generateUserStats(user) {
    if (!user) return null;
    
    try {
      // Get real stats from Firestore
      const userStats = await window.firestoreManager.getUserStats(user.uid);
      
      return {
        totalLikes: userStats.totalLikes || 0,
        totalViews: userStats.totalViews || 0,
        accountAge: userStats.accountAge || 0,
        totalComments: userStats.totalComments || 0
      };
    } catch (error) {
      console.error('Error generating user stats:', error);
      return {
        totalLikes: 0,
        totalViews: 0,
        accountAge: 0,
        totalComments: 0
      };
    }
  }
  
  // Funciones para manejar loaders
  showStatsLoader() {
    const loader = document.getElementById('statsLoader');
    const container = document.querySelector('#userStats .stats-container');
    if (loader && container) {
      loader.style.display = 'block';
      container.style.display = 'none';
    }
  }
  
  hideStatsLoader() {
    const loader = document.getElementById('statsLoader');
    const container = document.querySelector('#userStats .stats-container');
    if (loader && container) {
      loader.style.display = 'none';
      container.style.display = 'grid';
    }
  }
  
  showLikesLoader() {
    const loader = document.getElementById('likesLoader');
    const grid = document.getElementById('likesGrid');
    if (loader && grid) {
      loader.style.display = 'block';
      grid.style.display = 'none';
    }
  }
  
  hideLikesLoader() {
    const loader = document.getElementById('likesLoader');
    const grid = document.getElementById('likesGrid');
    if (loader && grid) {
      loader.style.display = 'none';
      grid.style.display = 'grid';
    }
  }
  
  // Performance Settings
  async loadPerformanceSettings(userId) {
    if (!userId || !window.firestoreManager) return this.defaultPerformanceSettings;
    
    try {
      const userSettings = await window.firestoreManager.getUserSettings(userId);
      return {
        ...this.defaultPerformanceSettings,
        ...userSettings.performanceSettings
      };
    } catch (error) {
      console.error('Error loading performance settings:', error);
      return this.defaultPerformanceSettings;
    }
  }
  
  async savePerformanceSettings(userId, settings) {
    if (!userId || !window.firestoreManager) return;
    
    try {
      console.log('💾 Saving performance settings:', settings);
      await window.firestoreManager.saveUserSettings(userId, {
        performanceSettings: settings
      });
      
      // Apply settings immediately
      this.applyPerformanceSettings(settings);
      
      // Force carousel autoplay setting
      if (settings.autoPlayCarousel !== undefined) {
        window.setCarouselAutoplay(settings.autoPlayCarousel);
      }
      
      console.log('✅ Performance settings saved and applied');
    } catch (error) {
      console.error('Error saving performance settings:', error);
    }
  }
  
  applyPerformanceSettings(settings) {
    console.log('🔧 Applying performance settings:', settings);
    
    // Apply image quality first
    if (settings.imageQuality) {
      this.setImageQuality(settings.imageQuality);
    }
    
    // Apply low bandwidth mode
    if (settings.lowBandwidthMode) {
      document.body.classList.add('low-bandwidth-mode');
      // Force low quality when low bandwidth mode is on
      this.setImageQuality('low');
    } else {
      document.body.classList.remove('low-bandwidth-mode');
    }
    
    // Apply lazy loading
    if (settings.lazyLoadImages) {
      this.enableLazyLoading();
    } else {
      this.disableLazyLoading();
    }
    
    // Apply carousel autoplay
    if (settings.autoPlayCarousel !== undefined && window.setCarouselAutoplay) {
      window.setCarouselAutoplay(settings.autoPlayCarousel);
    }
    
    // Store settings globally
    window.performanceSettings = settings;
    
    console.log('✅ Performance settings applied successfully');
  }
  
  enableLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      });
    });
    
    images.forEach(img => imageObserver.observe(img));
  }
  
  disableLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    images.forEach(img => {
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
    });
  }
  
  setImageQuality(quality) {
    console.log('🖼️ Setting image quality to:', quality);
    
    const root = document.documentElement;
    root.setAttribute('data-image-quality', quality);
    
    // Remove existing style
    const existingStyle = document.getElementById('image-quality-style');
    if (existingStyle) {
      existingStyle.remove();
    }
    
    // Apply CSS based on quality
    const style = document.createElement('style');
    style.id = 'image-quality-style';
    
    let css = `
      /* Header protection - highest priority */
      .header img, .header .logo, .logo {
        filter: none !important;
        transform: translate(-50%, -50%) !important;
        opacity: 1 !important;
        image-rendering: auto !important;
        position: absolute !important;
        left: 50% !important;
        top: 55% !important;
      }
      
      /* Icon protection */
      .account-icon, .search-icon, .cart-icon, .user-profile-pic, .profile-picture {
        filter: none !important;
        transform: none !important;
        opacity: 1 !important;
        image-rendering: auto !important;
      }
    `;
    
    if (quality === 'low') {
      css += `
        [data-image-quality="low"] .product img,
        [data-image-quality="low"] .gray-square img,
        [data-image-quality="low"] .section img {
          image-rendering: pixelated !important;
          filter: blur(1.5px) contrast(0.7) saturate(0.8) !important;
          transform: scale(0.98) !important;
          opacity: 0.85 !important;
        }
      `;
    } else if (quality === 'medium') {
      css += `
        [data-image-quality="medium"] .product img,
        [data-image-quality="medium"] .gray-square img,
        [data-image-quality="medium"] .section img {
          image-rendering: auto !important;
          filter: contrast(0.95) brightness(0.98) !important;
          opacity: 0.95 !important;
        }
      `;
    } else {
      css += `
        [data-image-quality="high"] .product img,
        [data-image-quality="high"] .gray-square img,
        [data-image-quality="high"] .section img {
          image-rendering: -webkit-optimize-contrast !important;
          filter: contrast(1.05) brightness(1.02) saturate(1.1) !important;
          opacity: 1 !important;
        }
      `;
    }
    
    style.textContent = css;
    document.head.appendChild(style);
    
    // Force re-render only product images, not header images
    setTimeout(() => {
      const productImages = document.querySelectorAll('.product img, .gray-square img, .section img');
      productImages.forEach(img => {
        if (img.complete && !img.closest('.header') && !img.classList.contains('logo')) {
          const src = img.src;
          img.src = '';
          img.src = src;
        }
      });
      
      // Ensure logo stays centered
      const logo = document.querySelector('.logo');
      if (logo) {
        logo.style.position = 'absolute';
        logo.style.left = '50%';
        logo.style.top = '55%';
        logo.style.transform = 'translate(-50%, -50%)';
      }
    }, 100);
    
    console.log('✅ Image quality applied:', quality);
  }
}

// Initialize configuration
window.userPanelConfig = new UserPanelConfig();

// Stats management functions
window.updateUserStats = async function(userId, statType, increment = 1) {
  if (!userId || !window.firestoreManager) return;
  
  try {
    await window.firestoreManager.updateUserStats(userId, statType, increment);
  } catch (error) {
    console.error('Error updating user stats:', error);
  }
};

window.trackProductView = async function(userId, productId) {
  if (!userId) return;
  await window.updateUserStats(userId, 'totalViews', 1);
};

window.trackProductLike = async function(userId, productId) {
  if (!userId) return;
  await window.updateUserStats(userId, 'totalLikes', 1);
};

window.trackProductUnlike = async function(userId, productId) {
  if (!userId) return;
  await window.updateUserStats(userId, 'totalLikes', -1);
};

window.trackComment = async function(userId, productId) {
  if (!userId) return;
  await window.updateUserStats(userId, 'totalComments', 1);
};

// Auto-load user settings on page load
window.autoLoadUserSettings = async function(user) {
  if (!user || !window.firestoreManager) return;
  
  try {
    console.log('🔧 Auto-loading user settings for:', user.uid);
    
    // Get user settings from Firestore
    const userSettings = await window.firestoreManager.getUserSettings(user.uid);
    
    // Apply all settings immediately
    if (userSettings) {
      // Apply performance settings
      if (userSettings.performanceSettings) {
        window.userPanelConfig.applyPerformanceSettings(userSettings.performanceSettings);
        
        // Apply carousel autoplay
        if (userSettings.performanceSettings.autoPlayCarousel !== undefined) {
          window.setCarouselAutoplay(userSettings.performanceSettings.autoPlayCarousel);
        }
      }
      
      // Apply general settings
      if (userSettings.removeAnimations) {
        document.body.classList.add('no-animations');
      }
      
      if (userSettings.compactMode) {
        document.body.classList.add('compact-mode');
      }
      
      // Apply privacy settings
      window.applyPrivacySettings(userSettings);
      
      console.log('✅ User settings auto-loaded successfully');
    }
  } catch (error) {
    console.error('❌ Error auto-loading user settings:', error);
  }
};

// Apply privacy settings
window.applyPrivacySettings = function(settings) {
  const statusIndicators = document.querySelectorAll('.status-indicator');
  
  if (settings.activityVisible !== false) {
    statusIndicators.forEach(indicator => {
      indicator.style.display = 'block';
      indicator.classList.add('online');
    });
  } else {
    statusIndicators.forEach(indicator => {
      indicator.style.display = 'none';
    });
  }
};

// Carousel autoplay control
window.setCarouselAutoplay = function(enabled) {
  if (window.minimalCarousel) {
    if (enabled) {
      window.minimalCarousel.startAutoplay();
    } else {
      window.minimalCarousel.stopAutoplay();
    }
  }
  
  // Store setting globally
  window.carouselAutoplayEnabled = enabled;
  console.log('🎠 Carousel autoplay:', enabled ? 'enabled' : 'disabled');
};

// Update user settings cache
window.updateUserSettingsCache = function(userId, settings) {
  if (!userId) return;
  
  try {
    localStorage.setItem(`userSettings_${userId}`, JSON.stringify({
      ...settings,
      lastUpdated: Date.now()
    }));
    console.log('✅ User settings cache updated for user:', userId);
  } catch (error) {
    console.error('Error updating user settings cache:', error);
  }
};

// Privacy settings handlers
window.initPrivacySettingsHandlers = function() {
  const profilePublicCheckbox = document.getElementById('profilePublic');
  const activityVisibleCheckbox = document.getElementById('activityVisible');
  
  if (profilePublicCheckbox) {
    profilePublicCheckbox.addEventListener('change', async () => {
      const user = window.authFunctions?.getCurrentUser();
      if (!user) return;
      
      const settings = { profilePublic: profilePublicCheckbox.checked };
      console.log('saved userSettings', settings);
      
      await window.firestoreManager.saveUserSettings(user.uid, settings);
      
      // Apply immediately in UI
      if (window.authModal) {
        window.authModal.updateProfileVisibility(profilePublicCheckbox.checked);
      }
    });
  }
  
  if (activityVisibleCheckbox) {
    activityVisibleCheckbox.addEventListener('change', async () => {
      const user = window.authFunctions?.getCurrentUser();
      if (!user) return;
      
      const settings = { activityVisible: activityVisibleCheckbox.checked };
      console.log('saved userSettings', settings);
      
      await window.firestoreManager.saveUserSettings(user.uid, settings);
      
      // Apply immediately in UI
      if (window.authModal) {
        window.authModal.updateActivityVisibility(activityVisibleCheckbox.checked);
      }
    });
  }
};

// Funciones globales para usar el loader
window.showStatsLoader = () => window.userPanelConfig.showStatsLoader();
window.hideStatsLoader = () => window.userPanelConfig.hideStatsLoader();
window.showLikesLoader = () => window.userPanelConfig.showLikesLoader();
window.hideLikesLoader = () => window.userPanelConfig.hideLikesLoader();