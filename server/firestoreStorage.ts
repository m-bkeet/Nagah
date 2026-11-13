import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, disableNetwork, enableNetwork, setLogLevel, Firestore } from 'firebase/firestore';

// Silence noisy internal gRPC stream logging
try {
  setLogLevel('silent');
} catch {}

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
    storageBucket: "booming-list-379600.firebasestorage.app",
    messagingSenderId: "303545128372",
    firestoreDatabaseId: "ai-studio-nagahms-44b6deb5-5b09-4e62-a58f-790b1ca94573"
  };
}

const FIRESTORE_DATABASE_ID = 
  process.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || 
  firebaseConfig?.firestoreDatabaseId || 
  'ai-studio-nagahms-44b6deb5-5b09-4e62-a58f-790b1ca94573';

let firestoreInstance: Firestore | null = null;
function getDb(): Firestore | null {
  if (firestoreInstance) return firestoreInstance;
  if (!firebaseConfig) return null;
  try {
    const existingDefault = getApps().find(a => a.name === '[DEFAULT]');
    const app = existingDefault || initializeApp(firebaseConfig);
    firestoreInstance = getFirestore(app, FIRESTORE_DATABASE_ID);
    return firestoreInstance;
  } catch (err) {
    console.warn('[FirestoreStorage] Failed to initialize Firestore client:', err);
    return null;
  }
}

const collectionHashes = new Map<string, string>();
let isQuotaExceeded = false;
let quotaExceededNoticeTime = 0;
let networkBackoffUntil = 0;
const QUOTA_BACKOFF_MS = 60 * 60 * 1000; // 1 hour backoff on genuine quota exhaust
const NETWORK_BACKOFF_MS = 10 * 1000; // 10 second cooldown on transient network/timeout blips

// In-memory Firestore Quota Tracking metrics
let readsCountToday = 0;
let writesCountToday = 0;
let deletesCountToday = 0;
let currentTrackingDate = new Date().toISOString().split('T')[0];

function checkDateRollover() {
  const today = new Date().toISOString().split('T')[0];
  if (today !== currentTrackingDate) {
    currentTrackingDate = today;
    readsCountToday = 0;
    writesCountToday = 0;
    deletesCountToday = 0;
    if (isQuotaExceeded) {
      isQuotaExceeded = false;
      quotaExceededNoticeTime = 0;
      const db = getDb();
      if (db) {
        enableNetwork(db).catch(() => {});
      }
    }
  }
}

export function isFirestoreBlocked(): boolean {
  checkDateRollover();
  const now = Date.now();
  if (isQuotaExceeded) {
    if (now - quotaExceededNoticeTime >= QUOTA_BACKOFF_MS) {
      isQuotaExceeded = false;
      quotaExceededNoticeTime = 0;
      const db = getDb();
      if (db) {
        enableNetwork(db).catch(() => {});
      }
    } else {
      return true;
    }
  }
  if (networkBackoffUntil > now) {
    return true;
  }
  return false;
}

export function handleQuotaExceeded(err: any): boolean {
  if (!err) return false;
  const errMsg = err?.message || String(err);
  const code = err?.code;
  
  const isExhausted = 
    errMsg.includes('RESOURCE_EXHAUSTED') || 
    errMsg.includes('Quota limit exceeded') || 
    code === 8 || 
    code === 429 ||
    code === 'resource-exhausted';

  const isTransientNetwork = 
    code === 5 || 
    code === 'not-found' || 
    code === 'unavailable' ||
    errMsg.includes('NOT_FOUND') ||
    errMsg.includes('Could not reach Cloud Firestore backend') ||
    errMsg.includes('client is offline') ||
    errMsg.includes('unavailable') ||
    errMsg.includes('FIRESTORE_TIMEOUT') ||
    errMsg.includes('AbortError') ||
    errMsg.includes('TimeoutError');

  if (isExhausted) {
    if (!isQuotaExceeded) {
      isQuotaExceeded = true;
      quotaExceededNoticeTime = Date.now();
      console.warn('[FirestoreStorage] Cloud Firestore write quota limit hit (429 RESOURCE_EXHAUSTED). Pausing remote sync for 1 hour; local disk & vault remain active.');
      const db = getDb();
      if (db) {
        disableNetwork(db).catch(() => {});
      }
    }
    return true;
  }

  if (isTransientNetwork) {
    networkBackoffUntil = Date.now() + NETWORK_BACKOFF_MS;
    console.warn(`[FirestoreStorage] Transient Firestore network notice (${errMsg}). Cooling down for 10s without disabling Firestore.`);
    return true;
  }

  return false;
}

export function recordFirestoreRead(count = 1) {
  checkDateRollover();
  readsCountToday += count;
}

export function recordFirestoreWrite(count = 1) {
  checkDateRollover();
  writesCountToday += count;
}

export function recordFirestoreDelete(count = 1) {
  checkDateRollover();
  deletesCountToday += count;
}

// High-frequency or local-only collections: NEVER auto-pushed unless forceManual = true
const TRANSIENT_COLLECTIONS = new Set([
  'devices',
  'deviceCommands',
  'auditLogs',
  'traineeScreenshots',
  'notifications',
  'deletedDeviceIds'
]);

// ONLY these 3 user-requested collections auto-sync to Cloud Firestore (points, new trainees, new payments)
const AUTO_CLOUD_SYNC_COLLECTIONS = new Set([
  'trainees',
  'pointTransactions',
  'payments'
]);

// Live Compact Delta Document IDs in `nagah_store` (each typically 1–5 KB vs 170–493 KB full blobs)
const DELTA_DOC_TRAINEE_POINTS = 'trainee_points_delta';
const DELTA_DOC_POINTS_TX = 'pt_live_delta';
const DELTA_DOC_TRAINEES = 'trainees_live_delta';
const DELTA_DOC_PAYMENTS = 'payments_live_delta';

let cachedTraineePointsDelta: Record<string, { totalPoints: number; points: number; updatedAt: string }> | null = null;
let cachedPtDelta: any[] | null = null;
let cachedTraineesDelta: any[] | null = null;
let cachedPaymentsDelta: { items: any[]; deletedIds: string[] } | null = null;

async function readDeltaDoc(docId: string): Promise<any | null> {
  if (isFirestoreBlocked()) return null;
  const db = getDb();
  if (!db) return null;
  try {
    const snap = await withTimeout(getDoc(doc(db, 'nagah_store', docId)), 5000);
    recordFirestoreRead(1);
    if (!snap.exists()) return null;
    const data = snap.data();
    if (data?.payload) {
      return JSON.parse(data.payload);
    }
    return null;
  } catch (err) {
    handleQuotaExceeded(err);
    return null;
  }
}

async function writeDeltaDoc(docId: string, payloadObj: any, collectionLabel: string, updateSyncMeta = true): Promise<boolean> {
  if (isFirestoreBlocked()) return false;
  try {
    const now = Date.now();
    const serialized = JSON.stringify(payloadObj);
    await restWriteDoc(docId, {
      payload: { stringValue: serialized },
      isDelta: { booleanValue: true },
      updatedAt: { integerValue: String(now) }
    }, 6000);
    recordFirestoreWrite(1);

    if (updateSyncMeta && !isFirestoreBlocked()) {
      await restWriteDoc('sync_meta', {
        lastUpdatedCollection: { stringValue: collectionLabel },
        lastCollection: { stringValue: collectionLabel },
        updatedAt: { integerValue: String(now) },
        version: { integerValue: String(now) }
      }, 4000).catch(metaErr => handleQuotaExceeded(metaErr));
      recordFirestoreWrite(1);
    }
    return true;
  } catch (err) {
    handleQuotaExceeded(err);
    return false;
  }
}

/**
 * Ultra-lightweight Cloud sync for Points (~1–3 KB vs 665 KB full overwrite!)
 * Syncs ONLY point overrides + latest point transactions so lab logins see updated points.
 */
export async function syncPointsDeltaToFirestore(
  affectedTrainees: Array<{ id: string; totalPoints?: number; points?: number; updatedAt?: string }>,
  newTransactions: any[] = []
): Promise<boolean> {
  if (isFirestoreBlocked()) return false;
  try {
    if (!cachedTraineePointsDelta) {
      const remote = await readDeltaDoc(DELTA_DOC_TRAINEE_POINTS);
      cachedTraineePointsDelta = (remote && typeof remote === 'object' && !Array.isArray(remote)) ? remote : {};
    }
    for (const t of affectedTrainees) {
      if (!t || !t.id) continue;
      const pts = Number(t.totalPoints !== undefined ? t.totalPoints : (t.points || 0));
      cachedTraineePointsDelta[t.id] = {
        totalPoints: pts,
        points: pts,
        updatedAt: t.updatedAt || new Date().toISOString()
      };
    }

    const writeTasks: Promise<boolean>[] = [
      writeDeltaDoc(DELTA_DOC_TRAINEE_POINTS, cachedTraineePointsDelta, 'sync_deltas', false)
    ];

    if (Array.isArray(newTransactions) && newTransactions.length > 0) {
      if (!cachedPtDelta) {
        const remotePt = await readDeltaDoc(DELTA_DOC_POINTS_TX);
        cachedPtDelta = Array.isArray(remotePt) ? remotePt : [];
      }
      const existingIds = new Set(cachedPtDelta.map((x: any) => x?.id).filter(Boolean));
      for (const tx of newTransactions) {
        if (tx && tx.id && !existingIds.has(tx.id)) {
          cachedPtDelta.unshift(tx);
          existingIds.add(tx.id);
        }
      }
      // Cap live delta log to latest 100 transactions (~15 KB max, ~1-3 KB typical)
      if (cachedPtDelta.length > 100) {
        cachedPtDelta = cachedPtDelta.slice(0, 100);
      }
      writeTasks.push(writeDeltaDoc(DELTA_DOC_POINTS_TX, cachedPtDelta, 'sync_deltas', false));
    }

    const res = await Promise.all(writeTasks);
    const anyWritten = res.some(Boolean);
    if (anyWritten && !isFirestoreBlocked()) {
      const now = Date.now();
      await restWriteDoc('sync_meta', {
        lastUpdatedCollection: { stringValue: 'sync_deltas' },
        lastCollection: { stringValue: 'sync_deltas' },
        updatedAt: { integerValue: String(now) },
        version: { integerValue: String(now) }
      }, 4000).catch(metaErr => handleQuotaExceeded(metaErr));
      recordFirestoreWrite(1);
    }
    return anyWritten;
  } catch (err) {
    handleQuotaExceeded(err);
    return false;
  }
}

/**
 * Ultra-lightweight Cloud sync for newly created or financially updated Trainee (~1–4 KB vs 170 KB!)
 */
export async function syncTraineeDeltaToFirestore(trainee: any): Promise<boolean> {
  if (isFirestoreBlocked() || !trainee || !trainee.id) return false;
  try {
    if (!cachedTraineesDelta) {
      const remote = await readDeltaDoc(DELTA_DOC_TRAINEES);
      cachedTraineesDelta = Array.isArray(remote) ? remote : [];
    }
    const cleanList = sanitizeForFirestore('trainees', [trainee]);
    const cleanTrainee = Array.isArray(cleanList) && cleanList[0] ? cleanList[0] : trainee;
    const idx = cachedTraineesDelta.findIndex((t: any) => t && t.id === cleanTrainee.id);
    if (idx >= 0) {
      cachedTraineesDelta[idx] = { ...cachedTraineesDelta[idx], ...cleanTrainee, updatedAt: cleanTrainee.updatedAt || new Date().toISOString() };
    } else {
      cachedTraineesDelta.unshift({ ...cleanTrainee, updatedAt: cleanTrainee.updatedAt || new Date().toISOString() });
    }
    if (cachedTraineesDelta.length > 120) {
      cachedTraineesDelta = cachedTraineesDelta.slice(0, 120);
    }
    return await writeDeltaDoc(DELTA_DOC_TRAINEES, cachedTraineesDelta, 'sync_deltas');
  } catch (err) {
    handleQuotaExceeded(err);
    return false;
  }
}

/**
 * Ultra-lightweight Cloud sync for Payments (create/update/delete, ~0.5–3 KB!)
 */
export async function syncPaymentDeltaToFirestore(payment?: any, deletedPaymentId?: string): Promise<boolean> {
  if (isFirestoreBlocked()) return false;
  try {
    if (!cachedPaymentsDelta) {
      const remote = await readDeltaDoc(DELTA_DOC_PAYMENTS);
      cachedPaymentsDelta = (remote && typeof remote === 'object')
        ? {
            items: Array.isArray(remote.items) ? remote.items : [],
            deletedIds: Array.isArray(remote.deletedIds) ? remote.deletedIds : []
          }
        : { items: [], deletedIds: [] };
    }

    if (payment && payment.id) {
      const idx = cachedPaymentsDelta.items.findIndex((p: any) => p && p.id === payment.id);
      if (idx >= 0) {
        cachedPaymentsDelta.items[idx] = payment;
      } else {
        cachedPaymentsDelta.items.unshift(payment);
      }
      cachedPaymentsDelta.deletedIds = cachedPaymentsDelta.deletedIds.filter(id => id !== payment.id);
      if (cachedPaymentsDelta.items.length > 150) {
        cachedPaymentsDelta.items = cachedPaymentsDelta.items.slice(0, 150);
      }
    }

    if (deletedPaymentId) {
      cachedPaymentsDelta.items = cachedPaymentsDelta.items.filter((p: any) => p && p.id !== deletedPaymentId);
      if (!cachedPaymentsDelta.deletedIds.includes(deletedPaymentId)) {
        cachedPaymentsDelta.deletedIds.unshift(deletedPaymentId);
        if (cachedPaymentsDelta.deletedIds.length > 200) {
          cachedPaymentsDelta.deletedIds = cachedPaymentsDelta.deletedIds.slice(0, 200);
        }
      }
    }

    return await writeDeltaDoc(DELTA_DOC_PAYMENTS, cachedPaymentsDelta, 'sync_deltas');
  } catch (err) {
    handleQuotaExceeded(err);
    return false;
  }
}

export async function loadLiveDeltasFromFirestore(): Promise<{
  traineePointsOverrides: Record<string, { totalPoints: number; points: number; updatedAt: string }> | null;
  ptDelta: any[] | null;
  traineesDelta: any[] | null;
  paymentsDelta: { items: any[]; deletedIds: string[] } | null;
}> {
  if (isFirestoreBlocked()) {
    return { traineePointsOverrides: null, ptDelta: null, traineesDelta: null, paymentsDelta: null };
  }
  const [tp, pt, tr, pay] = await Promise.all([
    readDeltaDoc(DELTA_DOC_TRAINEE_POINTS).catch(() => null),
    readDeltaDoc(DELTA_DOC_POINTS_TX).catch(() => null),
    readDeltaDoc(DELTA_DOC_TRAINEES).catch(() => null),
    readDeltaDoc(DELTA_DOC_PAYMENTS).catch(() => null)
  ]);

  if (tp && typeof tp === 'object' && !Array.isArray(tp)) cachedTraineePointsDelta = tp;
  if (Array.isArray(pt)) cachedPtDelta = pt;
  if (Array.isArray(tr)) cachedTraineesDelta = tr;
  if (pay && typeof pay === 'object') {
    cachedPaymentsDelta = {
      items: Array.isArray(pay.items) ? pay.items : [],
      deletedIds: Array.isArray(pay.deletedIds) ? pay.deletedIds : []
    };
  }

  return {
    traineePointsOverrides: (tp && typeof tp === 'object' && !Array.isArray(tp)) ? tp : null,
    ptDelta: Array.isArray(pt) ? pt : null,
    traineesDelta: Array.isArray(tr) ? tr : null,
    paymentsDelta: cachedPaymentsDelta
  };
}

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
  if (!items) return items;

  if (!Array.isArray(items)) {
    if (collectionName === 'settings' && typeof items === 'object') {
      const sanitized = { ...items };
      if (typeof sanitized.logoUrl === 'string' && (sanitized.logoUrl.startsWith('data:image') || sanitized.logoUrl.startsWith('data:'))) {
        delete sanitized.logoUrl;
      }
      return sanitized;
    }
    return items;
  }

  if (collectionName === 'trainees') {
    return items.map((t: any) => {
      const sanitized = { ...t };
      
      // If photoDriveFileId exists, enforce Google Drive CDN link
      if (sanitized.photoDriveFileId && typeof sanitized.photoDriveFileId === 'string' && sanitized.photoDriveFileId.trim()) {
        const cleanDriveId = sanitized.photoDriveFileId.trim();
        sanitized.photoDriveFileId = cleanDriveId;
        sanitized.photoUrl = `https://lh3.googleusercontent.com/d/${cleanDriveId}`;
        delete sanitized.photo;
      } else {
        // STRICT ZERO BASE64 IN FIRESTORE: Purge raw data URLs
        if (typeof sanitized.photoUrl === 'string' && (sanitized.photoUrl.startsWith('data:image') || sanitized.photoUrl.startsWith('data:'))) {
          delete sanitized.photoUrl;
        }
        if (typeof sanitized.photo === 'string' && (sanitized.photo.startsWith('data:image') || sanitized.photo.startsWith('data:'))) {
          delete sanitized.photo;
        }
      }

      if (typeof sanitized.parentPhotoUrl === 'string' && sanitized.parentPhotoUrl.startsWith('data:')) {
        delete sanitized.parentPhotoUrl;
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
      delete sanitized.audioBase64;
      if (typeof sanitized.attachmentUrl === 'string' && sanitized.attachmentUrl.startsWith('data:')) {
        delete sanitized.attachmentUrl;
      }
      if (typeof sanitized.mediaUrl === 'string' && sanitized.mediaUrl.startsWith('data:')) {
        delete sanitized.mediaUrl;
      }
      if (Array.isArray(sanitized.pagesUrls)) {
        sanitized.pagesUrls = sanitized.pagesUrls.filter((p: any) => typeof p === 'string' && !p.startsWith('data:'));
      }
      return sanitized;
    });
  }

  if (collectionName === 'courses') {
    return items.map((c: any) => {
      const sanitized = { ...c };
      if (Array.isArray(sanitized.materials)) {
        sanitized.materials = sanitized.materials.map((m: any) => {
          const cleanM = { ...m };
          if (typeof cleanM.fileUrl === 'string' && cleanM.fileUrl.startsWith('data:')) {
            delete cleanM.fileUrl;
          }
          return cleanM;
        });
      }
      return sanitized;
    });
  }

  return items;
}

async function restWriteDoc(docId: string, fields: Record<string, any>, timeoutMs = 8000): Promise<void> {
  const projectId = firebaseConfig?.projectId || 'booming-list-379600';
  const apiKey = firebaseConfig?.apiKey || '';
  const fieldPaths = Object.keys(fields).map(k => `updateMask.fieldPaths=${encodeURIComponent(k)}`).join('&');
  const url = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/${encodeURIComponent(FIRESTORE_DATABASE_ID)}/documents/nagah_store/${encodeURIComponent(docId)}?key=${encodeURIComponent(apiKey)}&${fieldPaths}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields }),
      signal: controller.signal
    });
    if (!res.ok) {
      let errBody: any = null;
      try { errBody = await res.json(); } catch {}
      const msg = errBody?.error?.message || `HTTP_${res.status}`;
      const status = errBody?.error?.status || '';
      const err: any = new Error(msg);
      err.code = (res.status === 429 || status === 'RESOURCE_EXHAUSTED') ? 'resource-exhausted' : res.status;
      throw err;
    }
  } finally {
    clearTimeout(timer);
  }
}

export async function saveCollectionToFirestore(collectionName: string, rawItems: any, updateSyncMeta = true, forceManual = false): Promise<boolean> {
  // 1. Skip transient collections completely
  if (TRANSIENT_COLLECTIONS.has(collectionName)) {
    return true;
  }

  // 1b. Strict local-first quota protection: ONLY allow the 3 user-approved collections unless forceManual is true
  if (!forceManual && !AUTO_CLOUD_SYNC_COLLECTIONS.has(collectionName)) {
    return true;
  }

  // 2. Circuit Breaker: Check quota / brief cooldown with auto-recovery
  if (isFirestoreBlocked()) {
    return false;
  }

  const items = sanitizeForFirestore(collectionName, rawItems);
  const newHash = hashPayload(items);
  if (collectionHashes.get(collectionName) === newHash) {
    return true; // No changes, skip write!
  }

  const writeAttempt = async (): Promise<boolean> => {
    const now = Date.now();
    const serialized = JSON.stringify(items ?? []);
    const CHUNK_SIZE = 700 * 1024; // 700KB safe chunk size well below Firestore's 1MB limit
    
    if (serialized.length < CHUNK_SIZE) {
      await restWriteDoc(collectionName, {
        payload: { stringValue: serialized },
        itemCount: { integerValue: String(Array.isArray(items) ? items.length : 1) },
        isSplit: { booleanValue: false },
        totalParts: { integerValue: '1' },
        updatedAt: { integerValue: String(now) }
      }, 8000);
      recordFirestoreWrite(Math.max(1, Math.ceil(serialized.length / 1024)));
    } else {
      const totalParts = Math.ceil(serialized.length / CHUNK_SIZE);
      for (let i = 0; i < totalParts; i++) {
        const chunk = serialized.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
        await restWriteDoc(`${collectionName}_p${i + 1}`, {
          payload: { stringValue: chunk },
          part: { integerValue: String(i + 1) },
          totalParts: { integerValue: String(totalParts) },
          updatedAt: { integerValue: String(now) }
        }, 8000);
      }
      await restWriteDoc(collectionName, {
        isSplit: { booleanValue: true },
        totalParts: { integerValue: String(totalParts) },
        updatedAt: { integerValue: String(now) }
      }, 8000);
      recordFirestoreWrite(Math.max(totalParts + 1, Math.ceil(serialized.length / 1024)));
    }

    // Update global sync heartbeat in Firestore so all instances (Cloud Run / Vercel) pick up changes
    if (updateSyncMeta && !isFirestoreBlocked()) {
      try {
        await restWriteDoc('sync_meta', {
          lastUpdatedCollection: { stringValue: collectionName },
          lastCollection: { stringValue: collectionName },
          updatedAt: { integerValue: String(now) },
          version: { integerValue: String(now) }
        }, 5000);
        recordFirestoreWrite(1);
      } catch (metaErr) {
        handleQuotaExceeded(metaErr);
      }
    }

    collectionHashes.set(collectionName, newHash);
    return true;
  };

  try {
    return await writeAttempt();
  } catch (err: any) {
    const errMsg = err?.message || String(err);
    const isQuota = errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('Quota limit exceeded') || err?.code === 8 || err?.code === 429 || err?.code === 'resource-exhausted';
    if (!isQuota) {
      // Transient error: brief retry once before entering cooldown
      try {
        await new Promise(r => setTimeout(r, 250));
        return await writeAttempt();
      } catch (retryErr: any) {
        handleQuotaExceeded(retryErr);
        console.warn(`[FirestoreStorage] Save retry failed for ${collectionName}:`, retryErr?.message || retryErr);
        return false;
      }
    }
    handleQuotaExceeded(err);
    return false;
  }
}

export async function loadCollectionFromFirestore(collectionName: string): Promise<any> {
  if (TRANSIENT_COLLECTIONS.has(collectionName)) {
    return null;
  }

  if (isFirestoreBlocked()) {
    return null;
  }

  const db = getDb();
  if (!db) return null;

  try {
    const docRef = doc(db, 'nagah_store', collectionName);
    const snap = await withTimeout(getDoc(docRef), 10000);
    recordFirestoreRead(1);
    if (!snap.exists()) return null;

    const data = snap.data();
    if (data?.isSplit) {
      const totalParts = data.totalParts || 2;
      const partSnaps = await Promise.all(
        Array.from({ length: totalParts }, (_, i) => withTimeout(getDoc(doc(db, 'nagah_store', `${collectionName}_p${i + 1}`)), 10000))
      );
      recordFirestoreRead(totalParts);
      const fullStr = partSnaps.map(s => s.data()?.payload || '').join('');
      const parsed = fullStr ? JSON.parse(fullStr) : null;
      if (parsed !== null) collectionHashes.set(collectionName, hashPayload(parsed));
      return parsed;
    }

    if (data?.payload) {
      const parsed = JSON.parse(data.payload);
      collectionHashes.set(collectionName, hashPayload(parsed));
      return parsed;
    }
    return null;
  } catch (err: any) {
    handleQuotaExceeded(err);
    return null;
  }
}

let debouncedSyncTimer: NodeJS.Timeout | null = null;
let pendingDbData: any = null;

const CORE_COLLECTIONS = [
  'users', 'branches', 'trainees', 'trainers', 'courses', 'programs', 'groups',
  'attendance', 'payments', 'expenses', 'trainerSettlements', 'ownerWithdrawals',
  'secretFinancialArchives', 'pointRules', 'pointTransactions', 'exams', 'questions',
  'examResults', 'interactiveSessions', 'certificates', 'certificateTemplates',
  'trainerAttestations', 'settings', 'assignments', 'homeworkSubmissions', 'badges',
  'traineeBadges', 'traineeEvaluations', 'portalMessages', 'schedules', 'labSchedules',
  'lectureRecaps', 'freedTraineeCodes', 'deletedTraineeIds'
];

export async function saveFullDbToFirestore(dbData: any, immediate = false, forceManual = false): Promise<void> {
  // Never run automatic 34-collection Firestore storms unless explicitly requested manually
  if (!forceManual || isFirestoreBlocked() || !dbData) return;
  pendingDbData = dbData;

  const executeSync = async () => {
    const current = pendingDbData;
    if (!current) return;

    const tasks = CORE_COLLECTIONS
      .filter(k => current[k] !== undefined)
      .map(k => saveCollectionToFirestore(k, current[k], false, true));

    const results = await Promise.all(tasks);
    const anyWritten = results.some(r => r === true);

    if (anyWritten && !isFirestoreBlocked()) {
      try {
        const now = Date.now();
        await restWriteDoc('sync_meta', {
          updatedAt: { integerValue: String(now) },
          version: { integerValue: String(now) }
        }, 5000);
        recordFirestoreWrite(1);
      } catch (metaErr) {
        handleQuotaExceeded(metaErr);
      }
    }
  };

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
  localTrainees: any[] = [],
  groupId?: string,
  freedCodesList: Array<{ code: string; prefix?: string; groupId?: string }> = []
): Promise<string> {
  const pfx = (prefix || 'A').toUpperCase().trim().slice(0, 3);
  const regex = new RegExp(`^${pfx}-?(\\d+)$`, 'i');
  const usedCodes = new Set<string>();
  const usedNumbers = new Set<number>();

  // 1. Scan all in-memory trainees (instantly available and authoritative)
  if (Array.isArray(localTrainees)) {
    for (const t of localTrainees) {
      if (t && t.code) {
        const c = String(t.code).trim().toUpperCase();
        usedCodes.add(c);
        const m = c.match(regex);
        if (m) {
          const num = parseInt(m[1], 10);
          if (!isNaN(num)) usedNumbers.add(num);
        }
      }
    }
  }

  // Priority 1: Check freed codes recorded for this exact group/class
  if (groupId && Array.isArray(freedCodesList)) {
    const groupFreed = freedCodesList.find(f => 
      f && f.code && 
      f.groupId === groupId && 
      (f.prefix?.toUpperCase() === pfx || f.code.toUpperCase().startsWith(pfx)) &&
      !usedCodes.has(f.code.toUpperCase())
    );
    if (groupFreed) {
      const code = groupFreed.code.toUpperCase();
      console.log(`[allocateNextTraineeCode] Reusing freed code ${code} for group ${groupId}`);
      return code;
    }
  }

  // Priority 2: Check freed codes matching prefix
  if (Array.isArray(freedCodesList)) {
    const prefixFreed = freedCodesList.find(f => 
      f && f.code && 
      (f.prefix?.toUpperCase() === pfx || f.code.toUpperCase().startsWith(pfx)) &&
      !usedCodes.has(f.code.toUpperCase())
    );
    if (prefixFreed) {
      const code = prefixFreed.code.toUpperCase();
      console.log(`[allocateNextTraineeCode] Reusing freed code ${code} for prefix ${pfx}`);
      return code;
    }
  }

  // Priority 3: Numerical gap detection (find the lowest unused number starting at 1)
  let candidateNum = 1;
  while (usedNumbers.has(candidateNum)) {
    candidateNum++;
  }

  let candidate = `${pfx}${String(candidateNum).padStart(3, '0')}`;
  while (usedCodes.has(candidate.toUpperCase())) {
    candidateNum++;
    candidate = `${pfx}${String(candidateNum).padStart(3, '0')}`;
  }

  console.log(`[allocateNextTraineeCode] Allocated unique code ${candidate} (prefix: ${pfx}, num: ${candidateNum})`);
  return candidate;
}

export async function getSyncMeta(): Promise<{ lastCollection?: string; updatedAt?: number; version?: number } | null> {
  if (isFirestoreBlocked()) return null;
  const db = getDb();
  if (!db) return null;
  try {
    const metaRef = doc(db, 'nagah_store', 'sync_meta');
    const snap = await withTimeout(getDoc(metaRef), 3000);
    recordFirestoreRead(1);
    if (snap.exists()) {
      return snap.data() as any;
    }
  } catch (e) {
    handleQuotaExceeded(e);
  }
  return null;
}

export async function loadFullDbFromFirestore(): Promise<any> {
  if (isFirestoreBlocked()) return null;
  const collections = CORE_COLLECTIONS;

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

  // Merge compact live deltas (points, new trainees, payments) on top of base blobs
  try {
    const deltas = await loadLiveDeltasFromFirestore();

    if (deltas.traineesDelta && deltas.traineesDelta.length > 0) {
      const baseTrainees = Array.isArray(result.trainees) ? [...result.trainees] : [];
      const traineeMap = new Map<string, any>(baseTrainees.map(t => [t?.id, t]).filter(([id]) => Boolean(id)));
      for (const dt of deltas.traineesDelta) {
        if (!dt || !dt.id) continue;
        const existing = traineeMap.get(dt.id);
        if (!existing) {
          traineeMap.set(dt.id, dt);
        } else {
          const existingTime = new Date(existing.updatedAt || existing.createdAt || 0).getTime();
          const deltaTime = new Date(dt.updatedAt || dt.createdAt || 0).getTime();
          if (deltaTime >= existingTime) {
            traineeMap.set(dt.id, { ...existing, ...dt });
          }
        }
      }
      result.trainees = Array.from(traineeMap.values());
      loadedCount++;
    }

    if (deltas.traineePointsOverrides && Array.isArray(result.trainees)) {
      const overrides = deltas.traineePointsOverrides;
      result.trainees = result.trainees.map((t: any) => {
        const ov = t?.id ? overrides[t.id] : undefined;
        if (!ov) return t;
        const tTime = new Date(t.updatedAt || t.createdAt || 0).getTime();
        const ovTime = new Date(ov.updatedAt || 0).getTime();
        if (ovTime >= tTime) {
          return {
            ...t,
            totalPoints: ov.totalPoints,
            points: ov.points,
            updatedAt: ov.updatedAt
          };
        }
        return t;
      });
    }

    if (deltas.ptDelta && deltas.ptDelta.length > 0) {
      const basePt = Array.isArray(result.pointTransactions) ? [...result.pointTransactions] : [];
      const ptMap = new Map<string, any>(basePt.map(p => [p?.id, p]).filter(([id]) => Boolean(id)));
      for (const ptItem of deltas.ptDelta) {
        if (ptItem && ptItem.id && !ptMap.has(ptItem.id)) {
          basePt.unshift(ptItem);
          ptMap.set(ptItem.id, ptItem);
        }
      }
      result.pointTransactions = basePt;
      loadedCount++;
    }

    if (deltas.paymentsDelta) {
      const basePays = Array.isArray(result.payments) ? [...result.payments] : [];
      const deletedSet = new Set(deltas.paymentsDelta.deletedIds || []);
      const payMap = new Map<string, any>();
      for (const p of basePays) {
        if (p && p.id && !deletedSet.has(p.id)) {
          payMap.set(p.id, p);
        }
      }
      for (const dp of (deltas.paymentsDelta.items || [])) {
        if (dp && dp.id && !deletedSet.has(dp.id)) {
          payMap.set(dp.id, dp);
        }
      }
      result.payments = Array.from(payMap.values());
      loadedCount++;
    }
  } catch (deltaMergeErr) {
    console.warn('[FirestoreStorage] Live delta merge notice:', deltaMergeErr);
  }

  return loadedCount > 0 ? result : null;
}

export function getFirestoreQuotaMetrics() {
  checkDateRollover();
  const DAILY_FREE_READS = 50000;
  const DAILY_FREE_WRITES = 20000;
  const DAILY_FREE_DELETES = 20000;

  const now = Date.now();
  const isBackoff = isQuotaExceeded && (now - quotaExceededNoticeTime < QUOTA_BACKOFF_MS);
  const backoffRemaining = isBackoff ? Math.ceil((QUOTA_BACKOFF_MS - (now - quotaExceededNoticeTime)) / 1000) : 0;

  return {
    date: currentTrackingDate,
    readsToday: readsCountToday,
    writesToday: writesCountToday,
    deletesToday: deletesCountToday,
    limits: {
      dailyReads: DAILY_FREE_READS,
      dailyWrites: DAILY_FREE_WRITES,
      dailyDeletes: DAILY_FREE_DELETES
    },
    remaining: {
      reads: Math.max(0, DAILY_FREE_READS - readsCountToday),
      writes: Math.max(0, DAILY_FREE_WRITES - writesCountToday)
    },
    percentageUsed: {
      reads: Number(((readsCountToday / DAILY_FREE_READS) * 100).toFixed(2)),
      writes: Number(((writesCountToday / DAILY_FREE_WRITES) * 100).toFixed(2))
    },
    circuitBreaker: {
      active: isBackoff,
      remainingSeconds: backoffRemaining,
      lastNotice: quotaExceededNoticeTime ? new Date(quotaExceededNoticeTime).toISOString() : null
    },
    health: isBackoff ? 'quota_exhausted_backoff' : (readsCountToday > 45000 ? 'warning_near_limit' : 'optimal')
  };
}

