import { Router } from 'express';
import { apiRouter } from './routes';

export const versionRouter = Router();

versionRouter.use((req, res, next) => {
  console.log('>>> [versionRouter DEBUG] url:', req.url, 'originalUrl:', req.originalUrl, 'path:', req.path);
  next();
});

// v2 health & root v2 info endpoint
versionRouter.get(['/v2', '/v2/', '/v2/health', '/v2/health/'], (req, res) => {
  res.json({
    status: 'ok',
    version: 'v2',
    description: 'Nagah Management System v2 API - Mobile & AI Assistant Ready',
    timestamp: new Date().toISOString()
  });
});

versionRouter.all('/v2/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'API v2 endpoint under development or not found.'
  });
});

// v1 Router with robust prefix stripping
versionRouter.use(['/v1', '/v1/'], (req, res, next) => {
  req.url = req.url.replace(/^\/v1\/?/, '') || '/';
  return apiRouter(req, res, next);
});

// Default unversioned fallback
versionRouter.use('/', apiRouter);
