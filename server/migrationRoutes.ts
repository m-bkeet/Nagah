import { Router, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { MigrationService } from './migrationService';
import { executeDatabaseImport, previewDatabaseImport } from './data/phase2b.ts';
import { AuditLogRepo } from './data/index.ts';

export const migrationRouter = Router();

// 1. Export Migration Package ZIP
migrationRouter.get('/export-package', async (req: Request, res: Response) => {
  try {
    const { zipBuffer, filename } = await MigrationService.buildMigrationZipPackage();
    
    // Log in audit log
    try {
      await AuditLogRepo.create(`audit-${Date.now()}`, {
        id: `audit-${Date.now()}`,
        action: 'MIGRATION_PACKAGE_EXPORT',
        details: `تم تصدير حزمة الترحيل الكاملة للمنصة الجديدة: ${filename}`,
        userName: (req as any).user?.name || 'المدير العام',
        timestamp: new Date().toISOString()
      });
    } catch {}

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(zipBuffer);
  } catch (err: any) {
    console.error('[MigrationRouter] Failed to export package:', err);
    res.status(500).json({ success: false, error: 'تعذر إنشاء وتصدير حزمة الترحيل: ' + err.message });
  }
});

// 1.8 Export Full Database Excel (.xlsx)
migrationRouter.get('/export-excel', async (req: Request, res: Response) => {
  try {
    const { excelBuffer, filename } = await MigrationService.buildFullDatabaseExcel();
    
    // Log in audit log
    try {
      await AuditLogRepo.create(`audit-${Date.now()}`, {
        id: `audit-${Date.now()}`,
        action: 'FULL_DATABASE_EXCEL_EXPORT',
        details: `تم تصدير قاعدة بيانات المركز كاملة بصيغة إكسيل: ${filename}`,
        userName: (req as any).user?.name || 'المدير العام',
        timestamp: new Date().toISOString()
      });
    } catch {}

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(excelBuffer);
  } catch (err: any) {
    console.error('[MigrationRouter] Failed to export excel:', err);
    res.status(500).json({ success: false, error: 'تعذر تصدير قاعدة البيانات كملف إكسيل: ' + err.message });
  }
});


// 1.5 Export Delta Sync Package ZIP
migrationRouter.get('/export-delta', async (req: Request, res: Response) => {
  try {
    const { zipBuffer, filename } = await MigrationService.buildDeltaSyncZipPackage();
    
    // Log in audit log
    try {
      await AuditLogRepo.create(`audit-${Date.now()}`, {
        id: `audit-${Date.now()}`,
        action: 'DELTA_SYNC_PACKAGE_EXPORT',
        details: `تم تصدير حزمة المزامنة (Delta Sync) للمنصة الجديدة: ${filename}`,
        userName: (req as any).user?.name || 'المدير العام',
        timestamp: new Date().toISOString()
      });
    } catch {}

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(zipBuffer);
  } catch (err: any) {
    if (err.message === 'NO_CHANGES_DETECTED') {
      res.status(400).json({ success: false, error: 'NO_CHANGES_DETECTED', message: 'لم يتم رصد أي تغييرات جديدة منذ آخر عملية تصدير (Delta Sync).' });
    } else {
      console.error('[MigrationRouter] Failed to export delta package:', err);
      res.status(500).json({ success: false, error: 'تعذر إنشاء وتصدير حزمة المزامنة: ' + err.message });
    }
  }
});

// 2. Get Migration Manifest & Statistics
migrationRouter.get('/manifest', async (req: Request, res: Response) => {
  try {
    const extracted = await MigrationService.extractAllData();
    const manifest = {
      schemaVersion: '1.0.0',
      migrationVersion: '2026.08.v1',
      sourcePlatform: 'nagah-legacy-firestore',
      targetPlatform: 'nagah-production-supabase',
      exportedAt: new Date().toISOString(),
      summary: {
        totalStudents: extracted.allStudents.length,
        cleanStudentsCount: extracted.studentsValidList.length,
        needsReviewStudentsCount: extracted.studentsNeedsReview.length,
        trainersCount: extracted.allTrainers.length,
        branchesCount: extracted.allBranches.length,
        labsCount: extracted.allLabs.length,
        coursesCount: extracted.allCourses.length,
        groupsCount: extracted.allGroups.length,
        schedulesCount: extracted.scheduleList.length,
        scheduleConflictsCount: extracted.scheduleConflicts.length,
        attendanceCount: extracted.allAttendance.length,
        paymentsCount: extracted.allPayments.length,
        expensesCount: extracted.allExpenses.length,
        certificatesCount: extracted.allCertificates.length,
        pointTransactionsCount: extracted.allPointTransactions.length,
        examsCount: extracted.allExams.length,
        usersCount: extracted.allUsers.length
      },
      needsReviewSummary: extracted.needsReviewSummary
    };
    res.json({ success: true, manifest });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Backup History Table
migrationRouter.get('/history', async (req: Request, res: Response) => {
  try {
    const history = MigrationService.getHistory();
    res.json({ success: true, history });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Generate Full Backup
migrationRouter.post('/full-backup', async (req: Request, res: Response) => {
  try {
    const result = await MigrationService.buildFullBackup();
    
    // Log in audit
    try {
      await AuditLogRepo.create(`audit-${Date.now()}`, {
        id: `audit-${Date.now()}`,
        action: 'FULL_BACKUP_GENERATED',
        details: `تم إنشاء نسخة احتياطية كاملة: ${result.filename} بحجم ${result.sizeBytes} بايت`,
        userName: (req as any).user?.name || 'المدير العام',
        timestamp: new Date().toISOString()
      });
    } catch {}

    res.json({
      success: true,
      filename: result.filename,
      checksum: result.checksum,
      sizeBytes: result.sizeBytes,
      backupData: result.backupData
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'تعذر إنشاء النسخة الاحتياطية: ' + err.message });
  }
});

// 5. Verify Backup / Current Database Integrity
migrationRouter.post('/verify', async (req: Request, res: Response) => {
  try {
    let dataToVerify = req.body;
    if (!dataToVerify || Object.keys(dataToVerify).length === 0) {
      // Default to checking current system data
      const extracted = await MigrationService.extractAllData();
      dataToVerify = {
        trainees: extracted.allStudents,
        trainers: extracted.allTrainers,
        branches: extracted.allBranches,
        courses: extracted.allCourses,
        groups: extracted.allGroups,
        attendance: extracted.allAttendance,
        payments: extracted.allPayments
      };
    }

    const verificationResult = MigrationService.verifyIntegrity(dataToVerify);
    res.json({ success: true, result: verificationResult });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. Preview Import
migrationRouter.post('/preview-import', async (req: Request, res: Response) => {
  try {
    const rawData = req.body;
    if (!rawData) {
      return res.status(400).json({ success: false, error: 'البيانات المدخلة فارغة' });
    }
    const preview = await previewDatabaseImport(rawData);
    res.json({ success: true, preview });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'فشل فحص المعاينة: ' + err.message });
  }
});

// 7. Execute Import
migrationRouter.post('/execute-import', async (req: Request, res: Response) => {
  try {
    const { data, mode = 'MERGE', confirmReplace, confirmToken } = req.body;
    if (!data) {
      return res.status(400).json({ success: false, error: 'لا توجد بيانات للاستيراد' });
    }

    if (mode === 'REPLACE' && !confirmReplace && confirmToken !== 'CONFIRM_REPLACE') {
      return res.status(400).json({
        success: false,
        error: 'وضع الإبدال (REPLACE) يتطلب تأكيداً صريحاً (confirmToken: "CONFIRM_REPLACE") لحماية البيانات من الحذف'
      });
    }

    const result = await executeDatabaseImport(data, mode, { confirmReplace, confirmToken });

    // Log in audit log
    try {
      await AuditLogRepo.create(`audit-${Date.now()}`, {
        id: `audit-${Date.now()}`,
        action: `DATA_IMPORT_${mode}`,
        details: `تم استيراد ${result.importedCount} سجل بنمط (${mode}) ${result.backupFile ? `مع حفظ نسخة أمان: ${result.backupFile}` : ''}`,
        userName: (req as any).user?.name || 'المدير العام',
        timestamp: new Date().toISOString()
      });
    } catch {}

    res.json({
      success: true,
      importedCount: result.importedCount,
      backupFile: result.backupFile,
      message: `تم استيراد ${result.importedCount} سجل بنجاح تام!`
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'فشل استيراد البيانات: ' + err.message });
  }
});



// PROMPT 17: NAGAH LEGACY — Basic Data Export Only (Excel & JSON)
migrationRouter.get('/legacy-export-excel', async (req: Request, res: Response) => {
  try {
    const { excelBuffer, filename } = await MigrationService.exportLegacyBasicDataExcel();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(excelBuffer);
  } catch (err: any) {
    console.error('[LegacyExportExcel] Error:', err);
    res.status(500).json({ success: false, error: 'تعذر تصدير البيانات الأساسية: ' + err.message });
  }
});

migrationRouter.get('/legacy-export-json', async (req: Request, res: Response) => {
  try {
    const { packageJson, filename } = await MigrationService.exportLegacyBasicDataJson();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(JSON.stringify(packageJson, null, 2));
  } catch (err: any) {
    console.error('[LegacyExportJson] Error:', err);
    res.status(500).json({ success: false, error: 'تعذر تصدير البيانات الأساسية JSON: ' + err.message });
  }
});


