const pg = require('pg');
const fs = require('fs');
const AdmZip = require('adm-zip');
const path = require('path');

async function run() {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
        console.error("DATABASE_URL missing");
        return;
    }

    const client = new pg.Client({ connectionString: dbUrl });
    await client.connect();

    console.log("==========================================");
    console.log("NAGAH — MASTER DATA TRUTH FORENSIC REPORT");
    console.log("==========================================");

    // 1. Entity Counts
    const tables = [
        'students', 'trainers', 'branches', 'courses', 'student_groups', 
        'educational_programs', 'users', 'group_enrollments', 'class_sessions', 'session_attendance_records', 
        'payment_receipts', 'student_points_transactions', 'issued_certificates', 'audit_logs'
    ];

    console.log("\n[1] POSTGRESQL ENTITY COUNTS:");
    const counts = {};
    for (const t of tables) {
        try {
            const res = await client.query(`SELECT count(*) as cnt FROM public.${t};`);
            counts[t] = parseInt(res.rows[0].cnt, 10);
            console.log(`  - ${t}: ${counts[t]}`);
        } catch (e) {
            counts[t] = 'ERROR: ' + e.message;
            console.log(`  - ${t}: ERROR ${e.message}`);
        }
    }

    // 2. All Students forensic details
    const studentsRes = await client.query(`
        SELECT 
            s.id, 
            s.student_code as "studentCode", 
            u.full_name_arabic as name, 
            b.name as branch,
            g.name as "group",
            s.created_at as "createdAt",
            s.updated_at as "updatedAt",
            s.legacy_id as "legacyId"
        FROM public.students s
        JOIN public.users u ON s.id = u.id
        LEFT JOIN public.branches b ON u.branch_id = b.id
        LEFT JOIN public.group_enrollments ge ON s.id = ge.student_id
        LEFT JOIN public.student_groups g ON ge.group_id = g.id
        ORDER BY s.student_code ASC;
    `);

    console.log(`\n[2] STUDENTS IN POSTGRESQL (Total: ${studentsRes.rows.length}):`);
    
    // Legacy 50 list provided in prompt
    const legacy50 = [
        "A001", "A002", "A003", "C111", "A108", "C102", "C106", "ICT4-991", "A104", "A106", 
        "A107", "C107", "G101", "A128", "C105", "A120", "A129", "C109", "A117", "B102", 
        "A112", "D102", "A116", "D101", "A124", "A125", "C110", "A126", "A132", "B101", 
        "A105", "A130", "A115", "A123", "A113", "C112", "A127", "A122", "C108", "A131", 
        "C103", "A114", "A111", "A121", "H101", "C104", "A004", "A109", "C101", "E101"
    ];

    const dbCodes = studentsRes.rows.map(s => s.studentCode);
    const matchedLegacy = legacy50.filter(code => dbCodes.includes(code));
    const missingLegacy = legacy50.filter(code => !dbCodes.includes(code));
    const extraInDb = dbCodes.filter(code => !legacy50.includes(code));

    console.log(`  - Legacy 50 Match in DB: ${matchedLegacy.length}/50`);
    console.log(`  - Legacy 50 Missing in DB: ${missingLegacy.length}`);
    if (missingLegacy.length > 0) {
        console.log(`    Missing codes:`, missingLegacy);
    }
    console.log(`  - Extra records in DB (beyond legacy 50): ${extraInDb.length}`);

    // Inspect zip package
    const zipPath = path.join(process.cwd(), 'data', 'migration', 'latest_package.zip');
    if (fs.existsSync(zipPath)) {
        console.log(`\n[3] LEGACY MIGRATION PACKAGE (${zipPath}):`);
        const zip = new AdmZip(zipPath);
        const studentsEntry = zip.getEntry('students.json');
        if (studentsEntry) {
            const zipStudents = JSON.parse(studentsEntry.getData().toString('utf-8'));
            console.log(`  - students.json inside zip records count: ${zipStudents.length}`);
            const zipCodes = zipStudents.map(s => s.code || s.studentCode || s.id);
            const matchZipDb = zipCodes.filter(c => dbCodes.includes(c));
            console.log(`  - Zip students matching DB: ${matchZipDb.length}/${zipStudents.length}`);
        } else {
            console.log(`  - students.json not found in zip`);
        }
    }

    // Check timestamps / batches in DB
    const batchRes = await client.query(`
        SELECT date_trunc('minute', created_at) as batch_time, count(*) as cnt 
        FROM public.students 
        GROUP BY batch_time 
        ORDER BY batch_time ASC;
    `);
    console.log(`\n[4] STUDENT CREATION TIMESTAMPS / BATCHES IN DB:`);
    for (const r of batchRes.rows) {
        console.log(`  - Time: ${r.batch_time}, Count: ${r.cnt}`);
    }

    // Export full reconciliation JSON
    const reportData = {
        counts,
        legacyComparison: {
            legacyTotal: legacy50.length,
            matched: matchedLegacy.length,
            missing: missingLegacy,
            extraCount: extraInDb.length,
            extraCodes: extraInDb
        },
        timestamps: batchRes.rows,
        students: studentsRes.rows
    };
    fs.writeFileSync('master_forensic_output.json', JSON.stringify(reportData, null, 2), 'utf-8');
    console.log(`\nFull forensic report exported to master_forensic_output.json`);

    await client.end();
}

run().catch(console.error);
