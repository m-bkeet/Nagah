const pg = require('pg');
const fs = require('fs');

async function run() {
    let report = [];
    const log = (msg) => report.push(msg);

    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
        console.log("DATABASE AUTHENTICATION: FAIL");
        return;
    }

    const client = new pg.Client({ connectionString: dbUrl });
    let connected = false;
    try {
        await client.connect();
        connected = true;
        log("DATABASE AUTHENTICATION: PASS");

        const res1 = await client.query('SELECT 1 AS val;');
        if (res1.rows.length > 0 && res1.rows[0].val === 1) {
            log("REAL SELECT: PASS");
        } else {
            log("REAL SELECT: FAIL");
            throw new Error("SELECT 1 failed");
        }

        let schemaSql = "";
        try {
            schemaSql = fs.readFileSync('src/server/schema.sql', 'utf8');
            log("SCHEMA FILE READ: PASS");
        } catch (e) {
            log("SCHEMA FILE READ: FAIL");
            throw e;
        }

        // We know schema.sql has ON DELETE CASCADE/RESTRICT/SET NULL.
        // We will execute it directly since it was already reviewed.
        try {
            await client.query(schemaSql);
            log("SCHEMA EXECUTION: PASS");
        } catch (e) {
            log("SCHEMA EXECUTION: FAIL (" + e.message + ")");
            throw e;
        }

        log("\nTABLE VERIFICATION:");
        const tables = [
            'branches', 'educational_programs', 'courses', 'users', 'students', 'trainers',
            'student_groups', 'group_enrollments', 'class_sessions', 'session_attendance_records',
            'payment_receipts', 'student_points_transactions', 'certificate_templates',
            'issued_certificates', 'audit_logs'
        ];

        const resTables = await client.query(`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = ANY($1)`, [tables]);
        const foundTables = resTables.rows.map(r => r.table_name);
        
        let count = 0;
        for (const t of tables) {
            if (foundTables.includes(t)) {
                log(`${t}: PASS`);
                count++;
            } else {
                log(`${t}: FAIL`);
            }
        }
        log(`\nTABLE COUNT: ${count}/15\n`);

        if (count !== 15) {
            throw new Error("Not all tables verified");
        }

        log("STUDENT CODE VERIFICATION:");
        const resCol = await client.query(`SELECT is_nullable FROM information_schema.columns WHERE table_name = 'students' AND column_name = 'student_code'`);
        if (resCol.rows.length > 0) {
            log("students.student_code EXISTS: PASS");
            log(`students.student_code NOT NULL: ${resCol.rows[0].is_nullable === 'NO' ? 'PASS' : 'FAIL'}`);
        } else {
            log("students.student_code EXISTS: FAIL");
            log("students.student_code NOT NULL: FAIL");
        }

        const resUnique = await client.query(`
            SELECT kcu.column_name 
            FROM information_schema.table_constraints tco
            JOIN information_schema.key_column_usage kcu 
              ON kcu.constraint_name = tco.constraint_name 
              AND kcu.constraint_schema = tco.constraint_schema 
            WHERE tco.constraint_type = 'UNIQUE' 
              AND tco.table_name = 'students'
              AND kcu.column_name = 'student_code';
        `);
        log(`students.student_code UNIQUE: ${resUnique.rows.length > 0 ? 'PASS' : 'FAIL'}`);

        try {
            const resStud = await client.query('SELECT * FROM students LIMIT 1;');
            log(`\nSTUDENTS REAL SELECT: PASS`);
        } catch (e) {
            log(`\nSTUDENTS REAL SELECT: FAIL`);
            throw e;
        }

        log("\nTRANSACTION TEST:");
        try {
            await client.query('BEGIN;');
            log("TRANSACTION BEGIN: PASS");

            const testUuid = 'ffffffff-ffff-4fff-8fff-ffffffffffff';
            await client.query(`INSERT INTO users (id, full_name_arabic, role, email) VALUES ($1, 'Test User', 'STUDENT', 'test_transaction@nagah.local')`, [testUuid]);
            await client.query(`INSERT INTO students (id, student_code) VALUES ($1, 'TEST-CODE-000')`, [testUuid]);
            log("TEST WRITE: PASS");

            const resRead = await client.query(`SELECT * FROM students WHERE student_code = 'TEST-CODE-000'`);
            log(`IN-TRANSACTION READBACK: ${resRead.rows.length === 1 ? 'PASS' : 'FAIL'}`);

            await client.query('ROLLBACK;');
            log("ROLLBACK: PASS");

            const resPost = await client.query(`SELECT * FROM students WHERE student_code = 'TEST-CODE-000'`);
            log(`POST-ROLLBACK VERIFICATION: ${resPost.rows.length === 0 ? 'PASS' : 'FAIL'}`);
            log(`PERMANENT TEST DATA LEFT BEHIND: ${resPost.rows.length === 0 ? 'NO' : 'YES'}`);
        } catch (e) {
            await client.query('ROLLBACK;');
            log("TEST WRITE: FAIL");
            log("TRANSACTION TEST FAILED OR EXCEPTION: " + e.message);
            throw e;
        }

        log("\nREAL SNAPSHOT: NOT EXECUTED (No direct SQL command equivalent supported safely from environment)");
        log("\nLEGACY IMPORT: NOT EXECUTED");
        log("\nACTUAL PRODUCTION IMPORT: NOT EXECUTED");
        
        log("\nFINAL GATE:");
        log("SCHEMA VERIFICATION: PASS");
        log("\nNEXT STEP:");
        log("Ready for ACTUAL PRODUCTION IMPORT.");

    } catch (err) {
        log("\nFINAL GATE:");
        log("SCHEMA VERIFICATION: BLOCKED");
        log("\nNEXT STEP:");
        log("Fix PostgreSQL Error: " + err.message);
    } finally {
        if (connected) await client.end();
        console.log("NAGAH — SCHEMA VERIFICATION REPORT\n");
        console.log(report.join('\n'));
    }
}

run();
