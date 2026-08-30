import fs from 'fs';
import path from 'path';
import cron from 'node-cron';
import { google } from 'googleapis';
import { db } from './db';

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

async function backupToDrive() {
  const dbData = db.getData();
  const googleDriveSync = dbData.googleDriveSync;
  
  if (!googleDriveSync || !googleDriveSync.autoSyncEnabled || !googleDriveSync.serviceAccountJson) {
    return;
  }

  try {
    const credentials = JSON.parse(googleDriveSync.serviceAccountJson);
    
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: SCOPES,
    });
    
    const drive = google.drive({ version: 'v3', auth });
    
    const filePath = path.join(process.cwd(), 'data', 'database.json');
    if (!fs.existsSync(filePath)) {
      return;
    }

    const fileMetadata = {
      name: `backup_${new Date().toISOString()}.json`,
      parents: googleDriveSync.folderId ? [googleDriveSync.folderId] : undefined
    };
    
    const media = {
      mimeType: 'application/json',
      body: fs.createReadStream(filePath)
    };
    
    const res = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id'
    });
    
    console.log(`Backup successful, file ID: ${res.data.id}`);
    
    // Update status in DB
    dbData.googleDriveSync.syncStatus = 'مكتمل بنجاح';
    dbData.googleDriveSync.lastSyncTime = new Date().toISOString();
    db.save();
    
  } catch (error) {
    console.error('Backup to Google Drive failed:', error);
    dbData.googleDriveSync.syncStatus = 'فشل المزامنة';
    db.save();
  }
}

export function startBackupCron() {
  // Run everyday at 2 AM
  cron.schedule('0 2 * * *', () => {
    console.log('Running scheduled Google Drive backup...');
    backupToDrive();
  });
}
