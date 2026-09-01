import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  getFirestore,
  Firestore,
} from 'firebase/firestore';
import { getAuth, Auth, signInAnonymously } from 'firebase/auth';
import firebaseConfigData from '../../firebase-applet-config.json';

// Initialize Firebase SDK
const app = !getApps().length ? initializeApp(firebaseConfigData) : getApp();

const databaseId =
  firebaseConfigData.firestoreDatabaseId && firebaseConfigData.firestoreDatabaseId !== '(default)'
    ? firebaseConfigData.firestoreDatabaseId
    : undefined;

// Initialize Firestore with robust multi-tab IndexedDB offline persistence
let firestoreDb: Firestore;
try {
  const cacheSettings = {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager(),
    }),
  };

  if (databaseId) {
    firestoreDb = initializeFirestore(app, cacheSettings, databaseId);
  } else {
    firestoreDb = initializeFirestore(app, cacheSettings);
  }
} catch {
  // Fallback if already initialized
  firestoreDb = databaseId ? getFirestore(app, databaseId) : getFirestore(app);
}

export const db: Firestore = firestoreDb;
export const auth: Auth = getAuth(app);

// Sign in anonymously for immediate authorized cloud access
signInAnonymously(auth).catch((err) => {
  console.warn('Firebase Auth anonymous note:', err.message);
});

export default app;
