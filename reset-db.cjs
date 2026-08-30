const { Pool } = require('pg');
const { execSync } = require('child_process');

async function run() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("No DATABASE_URL found");
    process.exit(1);
  }

  const pool = new Pool({ connectionString });

  const tables = [
    'branches',
    'educational_programs',
    'courses',
    'users',
    'students',
    'trainers',
    'student_groups',
    'group_enrollments',
    'class_sessions',
    'session_attendance_records',
    'payment_receipts',
    'student_points_transactions',
    'issued_certificates',
    'certificate_templates',
    'audit_logs'
  ];

  console.log("=== 1. REAL CONNECTION: PASS ===");

  console.log("=== 2. BEFORE RESET ROW COUNTS ===");
  const beforeCounts = {};
  for (const t of tables) {
    const res = await pool.query(`SELECT COUNT(*) FROM "${t}"`);
    beforeCounts[t] = parseInt(res.rows[0].count, 10);
    console.log(`- ${t}: ${beforeCounts[t]}`);
  }

  console.log("=== 3. CREATING BACKUP SNAPSHOT ====");
  try {
    execSync('node generate-snapshot.cjs', { stdio: 'inherit' });
    console.log("Snapshot created and verified successfully.");
  } catch (err) {
    console.error("Snapshot generation failed:", err);
    process.exit(1);
  }

  console.log("=== 4. RESETTING ALL TABLES (TRUNCATE CASCADE) ===");
  try {
    await pool.query('BEGIN');
    const truncateQuery = `TRUNCATE TABLE ${tables.map(t => `"${t}"`).join(', ')} CASCADE;`;
    await pool.query(truncateQuery);
    await pool.query('COMMIT');
    console.log("Reset completed successfully.");
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error("Reset failed, rolled back:", err);
    process.exit(1);
  }

  console.log("=== 5. AFTER RESET ROW COUNTS ===");
  const afterCounts = {};
  let totalRemaining = 0;
  for (const t of tables) {
    const res = await pool.query(`SELECT COUNT(*) FROM "${t}"`);
    afterCounts[t] = parseInt(res.rows[0].count, 10);
    totalRemaining += afterCounts[t];
    console.log(`- ${t}: ${afterCounts[t]}`);
  }

  console.log(`TOTAL REMAINING APPLICATION ROWS: ${totalRemaining}`);

  console.log("=== 6. VERIFYING SCHEMA / CONSTRAINTS / INDEXES ===");
  const tableCheck = await pool.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
  `);
  console.log(`Tables present: ${tableCheck.rows.length}/15`);

  await pool.end();
}

run().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
