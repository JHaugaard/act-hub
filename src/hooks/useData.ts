/**
 * Data Hook Factory
 * Automatically exports correct hooks based on environment configuration
 *
 * Usage in components:
 *   import { useFiles, usePIs, useSponsors } from '@/hooks/useData'
 *
 * This will use either mock or real Supabase hooks based on VITE_USE_MOCK_DATA
 */

import { USE_MOCK_DATA } from '@/config/dataSource';

// Real Supabase hooks
import { useFiles as useRealFiles } from './useFiles';
import { usePIs as useRealPIs, useSponsors as useRealSponsors } from './useProposalData';
import { useDashboard as useRealDashboard } from './useDashboard';
import { useRelatedProposals as useRealRelatedProposals } from './useRelatedProposals';
import { useFileAttachments as useRealFileAttachments } from './useFileAttachments';

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
export const useFiles = USE_MOCK_DATA ? useMockFiles : useRealFiles;
export const usePIs = USE_MOCK_DATA ? useMockPIs : useRealPIs;
export const useSponsors = USE_MOCK_DATA ? useMockSponsors : useRealSponsors;
export const useDashboard = USE_MOCK_DATA ? useMockDashboard : useRealDashboard;
export const useRelatedProposals = USE_MOCK_DATA ? useMockRelatedProposals : useRealRelatedProposals;
export const useFileAttachments = USE_MOCK_DATA ? useMockFileAttachments : useRealFileAttachments;

// Also export types for convenience
export type { FileRecord, SortField, SortDirection } from './useFiles';
export type { PI, Sponsor } from './useProposalData';
