/**
 * Data Hook Factory
 * Automatically exports correct hooks based on environment configuration
 *
 * Usage in components:
 *   import { useFiles, usePIs, useSponsors } from '@/hooks/useData'
 *
 * This will use either mock, PocketBase, or real Supabase hooks based on VITE_DATA_SOURCE
 * Environment: VITE_DATA_SOURCE = "mock" | "pocketbase" | "supabase"
 */

const DATA_SOURCE = import.meta.env.VITE_DATA_SOURCE || import.meta.env.VITE_USE_MOCK_DATA === 'true' ? 'mock' : 'supabase';
const USE_MOCK_DATA = DATA_SOURCE === 'mock';
const USE_POCKETBASE = DATA_SOURCE === 'pocketbase';

console.log(`🔧 Data Source: ${DATA_SOURCE.toUpperCase()}`);

// Real Supabase hooks
import { useFiles as useRealFiles } from './useFiles';
import { usePIs as useRealPIs, useSponsors as useRealSponsors } from './useProposalData';
import { useDashboard as useRealDashboard } from './useDashboard';
import { useRelatedProposals as useRealRelatedProposals } from './useRelatedProposals';
import { useFileAttachments as useRealFileAttachments } from './useFileAttachments';

// PocketBase hooks
import { usePocketBaseFiles } from './usePocketBaseFiles';
import { usePocketBasePIs, usePocketBaseSponsors } from './usePocketBaseProposalData';
import { usePocketBaseDashboard } from './usePocketBaseDashboard';
import { usePocketBaseRelatedProposals } from './usePocketBaseRelatedProposals';
import { usePocketBaseFileAttachments } from './usePocketBaseFileAttachments';

// Mock hooks
import { useMockFiles } from './mock/useMockFiles';
import { useMockPIs, useMockSponsors } from './mock/useMockProposalData';
import { useMockDashboard } from './mock/useMockDashboard';
import { useMockRelatedProposals } from './mock/useMockRelatedProposals';
import { useMockFileAttachments } from './mock/useMockFileAttachments';

// Initialize mock data if using mock mode
if (USE_MOCK_DATA) {
  import('@/lib/mockData').then(({ initializeMockData }) => {
    initializeMockData();
  });
}

// Export the appropriate hooks based on configuration
export const useFiles = USE_MOCK_DATA
  ? useMockFiles
  : USE_POCKETBASE
    ? usePocketBaseFiles
    : useRealFiles;

export const usePIs = USE_MOCK_DATA
  ? useMockPIs
  : USE_POCKETBASE
    ? usePocketBasePIs
    : useRealPIs;

export const useSponsors = USE_MOCK_DATA
  ? useMockSponsors
  : USE_POCKETBASE
    ? usePocketBaseSponsors
    : useRealSponsors;

export const useDashboard = USE_MOCK_DATA
  ? useMockDashboard
  : USE_POCKETBASE
    ? usePocketBaseDashboard
    : useRealDashboard;

export const useRelatedProposals = USE_MOCK_DATA
  ? useMockRelatedProposals
  : USE_POCKETBASE
    ? usePocketBaseRelatedProposals
    : useRealRelatedProposals;

export const useFileAttachments = USE_MOCK_DATA
  ? useMockFileAttachments
  : USE_POCKETBASE
    ? usePocketBaseFileAttachments
    : useRealFileAttachments;

// Also export types for convenience
export type { FileRecord, SortField, SortDirection } from './useFiles';
export type { PI, Sponsor } from './useProposalData';
