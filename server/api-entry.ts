import express from "express";
import cors from "cors";
import { versionRouter } from './versionRouter';
import { secureDb } from './secureDbConnection';
import { migrationManager } from './migrationManager';
import { db } from './db';

const app = express();

// Global trailing slash removal middleware
app.use((req, res, next) => {
  if (req.url && req.url.length > 1) {
    const qIndex = req.url.indexOf('?');
    if (qIndex !== -1) {
      const pathPart = req.url.substring(0, qIndex);
      const queryPart = req.url.substring(qIndex);
      if (pathPart.endsWith('/') && pathPart.length > 1) {
        req.url = pathPart.replace(/\/+$/, '') + queryPart;
      }
    } else {
      if (req.url.endsWith('/') && req.url.length > 1) {
        req.url = req.url.replace(/\/+$/, '');
      }
    }
  }
  next();
});

// Verify secure database connection & integrity on startup (guarded for serverless)
const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.VERCEL_ENV);
if (!isServerless) {
  try {
    secureDb.verifyIntegrity();
    migrationManager.runInitialMigrations();
  } catch (e: any) {
    console.warn('[Serverless Startup Notice]', e?.message || e);
  }
}

// Health check endpoints
app.get(['/health', '/api/health'], async (req, res) => {
  let hasBundledData = false;
  let hasTmpData = false;
  let tmpDataSize = 0;
  let bundledDataSize = 0;
  let memDataKeys: string[] = [];
  
  try {
    const fs = await import('fs');
    const path = await import('path');
    const bPath = path.join(process.cwd(), 'data', 'database.json');
    const tPath = path.join(await import('os').then(os=>os.tmpdir()), 'nagah_data', 'database.json');
    if (fs.existsSync(bPath)) { hasBundledData = true; bundledDataSize = fs.statSync(bPath).size; }
    if (fs.existsSync(tPath)) { hasTmpData = true; tmpDataSize = fs.statSync(tPath).size; }
    
    const { db } = await import('./db.js');
    if (db) {
      memDataKeys = Object.keys(db.getData() || {});
    }
  } catch (e) {
    // ignore
  }

  res.json({
    status: 'ok',
    service: 'Nagah Management System',
    environment: process.env.NODE_ENV || 'production',
    serverless: isServerless,
    database: 'active',
    cwd: process.cwd(),
    hasBundledData,
    bundledDataSize,
    hasTmpData,
    tmpDataSize,
    memDataKeys,
    timestamp: new Date().toISOString()
  });
});

// Dedicated Quota & Cloud Health Endpoints for Vercel
app.get(['/system/quota-status', '/api/system/quota-status'], async (req, res) => {
  try {
    const { getSystemQuotaStatus } = await import('./systemQuotaService.js');
    const forceRefresh = req.query.forceRefresh === 'true' || req.query.fresh === 'true';
    const status = await getSystemQuotaStatus(forceRefresh);
    res.json(status);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve quota status: ' + err.message });
  }
});

app.post(['/system/quota-refresh', '/api/system/quota-refresh'], async (req, res) => {
  try {
    const { getSystemQuotaStatus } = await import('./systemQuotaService.js');
    const status = await getSystemQuotaStatus(true);
    res.json({ success: true, status });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post(['/system/quota-config', '/api/system/quota-config'], async (req, res) => {
  try {
    const { getSystemQuotaStatus } = await import('./systemQuotaService.js');
    const { db } = await import('./db.js');
    const { token, projectId, teamId } = req.body || {};
    const curDb = db.getData();
    if (!curDb.settings) curDb.settings = {} as any;
    
    curDb.settings.vercelApiToken = (token || '').trim();
    if (projectId) curDb.settings.vercelProjectId = (projectId || '').trim();
    if (teamId !== undefined) curDb.settings.vercelTeamId = (teamId || '').trim();
    
    const updatedStatus = await getSystemQuotaStatus(true);
    res.json({
      success: true,
      message: updatedStatus.vercel.connected 
        ? 'تم ربط حساب Vercel بنجاح وقراءة الاستهلاك اللحظي!' 
        : 'تم حفظ الإعدادات بنجاح.',
      vercel: updatedStatus.vercel,
      status: updatedStatus
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'تعذر حفظ إعدادات Vercel: ' + err.message });
  }
});

// Add CORS to allow external forms/apps to hit the public APIs
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-role', 'x-user-id', 'x-branch-id', 'x-trainer-id', 'x-trainee-id', '*']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.text({ limit: '50mb', type: ['application/json', 'text/plain', '*/*'] }));

app.use((req: any, res: any, next: any) => {
  if (req.method === 'POST' || req.method === 'PUT') {
    if (typeof req.body === 'string' && req.body.trim().startsWith('{')) {
      try {
        req.body = JSON.parse(req.body);
      } catch (e) {
        // Leave as string or let route handle it
      }
    }
  }
  next();
});

app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Quota Protection: Short re-validation cache for GET endpoints to prevent redundant requests
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.url.includes('/export') && !req.url.includes('/backup')) {
    res.setHeader('Cache-Control', 'public, max-age=15, stale-while-revalidate=30');
  }
  next();
});

// Ensure database state is hydrated from cloud Firestore on request (cached in-memory to prevent quota exhaustion)
let hasHydratedOnce = false;
let lastHydrationTime = 0;
app.use(async (req, res, next) => {
  try {
    const isFresh = req.query?.fresh === 'true' || req.headers?.['x-fresh'] === 'true';
    const now = Date.now();
    // Only hydrate on cold start once, on explicit fresh request, or after 5 minutes of cache
    if (!hasHydratedOnce || isFresh || (now - lastHydrationTime > 300000)) {
      await db.ensureHydrated(isFresh);
      hasHydratedOnce = true;
      lastHydrationTime = now;
    }
  } catch (e) {
    console.warn('[Hydration Middleware Notice]', e);
  }
  next();
});

app.use('/api', versionRouter);
app.use('/', versionRouter);

// Global Express error handler for serverless resilience
app.use((err: any, req: any, res: any, next: any) => {
  console.error('[EXPRESS ERROR HANDLER]', err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(500).json({
    success: false,
    error: err?.message || 'Internal Server Error'
  });
});

export default app;

