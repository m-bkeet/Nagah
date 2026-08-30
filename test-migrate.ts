import pg from 'pg';
import fs from 'fs';

const { Client } = pg;
const dbUrl = process.env.DATABASE_URL;

async function runMigration() {
    if (!dbUrl) {
        console.log("BLOCKED_NO_DATABASE_URL");
        return;
    }
    const client = new Client({ connectionString: dbUrl });
    try {
        await client.connect();
        const sql = fs.readFileSync('src/server/schema.sql', 'utf8');
        await client.query(sql);
        console.log("MIGRATION_SUCCESS");
        
        // Tests
        const res = await client.query('SELECT * FROM students LIMIT 1');
        console.log("SELECT_PASS");
        
        await client.query("INSERT INTO audit_logs (actor, action, target) VALUES ('migration_test', 'TEST_WRITE', 'DB')");
        console.log("INSERT_PASS");
        
        await client.query("DELETE FROM audit_logs WHERE actor = 'migration_test'");
        console.log("DELETE_PASS");
        
    } catch (err) {
        console.error("MIGRATION_ERROR", err);
    } finally {
        await client.end();
    }
}
runMigration();
