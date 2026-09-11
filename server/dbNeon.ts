import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

// Configure Neon to use WebSockets in Node.js environments if needed
neonConfig.webSocketConstructor = ws;

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_KDx6y4vLjRIE@ep-tiny-feather-b1gwujlu-pooler.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

export const neonPool = new Pool({ connectionString: DATABASE_URL });

export async function queryNeon(text: string, params?: any[]) {
  const client = await neonPool.connect();
  try {
    const res = await client.query(text, params);
    return res;
  } finally {
    client.release();
  }
}

// Test connection helper
export async function testNeonConnection(): Promise<boolean> {
  try {
    const res = await queryNeon('SELECT NOW()');
    console.log('[Neon DB] Connected successfully at:', res.rows[0]);
    return true;
  } catch (e: any) {
    console.error('[Neon DB] Connection error:', e.message);
    return false;
  }
}
