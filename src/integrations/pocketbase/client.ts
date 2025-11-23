/**
 * PocketBase Client
 * Provides a configured PocketBase client instance for API communication
 */

import PocketBase from 'pocketbase';

// PocketBase URL - from environment variable
const POCKETBASE_URL = import.meta.env.VITE_POCKETBASE_URL || 'http://localhost:8090';

/**
 * Initialize PocketBase client
 * Auth state is automatically persisted in localStorage by PocketBase
 */
export const pb = new PocketBase(POCKETBASE_URL);

// Enable auto-cancellation for duplicate requests (performance optimization)
pb.autoCancellation(false);

export default pb;
