import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { Request, Response, NextFunction } from 'express';
import { TraineeRepo } from './data/index.ts';

export interface AuthenticatedUser {
  id: string;
  username: string;
  role: 'super_admin' | 'admin' | 'branch_manager' | 'admin_staff' | 'accountant' | 'receptionist' | 'trainer' | 'student' | 'parent' | 'general_manager';
  branchId?: string;
  trainerId?: string;
  traineeId?: string;
  allowedTraineeIds?: string[];
  fullName?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

// Persistent HMAC session secret (survives restarts locally; uses env SESSION_SECRET in production)
function loadOrCreateSessionSecret(): string {
  if (process.env.SESSION_SECRET && process.env.SESSION_SECRET.length >= 24) {
    return process.env.SESSION_SECRET;
  }
  const secretCandidates = [
    path.join(process.cwd(), 'data', '.session_secret'),
    path.join(os.tmpdir(), 'nagah_session_secret')
  ];
  for (const p of secretCandidates) {
    try {
      if (fs.existsSync(p)) {
        const existing = fs.readFileSync(p, 'utf-8').trim();
        if (existing.length >= 32) return existing;
      }
    } catch {}
  }
  const generated = crypto.randomBytes(48).toString('hex');
  for (const p of secretCandidates) {
    try {
      const dir = path.dirname(p);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(p, generated, { mode: 0o600 });
      break;
    } catch {}
  }
  return generated;
}

const SESSION_SECRET = loadOrCreateSessionSecret();
const TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 14; // 14 days

function toBase64Url(str: string): string {
  return Buffer.from(str, 'utf8').toString('base64url');
}

function fromBase64Url(b64: string): string {
  return Buffer.from(b64, 'base64url').toString('utf8');
}

function normalizeRole(role: string | undefined): AuthenticatedUser['role'] {
  const r = String(role || '').toLowerCase().trim();
  if (r === 'super_admin' || r === 'admin' || r === 'general_manager') return 'super_admin';
  if (r === 'branch_manager') return 'branch_manager';
  if (r === 'admin_staff') return 'admin_staff';
  if (r === 'accountant') return 'accountant';
  if (r === 'receptionist') return 'receptionist';
  if (r === 'trainer') return 'trainer';
  if (r === 'student' || r === 'trainee') return 'student';
  if (r === 'parent') return 'parent';
  return 'student';
}

export function signSessionToken(user: {
  id: string;
  username?: string;
  role: string;
  branchId?: string;
  trainerId?: string;
  traineeId?: string;
  allowedTraineeIds?: string[];
  fullName?: string;
}): string {
  const now = Date.now();
  const payload = {
    id: String(user.id || ''),
    username: String(user.username || user.id || ''),
    role: normalizeRole(user.role),
    branchId: user.branchId || 'all',
    trainerId: user.trainerId || undefined,
    traineeId: user.traineeId || undefined,
    allowedTraineeIds: Array.isArray(user.allowedTraineeIds) ? user.allowedTraineeIds : undefined,
    fullName: user.fullName || 'مستخدم النظام',
    iat: now,
    exp: now + TOKEN_TTL_MS
  };
  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const sig = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(`nagah_v1.${encodedPayload}`)
    .digest('base64url');
  return `nagah_v1.${encodedPayload}.${sig}`;
}

export function verifySessionToken(token: string | undefined | null): AuthenticatedUser | null {
  if (!token || typeof token !== 'string') return null;
  const parts = token.trim().split('.');
  if (parts.length !== 3 || parts[0] !== 'nagah_v1') return null;

  const [, encodedPayload, providedSig] = parts;
  const expectedSig = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(`nagah_v1.${encodedPayload}`)
    .digest('base64url');

  try {
    const a = Buffer.from(providedSig);
    const b = Buffer.from(expectedSig);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      return null;
    }
    const parsed = JSON.parse(fromBase64Url(encodedPayload));
    if (!parsed || typeof parsed !== 'object') return null;
    if (typeof parsed.exp === 'number' && Date.now() > parsed.exp) {
      return null;
    }
    return {
      id: String(parsed.id || ''),
      username: String(parsed.username || parsed.id || ''),
      role: normalizeRole(parsed.role),
      branchId: parsed.branchId || 'all',
      trainerId: parsed.trainerId,
      traineeId: parsed.traineeId,
      allowedTraineeIds: Array.isArray(parsed.allowedTraineeIds) ? parsed.allowedTraineeIds : undefined,
      fullName: parsed.fullName || 'مستخدم النظام'
    };
  } catch {
    return null;
  }
}

/**
 * Cryptographic Auth Middleware:
 * - Verifies HMAC-SHA256 Bearer token.
 * - NEVER defaults unauthenticated requests to super_admin.
 * - NEVER trusts raw spoofable x-user-role headers.
 */
export function authMiddleware(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    const verified = verifySessionToken(token);
    if (verified) {
      req.user = verified;
    }
  }
  next();
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'يرجى تسجيل الدخول أولاً للوصول إلى هذه الخدمة (401 Unauthorized)'
    });
  }
  return next();
}

export function requireRole(allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: '401 Unauthorized: يرجى تسجيل الدخول أولاً'
      });
    }
    const normalizedAllowed = allowedRoles.map(r => r.toLowerCase());
    if (
      normalizedAllowed.includes('all') ||
      req.user.role === 'super_admin' ||
      normalizedAllowed.includes(req.user.role)
    ) {
      return next();
    }
    return res.status(403).json({
      success: false,
      error: '403 Forbidden: ليس لديك صلاحية للوصول إلى هذا المورد'
    });
  };
}

export const STAFF_ROLES = ['super_admin', 'admin', 'branch_manager', 'admin_staff', 'accountant', 'receptionist', 'trainer'];
export const ADMIN_FINANCE_ROLES = ['super_admin', 'admin', 'branch_manager', 'accountant'];

export function isStaffUser(req: AuthenticatedRequest): boolean {
  return Boolean(req.user && STAFF_ROLES.includes(req.user.role));
}

/**
 * Portal Ownership Guard (Prevents IDOR across Student / Parent / Trainer Portals):
 * - Allows authenticated staff roles (super_admin, admin, branch_manager, etc.).
 * - Allows portal users ONLY when their signed token matches the expected portal role
 *   AND owns the target traineeId/trainerId (when getTargetId returns a non-empty ID).
 */
export function requirePortalOrStaff(
  expectedRole: 'student' | 'parent' | 'trainer',
  getTargetId?: (req: Request) => string | undefined
) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        error: '401 Unauthorized: انتهت جلسة البوابة، يرجى تسجيل الدخول مجدداً'
      });
    }

    // Staff members have authorized access
    if (STAFF_ROLES.includes(user.role) && user.role !== 'trainer') {
      return next();
    }
    if (user.role === 'trainer' && expectedRole !== 'trainer') {
      return next();
    }

    if (user.role !== expectedRole) {
      return res.status(403).json({
        success: false,
        error: '403 Forbidden: ليس لديك صلاحية للوصول إلى هذا الحساب'
      });
    }

    const targetId = getTargetId ? String(getTargetId(req) || '').trim() : '';
    if (targetId) {
      if (expectedRole === 'student') {
        const owns =
          user.traineeId === targetId ||
          user.id === targetId ||
          user.username.toLowerCase() === targetId.toLowerCase() ||
          Boolean(user.allowedTraineeIds?.includes(targetId));
        if (!owns) {
          return res.status(403).json({
            success: false,
            error: '403 Forbidden: لا يمكنك تعديل أو عرض بيانات طالب آخر'
          });
        }
      } else if (expectedRole === 'parent') {
        const owns =
          user.traineeId === targetId ||
          Boolean(user.allowedTraineeIds?.includes(targetId));
        if (!owns) {
          return res.status(403).json({
            success: false,
            error: '403 Forbidden: هذا الطالب غير مرتبط بحساب ولي الأمر الحالي'
          });
        }
      } else if (expectedRole === 'trainer') {
        const owns =
          user.trainerId === targetId ||
          user.id === targetId ||
          user.username.toLowerCase() === targetId.toLowerCase();
        if (!owns) {
          return res.status(403).json({
            success: false,
            error: '403 Forbidden: لا يمكنك الوصول إلى بيانات مدرب آخر'
          });
        }
      }
    }

    return next();
  };
}

// Lightweight in-memory sliding window rate limiter for auth / passcode brute-force protection
export function createRateLimiter(maxRequests = 12, windowMs = 5 * 60 * 1000) {
  const buckets = new Map<string, { count: number; resetAt: number }>();

  return (req: Request, res: Response, next: NextFunction) => {
    const ip =
      String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
      req.socket?.remoteAddress ||
      'unknown';
    const key = `${req.path}:${ip}`;
    const now = Date.now();
    const existing = buckets.get(key);

    if (!existing || now > existing.resetAt) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      // Periodic cleanup to avoid unbounded memory growth
      if (buckets.size > 2000) {
        for (const [k, v] of buckets.entries()) {
          if (now > v.resetAt) buckets.delete(k);
        }
      }
      return next();
    }

    existing.count += 1;
    if (existing.count > maxRequests) {
      const retrySec = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
      res.setHeader('Retry-After', String(retrySec));
      return res.status(429).json({
        success: false,
        error: `تم تجاوز عدد المحاولات المسموح بها. يرجى الانتظار ${retrySec} ثانية والمحاولة مجدداً.`
      });
    }
    return next();
  };
}

export function sanitizeTraineeDTO(trainee: any, role: string) {
  if (!trainee) return null;
  const sanitized = { ...trainee };

  if (role === 'student' || role === 'parent' || role === 'trainer') {
    delete sanitized.nationalId;
    delete sanitized.parentNationalId;
    if (role === 'trainer') {
      delete sanitized.feeAmount;
      delete sanitized.discountAmount;
      delete sanitized.netAmount;
      delete sanitized.paidAmount;
      delete sanitized.remainingAmount;
      delete sanitized.creditBalance;
    }
  }
  return sanitized;
}

export async function runDataIntegrityAudit() {
  try {
    const trainees = await TraineeRepo.getAll();
    let testCount = 0;
    let reviewCount = 0;
    let financialDiscrepancies = 0;
    let validCount = 0;

    for (const t of trainees) {
      let needsReview = false;
      let isTest = false;
      let reviewReason = '';

      const nameStr = (t.fullName || '').toLowerCase();
      const codeStr = (t.code || t.studentCode || '').toLowerCase();
      if (
        nameStr.includes('test') ||
        nameStr.includes('تجريبي') ||
        nameStr.includes('demo') ||
        nameStr.includes('sample') ||
        nameStr.includes('vercel') ||
        codeStr.includes('test')
      ) {
        isTest = true;
        testCount++;
      }

      const fee = Number(t.feeAmount) || 0;
      const discount = Number(t.discountAmount) || 0;
      const net = Math.max(0, fee - discount);
      const paid = Number(t.paidAmount) || 0;
      let remaining = net - paid;
      let creditBalance = 0;

      if (paid > net) {
        creditBalance = paid - net;
        remaining = 0;
      }

      if (Math.abs((t.netAmount ?? net) - net) > 1 || Math.abs((t.remainingAmount ?? remaining) - remaining) > 1) {
        financialDiscrepancies++;
        needsReview = true;
        reviewReason += 'financial_discrepancy; ';
      }

      if (t.birthDate) {
        const birthYear = new Date(t.birthDate).getFullYear();
        const currentYear = new Date().getFullYear();
        const age = currentYear - birthYear;
        const gradeName = (t.grade || '').toLowerCase();
        if ((gradeName.includes('الرابع') && (age < 8 || age > 13)) || (gradeName.includes('الثانوي') && age < 13)) {
          needsReview = true;
          reviewReason += 'birth_date_age_grade_mismatch; ';
        }
      }

      if (needsReview) {
        reviewCount++;
      } else if (!isTest) {
        validCount++;
      }

      await TraineeRepo.update(t.id, {
        isTestRecord: isTest,
        creditBalance,
        dataValidationStatus: needsReview ? 'needs_review' : 'verified',
        reviewReason: reviewReason || undefined,
        netAmount: net,
        remainingAmount: remaining
      });
    }

    return {
      total: trainees.length,
      validCount,
      testCount,
      reviewCount,
      financialDiscrepancies
    };
  } catch (err) {
    console.error('[DataIntegrityAudit] Error:', err);
    return null;
  }
}
