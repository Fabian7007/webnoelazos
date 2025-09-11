// Import Firebase modules
import { initializeApp, getApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, EmailAuthProvider, linkWithCredential, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
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
  updateDoc,
  increment
} from 'https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyByyPexbuvEn2rVdBR_cTfT7aprPIMGYgo",
  authDomain: "web-noe-lazos.firebaseapp.com",
  databaseURL: "https://web-noe-lazos-default-rtdb.firebaseio.com/",
  projectId: "web-noe-lazos",
  storageBucket: "web-noe-lazos.firebasestorage.app",
  messagingSenderId: "540301382773",
  appId: "1:540301382773:web:0688914d14648fbf06143c",
  measurementId: "G-M1DT1LVBRX"
};

// Check if Firebase app already exists
let app;
try {
  app = initializeApp(firebaseConfig);
} catch (error) {
  if (error.code === 'app/duplicate-app') {
    app = getApp();
  } else {
    throw error;
  }
}

const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Auth functions
window.authFunctions = {
  signInWithEmail: (email, password) => signInWithEmailAndPassword(auth, email, password),
  signUpWithEmail: (email, password) => createUserWithEmailAndPassword(auth, email, password),
  signInWithGoogle: () => signInWithPopup(auth, googleProvider),
  signInWithGoogleEmail: (email) => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      login_hint: email,
      prompt: 'select_account'
    });
    return signInWithPopup(auth, provider);
  },
  signOut: () => signOut(auth),
  onAuthStateChanged: (callback) => onAuthStateChanged(auth, callback),
  linkEmailPassword: async (email, password) => {
    const user = auth.currentUser;
    if (user) {
      const credential = EmailAuthProvider.credential(email, password);
      return await linkWithCredential(user, credential);
    }
    throw new Error('No user is currently signed in');
  },
  sendPasswordResetEmail: (email, actionCodeSettings) => sendPasswordResetEmail(auth, email, actionCodeSettings),
  getCurrentUser: () => auth.currentUser,
  getCurrentUserData: () => {
    const user = auth.currentUser;
    if (!user) return null;
    const storedData = localStorage.getItem(`user_${user.uid}`);
    return storedData ? JSON.parse(storedData) : null;
  }
};

window.firebaseApp = app;
// Firestore Manager Class
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

  // Get document helper
  async getDocument(collection, docId) {
    try {
      const docRef = doc(this.db, collection, docId);
      const docSnap = await getDoc(docRef);
      return docSnap;
    } catch (error) {
      console.error('Error getting document:', error);
      throw error;
    }
  }

  // Set document helper
  async setDocument(collectionName, docId, data, options = { merge: true }) {
    try {
      const docRef = doc(this.db, collectionName, docId);
      await setDoc(docRef, data, options);
      return true;
    } catch (error) {
      console.error('Error setting document:', error);
      throw error;
    }
  }

  // Actualizar usuario
  async updateUser(uid, userData) {
    try {
      const userRef = doc(this.db, 'users', uid);
      const updateData = {
        username: userData.username,
        updatedAt: new Date(),
        lastProfileEdit: new Date()
      };
      
      if (userData.profileImage) {
        updateData.profileImage = userData.profileImage;
      }
      
      if (userData.description !== undefined) {
        updateData.description = userData.description;
      }
      
      await setDoc(userRef, updateData, { merge: true });
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
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return productRef.id;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  // Obtener todos los productos - MEJORADO
  async getProducts() {
    try {
      console.log('📦 Obteniendo productos de Firestore...');
      console.log('Database instance:', this.db);
      
      const productsRef = collection(this.db, 'products');
      console.log('Products collection reference:', productsRef);
      
      const snapshot = await getDocs(productsRef);
      console.log('Snapshot obtenido, documentos:', snapshot.size);
      
      if (snapshot.empty) {
        console.log('⚠️ No hay documentos en la colección products');
        return [];
      }
      
      const products = [];
      snapshot.docs.forEach((doc, index) => {
        const data = doc.data();
        console.log(`Documento ${index + 1}:`, doc.id, data);
        
        const product = { 
          id: doc.id, 
          ...data,
          // Asegurar que los campos requeridos existan
          nombre: data.nombre || 'Producto sin nombre',
          precio: Number(data.precio) || 0,
          imagen: data.imagen || '/img-galery/logo.svg',
          categoria: data.categoria || 'lazos',
          descripcion: data.descripcion || '',
          color: data.color || '',
          tela: data.tela || '',
          status: data.status || data.estado || 'none'
        };
        
        products.push(product);
      });
      
      // Ordenar por fecha de creación (más recientes primero)
      products.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt.seconds * 1000) : new Date(0);
        const dateB = b.createdAt ? new Date(b.createdAt.seconds * 1000) : new Date(0);
        return dateB - dateA;
      });
      
      console.log('✅ Productos procesados:', products.length);
      products.forEach((p, i) => {
        console.log(`${i + 1}. ID: "${p.id}" - ${p.nombre}`);
      });
      
      return products;
    } catch (error) {
      console.error('❌ Error getting products:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
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

  // Note: Likes functionality moved to Realtime Database
  // See likes-realtime.js for the new implementation

  // Agregar comentario a producto
  async addProductComment(productId, commentData) {
    try {
      const commentRef = doc(collection(this.db, 'comments'));
      await setDoc(commentRef, {
        ...commentData,
        id: commentRef.id,
        productId: productId,
        createdAt: new Date()
      });
      return commentRef.id;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }

  // Crear notificación global para nuevo producto
  async createProductNotification(productData) {
    try {
      console.log('🔔 Creando notificaciones para producto:', productData.nombre);
      
      // Obtener todos los usuarios registrados
      const usersRef = collection(this.db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      
      if (usersSnapshot.empty) {
        console.log('⚠️ No hay usuarios registrados para notificar');
        return [];
      }
      
      const notifications = [];
      
      for (const userDoc of usersSnapshot.docs) {
        try {
          const userData = userDoc.data();
          const userId = userDoc.id;
          
          console.log('📧 Procesando usuario:', userId);
          
          // Verificar configuraciones de notificaciones del usuario
          const userSettings = await this.getUserSettings(userId);
          console.log(`🔍 Configuraciones de usuario ${userId}:`, userSettings);
          
          // Si no tiene configuraciones o las tiene deshabilitadas, skip
          if (userSettings?.promotionNotifications === false) {
            console.log(`⏭️ Usuario ${userId} tiene notificaciones deshabilitadas`);
            continue;
          }
          
          console.log(`✅ Usuario ${userId} tiene notificaciones habilitadas`);
          
          const notificationRef = doc(collection(this.db, 'notifications'));
          const notification = {
            id: notificationRef.id,
            userId: userId,
            type: 'new_product',
            title: '🎉 ¡Nuevo producto disponible!',
            message: `${productData.nombre} - $${productData.precio.toLocaleString('es-AR')}`,
            productId: productData.id,
            productName: productData.nombre,
            productPrice: productData.precio,
            productImage: productData.imagen || '',
            read: false,
            createdAt: new Date()
          };
          
          await setDoc(notificationRef, notification);
          notifications.push(notification);
          console.log(`✅ Notificación creada para usuario: ${userId}`);
          
        } catch (userError) {
          console.error(`Error procesando usuario ${userDoc.id}:`, userError);
          continue; // Continue with next user
        }
      }
      
      console.log(`🎯 Total notificaciones creadas: ${notifications.length}`);
      return notifications;
    } catch (error) {
      console.error('❌ Error creating product notifications:', error);
      throw error;
    }
  }

  // Obtener configuraciones del usuario
  async getUserSettings(userId) {
    try {
      const settingsRef = doc(this.db, 'userSettings', userId);
      const settingsSnap = await getDoc(settingsRef);
      
      if (settingsSnap.exists()) {
        return settingsSnap.data();
      } else {
        // Interpretar ausencia de documento como configuraciones privadas por defecto
        console.log('⚠️ No hay configuraciones guardadas para usuario:', userId, '- usando valores seguros por defecto');
        return {
          profilePublic: false,
          activityVisible: false
        };
      }
    } catch (error) {
      console.error('Error getting user settings:', error);
      // En caso de error, usar configuraciones privadas por defecto
      return {
        profilePublic: false,
        activityVisible: false
      };
    }
  }

  // Obtener notificaciones del usuario
  async getUserNotifications(userId) {
    try {
      const notificationsRef = collection(this.db, 'notifications');
      const q = query(notificationsRef, where('userId', '==', userId));
      const snapshot = await getDocs(q);
      
      const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return notifications.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt.seconds * 1000) : new Date(0);
        const dateB = b.createdAt ? new Date(b.createdAt.seconds * 1000) : new Date(0);
        return dateB - dateA;
      });
    } catch (error) {
      console.error('Error getting user notifications:', error);
      return [];
    }
  }

  // Marcar notificación como leída
  async markNotificationAsRead(notificationId) {
    try {
      const notificationRef = doc(this.db, 'notifications', notificationId);
      await updateDoc(notificationRef, { 
        read: true,
        readAt: new Date()
      });
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  // Obtener comentarios de un producto
  async getProductComments(productId) {
    try {
      const commentsRef = collection(this.db, 'comments');
      const q = query(commentsRef, where('productId', '==', productId));
      const snapshot = await getDocs(q);
      const comments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Ordenar por fecha descendente (más recientes primero)
      return comments.sort((a, b) => new Date(b.date) - new Date(a.date));
    } catch (error) {
      console.error('Error getting comments:', error);
      return [];
    }
  }

  // Limpiar todas las notificaciones del usuario
  async clearUserNotifications(userId) {
    try {
      const notificationsRef = collection(this.db, 'notifications');
      const q = query(notificationsRef, where('userId', '==', userId));
      const snapshot = await getDocs(q);
      
      const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      
      return true;
    } catch (error) {
      console.error('Error clearing notifications:', error);
      return false;
    }
  }

  // Guardar configuraciones del usuario
  async saveUserSettings(userId, settings) {
    try {
      console.log(`💾 Guardando configuraciones para usuario ${userId}:`, settings);
      const settingsRef = doc(this.db, 'userSettings', userId);
      await setDoc(settingsRef, {
        ...settings,
        updatedAt: new Date()
      }, { merge: true });
      console.log('✅ Configuraciones guardadas exitosamente');
      return true;
    } catch (error) {
      console.error('❌ Error saving user settings:', error);
      return false;
    }
  }

  // Marcar todas las notificaciones como leídas
  async markAllNotificationsAsRead(userId) {
    try {
      console.log(`📖 Marcando todas las notificaciones como leídas para usuario: ${userId}`);
      
      const readNotificationRef = doc(this.db, 'readNotifications', userId);
      await setDoc(readNotificationRef, {
        userId: userId,
        markedAsReadAt: new Date(),
        updatedAt: new Date()
      }, { merge: true });
      
      console.log('✅ Todas las notificaciones marcadas como leídas');
      return true;
    } catch (error) {
      console.error('❌ Error marking all notifications as read:', error);
      return false;
    }
  }

  // Verificar si el usuario ha marcado todas las notificaciones como leídas
  async hasUserMarkedAllAsRead(userId) {
    try {
      const readNotificationRef = doc(this.db, 'readNotifications', userId);
      const readNotificationSnap = await getDoc(readNotificationRef);
      
      if (!readNotificationSnap.exists()) {
        return false;
      }
      
      const readData = readNotificationSnap.data();
      const markedAsReadAt = readData.markedAsReadAt;
      
      if (!markedAsReadAt) {
        return false;
      }
      
      // Obtener la notificación más reciente del usuario
      const notificationsRef = collection(this.db, 'notifications');
      const q = query(notificationsRef, where('userId', '==', userId));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        return true; // No hay notificaciones, se considera como leído
      }
      
      // Verificar si hay notificaciones más recientes que la marca de leído
      const markedAsReadTime = markedAsReadAt.seconds ? new Date(markedAsReadAt.seconds * 1000) : new Date(markedAsReadAt);
      
      for (const doc of snapshot.docs) {
        const notificationData = doc.data();
        const notificationTime = notificationData.createdAt.seconds ? 
          new Date(notificationData.createdAt.seconds * 1000) : 
          new Date(notificationData.createdAt);
        
        if (notificationTime > markedAsReadTime) {
          return false; // Hay notificaciones más recientes
        }
      }
      
      return true; // Todas las notificaciones son anteriores a la marca de leído
    } catch (error) {
      console.error('Error checking if user marked all as read:', error);
      return false;
    }
  }

  // Obtener notificaciones no leídas del usuario
  async getUnreadNotificationsCount(userId) {
    try {
      const hasMarkedAllAsRead = await this.hasUserMarkedAllAsRead(userId);
      
      if (hasMarkedAllAsRead) {
        return 0;
      }
      
      const notificationsRef = collection(this.db, 'notifications');
      const q = query(notificationsRef, where('userId', '==', userId));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        return 0;
      }
      
      // Si no ha marcado como leído, contar todas las notificaciones
      const readNotificationRef = doc(this.db, 'readNotifications', userId);
      const readNotificationSnap = await getDoc(readNotificationRef);
      
      if (!readNotificationSnap.exists()) {
        return snapshot.size; // Todas las notificaciones son no leídas
      }
      
      const readData = readNotificationSnap.data();
      const markedAsReadAt = readData.markedAsReadAt;
      
      if (!markedAsReadAt) {
        return snapshot.size;
      }
      
      // Contar notificaciones posteriores a la marca de leído
      const markedAsReadTime = markedAsReadAt.seconds ? new Date(markedAsReadAt.seconds * 1000) : new Date(markedAsReadAt);
      let unreadCount = 0;
      
      snapshot.docs.forEach(doc => {
        const notificationData = doc.data();
        const notificationTime = notificationData.createdAt.seconds ? 
          new Date(notificationData.createdAt.seconds * 1000) : 
          new Date(notificationData.createdAt);
        
        if (notificationTime > markedAsReadTime) {
          unreadCount++;
        }
      });
      
      return unreadCount;
    } catch (error) {
      console.error('Error getting unread notifications count:', error);
      return 0;
    }
  }

  // Obtener estadísticas del usuario
  async getUserStats(userId) {
    try {
      // Obtener datos del usuario para calcular días registrado
      const user = await this.getUser(userId);
      const accountAge = user ? this.calculateAccountAge(user.createdAt) : 0;
      
      // Obtener likes reales desde el sistema de likes en tiempo real
      let totalLikes = 0;
      if (window.realtimeLikesSystem) {
        try {
          const likedProducts = await window.realtimeLikesSystem.getUserLikedProducts(userId);
          totalLikes = likedProducts ? likedProducts.length : 0;
        } catch (error) {
          console.error('Error getting real-time likes:', error);
        }
      }
      
      const statsRef = doc(this.db, 'userStats', userId);
      const statsSnap = await getDoc(statsRef);
      
      if (statsSnap.exists()) {
        const data = statsSnap.data();
        return {
          totalLikes: totalLikes, // Usar likes reales del sistema en tiempo real
          totalViews: data.totalViews || 0,
          totalComments: data.totalComments || 0,
          accountAge: accountAge
        };
      } else {
        // Crear stats iniciales
        const initialStats = {
          userId: userId,
          totalLikes: totalLikes,
          totalViews: 0,
          totalComments: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        await setDoc(statsRef, initialStats);
        return {
          totalLikes: totalLikes,
          totalViews: 0,
          totalComments: 0,
          accountAge: accountAge
        };
      }
    } catch (error) {
      console.error('Error getting user stats:', error);
      return {
        totalLikes: 0,
        totalViews: 0,
        totalComments: 0,
        accountAge: 0
      };
    }
  }

  // Actualizar estadísticas del usuario
  async updateUserStats(userId, statType, incrementValue = 1) {
    try {
      const statsRef = doc(this.db, 'userStats', userId);
      const updateData = {
        [statType]: increment(incrementValue),
        updatedAt: new Date()
      };
      
      await updateDoc(statsRef, updateData);
      console.log(`✅ Stats updated for user ${userId}: ${statType} +${incrementValue}`);
      return true;
    } catch (error) {
      // Si el documento no existe, crearlo
      if (error.code === 'not-found') {
        const statsRef = doc(this.db, 'userStats', userId);
        const initialStats = {
          userId: userId,
          totalLikes: statType === 'totalLikes' ? incrementValue : 0,
          totalViews: statType === 'totalViews' ? incrementValue : 0,
          totalComments: statType === 'totalComments' ? incrementValue : 0,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        await setDoc(statsRef, initialStats);
        console.log(`✅ Stats created for user ${userId}`);
        return true;
      }
      
      console.error('Error updating user stats:', error);
      return false;
    }
  }

  // Calcular edad de la cuenta en días
  calculateAccountAge(createdAt) {
    if (!createdAt) return 0;
    
    const createdDate = createdAt.seconds ? new Date(createdAt.seconds * 1000) : new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now - createdDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  // Verificar si un username ya existe
  async checkUsernameExists(username, excludeUserId = null) {
    try {
      const usersRef = collection(this.db, 'users');
      const q = query(usersRef, where('username', '==', username));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        return false;
      }
      
      // Si hay un usuario a excluir (para edición de perfil)
      if (excludeUserId) {
        const existingUsers = snapshot.docs.filter(doc => doc.id !== excludeUserId);
        return existingUsers.length > 0;
      }
      
      return true;
    } catch (error) {
      console.error('Error checking username:', error);
      return false;
    }
  }

  // Eliminar todos los datos del usuario
  async deleteUserData(userId) {
    try {
      console.log('🗑️ Eliminando datos del usuario:', userId);
      
      // Eliminar documento del usuario
      await deleteDoc(doc(this.db, 'users', userId));
      
      // Eliminar configuraciones del usuario
      try {
        await deleteDoc(doc(this.db, 'userSettings', userId));
      } catch (error) {
        console.log('No user settings to delete');
      }
      
      // Eliminar estadísticas del usuario
      try {
        await deleteDoc(doc(this.db, 'userStats', userId));
      } catch (error) {
        console.log('No user stats to delete');
      }
      
      // Eliminar notificaciones del usuario
      const notificationsRef = collection(this.db, 'notifications');
      const notificationsQuery = query(notificationsRef, where('userId', '==', userId));
      const notificationsSnapshot = await getDocs(notificationsQuery);
      
      const deleteNotificationsPromises = notificationsSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deleteNotificationsPromises);
      
      // Eliminar likes del usuario
      const likesRef = collection(this.db, 'likes');
      const likesQuery = query(likesRef, where('userId', '==', userId));
      const likesSnapshot = await getDocs(likesQuery);
      
      const deleteLikesPromises = likesSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deleteLikesPromises);
      
      // Eliminar comentarios del usuario
      const commentsRef = collection(this.db, 'comments');
      const commentsQuery = query(commentsRef, where('userId', '==', userId));
      const commentsSnapshot = await getDocs(commentsQuery);
      
      const deleteCommentsPromises = commentsSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deleteCommentsPromises);
      
      // Eliminar marcas de notificaciones leídas
      try {
        await deleteDoc(doc(this.db, 'readNotifications', userId));
      } catch (error) {
        console.log('No read notifications to delete');
      }
      
      console.log('✅ Datos del usuario eliminados exitosamente');
      return true;
    } catch (error) {
      console.error('❌ Error eliminando datos del usuario:', error);
      throw error;
    }
  }
}

// Initialize Firestore Manager
window.firestoreManager = new FirestoreManager(app);

// Function to load products from Firebase
window.loadProductsFromFirebase = async function() {
  try {
    console.log('📦 Cargando productos desde Firebase...');
    
    // Show loading indicator
    if (window.showProductsLoading) {
      window.showProductsLoading();
    }
    
    const products = await window.firestoreManager.getProducts();
    
    // Ensure products have proper structure
    const processedProducts = products.map(product => ({
      ...product,
      id: String(product.id), // Ensure ID is string
      precio: Number(product.precio) || 0,
      nombre: product.nombre || 'Producto sin nombre',
      imagen: product.imagen || '/img-galery/logo.svg',
      categoria: product.categoria || 'lazos',
      descripcion: product.descripcion || '',
      color: product.color || '',
      tela: product.tela || '',
      status: product.status || product.estado || 'none'
    }));
    
    // Assign to both window.productos and global productos
    window.productos = processedProducts;
    if (typeof productos !== 'undefined') {
      productos.length = 0;
      productos.push(...processedProducts);
    }
    
    console.log('✅ Productos procesados y cargados:', processedProducts.length);
    console.log('window.productos length:', window.productos.length);
    
    // Hide loading indicator
    if (window.hideProductsLoading) {
      window.hideProductsLoading();
    }
    
    // Notify that products are loaded
    window.dispatchEvent(new CustomEvent('productsLoaded', { detail: processedProducts }));
    return processedProducts;
  } catch (error) {
    console.error('❌ Error cargando productos:', error);
    
    // Hide loading indicator on error
    if (window.hideProductsLoading) {
      window.hideProductsLoading();
    }
    
    window.productos = [];
    if (typeof productos !== 'undefined') {
      productos.length = 0;
    }
    return [];
  }
};

// Initialize immediately
if (typeof window !== 'undefined') {
  console.log('✅ Firebase y Firestore inicializados');
  
  // Load products immediately
  setTimeout(async () => {
    const loadedProducts = await window.loadProductsFromFirebase();
    console.log('📦 Productos cargados inmediatamente:', loadedProducts.length);
  }, 100);
}

// Global stats tracking functions
window.trackUserAction = async function(action, data = {}) {
  const user = window.authFunctions?.getCurrentUser();
  if (!user) return;
  
  const userId = user.uid;
  
  switch (action) {
    case 'view_product':
      await window.firestoreManager.updateUserStats(userId, 'totalViews', 1);
      break;
    case 'like_product':
      await window.firestoreManager.updateUserStats(userId, 'totalLikes', 1);
      break;
    case 'unlike_product':
      await window.firestoreManager.updateUserStats(userId, 'totalLikes', -1);
      break;
    case 'add_comment':
      await window.firestoreManager.updateUserStats(userId, 'totalComments', 1);
      break;
  }
};