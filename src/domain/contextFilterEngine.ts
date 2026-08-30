/**
 * NAGAH MS - Context Filter Engine (Smart Cascade Filtering)
 * Implements bidirectional, context-aware filtering across forms, cards, reports, scheduling, and transactions.
 */

import {
  INITIAL_BRANCHES,
  INITIAL_TRACKS,
  INITIAL_FIELDS,
  INITIAL_LEVELS,
  BranchRegistryItem,
  TrackRegistryItem,
  FieldRegistryItem,
  LevelRegistryItem
} from './registries';

export interface ContextFilterSelection {
  branchId?: string;
  trackId?: string;
  fieldId?: string;
  levelId?: string;
  courseId?: string;
  groupId?: string;
  trainerId?: string;
  studentId?: string;
}

export interface GenericCourse {
  id: string;
  name: string;
  code: string;
  shortCode?: string;
  fieldId?: string;
  levelId?: string;
  branchIds?: string[];
  status?: string;
}

export interface GenericGroup {
  id: string;
  name: string;
  groupCode?: string;
  branchId?: string;
  trackId?: string;
  fieldId?: string;
  levelId?: string;
  courseId?: string;
  trainerId?: string;
  status?: string;
}

export interface GenericTrainer {
  id: string;
  name: string;
  code?: string;
  branchIds?: string[];
  courseIds?: string[];
  groupIds?: string[];
  fieldIds?: string[];
  specializations?: string[];
}

export interface GenericStudent {
  id: string;
  code: string;
  fullName: string;
  branchId?: string;
  courseId?: string;
  courseIds?: string[];
  groupId?: string;
  status?: string;
  enrollments?: Array<{
    branchId?: string;
    trackId?: string;
    fieldId?: string;
    levelId?: string;
    courseId?: string;
    groupId?: string;
    trainerId?: string;
  }>;
}

export class ContextFilterEngine {
  /**
   * Filters compatible tracks based on current context.
   */
  static getCompatibleTracks(
    selection: ContextFilterSelection,
    allTracks: TrackRegistryItem[] = INITIAL_TRACKS
  ): TrackRegistryItem[] {
    return allTracks.filter(t => t.status === 'active');
  }

  /**
   * Filters fields compatible with the selected track.
   */
  static getCompatibleFields(
    selection: ContextFilterSelection,
    allFields: FieldRegistryItem[] = INITIAL_FIELDS
  ): FieldRegistryItem[] {
    let result = allFields.filter(f => f.status === 'active');
    if (selection.trackId) {
      result = result.filter(f => f.trackCompatibility.includes(selection.trackId!));
    }
    return result;
  }

  /**
   * Filters levels compatible with the selected field/track.
   */
  static getCompatibleLevels(
    selection: ContextFilterSelection,
    allLevels: LevelRegistryItem[] = INITIAL_LEVELS
  ): LevelRegistryItem[] {
    return allLevels.filter(l => l.status === 'active');
  }

  /**
   * Filters courses compatible with branch, field, level, and trainer selections.
   */
  static getCompatibleCourses(
    selection: ContextFilterSelection,
    allCourses: GenericCourse[] = []
  ): GenericCourse[] {
    return allCourses.filter(course => {
      if (course.status === 'inactive') return false;
      if (selection.fieldId && course.fieldId && course.fieldId !== selection.fieldId) return false;
      if (selection.levelId && course.levelId && course.levelId !== selection.levelId) return false;
      if (selection.branchId && course.branchIds && course.branchIds.length > 0) {
        if (!course.branchIds.includes(selection.branchId)) return false;
      }
      return true;
    });
  }

  /**
   * Filters groups compatible with selected branch, track, field, level, course, and trainer.
   */
  static getCompatibleGroups(
    selection: ContextFilterSelection,
    allGroups: GenericGroup[] = []
  ): GenericGroup[] {
    return allGroups.filter(group => {
      if (group.status === 'inactive') return false;
      if (selection.branchId && group.branchId && group.branchId !== selection.branchId && group.branchId !== 'all') return false;
      if (selection.trackId && group.trackId && group.trackId !== selection.trackId) return false;
      if (selection.fieldId && group.fieldId && group.fieldId !== selection.fieldId) return false;
      if (selection.levelId && group.levelId && group.levelId !== selection.levelId) return false;
      if (selection.courseId && group.courseId && group.courseId !== selection.courseId) return false;
      if (selection.trainerId && group.trainerId && group.trainerId !== selection.trainerId) return false;
      return true;
    });
  }

  /**
   * Filters trainers available for the current branch, course, and group selections.
   */
  static getCompatibleTrainers(
    selection: ContextFilterSelection,
    allTrainers: GenericTrainer[] = []
  ): GenericTrainer[] {
    return allTrainers.filter(trainer => {
      if (selection.branchId && trainer.branchIds && trainer.branchIds.length > 0) {
        if (!trainer.branchIds.includes(selection.branchId) && !trainer.branchIds.includes('all')) return false;
      }
      if (selection.courseId && trainer.courseIds && trainer.courseIds.length > 0) {
        if (!trainer.courseIds.includes(selection.courseId)) return false;
      }
      if (selection.groupId && trainer.groupIds && trainer.groupIds.length > 0) {
        if (!trainer.groupIds.includes(selection.groupId)) return false;
      }
      return true;
    });
  }

  /**
   * Filters students enrolled in the exact selected context (group, course, branch).
   */
  static getCompatibleStudents(
    selection: ContextFilterSelection,
    allStudents: GenericStudent[] = []
  ): GenericStudent[] {
    return allStudents.filter(student => {
      if (student.status === 'dropped' || student.status === 'suspended') return false;
      if (selection.branchId && student.branchId && student.branchId !== selection.branchId) return false;
      if (selection.groupId && student.groupId && student.groupId !== selection.groupId) {
        // Check if any multi-enrollment matches
        const hasEnrollment = student.enrollments?.some(e => e.groupId === selection.groupId);
        if (!hasEnrollment) return false;
      }
      if (selection.courseId) {
        const matchesMainCourse = student.courseId === selection.courseId || student.courseIds?.includes(selection.courseId);
        const matchesEnrollment = student.enrollments?.some(e => e.courseId === selection.courseId);
        if (!matchesMainCourse && !matchesEnrollment) return false;
      }
      return true;
    });
  }

  /**
   * Validates and invalidates downstream selections if an upstream selection changes.
   */
  static sanitizeSelection(
    prevSelection: ContextFilterSelection,
    changedKey: keyof ContextFilterSelection,
    newValue: string | undefined,
    availableCourses: GenericCourse[] = [],
    availableGroups: GenericGroup[] = []
  ): ContextFilterSelection {
    const next = { ...prevSelection, [changedKey]: newValue };

    // Cascade resets if upstream invalidation happens
    if (changedKey === 'trackId') {
      // Check field compatibility
      const fields = this.getCompatibleFields(next);
      if (next.fieldId && !fields.some(f => f.fieldId === next.fieldId)) {
        next.fieldId = undefined;
        next.levelId = undefined;
        next.courseId = undefined;
        next.groupId = undefined;
      }
    }

    if (changedKey === 'fieldId') {
      const courses = this.getCompatibleCourses(next, availableCourses);
      if (next.courseId && !courses.some(c => c.id === next.courseId)) {
        next.courseId = undefined;
        next.groupId = undefined;
      }
    }

    if (changedKey === 'levelId' || changedKey === 'branchId' || changedKey === 'trainerId') {
      const courses = this.getCompatibleCourses(next, availableCourses);
      if (next.courseId && !courses.some(c => c.id === next.courseId)) {
        next.courseId = undefined;
      }
      const groups = this.getCompatibleGroups(next, availableGroups);
      if (next.groupId && !groups.some(g => g.id === next.groupId)) {
        next.groupId = undefined;
      }
    }

    if (changedKey === 'courseId') {
      const groups = this.getCompatibleGroups(next, availableGroups);
      if (next.groupId && !groups.some(g => g.id === next.groupId)) {
        next.groupId = undefined;
      }
    }

    return next;
  }
}
