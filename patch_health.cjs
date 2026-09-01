const fs = require('fs');
const path = './server/api-entry.ts';
let content = fs.readFileSync(path, 'utf8');

const newHealth = `
app.get(['/health', '/api/health'], async (req, res) => {
  let supabaseStatus = 'disconnected';
  let supabaseCount = 0;
  let hasBundledData = false;
  let hasTmpData = false;
  let tmpDataSize = 0;
  let bundledDataSize = 0;
  let memDataKeys = [];
  
  try {
    const fs = await import('fs');
    const path = await import('path');
    const bPath = path.join(process.cwd(), 'data', 'database.json');
    const tPath = path.join(await import('os').then(os=>os.tmpdir()), 'nagah_data', 'database.json');
    if (fs.existsSync(bPath)) { hasBundledData = true; bundledDataSize = fs.statSync(bPath).size; }
    if (fs.existsSync(tPath)) { hasTmpData = true; tmpDataSize = fs.statSync(tPath).size; }
    
    const { supabaseClient, db } = await import('./data/index.js');
    if (supabaseClient) {
      const { data, error } = await supabaseClient
        .from('collections')
        .select('id', { count: 'exact', head: true });
      if (!error) {
        supabaseStatus = 'connected';
      }
    }
    if (db) {
      memDataKeys = Object.keys(db.getData());
    }
  } catch (e) {
    supabaseStatus = \`error: \${e.message || e}\`;
  }

  res.json({
    status: 'ok',
    service: 'Nagah Management System',
    environment: process.env.NODE_ENV || 'production',
    serverless: isServerless,
    supabase: supabaseStatus,
    cwd: process.cwd(),
    hasBundledData,
    bundledDataSize,
    hasTmpData,
    tmpDataSize,
    memDataKeys,
    timestamp: new Date().toISOString()
  });
});
`;

content = content.replace(/app\.get\(\['\/health', '\/api\/health'\], async \(req, res\) => \{[\s\S]*?timestamp: new Date\(\)\.toISOString\(\)\n  \}\);\n\}\);/, newHealth.trim());
fs.writeFileSync(path, content);
