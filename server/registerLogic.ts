import { Request, Response } from 'express';
import { CourseRepo, GroupRepo, TraineeRepo, BranchRepo } from './data';
import { adminDb } from './firebaseAdmin';
import { Trainee, Course, Group } from '../src/types';

export function resolveGradePrefix(gradeOrCourse?: string): string {
  if (!gradeOrCourse) return 'A';
  const clean = String(gradeOrCourse).trim();
  const lower = clean.toLowerCase();

  // 1. Primary 4 (الصف الرابع الابتدائي) -> A
  if (clean.includes('رابع') || lower.includes('ict4') || clean === '4' || clean.includes('الرابع')) return 'A';
  
  // 2. Primary 5 (الصف الخامس الابتدائي) -> B
  if (clean.includes('خامس') || lower.includes('ict5') || clean === '5' || clean.includes('الخامس')) return 'B';
  
  // 3. Primary 6 (الصف السادس الابتدائي) -> C
  if (clean.includes('سادس') || lower.includes('ict6') || clean === '6' || clean.includes('السادس')) return 'C';
  
  // 4. Prep 1 (الصف الأول الإعدادي) -> D
  if (clean.includes('أول إعدادي') || clean.includes('اول اعدادي') || clean.includes('1 إعدادي') || clean.includes('الأول الإعدادي') || lower.includes('ict-p1') || lower.includes('p1')) return 'D';
  
  // 5. Prep 2 (الصف الثاني الإعدادي) -> E
  if (clean.includes('ثاني إعدادي') || clean.includes('تاني اعدادي') || clean.includes('2 إعدادي') || clean.includes('الثاني الإعدادي') || lower.includes('ict-p2') || lower.includes('p2')) return 'E';
  
  // 6. Prep 3 (الصف الثالث الإعدادي) -> F
  if (clean.includes('ثالث إعدادي') || clean.includes('تالت اعدادي') || clean.includes('3 إعدادي') || clean.includes('الثالث الإعدادي') || lower.includes('ict-p3') || lower.includes('p3')) return 'F';
  
  // 7. Sec 1 (الصف الأول الثانوي) -> G
  if (clean.includes('أول ثانوي') || clean.includes('اول ثانوي') || clean.includes('1 ثانوي') || clean.includes('الأول الثانوي') || lower.includes('sec-1') || lower.includes('ict-s1') || lower.includes('s1')) return 'G';
  
  // 8. Sec 2 (الصف الثاني الثانوي) -> H
  if (clean.includes('ثاني ثانوي') || clean.includes('تاني ثانوي') || clean.includes('2 ثانوي') || clean.includes('الثاني الثانوي') || lower.includes('sec-2') || lower.includes('ict-s2') || lower.includes('s2')) return 'H';
  
  // 9. Sec 3 (الصف الثالث الثانوي) -> I
  if (clean.includes('ثالث ثانوي') || clean.includes('تالت ثانوي') || clean.includes('3 ثانوي') || clean.includes('الثالث الثانوي') || lower.includes('sec-3') || lower.includes('ict-s3') || lower.includes('s3')) return 'I';

  return 'A';
}

export function matchCourseForRegistration(allCourses: Course[], grade: string, track: string): Course | null {
  const cleanGrade = (grade || '').trim();
  const isLanguages = track === 'لغات' || track?.toLowerCase().includes('lang');

  // 1. Grade 4 Primary
  if (cleanGrade.includes('رابع') || cleanGrade.includes('4') || cleanGrade.includes('الرابع')) {
    const c = allCourses.find(c => {
      const n = (c.name || '').toLowerCase();
      const code = (c.code || '').toLowerCase();
      return n.includes('ict4') || code.includes('ict4') || (n.includes('رابع') && !n.includes('إعدادي') && !n.includes('ثانوي'));
    });
    if (c) return c;
  }

  // 2. Grade 5 Primary
  if (cleanGrade.includes('خامس') || cleanGrade.includes('5') || cleanGrade.includes('الخامس')) {
    const c = allCourses.find(c => {
      const n = (c.name || '').toLowerCase();
      const code = (c.code || '').toLowerCase();
      return n.includes('ict5') || code.includes('ict5') || (n.includes('خامس') && !n.includes('إعدادي') && !n.includes('ثانوي'));
    });
    if (c) return c;
  }

  // 3. Grade 6 Primary
  if (cleanGrade.includes('سادس') || cleanGrade.includes('6') || cleanGrade.includes('السادس')) {
    const c = allCourses.find(c => {
      const n = (c.name || '').toLowerCase();
      const code = (c.code || '').toLowerCase();
      return n.includes('ict6') || code.includes('ict6') || (n.includes('سادس') && !n.includes('إعدادي') && !n.includes('ثانوي'));
    });
    if (c) return c;
  }

  // 4. Prep 1
  if (cleanGrade.includes('أول إعدادي') || cleanGrade.includes('اول اعدادي') || cleanGrade.includes('1 إعدادي') || cleanGrade.includes('الأول الإعدادي')) {
    if (isLanguages) {
      const langCourse = allCourses.find(c => (c.name && c.name.includes('الأول الإعدادي') && c.name.includes('لغات')) || (c.code && (c.code.toLowerCase().includes('p1-l') || c.code.toLowerCase().includes('p1_l'))));
      if (langCourse) return langCourse;
    }
    const c = allCourses.find(c => {
      const n = (c.name || '').toLowerCase();
      const code = (c.code || '').toLowerCase();
      return n.includes('ict-p1') || code.includes('ict-p1') || (n.includes('أول إعدادي') || n.includes('الأول الإعدادي') || n.includes('اول اعدادي'));
    });
    if (c) return c;
  }

  // 5. Prep 2
  if (cleanGrade.includes('ثاني إعدادي') || cleanGrade.includes('تاني اعدادي') || cleanGrade.includes('2 إعدادي') || cleanGrade.includes('الثاني الإعدادي')) {
    if (isLanguages) {
      const langCourse = allCourses.find(c => (c.name && c.name.includes('الثاني الإعدادي') && c.name.includes('لغات')) || (c.code && (c.code.toLowerCase().includes('p2-l') || c.code.toLowerCase().includes('p2_l'))));
      if (langCourse) return langCourse;
    }
    const c = allCourses.find(c => {
      const n = (c.name || '').toLowerCase();
      const code = (c.code || '').toLowerCase();
      return n.includes('ict-p2') || code.includes('ict-p2') || (n.includes('ثاني إعدادي') || n.includes('الثاني الإعدادي') || n.includes('تاني اعدادي'));
    });
    if (c) return c;
  }

  // 6. Prep 3
  if (cleanGrade.includes('ثالث إعدادي') || cleanGrade.includes('تالت اعدادي') || cleanGrade.includes('3 إعدادي') || cleanGrade.includes('الثالث الإعدادي')) {
    if (isLanguages) {
      const langCourse = allCourses.find(c => (c.name && c.name.includes('الثالث الإعدادي') && c.name.includes('لغات')) || (c.code && (c.code.toLowerCase().includes('p3-l') || c.code.toLowerCase().includes('p3_l'))));
      if (langCourse) return langCourse;
    }
    const c = allCourses.find(c => {
      const n = (c.name || '').toLowerCase();
      const code = (c.code || '').toLowerCase();
      return n.includes('ict-p3') || code.includes('ict-p3') || (n.includes('ثالث إعدادي') || n.includes('الثالث الإعدادي') || n.includes('تالت اعدادي'));
    });
    if (c) return c;
  }

  // 7. Sec 1
  if (cleanGrade.includes('أول ثانوي') || cleanGrade.includes('اول ثانوي') || cleanGrade.includes('1 ثانوي') || cleanGrade.includes('الأول الثانوي')) {
    const c = allCourses.find(c => {
      const n = (c.name || '').toLowerCase();
      const code = (c.code || '').toLowerCase();
      return n.includes('ict-s1') || code.includes('ict-s1') || n.includes('أول ثانوي') || n.includes('الأول الثانوي');
    });
    if (c) return c;
  }

  // 8. Sec 2
  if (cleanGrade.includes('ثاني ثانوي') || cleanGrade.includes('تاني ثانوي') || cleanGrade.includes('2 ثانوي') || cleanGrade.includes('الثاني الثانوي')) {
    const c = allCourses.find(c => {
      const n = (c.name || '').toLowerCase();
      const code = (c.code || '').toLowerCase();
      return n.includes('ict-s2') || code.includes('ict-s2') || n.includes('ثاني ثانوي') || n.includes('الثاني الثانوي');
    });
    if (c) return c;
  }

  // 9. Sec 3
  if (cleanGrade.includes('ثالث ثانوي') || cleanGrade.includes('تالت ثانوي') || cleanGrade.includes('3 ثانوي') || cleanGrade.includes('الثالث الثانوي')) {
    const c = allCourses.find(c => {
      const n = (c.name || '').toLowerCase();
      const code = (c.code || '').toLowerCase();
      return n.includes('ict-s3') || code.includes('ict-s3') || n.includes('ثالث ثانوي') || n.includes('الثالث الثانوي');
    });
    if (c) return c;
  }

  // Fallback: match by course name containing grade name or exact match
  return allCourses.find(c => c.name === cleanGrade || cleanGrade.includes(c.name)) || null;
}

export async function handlePublicRegister(req: Request, res: Response) {
  try {
    const data = req.body;
    if (!data.fullName || !data.phone) {
      return res.status(400).json({ success: false, error: 'الاسم ورقم الهاتف حقول إجبارية' });
    }

    const cleanFullName = String(data.fullName).trim();
    const cleanPhone = String(data.phone).trim();
    const phoneDigits = cleanPhone.replace(/\D/g, '').slice(-10);
    const branchId = data.branchId || 'branch-1';
    const grade = String(data.grade || data.customGrade || 'الصف الرابع الابتدائي').trim();
    const track = String(data.track || 'عربي').trim();

    // Check existing by normalized phone or exact full name
    const allTrainees = await TraineeRepo.getAll();
    const allCourses = await CourseRepo.getAll();
    const allGroups = await GroupRepo.getAll();
    const allBranches = await BranchRepo.getAll();

    const existingTrainee = allTrainees.find(t => {
      const tPhoneDigits = String(t.phone || '').replace(/\D/g, '').slice(-10);
      const tParentDigits = String(t.parentPhone || '').replace(/\D/g, '').slice(-10);
      const phoneMatches = phoneDigits && phoneDigits.length >= 8 && (tPhoneDigits === phoneDigits || tParentDigits === phoneDigits);
      const nameMatches = t.fullName && t.fullName.trim().toLowerCase() === cleanFullName.toLowerCase();
      return phoneMatches || nameMatches;
    });

    if (existingTrainee) {
      const existingCourse = allCourses.find(c => c.id === existingTrainee.courseId);
      const existingGroup = allGroups.find(g => g.id === existingTrainee.groupId);
      const existingBranch = allBranches.find(b => b.id === existingTrainee.branchId);

      return res.json({
        success: true,
        message: 'أهلاً بك مجدداً! بياناتك مسجلة بالفعل لدينا مسبقاً بنجاح.',
        traineeCode: existingTrainee.code,
        traineeName: existingTrainee.fullName,
        groupName: existingGroup?.name || '',
        courseName: existingCourse?.name || '',
        branchName: existingBranch?.name || ''
      });
    }

    // Match or create course
    let targetCourse: Course | null = null;
    if (data.courseId) {
      targetCourse = allCourses.find(c => c.id === data.courseId) || null;
    }

    if (!targetCourse) {
      targetCourse = matchCourseForRegistration(allCourses, grade, track);
    }

    // If still no course, create a new tailored course
    if (!targetCourse) {
      const prefix = resolveGradePrefix(grade);
      const generatedCode = `CRS-${prefix}-${Date.now().toString().slice(-4)}`;
      const newCourse: Course = {
        id: 'crs-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        name: `${grade}${track === 'لغات' ? ' (لغات)' : ''}`,
        code: generatedCode,
        branchId: branchId,
        category: 'المدارس',
        hoursCount: 24,
        lecturesCount: 12,
        feeAmount: branchId === 'branch-2' ? 250 : 200,
        price: branchId === 'branch-2' ? 250 : 200,
        status: 'active'
      };
      await CourseRepo.create(newCourse.id, newCourse);
      targetCourse = newCourse;
    }

    // Match or create Group strictly in the selected branch for this target course
    const groupsInBranch = allGroups.filter(g => g.courseId === targetCourse!.id && g.branchId === branchId);
    let targetGroup: Group | null = null;

    for (const g of groupsInBranch) {
      const enrolledCount = allTrainees.filter(t => t.groupId === g.id).length;
      if (enrolledCount < (g.maxCapacity || g.maxStudents || 30)) {
        targetGroup = g;
        break;
      }
    }

    if (!targetGroup) {
      // Create new group in the selected branch for this course
      const groupNum = groupsInBranch.length + 1;
      const isBranch2 = branchId === 'branch-2';
      const groupName = `${targetCourse.name} - ${isBranch2 ? 'B' : ''}${groupNum}`;
      
      const newGroup: Group = {
        id: 'grp-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        name: groupName,
        courseId: targetCourse.id,
        branchId: branchId,
        maxStudents: 25,
        maxCapacity: 25,
        status: 'active',
        days: ['الجمعة'],
        timeSlot: '04:00 م - 06:00 م'
      };
      await GroupRepo.create(newGroup.id, newGroup);
      targetGroup = newGroup;
    }

    // Generate accurate, grade-matching code
    const expectedPrefix = resolveGradePrefix(grade || targetCourse.name);
    const pfx = expectedPrefix.toUpperCase();
    const regex = new RegExp(`^${pfx}-?(\\d+)$`, 'i');
    let maxNum = 0;
    allTrainees.forEach(t => {
      if (t.code) {
        const m = String(t.code).trim().match(regex);
        if (m) {
          const num = parseInt(m[1], 10);
          if (!isNaN(num) && num > maxNum) maxNum = num;
        }
      }
    });
    const nextNum = maxNum + 1;
    const newCode = `${pfx}${nextNum.toString().padStart(3, '0')}`;

    const branchObj = allBranches.find(b => b.id === branchId);
    const branchName = branchObj ? branchObj.name : branchId;

    const newTrainee: Trainee = {
      id: 'trainee-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      code: newCode,
      fullName: cleanFullName,
      phone: cleanPhone,
      parentPhone: data.parentPhone ? String(data.parentPhone).trim() : cleanPhone,
      parentName: data.parentName ? String(data.parentName).trim() : '',
      nationalId: data.nationalId ? String(data.nationalId).trim() : '',
      grade: grade,
      branchId: branchId,
      courseId: targetCourse.id,
      courseIds: [targetCourse.id],
      groupId: targetGroup.id,
      trainerId: targetGroup.trainerId || targetCourse.trainerId || '',
      gender: data.gender || 'male',
      registrationDate: new Date().toISOString().split('T')[0],
      status: 'active',
      feeAmount: targetCourse.feeAmount || targetCourse.price || 500,
      discountAmount: 0,
      netAmount: targetCourse.feeAmount || targetCourse.price || 500,
      paidAmount: 0,
      remainingAmount: targetCourse.feeAmount || targetCourse.price || 500,
      totalPoints: 0,
      points: 0,
      photoUrl: data.photoUrl || '',
      notes: `[طالب حقيقي - تسجيل ذاتي عبر الرابط الخارجي] - الصف: (${grade}) - المسار: (${track})`
    };

    await TraineeRepo.create(newTrainee.id, newTrainee);

    return res.json({
      success: true,
      traineeCode: newCode,
      traineeName: newTrainee.fullName,
      groupName: targetGroup.name,
      courseName: targetCourse.name,
      branchName: branchName
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    res.status(500).json({ success: false, error: err.message || 'Internal Server Error' });
  }
}
