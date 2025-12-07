/**
 * Data Hook Factory
 * Automatically exports correct hooks based on environment configuration
 *
 * Usage in components:
 *   import { useFiles, usePIs, useSponsors } from '@/hooks/useData'
 *
 * This will use either mock or PocketBase hooks based on VITE_DATA_SOURCE
 * Environment: VITE_DATA_SOURCE = "mock" | "pocketbase"
 */

const DATA_SOURCE = import.meta.env.VITE_DATA_SOURCE || 'pocketbase';
const USE_MOCK_DATA = DATA_SOURCE === 'mock';

console.log(`🔧 Data Source: ${DATA_SOURCE.toUpperCase()}`);

// PocketBase hooks (production)
import { usePocketBaseFiles } from './data/pocketbase/usePocketBaseFiles';
import { usePocketBasePIs, usePocketBaseSponsors } from './data/pocketbase/usePocketBaseProposalData';
import { usePocketBaseDashboard } from './data/pocketbase/usePocketBaseDashboard';
import { usePocketBaseRelatedProposals } from './data/pocketbase/usePocketBaseRelatedProposals';
import { usePocketBaseFileAttachments } from './data/pocketbase/usePocketBaseFileAttachments';
import { usePocketBaseFileDetail } from './data/pocketbase/usePocketBaseFileDetail';
import { usePocketBaseActionItems } from './data/pocketbase/usePocketBaseActionItems';

// Mock hooks (development/testing)
import { useMockFiles } from './data/mock/useMockFiles';
import { useMockPIs, useMockSponsors } from './data/mock/useMockProposalData';
import { useMockDashboard } from './data/mock/useMockDashboard';
import { useMockRelatedProposals } from './data/mock/useMockRelatedProposals';
import { useMockFileAttachments } from './data/mock/useMockFileAttachments';
import { useMockFileDetail } from './data/mock/useMockFileDetail';
import { useMockActionItems } from './data/mock/useMockActionItems';

// Initialize mock data if using mock mode
if (USE_MOCK_DATA) {
  import('@/lib/mockData').then(({ initializeMockData }) => {
    initializeMockData();
  });
}

// Export the appropriate hooks based on configuration
export const useFiles = USE_MOCK_DATA ? useMockFiles : usePocketBaseFiles;
export const usePIs = USE_MOCK_DATA ? useMockPIs : usePocketBasePIs;
export const useSponsors = USE_MOCK_DATA ? useMockSponsors : usePocketBaseSponsors;
export const useDashboard = USE_MOCK_DATA ? useMockDashboard : usePocketBaseDashboard;
export const useRelatedProposals = USE_MOCK_DATA ? useMockRelatedProposals : usePocketBaseRelatedProposals;
export const useFileAttachments = USE_MOCK_DATA ? useMockFileAttachments : usePocketBaseFileAttachments;
export const useFileDetail = USE_MOCK_DATA ? useMockFileDetail : usePocketBaseFileDetail;
export const useActionItems = USE_MOCK_DATA ? useMockActionItems : usePocketBaseActionItems;

// Export types from PocketBase hooks
export type { FileRecord, SortField, SortDirection } from './data/pocketbase/usePocketBaseFiles';
export type { PI, Sponsor } from './data/pocketbase/usePocketBaseProposalData';
export type { FileDetailRecord } from './data/pocketbase/usePocketBaseFileDetail';
export type { ActionItem, TaskCategory, CreateActionItemInput, UpdateActionItemInput } from '@/types/actionItem';
export { TASK_CATEGORIES } from '@/types/actionItem';
