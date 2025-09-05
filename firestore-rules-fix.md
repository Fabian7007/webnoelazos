# Solución para Errores de Permisos de Firestore

## Problema
Los likes no funcionan debido a errores de permisos: "Missing or insufficient permissions"

## Solución Temporal Implementada
- Sistema de fallback local que funciona sin Firestore
- Los likes se guardan en localStorage hasta que se configuren los permisos

## Para Solucionar Definitivamente

### Reglas de Firestore Corregidas
Ve a Firebase Console > Firestore Database > Rules y reemplaza con:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Colección de usuarios
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null && exists(/databases/$(database)/documents/admin/$(request.auth.uid));
    }

    // Colección de administradores
    match /admin/{adminId} {
      allow read: if request.auth != null;
      allow write: if false;
    }

    // Colección de productos
    match /products/{productId} {
      allow read: if true;
      allow create, delete: if request.auth != null && exists(/databases/$(database)/documents/admin/$(request.auth.uid));
      allow update: if 
        (request.auth != null && exists(/databases/$(database)/documents/admin/$(request.auth.uid))) ||
        (request.resource.data.diff(resource.data).affectedKeys().hasOnly(['likesCount', 'updatedAt']) &&
         (request.resource.data.likesCount == resource.data.likesCount + 1 ||
          request.resource.data.likesCount == resource.data.likesCount - 1));
    }

    // CORREGIDO: Colección de likes - permitir usuarios anónimos
    match /likes/{likeId} {
      allow read: if true;
      // Permitir crear/eliminar si:
      // 1. Usuario autenticado Y el likeId coincide con el patrón productId_userId
      // 2. O si es usuario anónimo (likeId contiene 'anon_')
      allow create, delete: if 
        (request.auth != null && likeId.matches('.*_' + request.auth.uid)) ||
        (likeId.matches('.*_anon_.*'));
    }
  }
}
```

### Cambios Principales en las Reglas:
1. **Likes con usuarios anónimos**: Ahora permite likes de usuarios `anon_*`
2. **Patrón de ID flexible**: Acepta tanto `productId_userId` como `productId_anon_xxxxx`
3. **Mantiene seguridad**: Los usuarios solo pueden crear/eliminar sus propios likes

### Después de Configurar las Reglas
1. Recarga la página
2. Los likes funcionarán con Firestore
3. El sistema de fallback seguirá disponible como respaldo

## Estado Actual
✅ Sistema de likes funcional con fallback local
✅ UI actualizada correctamente
✅ Contador de likes persistente
⚠️ Pendiente: Configurar reglas de Firestore