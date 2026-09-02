import fs from 'fs';
let code = fs.readFileSync('src/views/LabScheduleView.tsx', 'utf-8');

// 1. Remove fetchSchedules's call to /api/lab-schedules and generate schedules from groups
const fetchSchedulesRegex = /const fetchSchedules = async \(\) => \{[\s\S]*?setIsLoading\(false\);\n    \}\n  \};/m;
const newFetchSchedules = `const fetchSchedules = async () => {
    setIsLoading(true);
    try {
      const [brRes, grpRes, trRes, crsRes, syncRes, trnRes] = await Promise.all([
        fetch('/api/branches').catch(() => ({ json: () => [] })),
        fetch('/api/groups').catch(() => ({ json: () => [] })),
        fetch('/api/trainers').catch(() => ({ json: () => [] })),
        fetch('/api/courses').catch(() => ({ json: () => [] })),
        fetch('/api/system/google-drive-sync').catch(() => ({ json: () => ({}) })),
        fetch('/api/trainees').catch(() => ({ json: () => [] }))
      ]);

      const brData = await brRes.json();
      const grpData = await grpRes.json();
      const trData = await trRes.json();
      const crsData = await crsRes.json();
      const syncData = await syncRes.json();
      const trnData = await trnRes.json();

      if (Array.isArray(brData)) setBranches(brData);
      if (Array.isArray(grpData)) setGroups(grpData);
      if (Array.isArray(trData)) setTrainers(trData);
      if (Array.isArray(crsData)) setCourses(crsData);
      setSyncStatus(syncData);

      // Store trainees on window to show them in modal easily without big refactor
      (window as any).allTrainees = Array.isArray(trnData) ? trnData : [];

      // Auto-generate schedules from groups!
      if (Array.isArray(grpData)) {
        let generatedSchedules: LabScheduleSlot[] = [];
        grpData.forEach(g => {
          if (!selectedBranchId || selectedBranchId === 'all' || g.branchId === selectedBranchId) {
            const gDays = g.scheduleDays || g.days || [];
            if (gDays.length > 0) {
              const c = crsData.find((cr: any) => cr.id === g.courseId || cr.code === g.courseId) || {};
              const t = trData.find((tr: any) => tr.id === g.trainerId) || {};
              
              gDays.forEach((day: string) => {
                generatedSchedules.push({
                  id: \`sch-\${g.id}-\${day}\`,
                  branchId: g.branchId,
                  groupId: g.id,
                  groupName: g.name,
                  courseName: c.title_arabic || c.title || c.name || c.courseCode || 'دورة تدريبية',
                  trainerId: g.trainerId,
                  trainerName: t.fullName || t.name || t.full_name_arabic || 'مدرب غير محدد',
                  roomName: g.roomName || g.hallName || 'معمل 1',
                  dayOfWeek: day,
                  startTime: g.startTime || g.scheduleTime || '16:00',
                  endTime: g.endTime || '18:00',
                });
              });
            }
          }
        });
        setSchedules(generatedSchedules);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };`;
code = code.replace(fetchSchedulesRegex, newFetchSchedules);
fs.writeFileSync('src/views/LabScheduleView.tsx', code);
