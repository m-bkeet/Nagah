/**
 * Resilient Offline & Synchronization Service
 * Provides Offline-First storage, an automatic Sync Queue, and Auto-Failover mechanisms.
 */

export interface SyncAction {
  id: string;
  url: string;
  method: 'POST' | 'PUT' | 'DELETE';
  body: any;
  timestamp: number;
  description: string;
}

class ResilientOfflineService {
  private syncQueueKey = 'nagah_sync_queue';
  private studentCacheKey = 'nagah_student_cache';
  private parentCacheKey = 'nagah_parent_cache';
  private trainerCacheKey = 'nagah_trainer_cache';
  private isProcessingQueue = false;

  // Servers for failover mechanism (Auto-Failover)
  private apiServers = [
    '/api' // Primary main server path
  ];
  private currentServerIndex = 0;

  constructor() {
    // Register network change listeners
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleNetworkRecovery());
      window.addEventListener('offline', () => this.dispatchConnectionEvent(false));
    }
  }

  // Retrieve active base URL
  public getActiveServerUrl(): string {
    return this.apiServers[this.currentServerIndex];
  }

  // Trigger failover to the next available server
  public triggerFailover() {
    this.currentServerIndex = (this.currentServerIndex + 1) % this.apiServers.length;
    console.warn(`[Resilient Architecture] Primary server failed. Switching to Failover Server: ${this.getActiveServerUrl()}`);
    this.dispatchFailoverEvent();
  }

  // Robust Fetch with Auto-Failover
  public async fetchWithFailover(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const isRelative = endpoint.startsWith('/');
    let attempts = 0;
    const maxAttempts = this.apiServers.length;

    while (attempts < maxAttempts) {
      const base = isRelative ? this.getActiveServerUrl() : '';
      const fullUrl = isRelative ? `${base}${endpoint}` : endpoint;

      try {
        const response = await fetch(fullUrl, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {})
          }
        });

        // If server returns a bad status code indicating server failure (500+), try failover
        if (response.status >= 502 && response.status <= 504) {
          throw new Error(`Server error ${response.status}`);
        }

        return response;
      } catch (error) {
        attempts++;
        console.error(`[Resilient Architecture] Fetch failed on server index ${this.currentServerIndex} for ${endpoint}:`, error);
        
        if (attempts < maxAttempts) {
          this.triggerFailover();
        } else {
          // If all failover servers failed, check if we should operate purely in Offline-First mode
          this.dispatchConnectionEvent(false);
          throw new Error('جميع السيرفرات البديلة والأساسية غير متاحة حالياً، تم تفعيل وضع الطوارئ المحلي.');
        }
      }
    }
    throw new Error('خطأ غير متوقع في جلب البيانات');
  }

  // Cache data locally
  public saveToCache(key: 'student' | 'parent' | 'trainer', data: any) {
    if (typeof window === 'undefined') return;
    const cacheKey = key === 'student' ? this.studentCacheKey : key === 'parent' ? this.parentCacheKey : this.trainerCacheKey;
    localStorage.setItem(cacheKey, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
    console.log(`[Offline-First] Successfully cached ${key} data locally for offline usage.`);
  }

  // Retrieve local cache
  public getFromCache(key: 'student' | 'parent' | 'trainer'): any | null {
    if (typeof window === 'undefined') return null;
    const cacheKey = key === 'student' ? this.studentCacheKey : key === 'parent' ? this.parentCacheKey : this.trainerCacheKey;
    const cached = localStorage.getItem(cacheKey);
    if (!cached) return null;
    try {
      const parsed = JSON.parse(cached);
      return parsed.data;
    } catch {
      return null;
    }
  }

  // Enqueue a user action if offline
  public enqueueAction(action: Omit<SyncAction, 'id' | 'timestamp'>) {
    if (typeof window === 'undefined') return;
    const queue = this.getQueue();
    const newAction: SyncAction = {
      ...action,
      id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: Date.now()
    };
    queue.push(newAction);
    localStorage.setItem(this.syncQueueKey, JSON.stringify(queue));
    
    // Dispatch event to update the UI banner with queue count
    this.dispatchQueueUpdatedEvent(queue.length);
    console.log(`[Sync Queue] Action enqueued: ${action.description}. Total queue size: ${queue.length}`);
  }

  // Get current sync queue
  public getQueue(): SyncAction[] {
    if (typeof window === 'undefined') return [];
    const queueStr = localStorage.getItem(this.syncQueueKey);
    if (!queueStr) return [];
    try {
      return JSON.parse(queueStr);
    } catch {
      return [];
    }
  }

  // Flush sync queue to primary/failover server
  public async processSyncQueue(): Promise<{ success: boolean; syncedCount: number }> {
    if (this.isProcessingQueue) return { success: false, syncedCount: 0 };
    const queue = this.getQueue();
    if (queue.length === 0) return { success: true, syncedCount: 0 };

    this.isProcessingQueue = true;
    console.log(`[Sync Queue] Starting auto-synchronization for ${queue.length} pending offline actions...`);
    
    const remainingQueue: SyncAction[] = [];
    let syncedCount = 0;

    for (const action of queue) {
      try {
        const response = await fetch(`${this.apiServers[0]}${action.url}`, {
          method: action.method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(action.body)
        });

        if (response.ok) {
          syncedCount++;
          console.log(`[Sync Queue] Synced successfully: ${action.description}`);
        } else {
          // If server rejected (4xx), don't retry forever, drop or log
          console.error(`[Sync Queue] Sync failed with status ${response.status} for: ${action.description}. Dropping.`);
        }
      } catch (err) {
        // If network request failed, keep remaining actions in queue and stop processing
        console.warn(`[Sync Queue] Network error while syncing: ${action.description}. Pausing sync process.`);
        remainingQueue.push(action, ...queue.slice(queue.indexOf(action) + 1));
        break;
      }
    }

    localStorage.setItem(this.syncQueueKey, JSON.stringify(remainingQueue));
    this.isProcessingQueue = false;
    this.dispatchQueueUpdatedEvent(remainingQueue.length);

    return {
      success: remainingQueue.length === 0,
      syncedCount
    };
  }

  // Network Recovery Handler
  private async handleNetworkRecovery() {
    this.dispatchConnectionEvent(true);
    const result = await this.processSyncQueue();
    if (result.syncedCount > 0) {
      // Dispatch a notification callback or event
      const syncBanner = document.getElementById('sync-status-banner');
      if (syncBanner) {
        syncBanner.innerHTML = `✅ تم مزامنة ${result.syncedCount} عملية معلقة بنجاح!`;
        setTimeout(() => {
          syncBanner.style.display = 'none';
        }, 4000);
      }
    }
  }

  // Event Dispatchers for React integration
  private dispatchConnectionEvent(isOnline: boolean) {
    if (typeof window === 'undefined') return;
    const event = new CustomEvent('nagah_network_status', { detail: { isOnline } });
    window.dispatchEvent(event);
  }

  private dispatchQueueUpdatedEvent(count: number) {
    if (typeof window === 'undefined') return;
    const event = new CustomEvent('nagah_queue_updated', { detail: { count } });
    window.dispatchEvent(event);
  }

  private dispatchFailoverEvent() {
    if (typeof window === 'undefined') return;
    const event = new CustomEvent('nagah_failover_active', { detail: { server: this.getActiveServerUrl() } });
    window.dispatchEvent(event);
  }
}

export const resilientOfflineService = new ResilientOfflineService();
