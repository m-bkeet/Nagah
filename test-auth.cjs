const pg = require('pg');

async function run() {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
        console.log("DATABASE AUTHENTICATION: BLOCKED");
        console.log("POSTGRES ERROR: DATABASE_URL not found in process.env");
        console.log("SCHEMA: NOT EXECUTED");
        console.log("IMPORT: NOT EXECUTED");
        return;
    }

    const client = new pg.Client({ connectionString: dbUrl });
    try {
        await client.connect();
        const res = await client.query('SELECT 1 AS connection_test;');
        if (res.rows && res.rows.length > 0 && res.rows[0].connection_test === 1) {
            console.log("DATABASE AUTHENTICATION: PASS");
            console.log("REAL SELECT: PASS");
            console.log("SCHEMA: NOT EXECUTED");
            console.log("IMPORT: NOT EXECUTED");
            console.log("NEXT GATE: SCHEMA VERIFICATION");
        } else {
            console.log("DATABASE AUTHENTICATION: PASS (Connected, but SELECT result unexpected)");
        }
    } catch (err) {
        console.log("DATABASE AUTHENTICATION: BLOCKED");
        console.log("POSTGRES ERROR: " + err.code + ": " + err.message);
        console.log("SCHEMA: NOT EXECUTED");
        console.log("IMPORT: NOT EXECUTED");
    } finally {
        await client.end();
    }
}

run();
