import { queryNeon, neonPool } from './dbNeon';

async function healDatabaseRelations() {
  console.log('=== HEALING DATABASE RELATIONS & FOREIGN KEYS ===\n');

  try {
    // 1. Fix Attendance records with orphan group ID grp-1787502480417-ltuf -> grp-1787358559234 (ICT - p1 - 1)
    await queryNeon(`
      UPDATE attendance 
      SET group_id = 'grp-1787358559234'
      WHERE group_id = 'grp-1787502480417-ltuf';
    `);
    console.log('Fixed attendance records pointing to grp-1787502480417-ltuf -> grp-1787358559234');

    // Fix attendance for trainee-1787756086876 pointing to grp-1787544696780
    await queryNeon(`
      UPDATE attendance 
      SET group_id = 'grp-1787431802246'
      WHERE group_id = 'grp-1787544696780';
    `);
    console.log('Fixed attendance records pointing to grp-1787544696780 -> grp-1787431802246');

    // 2. Heal the 18 students with old group IDs to their valid matching groups based on course and branch:
    // C001, C002, C007, C017 -> ICT6 branch-1 -> grp-1787431802246 (ICT6 - 1)
    await queryNeon(`
      UPDATE students
      SET group_id = 'grp-1787431802246', group_name = 'ICT6 - 1'
      WHERE student_code IN ('C001', 'C002', 'C007', 'C017');
    `);

    // C003 -> ICT6 branch-2 -> grp-1787433082510 (ICT6 - B1)
    await queryNeon(`
      UPDATE students
      SET group_id = 'grp-1787433082510', group_name = 'ICT6 - B1'
      WHERE student_code = 'C003';
    `);

    // C005, C010, C012, C013, C014, C016, C020 -> ICT6 branch-1 -> grp-1787431825818 (ICT6 - 2)
    await queryNeon(`
      UPDATE students
      SET group_id = 'grp-1787431825818', group_name = 'ICT6 - 2'
      WHERE student_code IN ('C005', 'C010', 'C012', 'C013', 'C014', 'C016', 'C020');
    `);

    // S001 -> ICT - S1 - B1 -> grp-1787433234491
    await queryNeon(`
      UPDATE students
      SET group_id = 'grp-1787433234491', group_name = 'ICT - S1 - B1'
      WHERE student_code = 'S001';
    `);

    // B005 -> ICT5 - 1 -> grp-1787431608023
    await queryNeon(`
      UPDATE students
      SET group_id = 'grp-1787431608023', group_name = 'ICT5 - 1'
      WHERE student_code = 'B005';
    `);

    // A009 -> ICT4 - 1 -> grp-1787350487970
    await queryNeon(`
      UPDATE students
      SET group_id = 'grp-1787350487970', group_name = 'ICT4 - 1'
      WHERE student_code = 'A009';
    `);

    // A018 -> ICT4 - 2 -> grp-1787350488774
    await queryNeon(`
      UPDATE students
      SET group_id = 'grp-1787350488774', group_name = 'ICT4 - 2'
      WHERE student_code = 'A018';
    `);

    // D007 -> ICT - p1 - B1 (branch-2) -> grp-1787433160347
    await queryNeon(`
      UPDATE students
      SET group_id = 'grp-1787433160347', group_name = 'ICT - p1 - B1'
      WHERE student_code = 'D007';
    `);

    // D008 -> ICT - p1 - 1 (branch-1) -> grp-1787358559234
    await queryNeon(`
      UPDATE students
      SET group_id = 'grp-1787358559234', group_name = 'ICT - p1 - 1'
      WHERE student_code = 'D008';
    `);

    // 3. Sync all healed students back to collections table in Neon
    console.log('Synchronizing healed students to collections table...');
    const allStudents = await queryNeon('SELECT * FROM students');
    for (const s of allStudents.rows) {
      const existingCol = await queryNeon('SELECT data FROM collections WHERE collection_name = $1 AND id = $2', ['trainees', s.id]);
      const currentData = existingCol.rows[0]?.data || {};
      const updatedData = {
        ...currentData,
        id: s.id,
        code: s.student_code,
        studentCode: s.student_code,
        traineeCode: s.student_code,
        fullName: s.full_name,
        groupId: s.group_id,
        groupName: s.group_name,
        branchId: s.branch_id,
        courseId: s.course_id,
        grade: s.grade,
        track: s.track
      };
      await queryNeon(`
        INSERT INTO collections (collection_name, id, data, updated_at)
        VALUES ('trainees', $1, $2, NOW())
        ON CONFLICT (collection_name, id) DO UPDATE SET
          data = EXCLUDED.data,
          updated_at = NOW();
      `, [s.id, JSON.stringify(updatedData)]);
    }

    // 4. Sync all healed attendance back to collections table in Neon
    console.log('Synchronizing healed attendance to collections table...');
    const allAtt = await queryNeon('SELECT * FROM attendance');
    for (const a of allAtt.rows) {
      const existingCol = await queryNeon('SELECT data FROM collections WHERE collection_name = $1 AND id = $2', ['attendance', a.id]);
      const currentData = existingCol.rows[0]?.data || {};
      const updatedData = {
        ...currentData,
        id: a.id,
        date: a.date,
        traineeId: a.trainee_id,
        groupId: a.group_id,
        status: a.status
      };
      await queryNeon(`
        INSERT INTO collections (collection_name, id, data, updated_at)
        VALUES ('attendance', $1, $2, NOW())
        ON CONFLICT (collection_name, id) DO UPDATE SET
          data = EXCLUDED.data,
          updated_at = NOW();
      `, [a.id, JSON.stringify(updatedData)]);
    }

    console.log('\n=== HEALING COMPLETED! RUNNING RE-VERIFICATION ===');
  } catch (err: any) {
    console.error('Healing error:', err);
  } finally {
    await neonPool.end();
    process.exit(0);
  }
}

healDatabaseRelations();
