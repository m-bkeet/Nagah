const fs = require('fs');
let content = fs.readFileSync('server/db.ts', 'utf8');

// Find the start of traineeScreenshots
const startIndex = content.indexOf('  traineeScreenshots: [');
if (startIndex !== -1) {
  // Find the next top-level key which is computerLabs: [
  const endIndex = content.indexOf('  computerLabs: [', startIndex);
  if (endIndex !== -1) {
    const before = content.substring(0, startIndex);
    const after = content.substring(endIndex);
    content = before + '  traineeScreenshots: [],\n' + after;
    fs.writeFileSync('server/db.ts', content);
    console.log('Successfully cleared traineeScreenshots array.');
  } else {
    console.log('Could not find computerLabs: [');
  }
} else {
  console.log('Could not find traineeScreenshots: [');
}
