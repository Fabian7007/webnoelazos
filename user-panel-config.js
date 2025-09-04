// User Panel Configuration and Utilities
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
      },
      ocean: {
        primary: '#0ea5e9',
        secondary: '#06b6d4',
        accent: '#10b981',
        background: '#f0f9ff',
        text: '#0f172a'
      }
    };
    
    this.animations = {
      enabled: true,
      duration: 300,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
    };
    
    this.features = {
      particleEffects: true,
      soundEffects: false,
      hapticFeedback: true,
      autoSave: true
    };
  }
  
  // Apply theme
  applyTheme(themeName) {
    const theme = this.themes[themeName];
    if (!theme) return;
    
    const root = document.documentElement;
    Object.keys(theme).forEach(key => {
      root.style.setProperty(`--user-panel-${key}`, theme[key]);
    });
    
    localStorage.setItem('userPanelTheme', themeName);
  }
  
  // Toggle animations
  toggleAnimations(enabled) {
    this.animations.enabled = enabled;
    document.body.classList.toggle('animations-disabled', !enabled);
    localStorage.setItem('userPanelAnimations', enabled);
  }
  
  // Get user level based on activity
  calculateUserLevel(user) {
    if (!user) return 1;
    
    const likes = JSON.parse(localStorage.getItem(`likes_${user.uid}`)) || [];
    const saved = JSON.parse(localStorage.getItem(`saved_${user.uid}`)) || [];
    const purchases = JSON.parse(localStorage.getItem(`purchases_${user.uid}`)) || [];
    
    const totalActivity = likes.length + saved.length + (purchases.length * 2);
    return Math.floor(totalActivity / 5) + 1;
  }
  
  // Get user badge based on level
  getUserBadge(level) {
    const badges = {
      1: { name: 'Novato', icon: '🌱', color: '#10b981' },
      2: { name: 'Explorador', icon: '🔍', color: '#3b82f6' },
      3: { name: 'Coleccionista', icon: '💎', color: '#8b5cf6' },
      4: { name: 'Experto', icon: '⭐', color: '#f59e0b' },
      5: { name: 'Maestro', icon: '👑', color: '#ef4444' },
      6: { name: 'Leyenda', icon: '🏆', color: '#ff6b9d' }
    };
    
    const maxLevel = Math.min(level, 6);
    return badges[maxLevel] || badges[1];
  }
  
  // Generate user stats
  generateUserStats(user) {
    if (!user) return null;
    
    const likes = JSON.parse(localStorage.getItem(`likes_${user.uid}`)) || [];
    const saved = JSON.parse(localStorage.getItem(`saved_${user.uid}`)) || [];
    const purchases = JSON.parse(localStorage.getItem(`purchases_${user.uid}`)) || [];
    const settings = JSON.parse(localStorage.getItem(`settings_${user.uid}`)) || {};
    
    const level = this.calculateUserLevel(user);
    const badge = this.getUserBadge(level);
    
    const accountAge = Math.floor((Date.now() - new Date(user.metadata.creationTime).getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      level,
      badge,
      accountAge,
      totalLikes: likes.length,
      totalSaved: saved.length,
      totalPurchases: purchases.length,
      lastActivity: user.metadata.lastSignInTime,
      preferences: settings
    };
  }
  
  // Add achievement system
  checkAchievements(user) {
    if (!user) return [];
    
    const stats = this.generateUserStats(user);
    const achievements = [];
    
    // First like achievement
    if (stats.totalLikes >= 1) {
      achievements.push({
        id: 'first_like',
        name: 'Primer Favorito',
        description: 'Agregaste tu primer producto a favoritos',
        icon: '❤️',
        unlocked: true
      });
    }
    
    // Collector achievement
    if (stats.totalLikes >= 10) {
      achievements.push({
        id: 'collector',
        name: 'Coleccionista',
        description: 'Tienes 10 productos en favoritos',
        icon: '📚',
        unlocked: true
      });
    }
    
    // Shopper achievement
    if (stats.totalPurchases >= 1) {
      achievements.push({
        id: 'first_purchase',
        name: 'Primera Compra',
        description: 'Realizaste tu primera compra',
        icon: '🛍️',
        unlocked: true
      });
    }
    
    // Loyal customer achievement
    if (stats.accountAge >= 30) {
      achievements.push({
        id: 'loyal_customer',
        name: 'Cliente Leal',
        description: 'Tienes una cuenta de más de 30 días',
        icon: '🏅',
        unlocked: true
      });
    }
    
    return achievements;
  }
  
  // Show achievement notification
  showAchievement(achievement) {
    if (!achievement || !window.authModal) return;
    
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.innerHTML = `
      <div class="achievement-content">
        <div class="achievement-icon">${achievement.icon}</div>
        <div class="achievement-text">
          <div class="achievement-title">¡Logro Desbloqueado!</div>
          <div class="achievement-name">${achievement.name}</div>
          <div class="achievement-desc">${achievement.description}</div>
        </div>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 500);
    }, 4000);
  }
  
  // Export user data
  exportUserData(user) {
    if (!user) return null;
    
    const userData = {
      profile: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        createdAt: user.metadata.creationTime,
        lastSignIn: user.metadata.lastSignInTime
      },
      likes: JSON.parse(localStorage.getItem(`likes_${user.uid}`)) || [],
      saved: JSON.parse(localStorage.getItem(`saved_${user.uid}`)) || [],
      purchases: JSON.parse(localStorage.getItem(`purchases_${user.uid}`)) || [],
      settings: JSON.parse(localStorage.getItem(`settings_${user.uid}`)) || {},
      stats: this.generateUserStats(user),
      achievements: this.checkAchievements(user),
      exportDate: new Date().toISOString()
    };
    
    return userData;
  }
  
  // Import user data
  importUserData(user, data) {
    if (!user || !data) return false;
    
    try {
      if (data.likes) {
        localStorage.setItem(`likes_${user.uid}`, JSON.stringify(data.likes));
      }
      if (data.saved) {
        localStorage.setItem(`saved_${user.uid}`, JSON.stringify(data.saved));
      }
      if (data.purchases) {
        localStorage.setItem(`purchases_${user.uid}`, JSON.stringify(data.purchases));
      }
      if (data.settings) {
        localStorage.setItem(`settings_${user.uid}`, JSON.stringify(data.settings));
      }
      
      return true;
    } catch (error) {
      console.error('Error importing user data:', error);
      return false;
    }
  }
}

// Initialize configuration
window.userPanelConfig = new UserPanelConfig();

// Add achievement notification styles
const achievementStyles = document.createElement('style');
achievementStyles.textContent = `
  .achievement-notification {
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #ff6b9d, #8b5cf6);
    color: white;
    padding: 1rem;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(255, 107, 157, 0.3);
    transform: translateX(100%);
    opacity: 0;
    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 10002;
    max-width: 300px;
    min-width: 250px;
  }
  
  .achievement-notification.show {
    transform: translateX(0);
    opacity: 1;
  }
  
  .achievement-content {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .achievement-icon {
    font-size: 2rem;
    animation: achievementBounce 0.6s ease-out;
  }
  
  @keyframes achievementBounce {
    0% { transform: scale(0); }
    50% { transform: scale(1.2); }
    100% { transform: scale(1); }
  }
  
  .achievement-title {
    font-size: 0.9rem;
    font-weight: 600;
    margin-bottom: 0.25rem;
    opacity: 0.9;
  }
  
  .achievement-name {
    font-size: 1.1rem;
    font-weight: 700;
    margin-bottom: 0.25rem;
  }
  
  .achievement-desc {
    font-size: 0.8rem;
    opacity: 0.8;
    line-height: 1.3;
  }
  
  @media (max-width: 768px) {
    .achievement-notification {
      top: 10px;
      right: 10px;
      left: 10px;
      max-width: none;
      min-width: auto;
    }
  }
`;

document.head.appendChild(achievementStyles);

// Disabled auto-check to prevent lag
// document.addEventListener('DOMContentLoaded', function() {
//   setInterval(() => {
//     if (window.currentUser && window.userPanelConfig) {
//       const achievements = window.userPanelConfig.checkAchievements(window.currentUser);
//       const shownAchievements = JSON.parse(localStorage.getItem(`shown_achievements_${window.currentUser.uid}`)) || [];
//       
//       achievements.forEach(achievement => {
//         if (!shownAchievements.includes(achievement.id)) {
//           window.userPanelConfig.showAchievement(achievement);
//           shownAchievements.push(achievement.id);
//           localStorage.setItem(`shown_achievements_${window.currentUser.uid}`, JSON.stringify(shownAchievements));
//         }
//       });
//     }
//   }, 5000);
// });