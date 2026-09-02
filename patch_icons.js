import fs from 'fs';
let code = fs.readFileSync('src/views/LabScheduleView.tsx', 'utf-8');
code = code.replace(/CheckCircle2, AlertTriangle, Users, BookOpen, UserCheck, Building, Bell, BarChart2, Award/, 'CheckCircle2, AlertTriangle, Users, BookOpen, UserCheck, Building, Bell, BarChart2, Award, Edit2');
fs.writeFileSync('src/views/LabScheduleView.tsx', code);
