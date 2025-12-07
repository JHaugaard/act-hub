/**
 * Data Source Configuration
 * Controls which backend the app uses
 */

const DATA_SOURCE = import.meta.env.VITE_DATA_SOURCE || 'pocketbase';
export const USE_MOCK_DATA = DATA_SOURCE === 'mock';

// Log current data source on load (helpful for debugging)
const sourceLabel =
  DATA_SOURCE === 'mock' ? 'MOCK (localStorage)' :
  'POCKETBASE';

console.log(`🔧 Data Source: ${sourceLabel}`);
