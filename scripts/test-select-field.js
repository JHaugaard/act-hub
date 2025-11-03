#!/usr/bin/env node

/**
 * Test creating a collection with a select field
 */

import PocketBase from 'pocketbase';

const POCKETBASE_URL = process.env.VITE_POCKETBASE_URL || 'http://localhost:8090';

async function testSelectField() {
  console.log(`\n🧪 Testing select field creation...\n`);

  const pb = new PocketBase(POCKETBASE_URL);

  try {
    // Authenticate
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
    }

    // Try creating collection with select field
    console.log('📝 Testing select field...');
    try {
      const testCollection = await pb.collections.create({
        name: 'test_select',
        type: 'base',
        schema: [
          {
            name: 'status',
            type: 'select',
            required: true,
            options: {
              maxSelect: 1,
              values: ['In', 'Pending', 'Process', 'Done'],
            },
          },
        ],
      });
      console.log('✅ Select field works!\n');

      // Clean up
      await pb.collections.delete(testCollection.id);
      console.log('✅ Test collection deleted\n');

    } catch (error) {
      console.error('❌ Select field failed');
      console.error('Error details:', JSON.stringify(error.response, null, 2));
      throw error;
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testSelectField();
