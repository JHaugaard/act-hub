#!/usr/bin/env node

/**
 * List all PocketBase collections
 * Usage: node scripts/list-collections.js
 */

import PocketBase from 'pocketbase';

const POCKETBASE_URL = process.env.VITE_POCKETBASE_URL || 'http://localhost:8090';

async function listCollections() {
  console.log(`\n📋 Listing collections from ${POCKETBASE_URL}...\n`);

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

    if (collections.length === 0) {
      console.log('No collections found.\n');
    } else {
      console.log(`Found ${collections.length} collection(s):\n`);
      collections.forEach(c => {
        console.log(`  - ${c.name} (ID: ${c.id}, Type: ${c.type})`);
      });
      console.log();
    }

  } catch (error) {
    console.error('❌ Failed to list collections:', error.message);
    console.error(error);
    process.exit(1);
  }
}

listCollections();
