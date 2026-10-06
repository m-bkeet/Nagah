// Google Drive Cloud Storage & File Service for Nagah Platform
import { GoogleDriveBackupFile } from '../types';
import { getGoogleDriveThumbnailUrl } from '../utils/googleDriveHelper';
import { auth } from '../lib/firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

declare global {
  interface Window {
    google?: any;
    gapi?: any;
  }
}

const DRIVE_UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
const DRIVE_FILES_URL = 'https://www.googleapis.com/drive/v3/files';
const STORAGE_TOKEN_KEY = 'nagah_google_drive_token';
const STORAGE_USER_KEY = 'nagah_google_drive_user';

export class GoogleDriveService {
  private static cachedAccessToken: string | null = null;
  private static studentPhotosFolderId: string | null = null;
  private static curriculumFolderId: string | null = null;

  // Check if user is currently connected to Google Drive
  static getStoredToken(): string | null {
    if (this.cachedAccessToken) return this.cachedAccessToken;
    const item = localStorage.getItem(STORAGE_TOKEN_KEY);
    if (!item) return null;
    try {
      const parsed = JSON.parse(item);
      if (Date.now() > parsed.expiresAt) {
        localStorage.removeItem(STORAGE_TOKEN_KEY);
        this.cachedAccessToken = null;
        return null;
      }
      this.cachedAccessToken = parsed.token;
      return parsed.token;
    } catch {
      return null;
    }
  }

  static getConnectedUser(): { email?: string; name?: string; picture?: string } | null {
    const item = localStorage.getItem(STORAGE_USER_KEY);
    if (!item) return null;
    try {
      return JSON.parse(item);
    } catch {
      return null;
    }
  }

  static saveToken(token: string, expiresInSeconds: number = 3600) {
    this.cachedAccessToken = token;
    const expiresAt = Date.now() + (expiresInSeconds - 60) * 1000;
    localStorage.setItem(STORAGE_TOKEN_KEY, JSON.stringify({ token, expiresAt }));
  }

  static disconnect() {
    this.cachedAccessToken = null;
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    localStorage.removeItem(STORAGE_USER_KEY);
  }

  // Request OAuth access token using Google Identity Services (GIS) or Firebase Auth Provider
  static async requestAccessToken(forceInteractive = false): Promise<string> {
    const existingToken = !forceInteractive ? this.getStoredToken() : null;
    if (existingToken) {
      return existingToken;
    }

    // 1. Try Firebase Auth Google Provider first if available
    try {
      if (auth) {
        const provider = new GoogleAuthProvider();
        provider.addScope('https://www.googleapis.com/auth/drive.file');
        provider.addScope('https://www.googleapis.com/auth/userinfo.email');
        provider.addScope('https://www.googleapis.com/auth/userinfo.profile');
        
        const result = await signInWithPopup(auth, provider);
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential?.accessToken;

        if (token) {
          this.saveToken(token, 3600);
          if (result.user) {
            localStorage.setItem(STORAGE_USER_KEY, JSON.stringify({
              email: result.user.email || '',
              name: result.user.displayName || 'مدير النظام',
              picture: result.user.photoURL || ''
            }));
          }
          return token;
        }
      }
    } catch (firebaseAuthErr) {
      console.warn('[GoogleDriveService] Firebase Auth popup notice:', firebaseAuthErr);
    }

    // 2. Fallback to Google Identity Services (GIS)
    return new Promise((resolve, reject) => {
      if (typeof window !== 'undefined' && window.google?.accounts?.oauth2) {
        try {
          const client = window.google.accounts.oauth2.initTokenClient({
            client_id: '303545128372-rca45auh51sii7416n6e44ckdj5hme2o.apps.googleusercontent.com',
            scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
            callback: async (tokenResponse: any) => {
              if (tokenResponse.error) {
                reject(new Error(`فشل الاتصال بـ Google Drive: ${tokenResponse.error}`));
                return;
              }
              if (tokenResponse.access_token) {
                this.saveToken(tokenResponse.access_token, Number(tokenResponse.expires_in) || 3600);
                try {
                  const uRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
                  });
                  if (uRes.ok) {
                    const uData = await uRes.json();
                    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify({
                      email: uData.email,
                      name: uData.name,
                      picture: uData.picture
                    }));
                  }
                } catch (e) {
                  console.warn('Could not fetch user profile:', e);
                }
                resolve(tokenResponse.access_token);
              } else {
                reject(new Error('لم يتم استلام رمز المصادقة من Google'));
              }
            }
          });

          client.requestAccessToken();
        } catch (err: any) {
          reject(new Error(`تعذر بدء جلسة Google Drive: ${err?.message || err}`));
        }
      } else {
        reject(new Error('خدمة Google Identity Services غير محملة في المتصفح'));
      }
    });
  }

  // Find or create dedicated folder for Student Photos
  static async getOrCreateStudentPhotosFolder(tokenOverride?: string): Promise<string> {
    if (this.studentPhotosFolderId) return this.studentPhotosFolderId;
    const token = tokenOverride || await this.requestAccessToken();
    if (!token) throw new Error('يرجى ربط حساب Google Drive أولاً');

    const folderName = 'Nagah_Student_Photos';
    const query = `name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
    const searchUrl = `${DRIVE_FILES_URL}?q=${encodeURIComponent(query)}&fields=files(id,name)`;

    try {
      const searchRes = await fetch(searchUrl, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (searchRes.ok) {
        const searchData = await searchRes.json();
        if (searchData.files && searchData.files.length > 0) {
          this.studentPhotosFolderId = searchData.files[0].id;
          return searchData.files[0].id;
        }
      }

      // Create folder if not found
      const createRes = await fetch(DRIVE_FILES_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: folderName,
          mimeType: 'application/vnd.google-apps.folder',
          description: 'مجلد صور المتدربين والطلاب لمركز النجاح للتدريب'
        })
      });

      if (createRes.ok) {
        const createData = await createRes.json();
        this.studentPhotosFolderId = createData.id;
        return createData.id;
      }
    } catch (err) {
      console.warn('[GoogleDriveService] Error finding/creating student photos folder:', err);
    }

    return '';
  }

  // Upload student photo directly to Google Drive
  static async uploadStudentPhoto(
    source: File | Blob | string,
    studentName: string = 'student',
    studentCode?: string,
    tokenOverride?: string
  ): Promise<{ success: boolean; fileId: string; photoUrl: string; fileName: string }> {
    let token = tokenOverride || this.getStoredToken();
    if (!token) {
      token = await this.requestAccessToken();
    }

    let blob: Blob;
    let contentType = 'image/jpeg';

    if (typeof source === 'string') {
      if (source.startsWith('data:')) {
        const parts = source.split(',');
        const mimeMatch = parts[0].match(/:(.*?);/);
        contentType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
        const byteString = atob(parts[1]);
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        blob = new Blob([ab], { type: contentType });
      } else {
        // Source is already a URL
        return {
          success: true,
          fileId: '',
          photoUrl: source,
          fileName: `${studentCode || 'std'}_photo.jpg`
        };
      }
    } else {
      blob = source;
      contentType = source.type || 'image/jpeg';
    }

    const folderId = await this.getOrCreateStudentPhotosFolder(token).catch(() => '');
    const cleanCode = (studentCode || '').replace(/[^a-zA-Z0-9_-]/g, '_');
    const cleanName = (studentName || 'trainee').replace(/[^a-zA-Z0-9_\u0600-\u06FF]/g, '_');
    const fileName = `Photo_${cleanCode || 'std'}_${cleanName}_${Date.now()}.jpg`;

    const metadata: any = {
      name: fileName,
      mimeType: contentType,
      description: `صورة المتدرب: ${studentName} (${studentCode || ''})`
    };

    if (folderId) {
      metadata.parents = [folderId];
    }

    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const metadataPart = delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      `Content-Type: ${contentType}\r\n\r\n`;

    const metadataBlob = new Blob([metadataPart], { type: 'text/plain' });
    const closeBlob = new Blob([closeDelimiter], { type: 'text/plain' });
    const multipartBody = new Blob([metadataBlob, blob, closeBlob]);

    const uploadRes = await fetch(DRIVE_UPLOAD_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`
      },
      body: multipartBody
    });

    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      if (uploadRes.status === 401) {
        this.disconnect();
        throw new Error('انتهت صلاحية جلسة Google Drive. يرجى إعادة تسجيل الدخول بحساب Google');
      }
      throw new Error(`فشل رفع صورة المتدرب إلى Google Drive: ${errText}`);
    }

    const uploadData = await uploadRes.json();
    const fileId = uploadData.id;

    // Make photo accessible via link for display in cards and badges
    try {
      await fetch(`${DRIVE_FILES_URL}/${fileId}/permissions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          role: 'reader',
          type: 'anyone'
        })
      });
    } catch (permErr) {
      console.warn('[GoogleDriveService] Permission grant notice:', permErr);
    }

    const photoUrl = getGoogleDriveThumbnailUrl(fileId, 400);

    return {
      success: true,
      fileId,
      photoUrl,
      fileName
    };
  }

  // Delete file from Google Drive (prevent orphaned files)
  static async deleteDriveFile(fileId: string, tokenOverride?: string): Promise<boolean> {
    if (!fileId || fileId.trim().length === 0) return true;
    const token = tokenOverride || this.getStoredToken();
    if (!token) return false;

    try {
      const res = await fetch(`${DRIVE_FILES_URL}/${fileId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      // 204 No Content or 404 Not Found (already deleted) are successes
      return res.status === 204 || res.status === 404 || res.ok;
    } catch (err) {
      console.warn('[GoogleDriveService] deleteDriveFile warning:', err);
      return false;
    }
  }

  // Find or create a specific folder for curriculum files
  static async getOrCreateCurriculumFolder(tokenOverride?: string): Promise<string> {
    if (this.curriculumFolderId) return this.curriculumFolderId;
    const token = tokenOverride || this.getStoredToken();
    if (!token) return '';

    const folderName = 'مناهج مركز النجاح للتدريب';
    const query = `name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
    const searchUrl = `${DRIVE_FILES_URL}?q=${encodeURIComponent(query)}&fields=files(id)`;

    try {
      const searchRes = await fetch(searchUrl, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (searchRes.ok) {
        const searchData = await searchRes.json();
        if (searchData.files && searchData.files.length > 0) {
          this.curriculumFolderId = searchData.files[0].id;
          return searchData.files[0].id;
        }
      }

      // Create folder if not found
      const createRes = await fetch(DRIVE_FILES_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: folderName,
          mimeType: 'application/vnd.google-apps.folder',
          description: 'مجلد مخصص لمناهج ومذكرات دورات مركز النجاح للتدريب والاستشارات'
        })
      });

      if (createRes.ok) {
        const createData = await createRes.json();
        this.curriculumFolderId = createData.id;
        return createData.id;
      }
    } catch (err) {
      console.error('Error finding/creating curriculum folder:', err);
    }

    return '';
  }

  // Upload binary file directly to Google Drive (PDFs, PPT, Videos, Course Materials)
  static async uploadFile(
    file: File, 
    folderId?: string, 
    tokenOverride?: string,
    onProgress?: (percent: number, loadedBytes: number, totalBytes: number) => void
  ): Promise<{ success: boolean; fileId: string; webViewLink?: string; webContentLink?: string }> {
    let token = tokenOverride || this.getStoredToken();
    if (!token) {
      token = await this.requestAccessToken();
    }

    const targetFolderId = folderId || await this.getOrCreateCurriculumFolder(token);

    const metadata: any = {
      name: file.name,
      mimeType: file.type || 'application/octet-stream',
      description: 'مرفق أو ملف دورة تدريبية تم رفعه عبر منصة النجاح'
    };

    if (targetFolderId) {
      metadata.parents = [targetFolderId];
    }

    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const metadataPart = delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      `Content-Type: ${file.type || 'application/octet-stream'}\r\n\r\n`;

    const metadataBlob = new Blob([metadataPart], { type: 'text/plain' });
    const closeBlob = new Blob([closeDelimiter], { type: 'text/plain' });
    const multipartBody = new Blob([metadataBlob, file, closeBlob]);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', DRIVE_UPLOAD_URL);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.setRequestHeader('Content-Type', `multipart/related; boundary=${boundary}`);

      if (xhr.upload && onProgress) {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            onProgress(percent, e.loaded, e.total);
          }
        };
      }

      xhr.onload = async () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            const fileId = data.id;

            // Grant read permission
            fetch(`${DRIVE_FILES_URL}/${fileId}/permissions`, {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ role: 'reader', type: 'anyone' })
            }).catch(() => {});

            if (onProgress) onProgress(100, file.size, file.size);
            resolve({
              success: true,
              fileId,
              webViewLink: `https://drive.google.com/file/d/${fileId}/view?usp=sharing`,
              webContentLink: `https://drive.google.com/uc?export=download&id=${fileId}`
            });
          } catch (parseErr) {
            reject(new Error('فشل معالجة استجابة Google Drive'));
          }
        } else if (xhr.status === 401) {
          GoogleDriveService.disconnect();
          reject(new Error('انتهت صلاحية الجلسة، يرجى إعادة تسجيل الدخول بحساب Google'));
        } else {
          reject(new Error(`فشل الرفع إلى Google Drive (رمز ${xhr.status}): ${xhr.responseText}`));
        }
      };

      xhr.onerror = () => {
        reject(new Error('حدث خطأ في الاتصال بالشبكة أثناء الرفع إلى Google Drive'));
      };

      xhr.send(multipartBody);
    });
  }

  // Upload backup snapshot to Google Drive
  static async uploadBackup(backupData: any, tokenOverride?: string): Promise<{ success: boolean; fileId: string; fileName: string }> {
    let token = tokenOverride || this.getStoredToken();
    if (!token) {
      token = await this.requestAccessToken();
    }

    const dateStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const fileName = `Nagah_MS_Backup_${dateStr}.json`;
    const fileContent = JSON.stringify(backupData, null, 2);

    const metadata = {
      name: fileName,
      mimeType: 'application/json',
      description: 'نسخة احتياطية سحابية كاملة من نظام إدارة مركز النجاح للتدريب والاستشارات'
    };

    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const multipartRequestBody =
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      fileContent +
      closeDelimiter;

    const response = await fetch(DRIVE_UPLOAD_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`
      },
      body: multipartRequestBody
    });

    if (!response.ok) {
      const err = await response.text();
      if (response.status === 401) {
        this.disconnect();
        throw new Error('انتهت صلاحية الجلسة في Google Drive، يرجى إعادة تسجيل الدخول');
      }
      throw new Error(`فشل رفع النسخة السحابية: ${err}`);
    }

    const data = await response.json();
    return {
      success: true,
      fileId: data.id,
      fileName
    };
  }

  // List existing backups from Google Drive
  static async listBackups(tokenOverride?: string): Promise<GoogleDriveBackupFile[]> {
    const token = tokenOverride || this.getStoredToken();
    if (!token) return [];

    const query = "name contains 'Nagah_MS_Backup' and trashed=false";
    const url = `${DRIVE_FILES_URL}?q=${encodeURIComponent(query)}&orderBy=createdTime desc&fields=files(id,name,size,createdTime,modifiedTime)`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        this.disconnect();
      }
      return [];
    }

    const data = await response.json();
    return data.files || [];
  }

  // Download a backup snapshot from Google Drive
  static async downloadBackup(fileId: string, tokenOverride?: string): Promise<any> {
    const token = tokenOverride || this.getStoredToken();
    if (!token) {
      throw new Error('يرجى تسجيل الدخول بحساب Google أولاً');
    }

    const url = `${DRIVE_FILES_URL}/${fileId}?alt=media`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('فشل تحميل ملف النسخة الاحتياطية من Google Drive');
    }

    const json = await response.json();
    return json;
  }
}
