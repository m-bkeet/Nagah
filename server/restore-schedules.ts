import fs from 'fs';
import { queryNeon, neonPool } from './dbNeon';
import { db } from './db';

async function main() {
  console.log('=== RESTORING ACCURATE COURSE & GROUP SCHEDULES ===');
  const backupPath = './data/backups/nagah_full_backup_2026-09-11_15-11.json';
  if (!fs.existsSync(backupPath)) {
    console.error('Backup file not found:', backupPath);
    return;
  }

  const backup = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
  const backupGroups = backup.groups || [];
  const backupCourses = backup.courses || [];

  console.log(`Found ${backupGroups.length} groups and ${backupCourses.length} courses in original backup.`);

  // 1. Update in Neon PostgreSQL
  for (const g of backupGroups) {
    const daysArr = g.scheduleDays || g.days || [];
    const daysJson = JSON.stringify(daysArr);
    const fullJson = JSON.stringify(g);

    // Update collections table
    await queryNeon(
      'UPDATE collections SET data = CAST($1 AS jsonb), updated_at = NOW() WHERE collection_name = $2 AND id = $3',
      [fullJson, 'groups', g.id]
    );

    // Update relational groups table
    await queryNeon(
      `UPDATE groups SET
        days = CAST($1 AS jsonb),
        schedule_days = CAST($1 AS jsonb),
        start_time = $2,
        end_time = $3,
        room_name = $4,
        hall_name = $5,
        time_slot = $6,
        start_date = $7,
        end_date = $8,
        max_capacity = $9,
        max_students = $10,
        whatsapp_group_link = $11,
        notes = $12
      WHERE id = $13`,
      [
        daysJson,
        g.startTime || '16:00',
        g.endTime || '18:00',
        g.roomName || 'قاعة 1',
        g.hallName || g.roomName || 'قاعة 1',
        g.timeSlot || '',
        g.startDate || '',
        g.endDate || '',
        g.maxCapacity || 25,
        g.maxStudents || 25,
        g.whatsappGroupLink || '',
        g.notes || '',
        g.id
      ]
    );

    console.log(`[Restored Group] ${g.name}: Days=${JSON.stringify(daysArr)}, Time=${g.startTime} - ${g.endTime}, Room=${g.roomName}`);
  }

  // 2. Restore courses metadata in Neon
  for (const c of backupCourses) {
    const fullJson = JSON.stringify(c);

    await queryNeon(
      'UPDATE collections SET data = CAST($1 AS jsonb), updated_at = NOW() WHERE collection_name = $2 AND id = $3',
      [fullJson, 'courses', c.id]
    );

    await queryNeon(
      `UPDATE courses SET
        hours_count = $1,
        lectures_count = $2,
        billing_type = $3,
        description = $4,
        max_trainees = $5
      WHERE id = $6`,
      [
        c.hoursCount || 8,
        c.lecturesCount || 64,
        c.billingType || 'monthly',
        c.description || '',
        c.maxTrainees || 20,
        c.id
      ]
    );
  }

  // 3. Update memory / database.json
  const memData = db.getData() as any;
  if (memData) {
    // Preserve groups with full schedule fields
    const backupGroupsMap = new Map();
    backupGroups.forEach((bg: any) => backupGroupsMap.set(bg.id, bg));

    memData.groups = (memData.groups || []).map((mg: any) => {
      const bg = backupGroupsMap.get(mg.id);
      if (bg) {
        return {
          ...mg,
          ...bg
        };
      }
      return mg;
    });

    // Preserve courses with full fields
    const backupCoursesMap = new Map();
    backupCourses.forEach((bc: any) => backupCoursesMap.set(bc.id, bc));

    memData.courses = (memData.courses || []).map((mc: any) => {
      const bc = backupCoursesMap.get(mc.id);
      if (bc) {
        return {
          ...mc,
          ...bc
        };
      }
      return mc;
    });

    db.saveImmediate();
    console.log('[Memory & Local DB] Successfully synchronized accurate group schedules into memory!');
  }

  console.log('=== ALL COURSE & GROUP SCHEDULES RESTORED PERFECTLY! ===');
  await neonPool.end();
}

main().catch(err => {
  console.error('Restoration error:', err);
  process.exit(1);
});
