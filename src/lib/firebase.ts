import { createClient } from '@supabase/supabase-js';

function cleanSupabaseUrl(raw?: string): string {
  if (!raw) return 'https://zdbrwwkyxjujrokzjang.supabase.co';
  let url = raw.trim().replace(/\/+$/, '');
  while (/\/rest\/v1$/i.test(url)) {
    url = url.replace(/\/rest\/v1$/i, '').replace(/\/+$/, '');
  }
  return url.trim() || 'https://zdbrwwkyxjujrokzjang.supabase.co';
}

const rawUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const SUPABASE_URL = rawUrl ? cleanSupabaseUrl(rawUrl) : 'https://zdbrwwkyxjujrokzjang.supabase.co';
const SUPABASE_KEY = (import.meta.env.VITE_SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkYnJ3d2t5eGp1anJva3pqYW5nIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODA0ODY0MiwiZXhwIjoyMTAzNjI0NjQyfQ._JEu3kjLDPWS1uCabeVMyTRIeDS0NpnjTPUjyuL6_Ec').trim();
const hasValidSupabase = Boolean(
  SUPABASE_URL &&
  !SUPABASE_URL.includes('placeholder') &&
  SUPABASE_KEY &&
  !SUPABASE_KEY.includes('placeholder')
);

export const supabase = hasValidSupabase
  ? createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } })
  : ({
      from: () => ({
        select: () => ({
          eq: () => ({
            eq: () => ({ maybeSingle: async () => ({ data: null, error: null }) }),
            maybeSingle: async () => ({ data: null, error: null }),
            then: (cb: any) => cb({ data: [], error: null })
          }),
          then: (cb: any) => cb({ data: [], error: null })
        }),
        upsert: async () => ({ data: null, error: null }),
        delete: () => ({
          eq: () => ({ eq: async () => ({ data: null, error: null }) })
        })
      }),
      channel: () => ({
        on: () => ({ subscribe: () => ({}) }),
        subscribe: () => ({})
      }),
      removeChannel: () => {}
    } as any);

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
  if (!hasValidSupabase) return;
  try {
    const finalData = { ...data, id: docRef.id };
    await supabase
      .from('collections')
      .upsert({
        collection_name: docRef.collectionName,
        id: docRef.id,
        data: finalData,
        updated_at: new Date().toISOString()
      }, { onConflict: 'collection_name,id' });
  } catch (e) {
    // Silently ignore
  }
}

export async function getDoc(docRef: any) {
  if (!hasValidSupabase) {
    return { id: docRef.id, exists: () => false, data: () => undefined };
  }
  try {
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
  } catch (e) {
    return { id: docRef.id, exists: () => false, data: () => undefined };
  }
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
  if (!hasValidSupabase) {
    return { forEach: () => {}, docs: [] };
  }
  const cName = queryRef.type === 'collection' ? queryRef.name : queryRef.collectionName;
  try {
    const { data, error } = await supabase
      .from('collections')
      .select('id, data')
      .eq('collection_name', cName);

    if (error) {
      return { forEach: () => {}, docs: [] };
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
  } catch (e) {
    return { forEach: () => {}, docs: [] };
  }
}

export async function deleteDoc(docRef: any) {
  if (!hasValidSupabase) return;
  try {
    await supabase
      .from('collections')
      .delete()
      .eq('collection_name', docRef.collectionName)
      .eq('id', docRef.id);
  } catch (e) {}
}

export async function updateDoc(docRef: any, updateData: any) {
  const current = await getDoc(docRef);
  if (!current.exists()) return;
  const merged = { ...current.data(), ...updateData };
  await setDoc(docRef, merged);
}

export function onSnapshot(queryRef: any, onNext: any, onError?: any) {
  if (!hasValidSupabase) {
    onNext({ forEach: () => {}, docs: [] });
    return () => {};
  }
  const cName = queryRef.type === 'collection' ? queryRef.name : queryRef.collectionName;
  
  // Initial fetch
  getDocs(queryRef).then(snapshot => {
    onNext(snapshot);
  }).catch(err => {
    if (onError) onError(err);
  });

  // Subscribe to realtime updates
  try {
    const channel = supabase.channel(`public:collections:${cName}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'collections', 
        filter: `collection_name=eq.${cName}` 
      }, payload => {
        getDocs(queryRef).then(snapshot => {
          onNext(snapshot);
        }).catch(err => {
          if (onError) onError(err);
        });
      })
      .subscribe();

    return () => {
      try {
        supabase.removeChannel(channel);
      } catch (e) {}
    };
  } catch (e) {
    return () => {};
  }
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

