// Initialize empty products array
let productos = [];

// Function to load products from Firebase
window.loadProductsFromFirebase = async function() {
  try {
    if (window.firestoreManager) {
      const firestoreProducts = await window.firestoreManager.getProducts();
      productos = firestoreProducts.map(product => ({
        ...product,
        id: product.id || Date.now().toString(), // Asegurar que cada producto tenga un ID único
        imagen: product.imagen || '/img-galery/default-product.png', // Imagen por defecto si falta
        nombre: product.nombre || 'Producto sin nombre', // Nombre por defecto si falta
      }));
      
      // Refresh the current view after loading
      if (window.applyFilters) {
        window.applyFilters();
      }
      
      // Reinitialize carousel with new products
      if (window.reinitializeCarouselWithProducts) {
        window.reinitializeCarouselWithProducts();
      }
    }
  } catch (error) {
    console.error('Error loading products:', error);
  }
};

// Initialize products when page loads
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    if (window.firestoreManager) {
      window.loadProductsFromFirebase();
    }
  }, 1000);
});

window.firestoreManager = {
  // ...existing code...

  async addLike(userId, productId) {
    try {
      const likeRef = firebase.firestore().collection('likes').doc();
      await likeRef.set({
        userId,
        productId,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      console.log('Like added successfully');
    } catch (error) {
      console.error('Error adding like:', error);
    }
  },

  async removeLike(userId, productId) {
    try {
      const likesQuery = firebase.firestore()
        .collection('likes')
        .where('userId', '==', userId)
        .where('productId', '==', productId);

      const snapshot = await likesQuery.get();
      snapshot.forEach(doc => doc.ref.delete());
      console.log('Like removed successfully');
    } catch (error) {
      console.error('Error removing like:', error);
    }
  },

  async getLikes(userId) {
    try {
      const likesQuery = firebase.firestore()
        .collection('likes')
        .where('userId', '==', userId);

      const snapshot = await likesQuery.get();
      return snapshot.docs.map(doc => doc.data().productId);
    } catch (error) {
      console.error('Error fetching likes:', error);
      return [];
    }
  },
};