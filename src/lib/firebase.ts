import { initializeApp, getApps, getApp, FirebaseOptions } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAu316JtAihX3umk7DUSX-RRI7vyJdggaw",
  authDomain: "ghss-grant-manager.firebaseapp.com",
  projectId: "ghss-grant-manager",
  storageBucket: "ghss-grant-manager.firebasestorage.app",
  messagingSenderId: "906747744514",
  appId: "1:906747744514:web:12740717331467d322f21b",
  measurementId: "G-1JV282WWV2"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
