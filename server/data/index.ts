import { createClient } from '@supabase/supabase-js';
import { db } from '../db';
import { queryNeon } from '../dbNeon';
import {
  Trainee,
  Branch,
  Course,
  Program,
  Group,
  Trainer,
  AttendanceRecord,
  Payment,
  Expense,
  Exam,
  ExamQuestion,
  ExamResult,
  PointRule,
  PointTransaction,
  Certificate,
  CertificateTemplate,
  User,
  AuditLog,
  CenterSettings,
  Device,
  DeviceCommand,
  ComputerLab,
  InteractiveSession,
  TraineeScreenshot
} from '../../src/types';

function cleanSupabaseUrl(raw?: string): string {
  if (!raw) return 'https://zdbrwwkyxjujrokzjang.supabase.co';
  let url = raw.trim().replace(/\/+$/, '');
  while (/\/rest\/v1$/i.test(url)) {
    url = url.replace(/\/rest\/v1$/i, '').replace(/\/+$/, '');
  }
  return url.trim() || 'https://zdbrwwkyxjujrokzjang.supabase.co';
}

const SUPABASE_URL = cleanSupabaseUrl(process.env.SUPABASE_URL);
const SUPABASE_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkYnJ3d2t5eGp1anJva3pqYW5nIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODA0ODY0MiwiZXhwIjoyMTAzNjI0NjQyfQ._JEu3kjLDPWS1uCabeVMyTRIeDS0NpnjTPUjyuL6_Ec').trim();
// Completely migrated to Neon PostgreSQL to prevent latency, timeouts, and overwriting data
const hasValidSupabase = false;

export let supabaseClient: any = null;
let isSupabaseQuotaRestricted = false;

if (hasValidSupabase) {
  try {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false }
    });
  } catch (e: any) {
    console.error('[DataLayer] Failed to create Supabase client:', e.message);
    supabaseClient = null;
  }
}

function handleSupabaseError(action: string, key: string, id: string, msg: string) {
  if (msg.includes('exceed_egress_quota') || msg.includes('restricted') || msg.includes('quota')) {
    if (!isSupabaseQuotaRestricted) {
      isSupabaseQuotaRestricted = true;
      console.warn('[SupabaseRepo] Quota restriction reached (exceed_egress_quota). Seamlessly operating in resilient local storage mode.');
    }
  } else {
    console.error(`[SupabaseRepo] ${action} error for ${key}/${id}:`, msg);
  }
}

export async function hydrateAllFromSupabase(): Promise<number> {
  if (!supabaseClient || isSupabaseQuotaRestricted) {
    return 0;
  }

  try {
    const { data, error } = await supabaseClient
      .from('collections')
      .select('collection_name, id, data, updated_at')
      .range(0, 4999);

    if (error) {
      if (error.message && (error.message.includes('exceed_egress_quota') || error.message.includes('restricted') || error.message.includes('quota'))) {
        isSupabaseQuotaRestricted = true;
        console.warn('[Hydration] Supabase project exceeded egress quota. Running seamlessly on local storage without interruption.');
      } else {
        console.error('[Hydration] Error reading collections from Supabase:', error.message);
      }
      return 0;
    }

    if (Array.isArray(data)) {
      const memData = db.getData() as any;
      const grouped: Record<string, any[]> = {};
      data.forEach((row: any) => {
        const cName = row.collection_name;
        if (!grouped[cName]) grouped[cName] = [];
        grouped[cName].push({ id: row.id, ...(row.data || {}) });
      });

      for (const [colName, items] of Object.entries(grouped)) {
        memData[colName] = items;
      }

      console.log(`[Hydration] Successfully loaded ${data.length} documents from Supabase public.collections across ${Object.keys(grouped).length} collections.`);
      
      // Auto-Seed Disabled to prevent resurrecting deleted data
      if (false) {
        console.log('[Hydration] Supabase is empty. Seeding from local memory data...');
        const inserts = [];
        for (const [cName, cItems] of Object.entries(memData)) {
          if (Array.isArray(cItems) && cItems.length > 0) {
            for (const item of cItems) {
              if (item && item.id) {
                inserts.push({
                  collection_name: cName,
                  id: item.id,
                  data: item,
                  updated_at: new Date().toISOString()
                });
              }
            }
          }
        }
        
        if (inserts.length > 0) {
          const chunkSize = 500;
          for (let i = 0; i < inserts.length; i += chunkSize) {
            const chunk = inserts.slice(i, i + chunkSize);
            const { error: seedError } = await supabaseClient.from('collections').insert(chunk);
            if (seedError) console.error('[Hydration] Error seeding Supabase:', seedError);
            else console.log(`[Hydration] Seeded chunk of ${chunk.length} items.`);
          }
        }
      }
      return data.length;
    }
  } catch (err: any) {
    console.error('[Hydration] Exception hydrating from Supabase:', err.message);
  }
  return 0;
}

export async function hydrateAllFromNeon(): Promise<void> {
  console.log('[Neon Hydration] Commencing live database hydration from Neon PostgreSQL...');
  try {
    const memData = db.getData() as any;

    // 1. Hydrate all collections from collections table in Neon
    const colRes = await queryNeon('SELECT collection_name, data FROM collections');
    if (colRes && colRes.rows.length > 0) {
      const grouped: Record<string, any[]> = {};
      for (const row of colRes.rows) {
        if (row.collection_name === 'settings') {
          memData.settings = row.data;
          continue;
        }
        if (!grouped[row.collection_name]) grouped[row.collection_name] = [];
        grouped[row.collection_name].push(row.data);
      }
      for (const colName of Object.keys(grouped)) {
        memData[colName] = grouped[colName];
      }
      console.log(`[Neon Hydration] Successfully loaded ${colRes.rows.length} documents across ${Object.keys(grouped).length} collections from Neon!`);
    }

    // 2. Overlay relational tables to guarantee relational foreign-key consistency
    const [b, t, c, g, s, fin, cert, gp, att, exp, usr] = await Promise.all([
      queryNeon('SELECT * FROM branches').catch(() => null),
      queryNeon('SELECT * FROM trainers').catch(() => null),
      queryNeon('SELECT * FROM courses').catch(() => null),
      queryNeon('SELECT * FROM groups').catch(() => null),
      queryNeon('SELECT * FROM students').catch(() => null),
      queryNeon('SELECT * FROM finance').catch(() => null),
      queryNeon('SELECT * FROM certificates').catch(() => null),
      queryNeon('SELECT * FROM gamification_points').catch(() => null),
      queryNeon('SELECT * FROM attendance').catch(() => null),
      queryNeon('SELECT * FROM expenses').catch(() => null),
      queryNeon('SELECT * FROM users').catch(() => null)
    ]);

    if (b && b.rows.length) {
      memData.branches = b.rows.map(r => ({
        id: r.id,
        code: r.code || '',
        name: r.name,
        city: r.city || '',
        address: r.address || '',
        phone: r.phone || '',
        managerName: r.manager_name || '',
        status: r.status || 'active'
      }));
    }

    if (t && t.rows.length) {
      memData.trainers = t.rows.map(r => ({
        id: r.id,
        code: r.code || '',
        name: r.name,
        email: r.email || '',
        phone: r.phone || '',
        branchId: r.branch_id || null,
        specialty: r.specialty || '',
        status: r.status || 'active'
      }));
    }

    if (c && c.rows.length) {
      const existingCoursesMap = new Map();
      (memData.courses || []).forEach((x: any) => existingCoursesMap.set(x.id, x));

      memData.courses = c.rows.map(r => {
        const old = existingCoursesMap.get(r.id) || {};
        return {
          ...old,
          id: r.id,
          code: r.code || old.code || '',
          name: r.name,
          category: r.category || old.category || '',
          grade: r.grade || old.grade || '',
          branchId: r.branch_id || old.branchId || null,
          feeAmount: Number(r.fee_amount) || old.feeAmount || 0,
          status: r.status || old.status || 'active',
          materials: r.materials || old.materials || [],
          arabicMaterial: r.arabic_material || old.arabicMaterial || null,
          languagesMaterial: r.languages_material || old.languagesMaterial || null,
          hoursCount: Number(r.hours_count) || old.hoursCount || 8,
          lecturesCount: Number(r.lectures_count) || old.lecturesCount || 64,
          billingType: r.billing_type || old.billingType || 'monthly',
          description: r.description || old.description || '',
          maxTrainees: r.max_trainees || old.maxTrainees || 20
        };
      });
    }

    if (g && g.rows.length) {
      const existingGroupsMap = new Map();
      (memData.groups || []).forEach((x: any) => existingGroupsMap.set(x.id, x));

      memData.groups = g.rows.map(r => {
        const old = existingGroupsMap.get(r.id) || {};
        const days = (Array.isArray(r.schedule_days) && r.schedule_days.length > 0)
          ? r.schedule_days
          : (Array.isArray(r.days) && r.days.length > 0)
            ? r.days
            : (old.scheduleDays || old.days || []);

        return {
          ...old,
          id: r.id,
          name: r.name,
          courseId: r.course_id || old.courseId || null,
          trainerId: r.trainer_id || old.trainerId || null,
          branchId: r.branch_id || old.branchId || null,
          track: r.track || old.track || 'عربي',
          grade: r.grade || old.grade || '',
          roomName: r.room_name || old.roomName || 'قاعة 1',
          hallName: r.hall_name || old.hallName || r.room_name || old.roomName || 'قاعة 1',
          status: r.status || old.status || 'active',
          materials: r.materials || old.materials || [],
          arabicMaterial: r.arabic_material || old.arabicMaterial || null,
          languagesMaterial: r.languages_material || old.languagesMaterial || null,
          scheduleDays: days,
          days: days,
          startTime: r.start_time || old.startTime || '16:00',
          endTime: r.end_time || old.endTime || '18:00',
          timeSlot: r.time_slot || old.timeSlot || '',
          startDate: r.start_date || old.startDate || '',
          endDate: r.end_date || old.endDate || '',
          maxCapacity: r.max_capacity || old.maxCapacity || 25,
          maxStudents: r.max_students || old.maxStudents || 25,
          whatsappGroupLink: r.whatsapp_group_link || old.whatsappGroupLink || '',
          notes: r.notes || old.notes || '',
          feeAmount: r.fee_amount != null ? Number(r.fee_amount) : (old.feeAmount || 0)
        };
      });
    }

    if (s && s.rows.length) {
      const existingTraineesMap = new Map();
      (memData.trainees || []).forEach((x: any) => existingTraineesMap.set(x.id, x));

      memData.trainees = s.rows.map(r => {
        const old = existingTraineesMap.get(r.id) || {};
        const isoDate = r.created_at ? (r.created_at instanceof Date ? r.created_at.toISOString() : new Date(r.created_at).toISOString()) : new Date().toISOString();
        return {
          ...old,
          id: r.id,
          code: r.student_code,
          studentCode: r.student_code,
          traineeCode: r.student_code,
          fullName: r.full_name,
          phone: r.phone || '',
          parentPhone: r.parent_phone || '',
          parentName: r.parent_name || '',
          branchId: r.branch_id || null,
          groupId: r.group_id || null,
          courseId: r.course_id || null,
          track: r.track || '',
          grade: r.grade || '',
          groupName: r.group_name || '',
          points: r.points || 0,
          totalPoints: r.points || 0,
          status: r.status || 'active',
          createdAt: isoDate,
          registrationDate: isoDate.slice(0, 10),
          nationalId: r.national_id || '',
          birthDate: r.birth_date || '',
          gender: r.gender || 'male',
          address: r.address || '',
          feeAmount: Number(r.fee_amount) || 0,
          discountAmount: Number(r.discount_amount) || 0,
          netAmount: Number(r.net_amount) || 0,
          paidAmount: Number(r.paid_amount) || 0,
          remainingAmount: Number(r.remaining_amount) || 0,
          notes: r.notes || '',
          portalPassword: r.portal_password || '',
          parentPortalPassword: r.parent_portal_password || '',
          isExempt: r.is_exempt === true,
          exemptReason: r.exempt_reason || '',
          photoUrl: r.photo_url || ''
        };
      });
    }

    if (cert && cert.rows.length) {
      memData.certificates = cert.rows.map(r => ({
        id: r.id,
        traineeId: r.student_id,
        courseName: r.course_name,
        issueDate: r.issue_date ? r.issue_date.toISOString().slice(0, 10) : '',
        verificationCode: r.verification_code,
        qrToken: r.qr_token || ''
      }));
    }

    if (fin && fin.rows.length) {
      memData.payments = fin.rows.map(r => ({
        id: r.id,
        traineeId: r.student_id,
        amount: Number(r.amount) || 0,
        paymentType: r.payment_type,
        receiptNumber: r.receipt_number || '',
        notes: r.notes || ''
      }));
    }

    if (gp && gp.rows.length) {
      memData.pointTransactions = gp.rows.map(r => ({
        id: r.id,
        traineeId: r.student_id,
        points: r.points || 0,
        badge: r.badge || 'نجم الأسبوع',
        reason: r.reason || ''
      }));
    }

    db.saveImmediate();
    console.log(`[Neon Hydration] Full Neon PostgreSQL hydration complete!`);
  } catch (err: any) {
    console.error('[Neon Hydration] Error loading from Neon:', err.message);
  }
}

async function syncItemToNeon(key: string, item: any, isDelete = false) {
  try {
    if (isDelete) {
      // 1. Delete from collections table
      await queryNeon('DELETE FROM collections WHERE collection_name = $1 AND id = $2', [key, item.id]);

      // 2. Delete from relational tables
      if (key === 'trainees') {
        await queryNeon('DELETE FROM students WHERE id = $1', [item.id]);
      } else if (key === 'branches') {
        await queryNeon('DELETE FROM branches WHERE id = $1', [item.id]);
      } else if (key === 'trainers') {
        await queryNeon('DELETE FROM trainers WHERE id = $1', [item.id]);
      } else if (key === 'courses') {
        await queryNeon('DELETE FROM courses WHERE id = $1', [item.id]);
      } else if (key === 'groups') {
        await queryNeon('DELETE FROM groups WHERE id = $1', [item.id]);
      } else if (key === 'payments') {
        await queryNeon('DELETE FROM finance WHERE id = $1', [item.id]);
      } else if (key === 'certificates') {
        await queryNeon('DELETE FROM certificates WHERE id = $1', [item.id]);
      } else if (key === 'pointTransactions') {
        await queryNeon('DELETE FROM gamification_points WHERE id = $1', [item.id]);
      } else if (key === 'attendance') {
        await queryNeon('DELETE FROM attendance WHERE id = $1', [item.id]);
      } else if (key === 'expenses') {
        await queryNeon('DELETE FROM expenses WHERE id = $1', [item.id]);
      } else if (key === 'users') {
        await queryNeon('DELETE FROM users WHERE id = $1', [item.id]);
      }
      return;
    }

    // Always persist complete item state to collections table in Neon PostgreSQL!
    await queryNeon(`
      INSERT INTO collections (collection_name, id, data, updated_at)
      VALUES ($1, $2, CAST($3 AS jsonb), NOW())
      ON CONFLICT (collection_name, id) DO UPDATE SET
        data = EXCLUDED.data,
        updated_at = NOW()
    `, [key, item.id, JSON.stringify(item)]);

    // Relational table sync
    if (key === 'trainees') {
      const code = item.code || item.studentCode || item.traineeCode || item.id;
      const memData = db.getData() as any;
      const grp = (memData.groups || []).find((g: any) => g.id === item.groupId);
      const grpName = grp ? grp.name : (item.groupName || '');
      await queryNeon(`
        INSERT INTO students (
          id, student_code, full_name, phone, parent_phone, parent_name, branch_id, group_id, course_id, track, grade, group_name, points, status,
          national_id, birth_date, gender, address, fee_amount, discount_amount, net_amount, paid_amount, remaining_amount, notes, portal_password, parent_portal_password, is_exempt, exempt_reason, photo_url
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29)
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
          status = EXCLUDED.status,
          national_id = EXCLUDED.national_id,
          birth_date = EXCLUDED.birth_date,
          gender = EXCLUDED.gender,
          address = EXCLUDED.address,
          fee_amount = EXCLUDED.fee_amount,
          discount_amount = EXCLUDED.discount_amount,
          net_amount = EXCLUDED.net_amount,
          paid_amount = EXCLUDED.paid_amount,
          remaining_amount = EXCLUDED.remaining_amount,
          notes = EXCLUDED.notes,
          portal_password = EXCLUDED.portal_password,
          parent_portal_password = EXCLUDED.parent_portal_password,
          is_exempt = EXCLUDED.is_exempt,
          exempt_reason = EXCLUDED.exempt_reason,
          photo_url = EXCLUDED.photo_url
      `, [
        item.id,
        code,
        item.fullName || item.name || '',
        item.phone || '',
        item.parentPhone || '',
        item.parentName || '',
        item.branchId || null,
        item.groupId || null,
        item.courseId || null,
        item.track || '',
        item.grade || '',
        grpName,
        item.points || item.totalPoints || 0,
        item.status || 'active',
        item.nationalId || '',
        item.birthDate || '',
        item.gender || 'male',
        item.address || '',
        Number(item.feeAmount) || 0,
        Number(item.discountAmount) || 0,
        Number(item.netAmount) || 0,
        Number(item.paidAmount) || 0,
        Number(item.remainingAmount) || 0,
        item.notes || '',
        item.portalPassword || '',
        item.parentPortalPassword || '',
        item.isExempt === true,
        item.exemptReason || '',
        item.photoUrl || item.photo || ''
      ]);
    } else if (key === 'branches') {
      await queryNeon(`
        INSERT INTO branches (id, code, name, address, phone, manager_name, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (id) DO UPDATE SET
          code = EXCLUDED.code,
          name = EXCLUDED.name,
          address = EXCLUDED.address,
          phone = EXCLUDED.phone,
          manager_name = EXCLUDED.manager_name,
          status = EXCLUDED.status
      `, [
        item.id,
        item.code || '',
        item.name || '',
        item.address || '',
        item.phone || '',
        item.managerName || '',
        item.status || 'active'
      ]);
    } else if (key === 'trainers') {
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
          status = EXCLUDED.status
      `, [
        item.id,
        item.code || '',
        item.name || '',
        item.email || '',
        item.phone || '',
        item.branchId || null,
        item.specialty || '',
        item.status || 'active'
      ]);
    } else if (key === 'courses') {
      await queryNeon(`
        INSERT INTO courses (id, code, name, category, grade, branch_id, fee_amount, status, materials, arabic_material, languages_material, hours_count, lectures_count, billing_type, description, max_trainees)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CAST($9 AS jsonb), CAST($10 AS jsonb), CAST($11 AS jsonb), $12, $13, $14, $15, $16)
        ON CONFLICT (id) DO UPDATE SET
          code = EXCLUDED.code,
          name = EXCLUDED.name,
          category = EXCLUDED.category,
          grade = EXCLUDED.grade,
          branch_id = EXCLUDED.branch_id,
          fee_amount = EXCLUDED.fee_amount,
          status = EXCLUDED.status,
          materials = EXCLUDED.materials,
          arabic_material = EXCLUDED.arabic_material,
          languages_material = EXCLUDED.languages_material,
          hours_count = EXCLUDED.hours_count,
          lectures_count = EXCLUDED.lectures_count,
          billing_type = EXCLUDED.billing_type,
          description = EXCLUDED.description,
          max_trainees = EXCLUDED.max_trainees
      `, [
        item.id,
        item.code || '',
        item.name || '',
        item.category || '',
        item.grade || '',
        item.branchId || null,
        Number(item.feeAmount) || 0,
        item.status || 'active',
        JSON.stringify(item.materials || []),
        item.arabicMaterial ? JSON.stringify(item.arabicMaterial) : null,
        item.languagesMaterial ? JSON.stringify(item.languagesMaterial) : null,
        Number(item.hoursCount) || 8,
        Number(item.lecturesCount) || 64,
        item.billingType || 'monthly',
        item.description || '',
        Number(item.maxTrainees) || 20
      ]);
    } else if (key === 'groups') {
      const daysArr = item.scheduleDays || item.days || [];
      const daysJson = JSON.stringify(daysArr);
      await queryNeon(`
        INSERT INTO groups (
          id, name, course_id, trainer_id, branch_id, track, grade, room_name, status, 
          materials, arabic_material, languages_material, days, schedule_days, 
          start_time, end_time, time_slot, start_date, end_date, max_capacity, 
          max_students, whatsapp_group_link, notes, hall_name
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, 
          CAST($10 AS jsonb), CAST($11 AS jsonb), CAST($12 AS jsonb), 
          CAST($13 AS jsonb), CAST($13 AS jsonb), $14, $15, $16, $17, $18, $19, $20, $21, $22, $23
        )
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          course_id = EXCLUDED.course_id,
          trainer_id = EXCLUDED.trainer_id,
          branch_id = EXCLUDED.branch_id,
          track = EXCLUDED.track,
          grade = EXCLUDED.grade,
          room_name = EXCLUDED.room_name,
          status = EXCLUDED.status,
          materials = EXCLUDED.materials,
          arabic_material = EXCLUDED.arabic_material,
          languages_material = EXCLUDED.languages_material,
          days = EXCLUDED.days,
          schedule_days = EXCLUDED.schedule_days,
          start_time = EXCLUDED.start_time,
          end_time = EXCLUDED.end_time,
          time_slot = EXCLUDED.time_slot,
          start_date = EXCLUDED.start_date,
          end_date = EXCLUDED.end_date,
          max_capacity = EXCLUDED.max_capacity,
          max_students = EXCLUDED.max_students,
          whatsapp_group_link = EXCLUDED.whatsapp_group_link,
          notes = EXCLUDED.notes,
          hall_name = EXCLUDED.hall_name
      `, [
        item.id,
        item.name || '',
        item.courseId || null,
        item.trainerId || null,
        item.branchId || null,
        item.track || 'عربي',
        item.grade || '',
        item.roomName || item.hallName || 'قاعة 1',
        item.status || 'active',
        JSON.stringify(item.materials || []),
        item.arabicMaterial ? JSON.stringify(item.arabicMaterial) : null,
        item.languagesMaterial ? JSON.stringify(item.languagesMaterial) : null,
        daysJson,
        item.startTime || '16:00',
        item.endTime || '18:00',
        item.timeSlot || '',
        item.startDate || '',
        item.endDate || '',
        Number(item.maxCapacity) || 25,
        Number(item.maxStudents) || 25,
        item.whatsappGroupLink || '',
        item.notes || '',
        item.hallName || item.roomName || 'قاعة 1'
      ]);
    } else if (key === 'payments') {
      const studentId = item.traineeId || item.studentId || null;
      // Only insert into relational finance table if student_id is provided, otherwise it violates foreign key
      if (studentId) {
        await queryNeon(`
          INSERT INTO finance (
            id, student_id, trainee_id, trainee_name, trainee_code, trainer_id, course_id, branch_id, group_id,
            amount, payment_type, payment_method, receipt_number, notes, date, target_month, proof_image_url,
            status, rejection_reason, submitted_by_parent_name, submitted_at, verified_at, verified_by_user_name,
            received_by_user_id, received_by_user_name
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)
          ON CONFLICT (id) DO UPDATE SET
            student_id = EXCLUDED.student_id,
            trainee_id = EXCLUDED.trainee_id,
            trainee_name = EXCLUDED.trainee_name,
            trainee_code = EXCLUDED.trainee_code,
            trainer_id = EXCLUDED.trainer_id,
            course_id = EXCLUDED.course_id,
            branch_id = EXCLUDED.branch_id,
            group_id = EXCLUDED.group_id,
            amount = EXCLUDED.amount,
            payment_type = EXCLUDED.payment_type,
            payment_method = EXCLUDED.payment_method,
            receipt_number = EXCLUDED.receipt_number,
            notes = EXCLUDED.notes,
            date = EXCLUDED.date,
            target_month = EXCLUDED.target_month,
            proof_image_url = EXCLUDED.proof_image_url,
            status = EXCLUDED.status,
            rejection_reason = EXCLUDED.rejection_reason,
            submitted_by_parent_name = EXCLUDED.submitted_by_parent_name,
            submitted_at = EXCLUDED.submitted_at,
            verified_at = EXCLUDED.verified_at,
            verified_by_user_name = EXCLUDED.verified_by_user_name,
            received_by_user_id = EXCLUDED.received_by_user_id,
            received_by_user_name = EXCLUDED.received_by_user_name
        `, [
          item.id,
          studentId,
          item.traineeId || item.studentId || null,
          item.traineeName || '',
          item.traineeCode || '',
          item.trainerId || null,
          item.courseId || null,
          item.branchId || null,
          item.groupId || null,
          Number(item.amount) || 0,
          item.paymentType || 'سند قبض',
          item.paymentMethod || 'cash',
          item.receiptNumber || item.id,
          item.notes || '',
          item.date || new Date().toISOString().slice(0, 10),
          item.targetMonth || '',
          item.proofImageUrl || '',
          item.status || 'verified',
          item.rejectionReason || '',
          item.submittedByParentName || '',
          item.submittedAt || '',
          item.verifiedAt || '',
          item.verifiedByUserName || '',
          item.receivedByUserId || null,
          item.receivedByUserName || ''
        ]);
      }
    } else if (key === 'certificates') {
      const studentId = item.traineeId || item.studentId || null;
      if (studentId) {
        await queryNeon(`
          INSERT INTO certificates (
            id, student_id, trainee_id, trainee_name, course_id, course_name, branch_id, branch_name,
            issue_date, grade, score, verification_code, qr_token, template_id
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
          ON CONFLICT (id) DO UPDATE SET
            student_id = EXCLUDED.student_id,
            trainee_id = EXCLUDED.trainee_id,
            trainee_name = EXCLUDED.trainee_name,
            course_id = EXCLUDED.course_id,
            course_name = EXCLUDED.course_name,
            branch_id = EXCLUDED.branch_id,
            branch_name = EXCLUDED.branch_name,
            issue_date = EXCLUDED.issue_date,
            grade = EXCLUDED.grade,
            score = EXCLUDED.score,
            verification_code = EXCLUDED.verification_code,
            qr_token = EXCLUDED.qr_token,
            template_id = EXCLUDED.template_id
        `, [
          item.id,
          studentId,
          item.traineeId || item.studentId || null,
          item.traineeName || '',
          item.courseId || null,
          item.courseName || '',
          item.branchId || null,
          item.branchName || '',
          item.issueDate || new Date().toISOString().slice(0, 10),
          item.grade || '',
          Number(item.score) || 0,
          item.verificationCode || item.certificateCode || item.id,
          item.qrToken || '',
          item.templateId || null
        ]);
      }
    } else if (key === 'pointTransactions') {
      const studentId = item.traineeId || item.studentId || null;
      if (studentId) {
        await queryNeon(`
          INSERT INTO gamification_points (
            id, student_id, trainee_id, group_id, branch_id, rule_id, added_by_user_id, added_by_user_name,
            points, badge, reason
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          ON CONFLICT (id) DO UPDATE SET
            student_id = EXCLUDED.student_id,
            trainee_id = EXCLUDED.trainee_id,
            group_id = EXCLUDED.group_id,
            branch_id = EXCLUDED.branch_id,
            rule_id = EXCLUDED.rule_id,
            added_by_user_id = EXCLUDED.added_by_user_id,
            added_by_user_name = EXCLUDED.added_by_user_name,
            points = EXCLUDED.points,
            badge = EXCLUDED.badge,
            reason = EXCLUDED.reason
        `, [
          item.id,
          studentId,
          item.traineeId || item.studentId || null,
          item.groupId || null,
          item.branchId || null,
          item.ruleId || null,
          item.addedByUserId || null,
          item.addedByUserName || '',
          Number(item.points) || 0,
          item.badge || 'نجم الأسبوع',
          item.reason || ''
        ]);
      }
    } else if (key === 'attendance') {
      await queryNeon(`
        INSERT INTO attendance (id, trainee_id, group_id, course_id, branch_id, trainer_id, date, time, status, notes, recorded_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (id) DO UPDATE SET
          trainee_id = EXCLUDED.trainee_id,
          group_id = EXCLUDED.group_id,
          course_id = EXCLUDED.course_id,
          branch_id = EXCLUDED.branch_id,
          trainer_id = EXCLUDED.trainer_id,
          date = EXCLUDED.date,
          time = EXCLUDED.time,
          status = EXCLUDED.status,
          notes = EXCLUDED.notes,
          recorded_by = EXCLUDED.recorded_by
      `, [
        item.id,
        item.traineeId || item.studentId || null,
        item.groupId || null,
        item.courseId || null,
        item.branchId || null,
        item.trainerId || null,
        item.date || new Date().toISOString().slice(0, 10),
        item.time || '',
        item.status || 'present',
        item.notes || '',
        item.recordedBy || item.recorded_by || ''
      ]);
    } else if (key === 'expenses') {
      await queryNeon(`
        INSERT INTO expenses (id, title, amount, category, branch_id, date, notes, beneficiary, description, payment_method, document_number, paid_by_user_id, paid_by_user_name)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          amount = EXCLUDED.amount,
          category = EXCLUDED.category,
          branch_id = EXCLUDED.branch_id,
          date = EXCLUDED.date,
          notes = EXCLUDED.notes,
          beneficiary = EXCLUDED.beneficiary,
          description = EXCLUDED.description,
          payment_method = EXCLUDED.payment_method,
          document_number = EXCLUDED.document_number,
          paid_by_user_id = EXCLUDED.paid_by_user_id,
          paid_by_user_name = EXCLUDED.paid_by_user_name
      `, [
        item.id,
        item.title || item.name || '',
        Number(item.amount) || 0,
        item.category || 'عام',
        item.branchId || null,
        item.date || new Date().toISOString().slice(0, 10),
        item.notes || '',
        item.beneficiary || '',
        item.description || '',
        item.paymentMethod || item.payment_method || 'cash',
        item.documentNumber || item.document_number || '',
        item.paidByUserId || null,
        item.paidByUserName || ''
      ]);
    }
  } catch (err: any) {
    console.error(`[Neon Sync] Non-critical error syncing key ${key}:`, err.message);
  }
}

// Initial hydration attempt on module load
hydrateAllFromNeon()
  .then(() => {
    if (supabaseClient) {
      hydrateAllFromSupabase().catch((err) => {
        console.error('[Hydration] Auto-hydration on load failed:', err);
      });
    }
  })
  .catch((err) => {
    console.error('[Neon Hydration] Load failed:', err);
  });

async function fetchKeyFromNeon(key: string): Promise<any[] | null> {
  try {
    // 1. Check collections table first for comprehensive full document states
    const colRes = await queryNeon('SELECT data FROM collections WHERE collection_name = $1', [key]);
    if (colRes && colRes.rows.length > 0) {
      return colRes.rows.map(r => r.data);
    }

    if (key === 'branches') {
      const b = await queryNeon('SELECT * FROM branches');
      return b.rows.map(r => ({
        id: r.id,
        code: r.code || '',
        name: r.name,
        city: r.city || '',
        address: r.address || '',
        phone: r.phone || '',
        managerName: r.manager_name || '',
        status: r.status || 'active'
      }));
    }
    if (key === 'trainers') {
      const t = await queryNeon('SELECT * FROM trainers');
      return t.rows.map(r => ({
        id: r.id,
        code: r.code || '',
        name: r.name,
        email: r.email || '',
        phone: r.phone || '',
        branchId: r.branch_id || null,
        specialty: r.specialty || '',
        status: r.status || 'active'
      }));
    }
    if (key === 'courses') {
      const c = await queryNeon('SELECT * FROM courses');
      const memData = db.getData() as any;
      const existingCoursesMap = new Map();
      (memData.courses || []).forEach((x: any) => existingCoursesMap.set(x.id, x));

      return c.rows.map(r => {
        const old = existingCoursesMap.get(r.id) || {};
        return {
          ...old,
          id: r.id,
          code: r.code || old.code || '',
          name: r.name,
          category: r.category || old.category || '',
          grade: r.grade || old.grade || '',
          branchId: r.branch_id || old.branchId || null,
          feeAmount: Number(r.fee_amount) || old.feeAmount || 0,
          status: r.status || old.status || 'active',
          materials: r.materials || old.materials || [],
          arabicMaterial: r.arabic_material || old.arabicMaterial || null,
          languagesMaterial: r.languages_material || old.languagesMaterial || null,
          hoursCount: Number(r.hours_count) || old.hoursCount || 8,
          lecturesCount: Number(r.lectures_count) || old.lecturesCount || 64,
          billingType: r.billing_type || old.billingType || 'monthly',
          description: r.description || old.description || '',
          maxTrainees: r.max_trainees || old.maxTrainees || 20
        };
      });
    }
    if (key === 'groups') {
      const g = await queryNeon('SELECT * FROM groups');
      const memData = db.getData() as any;
      const existingGroupsMap = new Map();
      (memData.groups || []).forEach((x: any) => existingGroupsMap.set(x.id, x));

      return g.rows.map(r => {
        const old = existingGroupsMap.get(r.id) || {};
        const days = (Array.isArray(r.schedule_days) && r.schedule_days.length > 0)
          ? r.schedule_days
          : (Array.isArray(r.days) && r.days.length > 0)
            ? r.days
            : (old.scheduleDays || old.days || []);

        return {
          ...old,
          id: r.id,
          name: r.name,
          courseId: r.course_id || old.courseId || null,
          trainerId: r.trainer_id || old.trainerId || null,
          branchId: r.branch_id || old.branchId || null,
          track: r.track || old.track || 'عربي',
          grade: r.grade || old.grade || '',
          roomName: r.room_name || old.roomName || 'قاعة 1',
          hallName: r.hall_name || old.hallName || r.room_name || old.roomName || 'قاعة 1',
          status: r.status || old.status || 'active',
          materials: r.materials || old.materials || [],
          arabicMaterial: r.arabic_material || old.arabicMaterial || null,
          languagesMaterial: r.languages_material || old.languagesMaterial || null,
          scheduleDays: days,
          days: days,
          startTime: r.start_time || old.startTime || '16:00',
          endTime: r.end_time || old.endTime || '18:00',
          timeSlot: r.time_slot || old.timeSlot || '',
          startDate: r.start_date || old.startDate || '',
          endDate: r.end_date || old.endDate || '',
          maxCapacity: r.max_capacity || old.maxCapacity || 25,
          maxStudents: r.max_students || old.maxStudents || 25,
          whatsappGroupLink: r.whatsapp_group_link || old.whatsappGroupLink || '',
          notes: r.notes || old.notes || '',
          feeAmount: r.fee_amount != null ? Number(r.fee_amount) : (old.feeAmount || 0)
        };
      });
    }
    if (key === 'trainees') {
      const s = await queryNeon('SELECT * FROM students');
      const memData = db.getData() as any;
      const existingTraineesMap = new Map();
      (memData.trainees || []).forEach((x: any) => existingTraineesMap.set(x.id, x));
      return s.rows.map(r => {
        const old = existingTraineesMap.get(r.id) || {};
        const isoDate = r.created_at ? (r.created_at instanceof Date ? r.created_at.toISOString() : new Date(r.created_at).toISOString()) : new Date().toISOString();
        return {
          ...old,
          id: r.id,
          code: r.student_code,
          studentCode: r.student_code,
          traineeCode: r.student_code,
          fullName: r.full_name,
          phone: r.phone || '',
          parentPhone: r.parent_phone || '',
          parentName: r.parent_name || '',
          branchId: r.branch_id || null,
          groupId: r.group_id || null,
          courseId: r.course_id || null,
          track: r.track || '',
          grade: r.grade || '',
          points: r.points || 0,
          totalPoints: r.points || 0,
          status: r.status || 'active',
          createdAt: isoDate,
          registrationDate: isoDate.slice(0, 10),
          nationalId: r.national_id || '',
          birthDate: r.birth_date || '',
          gender: r.gender || 'male',
          address: r.address || '',
          feeAmount: Number(r.fee_amount) || 0,
          discountAmount: Number(r.discount_amount) || 0,
          netAmount: Number(r.net_amount) || 0,
          paidAmount: Number(r.paid_amount) || 0,
          remainingAmount: Number(r.remaining_amount) || 0,
          notes: r.notes || '',
          portalPassword: r.portal_password || '',
          parentPortalPassword: r.parent_portal_password || '',
          isExempt: r.is_exempt === true,
          exemptReason: r.exempt_reason || ''
        };
      });
    }
    if (key === 'certificates') {
      const cert = await queryNeon('SELECT * FROM certificates');
      return cert.rows.map(r => ({
        id: r.id,
        traineeId: r.student_id,
        courseName: r.course_name,
        issueDate: r.issue_date ? r.issue_date.toISOString().slice(0, 10) : '',
        verificationCode: r.verification_code,
        qrToken: r.qr_token || ''
      }));
    }
    if (key === 'payments') {
      const fin = await queryNeon('SELECT * FROM finance');
      return fin.rows.map(r => ({
        id: r.id,
        traineeId: r.student_id,
        amount: Number(r.amount) || 0,
        paymentType: r.payment_type,
        receiptNumber: r.receipt_number || '',
        notes: r.notes || ''
      }));
    }
    if (key === 'pointTransactions') {
      const gp = await queryNeon('SELECT * FROM gamification_points');
      return gp.rows.map(r => ({
        id: r.id,
        traineeId: r.student_id,
        points: r.points || 0,
        badge: r.badge || 'نجم الأسبوع',
        reason: r.reason || ''
      }));
    }
  } catch (err: any) {
    console.error(`[fetchKeyFromNeon] Error for key ${key}:`, err.message);
  }
  return null;
}

function createRepo<T extends { id: string }>(key: string) {
  return {
    async getAll(): Promise<T[]> {
      const liveItems = await fetchKeyFromNeon(key);
      if (liveItems !== null) {
        const memData = db.getData() as any;
        memData[key] = liveItems;
        return liveItems as T[];
      }
      const memData = db.getData() as any;
      const memItems = (memData && Array.isArray(memData[key])) ? (memData[key] as T[]) : [];
      return memItems;
    },

    async getById(id: string): Promise<T | null> {
      if (!id) return null;
      const all = await this.getAll();
      const idStr = String(id).trim().toLowerCase();
      return all.find(item => {
        const itemObj = item as any;
        return (
          (item.id && String(item.id).trim().toLowerCase() === idStr) ||
          (itemObj.legacyId && String(itemObj.legacyId).trim().toLowerCase() === idStr) ||
          (itemObj.code && String(itemObj.code).trim().toLowerCase() === idStr) ||
          (itemObj.studentCode && String(itemObj.studentCode).trim().toLowerCase() === idStr) ||
          (itemObj.traineeCode && String(itemObj.traineeCode).trim().toLowerCase() === idStr)
        );
      }) || null;
    },

    async getByTraineeId(traineeId: string): Promise<T[]> {
      const all = await this.getAll();
      if (!traineeId) return [];
      const idStr = String(traineeId).trim().toLowerCase();
      return all.filter(item => {
        const itemObj = item as any;
        const candidates = [
          itemObj.traineeId,
          itemObj.studentId,
          itemObj.trainee_id,
          itemObj.student_id,
          itemObj.traineeCode,
          itemObj.studentCode,
          itemObj.trainee_code,
          itemObj.student_code
        ];
        return candidates.some(c => c && String(c).trim().toLowerCase() === idStr);
      });
    },

    async getByStudentId(studentId: string): Promise<T[]> {
      return this.getByTraineeId(studentId);
    },

    async getByExamId(examId: string): Promise<T[]> {
      const all = await this.getAll();
      if (!examId) return [];
      const idStr = String(examId).trim().toLowerCase();
      return all.filter(item => {
        const itemObj = item as any;
        return itemObj.examId && String(itemObj.examId).trim().toLowerCase() === idStr;
      });
    },

    async query(filters: Array<{ field: string; operator: string; value: any }>): Promise<T[]> {
      const all = await this.getAll();
      if (!Array.isArray(filters) || filters.length === 0) return all;
      return all.filter(item => {
        const itemObj = item as any;
        return filters.every(f => {
          const val = itemObj[f.field];
          if (f.operator === '==' || f.operator === '===') return val === f.value;
          if (f.operator === '!=') return val !== f.value;
          return true;
        });
      });
    },

    async create(id: string, itemData: any): Promise<T> {
      const docId = id || itemData.id || ('doc-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6));
      const fullItem = { ...itemData, id: docId };

      if (supabaseClient && !isSupabaseQuotaRestricted) {
        try {
          const { error } = await supabaseClient
            .from('collections')
            .upsert({
              collection_name: key,
              id: docId,
              data: fullItem,
              updated_at: new Date().toISOString()
            }, { onConflict: 'collection_name,id' });

          if (error) {
            handleSupabaseError('Create', key, docId, error.message);
          }
        } catch (e: any) {
          handleSupabaseError('Create', key, docId, e.message);
        }
      }

      const memData = db.getData() as any;
      if (memData) {
        if (!Array.isArray(memData[key])) memData[key] = [];
        const list = memData[key] as any[];
        const idx = list.findIndex(i => i.id === docId);
        if (idx >= 0) list[idx] = fullItem;
        else list.push(fullItem);
        db.saveImmediate();
      }

      // Sync to Neon Live PostgreSQL!
      await syncItemToNeon(key, fullItem, false);

      return fullItem as T;
    },

    async update(id: string, updates: any): Promise<T | null> {
      const existing = await this.getById(id);
      const docId = existing ? existing.id : id;
      const updatedItem = { ...(existing || {}), ...updates, id: docId, updatedAt: new Date().toISOString() };

      if (supabaseClient && !isSupabaseQuotaRestricted) {
        try {
          const { error } = await supabaseClient
            .from('collections')
            .upsert({
              collection_name: key,
              id: docId,
              data: updatedItem,
              updated_at: new Date().toISOString()
            }, { onConflict: 'collection_name,id' });

          if (error) {
            handleSupabaseError('Update', key, docId, error.message);
          }
        } catch (e: any) {
          handleSupabaseError('Update', key, docId, e.message);
        }
      }

      const memData = db.getData() as any;
      if (memData) {
        if (!Array.isArray(memData[key])) memData[key] = [];
        const list = memData[key] as any[];
        const idx = list.findIndex(i => i.id === docId);
        if (idx >= 0) list[idx] = updatedItem;
        else list.push(updatedItem);
        db.saveImmediate();
      }

      // Sync to Neon Live PostgreSQL!
      await syncItemToNeon(key, updatedItem, false);

      return updatedItem as T;
    },

    async delete(id: string): Promise<boolean> {
      if (supabaseClient && !isSupabaseQuotaRestricted) {
        try {
          const { error } = await supabaseClient
            .from('collections')
            .delete()
            .eq('collection_name', key)
            .eq('id', id);

          if (error) {
            handleSupabaseError('Delete', key, id, error.message);
          }
        } catch (e: any) {
          handleSupabaseError('Delete', key, id, e.message);
        }
      }

      const memData = db.getData() as any;
      if (memData && Array.isArray(memData[key])) {
        const list = memData[key] as any[];
        const idx = list.findIndex(i => i.id === id);
        if (idx >= 0) list.splice(idx, 1);
        db.saveImmediate();
      }

      // Sync to Neon Live PostgreSQL!
      await syncItemToNeon(key, { id }, true);

      return true;
    },

    invalidateCache() {
      // Direct queries to Supabase collections are always live
    }
  };
}

export const TraineeRepo = createRepo<Trainee>('trainees');
export const BranchRepo = createRepo<Branch>('branches');
export const CourseRepo = createRepo<Course>('courses');
export const ProgramRepo = createRepo<Program>('programs');
export const GroupRepo = createRepo<Group>('groups');
export const TrainerRepo = createRepo<Trainer>('trainers');
export const AttendanceRepo = createRepo<AttendanceRecord>('attendance');
export const PaymentRepo = {
  ...createRepo<Payment>('payments'),
  async getPendingProofs(): Promise<Payment[]> {
    const all = await createRepo<Payment>('payments').getAll();
    return all.filter(p => p.status === 'pending' || p.status === 'pending_approval' || Boolean((p as any).proofUrl));
  }
};
export const ExpenseRepo = createRepo<Expense>('expenses');
export const ExamRepo = createRepo<Exam>('exams');
export const ExamQuestionRepo = createRepo<ExamQuestion>('questions');
export const ExamResultRepo = createRepo<ExamResult>('examResults');
export const PointRuleRepo = createRepo<PointRule>('pointRules');
export const PointTransactionRepo = createRepo<PointTransaction>('pointTransactions');
export const CertificateRepo = createRepo<Certificate>('certificates');
export const CertificateTemplateRepo = createRepo<CertificateTemplate>('certificateTemplates');
export const UserRepo = createRepo<User>('users');
export const DeviceRepo = createRepo<Device>('devices');
export const DeviceCommandRepo = createRepo<DeviceCommand>('deviceCommands');
export const ComputerLabRepo = createRepo<ComputerLab>('computerLabs');
export const InteractiveSessionRepo = createRepo<InteractiveSession>('interactiveSessions');
export const TraineeScreenshotRepo = createRepo<TraineeScreenshot>('traineeScreenshots');

export const SettingRepo = {
  async get(): Promise<CenterSettings> {
    return db.getData().settings || {} as CenterSettings;
  },
  async update(updates: Partial<CenterSettings>): Promise<CenterSettings> {
    const current = await this.get();
    const finalSettings = { ...current, ...updates };

    if (supabaseClient && !isSupabaseQuotaRestricted) {
      try {
        const { error } = await supabaseClient
          .from('collections')
          .upsert({
            collection_name: 'settings',
            id: 'main',
            data: finalSettings,
            updated_at: new Date().toISOString()
          }, { onConflict: 'collection_name,id' });
        if (error) {
          handleSupabaseError('Update', 'settings', 'main', error.message);
        }
      } catch (e: any) {
        handleSupabaseError('Update', 'settings', 'main', e.message);
      }
    }

    const data = db.getData();
    data.settings = finalSettings;
    db.save();
    return finalSettings;
  }
};

export const AuditLogRepo = {
  ...createRepo<AuditLog>('auditLogs'),
  async log(action: string, details: string, user?: string): Promise<AuditLog> {
    const logItem: AuditLog = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      userId: user || 'SYSTEM',
      userName: user || 'مدير النظام',
      action,
      entity: 'النظام',
      details,
      timestamp: new Date().toISOString()
    };
    await this.create(logItem.id, logItem);
    return logItem;
  }
};

