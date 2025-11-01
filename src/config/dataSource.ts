/**
 * Data Source Configuration
 * Controls which backend the app uses
 */

const DATA_SOURCE = import.meta.env.VITE_DATA_SOURCE || (import.meta.env.VITE_USE_MOCK_DATA === 'true' ? 'mock' : 'supabase');
export const USE_MOCK_DATA = DATA_SOURCE === 'mock';

// Log current data source on load (helpful for debugging)
const sourceLabel =
  DATA_SOURCE === 'mock' ? 'MOCK (localStorage)' :
  DATA_SOURCE === 'pocketbase' ? 'POCKETBASE (local Docker)' :
  'SUPABASE (cloud)';

console.log(`🔧 Data Source: ${sourceLabel}`);
