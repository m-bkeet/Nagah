const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Imports
if (!code.includes('CoursesManagementView')) {
  code = code.replace(
    "import { CourseFirstAcademicView } from './features/academic/CourseFirstAcademicView';",
    "import { CourseFirstAcademicView } from './features/academic/CourseFirstAcademicView';\nimport { CoursesManagementView } from './features/academic/CoursesManagementView';\nimport { GroupsManagementView } from './features/academic/GroupsManagementView';\nimport { SchedulesTimetableView } from './features/academic/SchedulesTimetableView';"
  );
}

// Routes
code = code.replace(
  /case 'courses': return <CourseFirstAcademicView key="courses" initialBranch=\{currentBranch\} initialTab="COURSES" \/>;/,
  "case 'courses': return <CoursesManagementView />;"
);
code = code.replace(
  /case 'groups': return <CourseFirstAcademicView key="groups" initialBranch=\{currentBranch\} initialTab="GROUPS" \/>;/,
  "case 'groups': return <GroupsManagementView initialBranch={currentBranch} />;"
);
code = code.replace(
  /case 'schedules': return <CourseFirstAcademicView key="schedules" initialBranch=\{currentBranch\} initialTab="SCHEDULES" \/>;/,
  "case 'schedules': return <SchedulesTimetableView initialBranch={currentBranch} />;"
);

// Exams
const examsPlaceholder = `      case 'exams': return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center text-amber-500 mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <h2 className="text-2xl font-bold text-white">إدارة الاختبارات والدرجات</h2>
          <p className="text-slate-400 max-w-md">هذه الواجهة قيد التطوير. سيتم توفير أدوات شاملة لإنشاء الاختبارات وتصحيحها ورصد الدرجات تلقائياً.</p>
        </div>
      );`;
code = code.replace(/case 'exams': return <AcademicDomainView \/>;/, examsPlaceholder);

// Devices / Command Center
const devicesPlaceholder = `      case 'devices': return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center text-indigo-400 mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
          </div>
          <h2 className="text-2xl font-bold text-white">إدارة الأجهزة والتحكم</h2>
          <p className="text-slate-400 max-w-md">هذه الواجهة مخصصة للتحكم في أجهزة المعامل وتشغيل/إيقاف الأجهزة عن بُعد.</p>
        </div>
      );`;
code = code.replace(/case 'devices':\n\s*case 'command-center': return <CommandCenterView \/>;/, devicesPlaceholder + "\n      case 'command-center': return <CommandCenterView />;\n");


fs.writeFileSync('src/App.tsx', code);
