-- NAGAH MS - Full Relational PostgreSQL Database Schema
-- Architecture: Branch -> Track -> Field -> Level -> Course -> Group -> Student / Trainer -> Service / Transaction

CREATE TABLE IF NOT EXISTS branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  city VARCHAR(100),
  address TEXT,
  phone VARCHAR(50),
  manager_name VARCHAR(255),
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  short_code VARCHAR(10) NOT NULL,
  track_compatibility JSONB DEFAULT '[]'::jsonb,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) NOT NULL,
  field_id UUID REFERENCES fields(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  ordering INT DEFAULT 1,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  short_code VARCHAR(20) NOT NULL,
  field_id UUID REFERENCES fields(id),
  level_id UUID REFERENCES levels(id),
  ordering INT DEFAULT 1,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS trainers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_code VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  email VARCHAR(255),
  specializations JSONB,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_code VARCHAR(10) NOT NULL,
  name VARCHAR(255) NOT NULL,
  branch_id UUID REFERENCES branches(id),
  track_id UUID REFERENCES tracks(id),
  field_id UUID REFERENCES fields(id),
  level_id UUID REFERENCES levels(id),
  course_id UUID REFERENCES courses(id),
  trainer_id UUID REFERENCES trainers(id),
  capacity INT DEFAULT 20,
  schedule JSONB,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cohorts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_letter VARCHAR(5) UNIQUE NOT NULL,
  academic_year VARCHAR(20) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_code VARCHAR(20) UNIQUE NOT NULL,
  cohort_id UUID REFERENCES cohorts(id),
  full_name VARCHAR(255) NOT NULL,
  gender VARCHAR(10) DEFAULT 'male',
  phone VARCHAR(50),
  parent_phone VARCHAR(50),
  parent_name VARCHAR(255),
  parent_email VARCHAR(255),
  national_id VARCHAR(50),
  address TEXT,
  fee_amount NUMERIC(10,2) DEFAULT 0,
  discount_amount NUMERIC(10,2) DEFAULT 0,
  net_amount NUMERIC(10,2) DEFAULT 0,
  paid_amount NUMERIC(10,2) DEFAULT 0,
  remaining_amount NUMERIC(10,2) DEFAULT 0,
  financial_status VARCHAR(50) DEFAULT 'Regular',
  xp_points INT DEFAULT 0,
  photo_url TEXT,
  notes TEXT,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS student_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  student_code VARCHAR(20) NOT NULL,
  branch_id UUID REFERENCES branches(id),
  track_id UUID REFERENCES tracks(id),
  field_id UUID REFERENCES fields(id),
  level_id UUID REFERENCES levels(id),
  course_id UUID REFERENCES courses(id),
  group_id UUID REFERENCES groups(id),
  trainer_id UUID REFERENCES trainers(id),
  start_date DATE,
  end_date DATE,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS trainer_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID REFERENCES trainers(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id),
  track_id UUID REFERENCES tracks(id),
  field_id UUID REFERENCES fields(id),
  level_id UUID REFERENCES levels(id),
  course_id UUID REFERENCES courses(id),
  group_id UUID REFERENCES groups(id),
  schedule JSONB,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id),
  student_code VARCHAR(20) NOT NULL,
  enrollment_id UUID REFERENCES student_enrollments(id),
  group_id UUID REFERENCES groups(id),
  course_id UUID REFERENCES courses(id),
  trainer_id UUID REFERENCES trainers(id),
  branch_id UUID REFERENCES branches(id),
  date DATE NOT NULL,
  status VARCHAR(20) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_code VARCHAR(100) UNIQUE NOT NULL,
  student_id UUID REFERENCES students(id),
  enrollment_id UUID REFERENCES student_enrollments(id),
  amount NUMERIC(10,2) NOT NULL,
  payment_type VARCHAR(50) DEFAULT 'cash',
  notes TEXT,
  created_by VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_code VARCHAR(100) UNIQUE NOT NULL,
  payment_id UUID REFERENCES payments(id),
  student_id UUID REFERENCES students(id),
  enrollment_id UUID REFERENCES student_enrollments(id),
  amount NUMERIC(10,2) NOT NULL,
  sequence_number INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_code VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  course_id UUID REFERENCES courses(id),
  group_id UUID REFERENCES groups(id),
  trainer_id UUID REFERENCES trainers(id),
  due_date TIMESTAMPTZ,
  max_score INT DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_code VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  course_id UUID REFERENCES courses(id),
  group_id UUID REFERENCES groups(id),
  trainer_id UUID REFERENCES trainers(id),
  duration_minutes INT DEFAULT 60,
  total_marks INT DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_code VARCHAR(100) UNIQUE NOT NULL,
  student_id UUID REFERENCES students(id),
  course_id UUID REFERENCES courses(id),
  verification_token VARCHAR(255) UNIQUE NOT NULL,
  issue_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_code VARCHAR(100) UNIQUE NOT NULL,
  student_id UUID REFERENCES students(id),
  student_code VARCHAR(20) NOT NULL,
  enrollment_id UUID REFERENCES student_enrollments(id),
  branch_id UUID REFERENCES branches(id),
  track_id UUID REFERENCES tracks(id),
  field_id UUID REFERENCES fields(id),
  level_id UUID REFERENCES levels(id),
  course_id UUID REFERENCES courses(id),
  group_id UUID REFERENCES groups(id),
  service_type VARCHAR(50) NOT NULL,
  service_code VARCHAR(10) NOT NULL,
  sequence_number INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sequence_counters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_code VARCHAR(10) NOT NULL,
  context_key VARCHAR(100) NOT NULL,
  last_value INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(service_code, context_key)
);

CREATE TABLE IF NOT EXISTS qr_references (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token VARCHAR(255) UNIQUE NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  safe_payload JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id VARCHAR(255),
  role VARCHAR(50),
  action VARCHAR(100) NOT NULL,
  target_type VARCHAR(100),
  target_id VARCHAR(100),
  student_id UUID REFERENCES students(id),
  status VARCHAR(50) DEFAULT 'success',
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
