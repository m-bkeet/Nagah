const fs = require('fs');
const map = JSON.parse(fs.readFileSync('dist/server.cjs.map', 'utf8'));

const index = map.sources.findIndex(s => s.includes('server/routes.ts') || s.includes('server\\routes.ts'));
if (index !== -1) {
  const content = map.sourcesContent[index];
  fs.writeFileSync('server/routes.ts', content);
  console.log('Successfully recovered server/routes.ts!');
} else {
  console.log('Could not find server/routes.ts in sourcemap sources:');
  console.log(map.sources);
}
