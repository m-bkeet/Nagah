import { Trainee, Trainer, Course, Group, Branch } from '../types';
import { request } from './api';
import { quotaOptimizer } from './firestoreQuotaOptimizer';

export type Unsubscribe = () => void;

export const cloudDb = {
  // --- Trainees / Students ---
  async syncTrainee(trainee: Trainee): Promise<void> {
    try {
      if (!trainee.id) return;
      // Debounce and sync trainee efficiently
      quotaOptimizer.debouncedUpdateDoc('trainees', trainee.id, trainee);
      await request('/trainees', {
        method: 'POST',
        body: JSON.stringify(trainee)
      });
      // Update aggregated stats counter (+1 if new)
      quotaOptimizer.updateAggregatedStat('totalTrainees', 1);
    } catch (err) {
      console.warn('[CloudDb] syncTrainee error:', err);
    }
  },

  async deleteTrainee(traineeId: string): Promise<void> {
    try {
      if (!traineeId) return;
      await request(`/trainees/${traineeId}`, { method: 'DELETE' });
      quotaOptimizer.updateAggregatedStat('totalTrainees', -1);
    } catch (err) {
      console.warn('[CloudDb] deleteTrainee error:', err);
    }
  },

  async getAllTrainees(): Promise<Trainee[]> {
    try {
      return await request<Trainee[]>('/trainees');
    } catch (err) {
      console.warn('[CloudDb] getAllTrainees error:', err);
      return [];
    }
  },

  listenToTrainees(callback: (trainees: Trainee[]) => void): Unsubscribe {
    // Smart quota controlled listener
    return quotaOptimizer.listenWithQuotaControl<Trainee>('trainees', (list) => {
      if (Array.isArray(list)) callback(list);
    }, 50);
  },

  // --- Trainers ---
  async syncTrainer(trainer: Trainer): Promise<void> {
    try {
      if (!trainer.id) return;
      quotaOptimizer.debouncedUpdateDoc('trainers', trainer.id, trainer);
      await request('/trainers', {
        method: 'POST',
        body: JSON.stringify(trainer)
      });
    } catch (err) {
      console.warn('[CloudDb] syncTrainer error:', err);
    }
  },

  async getAllTrainers(): Promise<Trainer[]> {
    return quotaOptimizer.getStaticReferenceData<Trainer>('trainers_list', async () => {
      try {
        return await request<Trainer[]>('/trainers');
      } catch (err) {
        console.warn('[CloudDb] getAllTrainers error:', err);
        return [];
      }
    });
  },

  // --- Courses & Groups & Branches ---
  async syncCourse(course: Course): Promise<void> {
    try {
      if (!course.id) return;
      quotaOptimizer.invalidateCache('courses_list');
      await request('/courses', {
        method: 'POST',
        body: JSON.stringify(course)
      });
    } catch (err) {
      console.warn('[CloudDb] syncCourse error:', err);
    }
  },

  async deleteCourse(courseId: string): Promise<void> {
    try {
      if (!courseId) return;
      quotaOptimizer.invalidateCache('courses_list');
      await request(`/courses/${courseId}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('[CloudDb] deleteCourse error:', err);
    }
  },

  async getAllCourses(): Promise<Course[]> {
    return quotaOptimizer.getStaticReferenceData<Course>('courses_list', async () => {
      try {
        return await request<Course[]>('/courses');
      } catch (err) {
        console.warn('[CloudDb] getAllCourses error:', err);
        return [];
      }
    });
  },

  async syncGroup(group: Group): Promise<void> {
    try {
      if (!group.id) return;
      quotaOptimizer.invalidateCache('groups_list');
      await request('/groups', {
        method: 'POST',
        body: JSON.stringify(group)
      });
    } catch (err) {
      console.warn('[CloudDb] syncGroup error:', err);
    }
  },

  async deleteGroup(groupId: string): Promise<void> {
    try {
      if (!groupId) return;
      quotaOptimizer.invalidateCache('groups_list');
      await request(`/groups/${groupId}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('[CloudDb] deleteGroup error:', err);
    }
  },

  async getAllGroups(): Promise<Group[]> {
    return quotaOptimizer.getStaticReferenceData<Group>('groups_list', async () => {
      try {
        return await request<Group[]>('/groups');
      } catch (err) {
        console.warn('[CloudDb] getAllGroups error:', err);
        return [];
      }
    });
  },

  async syncBranch(branch: Branch): Promise<void> {
    try {
      if (!branch.id) return;
      quotaOptimizer.invalidateCache('branches_list');
      await request('/branches', {
        method: 'POST',
        body: JSON.stringify(branch)
      });
    } catch (err) {
      console.warn('[CloudDb] syncBranch error:', err);
    }
  },

  async getAllBranches(): Promise<Branch[]> {
    return quotaOptimizer.getStaticReferenceData<Branch>('branches_list', async () => {
      try {
        return await request<Branch[]>('/branches');
      } catch (err) {
        console.warn('[CloudDb] getAllBranches error:', err);
        return [];
      }
    });
  },

  async syncFullCenterToCloud(data: {
    trainees?: Trainee[];
    trainers?: Trainer[];
    courses?: Course[];
    groups?: Group[];
    branches?: Branch[];
  }): Promise<{ success: boolean; syncedCount: number }> {
    // Perform batched sync for all collections
    const ops: any[] = [];
    if (data.trainees) {
      data.trainees.forEach(t => ops.push({ type: 'set', collectionName: 'trainees', docId: t.id, data: t }));
    }
    if (data.courses) {
      data.courses.forEach(c => ops.push({ type: 'set', collectionName: 'courses', docId: c.id, data: c }));
    }
    if (data.groups) {
      data.groups.forEach(g => ops.push({ type: 'set', collectionName: 'groups', docId: g.id, data: g }));
    }
    if (data.branches) {
      data.branches.forEach(b => ops.push({ type: 'set', collectionName: 'branches', docId: b.id, data: b }));
    }

    const res = await quotaOptimizer.executeBatchOperations(ops);
    return { success: res.success, syncedCount: res.count };
  },

  listenToCollection<T>(collectionName: string, callback: (items: T[]) => void): Unsubscribe {
    return quotaOptimizer.listenWithQuotaControl<T>(collectionName, callback, 30);
  },

  async syncStudentMessage(message: any): Promise<void> {},
  async syncHomeworkSubmission(submission: any): Promise<void> {}
};
