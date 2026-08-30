import { Trainee, Branch, Course, Group, Trainer, CenterSettings } from '../types';
import { request } from './api';

export class CloudSyncService {
  private static instance: CloudSyncService;

  public static getInstance(): CloudSyncService {
    if (!CloudSyncService.instance) {
      CloudSyncService.instance = new CloudSyncService();
    }
    return CloudSyncService.instance;
  }

  async syncTraineeToCloud(trainee: Trainee): Promise<void> {
    try {
      if (!trainee?.id) return;
      await request('/trainees', {
        method: 'POST',
        body: JSON.stringify(trainee)
      });
    } catch (error) {
      console.warn('[CloudSync] Trainee sync error:', error);
    }
  }

  async deleteTraineeFromCloud(traineeId: string): Promise<void> {
    try {
      if (!traineeId) return;
      await request(`/trainees/${traineeId}`, { method: 'DELETE' });
    } catch (error) {
      console.warn('[CloudSync] Failed to delete trainee:', error);
    }
  }

  async getTraineesFromCloud(): Promise<Trainee[]> {
    try {
      return await request<Trainee[]>('/trainees');
    } catch (error) {
      console.warn('[CloudSync] Failed to fetch trainees:', error);
      return [];
    }
  }

  subscribeToTrainees(callback: (trainees: Trainee[]) => void): () => void {
    let active = true;
    const interval = setInterval(async () => {
      if (!active) return;
      try {
        const list = await request<Trainee[]>('/trainees');
        if (active && Array.isArray(list)) callback(list);
      } catch {}
    }, 15000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }

  async syncBranchToCloud(branch: Branch): Promise<void> {
    try {
      if (!branch?.id) return;
      await request('/branches', {
        method: 'POST',
        body: JSON.stringify(branch)
      });
    } catch (e) {
      console.warn('[CloudSync] Failed to sync branch:', e);
    }
  }

  async syncGroupToCloud(group: Group): Promise<void> {
    try {
      if (!group?.id) return;
      await request('/groups', {
        method: 'POST',
        body: JSON.stringify(group)
      });
    } catch (e) {
      console.warn('[CloudSync] Failed to sync group:', e);
    }
  }

  async syncCourseToCloud(course: Course): Promise<void> {
    try {
      if (!course?.id) return;
      await request('/courses', {
        method: 'POST',
        body: JSON.stringify(course)
      });
    } catch (e) {
      console.warn('[CloudSync] Failed to sync course:', e);
    }
  }

  async syncSettingsToCloud(settings: CenterSettings): Promise<void> {
    try {
      await request('/settings', {
        method: 'POST',
        body: JSON.stringify(settings)
      });
    } catch (e) {
      console.warn('[CloudSync] Failed to sync settings:', e);
    }
  }

  async seedInitialDataToCloud(data: any): Promise<void> {}
}

export const cloudSync = CloudSyncService.getInstance();
