/**
 * NAGAH MS - Transaction Code & Sequence Engine
 * Structured Context: BRANCH + TRACK + FIELD + LEVEL + COURSE + GROUP + STUDENT + SERVICE + SEQUENCE
 * Example: NELB11A001R3
 */

import { getBranchCode, getTrackCode, getFieldCode, getLevelCode, getServiceCode } from './registries';

export interface TransactionContext {
  branchId?: string;
  branchCode?: string;
  trackId?: string;
  trackCode?: string;
  fieldId?: string;
  fieldCode?: string;
  levelId?: string;
  levelCode?: string;
  courseId?: string;
  courseShortCode?: string;
  groupId?: string;
  groupCode?: string;
  studentId?: string;
  studentCode: string;
  serviceType: 'RECEIPT' | 'PAYMENT' | 'EXAM' | 'CERTIFICATE' | 'ASSIGNMENT' | 'ATTENDANCE' | (string & {});
}

export interface TransactionRecord {
  transactionId: string;
  transactionCode: string;
  studentId?: string;
  studentCode: string;
  enrollmentId?: string;
  branchId?: string;
  trackId?: string;
  fieldId?: string;
  levelId?: string;
  courseId?: string;
  groupId?: string;
  serviceType: string;
  serviceCode: string;
  sequenceNumber: number;
  createdAt: string;
  createdBy?: string;
  status: 'active' | 'voided';
}

/**
 * Builds a structured, human-readable Transaction Code.
 * Standard Format: [BRANCH][TRACK][FIELD][LEVEL][COURSE_SHORT][GROUP][STUDENT_CODE][SERVICE_CODE][SEQUENCE]
 */
export function buildTransactionCode(context: TransactionContext, sequenceNumber: number): string {
  const bCode = (context.branchCode || getBranchCode(context.branchId)).charAt(0).toUpperCase();
  const tCode = (context.trackCode || getTrackCode(context.trackId)).charAt(0).toUpperCase();
  const fCode = (context.fieldCode || getFieldCode(context.fieldId)).charAt(0).toUpperCase();
  const lCode = (context.levelCode || getLevelCode(context.levelId)).charAt(0).toUpperCase();
  const cCode = (context.courseShortCode || '1').trim().charAt(0).toUpperCase();
  const gCode = (context.groupCode || '1').trim().charAt(0).toUpperCase();
  const sCode = context.studentCode ? context.studentCode.trim().toUpperCase() : 'A000';
  const srvCode = getServiceCode(context.serviceType).toUpperCase();

  return `${bCode}${tCode}${fCode}${lCode}${cCode}${gCode}${sCode}${srvCode}${sequenceNumber}`;
}

/**
 * In-Memory Sequence Storage fallback (Persistent in server DB via PostgreSQL sequence_counters table).
 */
const inMemorySequenceCounters: Map<string, number> = new Map();

/**
 * Generates next sequence number for a service context safely.
 */
export function getNextSequenceNumber(serviceType: string, studentCode: string, contextKey: string = 'global'): number {
  const srvCode = getServiceCode(serviceType);
  const key = `${srvCode}:${studentCode.toUpperCase()}:${contextKey}`;
  const current = inMemorySequenceCounters.get(key) || 0;
  const next = current + 1;
  inMemorySequenceCounters.set(key, next);
  return next;
}
