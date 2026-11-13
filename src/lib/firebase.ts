import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager,
  setLogLevel,
  Firestore
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Silence verbose internal gRPC stream warning logs
try {
  setLogLevel('silent');
} catch {}

const rawConfig = (firebaseConfig as any) || {};

const DEFAULT_FIREBASE_CONFIG = {
  projectId: "booming-list-379600",
  appId: "1:303545128372:web:78e42daefeec4d43df0ee1",
  apiKey: "AIzaSyBHYfOMGYzfI0YVOgjWc9O-qdgxENy0oD4",
  authDomain: "booming-list-379600.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-nagahms-44b6deb5-5b09-4e62-a58f-790b1ca94573",
  storageBucket: "booming-list-379600.firebasestorage.app",
  messagingSenderId: "303545128372"
};

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || rawConfig.apiKey || DEFAULT_FIREBASE_CONFIG.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || rawConfig.authDomain || DEFAULT_FIREBASE_CONFIG.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || rawConfig.projectId || DEFAULT_FIREBASE_CONFIG.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || rawConfig.storageBucket || DEFAULT_FIREBASE_CONFIG.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || rawConfig.messagingSenderId || DEFAULT_FIREBASE_CONFIG.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || rawConfig.appId || DEFAULT_FIREBASE_CONFIG.appId,
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || rawConfig.firestoreDatabaseId || DEFAULT_FIREBASE_CONFIG.firestoreDatabaseId
};

const databaseId = config.firestoreDatabaseId || 'ai-studio-nagahms-44b6deb5-5b09-4e62-a58f-790b1ca94573';

// Initialize App with fallback
let app: any;
try {
  app = getApps().length === 0 ? initializeApp(config) : getApp();
} catch (e) {
  try {
    app = initializeApp(DEFAULT_FIREBASE_CONFIG);
  } catch (err2) {
    app = getApps()[0];
  }
}

// Initialize Firestore with Multi-Tab Offline Cache and exact database ID
let db: Firestore;
try {
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    })
  }, databaseId);
} catch (e) {
  try {
    db = getFirestore(app, databaseId);
  } catch (err2) {
    db = getFirestore(app);
  }
}

let authInstance: any = null;
try {
  authInstance = getAuth(app);
} catch (e) {
  console.warn('[Firebase Auth] Initialization warning:', e);
}

export const auth = authInstance;
export { db };
export default app;
