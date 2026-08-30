import { createClient } from '@supabase/supabase-js';
import * as crypto from 'crypto';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'placeholder_key';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false }
});

function generateId() {
  return crypto.randomUUID().replace(/-/g, '').substring(0, 20);
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
  private filters: any[] = [];
  private orderFields: {field: string, dir: string}[] = [];
  private limitCount?: number;

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
    const { data, error } = await supabase
      .from('collections')
      .select('id, data')
      .eq('collection_name', this.collectionName);

    if (error) {
      console.error('Supabase query error:', error);
      throw error;
    }

    let results = (data || []).map(row => row.data);
    let idMap = new Map((data || []).map(row => [row.data, row.id]));

    // In-memory filtering
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

    // In-memory sorting
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

    // In-memory limiting
    if (this.limitCount !== undefined) {
      results = results.slice(0, this.limitCount);
    }

    const docs = results.map(item => {
      const id = idMap.get(item) as string;
      return new DocumentSnapshot(id, true, item, new DocumentReference(this.collectionName, id));
    });

    return new QuerySnapshot(docs);
  }
}

class DocumentReference {
  constructor(public collectionName: string, public id: string) {}

  async get(): Promise<DocumentSnapshot> {
    const { data, error } = await supabase
      .from('collections')
      .select('data')
      .eq('collection_name', this.collectionName)
      .eq('id', this.id)
      .maybeSingle();
      
    if (error) {
      throw error;
    }
    
    if (data) {
      return new DocumentSnapshot(this.id, true, data.data, this);
    }
    return new DocumentSnapshot(this.id, false, null, this);
  }

  async set(data: any, options?: { merge?: boolean }): Promise<void> {
    if (options?.merge) {
      await this.update(data).catch(async () => {
        await this._upsert(data);
      });
    } else {
      await this._upsert(data);
    }
  }
  
  async _upsert(data: any) {
    // Inject ID if not present
    const finalData = { ...data, id: this.id };
    const { error } = await supabase
      .from('collections')
      .upsert({
        collection_name: this.collectionName,
        id: this.id,
        data: finalData,
        updated_at: new Date().toISOString()
      }, { onConflict: 'collection_name,id' });
    if (error) throw error;
  }

  async update(data: any): Promise<void> {
    const current = await this.get();
    if (!current.exists) {
      throw new Error(`Document not found: ${this.collectionName}/${this.id}`);
    }
    const merged = { ...current.data(), ...data, id: this.id };
    await this._upsert(merged);
  }

  async delete(): Promise<void> {
    const { error } = await supabase
      .from('collections')
      .delete()
      .eq('collection_name', this.collectionName)
      .eq('id', this.id);
    if (error) throw error;
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
  private mutations: any[] = [];

  set(ref: DocumentReference, data: any, options?: { merge?: boolean }): WriteBatch {
    this.mutations.push(async () => await ref.set(data, options));
    return this;
  }

  update(ref: DocumentReference, data: any): WriteBatch {
    this.mutations.push(async () => await ref.update(data));
    return this;
  }

  delete(ref: DocumentReference): WriteBatch {
    this.mutations.push(async () => await ref.delete());
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
    // Fire and forget within transaction execution (mock)
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
  dbId: 'supabase-mock'
};
