import type {Id} from '../convex/_generated/dataModel';

export type RequirementStatus = 'current' | 'upcoming' | 'overdue';

export type Requirement = {
  /** Null for the sample rows shown before a business is signed in. */
  _id: Id<'requirements'> | null;
  title: string;
  category: string;
  /** Always an ISO calendar date (YYYY-MM-DD). */
  dueDate: string;
  status: RequirementStatus;
  recurrence?: string;
  authorityUrl?: string;
  hasDocument: boolean;
};

export type NewRequirement = {
  title: string;
  category: string;
  dueDate: string;
  recurrence?: string;
  status: RequirementStatus;
};

export const SAMPLE_REQUIREMENTS: Requirement[] = [
  {_id: null, title: 'General liability insurance', category: 'Insurance', dueDate: '2026-10-14', status: 'upcoming', recurrence: 'annual', hasDocument: false},
  {_id: null, title: 'Estimated federal tax payment', category: 'Tax', dueDate: '2026-09-15', status: 'upcoming', recurrence: 'quarterly', hasDocument: false},
  {_id: null, title: 'Business licence', category: 'Licences', dueDate: '2026-12-31', status: 'current', recurrence: 'annual', hasDocument: true},
  {_id: null, title: 'First-aid certification', category: 'Safety', dueDate: '2026-08-28', status: 'overdue', recurrence: 'annual', hasDocument: false},
];
