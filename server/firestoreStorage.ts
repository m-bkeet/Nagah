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
const QUOTA_BACKOFF_MS = 30 * 1000; // Fast retry backoff (30s) if Google Cloud quota is hit

// High-frequency transient collections that should NEVER be pushed to remote Firestore
const TRANSIENT_COLLECTIONS = new Set([
  'devices',
  'deviceCommands',
  'auditLogs',
  'traineeScreenshots',
  'notifications',
  'deletedDeviceIds'
]);

function withTimeout<T>(promise: Promise<T>, ms: number = 12000): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('FIRESTORE_TIMEOUT')), ms);
    promise.then(
      res => { clearTimeout(timer); resolve(res); },
      err => { clearTimeout(timer); reject(err); }
    );
  });
}

function hashPayload(data: any): string {
  const str = typeof data === 'string' ? data : JSON.stringify(data);
  return crypto.createHash('md5').update(str).digest('hex');
}

const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.VERCEL_ENV);

function sanitizeForFirestore(collectionName: string, items: any): any {
  if (!Array.isArray(items)) return items;

  if (collectionName === 'trainees') {
    return items.map((t: any) => {
      const sanitized = { ...t };
      delete sanitized.photo; // Remove redundant duplicate field
      // If photoUrl is an embedded base64 string, keep it compact for Firestore
      if (sanitized.photoUrl && sanitized.photoUrl.startsWith('data:image') && sanitized.photoUrl.length > 5000) {
        delete sanitized.photoUrl;
      }
      return sanitized;
    });
  }

  if (collectionName === 'homeworkSubmissions') {
    return items.map((sub: any) => {
      const sanitized = { ...sub };
      // Purge heavy base64 file payloads from Firestore
      delete sanitized.imageBase64;
      delete sanitized.fileData;
      if (sanitized.attachmentUrl && sanitized.attachmentUrl.startsWith('data:image')) {
        delete sanitized.attachmentUrl;
      }
      return sanitized;
    });
  }

  return items;
}

export async function saveCollectionToFirestore(collectionName: string, rawItems: any): Promise<boolean> {
  // 1. Skip transient, high-frequency collections to preserve quota
  if (TRANSIENT_COLLECTIONS.has(collectionName)) {
    return true;
  }

  const db = getDb();
  if (!db) return false;

  // 2. Circuit Breaker: If genuine quota exceeded recently, skip remote network calls briefly
  const now = Date.now();
  if (isQuotaExceeded && (now - quotaExceededNoticeTime < QUOTA_BACKOFF_MS)) {
    return true; // Local storage is active and durable
  }

  const items = sanitizeForFirestore(collectionName, rawItems);
  const newHash = hashPayload(items);
  if (collectionHashes.get(collectionName) === newHash) {
    return true; // No changes, skip write!
  }

  try {
    const docRef = doc(db, 'nagah_store', collectionName);
    const serialized = JSON.stringify(items ?? []);
    const CHUNK_SIZE = 700 * 1024; // 700KB safe chunk size well below Firestore's 1MB limit
    
    if (serialized.length < CHUNK_SIZE) {
      await withTimeout(setDoc(docRef, {
        payload: serialized,
        itemCount: Array.isArray(items) ? items.length : 1,
        isSplit: false,
        totalParts: 1,
        updatedAt: now
      }, { merge: true }), 10000);
    } else {
      const totalParts = Math.ceil(serialized.length / CHUNK_SIZE);
      const partPromises: Promise<any>[] = [];
      for (let i = 0; i < totalParts; i++) {
        const chunk = serialized.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
        const partRef = doc(db, 'nagah_store', `${collectionName}_p${i + 1}`);
        partPromises.push(withTimeout(setDoc(partRef, { payload: chunk, part: i + 1, totalParts, updatedAt: now }, { merge: true }), 10000));
      }
      await Promise.all(partPromises);
      await withTimeout(setDoc(docRef, { isSplit: true, totalParts, updatedAt: now }, { merge: true }), 10000);
    }

    // Update global sync heartbeat in Firestore for real-time client notice
    try {
      const metaRef = doc(db, 'nagah_store', 'sync_meta');
      await setDoc(metaRef, { 
        lastUpdatedCollection: collectionName, 
        lastCollection: collectionName,
        updatedAt: now,
        version: now
      }, { merge: true });
    } catch (metaErr) {
      console.warn('[FirestoreStorage] sync_meta write notice:', metaErr);
    }

    collectionHashes.set(collectionName, newHash);
    isQuotaExceeded = false;
    return true;
  } catch (err: any) {
    const errMsg = err?.message || String(err);
    if (errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('Quota limit exceeded')) {
      isQuotaExceeded = true;
      quotaExceededNoticeTime = now;
      console.warn(`[FirestoreStorage] Cloud Firestore Quota reached. Backing off for 30s.`);
    } else {
      console.warn(`[FirestoreStorage] Note for ${collectionName}:`, errMsg);
    }
    return false;
  }
}

export async function loadCollectionFromFirestore(collectionName: string): Promise<any> {
  if (TRANSIENT_COLLECTIONS.has(collectionName)) {
    return null;
  }

  const db = getDb();
  if (!db) return null;

  // Fail fast if quota is currently exceeded
  const now = Date.now();
  if (isQuotaExceeded && (now - quotaExceededNoticeTime < QUOTA_BACKOFF_MS)) {
    return null;
  }

  try {
    const docRef = doc(db, 'nagah_store', collectionName);
    const snap = await withTimeout(getDoc(docRef), 10000);
    if (!snap.exists()) return null;

    const data = snap.data();
    if (data?.isSplit) {
      const totalParts = data.totalParts || 2;
      const partSnaps = await Promise.all(
        Array.from({ length: totalParts }, (_, i) => withTimeout(getDoc(doc(db, 'nagah_store', `${collectionName}_p${i + 1}`)), 10000))
      );
      const fullStr = partSnaps.map(s => s.data()?.payload || '').join('');
      return fullStr ? JSON.parse(fullStr) : null;
    }

    if (data?.payload) {
      return JSON.parse(data.payload);
    }
    return null;
  } catch (err: any) {
    const errMsg = err?.message || String(err);
    if (errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('Quota limit exceeded')) {
      isQuotaExceeded = true;
      quotaExceededNoticeTime = now;
    }
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

    // Only sync essential core business collections to Firestore
    const coreCollections = [
      'users', 'branches', 'trainees', 'trainers', 'courses', 'programs', 'groups',
      'attendance', 'payments', 'expenses', 'trainerSettlements', 'pointRules',
      'pointTransactions', 'exams', 'questions', 'examResults', 'interactiveSessions',
      'certificates', 'certificateTemplates',
      'trainerAttestations', 'settings',
      'assignments', 'homeworkSubmissions', 'badges', 'traineeBadges', 'portalMessages'
    ];

    const tasks = coreCollections
      .filter(k => current[k] !== undefined)
      .map(k => saveCollectionToFirestore(k, current[k]));

    await Promise.all(tasks);
  };

  // On serverless or immediate calls, execute right away
  if (immediate || isServerless) {
    if (debouncedSyncTimer) {
      clearTimeout(debouncedSyncTimer);
      debouncedSyncTimer = null;
    }
    try {
      await withTimeout(executeSync(), 12000);
    } catch (err) {
      // Handled gracefully
    }
    return;
  }

  // Very short 500ms debounce in long-running Node server mode to keep Vercel & AI Studio in near real-time sync
  if (debouncedSyncTimer) {
    clearTimeout(debouncedSyncTimer);
  }

  debouncedSyncTimer = setTimeout(async () => {
    debouncedSyncTimer = null;
    try {
      await executeSync();
    } catch (e) {
      // Handled silently
    }
  }, 500);
}

export async function allocateNextTraineeCode(
  prefix: string = 'A',
  localTrainees: any[] = []
): Promise<string> {
  const pfx = (prefix || 'A').toUpperCase().trim().slice(0, 3);
  const regex = new RegExp(`^${pfx}-?(\\d+)$`, 'i');
  let maxNum = 0;
  const usedCodes = new Set<string>();

  // 1. Scan in-memory trainees
  if (Array.isArray(localTrainees)) {
    for (const t of localTrainees) {
      if (t && t.code) {
        const c = String(t.code).trim().toUpperCase();
        usedCodes.add(c);
        const m = c.match(regex);
        if (m) {
          const num = parseInt(m[1], 10);
          if (!isNaN(num) && num > maxNum) maxNum = num;
        }
      }
    }
  }

  // 2. Scan remote Firestore trainees (nagah_store/trainees) if available
  const db = getDb();
  if (db) {
    try {
      const remoteList = await loadCollectionFromFirestore('trainees');
      if (Array.isArray(remoteList)) {
        for (const t of remoteList) {
          if (t && t.code) {
            const c = String(t.code).trim().toUpperCase();
            usedCodes.add(c);
            const m = c.match(regex);
            if (m) {
              const num = parseInt(m[1], 10);
              if (!isNaN(num) && num > maxNum) maxNum = num;
            }
          }
        }
      }
    } catch (e) {
      console.warn('[allocateNextTraineeCode] remote trainees scan notice:', e);
    }

    // 3. Consult persistent atomic counter in nagah_store/code_counters
    try {
      const counterRef = doc(db, 'nagah_store', 'code_counters');
      const counterSnap = await withTimeout(getDoc(counterRef), 4000);
      let countersMap: Record<string, number> = {};
      if (counterSnap.exists()) {
        countersMap = counterSnap.data()?.counters || {};
      }
      const existingVal = Number(countersMap[pfx]) || 0;
      if (existingVal > maxNum) {
        maxNum = existingVal;
      }

      let nextNum = maxNum + 1;
      let candidate = `${pfx}${String(nextNum).padStart(3, '0')}`;
      while (usedCodes.has(candidate.toUpperCase())) {
        nextNum++;
        candidate = `${pfx}${String(nextNum).padStart(3, '0')}`;
      }

      countersMap[pfx] = nextNum;
      await withTimeout(setDoc(counterRef, { counters: countersMap, updatedAt: new Date().toISOString() }, { merge: true }), 4000);

      console.log(`[allocateNextTraineeCode] Allocated persistent unique code ${candidate} (prefix: ${pfx}, nextNum: ${nextNum})`);
      return candidate;
    } catch (e) {
      console.warn('[allocateNextTraineeCode] Firestore code_counters update notice:', e);
    }
  }

  // Fallback if Firestore counter doc could not be reached
  let nextNum = maxNum + 1;
  let candidate = `${pfx}${String(nextNum).padStart(3, '0')}`;
  while (usedCodes.has(candidate.toUpperCase())) {
    nextNum++;
    candidate = `${pfx}${String(nextNum).padStart(3, '0')}`;
  }
  return candidate;
}

export async function getSyncMeta(): Promise<{ lastCollection?: string; updatedAt?: number; version?: number } | null> {
  const db = getDb();
  if (!db) return null;
  try {
    const metaRef = doc(db, 'nagah_store', 'sync_meta');
    const snap = await withTimeout(getDoc(metaRef), 3000);
    if (snap.exists()) {
      return snap.data() as any;
    }
  } catch (e) {
    // Non-critical
  }
  return null;
}

export async function loadFullDbFromFirestore(): Promise<any> {
  const collections = [
    'users', 'branches', 'trainees', 'trainers', 'courses', 'programs', 'groups',
    'attendance', 'payments', 'expenses', 'trainerSettlements', 'pointRules',
    'pointTransactions', 'exams', 'questions', 'examResults', 'interactiveSessions',
    'certificates', 'certificateTemplates',
    'trainerAttestations', 'auditLogs', 'settings', 'notifications',
    'assignments', 'homeworkSubmissions', 'badges', 'traineeBadges', 'portalMessages',
    'devices', 'deviceCommands'
  ];

  const result: any = {};
  let loadedCount = 0;

  // Load collections in controlled batches of 6 to prevent socket & quota exhaustion
  const batchSize = 6;
  for (let i = 0; i < collections.length; i += batchSize) {
    const batch = collections.slice(i, i + batchSize);
    const batchTasks = await Promise.all(
      batch.map(async (col) => {
        try {
          const data = await loadCollectionFromFirestore(col);
          return { col, data };
        } catch (e) {
          return { col, data: null };
        }
      })
    );

    for (const { col, data } of batchTasks) {
      if (data !== null) {
        result[col] = data;
        collectionHashes.set(col, hashPayload(data));
        loadedCount++;
      }
    }
  }

  return loadedCount > 0 ? result : null;
}

