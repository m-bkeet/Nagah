import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY || '';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false }
});

export const db = supabase; // dummy for backwards compat with those that import { db }

export function collection(db: any, name: string) {
  return { type: 'collection', name };
}

export function doc(db: any, collectionName: string, id?: string) {
  if (typeof collectionName === 'object' && (collectionName as any).type === 'collection') {
    return { type: 'doc', collectionName: (collectionName as any).name, id: id || crypto.randomUUID().replace(/-/g,'').substring(0,20) };
  }
  return { type: 'doc', collectionName, id: id || crypto.randomUUID().replace(/-/g,'').substring(0,20) };
}

export async function setDoc(docRef: any, data: any, options?: any) {
  const finalData = { ...data, id: docRef.id };
  const { error } = await supabase
    .from('collections')
    .upsert({
      collection_name: docRef.collectionName,
      id: docRef.id,
      data: finalData,
      updated_at: new Date().toISOString()
    }, { onConflict: 'collection_name,id' });
  if (error) console.error('Supabase setDoc error:', error);
}

export async function getDoc(docRef: any) {
  const { data, error } = await supabase
    .from('collections')
    .select('data')
    .eq('collection_name', docRef.collectionName)
    .eq('id', docRef.id)
    .maybeSingle();

  if (error || !data) {
    return { id: docRef.id, exists: () => false, data: () => undefined };
  }
  return { id: docRef.id, exists: () => true, data: () => data.data };
}

export function query(collectionRef: any, ...constraints: any[]) {
  return { type: 'query', collectionName: collectionRef.name, constraints };
}

export function where(field: string, op: string, value: any) {
  return { type: 'where', field, op, value };
}

export function orderBy(field: string, dir: string = 'asc') {
  return { type: 'orderBy', field, dir };
}

export function limit(n: number) {
  return { type: 'limit', n };
}

export async function getDocs(queryRef: any) {
  const cName = queryRef.type === 'collection' ? queryRef.name : queryRef.collectionName;
  const { data, error } = await supabase
    .from('collections')
    .select('id, data')
    .eq('collection_name', cName);

  if (error) {
    console.error('Supabase getDocs error:', error);
    return { forEach: () => {} };
  }

  let results = (data || []).map(row => row.data);
  let idMap = new Map((data || []).map(row => [row.data, row.id]));

  if (queryRef.constraints) {
    for (const c of queryRef.constraints) {
      if (c.type === 'where') {
        results = results.filter(item => {
          const v = item[c.field];
          switch(c.op) {
            case '==': return v === c.value;
            case '!=': return v !== c.value;
            case '>': return v > c.value;
            case '<': return v < c.value;
            case '>=': return v >= c.value;
            case '<=': return v <= c.value;
            case 'in': return Array.isArray(c.value) && c.value.includes(v);
            case 'array-contains': return Array.isArray(v) && v.includes(c.value);
            default: return false;
          }
        });
      }
    }
    
    // Sort
    const orderConstraints = queryRef.constraints.filter((c:any) => c.type === 'orderBy');
    if (orderConstraints.length > 0) {
      results.sort((a, b) => {
        for (const order of orderConstraints) {
          const aVal = a[order.field];
          const bVal = b[order.field];
          if (aVal < bVal) return order.dir === 'asc' ? -1 : 1;
          if (aVal > bVal) return order.dir === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    const limitConstraint = queryRef.constraints.find((c:any) => c.type === 'limit');
    if (limitConstraint) {
      results = results.slice(0, limitConstraint.n);
    }
  }

  const docs = results.map(item => ({
    id: idMap.get(item) as string,
    data: () => item
  }));

  return {
    forEach: (cb: any) => docs.forEach(cb),
    docs
  };
}

export async function deleteDoc(docRef: any) {
  const { error } = await supabase
    .from('collections')
    .delete()
    .eq('collection_name', docRef.collectionName)
    .eq('id', docRef.id);
  if (error) console.error('Supabase deleteDoc error:', error);
}

export async function updateDoc(docRef: any, updateData: any) {
  const current = await getDoc(docRef);
  if (!current.exists()) return;
  const merged = { ...current.data(), ...updateData };
  await setDoc(docRef, merged);
}

export function onSnapshot(queryRef: any, onNext: any, onError?: any) {
  const cName = queryRef.type === 'collection' ? queryRef.name : queryRef.collectionName;
  
  // Initial fetch
  getDocs(queryRef).then(snapshot => {
    onNext(snapshot);
  }).catch(err => {
    if (onError) onError(err);
  });

  // Subscribe to realtime updates
  const channel = supabase.channel(`public:collections:${cName}`)
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public', 
      table: 'collections', 
      filter: `collection_name=eq.${cName}` 
    }, payload => {
      // Very naive: re-fetch entirely and trigger callback 
      // (This guarantees filtering/sorting is applied easily without re-implementing client side state machines)
      getDocs(queryRef).then(snapshot => {
        onNext(snapshot);
      }).catch(err => {
        if (onError) onError(err);
      });
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export type Unsubscribe = () => void;
export type CollectionReference = any;
export class Timestamp {
  static now() { return new Timestamp(); }
  toMillis() { return Date.now(); }
  toDate() { return new Date(); }
}
export const auth = {} as any;
export const storage = {} as any;
export default supabase;
