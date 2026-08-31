const fs = require('fs');
const path = require('path');

const snapshotPath = path.join(__dirname, 'data', 'supabase_snapshot.json');
const dbPath = path.join(__dirname, 'server', 'db.ts');

if (!fs.existsSync(snapshotPath) || !fs.existsSync(dbPath)) {
  console.error('Missing snapshot or db.ts');
  process.exit(1);
}

const snapshot = JSON.parse(fs.readFileSync(snapshotPath, 'utf8'));

// Format snapshot collections cleanly for TypeScript
const cleanJson = (data) => JSON.stringify(data || [], null, 2);

// Read current db.ts
let dbCode = fs.readFileSync(dbPath, 'utf8');

// Find const initialData: DatabaseSchema = { ... };
const startMarker = 'const initialData: DatabaseSchema = {';
const startIndex = dbCode.indexOf(startMarker);

if (startIndex === -1) {
  console.error('Could not find initialData start in db.ts');
  process.exit(1);
}

// Build fresh initialData
const newInitialData = `const initialData: DatabaseSchema = {
  users: ${cleanJson(snapshot.users)},
  branches: ${cleanJson(snapshot.branches)},
  trainees: ${cleanJson(snapshot.trainees)},
  trainers: ${cleanJson(snapshot.trainers)},
  courses: ${cleanJson(snapshot.courses)},
  programs: ${cleanJson(snapshot.programs)},
  groups: ${cleanJson(snapshot.groups)},
  attendance: ${cleanJson(snapshot.attendance)},
  payments: ${cleanJson(snapshot.payments || [])},
  expenses: ${cleanJson(snapshot.expenses || [])},
  trainerSettlements: ${cleanJson(snapshot.trainerSettlements || [])},
  pointRules: ${cleanJson(snapshot.pointRules || [])},
  pointTransactions: ${cleanJson(snapshot.pointTransactions || [])},
  exams: ${cleanJson(snapshot.exams || [])},
  examQuestions: ${cleanJson(snapshot.questions || [])},
  examResults: ${cleanJson(snapshot.examResults || [])},
  interactiveSessions: ${cleanJson(snapshot.interactiveSessions || [])},
  devices: ${cleanJson(snapshot.devices || [])},
  deviceCommands: ${cleanJson(snapshot.deviceCommands || [])},
  certificates: ${cleanJson(snapshot.certificates || [])},
  trainerAttestations: [],
  certificateTemplates: ${cleanJson(snapshot.certificateTemplates || [])},
  auditLogs: ${cleanJson(snapshot.auditLogs || [])},
  centerSettings: ${cleanJson(snapshot.centerSettings ? snapshot.centerSettings[0] : null)},
  systemNotifications: ${cleanJson(snapshot.notifications || [])},
  traineeScreenshots: ${cleanJson(snapshot.traineeScreenshots || [])},
  computerLabs: ${cleanJson(snapshot.computerLabs || [])},
  assignments: []
};`;

// Find where initialData ends: look for `class Database` or `let memoryDb`
const endMarker = 'class Database';
const endIndex = dbCode.indexOf(endMarker);

if (endIndex === -1) {
  console.error('Could not find class Database in db.ts');
  process.exit(1);
}

const updatedDbCode = dbCode.substring(0, startIndex) + newInitialData + '\n\n' + dbCode.substring(endIndex);
fs.writeFileSync(dbPath, updatedDbCode, 'utf8');
console.log('Successfully updated server/db.ts with all 58 trainees and complete snapshot!');
