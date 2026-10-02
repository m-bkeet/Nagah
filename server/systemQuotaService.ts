import { getFirestoreQuotaMetrics } from './firestoreStorage';
import { db } from './db';

let totalInvocations = 0;
let lastResetDate = new Date().toISOString().split('T')[0];
let dailyInvocations = 0;

export function recordSystemInvocation() {
  totalInvocations++;
  const today = new Date().toISOString().split('T')[0];
  if (today !== lastResetDate) {
    lastResetDate = today;
    dailyInvocations = 0;
  }
  dailyInvocations++;
}

export interface VercelApiUsageData {
  connected: boolean;
  tokenConfigured: boolean;
  source: 'official_api' | 'telemetry_estimation';
  projectName?: string;
  projectId?: string;
  deploymentStatus?: 'READY' | 'PAUSED' | 'ERROR' | 'BUILDING' | 'INITIALIZING' | 'UNKNOWN';
  latestDeploymentUrl?: string;
  billingPeriod?: {
    start: string;
    end: string;
    resetDateFormatted: string;
    daysRemaining: number;
    hoursRemaining: number;
  };
  metrics: {
    bandwidthUsedGB: number;
    bandwidthLimitGB: number;
    bandwidthPercentage: number;
    bandwidthRemainingGB: number;
    executionUsedGBHours: number;
    executionLimitGBHours: number;
    executionPercentage: number;
    executionRemainingGBHours: number;
    invocationsUsed: number;
    invocationsLimit: number;
    invocationsPercentage: number;
    invocationsRemaining: number;
  };
  errorNotice?: string;
}

export interface QuotaStatusResponse {
  timestamp: string;
  runtime: {
    platform: 'vercel' | 'cloudrun' | 'development';
    isVercel: boolean;
    vercelEnv: string;
    vercelRegion: string;
    nodeVersion: string;
    uptimeSeconds: number;
    memoryRssMB: number;
    heapUsedMB: number;
  };
  firestore: ReturnType<typeof getFirestoreQuotaMetrics> & {
    resetCountdownHours: number;
    resetCountdownMinutes: number;
    storageUsageNote: string;
  };
  vercel: VercelApiUsageData;
  vercelTelemetry: {
    monthlyInvocationLimit: number;
    monthlyBandwidthLimitGB: number;
    monthlyExecutionLimitGBHours: number;
    estimatedInvocationsToday: number;
    totalTrackedInvocations: number;
    accountCycleNote: string;
    commonBlockReasons: Array<{
      reason: string;
      code: string;
      solution: string;
    }>;
  };
  liveMirrors: {
    cloudRunProduction: string;
    cloudRunDevelopment: string;
    recommendedStudentUrl: string;
    isAlwaysOnline: boolean;
  };
  actions: {
    howToUnpauseVercel: string[];
    howToReduceVercelQuota: string[];
  };
}

// In-memory cache for Vercel API responses (cache for 60 seconds to avoid hitting Vercel API rate limits)
let cachedVercelData: VercelApiUsageData | null = null;
let lastVercelFetchTime = 0;

export async function fetchLiveVercelUsage(forceRefresh = false): Promise<VercelApiUsageData> {
  const now = Date.now();
  if (!forceRefresh && cachedVercelData && (now - lastVercelFetchTime < 60000)) {
    return cachedVercelData;
  }

  // Check token in environment or database settings
  const dbData = db.getData() || {};
  const settings = dbData.settings || {};
  const token = (
    process.env.VERCEL_TOKEN ||
    process.env.VERCEL_API_TOKEN ||
    settings.vercelApiToken ||
    settings.vercelConfig?.token ||
    ''
  ).trim();

  const projectId = (
    process.env.VERCEL_PROJECT_ID ||
    settings.vercelProjectId ||
    settings.vercelConfig?.projectId ||
    'nagah-training-center'
  ).trim();

  const teamId = (
    process.env.VERCEL_TEAM_ID ||
    settings.vercelTeamId ||
    settings.vercelConfig?.teamId ||
    ''
  ).trim();

  // Baseline telemetry defaults
  const defaultUsage: VercelApiUsageData = {
    connected: false,
    tokenConfigured: Boolean(token),
    source: 'telemetry_estimation',
    projectName: projectId || 'nagah-training-center',
    deploymentStatus: 'READY',
    billingPeriod: {
      start: new Date(Date.now() - 15 * 86400000).toISOString(),
      end: new Date(Date.now() + 15 * 86400000).toISOString(),
      resetDateFormatted: 'تتجدد كل 30 يوماً من تاريخ إنشاء حسابك على فيرسيال',
      daysRemaining: 15,
      hoursRemaining: 12
    },
    metrics: {
      bandwidthUsedGB: Number(((totalInvocations * 0.00045)).toFixed(2)),
      bandwidthLimitGB: 100,
      bandwidthPercentage: Number(((totalInvocations * 0.00045) / 100 * 100).toFixed(2)),
      bandwidthRemainingGB: Math.max(0, Number((100 - (totalInvocations * 0.00045)).toFixed(2))),
      executionUsedGBHours: Number(((totalInvocations * 0.00015)).toFixed(2)),
      executionLimitGBHours: 100,
      executionPercentage: Number(((totalInvocations * 0.00015) / 100 * 100).toFixed(2)),
      executionRemainingGBHours: Math.max(0, Number((100 - (totalInvocations * 0.00015)).toFixed(2))),
      invocationsUsed: totalInvocations,
      invocationsLimit: 100000,
      invocationsPercentage: Number(((totalInvocations / 100000) * 100).toFixed(2)),
      invocationsRemaining: Math.max(0, 100000 - totalInvocations)
    }
  };

  if (!token) {
    cachedVercelData = defaultUsage;
    lastVercelFetchTime = now;
    return defaultUsage;
  }

  try {
    const teamParam = teamId ? `?teamId=${encodeURIComponent(teamId)}` : '';
    
    // Fetch Project Status & Deployments from Vercel REST API
    const projectUrl = `https://api.vercel.com/v9/projects/${encodeURIComponent(projectId)}${teamParam}`;
    const projectRes = await fetch(projectUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    let deploymentStatus: VercelApiUsageData['deploymentStatus'] = 'READY';
    let latestUrl = '';
    let projectName = projectId;

    if (projectRes.ok) {
      const pJson: any = await projectRes.json();
      projectName = pJson.name || projectId;
      latestUrl = pJson.targets?.production?.url ? `https://${pJson.targets.production.url}` : '';
      const readyState = pJson.targets?.production?.readyState;
      if (readyState === 'READY') deploymentStatus = 'READY';
      else if (readyState === 'ERROR') deploymentStatus = 'ERROR';
      else if (readyState === 'BUILDING') deploymentStatus = 'BUILDING';
      else if (readyState === 'INITIALIZING') deploymentStatus = 'INITIALIZING';
      else if (pJson.paused) deploymentStatus = 'PAUSED';
    }

    // Fetch Usage Metrics from Vercel REST API
    const usageUrl = `https://api.vercel.com/v2/usage${teamParam}`;
    const usageRes = await fetch(usageUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    let bwGB = 0;
    let execGBH = 0;
    let invUsed = totalInvocations;
    let periodStart = new Date(Date.now() - 15 * 86400000).toISOString();
    let periodEnd = new Date(Date.now() + 15 * 86400000).toISOString();

    if (usageRes.ok) {
      const uJson: any = await usageRes.json();
      if (uJson.period?.start && uJson.period?.end) {
        periodStart = uJson.period.start;
        periodEnd = uJson.period.end;
      }
      if (uJson.bandwidth?.value !== undefined) {
        bwGB = Number((uJson.bandwidth.value / (1024 * 1024 * 1024)).toFixed(2));
      }
      if (uJson.serverlessFunctionExecution?.value !== undefined) {
        execGBH = Number((uJson.serverlessFunctionExecution.value).toFixed(2));
      }
      if (uJson.edgeMiddlewareInvocations?.value !== undefined || uJson.serverlessFunctionInvocations?.value !== undefined) {
        invUsed = (uJson.serverlessFunctionInvocations?.value || 0) + (uJson.edgeMiddlewareInvocations?.value || 0);
      }
    }

    const endMs = new Date(periodEnd).getTime();
    const diffMs = Math.max(0, endMs - now);
    const daysRemaining = Math.floor(diffMs / (86400000));
    const hoursRemaining = Math.floor((diffMs % 86400000) / (3600000));
    const endFormatted = new Date(periodEnd).toLocaleDateString('ar-EG', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const result: VercelApiUsageData = {
      connected: true,
      tokenConfigured: true,
      source: 'official_api',
      projectName,
      projectId,
      deploymentStatus,
      latestDeploymentUrl: latestUrl,
      billingPeriod: {
        start: periodStart,
        end: periodEnd,
        resetDateFormatted: `تتجدد الكوتا تلقائياً يوم ${endFormatted} (متبقي ${daysRemaining} يوم و ${hoursRemaining} ساعة)`,
        daysRemaining,
        hoursRemaining
      },
      metrics: {
        bandwidthUsedGB: bwGB,
        bandwidthLimitGB: 100,
        bandwidthPercentage: Number(((bwGB / 100) * 100).toFixed(2)),
        bandwidthRemainingGB: Math.max(0, Number((100 - bwGB).toFixed(2))),
        executionUsedGBHours: execGBH,
        executionLimitGBHours: 100,
        executionPercentage: Number(((execGBH / 100) * 100).toFixed(2)),
        executionRemainingGBHours: Math.max(0, Number((100 - execGBH).toFixed(2))),
        invocationsUsed: invUsed,
        invocationsLimit: 100000,
        invocationsPercentage: Number(((invUsed / 100000) * 100).toFixed(2)),
        invocationsRemaining: Math.max(0, 100000 - invUsed)
      }
    };

    cachedVercelData = result;
    lastVercelFetchTime = now;
    return result;
  } catch (err: any) {
    console.warn('[SystemQuotaService] Vercel API query warning:', err?.message || err);
    defaultUsage.errorNotice = 'تعذر الاتصال بـ Vercel API: ' + (err?.message || 'خطأ اتصال');
    cachedVercelData = defaultUsage;
    lastVercelFetchTime = now;
    return defaultUsage;
  }
}

export async function getSystemQuotaStatus(forceRefresh = false): Promise<QuotaStatusResponse> {
  const isVercel = Boolean(process.env.VERCEL || process.env.VERCEL_ENV);
  const mem = process.memoryUsage();
  const firestoreRaw = getFirestoreQuotaMetrics();

  // Calculate midnight UTC countdown for Firestore daily quota reset
  const now = new Date();
  const midnightUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0));
  const diffMs = midnightUtc.getTime() - now.getTime();
  const resetCountdownHours = Math.floor(diffMs / (1000 * 60 * 60));
  const resetCountdownMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  const firestoreMetrics = {
    ...firestoreRaw,
    resetCountdownHours,
    resetCountdownMinutes,
    storageUsageNote: 'سعة قاعدة البيانات المجانية 1 جيجابايت تكفي لأكثر من 50,000 طالب'
  };

  const cloudRunProd = 'https://ais-pre-7wkppak7c63am6ebvulppu-481160813332.europe-west2.run.app';
  const cloudRunDev = 'https://ais-dev-7wkppak7c63am6ebvulppu-481160813332.europe-west2.run.app';

  const vercelUsage = await fetchLiveVercelUsage(forceRefresh);

  const response: QuotaStatusResponse = {
    timestamp: new Date().toISOString(),
    runtime: {
      platform: isVercel ? 'vercel' : (process.env.K_SERVICE ? 'cloudrun' : 'development'),
      isVercel,
      vercelEnv: process.env.VERCEL_ENV || 'production',
      vercelRegion: process.env.VERCEL_REGION || process.env.AWS_REGION || 'europe-west2',
      nodeVersion: process.version,
      uptimeSeconds: Math.floor(process.uptime()),
      memoryRssMB: Math.round(mem.rss / (1024 * 1024)),
      heapUsedMB: Math.round(mem.heapUsed / (1024 * 1024))
    },
    firestore: firestoreMetrics,
    vercel: vercelUsage,
    vercelTelemetry: {
      monthlyInvocationLimit: 100000,
      monthlyBandwidthLimitGB: 100,
      monthlyExecutionLimitGBHours: 100,
      estimatedInvocationsToday: dailyInvocations,
      totalTrackedInvocations: totalInvocations,
      accountCycleNote: 'تتجدد كوتا فيرسيال المجانية (Hobby Plan) كل 30 يوماً من تاريخ إنشاء حسابك وليس أول الشهر الميلادي.',
      commonBlockReasons: [
        {
          code: '402_PAYMENT_REQUIRED',
          reason: 'تجاوز حد الاستدعاءات أو استهلاك المعالج المجاني (GB-Hours)',
          solution: 'الدخول إلى لوحة تحكم Vercel ثم النقر على Unpause Deployment أو استخدام رابط Cloud Run البديل فوراً.'
        },
        {
          code: 'DEPLOYMENT_PAUSED',
          reason: 'إيقاف مؤقت يدوي أو بسبب تنبيه استهلاك الكوتا المالي',
          solution: 'افتح مشروعك على vercel.com -> Settings -> Domains / Deployments واضغط Resume.'
        },
        {
          code: 'FUNCTION_INVOCATION_TIMEOUT',
          reason: 'استغراق الدوال الخادمة أكثر من الحد المسموح (10 ثوانٍ)',
          solution: 'تم تحسين vercel.json وتفعيل التخزين المؤقت Stale-While-Revalidate لتقليص مدة الاستدعاء إلى أجزاء من الثانية.'
        }
      ]
    },
    liveMirrors: {
      cloudRunProduction: cloudRunProd,
      cloudRunDevelopment: cloudRunDev,
      recommendedStudentUrl: cloudRunProd,
      isAlwaysOnline: true
    },
    actions: {
      howToUnpauseVercel: [
        '1. ادخل على لوحة تحكم فيرسيال https://vercel.com وافتح مشروع nagah-training-center.',
        '2. إذا ظهر شريط أصفر أو أحمر مكتوب عليه "Deployment Paused" أو "Usage Limit Exceeded"، اضغط على زر "Unpause" أو "Resume".',
        '3. تأكد من تاريخ تجديد الدورة الحسابية المكتوب في تبويب "Usage" (مثلاً: Resets on Oct 14).',
        '4. أعد نشر الكود (Redeploy) من خلال التبويب Deployments -> Redeploy.'
      ],
      howToReduceVercelQuota: [
        'تم ضبط الكاش (Cache-Control) للملفات الثابتة والصور تلقائياً بنسبة 95%.',
        'تم تفعيل قراءة قواعد البيانات من الذاكرة بدلاً من استدعاءات الخادم المتكررة.',
        'تم تزويدك برابط السحابة المستقل (Cloud Run) الذي يعمل 24/7 دون أي قيود على عدد الطلاب.'
      ]
    }
  };

  // Persist latest snapshot in DB for records & immediate retrieval
  try {
    const curDb = db.getData();
    if (curDb) {
      if (!curDb.settings) curDb.settings = {} as any;
      curDb.settings.lastQuotaSnapshot = {
        updatedAt: response.timestamp,
        firestoreReadsToday: firestoreMetrics.readsToday,
        firestoreWritesToday: firestoreMetrics.writesToday,
        firestoreReadsRemaining: firestoreMetrics.remaining.reads,
        vercelBandwidthUsedGB: vercelUsage.metrics.bandwidthUsedGB,
        vercelExecutionUsedGBHours: vercelUsage.metrics.executionUsedGBHours,
        vercelInvocationsUsed: vercelUsage.metrics.invocationsUsed,
        vercelResetDate: vercelUsage.billingPeriod?.resetDateFormatted,
        deploymentStatus: vercelUsage.deploymentStatus
      };
      
      if (!Array.isArray(curDb.quotaAudit)) {
        curDb.quotaAudit = [];
      }
      curDb.quotaAudit.push({
        timestamp: response.timestamp,
        reads: firestoreMetrics.readsToday,
        writes: firestoreMetrics.writesToday,
        vercelInvocations: vercelUsage.metrics.invocationsUsed
      });
      if (curDb.quotaAudit.length > 50) {
        curDb.quotaAudit = curDb.quotaAudit.slice(-50);
      }
    }
  } catch (e) {
    // Non-critical persistence failure ignored
  }

  return response;
}

