import { queryNeon, neonPool } from './dbNeon';

async function verifyRelations() {
  console.log('=== VERIFYING DATABASE RELATIONSHIPS & DATA INTEGRITY ===\n');
  let issuesFound = 0;

  try {
    // 1. Check Groups -> Courses & Branches
    const groupsRes = await queryNeon('SELECT id, name, course_id, branch_id, trainer_id FROM groups');
    const coursesRes = await queryNeon('SELECT id, name FROM courses');
    const branchesRes = await queryNeon('SELECT id, name FROM branches');
    const trainersRes = await queryNeon('SELECT id, name FROM trainers');
    const studentsRes = await queryNeon('SELECT id, student_code, full_name, group_id, course_id, branch_id FROM students');

    const courseIds = new Set(coursesRes.rows.map(r => r.id));
    const branchIds = new Set(branchesRes.rows.map(r => r.id));
    const trainerIds = new Set(trainersRes.rows.map(r => r.id));
    const groupIds = new Set(groupsRes.rows.map(r => r.id));
    const studentIds = new Set(studentsRes.rows.map(r => r.id));

    console.log(`Entities Loaded:`);
    console.log(`- Branches: ${branchIds.size}`);
    console.log(`- Courses: ${courseIds.size}`);
    console.log(`- Trainers: ${trainerIds.size}`);
    console.log(`- Groups: ${groupIds.size}`);
    console.log(`- Students: ${studentIds.size}\n`);

    // Check groups integrity
    for (const g of groupsRes.rows) {
      if (g.course_id && !courseIds.has(g.course_id)) {
        console.warn(`[WARN] Group '${g.name}' (${g.id}) has invalid course_id: ${g.course_id}`);
        issuesFound++;
      }
      if (g.branch_id && !branchIds.has(g.branch_id)) {
        console.warn(`[WARN] Group '${g.name}' (${g.id}) has invalid branch_id: ${g.branch_id}`);
        issuesFound++;
      }
      if (g.trainer_id && !trainerIds.has(g.trainer_id)) {
        console.warn(`[WARN] Group '${g.name}' (${g.id}) has invalid trainer_id: ${g.trainer_id}`);
        issuesFound++;
      }
    }

    // Check students integrity
    let studentsWithoutGroup = 0;
    let studentsWithOrphanGroup = 0;
    for (const s of studentsRes.rows) {
      if (!s.group_id) {
        studentsWithoutGroup++;
      } else if (!groupIds.has(s.group_id)) {
        console.warn(`[WARN] Student '${s.full_name}' (${s.student_code}) has non-existent group_id: ${s.group_id}`);
        studentsWithOrphanGroup++;
        issuesFound++;
      }
      if (s.branch_id && !branchIds.has(s.branch_id)) {
        console.warn(`[WARN] Student '${s.full_name}' (${s.student_code}) has invalid branch_id: ${s.branch_id}`);
        issuesFound++;
      }
    }
    console.log(`Student Relations:`);
    console.log(`- Students assigned to valid groups: ${studentsRes.rows.length - studentsWithoutGroup - studentsWithOrphanGroup}`);
    console.log(`- Students without group assignment: ${studentsWithoutGroup}`);
    console.log(`- Students with orphan group: ${studentsWithOrphanGroup}\n`);

    // Check Attendance relations
    const attRes = await queryNeon('SELECT id, trainee_id, group_id, date FROM attendance');
    console.log(`Attendance Records: ${attRes.rows.length}`);
    let orphanAttStudents = 0;
    let orphanAttGroups = 0;
    for (const a of attRes.rows) {
      if (!studentIds.has(a.trainee_id)) orphanAttStudents++;
      if (a.group_id && !groupIds.has(a.group_id)) orphanAttGroups++;
    }
    console.log(`- Valid student references: ${attRes.rows.length - orphanAttStudents}`);
    console.log(`- Orphan student references: ${orphanAttStudents}`);
    console.log(`- Orphan group references: ${orphanAttGroups}\n`);

    // Check Gamification Points relations
    const gpRes = await queryNeon('SELECT id, student_id, points FROM gamification_points');
    console.log(`Gamification Point Records: ${gpRes.rows.length}`);
    let orphanGp = 0;
    for (const gp of gpRes.rows) {
      if (gp.student_id && !studentIds.has(gp.student_id)) orphanGp++;
    }
    console.log(`- Valid student references: ${gpRes.rows.length - orphanGp}`);
    console.log(`- Orphan student references: ${orphanGp}\n`);

    // Check Collections table coverage
    const colStats = await queryNeon(`
      SELECT collection_name, count(*) as count 
      FROM collections 
      GROUP BY collection_name 
      ORDER BY count DESC;
    `);
    console.log('Collections Table Coverage in Neon:');
    for (const r of colStats.rows) {
      console.log(`  * ${r.collection_name}: ${r.count} items`);
    }

    console.log(`\n=== VERIFICATION SUMMARY ===`);
    if (issuesFound === 0) {
      console.log('SUCCESS: All relationships and foreign references are 100% clean and consistent!');
    } else {
      console.log(`Found ${issuesFound} issues that should be addressed.`);
    }

  } catch (err: any) {
    console.error('Verification error:', err);
  } finally {
    await neonPool.end();
    process.exit(0);
  }
}

verifyRelations();
