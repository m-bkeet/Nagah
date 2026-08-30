const pg = require('pg');

async function run() {
    const dbUrl = process.env.DATABASE_URL;
    let report = {
        present: false,
        formatValid: false,
        user: 'UNKNOWN',
        hostMasked: 'UNKNOWN',
        port: 'UNKNOWN',
        connectionType: 'UNKNOWN',
        passwordHasSpecialChars: false,
        passwordUrlEncoded: false,
        authStatus: 'UNKNOWN',
        errorDetails: null
    };

    if (dbUrl) {
        report.present = true;
        try {
            const parsed = new URL(dbUrl);
            report.formatValid = true;
            report.user = parsed.username;
            report.hostMasked = parsed.hostname.substring(0, 4) + '***' + parsed.hostname.substring(parsed.hostname.lastIndexOf('.'));
            report.port = parsed.port;
            
            if (parsed.port === '5432') {
                report.connectionType = 'Direct Connection';
            } else if (parsed.port === '6543') {
                if (parsed.searchParams.has('pgbouncer')) {
                    report.connectionType = 'Transaction Pooler (pgbouncer=true)';
                } else {
                    report.connectionType = 'Session Pooler';
                }
            } else {
                report.connectionType = 'Unknown / Custom Port (' + parsed.port + ')';
            }

            const rawPassword = parsed.password;
            if (rawPassword.includes('%')) {
                report.passwordUrlEncoded = true;
            }
            // Check if there are unencoded special chars (like @, #, etc.) which is bad for URL parser sometimes, 
            // but if new URL() parsed it, it might have handled it, or it broke the host.
            // Actually, if they used an unencoded @ in the password, new URL() parses the host wrong.
            // Example: postgres://user:p@ssword@db.supabase.co
            // Parsed host would be "ssword@db.supabase.co" or similar.
            if (parsed.hostname.includes('@')) {
                report.hostMasked = "INVALID_HOST_PARSE_DUE_TO_UNENCODED_AT_IN_PASSWORD";
                report.formatValid = false; // Effectively invalid
            }

        } catch (e) {
            report.formatValid = false;
        }
    }

    // Try connection
    if (report.formatValid) {
        const client = new pg.Client({ connectionString: dbUrl });
        try {
            await client.connect();
            report.authStatus = 'PASS';
            await client.end();
        } catch (err) {
            report.authStatus = 'FAIL';
            report.errorDetails = err.code + ': ' + err.message;
        }
    } else {
        report.authStatus = 'FAIL (Invalid URL format)';
    }

    console.log(JSON.stringify(report, null, 2));
}

run();
