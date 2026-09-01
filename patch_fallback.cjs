const fs = require('fs');
let content = fs.readFileSync('server/data/index.ts', 'utf8');

// Remove per-collection fallback
const fallbackLogic = `              // If Supabase is empty but local memory has data, DO NOT WIPE LOCAL DATA!
              // Instead, we should probably return local data so it doesn't appear empty.
              if (items.length === 0 && memData[key] && memData[key].length > 0) {
                console.log(\`[DataLayer] Supabase collection \${key} is empty, but local data has \${memData[key].length}. Using local data as fallback.\`);
                return memData[key] as T[];
              }`;

content = content.replace(fallbackLogic, '');

// Also comment out the global auto-seed because it resurrects deleted data if they delete everything
const globalSeed = `// Auto-Seed: If Supabase is completely empty, upload local data to it
      if (data.length === 0) {`;
content = content.replace(globalSeed, `// Auto-Seed Disabled to prevent resurrecting deleted data
      if (false) {`);

fs.writeFileSync('server/data/index.ts', content);
