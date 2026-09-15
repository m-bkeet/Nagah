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
    
    // If under 950KB, save directly in a single document to minimize write operations
    if (serialized.length < 950 * 1024) {
      await setDoc(docRef, {
        payload: serialized,
        itemCount: Array.isArray(items) ? items.length : 1,
        updatedAt: now
      }, { merge: true });
    } else {
      // Chunk into 2 parts if larger than 950KB
      const part1 = serialized.slice(0, Math.ceil(serialized.length / 2));
      const part2 = serialized.slice(Math.ceil(serialized.length / 2));
      const docPart1 = doc(db, 'nagah_store', `${collectionName}_p1`);
      const docPart2 = doc(db, 'nagah_store', `${collectionName}_p2`);
      await setDoc(docPart1, { payload: part1, part: 1, totalParts: 2, updatedAt: now }, { merge: true });
      await setDoc(docPart2, { payload: part2, part: 2, totalParts: 2, updatedAt: now }, { merge: true });
      await setDoc(docRef, { isSplit: true, totalParts: 2, updatedAt: now }, { merge: true });
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
      const p1Snap = await getDoc(doc(db, 'nagah_store', `${collectionName}_p1`));
      const p2Snap = await getDoc(doc(db, 'nagah_store', `${collectionName}_p2`));
      const fullStr = (p1Snap.data()?.payload || '') + (p2Snap.data()?.payload || '');
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

export async function saveFullDbToFirestore(dbData: any): Promise<void> {
  if (!dbData) return;
  pendingDbData = dbData;

  // Debounce syncing to cloud by 8 seconds to bundle rapid state changes into a single write batch
  if (debouncedSyncTimer) {
    clearTimeout(debouncedSyncTimer);
  }

  debouncedSyncTimer = setTimeout(async () => {
    debouncedSyncTimer = null;
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

    for (const k of collections) {
      if (current[k] !== undefined) {
        await saveCollectionToFirestore(k, current[k]);
      }
    }
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

  for (const col of collections) {
    try {
      const data = await loadCollectionFromFirestore(col);
      if (data !== null) {
        result[col] = data;
        collectionHashes.set(col, hashPayload(data));
        loadedCount++;
      }
    } catch (e) {
      // Continue loading other collections
    }
  }

  return loadedCount > 0 ? result : null;
}

