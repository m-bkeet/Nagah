import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  getDocFromCache, 
  getDocsFromCache, 
  getDocsFromServer,
  query, 
  where, 
  limit, 
  startAfter, 
  orderBy, 
  writeBatch, 
  setDoc, 
  updateDoc, 
  increment,
  onSnapshot,
  Unsubscribe,
  DocumentData,
  QueryConstraint
} from 'firebase/firestore';
import { db } from '../lib/firebase';

/**
 * FIRESTORE QUOTA OPTIMIZER SERVICE
 * Enforces all 6 quota reduction techniques to prevent exceeding Firebase Spark/Blaze free tiers:
 * 1. Offline & Local Storage Cache-First Reading
 * 2. On-Demand Fetching instead of excessive onSnapshot listeners
 * 3. Pagination & Strict Query Limits (default 20 items per page)
 * 4. Aggregated Single-Doc Stats Counters (increment)
 * 5. Batched Writes (writeBatch) & Debounced Updates
 * 6. Hybrid LocalStorage / In-Memory TTL Cache for Static Collections (Branches, Courses)
 */

interface CacheEntry<T> {
  timestamp: number;
  data: T;
}

class FirestoreQuotaOptimizer {
  private inMemoryCache: Map<string, CacheEntry<any>> = new Map();
  private DEFAULT_TTL_MS = 60 * 60 * 1000; // 1 Hour for static reference data
  private debouncedTimers: Map<string, NodeJS.Timeout> = new Map();

  /**
   * --------------------------------------------------------------------------
   * PROPOSAL 1 & 6: HYBRID CACHE & LOCALSTORAGE FOR STATIC DATA (0 READS)
   * --------------------------------------------------------------------------
   */
  async getStaticReferenceData<T>(
    cacheKey: string, 
    fetchFn: () => Promise<T[]>, 
    ttlMs: number = this.DEFAULT_TTL_MS
  ): Promise<T[]> {
    const now = Date.now();

    // 1. Check In-Memory Cache first
    const memEntry = this.inMemoryCache.get(cacheKey);
    if (memEntry && (now - memEntry.timestamp) < ttlMs) {
      console.log(`[QuotaOptimizer] Serving '${cacheKey}' from Memory Cache (0 Firestore Reads)`);
      return memEntry.data as T[];
    }

    // 2. Check LocalStorage Cache
    try {
      const stored = localStorage.getItem(`nagah_cache_${cacheKey}`);
      if (stored) {
        const parsed: CacheEntry<T[]> = JSON.parse(stored);
        if ((now - parsed.timestamp) < ttlMs) {
          this.inMemoryCache.set(cacheKey, parsed);
          console.log(`[QuotaOptimizer] Serving '${cacheKey}' from LocalStorage Cache (0 Firestore Reads)`);
          return parsed.data;
        }
      }
    } catch (e) {
      console.warn(`[QuotaOptimizer] LocalStorage read warning for '${cacheKey}':`, e);
    }

    // 3. Cache expired or missing -> Fetch from Firestore & Cache
    console.log(`[QuotaOptimizer] Cache miss for '${cacheKey}'. Fetching from Firestore...`);
    const freshData = await fetchFn();

    const newEntry: CacheEntry<T[]> = { timestamp: now, data: freshData };
    this.inMemoryCache.set(cacheKey, newEntry);
    try {
      localStorage.setItem(`nagah_cache_${cacheKey}`, JSON.stringify(newEntry));
    } catch {}

    return freshData;
  }

  /** Invalidate local cache for a specific key when updated */
  invalidateCache(cacheKey: string) {
    this.inMemoryCache.delete(cacheKey);
    try {
      localStorage.removeItem(`nagah_cache_${cacheKey}`);
    } catch {}
    console.log(`[QuotaOptimizer] Cache for '${cacheKey}' invalidated.`);
  }

  /**
   * --------------------------------------------------------------------------
   * PROPOSAL 1: CACHE-FIRST FIRESTORE QUERY (FALLBACK TO SERVER)
   * --------------------------------------------------------------------------
   */
  async getCollectionCacheFirst<T>(collectionName: string, queryConstraints: QueryConstraint[] = []): Promise<T[]> {
    const colRef = collection(db, collectionName);
    const q = query(colRef, ...queryConstraints);

    try {
      // Try fetching from local IndexedDB cache first
      const cacheSnapshot = await getDocsFromCache(q);
      if (!cacheSnapshot.empty) {
        console.log(`[QuotaOptimizer] Fetched ${cacheSnapshot.size} '${collectionName}' items from IndexedDB Cache (0 Firestore Reads)`);
        return cacheSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as T);
      }
    } catch (err) {
      // Cache miss or disabled
    }

    // Fallback to server
    try {
      const serverSnapshot = await getDocsFromServer(q);
      console.log(`[QuotaOptimizer] Fetched ${serverSnapshot.size} '${collectionName}' items from Server (${serverSnapshot.size} Firestore Reads)`);
      return serverSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as T);
    } catch (err) {
      console.warn(`[QuotaOptimizer] Failed to fetch '${collectionName}' from server:`, err);
      return [];
    }
  }

  /**
   * --------------------------------------------------------------------------
   * PROPOSAL 3: PAGINATED QUERIES WITH STRICT LIMITS
   * --------------------------------------------------------------------------
   */
  async getPaginatedDocs<T>(
    collectionName: string,
    options: {
      pageSize?: number;
      lastVisibleDoc?: any;
      orderByField?: string;
      orderDirection?: 'asc' | 'desc';
      filters?: { field: string; op: any; value: any }[];
    } = {}
  ): Promise<{ items: T[]; lastDoc: any; hasMore: boolean }> {
    const pageSize = options.pageSize || 20; // Default limit 20 to protect quota
    const constraints: QueryConstraint[] = [];

    if (options.filters) {
      options.filters.forEach(f => {
        constraints.push(where(f.field, f.op, f.value));
      });
    }

    if (options.orderByField) {
      constraints.push(orderBy(options.orderByField, options.orderDirection || 'asc'));
    }

    if (options.lastVisibleDoc) {
      constraints.push(startAfter(options.lastVisibleDoc));
    }

    // Request 1 extra item to test if hasMore
    constraints.push(limit(pageSize + 1));

    const colRef = collection(db, collectionName);
    const q = query(colRef, ...constraints);

    let snapshot;
    try {
      snapshot = await getDocsFromCache(q);
      if (snapshot.empty) {
        snapshot = await getDocs(q);
      }
    } catch {
      snapshot = await getDocs(q);
    }

    const docs = snapshot.docs;
    const hasMore = docs.length > pageSize;
    const resultDocs = hasMore ? docs.slice(0, pageSize) : docs;
    const newLastDoc = resultDocs.length > 0 ? resultDocs[resultDocs.length - 1] : null;

    const items = resultDocs.map(d => ({ id: d.id, ...d.data() }) as T);

    console.log(`[QuotaOptimizer] Paginated query '${collectionName}': loaded ${items.length} items (Quota saved via limit ${pageSize})`);
    return { items, lastDoc: newLastDoc, hasMore };
  }

  /**
   * --------------------------------------------------------------------------
   * PROPOSAL 4: AGGREGATED SINGLE-DOC STATISTICS (1 READ INSTEAD OF N READS)
   * --------------------------------------------------------------------------
   */
  async getAggregatedStats(statsDocId: string = 'center_summary'): Promise<Record<string, number>> {
    const statsRef = doc(db, 'stats', statsDocId);
    try {
      // Try cache first
      const snapCache = await getDocFromCache(statsRef);
      if (snapCache.exists()) {
        console.log(`[QuotaOptimizer] Aggregated stats loaded from Cache (0 Firestore Reads)`);
        return snapCache.data() as Record<string, number>;
      }
    } catch {}

    try {
      const snap = await getDoc(statsRef);
      if (snap.exists()) {
        console.log(`[QuotaOptimizer] Aggregated stats loaded from Server (1 Firestore Read)`);
        return snap.data() as Record<string, number>;
      }
    } catch (e) {
      console.warn(`[QuotaOptimizer] Stats doc not found, returning defaults.`);
    }

    return { totalTrainees: 0, totalGroups: 0, totalCourses: 0, totalRevenue: 0 };
  }

  /** Increment or decrement an aggregated counter doc in 1 write */
  async updateAggregatedStat(field: string, delta: number, statsDocId: string = 'center_summary'): Promise<void> {
    const statsRef = doc(db, 'stats', statsDocId);
    try {
      await setDoc(statsRef, { [field]: increment(delta) }, { merge: true });
      console.log(`[QuotaOptimizer] Updated aggregated stat '${field}' by ${delta}`);
    } catch (e) {
      console.warn(`[QuotaOptimizer] Failed to update stat counter:`, e);
    }
  }

  /**
   * --------------------------------------------------------------------------
   * PROPOSAL 5: BATCHED WRITES (UP TO 500 WRITES IN 1 BATCH REQUEST)
   * --------------------------------------------------------------------------
   */
  async executeBatchOperations(
    operations: {
      type: 'set' | 'update' | 'delete';
      collectionName: string;
      docId: string;
      data?: DocumentData;
    }[]
  ): Promise<{ success: boolean; count: number }> {
    if (operations.length === 0) return { success: true, count: 0 };

    const batch = writeBatch(db);
    let count = 0;

    for (const op of operations) {
      const docRef = doc(db, op.collectionName, op.docId);
      if (op.type === 'set') {
        batch.set(docRef, op.data || {}, { merge: true });
      } else if (op.type === 'update') {
        batch.update(docRef, op.data || {});
      } else if (op.type === 'delete') {
        batch.delete(docRef);
      }
      count++;
    }

    try {
      await batch.commit();
      console.log(`[QuotaOptimizer] Successfully executed Batch Write for ${count} documents in single transaction.`);
      return { success: true, count };
    } catch (err) {
      console.error('[QuotaOptimizer] Batch Write failed:', err);
      return { success: false, count: 0 };
    }
  }

  /**
   * --------------------------------------------------------------------------
   * PROPOSAL 5: DEBOUNCED DOCUMENT UPDATE (PREVENTS TYPING SPAM WRITES)
   * --------------------------------------------------------------------------
   */
  debouncedUpdateDoc(
    collectionName: string, 
    docId: string, 
    data: DocumentData, 
    delayMs: number = 2000
  ): void {
    const key = `${collectionName}_${docId}`;
    if (this.debouncedTimers.has(key)) {
      clearTimeout(this.debouncedTimers.get(key));
    }

    const timer = setTimeout(async () => {
      try {
        const docRef = doc(db, collectionName, docId);
        await setDoc(docRef, data, { merge: true });
        console.log(`[QuotaOptimizer] Debounced write executed for '${key}'`);
      } catch (e) {
        console.warn(`[QuotaOptimizer] Debounced write error for '${key}':`, e);
      } finally {
        this.debouncedTimers.delete(key);
      }
    }, delayMs);

    this.debouncedTimers.set(key, timer);
  }

  /**
   * --------------------------------------------------------------------------
   * PROPOSAL 2: SMART REALTIME LISTENER (DEBOUNCED & UNTRACKED RELEASE)
   * --------------------------------------------------------------------------
   */
  listenWithQuotaControl<T>(
    collectionName: string, 
    callback: (items: T[]) => void, 
    maxItemsLimit: number = 30
  ): Unsubscribe {
    const colRef = collection(db, collectionName);
    const q = query(colRef, limit(maxItemsLimit));

    console.log(`[QuotaOptimizer] Subscribing to '${collectionName}' with limit (${maxItemsLimit})`);
    
    return onSnapshot(q, { includeMetadataChanges: false }, (snapshot) => {
      // Ignore metadata-only changes to save re-renders
      if (snapshot.metadata.hasPendingWrites) return;
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as T);
      callback(items);
    }, (error) => {
      console.warn(`[QuotaOptimizer] Snapshot error on '${collectionName}':`, error);
    });
  }
}

export const quotaOptimizer = new FirestoreQuotaOptimizer();
