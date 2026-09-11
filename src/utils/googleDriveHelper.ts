/**
 * Google Drive URL Parser & Embedded Viewer Utilities for Nagah Platform
 */

export function extractGoogleDriveId(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();

  // 1. Direct ID (Google Drive IDs are typically 25-50 chars: letters, numbers, -, _)
  if (/^[a-zA-Z0-9_-]{25,60}$/.test(trimmed)) {
    return trimmed;
  }

  // 2. /file/d/ID
  const fileDMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]{20,60})/);
  if (fileDMatch && fileDMatch[1]) {
    return fileDMatch[1];
  }

  // 3. /document/d/ID or /presentation/d/ID or /spreadsheets/d/ID
  const docMatch = trimmed.match(/\/(?:document|presentation|spreadsheets)\/d\/([a-zA-Z0-9_-]{20,60})/);
  if (docMatch && docMatch[1]) {
    return docMatch[1];
  }

  // 4. ?id=ID or &id=ID
  const queryMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]{20,60})/);
  if (queryMatch && queryMatch[1]) {
    return queryMatch[1];
  }

  return null;
}

export function getGoogleDrivePreviewUrl(driveFileId: string): string {
  return `https://drive.google.com/file/d/${driveFileId}/preview`;
}

export function getGoogleDriveViewUrl(driveFileId: string): string {
  return `https://drive.google.com/file/d/${driveFileId}/view?usp=sharing`;
}

export function getGoogleDriveDownloadUrl(driveFileId: string): string {
  return `https://drive.google.com/uc?export=download&id=${driveFileId}`;
}
