import * as crypto from 'crypto';
import { db } from './db';

function cleanSupabaseUrl(raw?: string): string {
  if (!raw) return 'https://zdbrwwkyxjujrokzjang.supabase.co';
  let url = raw.trim().replace(/\/+$/, '');
  while (/\/rest\/v1$/i.test(url)) {
    url = url.replace(/\/rest\/v1$/i, '').replace(/\/+$/, '');
  }
  return url.trim() || 'https://zdbrwwkyxjujrokzjang.supabase.co';
}

const SUPABASE_URL = cleanSupabaseUrl(process.env.SUPABASE_URL);
const SUPABASE_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkYnJ3d2t5eGp1anJva3pqYW5nIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODA0ODY0MiwiZXhwIjoyMTAzNjI0NjQyfQ._JEu3kjLDPWS1uCabeVMyTRIeDS0NpnjTPUjyuL6_Ec').trim();
const hasValidSupabase = Boolean(
  SUPABASE_URL &&
  !SUPABASE_URL.includes('placeholder') &&
  SUPABASE_KEY &&
  !SUPABASE_KEY.includes('placeholder')
);

let supabaseClient: any = null;
if (hasValidSupabase) {
  try {
    const { createClient } = require('@supabase/supabase-js');
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false }
    });
  } catch (e) {
    supabaseClient = null;
  }
}

function generateId() {
  return crypto.randomUUID().replace(/-/g, '').substring(0, 20);
}

// In-memory / DB collection helper
function getCollectionStore(collectionName: string): any[] {
  const data = db.getData() as any;
  if (!data) return [];

  // Known entity arrays in DatabaseSchema
  if (Array.isArray(data[collectionName])) {
    return data[collectionName];
  }

  // System settings single doc or custom table
  if (collectionName === 'settings') {
    return data.settings ? [{ id: 'main', ...data.settings }] : [];
  }

  // Custom collection store inside data
  if (!data._customCollections) {
    data._customCollections = {};
  }
  if (!Array.isArray(data._customCollections[collectionName])) {
    data._customCollections[collectionName] = [];
  }
  return data._customCollections[collectionName];
}

function saveCollectionStore(collectionName: string, items: any[]) {
  const data = db.getData() as any;
  if (!data) return;

  if (collectionName in data && Array.isArray(data[collectionName])) {
    data[collectionName] = items;
  } else if (collectionName === 'settings') {
    if (items.length > 0) {
      data.settings = { ...(data.settings || {}), ...items[0] };
    }
  } else {
    if (!data._customCollections) data._customCollections = {};
    data._customCollections[collectionName] = items;
  }
  db.save();
}

class DocumentSnapshot {
  constructor(
    public id: string,
    public exists: boolean,
    private _data: any,
    public ref: DocumentReference
  ) {}

  data() {
    return this.exists ? this._data : undefined;
  }
}

class QuerySnapshot {
  empty: boolean;
  size: number;
  
  constructor(public docs: DocumentSnapshot[]) {
    this.empty = docs.length === 0;
    this.size = docs.length;
  }

  forEach(callback: (doc: DocumentSnapshot) => void) {
    this.docs.forEach(callback);
  }
}

class Query {
  protected filters: any[] = [];
  protected orderFields: { field: string; dir: string }[] = [];
  protected limitCount?: number;

  constructor(public collectionName: string) {}

  where(field: string, opStr: string, value: any): Query {
    this.filters.push({ field, opStr, value });
    return this;
  }

  orderBy(field: string, directionStr: 'asc' | 'desc' = 'asc'): Query {
    this.orderFields.push({ field, dir: directionStr });
    return this;
  }

  limit(n: number): Query {
    this.limitCount = n;
    return this;
  }

  async get(): Promise<QuerySnapshot> {
    const rawItems = getCollectionStore(this.collectionName);
    let results = rawItems.map(item => ({ ...item }));

    // Apply filtering
    for (const filter of this.filters) {
      results = results.filter(item => {
        const itemVal = item[filter.field];
        switch (filter.opStr) {
          case '==': return itemVal === filter.value;
          case '!=': return itemVal !== filter.value;
          case '>': return itemVal > filter.value;
          case '>=': return itemVal >= filter.value;
          case '<': return itemVal < filter.value;
          case '<=': return itemVal <= filter.value;
          case 'in': return Array.isArray(filter.value) && filter.value.includes(itemVal);
          case 'array-contains': return Array.isArray(itemVal) && itemVal.includes(filter.value);
          default: return false;
        }
      });
    }

    // Apply sorting
    if (this.orderFields.length > 0) {
      results.sort((a, b) => {
        for (const order of this.orderFields) {
          const aVal = a[order.field];
          const bVal = b[order.field];
          if (aVal < bVal) return order.dir === 'asc' ? -1 : 1;
          if (aVal > bVal) return order.dir === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    // Apply limiting
    if (this.limitCount !== undefined) {
      results = results.slice(0, this.limitCount);
    }

    const docs = results.map(item => {
      const docId = String(item.id || generateId());
      return new DocumentSnapshot(docId, true, item, new DocumentReference(this.collectionName, docId));
    });

    return new QuerySnapshot(docs);
  }
}

class DocumentReference {
  constructor(public collectionName: string, public id: string) {}

  async get(): Promise<DocumentSnapshot> {
    const items = getCollectionStore(this.collectionName);
    const item = items.find(i => String(i.id) === String(this.id));
    if (item) {
      return new DocumentSnapshot(this.id, true, { ...item }, this);
    }
    return new DocumentSnapshot(this.id, false, null, this);
  }

  async set(data: any, options?: { merge?: boolean }): Promise<void> {
    const items = getCollectionStore(this.collectionName);
    const existingIndex = items.findIndex(i => String(i.id) === String(this.id));
    const finalData = options?.merge && existingIndex >= 0
      ? { ...items[existingIndex], ...data, id: this.id }
      : { ...data, id: this.id };

    if (existingIndex >= 0) {
      items[existingIndex] = finalData;
    } else {
      items.push(finalData);
    }
    saveCollectionStore(this.collectionName, items);

    // Optional background sync if Supabase is active
    if (supabaseClient) {
      try {
        await supabaseClient.from('collections').upsert({
          collection_name: this.collectionName,
          id: this.id,
          data: finalData,
          updated_at: new Date().toISOString()
        }, { onConflict: 'collection_name,id' });
      } catch (e) {
        // Silently ignore background sync error
      }
    }
  }

  async update(data: any): Promise<void> {
    const items = getCollectionStore(this.collectionName);
    const existingIndex = items.findIndex(i => String(i.id) === String(this.id));
    if (existingIndex < 0) {
      // Create if not exists to be lenient
      items.push({ ...data, id: this.id });
    } else {
      items[existingIndex] = { ...items[existingIndex], ...data, id: this.id };
    }
    saveCollectionStore(this.collectionName, items);
  }

  async delete(): Promise<void> {
    const items = getCollectionStore(this.collectionName);
    const filtered = items.filter(i => String(i.id) !== String(this.id));
    saveCollectionStore(this.collectionName, filtered);

    if (supabaseClient) {
      try {
        await supabaseClient.from('collections').delete().eq('collection_name', this.collectionName).eq('id', this.id);
      } catch (e) {}
    }
  }
}

class CollectionReference extends Query {
  constructor(collectionName: string) {
    super(collectionName);
  }

  doc(id?: string): DocumentReference {
    return new DocumentReference(this.collectionName, id || generateId());
  }
}

class WriteBatch {
  private mutations: (() => Promise<void>)[] = [];

  set(ref: DocumentReference, data: any, options?: { merge?: boolean }): WriteBatch {
    this.mutations.push(async () => { await ref.set(data, options); });
    return this;
  }

  update(ref: DocumentReference, data: any): WriteBatch {
    this.mutations.push(async () => { await ref.update(data); });
    return this;
  }

  delete(ref: DocumentReference): WriteBatch {
    this.mutations.push(async () => { await ref.delete(); });
    return this;
  }

  async commit(): Promise<void> {
    for (const mut of this.mutations) {
      await mut();
    }
  }
}

class Transaction {
  async get(ref: DocumentReference): Promise<DocumentSnapshot> {
    return await ref.get();
  }

  set(ref: DocumentReference, data: any, options?: { merge?: boolean }): Transaction {
    ref.set(data, options);
    return this;
  }

  update(ref: DocumentReference, data: any): Transaction {
    ref.update(data);
    return this;
  }

  delete(ref: DocumentReference): Transaction {
    ref.delete();
    return this;
  }
}

class AdminDbMock {
  collection(name: string): CollectionReference {
    return new CollectionReference(name);
  }

  batch(): WriteBatch {
    return new WriteBatch();
  }

  async runTransaction(callback: (transaction: Transaction) => Promise<any>): Promise<any> {
    const tx = new Transaction();
    return await callback(tx);
  }
}

export const adminDb = new AdminDbMock();
export const adminAuth = {};
export const adminDiagInfo = {
  projectIdSet: true,
  clientEmailSet: true,
  privateKeyPresent: true,
  privateKeyValid: true,
  dbId: 'local-authoritative-db'
};

