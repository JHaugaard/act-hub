#!/usr/bin/env node

/**
 * Delete existing PocketBase collections
 * Use this to start fresh if schema setup fails
 *
 * Usage: node scripts/delete-collections.js
 */

import PocketBase from 'pocketbase';

const POCKETBASE_URL = process.env.VITE_POCKETBASE_URL || 'http://localhost:8090';

async function deleteCollections() {
  console.log(`\n🗑️  Deleting collections from ${POCKETBASE_URL}...\n`);

  const pb = new PocketBase(POCKETBASE_URL);

  try {
    // Authenticate with admin using fetch (more reliable for initial setup)
    console.log('🔐 Authenticating with admin...');
    const authResponse = await fetch(`${POCKETBASE_URL}/api/admins/auth-with-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identity: 'admin@local.test',
        password: 'admin123456',
      }),
    });

    if (authResponse.ok) {
      const data = await authResponse.json();
      pb.authStore.save(data.token, data.admin);
      console.log('✅ Authenticated\n');
    } else {
      throw new Error(`Auth failed: ${authResponse.statusText}`);
    }

    // Get all collections
    const collections = await pb.collections.getFullList();

    // Collections to delete
    const collectionsToDelete = ['file_attachments', 'files', 'sponsors', 'pis'];

    for (const collectionName of collectionsToDelete) {
      const collection = collections.find(c => c.name === collectionName);

      if (collection) {
        console.log(`🗑️  Deleting ${collectionName} collection...`);
        try {
          await pb.collections.delete(collection.id);
          console.log(`✅ Deleted ${collectionName}\n`);
        } catch (error) {
          console.log(`⚠️  Could not delete ${collectionName}: ${error.message}\n`);
        }
      } else {
        console.log(`⚠️  ${collectionName} collection not found\n`);
      }
    }

    console.log('✅ Cleanup complete!\n');
    console.log('Next step: Run schema setup');
    console.log('  node scripts/setup-pocketbase-schema.js\n');

  } catch (error) {
    console.error('❌ Deletion failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

deleteCollections();
