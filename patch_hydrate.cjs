const fs = require('fs');
let content = fs.readFileSync('server/data/index.ts', 'utf8');

const oldHydrate = `      for (const [colName, items] of Object.entries(grouped)) {
        memData[colName] = items;
      }

      console.log(\`[Hydration] Successfully loaded \${data.length} documents from Supabase public.collections across \${Object.keys(grouped).length} collections.\`);
      db.saveImmediate();
      return data.length;
    }
  } catch (err: any) {`;

const newHydrate = `      for (const [colName, items] of Object.entries(grouped)) {
        memData[colName] = items;
      }

      console.log(\`[Hydration] Successfully loaded \${data.length} documents from Supabase public.collections across \${Object.keys(grouped).length} collections.\`);
      
      // Auto-Seed: If Supabase is completely empty, upload local data to it
      if (data.length === 0) {
        console.log('[Hydration] Supabase is empty. Seeding from local memory data...');
        const inserts = [];
        for (const [cName, cItems] of Object.entries(memData)) {
          if (Array.isArray(cItems) && cItems.length > 0) {
            for (const item of cItems) {
              if (item && item.id) {
                inserts.push({
                  collection_name: cName,
                  id: item.id,
                  data: item,
                  updated_at: new Date().toISOString()
                });
              }
            }
          }
        }
        
        if (inserts.length > 0) {
          // Batch insert in chunks of 500
          const chunkSize = 500;
          for (let i = 0; i < inserts.length; i += chunkSize) {
            const chunk = inserts.slice(i, i + chunkSize);
            const { error: seedError } = await supabaseClient.from('collections').insert(chunk);
            if (seedError) {
               console.error('[Hydration] Error seeding Supabase:', seedError);
            } else {
               console.log(\`[Hydration] Seeded chunk of \${chunk.length} items.\`);
            }
          }
          console.log(\`[Hydration] Total \${inserts.length} items seeded to Supabase.\`);
        }
      }

      db.saveImmediate();
      return data.length;
    }
  } catch (err: any) {`;

content = content.replace(oldHydrate, newHydrate);
fs.writeFileSync('server/data/index.ts', content);
