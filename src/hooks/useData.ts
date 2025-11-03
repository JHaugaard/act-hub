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

const DATA_SOURCE = import.meta.env.VITE_DATA_SOURCE || (import.meta.env.VITE_USE_MOCK_DATA === 'true' ? 'mock' : 'supabase');
const USE_MOCK_DATA = DATA_SOURCE === 'mock';
const USE_POCKETBASE = DATA_SOURCE === 'pocketbase';

console.log(`🔧 Data Source: ${DATA_SOURCE.toUpperCase()}`);

// Supabase hooks (legacy)
import { useFiles as useRealFiles } from './data/supabase/useFiles';
import { usePIs as useRealPIs, useSponsors as useRealSponsors } from './data/supabase/useProposalData';
import { useDashboard as useRealDashboard } from './data/supabase/useDashboard';
import { useRelatedProposals as useRealRelatedProposals } from './data/supabase/useRelatedProposals';
import { useFileAttachments as useRealFileAttachments } from './data/supabase/useFileAttachments';

// PocketBase hooks (current production)
import { usePocketBaseFiles } from './data/pocketbase/usePocketBaseFiles';
import { usePocketBasePIs, usePocketBaseSponsors } from './data/pocketbase/usePocketBaseProposalData';
import { usePocketBaseDashboard } from './data/pocketbase/usePocketBaseDashboard';
import { usePocketBaseRelatedProposals } from './data/pocketbase/usePocketBaseRelatedProposals';
import { usePocketBaseFileAttachments } from './data/pocketbase/usePocketBaseFileAttachments';

// Mock hooks (development/testing)
import { useMockFiles } from './data/mock/useMockFiles';
import { useMockPIs, useMockSponsors } from './data/mock/useMockProposalData';
import { useMockDashboard } from './data/mock/useMockDashboard';
import { useMockRelatedProposals } from './data/mock/useMockRelatedProposals';
import { useMockFileAttachments } from './data/mock/useMockFileAttachments';

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
export type { FileRecord, SortField, SortDirection } from './data/supabase/useFiles';
export type { PI, Sponsor } from './data/supabase/useProposalData';
