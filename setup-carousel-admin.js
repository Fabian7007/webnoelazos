// Script para configurar administrador del carrusel
async function setupCarouselAdmin() {
  try {
    // Verificar si el usuario está autenticado
    const currentUser = window.authFunctions?.getCurrentUser();
    if (!currentUser) {
      window.showError('Debes iniciar sesión primero');
      return;
    }

    console.log('Usuario actual:', currentUser.uid);

    // Verificar si ya es admin
    if (window.firestoreManager) {
      try {
        const adminDoc = await window.firestoreManager.getDocument('admin', currentUser.uid);
        if (adminDoc.exists()) {
          console.log('Usuario ya es administrador');
          window.showInfo('Ya eres administrador. Recarga la página para ver los controles del carrusel.');
          return;
        }
      } catch (error) {
        console.log('Verificando estado de admin...');
      }

      // Crear documento de admin (esto requiere que las reglas permitan la creación inicial)
      try {
        const adminData = {
          userId: currentUser.uid,
          email: currentUser.email,
          role: 'administrador',
          createdAt: new Date().toISOString(),
          permissions: ['manage_products', 'manage_carousel', 'manage_users']
        };

        await window.firestoreManager.setDocument('admin', currentUser.uid, adminData);
        
        // También actualizar en users collection
        const userData = {
          role: 'administrador',
          isAdmin: true,
          updatedAt: new Date().toISOString()
        };
        
        await window.firestoreManager.updateDocument('users', currentUser.uid, userData);
        
        console.log('Administrador configurado exitosamente');
        window.showSuccess('¡Configurado como administrador! Recarga la página para ver los controles del carrusel.');
        
      } catch (error) {
        console.error('Error configurando admin:', error);
        window.showError('Error configurando administrador. Verifica tu conexión.');
      }
    }
  } catch (error) {
    console.error('Error en setupCarouselAdmin:', error);
    window.showError('Error: ' + error.message);
  }
}

// Función para verificar permisos del carrusel
async function checkCarouselPermissions() {
  try {
    const currentUser = window.authFunctions?.getCurrentUser();
    if (!currentUser) {
      console.log('No hay usuario autenticado');
      return false;
    }

    if (window.firestoreManager) {
      const adminDoc = await window.firestoreManager.getDocument('admin', currentUser.uid);
      const hasAdminDoc = adminDoc.exists();
      
      const userDoc = await window.firestoreManager.getDocument('users', currentUser.uid);
      const userData = userDoc.exists() ? userDoc.data() : {};
      const hasAdminRole = userData.role === 'administrador';
      
      console.log('Verificación de permisos:');
      console.log('- Documento admin existe:', hasAdminDoc);
      console.log('- Rol de administrador:', hasAdminRole);
      console.log('- Datos del usuario:', userData);
      
      return hasAdminDoc && hasAdminRole;
    }
    
    return false;
  } catch (error) {
    console.error('Error verificando permisos:', error);
    return false;
  }
}

// Función para probar escritura en settings
async function testCarouselWrite() {
  try {
    const currentUser = window.authFunctions?.getCurrentUser();
    if (!currentUser) {
      window.showError('Debes iniciar sesión primero');
      return;
    }

    const testData = {
      products: [],
      selectionOrder: [],
      testWrite: true,
      updatedAt: new Date().toISOString(),
      updatedBy: currentUser.uid
    };

    await window.firestoreManager.setDocument('settings', 'carousel', testData);
    console.log('✅ Escritura en settings exitosa');
    window.showSuccess('✅ Permisos de escritura confirmados');
    
  } catch (error) {
    console.error('❌ Error en escritura de prueba:', error);
    window.showError('❌ Error de permisos: ' + error.message);
  }
}

// Exportar funciones
window.setupCarouselAdmin = setupCarouselAdmin;
window.checkCarouselPermissions = checkCarouselPermissions;
window.testCarouselWrite = testCarouselWrite;

console.log('🔧 Script de configuración de admin del carrusel cargado');
console.log('Funciones disponibles:');
console.log('- setupCarouselAdmin() - Configurar como administrador');
console.log('- checkCarouselPermissions() - Verificar permisos');
console.log('- testCarouselWrite() - Probar escritura en settings');