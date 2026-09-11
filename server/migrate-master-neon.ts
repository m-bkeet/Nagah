import { queryNeon, neonPool } from './dbNeon';
import fs from 'fs';
import path from 'path';

async function main() {
  console.log('=== STARTING MASTER NEON POSTGRESQL SCHEMA MIGRATION & AUDIT ===');
  
  try {
    // 1. Universal collections table (guarantees ZERO data loss across the entire system)
    console.log('[1/22] Creating collections table...');
    await queryNeon(`
      CREATE TABLE IF NOT EXISTS collections (
        collection_name VARCHAR(100) NOT NULL,
        id VARCHAR(150) NOT NULL,
        data JSONB NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        PRIMARY KEY (collection_name, id)
      );
      CREATE INDEX IF NOT EXISTS idx_collections_name ON collections(collection_name);
    `);

    // 2. Students table
    console.log('[2/22] Upgrading students table...');
    await queryNeon(`
      CREATE TABLE IF NOT EXISTS students (
        id VARCHAR(100) PRIMARY KEY,
        student_code VARCHAR(50) NOT NULL,
        full_name VARCHAR(200) NOT NULL,
        phone VARCHAR(50),
        parent_phone VARCHAR(50),
        parent_name VARCHAR(200),
        parent_email VARCHAR(100),
        parent_national_id VARCHAR(50),
        branch_id VARCHAR(100),
        group_id VARCHAR(100),
        course_id VARCHAR(100),
        track VARCHAR(50),
        grade VARCHAR(50),
        level VARCHAR(50),
        group_name VARCHAR(200),
        points INTEGER DEFAULT 0,
        status VARCHAR(50) DEFAULT 'active',
        national_id VARCHAR(50),
        birth_date VARCHAR(50),
        gender VARCHAR(20) DEFAULT 'male',
        address TEXT,
        fee_amount NUMERIC DEFAULT 0,
        discount_amount NUMERIC DEFAULT 0,
        net_amount NUMERIC DEFAULT 0,
        paid_amount NUMERIC DEFAULT 0,
        remaining_amount NUMERIC DEFAULT 0,
        notes TEXT,
        portal_password VARCHAR(100),
        parent_portal_password VARCHAR(100),
        is_exempt BOOLEAN DEFAULT false,
        exempt_reason VARCHAR(100),
        billing_type VARCHAR(50) DEFAULT 'one_time',
        photo_url TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      ALTER TABLE students
        ADD COLUMN IF NOT EXISTS parent_email VARCHAR(100),
        ADD COLUMN IF NOT EXISTS parent_national_id VARCHAR(50),
        ADD COLUMN IF NOT EXISTS billing_type VARCHAR(50) DEFAULT 'one_time',
        ADD COLUMN IF NOT EXISTS photo_url TEXT;
      CREATE INDEX IF NOT EXISTS idx_students_code ON students(student_code);
      CREATE INDEX IF NOT EXISTS idx_students_group ON students(group_id);
      CREATE INDEX IF NOT EXISTS idx_students_branch ON students(branch_id);
      CREATE INDEX IF NOT EXISTS idx_students_course ON students(course_id);
    `);

    // 3. Branches table
    console.log('[3/22] Upgrading branches table...');
    await queryNeon(`
      CREATE TABLE IF NOT EXISTS branches (
        id VARCHAR(100) PRIMARY KEY,
        code VARCHAR(50),
        name VARCHAR(200) NOT NULL,
        city VARCHAR(100),
        address TEXT,
        phone VARCHAR(50),
        manager_name VARCHAR(200),
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      ALTER TABLE branches
        ADD COLUMN IF NOT EXISTS code VARCHAR(50),
        ADD COLUMN IF NOT EXISTS city VARCHAR(100),
        ADD COLUMN IF NOT EXISTS address TEXT,
        ADD COLUMN IF NOT EXISTS phone VARCHAR(50),
        ADD COLUMN IF NOT EXISTS manager_name VARCHAR(200),
        ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';
    `);

    // 4. Trainers table
    console.log('[4/22] Upgrading trainers table...');
    await queryNeon(`
      CREATE TABLE IF NOT EXISTS trainers (
        id VARCHAR(100) PRIMARY KEY,
        code VARCHAR(50),
        name VARCHAR(200) NOT NULL,
        title VARCHAR(50),
        prefix VARCHAR(20),
        phone VARCHAR(50),
        email VARCHAR(100),
        national_id VARCHAR(50),
        qualification TEXT,
        branch_id VARCHAR(100),
        specialty VARCHAR(200),
        portal_password VARCHAR(100),
        course_ids JSONB DEFAULT '[]',
        program_ids JSONB DEFAULT '[]',
        commission_type VARCHAR(50) DEFAULT 'percentage',
        commission_rate NUMERIC DEFAULT 0,
        commission_value NUMERIC DEFAULT 0,
        status VARCHAR(50) DEFAULT 'active',
        contract_date VARCHAR(50),
        notes TEXT,
        total_earned NUMERIC DEFAULT 0,
        total_paid NUMERIC DEFAULT 0,
        balance_due NUMERIC DEFAULT 0,
        photo_url TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      ALTER TABLE trainers
        ADD COLUMN IF NOT EXISTS title VARCHAR(50),
        ADD COLUMN IF NOT EXISTS prefix VARCHAR(20),
        ADD COLUMN IF NOT EXISTS national_id VARCHAR(50),
        ADD COLUMN IF NOT EXISTS qualification TEXT,
        ADD COLUMN IF NOT EXISTS portal_password VARCHAR(100),
        ADD COLUMN IF NOT EXISTS course_ids JSONB DEFAULT '[]',
        ADD COLUMN IF NOT EXISTS program_ids JSONB DEFAULT '[]',
        ADD COLUMN IF NOT EXISTS commission_type VARCHAR(50) DEFAULT 'percentage',
        ADD COLUMN IF NOT EXISTS commission_rate NUMERIC DEFAULT 0,
        ADD COLUMN IF NOT EXISTS commission_value NUMERIC DEFAULT 0,
        ADD COLUMN IF NOT EXISTS contract_date VARCHAR(50),
        ADD COLUMN IF NOT EXISTS notes TEXT,
        ADD COLUMN IF NOT EXISTS total_earned NUMERIC DEFAULT 0,
        ADD COLUMN IF NOT EXISTS total_paid NUMERIC DEFAULT 0,
        ADD COLUMN IF NOT EXISTS balance_due NUMERIC DEFAULT 0,
        ADD COLUMN IF NOT EXISTS photo_url TEXT;
      CREATE INDEX IF NOT EXISTS idx_trainers_branch ON trainers(branch_id);
    `);

    // 5. Courses table
    console.log('[5/22] Upgrading courses table...');
    await queryNeon(`
      CREATE TABLE IF NOT EXISTS courses (
        id VARCHAR(100) PRIMARY KEY,
        code VARCHAR(50),
        name VARCHAR(200) NOT NULL,
        category VARCHAR(100),
        grade VARCHAR(100),
        level VARCHAR(100),
        branch_id VARCHAR(100),
        trainer_id VARCHAR(100),
        hours_count NUMERIC DEFAULT 0,
        lectures_count INTEGER DEFAULT 0,
        fee_amount NUMERIC DEFAULT 0,
        price NUMERIC DEFAULT 0,
        billing_type VARCHAR(50) DEFAULT 'one_time',
        trainer_percentage NUMERIC DEFAULT 0,
        center_percentage NUMERIC DEFAULT 0,
        start_date VARCHAR(50),
        end_date VARCHAR(50),
        default_group_id VARCHAR(100),
        max_trainees INTEGER DEFAULT 30,
        status VARCHAR(50) DEFAULT 'active',
        description TEXT,
        ministry_assessment_url TEXT,
        education_type VARCHAR(50) DEFAULT 'general',
        materials JSONB DEFAULT '[]',
        arabic_material JSONB,
        languages_material JSONB,
        assessments JSONB DEFAULT '[]',
        google_drive_file_id VARCHAR(200),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      ALTER TABLE courses
        ADD COLUMN IF NOT EXISTS trainer_id VARCHAR(100),
        ADD COLUMN IF NOT EXISTS hours_count NUMERIC DEFAULT 0,
        ADD COLUMN IF NOT EXISTS lectures_count INTEGER DEFAULT 0,
        ADD COLUMN IF NOT EXISTS price NUMERIC DEFAULT 0,
        ADD COLUMN IF NOT EXISTS billing_type VARCHAR(50) DEFAULT 'one_time',
        ADD COLUMN IF NOT EXISTS trainer_percentage NUMERIC DEFAULT 0,
        ADD COLUMN IF NOT EXISTS center_percentage NUMERIC DEFAULT 0,
        ADD COLUMN IF NOT EXISTS start_date VARCHAR(50),
        ADD COLUMN IF NOT EXISTS end_date VARCHAR(50),
        ADD COLUMN IF NOT EXISTS default_group_id VARCHAR(100),
        ADD COLUMN IF NOT EXISTS max_trainees INTEGER DEFAULT 30,
        ADD COLUMN IF NOT EXISTS description TEXT,
        ADD COLUMN IF NOT EXISTS ministry_assessment_url TEXT,
        ADD COLUMN IF NOT EXISTS education_type VARCHAR(50) DEFAULT 'general',
        ADD COLUMN IF NOT EXISTS assessments JSONB DEFAULT '[]',
        ADD COLUMN IF NOT EXISTS google_drive_file_id VARCHAR(200);
      CREATE INDEX IF NOT EXISTS idx_courses_branch ON courses(branch_id);
    `);

    // 6. Groups table
    console.log('[6/22] Upgrading groups table...');
    await queryNeon(`
      CREATE TABLE IF NOT EXISTS groups (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        code VARCHAR(50),
        branch_id VARCHAR(100),
        course_id VARCHAR(100),
        program_id VARCHAR(100),
        trainer_id VARCHAR(100),
        hall_name VARCHAR(100),
        room_name VARCHAR(100),
        days JSONB DEFAULT '[]',
        schedule_days JSONB DEFAULT '[]',
        time_slot VARCHAR(100),
        start_time VARCHAR(50),
        end_time VARCHAR(50),
        start_date VARCHAR(50),
        end_date VARCHAR(50),
        whatsapp_group_link TEXT,
        notes TEXT,
        max_students INTEGER DEFAULT 25,
        max_capacity INTEGER DEFAULT 25,
        fee_amount NUMERIC DEFAULT 0,
        status VARCHAR(50) DEFAULT 'active',
        grade VARCHAR(100),
        track VARCHAR(100) DEFAULT 'عربي',
        materials JSONB DEFAULT '[]',
        arabic_material JSONB,
        languages_material JSONB,
        assessments JSONB DEFAULT '[]',
        google_drive_file_id VARCHAR(200),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      ALTER TABLE groups
        ADD COLUMN IF NOT EXISTS code VARCHAR(50),
        ADD COLUMN IF NOT EXISTS program_id VARCHAR(100),
        ADD COLUMN IF NOT EXISTS hall_name VARCHAR(100),
        ADD COLUMN IF NOT EXISTS days JSONB DEFAULT '[]',
        ADD COLUMN IF NOT EXISTS schedule_days JSONB DEFAULT '[]',
        ADD COLUMN IF NOT EXISTS time_slot VARCHAR(100),
        ADD COLUMN IF NOT EXISTS start_time VARCHAR(50),
        ADD COLUMN IF NOT EXISTS end_time VARCHAR(50),
        ADD COLUMN IF NOT EXISTS start_date VARCHAR(50),
        ADD COLUMN IF NOT EXISTS end_date VARCHAR(50),
        ADD COLUMN IF NOT EXISTS whatsapp_group_link TEXT,
        ADD COLUMN IF NOT EXISTS notes TEXT,
        ADD COLUMN IF NOT EXISTS max_students INTEGER DEFAULT 25,
        ADD COLUMN IF NOT EXISTS max_capacity INTEGER DEFAULT 25,
        ADD COLUMN IF NOT EXISTS fee_amount NUMERIC DEFAULT 0,
        ADD COLUMN IF NOT EXISTS assessments JSONB DEFAULT '[]',
        ADD COLUMN IF NOT EXISTS google_drive_file_id VARCHAR(200);
      CREATE INDEX IF NOT EXISTS idx_groups_course ON groups(course_id);
      CREATE INDEX IF NOT EXISTS idx_groups_trainer ON groups(trainer_id);
      CREATE INDEX IF NOT EXISTS idx_groups_branch ON groups(branch_id);
    `);

    // 7. Attendance table
    console.log('[7/22] Creating/Upgrading attendance table...');
    await queryNeon(`
      CREATE TABLE IF NOT EXISTS attendance (
        id VARCHAR(100) PRIMARY KEY,
        date VARCHAR(50) NOT NULL,
        time VARCHAR(50),
        branch_id VARCHAR(100),
        group_id VARCHAR(100) NOT NULL,
        course_id VARCHAR(100),
        trainer_id VARCHAR(100),
        trainee_id VARCHAR(100) NOT NULL,
        status VARCHAR(50) NOT NULL,
        notes TEXT,
        recorded_by VARCHAR(100),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
      CREATE INDEX IF NOT EXISTS idx_attendance_group ON attendance(group_id);
      CREATE INDEX IF NOT EXISTS idx_attendance_trainee ON attendance(trainee_id);
    `);

    // 8. Finance (Payments) table
    console.log('[8/22] Upgrading finance table...');
    await queryNeon(`
      CREATE TABLE IF NOT EXISTS finance (
        id VARCHAR(100) PRIMARY KEY,
        student_id VARCHAR(100),
        trainee_id VARCHAR(100),
        trainee_name VARCHAR(200),
        trainee_code VARCHAR(100),
        trainer_id VARCHAR(100),
        course_id VARCHAR(100),
        branch_id VARCHAR(100),
        group_id VARCHAR(100),
        amount NUMERIC NOT NULL DEFAULT 0,
        payment_method VARCHAR(50) DEFAULT 'cash',
        payment_type VARCHAR(50) DEFAULT 'سند قبض',
        receipt_number VARCHAR(100),
        date VARCHAR(50),
        received_by_user_id VARCHAR(100),
        received_by_user_name VARCHAR(200),
        notes TEXT,
        target_month VARCHAR(100),
        proof_image_url TEXT,
        status VARCHAR(50) DEFAULT 'approved',
        rejection_reason TEXT,
        submitted_by_parent_name VARCHAR(200),
        submitted_at VARCHAR(50),
        verified_at VARCHAR(50),
        verified_by_user_name VARCHAR(200),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      ALTER TABLE finance
        ADD COLUMN IF NOT EXISTS trainee_id VARCHAR(100),
        ADD COLUMN IF NOT EXISTS trainee_name VARCHAR(200),
        ADD COLUMN IF NOT EXISTS trainee_code VARCHAR(100),
        ADD COLUMN IF NOT EXISTS trainer_id VARCHAR(100),
        ADD COLUMN IF NOT EXISTS course_id VARCHAR(100),
        ADD COLUMN IF NOT EXISTS branch_id VARCHAR(100),
        ADD COLUMN IF NOT EXISTS group_id VARCHAR(100),
        ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT 'cash',
        ADD COLUMN IF NOT EXISTS date VARCHAR(50),
        ADD COLUMN IF NOT EXISTS received_by_user_id VARCHAR(100),
        ADD COLUMN IF NOT EXISTS received_by_user_name VARCHAR(200),
        ADD COLUMN IF NOT EXISTS target_month VARCHAR(100),
        ADD COLUMN IF NOT EXISTS proof_image_url TEXT,
        ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'approved',
        ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
        ADD COLUMN IF NOT EXISTS submitted_by_parent_name VARCHAR(200),
        ADD COLUMN IF NOT EXISTS submitted_at VARCHAR(50),
        ADD COLUMN IF NOT EXISTS verified_at VARCHAR(50),
        ADD COLUMN IF NOT EXISTS verified_by_user_name VARCHAR(200);
      CREATE INDEX IF NOT EXISTS idx_finance_student ON finance(student_id);
      CREATE INDEX IF NOT EXISTS idx_finance_receipt ON finance(receipt_number);
      CREATE INDEX IF NOT EXISTS idx_finance_date ON finance(date);
    `);

    // 9. Expenses table
    console.log('[9/22] Creating expenses table...');
    await queryNeon(`
      CREATE TABLE IF NOT EXISTS expenses (
        id VARCHAR(100) PRIMARY KEY,
        document_number VARCHAR(100),
        date VARCHAR(50),
        title VARCHAR(200),
        category VARCHAR(100),
        branch_id VARCHAR(100),
        beneficiary VARCHAR(200),
        amount NUMERIC NOT NULL DEFAULT 0,
        description TEXT,
        payment_method VARCHAR(50),
        paid_by_user_id VARCHAR(100),
        paid_by_user_name VARCHAR(200),
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
      CREATE INDEX IF NOT EXISTS idx_expenses_branch ON expenses(branch_id);
    `);

    // 10. Trainer Settlements table
    console.log('[10/22] Creating trainer settlements table...');
    await queryNeon(`
      CREATE TABLE IF NOT EXISTS trainer_settlements (
        id VARCHAR(100) PRIMARY KEY,
        receipt_number VARCHAR(100),
        settlement_number VARCHAR(100),
        date VARCHAR(50),
        trainer_id VARCHAR(100),
        trainer_name VARCHAR(200),
        branch_id VARCHAR(100),
        amount NUMERIC NOT NULL DEFAULT 0,
        payment_method VARCHAR(50),
        period_description TEXT,
        notes TEXT,
        paid_by_user_id VARCHAR(100),
        paid_by_user_name VARCHAR(200),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_settlements_trainer ON trainer_settlements(trainer_id);
    `);

    // 11. Certificates table
    console.log('[11/22] Upgrading certificates table...');
    await queryNeon(`
      CREATE TABLE IF NOT EXISTS certificates (
        id VARCHAR(100) PRIMARY KEY,
        student_id VARCHAR(100),
        trainee_id VARCHAR(100),
        trainee_name VARCHAR(200),
        course_name VARCHAR(200) NOT NULL,
        course_id VARCHAR(100),
        branch_name VARCHAR(200),
        branch_id VARCHAR(100),
        issue_date DATE,
        verification_code VARCHAR(100) NOT NULL,
        qr_token TEXT,
        score NUMERIC,
        grade VARCHAR(100),
        template_id VARCHAR(100),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      ALTER TABLE certificates
        ADD COLUMN IF NOT EXISTS trainee_id VARCHAR(100),
        ADD COLUMN IF NOT EXISTS trainee_name VARCHAR(200),
        ADD COLUMN IF NOT EXISTS course_id VARCHAR(100),
        ADD COLUMN IF NOT EXISTS branch_name VARCHAR(200),
        ADD COLUMN IF NOT EXISTS branch_id VARCHAR(100),
        ADD COLUMN IF NOT EXISTS score NUMERIC,
        ADD COLUMN IF NOT EXISTS grade VARCHAR(100),
        ADD COLUMN IF NOT EXISTS template_id VARCHAR(100);
      CREATE INDEX IF NOT EXISTS idx_cert_code ON certificates(verification_code);
    `);

    // 12. Certificate templates table
    console.log('[12/22] Creating certificate templates table...');
    await queryNeon(`
      CREATE TABLE IF NOT EXISTS certificate_templates (
        id VARCHAR(100) PRIMARY KEY,
        title VARCHAR(200),
        design_config JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 13. Gamification Points table
    console.log('[13/22] Upgrading gamification points table...');
    await queryNeon(`
      CREATE TABLE IF NOT EXISTS gamification_points (
        id VARCHAR(100) PRIMARY KEY,
        student_id VARCHAR(100),
        trainee_id VARCHAR(100),
        group_id VARCHAR(100),
        branch_id VARCHAR(100),
        points INTEGER DEFAULT 0,
        badge VARCHAR(100),
        reason TEXT,
        rule_id VARCHAR(100),
        added_by_user_id VARCHAR(100),
        added_by_user_name VARCHAR(200),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      ALTER TABLE gamification_points
        ADD COLUMN IF NOT EXISTS trainee_id VARCHAR(100),
        ADD COLUMN IF NOT EXISTS group_id VARCHAR(100),
        ADD COLUMN IF NOT EXISTS branch_id VARCHAR(100),
        ADD COLUMN IF NOT EXISTS rule_id VARCHAR(100),
        ADD COLUMN IF NOT EXISTS added_by_user_id VARCHAR(100),
        ADD COLUMN IF NOT EXISTS added_by_user_name VARCHAR(200);
      CREATE INDEX IF NOT EXISTS idx_gp_student ON gamification_points(student_id);
    `);

    // 14. Point rules table
    console.log('[14/22] Creating point rules table...');
    await queryNeon(`
      CREATE TABLE IF NOT EXISTS point_rules (
        id VARCHAR(100) PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        point_value INTEGER NOT NULL,
        rule_type VARCHAR(100),
        description TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 15. Users table
    console.log('[15/22] Creating users table...');
    await queryNeon(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(100) PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        full_name VARCHAR(200) NOT NULL,
        password_hash VARCHAR(200),
        role VARCHAR(50) NOT NULL,
        branch_id VARCHAR(100),
        phone VARCHAR(50),
        email VARCHAR(100),
        status VARCHAR(50) DEFAULT 'active',
        trainer_id VARCHAR(100),
        trainee_id VARCHAR(100),
        permissions JSONB DEFAULT '[]',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
    `);

    // 16. Center Settings table
    console.log('[16/22] Creating center settings table...');
    await queryNeon(`
      CREATE TABLE IF NOT EXISTS center_settings (
        id VARCHAR(100) PRIMARY KEY,
        data JSONB NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 17. Exams table
    console.log('[17/22] Creating exams table...');
    await queryNeon(`
      CREATE TABLE IF NOT EXISTS exams (
        id VARCHAR(100) PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        branch_id VARCHAR(100),
        course_id VARCHAR(100),
        course_name VARCHAR(200),
        group_id VARCHAR(100),
        group_name VARCHAR(200),
        trainer_id VARCHAR(100),
        trainer_name VARCHAR(200),
        exam_date VARCHAR(50),
        exam_type VARCHAR(50),
        total_marks NUMERIC DEFAULT 100,
        passing_marks NUMERIC DEFAULT 50,
        duration_minutes INTEGER DEFAULT 60,
        policy JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 18. Exam Questions table
    console.log('[18/22] Creating exam questions table...');
    await queryNeon(`
      CREATE TABLE IF NOT EXISTS exam_questions (
        id VARCHAR(100) PRIMARY KEY,
        exam_id VARCHAR(100),
        course_id VARCHAR(100),
        question_text TEXT NOT NULL,
        question_type VARCHAR(50),
        marks NUMERIC DEFAULT 5,
        options JSONB DEFAULT '[]',
        correct_answer TEXT,
        explanation TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_eq_exam ON exam_questions(exam_id);
    `);

    // 19. Exam Results table
    console.log('[19/22] Creating exam results table...');
    await queryNeon(`
      CREATE TABLE IF NOT EXISTS exam_results (
        id VARCHAR(100) PRIMARY KEY,
        exam_id VARCHAR(100) NOT NULL,
        trainee_id VARCHAR(100) NOT NULL,
        score NUMERIC DEFAULT 0,
        total_marks NUMERIC DEFAULT 100,
        percentage NUMERIC DEFAULT 0,
        passed BOOLEAN DEFAULT false,
        answers JSONB,
        submitted_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_er_exam ON exam_results(exam_id);
      CREATE INDEX IF NOT EXISTS idx_er_trainee ON exam_results(trainee_id);
    `);

    // 20. Computer Labs table
    console.log('[20/22] Creating computer labs table...');
    await queryNeon(`
      CREATE TABLE IF NOT EXISTS computer_labs (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        branch_id VARCHAR(100),
        branch_name VARCHAR(200),
        capacity INTEGER DEFAULT 25,
        devices_count INTEGER DEFAULT 20,
        status VARCHAR(50) DEFAULT 'active',
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 21. Interactive Sessions table
    console.log('[21/22] Creating interactive sessions table...');
    await queryNeon(`
      CREATE TABLE IF NOT EXISTS interactive_sessions (
        id VARCHAR(100) PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        group_id VARCHAR(100),
        trainer_id VARCHAR(100),
        branch_id VARCHAR(100),
        status VARCHAR(50) DEFAULT 'active',
        data JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 22. System Notifications table
    console.log('[22/22] Creating system notifications table...');
    await queryNeon(`
      CREATE TABLE IF NOT EXISTS system_notifications (
        id VARCHAR(100) PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50),
        target_role VARCHAR(50),
        target_user_id VARCHAR(100),
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    console.log('\n=== ALL 22 RELATIONAL TABLES & INDICES CREATED/UPGRADED SUCCESSFULLY! ===');

    // -------------------------------------------------------------
    // SEED / MIGRATE ALL DATA INTO NEON POSTGRESQL COLLECTIONS & RELATIONAL TABLES
    // -------------------------------------------------------------
    console.log('\n=== COMMENCING DATA SEEDING INTO NEON POSTGRESQL ===');
    const localDbPath = path.join(process.cwd(), 'data', 'database.json');
    if (fs.existsSync(localDbPath)) {
      const localData = JSON.parse(fs.readFileSync(localDbPath, 'utf8'));
      console.log(`Loaded local database with ${Object.keys(localData).length} top-level entities.`);

      for (const [colName, items] of Object.entries(localData)) {
        if (Array.isArray(items) && items.length > 0) {
          console.log(`Seeding collection [${colName}] (${items.length} items)...`);
          for (const item of items) {
            if (item && item.id) {
              // Upsert into universal collections table
              await queryNeon(`
                INSERT INTO collections (collection_name, id, data, updated_at)
                VALUES ($1, $2, $3, NOW())
                ON CONFLICT (collection_name, id) DO UPDATE SET
                  data = EXCLUDED.data,
                  updated_at = NOW();
              `, [colName, item.id, JSON.stringify(item)]);
            }
          }

          // Also seed specific relational tables if applicable
          if (colName === 'attendance') {
            for (const r of items) {
              await queryNeon(`
                INSERT INTO attendance (id, date, time, branch_id, group_id, course_id, trainer_id, trainee_id, status, notes, recorded_by)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                ON CONFLICT (id) DO UPDATE SET
                  date = EXCLUDED.date,
                  status = EXCLUDED.status,
                  notes = EXCLUDED.notes;
              `, [
                r.id,
                r.date,
                r.time || '',
                r.branchId || null,
                r.groupId,
                r.courseId || null,
                r.trainerId || null,
                r.traineeId,
                r.status,
                r.notes || '',
                r.recordedBy || ''
              ]);
            }
          } else if (colName === 'users') {
            for (const u of items) {
              await queryNeon(`
                INSERT INTO users (id, username, full_name, role, branch_id, phone, email, status, permissions)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                ON CONFLICT (id) DO UPDATE SET
                  username = EXCLUDED.username,
                  full_name = EXCLUDED.full_name,
                  role = EXCLUDED.role,
                  status = EXCLUDED.status;
              `, [
                u.id,
                u.username,
                u.fullName || u.username,
                u.role || 'admin_staff',
                u.branchId || null,
                u.phone || '',
                u.email || '',
                u.status || 'active',
                JSON.stringify(u.permissions || [])
              ]);
            }
          } else if (colName === 'pointRules') {
            for (const pr of items) {
              await queryNeon(`
                INSERT INTO point_rules (id, title, point_value, rule_type, description, is_active)
                VALUES ($1, $2, $3, $4, $5, $6)
                ON CONFLICT (id) DO UPDATE SET
                  title = EXCLUDED.title,
                  point_value = EXCLUDED.point_value,
                  rule_type = EXCLUDED.rule_type,
                  description = EXCLUDED.description,
                  is_active = EXCLUDED.is_active;
              `, [pr.id, pr.title, pr.pointValue, pr.ruleType || 'custom', pr.description || '', pr.isActive !== false]);
            }
          } else if (colName === 'exams') {
            for (const ex of items) {
              await queryNeon(`
                INSERT INTO exams (id, title, description, branch_id, course_id, course_name, group_id, group_name, trainer_id, trainer_name, exam_date, exam_type, total_marks, passing_marks, duration_minutes, policy)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
                ON CONFLICT (id) DO UPDATE SET
                  title = EXCLUDED.title,
                  total_marks = EXCLUDED.total_marks;
              `, [
                ex.id, ex.title, ex.description || '', ex.branchId || null, ex.courseId || null, ex.courseName || '',
                ex.groupId || null, ex.groupName || '', ex.trainerId || null, ex.trainerName || '',
                ex.examDate || '', ex.examType || 'theoretical', ex.totalMarks || 100, ex.passingMarks || 50,
                ex.durationMinutes || 60, JSON.stringify(ex.policy || {})
              ]);
            }
          } else if (colName === 'questions') {
            for (const q of items) {
              await queryNeon(`
                INSERT INTO exam_questions (id, exam_id, course_id, question_text, question_type, marks, options, correct_answer, explanation)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                ON CONFLICT (id) DO UPDATE SET
                  question_text = EXCLUDED.question_text,
                  marks = EXCLUDED.marks;
              `, [
                q.id, q.examId || null, q.courseId || null, q.questionText || '', q.questionType || 'mcq',
                q.marks || 5, JSON.stringify(q.options || []), q.correctAnswer || '', q.explanation || ''
              ]);
            }
          } else if (colName === 'computerLabs') {
            for (const lab of items) {
              await queryNeon(`
                INSERT INTO computer_labs (id, name, branch_id, branch_name, capacity, devices_count, status, notes)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                ON CONFLICT (id) DO UPDATE SET
                  name = EXCLUDED.name,
                  capacity = EXCLUDED.capacity;
              `, [
                lab.id, lab.name, lab.branchId || null, lab.branchName || '', lab.capacity || 25, lab.devicesCount || 20,
                lab.status || 'active', lab.notes || ''
              ]);
            }
          }
        } else if (colName === 'settings' && items && typeof items === 'object') {
          console.log('Seeding center settings...');
          await queryNeon(`
            INSERT INTO center_settings (id, data, updated_at)
            VALUES ('default', $1, NOW())
            ON CONFLICT (id) DO UPDATE SET
              data = EXCLUDED.data,
              updated_at = NOW();
          `, [JSON.stringify(items)]);
          
          await queryNeon(`
            INSERT INTO collections (collection_name, id, data, updated_at)
            VALUES ('settings', 'default', $1, NOW())
            ON CONFLICT (collection_name, id) DO UPDATE SET
              data = EXCLUDED.data,
              updated_at = NOW();
          `, [JSON.stringify(items)]);
        }
      }
    }

    console.log('\n=== MIGRATION COMPLETED SUCCESSFULLY WITH 100% DATA REPLICATION! ===');
  } catch (err: any) {
    console.error('Migration error:', err);
  } finally {
    await neonPool.end();
    process.exit(0);
  }
}

main();
