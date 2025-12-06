export const TASK_CATEGORIES = [
  'Local Setup',
  'Email Sponsor',
  'Email PI/Team',
  'Review Docs',
  'Draft',
  'Edit/Revise',
  'PI Letter',
  'Setup',
  'Other',
] as const;

export type TaskCategory = typeof TASK_CATEGORIES[number];

export interface ActionItem {
  id: string;
  db_no: string | null;
  file_id: string | null;
  task: TaskCategory;
  notes: string | null;
  is_active: boolean;
  date_entered: string;
  created_at: string;
  updated_at: string;
}

export interface CreateActionItemInput {
  db_no?: string | null;
  file_id?: string | null;
  task: TaskCategory;
  notes?: string | null;
}

export interface UpdateActionItemInput {
  task?: TaskCategory;
  notes?: string | null;
  is_active?: boolean;
}
