/**
 * Shared TypeScript types and interfaces
 *
 * This file contains commonly used types across the application.
 * Import from here to maintain consistency.
 */

// Re-export data types from hooks
export type { FileRecord, SortField, SortDirection } from '@/hooks/useData';
export type { PI, Sponsor } from '@/hooks/useData';

// Common UI types
export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
}

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

// Form types
export interface FormErrors {
  [key: string]: string | undefined;
}

export type FormMode = 'create' | 'edit' | 'view';

// API Response types
export interface ApiResponse<T> {
  data: T;
  error?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
}
