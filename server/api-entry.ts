import express from "express";
import cors from "cors";
import { versionRouter } from './versionRouter';
import { secureDb } from './secureDbConnection';
import { migrationManager } from './migrationManager';

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
app.get(['/health', '/api/health'], (req, res) => {
  res.json({
    status: 'ok',
    service: 'Nagah Management System',
    environment: process.env.NODE_ENV || 'development',
    serverless: isServerless,
    timestamp: new Date().toISOString()
  });
});

// Add CORS to allow external forms/apps to hit the public APIs
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
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

