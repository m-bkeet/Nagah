import { Trainee, Trainer, Course, Group, Branch } from '../types';
import { request } from './api';

export type Unsubscribe = () => void;

export const cloudDb = {
  // --- Trainees / Students ---
  async syncTrainee(trainee: Trainee): Promise<void> {
    try {
      if (!trainee.id) return;
      await request('/trainees', {
        method: 'POST',
        body: JSON.stringify(trainee)
      });
    } catch (err) {
      console.warn('[CloudDb] syncTrainee error:', err);
    }
  },

  async deleteTrainee(traineeId: string): Promise<void> {
    try {
      if (!traineeId) return;
      await request(`/trainees/${traineeId}`, { method: 'DELETE' });
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
    let active = true;
    const fetchInterval = setInterval(async () => {
      if (!active) return;
      try {
        const list = await request<Trainee[]>('/trainees');
        if (active && Array.isArray(list)) callback(list);
      } catch {}
    }, 15000);
    return () => {
      active = false;
      clearInterval(fetchInterval);
    };
  },

  // --- Trainers ---
  async syncTrainer(trainer: Trainer): Promise<void> {
    try {
      if (!trainer.id) return;
      await request('/trainers', {
        method: 'POST',
        body: JSON.stringify(trainer)
      });
    } catch (err) {
      console.warn('[CloudDb] syncTrainer error:', err);
    }
  },

  async getAllTrainers(): Promise<Trainer[]> {
    try {
      return await request<Trainer[]>('/trainers');
    } catch (err) {
      console.warn('[CloudDb] getAllTrainers error:', err);
      return [];
    }
  },

  // --- Courses & Groups & Branches ---
  async syncCourse(course: Course): Promise<void> {
    try {
      if (!course.id) return;
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
      await request(`/courses/${courseId}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('[CloudDb] deleteCourse error:', err);
    }
  },

  async getAllCourses(): Promise<Course[]> {
    try {
      return await request<Course[]>('/courses');
    } catch (err) {
      console.warn('[CloudDb] getAllCourses error:', err);
      return [];
    }
  },

  async syncGroup(group: Group): Promise<void> {
    try {
      if (!group.id) return;
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
      await request(`/groups/${groupId}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('[CloudDb] deleteGroup error:', err);
    }
  },

  async getAllGroups(): Promise<Group[]> {
    try {
      return await request<Group[]>('/groups');
    } catch (err) {
      console.warn('[CloudDb] getAllGroups error:', err);
      return [];
    }
  },

  async syncBranch(branch: Branch): Promise<void> {
    try {
      if (!branch.id) return;
      await request('/branches', {
        method: 'POST',
        body: JSON.stringify(branch)
      });
    } catch (err) {
      console.warn('[CloudDb] syncBranch error:', err);
    }
  },

  async getAllBranches(): Promise<Branch[]> {
    try {
      return await request<Branch[]>('/branches');
    } catch (err) {
      console.warn('[CloudDb] getAllBranches error:', err);
      return [];
    }
  },

  async syncFullCenterToCloud(data: {
    trainees?: Trainee[];
    trainers?: Trainer[];
    courses?: Course[];
    groups?: Group[];
    branches?: Branch[];
  }): Promise<{ success: boolean; syncedCount: number }> {
    return { success: true, syncedCount: 0 };
  },

  listenToCollection<T>(collectionName: string, callback: (items: T[]) => void): Unsubscribe {
    let active = true;
    const fetchInterval = setInterval(async () => {
      if (!active) return;
      try {
        const list = await request<T[]>(`/${collectionName}`);
        if (active && Array.isArray(list)) callback(list);
      } catch {}
    }, 15000);
    return () => {
      active = false;
      clearInterval(fetchInterval);
    };
  },

  async syncStudentMessage(message: any): Promise<void> {},
  async syncHomeworkSubmission(submission: any): Promise<void> {}
};
