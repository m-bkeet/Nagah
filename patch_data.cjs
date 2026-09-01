const fs = require('fs');
let content = fs.readFileSync('server/data/index.ts', 'utf8');

const oldGetAll = `          if (!error && Array.isArray(data)) {
            const items = data.map((row: any) => ({
              id: row.id,
              ...(row.data || {})
            })) as T[];

            // Keep in-memory store in sync
            const memData = db.getData() as any;
            if (memData) {
              memData[key] = items;
            }

            return items;
          }`;

const newGetAll = `          if (!error && Array.isArray(data)) {
            const items = data.map((row: any) => ({
              id: row.id,
              ...(row.data || {})
            })) as T[];

            const memData = db.getData() as any;
            if (memData) {
              // If Supabase is empty but local memory has data, DO NOT WIPE LOCAL DATA!
              // Instead, we should probably return local data so it doesn't appear empty.
              if (items.length === 0 && memData[key] && memData[key].length > 0) {
                console.log(\`[DataLayer] Supabase collection \${key} is empty, but local data has \${memData[key].length}. Using local data as fallback.\`);
                return memData[key] as T[];
              }
              memData[key] = items;
            }

            return items;
          }`;

content = content.replace(oldGetAll, newGetAll);
fs.writeFileSync('server/data/index.ts', content);
