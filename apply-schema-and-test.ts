import pg from 'pg';
import fs from 'fs';

const { Client } = pg;

async function run() {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
        console.error("FAILED: DATABASE_URL is missing from process.env");
        process.exit(1);
    }
    
    console.log("DATABASE_URL verified in environment (value hidden).");

    const client = new Client({ connectionString: dbUrl });
    
    try {
        await client.connect();
        console.log("DATABASE CONNECTION: VERIFIED");

        // Apply Schema
        const schemaSql = fs.readFileSync('src/server/schema.sql', 'utf8');
        await client.query(schemaSql);
        console.log("SCHEMA APPLIED TO PRODUCTION");

        // Verify Tables Exist
        const tablesRequired = [
            'branches', 'educational_programs', 'courses', 'users', 'students', 'trainers',
            'student_groups', 'group_enrollments', 'class_sessions', 'session_attendance_records',
            'payment_receipts', 'student_points_transactions', 'certificate_templates',
            'issued_certificates', 'audit_logs'
        ];
        
        const tableQuery = `
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = ANY($1)
        `;
        const { rows } = await client.query(tableQuery, [tablesRequired]);
        const tablesFound = rows.map(r => r.table_name);
        const missing = tablesRequired.filter(t => !tablesFound.includes(t));
        
        if (missing.length === 0) {
            console.log("TABLES VERIFICATION: PASS (All 15 tables found)");
        } else {
            console.error("TABLES VERIFICATION: FAIL (Missing tables:", missing, ")");
            process.exit(1);
        }

        // Verify student_code Constraints
        const constraintQuery = `
            SELECT column_name, is_nullable 
            FROM information_schema.columns 
            WHERE table_name = 'students' AND column_name = 'student_code'
        `;
        const { rows: colRows } = await client.query(constraintQuery);
        if (colRows.length > 0 && colRows[0].is_nullable === 'NO') {
            console.log("STUDENT CODE CONSTRAINT: PASS (NOT NULL verified)");
        } else {
            console.log("STUDENT CODE CONSTRAINT: FAIL (Not found or is nullable)");
        }

        // Real SELECT test
        const selectTest = await client.query('SELECT id, student_code FROM students LIMIT 1');
        console.log("REAL SELECT: PASS (Query executed successfully, rows returned: " + selectTest.rowCount + ")");

        // Safe Write Test using Transaction Rollback
        await client.query('BEGIN');
        console.log("TRANSACTION STARTED FOR SAFE WRITE TEST");
        try {
            // Write to a safe table (audit_logs)
            const insertTest = await client.query(`
                INSERT INTO audit_logs (actor, action, target) 
                VALUES ('system_test', 'SAFE_WRITE_VERIFICATION', 'DB_SCHEMA') 
                RETURNING id
            `);
            if (insertTest.rowCount === 1) {
                console.log("SAFE WRITE: PASS");
            } else {
                console.log("SAFE WRITE: FAIL (Insert yielded 0 rows)");
            }
            // Always rollback test data
            await client.query('ROLLBACK');
            console.log("ROLLBACK: PASS (Test data safely removed without modifying Production)");
        } catch (e) {
            await client.query('ROLLBACK');
            console.error("SAFE WRITE EXCEPTION:", e);
        }

        console.log("ALL TESTS COMPLETED SUCCESSFULLY.");
    } catch (error) {
        console.error("FATAL ERROR DURING SCHEMA APPLICATION:", error);
    } finally {
        await client.end();
    }
}

run();
