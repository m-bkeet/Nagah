import { queryNeon, neonPool } from './dbNeon';

async function main() {
  try {
    console.log('=== AUDITING NEON POSTGRESQL ===');
    const tablesRes = await queryNeon(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    console.log('Total tables in Neon:', tablesRes.rows.length);
    for (const row of tablesRes.rows) {
      const tName = row.table_name;
      const countRes = await queryNeon(`SELECT count(*) FROM "${tName}"`);
      const colsRes = await queryNeon(`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = '${tName}'
        ORDER BY ordinal_position;
      `);
      console.log(`\nTable: [${tName}] (Rows: ${countRes.rows[0].count})`);
      for (const col of colsRes.rows) {
        console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      }
    }
  } catch (err: any) {
    console.error('Audit error:', err);
  } finally {
    await neonPool.end();
    process.exit(0);
  }
}

main();
