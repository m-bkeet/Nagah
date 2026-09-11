-- NAGAH MS - NEON PostgreSQL Database Schema Migration
-- Compatible with Neon Serverless & Vercel
-- Connection URL: postgresql://neondb_owner:npg_KDx6y4vLjRIE@ep-tiny-feather-b1gwujlu-pooler.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require

-- 1. Branches Table (الفروع)
CREATE TABLE IF NOT EXISTS branches (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  city VARCHAR(100),
  address TEXT,
  phone VARCHAR(50),
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Students Table (الطلاب)
CREATE TABLE IF NOT EXISTS students (
  id VARCHAR(50) PRIMARY KEY,
  student_code VARCHAR(20) UNIQUE NOT NULL, -- e.g. A001
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  parent_phone VARCHAR(50),
  branch_id VARCHAR(50) REFERENCES branches(id),
  track VARCHAR(100),
  level VARCHAR(50),
  group_name VARCHAR(100),
  status VARCHAR(20) DEFAULT 'active', -- active, graduated, suspended
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Finance / Payments Table (الحسابات والأقساط)
CREATE TABLE IF NOT EXISTS finance (
  id VARCHAR(50) PRIMARY KEY,
  student_id VARCHAR(50) REFERENCES students(id) ON DELETE CASCADE,
  amount NUMERIC(10, 2) NOT NULL,
  payment_type VARCHAR(50) NOT NULL, -- 'قسط', 'مصروفات', 'سند قبض'
  receipt_number VARCHAR(100) UNIQUE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Certificates Table (الشهادات)
CREATE TABLE IF NOT EXISTS certificates (
  id VARCHAR(50) PRIMARY KEY,
  student_id VARCHAR(50) REFERENCES students(id) ON DELETE CASCADE,
  course_name VARCHAR(255) NOT NULL,
  issue_date DATE DEFAULT CURRENT_DATE,
  verification_code VARCHAR(100) UNIQUE NOT NULL,
  qr_token TEXT
);

-- 5. Gamification Points Table (نقاط التحدي والتحفيز)
CREATE TABLE IF NOT EXISTS gamification_points (
  id VARCHAR(50) PRIMARY KEY,
  student_id VARCHAR(50) REFERENCES students(id) ON DELETE CASCADE,
  points INT DEFAULT 0,
  badge VARCHAR(100),
  reason TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Course Materials Table (المناهج والمذكرات ومرفقات Google Drive مرتبطة بالمجموعة)
CREATE TABLE IF NOT EXISTS course_materials (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  course_name VARCHAR(255) NOT NULL,
  branch_id VARCHAR(50) REFERENCES branches(id),
  group_name VARCHAR(100) DEFAULT 'عام', -- Group name association
  drive_file_id VARCHAR(255) NOT NULL, -- Google Drive File ID for preview iframe
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for lightning fast queries on Vercel serverless
CREATE INDEX IF NOT EXISTS idx_students_code ON students(student_code);
CREATE INDEX IF NOT EXISTS idx_students_branch ON students(branch_id);
CREATE INDEX IF NOT EXISTS idx_finance_student ON finance(student_id);
CREATE INDEX IF NOT EXISTS idx_certificates_code ON certificates(verification_code);
CREATE INDEX IF NOT EXISTS idx_materials_course ON course_materials(course_name);

-- Seed initial branches
INSERT INTO branches (id, name, city, phone, status) 
VALUES 
  ('branch-najah', 'فرع النجاح', 'المنصورة', '01000000001', 'active'),
  ('branch-badr', 'فرع بدر', 'القاهرة', '01000000002', 'active')
ON CONFLICT (id) DO NOTHING;
