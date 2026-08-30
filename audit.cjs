const { execSync } = require('child_process');

try {
    const rawEnv = execSync('env', { encoding: 'utf8' }).split('\n');
    
    function checkVar(prefix) {
        return rawEnv.filter(line => line.startsWith(prefix + '=')).map(line => line.substring(prefix.length + 1));
    }

    const supabaseUrls = checkVar('SUPABASE_URL');
    console.log('SUPABASE_URL_COUNT=' + supabaseUrls.length);
    if (supabaseUrls.length > 1) {
        console.log('SUPABASE_URL_IDENTICAL=' + (supabaseUrls.every(v => v === supabaseUrls[0]) ? 'YES' : 'NO'));
        const effective = process.env.SUPABASE_URL;
        let which = 'UNKNOWN';
        if (effective === supabaseUrls[0] && effective !== supabaseUrls[1]) which = 'FIRST';
        else if (effective === supabaseUrls[supabaseUrls.length - 1] && effective !== supabaseUrls[0]) which = 'LAST';
        else if (supabaseUrls.every(v => v === supabaseUrls[0])) which = 'SAME_SO_DOES_NOT_MATTER (LAST is effectively used)';
        console.log('EFFECTIVE_URL=' + which);
    } else {
        console.log('SUPABASE_URL_IDENTICAL=N/A');
        console.log('EFFECTIVE_URL=FIRST');
    }

    const serviceRoles = checkVar('SUPABASE_SERVICE_ROLE_KEY');
    console.log('SERVICE_ROLE_COUNT=' + serviceRoles.length);

    const anonKeys = checkVar('SUPABASE_ANON_KEY');
    console.log('ANON_KEY_COUNT=' + anonKeys.length);

    const dbUrls = checkVar('DATABASE_URL');
    console.log('DATABASE_URL_COUNT=' + dbUrls.length);

    const gemini = process.env.GEMINI_API_KEY;
    console.log('GEMINI_API_KEY_STATUS=' + (gemini && gemini.trim().length > 0 && gemini !== 'your-gemini-api-key' ? 'CONFIGURED' : 'NOT CONFIGURED'));

    const allKeys = rawEnv.filter(l => l.includes('=')).map(l => l.split('=')[0]);
    const counts = {};
    const duplicates = [];
    for (const key of allKeys) {
        if (!key) continue;
        counts[key] = (counts[key] || 0) + 1;
        if (counts[key] === 2) duplicates.push(key);
    }
    const otherDups = duplicates.filter(k => 
        k !== 'SUPABASE_URL' && 
        k !== 'SUPABASE_SERVICE_ROLE_KEY' && 
        k !== 'SUPABASE_ANON_KEY' && 
        k !== 'DATABASE_URL' && 
        k !== 'GEMINI_API_KEY'
    );
    console.log('OTHER_DUPLICATES=' + (otherDups.join(', ') || 'NONE'));

} catch (err) {
    console.error(err);
}
