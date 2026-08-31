import serverless from 'serverless-http';
import app from '../../server/api-entry';

export const handler = serverless(app);
