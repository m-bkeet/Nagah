const fs = require('fs');
const AdmZip = require('adm-zip');
const path = require('path');

const zipPath = path.join(process.cwd(), 'data', 'migration', 'latest_package.zip');
if (fs.existsSync(zipPath)) {
    const zip = new AdmZip(zipPath);
    const entries = zip.getEntries();
    for (const entry of entries) {
        console.log("Entry:", entry.entryName);
        if (entry.entryName.endsWith('.json')) {
            try {
                const data = JSON.parse(entry.getData().toString('utf-8'));
                console.log(`  Records count:`, Array.isArray(data) ? data.length : Object.keys(data).length);
                if (entry.entryName === 'students.json') {
                    console.log(`  Student codes in zip:`, data.map(s => s.code || s.studentCode || s.id));
                }
            } catch (e) {
                console.log(`  Error parsing json`);
            }
        }
    }
}
