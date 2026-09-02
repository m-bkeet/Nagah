import fs from 'fs';
let code = fs.readFileSync('src/views/LabScheduleView.tsx', 'utf-8');

const stateRegex = /const \[viewMode, setViewMode\] = useState\<'cards' \| 'timetable'\>\('cards'\);/;
const newState = `const [viewMode, setViewMode] = useState<'cards' | 'timetable'>('cards');
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [viewingTraineesGroup, setViewingTraineesGroup] = useState<Group | null>(null);`;
code = code.replace(stateRegex, newState);
fs.writeFileSync('src/views/LabScheduleView.tsx', code);
