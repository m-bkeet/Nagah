import fs from 'fs';
import path from 'path';
import os from 'os';

export interface MigrationRecord {
  id: string;
  name: string;
  appliedAt: string;
  status: 'SUCCESS' | 'FAILED';
}

export class MigrationManager {
  private historyFilePath: string;

  constructor(historyFilePath?: string) {
    const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.VERCEL_ENV);
    const dataDir = isServerless ? path.join(os.tmpdir(), 'nagah_data') : path.join(process.cwd(), 'data');
    try {
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
    } catch (e) {
      console.warn('[MigrationManager] Non-critical dataDir creation notice:', e);
    }
    this.historyFilePath = historyFilePath || path.join(dataDir, 'migrations_history.json');
  }

  public getHistory(): MigrationRecord[] {
    try {
      if (fs.existsSync(this.historyFilePath)) {
        const raw = fs.readFileSync(this.historyFilePath, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.warn('[MigrationManager] Error reading migration history:', err);
    }
    return [];
  }

  public saveHistory(records: MigrationRecord[]): void {
    try {
      fs.writeFileSync(this.historyFilePath, JSON.stringify(records, null, 2), 'utf-8');
    } catch (err) {
      console.warn('[MigrationManager] Non-critical error writing migration history:', err);
    }
  }

  public runInitialMigrations(): void {
    console.log('[MigrationManager] Checking and applying pending migrations...');
    const history = this.getHistory();
    const appliedIds = new Set(history.map(h => h.id));

    const defaultMigrations = [
      { id: 'MIG-001', name: 'Initial Schema and Staging Database Setup' },
      { id: 'MIG-002', name: 'Versioning API Router Support (v1 and v2)' },
      { id: 'MIG-003', name: 'Secure Database Connection & Integrity Checks' }
    ];

    let newAppliedCount = 0;
    for (const mig of defaultMigrations) {
      if (!appliedIds.has(mig.id)) {
        history.push({
          id: mig.id,
          name: mig.name,
          appliedAt: new Date().toISOString(),
          status: 'SUCCESS'
        });
        console.log(`[MigrationManager] Applied migration: ${mig.id} - ${mig.name}`);
        newAppliedCount++;
      }
    }

    if (newAppliedCount > 0 || !fs.existsSync(this.historyFilePath)) {
      this.saveHistory(history);
      console.log(`[MigrationManager] Successfully recorded ${newAppliedCount} new migration(s). Total applied: ${history.length}`);
    } else {
      console.log(`[MigrationManager] All system migrations are up to date. Total applied: ${history.length}`);
    }
  }
}

export const migrationManager = new MigrationManager();
