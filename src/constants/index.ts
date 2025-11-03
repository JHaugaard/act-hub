/**
 * Application-wide constants
 *
 * Centralized location for constants used throughout the application.
 */

// Proposal statuses
export const PROPOSAL_STATUSES = [
  'Submitted',
  'Under Review',
  'In Progress',
  'Completed',
  'On Hold',
  'Rejected',
  'Cancelled'
] as const;

export type ProposalStatus = typeof PROPOSAL_STATUSES[number];

// Status colors for UI
export const STATUS_COLORS: Record<string, string> = {
  'Submitted': 'bg-blue-100 text-blue-800',
  'Under Review': 'bg-yellow-100 text-yellow-800',
  'In Progress': 'bg-purple-100 text-purple-800',
  'Completed': 'bg-green-100 text-green-800',
  'On Hold': 'bg-gray-100 text-gray-800',
  'Rejected': 'bg-red-100 text-red-800',
  'Cancelled': 'bg-red-100 text-red-800'
};

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// Date formats
export const DATE_FORMAT = 'MMM dd, yyyy';
export const DATETIME_FORMAT = 'MMM dd, yyyy HH:mm';

// API configuration
export const API_TIMEOUT = 30000; // 30 seconds

// File upload limits
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/jpeg',
  'image/png',
  'image/gif'
];

// Distiller timeout (5 minutes)
export const DISTILLER_TIMEOUT_MS = 5 * 60 * 1000;

// Toast notification durations
export const TOAST_DURATION_SUCCESS = 3000;
export const TOAST_DURATION_ERROR = 5000;
export const TOAST_DURATION_WARNING = 4000;
