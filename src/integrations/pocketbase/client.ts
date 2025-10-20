/**
 * PocketBase Client
 * Provides a configured PocketBase client instance for API communication
 */

import PocketBase from 'pocketbase';

// PocketBase URL - switch between local dev and production
const POCKETBASE_URL = import.meta.env.VITE_POCKETBASE_URL || 'http://localhost:8090';

/**
 * Initialize PocketBase client
 * Includes auth persistence in localStorage
 */
export const pb = new PocketBase(POCKETBASE_URL);

// Persist auth data in localStorage
pb.authStore.save(
  pb.authStore.token,
  pb.authStore.model
);

export default pb;
