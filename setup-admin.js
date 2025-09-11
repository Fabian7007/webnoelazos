// Auto-sync script for verified admins from Firestore to Realtime Database
// Only syncs users who are already in the Firestore admin collection

console.log('🔧 Admin Auto-Sync Script loaded');

// Auto-sync current user if they are verified admin in Firestore
window.addEventListener('load', () => {
  setTimeout(async () => {
    if (window.adminSync) {
      await window.adminSync.checkAndSyncCurrentUser();
    }
  }, 3000);
});

console.log('✅ Admin sync will automatically check Firestore admin collection');