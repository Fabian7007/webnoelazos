// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, EmailAuthProvider, linkWithCredential, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyByyPexbuvEn2rVdBR_cTfT7aprPIMGYgo",
  authDomain: "web-noe-lazos.firebaseapp.com",
  projectId: "web-noe-lazos",
  storageBucket: "web-noe-lazos.firebasestorage.app",
  messagingSenderId: "540301382773",
  appId: "1:540301382773:web:0688914d14648fbf06143c",
  measurementId: "G-M1DT1LVBRX"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
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
  sendPasswordResetEmail: (email) => sendPasswordResetEmail(auth, email)
};