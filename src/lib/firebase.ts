import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth, signInAnonymously } from 'firebase/auth';
import firebaseConfigData from '../../firebase-applet-config.json';

// Initialize Firebase SDK
const app = !getApps().length ? initializeApp(firebaseConfigData) : getApp();

// Initialize Firestore with specific database ID if provided in config
export const db: Firestore = firebaseConfigData.firestoreDatabaseId && firebaseConfigData.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfigData.firestoreDatabaseId)
  : getFirestore(app);

export const auth: Auth = getAuth(app);

// Sign in anonymously by default for immediate sync
signInAnonymously(auth).catch((err) => {
  console.warn('Firebase Auth anonymous login note:', err.message);
});

export default app;
