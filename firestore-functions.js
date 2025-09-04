// Firestore functions for user management
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  deleteDoc,
  updateDoc
} from 'https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js';

class FirestoreManager {
  constructor(app) {
    this.db = getFirestore(app);
  }

  // Crear usuario en Firestore
  async createUser(uid, userData) {
    try {
      const userRef = doc(this.db, 'users', uid);
      await setDoc(userRef, {
        uid: uid,
        username: userData.username,
        email: userData.email,
        profileImage: userData.profileImage,
        isGoogleUser: userData.isGoogleUser || false,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastProfileEdit: userData.lastProfileEdit || null
      });
      return true;
    } catch (error) {
      console.error('Error creating user:', error);
      return false;
    }
  }

  // Obtener datos del usuario
  async getUser(uid) {
    try {
      const userRef = doc(this.db, 'users', uid);
      const userSnap = await getDoc(userRef);
      return userSnap.exists() ? userSnap.data() : null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  // Verificar si es administrador
  async isAdmin(uid) {
    try {
      const adminRef = doc(this.db, 'admin', uid);
      const adminSnap = await getDoc(adminRef);
      return adminSnap.exists();
    } catch (error) {
      console.error('Error checking admin:', error);
      return false;
    }
  }

  // Obtener rol del usuario
  async getUserRole(uid) {
    try {
      const isAdmin = await this.isAdmin(uid);
      return isAdmin ? 'administrador' : 'usuario';
    } catch (error) {
      console.error('Error getting user role:', error);
      return 'usuario';
    }
  }

  // Actualizar usuario
  async updateUser(uid, userData) {
    try {
      const userRef = doc(this.db, 'users', uid);
      await setDoc(userRef, {
        username: userData.username,
        profileImage: userData.profileImage,
        updatedAt: new Date(),
        lastProfileEdit: new Date()
      }, { merge: true });
      return true;
    } catch (error) {
      console.error('Error updating user:', error);
      return false;
    }
  }

  // Crear producto
  async createProduct(productData) {
    try {
      const productRef = doc(collection(this.db, 'products'));
      await setDoc(productRef, {
        ...productData,
        id: productRef.id,
        likesCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return productRef.id;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  // Obtener todos los productos
  async getProducts() {
    try {
      const productsRef = collection(this.db, 'products');
      const snapshot = await getDocs(productsRef);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting products:', error);
      return [];
    }
  }

  // Actualizar producto
  async updateProduct(productId, productData) {
    try {
      const productRef = doc(this.db, 'products', productId);
      await setDoc(productRef, {
        ...productData,
        updatedAt: new Date()
      }, { merge: true });
      return true;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  // Eliminar producto
  async deleteProduct(productId) {
    try {
      const productRef = doc(this.db, 'products', productId);
      await deleteDoc(productRef);
      return true;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  // Dar like a producto
  async likeProduct(productId, userId) {
    try {
      console.log('Attempting to like product:', productId, 'by user:', userId);
      
      const likeRef = doc(this.db, 'likes', `${productId}_${userId}`);
      await setDoc(likeRef, {
        productId: productId,
        userId: userId,
        createdAt: new Date()
      });
      
      console.log('Like document created successfully');
      
      // Actualizar contador en el producto
      const productRef = doc(this.db, 'products', productId);
      const productSnap = await getDoc(productRef);
      if (productSnap.exists()) {
        const currentLikes = Number(productSnap.data().likesCount) || 0;
        await updateDoc(productRef, {
          likesCount: currentLikes + 1,
          updatedAt: new Date()
        });
        console.log('Product likes count updated to:', currentLikes + 1);
      }
      
      return true;
    } catch (error) {
      console.error('Error liking product:', error);
      console.error('Error details:', error.message);
      throw error;
    }
  }

  // Quitar like a producto
  async unlikeProduct(productId, userId) {
    try {
      console.log('Attempting to unlike product:', productId, 'by user:', userId);
      
      const likeRef = doc(this.db, 'likes', `${productId}_${userId}`);
      await deleteDoc(likeRef);
      
      console.log('Like document deleted successfully');
      
      // Actualizar contador en el producto
      const productRef = doc(this.db, 'products', productId);
      const productSnap = await getDoc(productRef);
      if (productSnap.exists()) {
        const currentLikes = Number(productSnap.data().likesCount) || 0;
        await updateDoc(productRef, {
          likesCount: Math.max(0, currentLikes - 1),
          updatedAt: new Date()
        });
        console.log('Product likes count updated to:', Math.max(0, currentLikes - 1));
      }
      
      return true;
    } catch (error) {
      console.error('Error unliking product:', error);
      console.error('Error details:', error.message);
      throw error;
    }
  }

  // Obtener likes de un producto
  async getProductLikes(productId) {
    try {
      // Consulta la colección 'likes' para contar los documentos que coinciden con el productId.
      // Esto es más preciso que depender del campo 'likesCount' en el producto.
      const likesCollection = collection(this.db, 'likes');
      const q = query(likesCollection, where('productId', '==', productId));
      const querySnapshot = await getDocs(q);
      // El tamaño del snapshot nos da el número exacto de likes.
      return querySnapshot.size;
    } catch (error) {
      console.error('Error getting product likes:', error);
      return 0;
    }
  }

  // Verificar si usuario dio like
  async hasUserLiked(productId, userId) {
    try {
      const likeRef = doc(this.db, 'likes', `${productId}_${userId}`);
      const likeSnap = await getDoc(likeRef);
      return likeSnap.exists();
    } catch (error) {
      console.error('Error checking user like:', error);
      return false;
    }
  }
}

// Initialize when Firebase app is available
if (typeof window !== 'undefined') {
  // Wait for Firebase app to be initialized
  const initFirestore = () => {
    if (window.firebaseApp) {
      window.firestoreManager = new FirestoreManager(window.firebaseApp);
      console.log('Firestore manager initialized');
    } else {
      setTimeout(initFirestore, 100);
    }
  };
  initFirestore();
}