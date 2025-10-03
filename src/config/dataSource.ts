/**
 * Data Source Configuration
 * Controls whether the app uses mock data (localStorage) or real Supabase
 */

export const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';

// Log current data source on load (helpful for debugging)
console.log(
  `🔧 Data Source: ${USE_MOCK_DATA ? 'MOCK (localStorage)' : 'SUPABASE (cloud)'}`
);
