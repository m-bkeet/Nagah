import fs from 'fs';
import path from 'path';
import { queryNeon } from './dbNeon.js';

async function runMigration() {
  console.log('[Neon Migration] Starting database migration...');
  
  const schemaPath = path.join(process.cwd(), 'schema_neon_update.sql');
  if (!fs.existsSync(schemaPath)) {
    console.error('[Neon Migration] Error: schema_neon_update.sql not found at:', schemaPath);
    process.exit(1);
  }

  const sqlContent = fs.readFileSync(schemaPath, 'utf8');
  
  try {
    console.log('[Neon Migration] Executing schema statements on Neon PostgreSQL...');
    await queryNeon(sqlContent);
    console.log('[Neon Migration] SUCCESS! All tables and indexes created successfully in Neon DB.');
    
    // Verify tables exist
    const res = await queryNeon(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('[Neon Migration] Verified tables in database:', res.rows.map(r => r.table_name));
    
  } catch (err: any) {
    console.error('[Neon Migration] Failed to execute migration:', err.message);
    process.exit(1);
  }
}

runMigration();
