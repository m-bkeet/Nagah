/**
 * Laptop Local Storage Vault (IndexedDB + File System Access API)
 * Persists user-picked local directory handle in IndexedDB so local data, session attendance,
 * grades, and full backups stay safely stored on the user's laptop and can be renewed/archived on demand.
 */

const IDB_NAME = 'NagahLaptopVaultDB';
const IDB_VERSION = 1;
const STORE_HANDLES = 'handles';
const STORE_SNAPSHOTS = 'snapshots';
const STORE_LOGS = 'logs';
const HANDLE_KEY = 'laptop_backup_dir_handle';
const META_KEY = 'laptop_storage_meta';
const LOCAL_SESSION_DOC_KEY = 'laptop_session_records';
const FULL_BACKUP_KEY = 'laptop_full_backup';

export interface LaptopStorageStatus {
  supportsFolderPicker: boolean;
  isEmbeddedIframe: boolean;
  folderName: string | null;
  hasHandle: boolean;
  hasPermission: boolean;
  lastSavedAt: string | null;
  lastRenewedAt: string | null;
  estimatedBytes: number;
  sessionRecordsCount: number;
}

function openVaultDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      return reject(new Error('IndexedDB غير مدعوم في هذا المتصفح'));
    }
    const req = indexedDB.open(IDB_NAME, IDB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_HANDLES)) {
        db.createObjectStore(STORE_HANDLES);
      }
      if (!db.objectStoreNames.contains(STORE_SNAPSHOTS)) {
        db.createObjectStore(STORE_SNAPSHOTS);
      }
      if (!db.objectStoreNames.contains(STORE_LOGS)) {
        db.createObjectStore(STORE_LOGS);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error || new Error('فشل فتح قاعدة البيانات المحلية'));
  });
}

async function idbGet<T = any>(storeName: string, key: string): Promise<T | null> {
  try {
    const db = await openVaultDB();
    return await new Promise((resolve) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

async function idbSet(storeName: string, key: string, value: any): Promise<void> {
  const db = await openVaultDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const req = store.put(value, key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

async function idbClearStore(storeName: string): Promise<void> {
  try {
    const db = await openVaultDB();
    await new Promise<void>((resolve) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.clear();
      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
    });
  } catch {}
}

export async function getStoredDirectoryHandle(): Promise<any | null> {
  return await idbGet(STORE_HANDLES, HANDLE_KEY);
}

export async function verifyDirectoryPermission(handle: any, promptIfNeeded = false): Promise<boolean> {
  if (!handle) return false;
  try {
    if (typeof handle.queryPermission === 'function') {
      const status = await handle.queryPermission({ mode: 'readwrite' });
      if (status === 'granted') return true;
    }
    if (promptIfNeeded && typeof handle.requestPermission === 'function') {
      const reqStatus = await handle.requestPermission({ mode: 'readwrite' });
      return reqStatus === 'granted';
    }
  } catch {
    return false;
  }
  return false;
}

export async function pickLaptopDirectory(): Promise<{
  success: boolean;
  folderName?: string;
  needsNewTab?: boolean;
  cancelled?: boolean;
  error?: string;
}> {
  if (typeof window === 'undefined' || !('showDirectoryPicker' in window)) {
    return {
      success: false,
      needsNewTab: true,
      error: 'متصفحك أو نافذة المعاينة لا تدعم اختيار مجلد مباشر على اللاب. افتح الرابط في تبويب مستقل أو استخدم التنزيل المباشر.'
    };
  }
  try {
    const handle = await (window as any).showDirectoryPicker({ mode: 'readwrite' });
    await idbSet(STORE_HANDLES, HANDLE_KEY, handle);
    localStorage.setItem('local_backup_folder_name', handle.name);
    localStorage.setItem('auto_local_backup_enabled', 'true');
    const meta = (await idbGet<any>(STORE_SNAPSHOTS, META_KEY)) || {};
    await idbSet(STORE_SNAPSHOTS, META_KEY, {
      ...meta,
      folderName: handle.name,
      linkedAt: new Date().toISOString()
    });
    return { success: true, folderName: handle.name };
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      return { success: false, cancelled: true };
    }
    if (err?.name === 'SecurityError' || String(err?.message || '').includes('Not allowed') || String(err?.message || '').includes('Cross origin sub frames')) {
      return {
        success: false,
        needsNewTab: true,
        error: 'لا يمكن فتح مجلدات اللاب من داخل نافذة المعاينة المصغرة. افتح المنصة في تبويب متصفح مستقل.'
      };
    }
    return { success: false, error: err?.message || 'تعذر تحديد مجلد اللاب' };
  }
}

async function writeFileToFolder(handle: any, filename: string, contentObj: any): Promise<boolean> {
  if (!handle) return false;
  const hasPerm = await verifyDirectoryPermission(handle, false);
  if (!hasPerm) return false;
  const fileHandle = await handle.getFileHandle(filename, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(JSON.stringify(contentObj, null, 2));
  await writable.close();
  return true;
}

export async function saveLocalSessionData(entry: {
  groupId: string;
  groupName?: string;
  date: string;
  attendance?: any[];
  grades?: any[];
}): Promise<{ savedToIndexedDb: boolean; savedToFolder: boolean; folderName?: string }> {
  const existingMap = (await idbGet<Record<string, any>>(STORE_SNAPSHOTS, LOCAL_SESSION_DOC_KEY)) || {};
  const sessionKey = `${entry.groupId}_${entry.date}`;
  existingMap[sessionKey] = {
    ...entry,
    updatedAt: new Date().toISOString()
  };

  // Cap stored session snapshots at latest 120 sessions so IndexedDB stays nimble
  const sortedEntries = Object.entries(existingMap)
    .sort((a, b) => String(b[1]?.updatedAt || '').localeCompare(String(a[1]?.updatedAt || '')))
    .slice(0, 120);
  const compactedMap = Object.fromEntries(sortedEntries);
  await idbSet(STORE_SNAPSHOTS, LOCAL_SESSION_DOC_KEY, compactedMap);

  const meta = (await idbGet<any>(STORE_SNAPSHOTS, META_KEY)) || {};
  const nowIso = new Date().toISOString();
  await idbSet(STORE_SNAPSHOTS, META_KEY, {
    ...meta,
    lastSavedAt: nowIso,
    sessionRecordsCount: sortedEntries.length
  });

  let savedToFolder = false;
  let folderName: string | undefined = localStorage.getItem('local_backup_folder_name') || undefined;
  try {
    const handle = await getStoredDirectoryHandle();
    if (handle) {
      folderName = handle.name;
      savedToFolder = await writeFileToFolder(handle, 'Nagah_Local_Data.json', {
        updatedAt: nowIso,
        sessions: compactedMap
      });
    }
  } catch {
    savedToFolder = false;
  }

  return { savedToIndexedDb: true, savedToFolder, folderName };
}

export async function saveFullBackupToLaptop(
  backupData: any,
  promptPermissionIfNeeded = false
): Promise<{ savedToIndexedDb: boolean; savedToFolder: boolean; folderName?: string }> {
  const nowIso = new Date().toISOString();
  await idbSet(STORE_SNAPSHOTS, FULL_BACKUP_KEY, {
    savedAt: nowIso,
    data: backupData
  });

  const meta = (await idbGet<any>(STORE_SNAPSHOTS, META_KEY)) || {};
  await idbSet(STORE_SNAPSHOTS, META_KEY, {
    ...meta,
    lastSavedAt: nowIso
  });

  let savedToFolder = false;
  let folderName: string | undefined = localStorage.getItem('local_backup_folder_name') || undefined;
  try {
    const handle = await getStoredDirectoryHandle();
    if (handle) {
      folderName = handle.name;
      const granted = await verifyDirectoryPermission(handle, promptPermissionIfNeeded);
      if (granted) {
        savedToFolder = await writeFileToFolder(handle, 'Nagah_MS_Fixed_Backup.json', backupData);
      }
    }
  } catch {
    savedToFolder = false;
  }

  return { savedToIndexedDb: true, savedToFolder, folderName };
}

export async function readBackupFromLaptopFolder(): Promise<any | null> {
  try {
    const handle = await getStoredDirectoryHandle();
    if (handle) {
      const granted = await verifyDirectoryPermission(handle, true);
      if (granted) {
        const fileHandle = await handle.getFileHandle('Nagah_MS_Fixed_Backup.json', { create: false });
        const file = await fileHandle.getFile();
        const text = await file.text();
        return JSON.parse(text);
      }
    }
  } catch {}
  const cached = await idbGet<{ savedAt: string; data: any }>(STORE_SNAPSHOTS, FULL_BACKUP_KEY);
  return cached?.data || null;
}

export async function getLaptopStorageStatus(): Promise<LaptopStorageStatus> {
  const supportsFolderPicker = typeof window !== 'undefined' && 'showDirectoryPicker' in window;
  let isEmbeddedIframe = false;
  try {
    isEmbeddedIframe = typeof window !== 'undefined' && window.self !== window.top;
  } catch {
    isEmbeddedIframe = true;
  }

  const handle = await getStoredDirectoryHandle();
  const hasHandle = Boolean(handle);
  const hasPermission = handle ? await verifyDirectoryPermission(handle, false) : false;
  const folderName = handle?.name || localStorage.getItem('local_backup_folder_name') || null;
  const meta = (await idbGet<any>(STORE_SNAPSHOTS, META_KEY)) || {};
  const sessions = (await idbGet<Record<string, any>>(STORE_SNAPSHOTS, LOCAL_SESSION_DOC_KEY)) || {};

  let estimatedBytes = 0;
  try {
    if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
      const est = await navigator.storage.estimate();
      estimatedBytes = est.usage || 0;
    }
  } catch {}

  return {
    supportsFolderPicker,
    isEmbeddedIframe,
    folderName,
    hasHandle,
    hasPermission,
    lastSavedAt: meta.lastSavedAt || null,
    lastRenewedAt: meta.lastRenewedAt || null,
    estimatedBytes,
    sessionRecordsCount: Object.keys(sessions).length
  };
}

/**
 * Renews local laptop storage:
 * 1. Archives current local session & backup data to a dated archive file in the chosen folder (or triggers browser download fallback).
 * 2. Prunes temporary caches/old drafts in localStorage & clears temporary logs store while preserving core data.
 */
export async function renewLaptopStorage(latestBackupData?: any): Promise<{
  archivedToFolder: boolean;
  downloadedFallback: boolean;
  archiveFilename: string;
  clearedItemsCount: number;
}> {
  const now = new Date();
  const stamp = `${now.toISOString().slice(0, 10)}_${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}`;
  const archiveFilename = `Nagah_Archive_${stamp}.json`;

  const existingSessions = (await idbGet<Record<string, any>>(STORE_SNAPSHOTS, LOCAL_SESSION_DOC_KEY)) || {};
  const existingFull = (await idbGet<any>(STORE_SNAPSHOTS, FULL_BACKUP_KEY)) || null;
  const archivePayload = {
    archivedAt: now.toISOString(),
    sessions: existingSessions,
    backup: latestBackupData || existingFull?.data || null
  };

  let archivedToFolder = false;
  let downloadedFallback = false;

  try {
    const handle = await getStoredDirectoryHandle();
    if (handle) {
      const granted = await verifyDirectoryPermission(handle, true);
      if (granted) {
        archivedToFolder = await writeFileToFolder(handle, archiveFilename, archivePayload);
      }
    }
  } catch {
    archivedToFolder = false;
  }

  if (!archivedToFolder && typeof document !== 'undefined') {
    try {
      const blob = new Blob([JSON.stringify(archivePayload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = archiveFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      downloadedFallback = true;
    } catch {}
  }

  // Compact temporary localStorage caches & old session drafts (> 14 days)
  let clearedItemsCount = 0;
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k) continue;
      if (k.startsWith('nagah_cache_') || k.startsWith('nagah_lab_attendance_')) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach((k) => {
      localStorage.removeItem(k);
      clearedItemsCount++;
    });
  } catch {}

  await idbClearStore(STORE_LOGS);

  // Retain only recent 14 days of session snapshots inside IndexedDB
  const cutoff = Date.now() - 14 * 86400000;
  const recentSessions: Record<string, any> = {};
  for (const [k, val] of Object.entries(existingSessions)) {
    const ts = new Date(val?.updatedAt || val?.date || 0).getTime();
    if (!ts || ts >= cutoff) {
      recentSessions[k] = val;
    } else {
      clearedItemsCount++;
    }
  }
  await idbSet(STORE_SNAPSHOTS, LOCAL_SESSION_DOC_KEY, recentSessions);

  if (latestBackupData) {
    await idbSet(STORE_SNAPSHOTS, FULL_BACKUP_KEY, {
      savedAt: now.toISOString(),
      data: latestBackupData
    });
  }

  const meta = (await idbGet<any>(STORE_SNAPSHOTS, META_KEY)) || {};
  await idbSet(STORE_SNAPSHOTS, META_KEY, {
    ...meta,
    lastRenewedAt: now.toISOString(),
    lastSavedAt: now.toISOString(),
    sessionRecordsCount: Object.keys(recentSessions).length
  });

  return {
    archivedToFolder,
    downloadedFallback,
    archiveFilename,
    clearedItemsCount
  };
}
