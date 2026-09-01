const fs = require('fs');
let content = fs.readFileSync('server/db.ts', 'utf8');

const oldBlock = `      // 2. Try bundled database file (for Vercel / serverless deployments)
      if (!rawData && fs.existsSync(BUNDLED_DB_FILE)) {
        try {
          const content = fs.readFileSync(BUNDLED_DB_FILE, 'utf-8');
          if (content && content.trim().length > 10) {
            console.log('[DB] Loading from bundled database file');
            rawData = content;
          }
        } catch (e) {
          console.warn('[DB] Error reading BUNDLED_DB_FILE:', e);
        }
      }`;

const newBlock = `      // 2. Try bundled database file (for Vercel / serverless deployments)
      if (!rawData) {
        for (const p of BUNDLED_DB_PATHS) {
          if (fs.existsSync(p)) {
            try {
              const content = fs.readFileSync(p, 'utf-8');
              if (content && content.trim().length > 10) {
                console.log('[DB] Loading from bundled database file:', p);
                rawData = content;
                break;
              }
            } catch (e) {
              console.warn('[DB] Error reading BUNDLED_DB_PATH:', p, e);
            }
          }
        }
      }`;

content = content.replace(oldBlock, newBlock);
fs.writeFileSync('server/db.ts', content);
