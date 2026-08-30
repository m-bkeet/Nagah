import * as fs from 'fs';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';

// Setup Supabase
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'placeholder';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

let dbId = '(default)';
let configProjectId = '';
try {
  const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    if (firebaseConfig.firestoreDatabaseId) {
      dbId = firebaseConfig.firestoreDatabaseId;
    }
    if (firebaseConfig.projectId) {
      configProjectId = firebaseConfig.projectId;
    }
  }
} catch (e) {}

const projectId = (process.env.FIREBASE_PROJECT_ID ? process.env.FIREBASE_PROJECT_ID.replace(/^"|"$/g, '').trim() : undefined) || configProjectId || undefined;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL ? process.env.FIREBASE_CLIENT_EMAIL.replace(/^"|"$/g, '').trim() : undefined;
const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY;
let privateKey: string | undefined = undefined;

if (rawPrivateKey) {
  let cleaned = rawPrivateKey.trim();
  while ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.slice(1, -1).trim();
  }
  cleaned = cleaned.replace(/\\n/g, '\n');
  cleaned = cleaned.replace(/\\\\n/g, '\n');
  privateKey = cleaned;
}

const COLLECTIONS = [
  'trainees', 'trainers', 'branches', 'courses', 'groups', 
  'attendance', 'payments', 'expenses', 'certificates', 
  'certificateTemplates', 'pointRules', 'pointTransactions', 
  'exams', 'questions', 'examResults', 'users', 'auditLogs', 
  'settings', 'counters', 'system', 'language_profiles', 
  'language_activities', 'language_submissions'
];

async function migrate() {
  console.log('Starting Migration from Firebase to Supabase...');
  let totalMigrated = 0;
  
  for (const collectionName of COLLECTIONS) {
    console.log(`\nMigrating collection: ${collectionName}...`);
    try {
      const snap = await firestore.collection(collectionName).get();
      if (snap.empty) {
        console.log(`  -> Empty (0 documents)`);
        continue;
      }
      
      console.log(`  -> Found ${snap.size} documents`);
      let batchCount = 0;
      for (const doc of snap.docs) {
        const data = doc.data();
        const id = doc.id;
        
        // Write to Supabase
        const finalData = { ...data, id };
        const { error } = await supabase
          .from('collections')
          .upsert({
            collection_name: collectionName,
            id: id,
            data: finalData,
            updated_at: new Date().toISOString()
          }, { onConflict: 'collection_name,id' });
          
        if (error) {
          console.error(`  -> ERROR migrating doc ${id}:`, error.message);
        } else {
          batchCount++;
          totalMigrated++;
        }
      }
      console.log(`  -> Successfully migrated ${batchCount} documents.`);
    } catch (err: any) {
      console.error(`  -> Failed to fetch collection ${collectionName}:`, err.message);
    }
  }
  
  console.log(`\n✅ Migration Complete! Total documents moved: ${totalMigrated}`);
}

migrate().catch(console.error);
