import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager,
  Firestore
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const dbId = (firebaseConfig as any).firestoreDatabaseId;

// Initialize Firestore with Multi-Tab Offline Cache
let db: Firestore;
try {
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    })
  }, dbId);
  console.log('[Firestore Cache] Successfully initialized multi-tab persistent local cache.');
} catch (e) {
  db = getFirestore(app, dbId);
}

export const auth = getAuth(app);
export { db };
export default app;
