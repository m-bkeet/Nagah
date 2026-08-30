# Nagah PostgreSQL Database Schema Foundation (Supabase / Cloud Run)

CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'branch_manager', 'trainer', 'student', 'parent', 'support');
CREATE TYPE device_status AS ENUM ('online', 'offline', 'maintenance', 'locked');
CREATE TYPE command_status AS ENUM ('queued', 'sent', 'acknowledged', 'running', 'completed', 'failed');

CREATE TABLE IF NOT EXISTS branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  city VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS labs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) NOT NULL,
  capacity INT DEFAULT 20,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  branch_id UUID REFERENCES branches(id),
  lab_id UUID REFERENCES labs(id),
  device_number INT NOT NULL,
  status device_status DEFAULT 'offline',
  agent_version VARCHAR(50),
  hostname VARCHAR(255),
  last_heartbeat TIMESTAMPTZ,
  current_student_code VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_code VARCHAR(10) UNIQUE NOT NULL, -- Capital English Letter + 3 digits (e.g. A001)
  full_name VARCHAR(255) NOT NULL,
  branch_id UUID REFERENCES branches(id),
  course_name VARCHAR(255),
  group_name VARCHAR(100),
  phone VARCHAR(50),
  parent_phone VARCHAR(50),
  financial_status VARCHAR(50) DEFAULT 'Regular',
  xp_points INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS care_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  record_type VARCHAR(100) NOT NULL, -- psychological, social, educational, behavioral
  content TEXT NOT NULL,
  created_by VARCHAR(255),
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
  device_id UUID REFERENCES devices(id),
  status VARCHAR(50) DEFAULT 'success',
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
