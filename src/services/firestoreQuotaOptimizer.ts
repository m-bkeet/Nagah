/**
 * FIRESTORE QUOTA OPTIMIZER & CLIENT CACHE SERVICE
 * Keeps static reference data cached in memory + localStorage with zero direct client Firestore SDK connections.
 * All authoritative cloud writes & compact delta syncs run exclusively through the backend API.
 */

export type Unsubscribe = () => void;

interface CacheEntry<T> {
  timestamp: number;
  data: T;
}

class FirestoreQuotaOptimizer {
  private inMemoryCache: Map<string, CacheEntry<any>> = new Map();
  private DEFAULT_TTL_MS = 60 * 60 * 1000; // 1 Hour for static reference data
  private quotaExceeded = false;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('unhandledrejection', (event) => {
        const msg = event.reason?.message || String(event.reason);
        if (msg.includes('RESOURCE_EXHAUSTED') || msg.includes('Quota limit exceeded') || event.reason?.code === 'resource-exhausted') {
          event.preventDefault();
          this.quotaExceeded = true;
        }
      });
      window.addEventListener('error', (event) => {
        const msg = event.message || String(event.error);
        if (msg.includes('RESOURCE_EXHAUSTED') || msg.includes('Quota limit exceeded')) {
          event.preventDefault();
          this.quotaExceeded = true;
        }
      });
    }
  }

  public isQuotaExceeded(): boolean {
    return this.quotaExceeded;
  }

  async getStaticReferenceData<T>(
    cacheKey: string,
    fetchFn: () => Promise<T[]>,
    ttlMs: number = this.DEFAULT_TTL_MS
  ): Promise<T[]> {
    const now = Date.now();

    const memEntry = this.inMemoryCache.get(cacheKey);
    if (memEntry && (now - memEntry.timestamp) < ttlMs) {
      return memEntry.data as T[];
    }

    try {
      const stored = localStorage.getItem(`nagah_cache_${cacheKey}`);
      if (stored) {
        const parsed: CacheEntry<T[]> = JSON.parse(stored);
        if ((now - parsed.timestamp) < ttlMs) {
          this.inMemoryCache.set(cacheKey, parsed);
          return parsed.data;
        }
      }
    } catch {}

    const freshData = await fetchFn();
    const newEntry: CacheEntry<T[]> = { timestamp: now, data: freshData };
    this.inMemoryCache.set(cacheKey, newEntry);
    try {
      localStorage.setItem(`nagah_cache_${cacheKey}`, JSON.stringify(newEntry));
    } catch {}

    return freshData;
  }

  invalidateCache(cacheKey: string) {
    this.inMemoryCache.delete(cacheKey);
    try {
      localStorage.removeItem(`nagah_cache_${cacheKey}`);
    } catch {}
  }

  // Compatibility shims: zero direct client-side Firestore sockets/reads/writes
  async getCollectionCacheFirst<T>(_collectionName: string, _queryConstraints: any[] = []): Promise<T[]> {
    return [];
  }

  async getPaginatedDocs<T>(_collectionName: string, _options: any = {}): Promise<{ items: T[]; lastDoc: any; hasMore: boolean }> {
    return { items: [], lastDoc: null, hasMore: false };
  }

  async getAggregatedStats(_statsDocId: string = 'center_summary'): Promise<Record<string, number>> {
    return { totalTrainees: 0, totalGroups: 0, totalCourses: 0, totalRevenue: 0 };
  }

  async updateAggregatedStat(_field: string, _delta: number, _statsDocId: string = 'center_summary'): Promise<void> {
    return;
  }

  async executeBatchOperations(_operations: any[]): Promise<{ success: boolean; count: number }> {
    return { success: true, count: 0 };
  }

  debouncedUpdateDoc(_collectionName: string, _docId: string, _data: any, _delayMs: number = 2000): void {
    return;
  }

  listenWithQuotaControl<T>(
    _collectionName: string,
    _callback: (items: T[]) => void,
    _maxItemsLimit: number = 30
  ): Unsubscribe {
    return () => {};
  }
}

export const quotaOptimizer = new FirestoreQuotaOptimizer();
