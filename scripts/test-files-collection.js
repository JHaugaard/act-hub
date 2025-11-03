#!/usr/bin/env node

/**
 * Test creating the files collection with minimal fields first
 */

import PocketBase from 'pocketbase';

const POCKETBASE_URL = process.env.VITE_POCKETBASE_URL || 'http://localhost:8090';

async function testFilesCollection() {
  console.log(`\n🧪 Testing files collection creation...\n`);

  const pb = new PocketBase(POCKETBASE_URL);

  try {
    // Authenticate with admin
    console.log('🔐 Authenticating...');
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

    // Get existing collections
    const collections = await pb.collections.getFullList();
    const pisCollection = collections.find(c => c.name === 'pis');
    const sponsorsCollection = collections.find(c => c.name === 'sponsors');

    console.log(`PIs collection ID: ${pisCollection.id}`);
    console.log(`Sponsors collection ID: ${sponsorsCollection.id}\n`);

    // Try creating files collection with minimal schema
    console.log('📝 Creating minimal files collection...');
    try {
      const filesCollection = await pb.collections.create({
        name: 'files_test',
        type: 'base',
        schema: [
          {
            name: 'db_no',
            type: 'text',
            required: false,  // Changed to false for testing
          },
          {
            name: 'pi_id',
            type: 'relation',
            required: false,  // Changed to false for testing
            options: {
              collectionId: pisCollection.id,
              cascadeDelete: false,
              maxSelect: 1,
            },
          },
        ],
      });
      console.log('✅ Test collection created successfully!');
      console.log(`   Collection ID: ${filesCollection.id}\n`);

      // Now delete it
      console.log('🗑️  Deleting test collection...');
      await pb.collections.delete(filesCollection.id);
      console.log('✅ Test collection deleted\n');

    } catch (error) {
      console.error('❌ Failed to create test collection');
      console.error('Error details:', JSON.stringify(error.response, null, 2));
      throw error;
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', JSON.stringify(error.response, null, 2));
    }
    process.exit(1);
  }
}

testFilesCollection();
