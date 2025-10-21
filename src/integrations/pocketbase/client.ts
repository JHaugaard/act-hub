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

/**
 * Ensure PocketBase client is authenticated
 * Attempts to authenticate with default admin credentials if needed
 */
export async function ensurePocketBaseAuth(): Promise<boolean> {
  try {
    if (pb.authStore.isValid) {
      return true;
    }

    const authRes = await fetch(`${POCKETBASE_URL}/api/admins/auth-with-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identity: 'admin@local.test',
        password: 'admin123456',
      }),
    });

    if (authRes.ok) {
      const { token, admin } = await authRes.json();
      pb.authStore.save(token, admin);
      return true;
    }

    return false;
  } catch (error) {
    console.error('Failed to authenticate with PocketBase:', error);
    return false;
  }
}

export default pb;
