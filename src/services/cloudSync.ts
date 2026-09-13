import { Trainee, Branch, Course, Group, Trainer, CenterSettings } from '../types';
import { request } from './api';
import { quotaOptimizer } from './firestoreQuotaOptimizer';

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
      quotaOptimizer.debouncedUpdateDoc('trainees', trainee.id, trainee);
      await request('/trainees', {
        method: 'POST',
        body: JSON.stringify(trainee)
      });
      quotaOptimizer.updateAggregatedStat('totalTrainees', 1);
    } catch (error) {
      console.warn('[CloudSync] Trainee sync error:', error);
    }
  }

  async deleteTraineeFromCloud(traineeId: string): Promise<void> {
    try {
      if (!traineeId) return;
      await request(`/trainees/${traineeId}`, { method: 'DELETE' });
      quotaOptimizer.updateAggregatedStat('totalTrainees', -1);
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
    return quotaOptimizer.listenWithQuotaControl<Trainee>('trainees', (list) => {
      if (Array.isArray(list)) callback(list);
    }, 50);
  }

  async syncBranchToCloud(branch: Branch): Promise<void> {
    try {
      if (!branch?.id) return;
      quotaOptimizer.invalidateCache('branches_list');
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
      quotaOptimizer.invalidateCache('groups_list');
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
      quotaOptimizer.invalidateCache('courses_list');
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
      quotaOptimizer.debouncedUpdateDoc('settings', 'center_settings', settings);
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
