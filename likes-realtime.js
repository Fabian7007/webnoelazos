// Likes System using Firebase Realtime Database
import { initializeApp, getApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { 
  getDatabase, 
  ref, 
  set, 
  get, 
  remove, 
  onValue, 
  off,
  runTransaction
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";

class RealtimeLikesSystem {
  constructor() {
    this.db = null;
    this.anonymousUserId = null;
    this.listeners = new Map();
    this.init();
  }

  async init() {
    try {
      // Get Firebase app instance
      let app;
      try {
        app = getApp();
      } catch (error) {
        console.error('Firebase app not initialized');
        return;
      }

      // Initialize Realtime Database
      this.db = getDatabase(app);
      console.log('✅ Realtime Database initialized');

      await this.setupAnonymousUser();
      this.initializeLikeEvents();
    } catch (error) {
      console.error('Error initializing Realtime Likes System:', error);
    }
  }

  async setupAnonymousUser() {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      const ipHash = await this.hashIP(data.ip);
      this.anonymousUserId = `anon_${ipHash}`;
    } catch (error) {
      this.anonymousUserId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
  }

  async hashIP(ip) {
    const encoder = new TextEncoder();
    const data = encoder.encode(ip + 'webnoelazos_salt');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substr(0, 16);
  }

  getCurrentUserId() {
    const currentUser = window.authFunctions?.getCurrentUser?.();
    return currentUser ? currentUser.uid : this.anonymousUserId;
  }

  async toggleLike(productId) {
    if (!this.db) {
      console.error('Realtime Database not initialized');
      return false;
    }

    try {
      const userId = this.getCurrentUserId();
      if (!userId) return false;

      const userLikeRef = ref(this.db, `likes/${productId}/users/${userId}`);
      const countRef = ref(this.db, `likes/${productId}/count`);

      // Check if user already liked
      const snapshot = await get(userLikeRef);
      const hasLiked = snapshot.exists() && snapshot.val() === true;

      if (hasLiked) {
        // Remove like
        await remove(userLikeRef);
        
        // Update count with transaction
        await runTransaction(countRef, (currentCount) => {
          return Math.max(0, (currentCount || 0) - 1);
        });
      } else {
        // Add like
        await set(userLikeRef, true);
        
        // Update count with transaction
        await runTransaction(countRef, (currentCount) => {
          return (currentCount || 0) + 1;
        });
      }

      // Show notification
      this.showLikeNotification(hasLiked ? 'removed' : 'added');
      
      // UI updates happen automatically via listeners
      console.log(`Like ${hasLiked ? 'removed' : 'added'} for product ${productId}`);
      return true;
    } catch (error) {
      console.error('Error toggling like:', error);
      return false;
    }
  }

  updateLikeButtonState(productId, hasLiked) {
    const likeButtons = document.querySelectorAll(`.like-btn[data-product-id="${productId}"]`);
    
    likeButtons.forEach(likeBtn => {
      if (hasLiked) {
        likeBtn.classList.add('liked');
      } else {
        likeBtn.classList.remove('liked');
      }
    });
  }

  async updateLikeButton(productId) {
    const userId = this.getCurrentUserId();
    if (!userId) return;

    try {
      const userLikeRef = ref(this.db, `likes/${productId}/users/${userId}`);
      const snapshot = await get(userLikeRef);
      const hasLiked = snapshot.exists() && snapshot.val() === true;
      
      this.updateLikeButtonState(productId, hasLiked);
    } catch (error) {
      console.error('Error updating like button:', error);
    }
  }

  showLikeNotification(action) {
    const notification = document.createElement('div');
    notification.className = 'like-notification';
    notification.textContent = action === 'added' ? '❤️ ¡Te gusta este producto!' : '💔 Ya no te gusta este producto';
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${action === 'added' ? '#4CAF50' : '#f44336'};
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      z-index: 10000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      transform: translateX(100%);
      transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }

  updateLikeCountDisplay(productId, count) {
    const countElements = document.querySelectorAll(`.like-count[data-product-id="${productId}"], .like-count-overlay[data-product-id="${productId}"]`);
    
    countElements.forEach(countElement => {
      const displayCount = count || 0;
      countElement.textContent = displayCount;
      
      // Hide counter if count is 0 for cleaner look
      if (displayCount === 0) {
        countElement.style.display = 'none';
      } else {
        countElement.style.display = 'inline';
      }
    });

    // Update product data if available
    const product = window.productos?.find(p => p.id === productId);
    if (product) {
      product.likesCount = count || 0;
    }
  }

  async updateLikeCount(productId) {
    try {
      const countRef = ref(this.db, `likes/${productId}/count`);
      const snapshot = await get(countRef);
      const likeCount = snapshot.exists() ? snapshot.val() : 0;
      
      this.updateLikeCountDisplay(productId, likeCount);
    } catch (error) {
      console.error('Error updating like count:', error);
    }
  }

  async loadLikesForCurrentProducts() {
    const userId = this.getCurrentUserId();
    if (!userId) return;

    // Prevent multiple simultaneous executions
    if (this.loadingLikes) return;
    this.loadingLikes = true;

    setTimeout(async () => {
      const likeButtons = document.querySelectorAll('.like-btn[data-product-id]');
      
      for (const button of likeButtons) {
        const productId = button.getAttribute('data-product-id');
        if (productId) {
          // Always update, even if listener exists
          if (!this.listeners.has(productId)) {
            this.listenToProductLikes(productId);
          }
          
          // Initial load
          await this.updateLikeButton(productId);
          await this.updateLikeCount(productId);
          
          // Ensure button is visible
          button.style.visibility = 'visible';
          button.style.opacity = '1';
          button.style.display = 'flex';
          
          const container = button.closest('.like-container');
          if (container) {
            container.style.visibility = 'visible';
            container.style.opacity = '1';
            container.style.display = 'block';
          }
        }
      }
      this.loadingLikes = false;
    }, 100);
  }

  initializeLikeEvents() {
    document.addEventListener('click', async (e) => {
      if (e.target.closest('.like-btn')) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        
        const likeBtn = e.target.closest('.like-btn');
        const productId = likeBtn.getAttribute('data-product-id');
        
        if (productId) {
          await this.toggleLike(productId);
        }
        
        return false;
      }
    }, true);
  }

  async getUserLikedProducts(specificUserId = null) {
    try {
      const userId = specificUserId || this.getCurrentUserId();
      if (!userId || !window.productos) return [];

      const likedProducts = [];
      
      for (const product of window.productos) {
        try {
          const userLikeRef = ref(this.db, `likes/${product.id}/users/${userId}`);
          const snapshot = await get(userLikeRef);
          
          if (snapshot.exists() && snapshot.val() === true) {
            likedProducts.push(product);
          }
        } catch (error) {
          console.error(`Error checking like for product ${product.id}:`, error);
        }
      }
      
      return likedProducts;
    } catch (error) {
      console.error('Error getting user liked products:', error);
      return [];
    }
  }

  // Listen to real-time updates for a product's likes
  listenToProductLikes(productId) {
    if (!this.db) return;

    const userId = this.getCurrentUserId();
    if (!userId) return;

    // Listen to count changes
    const countRef = ref(this.db, `likes/${productId}/count`);
    const countListener = onValue(countRef, (snapshot) => {
      const count = snapshot.exists() ? snapshot.val() : 0;
      this.updateLikeCountDisplay(productId, count);
    });

    // Listen to user's like status changes
    const userLikeRef = ref(this.db, `likes/${productId}/users/${userId}`);
    const userListener = onValue(userLikeRef, (snapshot) => {
      const hasLiked = snapshot.exists() && snapshot.val() === true;
      this.updateLikeButtonState(productId, hasLiked);
    });

    // Store listeners for cleanup
    const listeners = { count: countListener, user: userListener };
    this.listeners.set(productId, listeners);
    return listeners;
  }

  // Stop listening to a product's likes
  stopListeningToProductLikes(productId) {
    const listeners = this.listeners.get(productId);
    if (listeners) {
      if (listeners.count) off(listeners.count);
      if (listeners.user) off(listeners.user);
      this.listeners.delete(productId);
    }
  }

  // Clean up all listeners
  cleanup() {
    this.listeners.forEach((listeners, productId) => {
      if (listeners.count) off(listeners.count);
      if (listeners.user) off(listeners.user);
    });
    this.listeners.clear();
  }
}

// Initialize the system
let realtimeLikesSystem;
try {
  realtimeLikesSystem = new RealtimeLikesSystem();
  window.realtimeLikesSystem = realtimeLikesSystem;
  console.log('✅ Realtime Likes System initialized');
} catch (error) {
  console.error('❌ Error initializing Realtime Likes System:', error);
}

// Export functions for compatibility
window.toggleProductLike = (productId) => window.realtimeLikesSystem.toggleLike(productId);
window.loadUserLikes = () => window.realtimeLikesSystem.loadLikesForCurrentProducts();

// Initialize events when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  if (window.realtimeLikesSystem) {
    window.realtimeLikesSystem.initializeLikeEvents();
  }
});

// Load likes when products are loaded
window.addEventListener('productsLoaded', () => {
  setTimeout(() => {
    if (window.realtimeLikesSystem) {
      window.realtimeLikesSystem.loadLikesForCurrentProducts();
    }
  }, 500);
});

// Load likes when section changes
if (typeof window.showSection !== 'undefined') {
  const originalShowSection = window.showSection;
  window.showSection = function(section) {
    const result = originalShowSection.call(this, section);
    setTimeout(() => {
      if (window.realtimeLikesSystem) {
        window.realtimeLikesSystem.loadLikesForCurrentProducts();
      }
    }, 300);
    return result;
  };
}

// Auto-trigger likes loading when DOM changes
let likesObserver;
function setupLikesObserver() {
  if (likesObserver) likesObserver.disconnect();
  
  likesObserver = new MutationObserver((mutations) => {
    let shouldLoadLikes = false;
    
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) {
            // Check if it's a product or contains like buttons
            if (node.classList?.contains('product') || 
                node.querySelector?.('.like-btn') ||
                node.classList?.contains('like-btn') ||
                node.classList?.contains('like-container')) {
              shouldLoadLikes = true;
            }
          }
        });
      }
      
      // Also check for attribute changes that might affect visibility
      if (mutation.type === 'attributes' && 
          (mutation.attributeName === 'style' || mutation.attributeName === 'class')) {
        const target = mutation.target;
        if (target.classList?.contains('like-btn') || target.classList?.contains('like-container')) {
          shouldLoadLikes = true;
        }
      }
    });
    
    if (shouldLoadLikes && window.realtimeLikesSystem) {
      setTimeout(() => {
        window.realtimeLikesSystem.loadLikesForCurrentProducts();
      }, 50);
    }
  });
  
  // Observe the main content areas and body
  const targets = [document.body, ...document.querySelectorAll('.section, .minimal-carousel-track')];
  targets.forEach(target => {
    if (target) {
      likesObserver.observe(target, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class']
      });
    }
  });
}

// Load likes when filters are applied
if (typeof window.applyFilters !== 'undefined') {
  const originalApplyFilters = window.applyFilters;
  window.applyFilters = function(page) {
    const result = originalApplyFilters.call(this, page);
    setTimeout(() => {
      if (window.realtimeLikesSystem) {
        window.realtimeLikesSystem.loadLikesForCurrentProducts();
      }
    }, 300);
    return result;
  };
}

// Handle auth state changes
if (window.authFunctions) {
  window.authFunctions.onAuthStateChanged((user) => {
    setTimeout(() => {
      if (window.realtimeLikesSystem) {
        window.realtimeLikesSystem.setupAnonymousUser().then(() => {
          window.realtimeLikesSystem.loadLikesForCurrentProducts();
        });
      }
    }, 1000);
  });
}

// Initialize likes when DOM is fully loaded
window.addEventListener('load', () => {
  setTimeout(() => {
    if (window.realtimeLikesSystem) {
      window.realtimeLikesSystem.loadLikesForCurrentProducts();
      setupLikesObserver();
    }
  }, 1000);
});

// Additional mobile-specific initialization
if (window.innerWidth <= 768) {
  // Force likes loading on mobile after a delay
  setTimeout(() => {
    if (window.realtimeLikesSystem) {
      window.realtimeLikesSystem.loadLikesForCurrentProducts();
    }
  }, 2000);
  
  // Re-check likes every few seconds on mobile
  setInterval(() => {
    if (window.realtimeLikesSystem && document.querySelectorAll('.like-btn[data-product-id]').length > 0) {
      window.realtimeLikesSystem.loadLikesForCurrentProducts();
    }
  }, 5000);
}

// Setup observer when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(setupLikesObserver, 2000);
});

export { RealtimeLikesSystem };