import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import os from 'os';

const isVercel = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.VERCEL_ENV);

function resolveMediaDir(): string {
  const candidates = isVercel
    ? [path.join(os.tmpdir(), 'nagah_media')]
    : [path.join(process.cwd(), 'data', 'media'), path.join(os.tmpdir(), 'nagah_media')];

  for (const dir of candidates) {
    try {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      return dir;
    } catch {
      // try next fallback
    }
  }
  return path.join(os.tmpdir(), 'nagah_media');
}

export const MEDIA_DIR = resolveMediaDir();

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
  'audio/webm': 'webm',
  'audio/mpeg': 'mp3',
  'audio/mp3': 'mp3',
  'audio/ogg': 'ogg',
  'audio/wav': 'wav',
  'audio/mp4': 'm4a',
  'application/pdf': 'pdf'
};

const EXT_TO_MIME: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  svg: 'image/svg+xml',
  webm: 'audio/webm',
  mp3: 'audio/mpeg',
  ogg: 'audio/ogg',
  wav: 'audio/wav',
  m4a: 'audio/mp4',
  pdf: 'application/pdf'
};

const DATA_URI_RE = /^data:([a-zA-Z0-9.+\-\/]+);base64,([A-Za-z0-9+/=\s]+)$/;

/**
 * Extracts a Base64 Data URI into a content-addressed file inside data/media/
 * and returns its lightweight relative URL (`/api/media/<sha256>.<ext>`).
 * Non-data-URI strings or tiny payloads (< 4KB) are returned untouched.
 */
export function extractBase64ToMediaUrl(value: unknown, minBytes = 4096): unknown {
  if (typeof value !== 'string') return value;
  if (!value.startsWith('data:') || value.length < minBytes) return value;

  const match = DATA_URI_RE.exec(value);
  if (!match) return value;

  const mime = match[1].toLowerCase();
  const ext = MIME_TO_EXT[mime];
  if (!ext) return value;

  try {
    const cleanB64 = match[2].replace(/\s+/g, '');
    const buffer = Buffer.from(cleanB64, 'base64');
    if (buffer.length < 256) return value;

    const hash = crypto.createHash('sha256').update(buffer).digest('hex').slice(0, 24);
    const filename = `${hash}.${ext}`;
    const fullPath = path.join(MEDIA_DIR, filename);

    if (!fs.existsSync(fullPath)) {
      if (!fs.existsSync(MEDIA_DIR)) {
        fs.mkdirSync(MEDIA_DIR, { recursive: true });
      }
      fs.writeFileSync(fullPath, buffer);
    }

    return `/api/media/${filename}`;
  } catch (err) {
    console.warn('[MediaStorage] Failed to extract base64 blob:', err);
    return value;
  }
}

/**
 * Recursively walks an object/array and replaces large embedded data:image / data:audio
 * Base64 strings with `/api/media/<hash>.<ext>` URLs. Mutates in place & returns count of extracted blobs.
 */
export function optimizeEmbeddedMediaInObject(target: any, minBytes = 4096): { extracted: number; savedBytes: number } {
  let extracted = 0;
  let savedBytes = 0;

  const walk = (node: any) => {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) {
      for (let i = 0; i < node.length; i++) {
        const item = node[i];
        if (typeof item === 'string' && item.startsWith('data:') && item.length >= minBytes) {
          const replaced = extractBase64ToMediaUrl(item, minBytes);
          if (typeof replaced === 'string' && replaced !== item) {
            savedBytes += item.length - replaced.length;
            extracted++;
            node[i] = replaced;
          }
        } else if (item && typeof item === 'object') {
          walk(item);
        }
      }
      return;
    }

    for (const key of Object.keys(node)) {
      const val = node[key];
      if (typeof val === 'string' && val.startsWith('data:') && val.length >= minBytes) {
        const replaced = extractBase64ToMediaUrl(val, minBytes);
        if (typeof replaced === 'string' && replaced !== val) {
          savedBytes += val.length - replaced.length;
          extracted++;
          node[key] = replaced;
        }
      } else if (val && typeof val === 'object') {
        walk(val);
      }
    }
  };

  walk(target);
  return { extracted, savedBytes };
}

export function resolveSafeMediaFile(filename: string): { filePath: string; mimeType: string } | null {
  if (!filename || !/^[a-f0-9]{16,64}\.(jpg|jpeg|png|webp|gif|svg|webm|mp3|ogg|wav|m4a|pdf)$/i.test(filename)) {
    return null;
  }
  const filePath = path.join(MEDIA_DIR, path.basename(filename));
  if (!fs.existsSync(filePath)) return null;
  const ext = path.extname(filename).slice(1).toLowerCase();
  return {
    filePath,
    mimeType: EXT_TO_MIME[ext] || 'application/octet-stream'
  };
}

export function getMediaStorageStats(): { fileCount: number; totalBytes: number; dir: string } {
  try {
    if (!fs.existsSync(MEDIA_DIR)) return { fileCount: 0, totalBytes: 0, dir: MEDIA_DIR };
    const files = fs.readdirSync(MEDIA_DIR);
    let totalBytes = 0;
    for (const f of files) {
      try {
        totalBytes += fs.statSync(path.join(MEDIA_DIR, f)).size;
      } catch {}
    }
    return { fileCount: files.length, totalBytes, dir: MEDIA_DIR };
  } catch {
    return { fileCount: 0, totalBytes: 0, dir: MEDIA_DIR };
  }
}
