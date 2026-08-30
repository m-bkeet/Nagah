import { db, DatabaseSchema } from './db';
import path from 'path';

export interface SecureDbConnectionConfig {
  env: string;
  dbPath: string;
  isStaging: boolean;
}

class SecureDbConnector {
  private config: SecureDbConnectionConfig;

  constructor() {
    const env = process.env.NODE_ENV || 'development';
    const isStaging = env === 'development' || env === 'staging';
    const dbPath = process.env.STAGING_DB_PATH || process.env.PRODUCTION_DB_PATH || path.join(process.cwd(), 'data', 'database.json');

    this.config = {
      env,
      dbPath,
      isStaging
    };

    console.log(`[SecureDbConnector] Initialized in [${this.config.env.toUpperCase()}] mode. Using database path: ${this.config.dbPath}`);
  }

  public getConfig(): SecureDbConnectionConfig {
    return this.config;
  }

  public verifyIntegrity(): boolean {
    try {
      const data = db.getData();
      if (!data || typeof data !== 'object') {
        console.error('[SecureDbConnector] Integrity check failed: Invalid data structure');
        return false;
      }
      console.log(`[SecureDbConnector] Integrity verified successfully. Trainees count: ${data.trainees?.length || 0}`);
      return true;
    } catch (err: any) {
      console.error('[SecureDbConnector] Integrity check error:', err.message);
      return false;
    }
  }

  public getDatabaseManager() {
    return db;
  }
}

export const secureDb = new SecureDbConnector();
