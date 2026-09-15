import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, Firestore } from 'firebase/firestore';

let firebaseConfig: any = null;
try {
  const cfgPath = path.join(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(cfgPath)) {
    firebaseConfig = JSON.parse(fs.readFileSync(cfgPath, 'utf-8'));
  }
} catch (e) {
  console.warn('[FirestoreStorage] Config load error:', e);
}

// Built-in fallback config for Vercel Serverless / external environments where local JSON is unbundled
if (!firebaseConfig) {
  firebaseConfig = {
    projectId: "booming-list-379600",
    appId: "1:303545128372:web:78e42daefeec4d43df0ee1",
    apiKey: "AIzaSyBHYfOMGYzfI0YVOgjWc9O-qdgxENy0oD4",
    authDomain: "booming-list-379600.firebaseapp.com",
    firestoreDatabaseId: "ai-studio-nagahms-44b6deb5-5b09-4e62-a58f-790b1ca94573",
    storageBucket: "booming-list-379600.firebasestorage.app",
    messagingSenderId: "303545128372"
  };
}

const dbId = firebaseConfig?.firestoreDatabaseId || 'ai-studio-nagahms-44b6deb5-5b09-4e62-a58f-790b1ca94573';

let firestoreInstance: Firestore | null = null;
function getDb(): Firestore | null {
  if (firestoreInstance) return firestoreInstance;
  if (!firebaseConfig) return null;
  try {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    firestoreInstance = getFirestore(app, dbId);
    return firestoreInstance;
  } catch (err) {
    console.warn('[FirestoreStorage] Failed to initialize Firestore client:', err);
    return null;
  }
}

const collectionHashes = new Map<string, string>();
let isQuotaExceeded = false;
let quotaExceededNoticeTime = 0;

function hashPayload(data: any): string {
  const str = typeof data === 'string' ? data : JSON.stringify(data);
  return crypto.createHash('md5').update(str).digest('hex');
}

const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.VERCEL_ENV);

export async function saveCollectionToFirestore(collectionName: string, items: any): Promise<boolean> {
  const db = getDb();
  if (!db) return false;

  // If quota was exceeded recently (within the last 30 minutes), skip writes to avoid repeated RPC failures
  const now = Date.now();
  if (isQuotaExceeded && (now - quotaExceededNoticeTime < 30 * 60 * 1000)) {
    return false;
  }

  const newHash = hashPayload(items);
  if (collectionHashes.get(collectionName) === newHash) {
    return true; // No changes, skip write!
  }

  try {
    const docRef = doc(db, 'nagah_store', collectionName);
    const serialized = JSON.stringify(items ?? []);
    const CHUNK_SIZE = 700 * 1024; // 700KB safe chunk size well below Firestore's 1MB limit
    
    if (serialized.length < CHUNK_SIZE) {
      await setDoc(docRef, {
        payload: serialized,
        itemCount: Array.isArray(items) ? items.length : 1,
        isSplit: false,
        totalParts: 1,
        updatedAt: now
      }, { merge: true });
    } else {
      const totalParts = Math.ceil(serialized.length / CHUNK_SIZE);
      const partPromises: Promise<any>[] = [];
      for (let i = 0; i < totalParts; i++) {
        const chunk = serialized.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
        const partRef = doc(db, 'nagah_store', `${collectionName}_p${i + 1}`);
        partPromises.push(setDoc(partRef, { payload: chunk, part: i + 1, totalParts, updatedAt: now }, { merge: true }));
      }
      await Promise.all(partPromises);
      await setDoc(docRef, { isSplit: true, totalParts, updatedAt: now }, { merge: true });
    }

    collectionHashes.set(collectionName, newHash);
    isQuotaExceeded = false;
    return true;
  } catch (err: any) {
    const errMsg = err?.message || String(err);
    if (errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('Quota limit exceeded')) {
      isQuotaExceeded = true;
      quotaExceededNoticeTime = now;
      console.warn(`[FirestoreStorage] Cloud Firestore Quota exceeded for today (Free daily write units). Local disk persistence remains active until reset.`);
    } else {
      console.warn(`[FirestoreStorage] Error saving ${collectionName}:`, errMsg);
    }
    return false;
  }
}

export async function loadCollectionFromFirestore(collectionName: string): Promise<any> {
  const db = getDb();
  if (!db) return null;
  try {
    const docRef = doc(db, 'nagah_store', collectionName);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;

    const data = snap.data();
    if (data?.isSplit) {
      const totalParts = data.totalParts || 2;
      const partSnaps = await Promise.all(
        Array.from({ length: totalParts }, (_, i) => getDoc(doc(db, 'nagah_store', `${collectionName}_p${i + 1}`)))
      );
      const fullStr = partSnaps.map(s => s.data()?.payload || '').join('');
      return fullStr ? JSON.parse(fullStr) : null;
    }

    if (data?.payload) {
      return JSON.parse(data.payload);
    }
    return null;
  } catch (err: any) {
    console.warn(`[FirestoreStorage] Error loading ${collectionName}:`, err?.message || err);
    return null;
  }
}

let debouncedSyncTimer: NodeJS.Timeout | null = null;
let pendingDbData: any = null;

export async function saveFullDbToFirestore(dbData: any, immediate = false): Promise<void> {
  if (!dbData) return;
  pendingDbData = dbData;

  const executeSync = async () => {
    const current = pendingDbData;
    if (!current) return;

    const collections = [
      'users', 'branches', 'trainees', 'trainers', 'courses', 'programs', 'groups',
      'attendance', 'payments', 'expenses', 'trainerSettlements', 'pointRules',
      'pointTransactions', 'exams', 'questions', 'examResults', 'interactiveSessions',
      'certificates', 'certificateTemplates',
      'trainerAttestations', 'auditLogs', 'settings', 'notifications',
      'assignments'
    ];

    const tasks = collections
      .filter(k => current[k] !== undefined)
      .map(k => saveCollectionToFirestore(k, current[k]));

    await Promise.all(tasks);
  };

  // On serverless environments (Vercel/Lambda), ALWAYS execute immediately and await to avoid process freeze drops
  if (immediate || isServerless) {
    if (debouncedSyncTimer) {
      clearTimeout(debouncedSyncTimer);
      debouncedSyncTimer = null;
    }
    await executeSync();
    return;
  }

  // Debounce syncing to cloud by 8 seconds in long-running standalone Node server mode
  if (debouncedSyncTimer) {
    clearTimeout(debouncedSyncTimer);
  }

  debouncedSyncTimer = setTimeout(async () => {
    debouncedSyncTimer = null;
    await executeSync();
  }, 8000);
}

export async function loadFullDbFromFirestore(): Promise<any> {
  const collections = [
    'users', 'branches', 'trainees', 'trainers', 'courses', 'programs', 'groups',
    'attendance', 'payments', 'expenses', 'trainerSettlements', 'pointRules',
    'pointTransactions', 'exams', 'questions', 'examResults', 'interactiveSessions',
    'certificates', 'certificateTemplates',
    'trainerAttestations', 'auditLogs', 'settings', 'notifications',
    'assignments'
  ];

  const result: any = {};
  let loadedCount = 0;

  const loadTasks = await Promise.all(
    collections.map(async (col) => {
      try {
        const data = await loadCollectionFromFirestore(col);
        return { col, data };
      } catch (e) {
        return { col, data: null };
      }
    })
  );

  for (const { col, data } of loadTasks) {
    if (data !== null) {
      result[col] = data;
      collectionHashes.set(col, hashPayload(data));
      loadedCount++;
    }
  }

  return loadedCount > 0 ? result : null;
}

