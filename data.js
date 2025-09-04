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