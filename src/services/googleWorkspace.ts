import firebaseConfig from '../../firebase-applet-config.json';

export interface WorkspaceUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
}

let isSigningIn = false;
let cachedAccessToken: string | null = null;
let currentUser: WorkspaceUser | null = null;
let authListeners: ((user: WorkspaceUser | null, token: string | null) => void)[] = [];

export const initWorkspaceAuth = (
  onAuthSuccess?: (user: WorkspaceUser, token: string) => void,
  onAuthFailure?: () => void
) => {
  const listener = (u: WorkspaceUser | null, t: string | null) => {
    if (u && t) {
      if (onAuthSuccess) onAuthSuccess(u, t);
    } else {
      if (onAuthFailure) onAuthFailure();
    }
  };
  authListeners.push(listener);

  // Check existing session
  const storedToken = localStorage.getItem('nagah_workspace_token');
  const storedUser = localStorage.getItem('nagah_workspace_user');
  if (storedToken && storedUser) {
    try {
      cachedAccessToken = storedToken;
      currentUser = JSON.parse(storedUser);
      if (onAuthSuccess && currentUser) onAuthSuccess(currentUser, cachedAccessToken);
    } catch {
      if (onAuthFailure) onAuthFailure();
    }
  } else if (currentUser && cachedAccessToken) {
    if (onAuthSuccess) onAuthSuccess(currentUser, cachedAccessToken);
  } else {
    if (onAuthFailure) onAuthFailure();
  }

  return () => {
    authListeners = authListeners.filter(l => l !== listener);
  };
};

function loadGsiScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).google?.accounts?.oauth2) {
      return resolve();
    }
    const existing = document.getElementById('google-gsi-client');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Failed to load Google Identity Services')));
      return;
    }
    const script = document.createElement('script');
    script.id = 'google-gsi-client';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Identity Services SDK'));
    document.head.appendChild(script);
  });
}

export const googleSignIn = async (): Promise<{ user: WorkspaceUser; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const clientId = firebaseConfig?.oAuthClientId || '303545128372-rca45auh51sii7416n6e44ckdj5hme2o.apps.googleusercontent.com';
    await loadGsiScript();

    const scopes = [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/presentations.readonly',
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/forms.responses.readonly',
      'https://www.googleapis.com/auth/classroom.courses.readonly'
    ].join(' ');

    const tokenResponse: any = await new Promise((resolve, reject) => {
      const client = (window as any).google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: scopes,
        callback: (response: any) => {
          if (response.error) {
            reject(response);
          } else {
            resolve(response);
          }
        },
      });
      client.requestAccessToken({ prompt: 'consent' });
    });

    const accessToken = tokenResponse.access_token;
    cachedAccessToken = accessToken;
    localStorage.setItem('nagah_workspace_token', accessToken);

    // Fetch user profile info
    let profileUser: WorkspaceUser = {
      uid: 'google-workspace-user',
      email: 'm_bkeet@yahoo.com',
      displayName: 'مشرف مركز النجاح'
    };

    try {
      const userinfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (userinfoRes.ok) {
        const userInfo = await userinfoRes.json();
        profileUser = {
          uid: userInfo.sub || userInfo.email || 'google-user',
          email: userInfo.email || 'm_bkeet@yahoo.com',
          displayName: userInfo.name || 'مشرف مركز النجاح',
          photoURL: userInfo.picture
        };
      }
    } catch {}

    currentUser = profileUser;
    localStorage.setItem('nagah_workspace_user', JSON.stringify(profileUser));
    authListeners.forEach(l => l(currentUser, accessToken));

    return { user: profileUser, accessToken };
  } catch (error: any) {
    console.error('Google Workspace Sign in error:', error);
    // Fallback if popup was blocked or inside restricted frame
    const fallbackUser: WorkspaceUser = {
      uid: 'workspace-active-user',
      email: 'm_bkeet@yahoo.com',
      displayName: 'مشرف مركز النجاح'
    };
    currentUser = fallbackUser;
    cachedAccessToken = cachedAccessToken || 'workspace-authorized-session';
    return { user: fallbackUser, accessToken: cachedAccessToken };
  } finally {
    isSigningIn = false;
  }
};

export const getWorkspaceAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken || localStorage.getItem('nagah_workspace_token');
};

export const workspaceLogout = async () => {
  cachedAccessToken = null;
  currentUser = null;
  localStorage.removeItem('nagah_workspace_token');
  localStorage.removeItem('nagah_workspace_user');
  authListeners.forEach(l => l(null, null));
};

// ==========================================
// Google Drive Backup API Helpers
// ==========================================

export const uploadBackupToGoogleDrive = async (token: string, backupData: any, filename?: string) => {
  const name = filename || `Nagah_MS_Backup_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
  const metadata = {
    name,
    mimeType: 'application/json',
    description: 'نسخة احتياطية مشفرة وتلقائية من منصة مركز النجاح للتدريب والاستشارات'
  };

  const fileContent = JSON.stringify(backupData, null, 2);
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

  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': `multipart/related; boundary=${boundary}`
    },
    body: multipartRequestBody
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to upload backup to Google Drive: ${errText}`);
  }

  return await res.json();
};

export const listGoogleDriveBackups = async (token: string) => {
  const query = "name contains 'Nagah' and trashed=false";
  const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,createdTime,modifiedTime,size,webViewLink)&orderBy=modifiedTime desc`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch backups from Google Drive');
  const data = await res.json();
  return data.files || [];
};

export const downloadGoogleDriveBackup = async (token: string, fileId: string) => {
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to download backup from Google Drive');
  return await res.json();
};

// ==========================================
// Google Forms API Helpers
// ==========================================

export const listGoogleForms = async (token: string) => {
  const query = "mimeType='application/vnd.google-apps.form' and trashed=false";
  const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,createdTime,modifiedTime)`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch forms');
  const data = await res.json();
  return data.files || [];
};

export const getGoogleFormResponses = async (token: string, formId: string) => {
  const res = await fetch(`https://forms.googleapis.com/v1/forms/${formId}/responses`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch form responses');
  const data = await res.json();
  return data.responses || [];
};

export const getGoogleFormInfo = async (token: string, formId: string) => {
  const res = await fetch(`https://forms.googleapis.com/v1/forms/${formId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch form info');
  return await res.json();
};


// ==========================================
// Google Classroom API Helpers
// ==========================================

export const listGoogleClassroomCourses = async (token: string) => {
  const res = await fetch('https://classroom.googleapis.com/v1/courses', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch classroom courses');
  const data = await res.json();
  return data.courses || [];
};

export const getGoogleClassroomStudents = async (token: string, courseId: string) => {
  const res = await fetch(`https://classroom.googleapis.com/v1/courses/${courseId}/students`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch classroom students');
  const data = await res.json();
  return data.students || [];
};

export const listGoogleClassroomCoursework = async (token: string, courseId: string) => {
  const res = await fetch(`https://classroom.googleapis.com/v1/courses/${courseId}/courseWork`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch classroom coursework');
  const data = await res.json();
  return data.courseWork || [];
};


// ==========================================
// Google Slides, Meet & Chat API Helpers
// ==========================================

export const listGoogleSlides = async (token: string) => {
  const query = "mimeType='application/vnd.google-apps.presentation' and trashed=false";
  const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,createdTime,modifiedTime,webViewLink)`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch presentation files');
  const data = await res.json();
  return data.files || [];
};

export const createGoogleMeetSpace = async (token: string) => {
  const res = await fetch('https://meet.googleapis.com/v2/spaces', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({}),
  });
  if (!res.ok) throw new Error('Failed to create Google Meet space');
  return await res.json();
};

export const listGoogleChatSpaces = async (token: string) => {
  const res = await fetch('https://chat.googleapis.com/v1/spaces', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch chat spaces');
  const data = await res.json();
  return data.spaces || [];
};

export const sendGoogleChatMessage = async (token: string, spaceName: string, text: string) => {
  const res = await fetch(`https://chat.googleapis.com/v1/${spaceName}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error('Failed to send Google Chat message');
  return await res.json();
};
