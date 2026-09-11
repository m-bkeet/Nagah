import fs from 'fs';
import path from 'path';
import { queryNeon } from '../server/dbNeon.js';

async function syncAllToNeon() {
  console.log('[Neon Sync] Starting comprehensive synchronization to Neon PostgreSQL...');
  
  const dbJsonPath = path.join(process.cwd(), 'data', 'database.json');
  if (!fs.existsSync(dbJsonPath)) {
    console.error('[Neon Sync] database.json not found!');
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(dbJsonPath, 'utf8'));

  try {
    // 1. Ensure all necessary tables and columns exist in Neon
    console.log('[Neon Sync] 1. Creating/Ensuring tables and columns...');
    await queryNeon(`
      -- Branches
      CREATE TABLE IF NOT EXISTS branches (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        city VARCHAR(100),
        address TEXT,
        phone VARCHAR(50),
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      ALTER TABLE branches ADD COLUMN IF NOT EXISTS code VARCHAR(50);
      ALTER TABLE branches ADD COLUMN IF NOT EXISTS manager_name VARCHAR(255);

      -- Trainers
      CREATE TABLE IF NOT EXISTS trainers (
        id VARCHAR(50) PRIMARY KEY,
        code VARCHAR(50),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(50),
        branch_id VARCHAR(50),
        specialty VARCHAR(100),
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- Courses
      CREATE TABLE IF NOT EXISTS courses (
        id VARCHAR(50) PRIMARY KEY,
        code VARCHAR(50),
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100),
        grade VARCHAR(100),
        branch_id VARCHAR(50),
        fee_amount NUMERIC(10, 2),
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- Groups
      CREATE TABLE IF NOT EXISTS groups (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        course_id VARCHAR(50),
        trainer_id VARCHAR(50),
        branch_id VARCHAR(50),
        track VARCHAR(50),
        grade VARCHAR(100),
        room_name VARCHAR(100),
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- Students
      CREATE TABLE IF NOT EXISTS students (
        id VARCHAR(50) PRIMARY KEY,
        student_code VARCHAR(50) UNIQUE NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        parent_phone VARCHAR(50),
        branch_id VARCHAR(50),
        track VARCHAR(100),
        level VARCHAR(50),
        group_name VARCHAR(100),
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      ALTER TABLE students ADD COLUMN IF NOT EXISTS group_id VARCHAR(50);
      ALTER TABLE students ADD COLUMN IF NOT EXISTS course_id VARCHAR(50);
      ALTER TABLE students ADD COLUMN IF NOT EXISTS parent_name VARCHAR(255);
      ALTER TABLE students ADD COLUMN IF NOT EXISTS points INT DEFAULT 0;
      ALTER TABLE students ADD COLUMN IF NOT EXISTS grade VARCHAR(100);

      -- Certificates
      CREATE TABLE IF NOT EXISTS certificates (
        id VARCHAR(50) PRIMARY KEY,
        student_id VARCHAR(50),
        student_name VARCHAR(255),
        course_name VARCHAR(255),
        issue_date DATE,
        verification_code VARCHAR(100) UNIQUE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 2. Remove fake seed branches if present
    console.log('[Neon Sync] 2. Removing placeholder branches...');
    await queryNeon(`
      DELETE FROM branches WHERE id IN ('branch-najah', 'branch-badr');
    `);

    // 3. Sync Real Branches
    console.log('[Neon Sync] 3. Syncing real branches...');
    for (const b of (data.branches || [])) {
      await queryNeon(`
        INSERT INTO branches (id, code, name, address, phone, manager_name, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (id) DO UPDATE SET
          code = EXCLUDED.code,
          name = EXCLUDED.name,
          address = EXCLUDED.address,
          phone = EXCLUDED.phone,
          manager_name = EXCLUDED.manager_name,
          status = EXCLUDED.status;
      `, [
        b.id,
        b.code || '',
        b.name || '',
        b.address || '',
        b.phone || '',
        b.managerName || '',
        b.status || 'active'
      ]);
    }

    // 4. Sync Trainers
    console.log('[Neon Sync] 4. Syncing trainers...');
    for (const tr of (data.trainers || [])) {
      await queryNeon(`
        INSERT INTO trainers (id, code, name, email, phone, branch_id, specialty, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (id) DO UPDATE SET
          code = EXCLUDED.code,
          name = EXCLUDED.name,
          email = EXCLUDED.email,
          phone = EXCLUDED.phone,
          branch_id = EXCLUDED.branch_id,
          specialty = EXCLUDED.specialty,
          status = EXCLUDED.status;
      `, [
        tr.id,
        tr.code || '',
        tr.name || '',
        tr.email || '',
        tr.phone || '',
        tr.branchId || null,
        tr.specialty || '',
        tr.status || 'active'
      ]);
    }

    // 5. Sync Courses
    console.log('[Neon Sync] 5. Syncing courses...');
    for (const crs of (data.courses || [])) {
      await queryNeon(`
        INSERT INTO courses (id, code, name, category, grade, branch_id, fee_amount, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (id) DO UPDATE SET
          code = EXCLUDED.code,
          name = EXCLUDED.name,
          category = EXCLUDED.category,
          grade = EXCLUDED.grade,
          branch_id = EXCLUDED.branch_id,
          fee_amount = EXCLUDED.fee_amount,
          status = EXCLUDED.status;
      `, [
        crs.id,
        crs.code || '',
        crs.name || '',
        crs.category || '',
        crs.grade || '',
        crs.branchId || null,
        crs.feeAmount || 0,
        crs.status || 'active'
      ]);
    }

    // 6. Sync Groups
    console.log('[Neon Sync] 6. Syncing groups...');
    for (const grp of (data.groups || [])) {
      await queryNeon(`
        INSERT INTO groups (id, name, course_id, trainer_id, branch_id, track, grade, room_name, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          course_id = EXCLUDED.course_id,
          trainer_id = EXCLUDED.trainer_id,
          branch_id = EXCLUDED.branch_id,
          track = EXCLUDED.track,
          grade = EXCLUDED.grade,
          room_name = EXCLUDED.room_name,
          status = EXCLUDED.status;
      `, [
        grp.id,
        grp.name || '',
        grp.courseId || null,
        grp.trainerId || null,
        grp.branchId || null,
        grp.track || 'عربي',
        grp.grade || '',
        grp.roomName || grp.hallName || '',
        grp.status || 'active'
      ]);
    }

    // 7. Sync Students (all 106 trainees)
    console.log(`[Neon Sync] 7. Syncing ${data.trainees?.length || 0} students...`);
    const groupMap = new Map();
    (data.groups || []).forEach((g: any) => groupMap.set(g.id, g.name));

    for (const st of (data.trainees || [])) {
      const code = st.code || st.studentCode || st.traineeCode || st.id;
      const grpName = groupMap.get(st.groupId) || '';
      await queryNeon(`
        INSERT INTO students (id, student_code, full_name, phone, parent_phone, parent_name, branch_id, group_id, course_id, track, grade, group_name, points, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        ON CONFLICT (id) DO UPDATE SET
          student_code = EXCLUDED.student_code,
          full_name = EXCLUDED.full_name,
          phone = EXCLUDED.phone,
          parent_phone = EXCLUDED.parent_phone,
          parent_name = EXCLUDED.parent_name,
          branch_id = EXCLUDED.branch_id,
          group_id = EXCLUDED.group_id,
          course_id = EXCLUDED.course_id,
          track = EXCLUDED.track,
          grade = EXCLUDED.grade,
          group_name = EXCLUDED.group_name,
          points = EXCLUDED.points,
          status = EXCLUDED.status;
      `, [
        st.id,
        code,
        st.fullName || st.name || '',
        st.phone || '',
        st.parentPhone || '',
        st.parentName || '',
        st.branchId || null,
        st.groupId || null,
        st.courseId || null,
        st.track || '',
        st.grade || '',
        grpName,
        st.points || st.totalPoints || 0,
        st.status || 'active'
      ]);
    }

    // Verify Counts in Neon
    console.log('[Neon Sync] 8. Verifying records in Neon...');
    const bCount = await queryNeon('SELECT COUNT(*) FROM branches');
    const sCount = await queryNeon('SELECT COUNT(*) FROM students');
    const cCount = await queryNeon('SELECT COUNT(*) FROM courses');
    const gCount = await queryNeon('SELECT COUNT(*) FROM groups');
    const tCount = await queryNeon('SELECT COUNT(*) FROM trainers');

    console.log('--------------------------------------------------');
    console.log('[Neon Sync] SYNCHRONIZATION SUCCESSFUL!');
    console.log(`- Branches in Neon: ${bCount.rows[0].count}`);
    console.log(`- Students in Neon: ${sCount.rows[0].count}`);
    console.log(`- Courses in Neon: ${cCount.rows[0].count}`);
    console.log(`- Groups in Neon: ${gCount.rows[0].count}`);
    console.log(`- Trainers in Neon: ${tCount.rows[0].count}`);
    console.log('--------------------------------------------------');

    process.exit(0);
  } catch (err: any) {
    console.error('[Neon Sync] Error during sync:', err);
    process.exit(1);
  }
}

syncAllToNeon();
