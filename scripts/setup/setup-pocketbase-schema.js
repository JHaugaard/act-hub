#!/usr/bin/env node

/**
 * Initialize PocketBase schema (collections and fields)
 * This creates the necessary collections that match your Supabase schema
 *
 * Usage:
 *   PB_ADMIN_EMAIL=admin@example.com PB_ADMIN_PASSWORD=yourpassword node scripts/setup-pocketbase-schema.js
 *
 * Run this AFTER starting PocketBase container
 */

import PocketBase from 'pocketbase';

const POCKETBASE_URL = process.env.VITE_POCKETBASE_URL || 'http://localhost:8090';
const ADMIN_EMAIL = process.env.PB_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.PB_ADMIN_PASSWORD;

async function setupSchema() {
  // Validate required environment variables
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error('❌ Missing required environment variables:');
    console.error('   PB_ADMIN_EMAIL - Admin email address');
    console.error('   PB_ADMIN_PASSWORD - Admin password (min 10 characters)');
    console.error('\nUsage:');
    console.error('   PB_ADMIN_EMAIL=admin@example.com PB_ADMIN_PASSWORD=yourpassword node scripts/setup-pocketbase-schema.js');
    process.exit(1);
  }

  if (ADMIN_PASSWORD.length < 10) {
    console.error('❌ PB_ADMIN_PASSWORD must be at least 10 characters');
    process.exit(1);
  }

  console.log(`\n🚀 Setting up PocketBase schema at ${POCKETBASE_URL}...\n`);

  const pb = new PocketBase(POCKETBASE_URL);

  try {
    // Authenticate with admin
    console.log('🔐 Authenticating with admin...');
    const response = await fetch(`${POCKETBASE_URL}/api/admins/auth-with-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identity: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      pb.authStore.save(data.token, data.admin);
      console.log('✅ Authenticated\n');
    } else if (response.status === 400) {
      // Admin might not exist, try creating one
      console.log('📝 Creating admin user...');
      const createResponse = await fetch(`${POCKETBASE_URL}/api/admins`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD,
          passwordConfirm: ADMIN_PASSWORD,
        }),
      });

      if (createResponse.ok) {
        console.log('✅ Admin user created\n');

        // Now authenticate
        const authResponse = await fetch(`${POCKETBASE_URL}/api/admins/auth-with-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            identity: ADMIN_EMAIL,
            password: ADMIN_PASSWORD,
          }),
        });

        if (authResponse.ok) {
          const data = await authResponse.json();
          pb.authStore.save(data.token, data.admin);
          console.log('✅ Authenticated\n');
        } else {
          throw new Error(`Auth failed: ${authResponse.statusText}`);
        }
      } else {
        throw new Error(`Admin creation failed: ${createResponse.statusText}`);
      }
    } else {
      throw new Error(`Auth failed: ${response.statusText}`);
    }

    // Create PIs collection
    console.log('📝 Creating PIs collection...');
    let pisCollection;
    try {
      pisCollection = await pb.collections.create({
        name: 'pis',
        type: 'base',
        schema: [
          {
            name: 'name',
            type: 'text',
            required: true,
          },
        ],
      });
      console.log('✅ PIs collection created\n');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('⚠️  PIs collection already exists\n');
        // Fetch existing collection
        const collections = await pb.collections.getFullList();
        pisCollection = collections.find(c => c.name === 'pis');
      } else {
        throw error;
      }
    }

    // Create Sponsors collection
    console.log('📝 Creating Sponsors collection...');
    let sponsorsCollection;
    try {
      sponsorsCollection = await pb.collections.create({
        name: 'sponsors',
        type: 'base',
        schema: [
          {
            name: 'name',
            type: 'text',
            required: true,
          },
        ],
      });
      console.log('✅ Sponsors collection created\n');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('⚠️  Sponsors collection already exists\n');
        // Fetch existing collection
        const collections = await pb.collections.getFullList();
        sponsorsCollection = collections.find(c => c.name === 'sponsors');
      } else {
        throw error;
      }
    }

    // Create Files collection (Proposals)
    console.log('📝 Creating Files (Proposals) collection...');
    let filesCollection;
    try {
      filesCollection = await pb.collections.create({
        name: 'files',
        type: 'base',
        schema: [
          {
            name: 'db_no',
            type: 'text',
            required: true,
          },
          {
            name: 'status',
            type: 'select',
            required: true,
            options: {
              maxSelect: 1,
              values: [
                'In',
                'Pending',
                'Pending Signature',
                'Process',
                'Done',
                'On Hold',
                'Withdrawn',
              ],
            },
          },
          {
            name: 'date_received',
            type: 'date',
          },
          {
            name: 'date_status_change',
            type: 'date',
          },
          {
            name: 'notes',
            type: 'text',
          },
          {
            name: 'external_link',
            type: 'text',
          },
          {
            name: 'cayuse',
            type: 'text',
          },
          {
            name: 'to_set_up',
            type: 'text',
          },
          {
            name: 'pi_id',
            type: 'relation',
            required: true,
            options: {
              collectionId: pisCollection.id,
              cascadeDelete: false,
              maxSelect: 1,
              minSelect: 1,
            },
          },
          {
            name: 'sponsor_id',
            type: 'relation',
            required: true,
            options: {
              collectionId: sponsorsCollection.id,
              cascadeDelete: false,
              maxSelect: 1,
              minSelect: 1,
            },
          },
        ],
      });
      console.log('✅ Files collection created\n');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('⚠️  Files collection already exists\n');
        // Fetch existing collection
        const collections = await pb.collections.getFullList();
        filesCollection = collections.find(c => c.name === 'files');
      } else {
        console.error('Detailed error:', JSON.stringify(error.response, null, 2));
        throw error;
      }
    }

    // Create File Attachments collection
    console.log('📝 Creating File Attachments collection...');
    try {
      await pb.collections.create({
        name: 'file_attachments',
        type: 'base',
        schema: [
          {
            name: 'file_id',
            type: 'relation',
            required: true,
            options: {
              collectionId: filesCollection.id,
              cascadeDelete: true,
              maxSelect: 1,
              minSelect: 1,
            },
          },
          {
            name: 'filename',
            type: 'text',
            required: true,
          },
          {
            name: 'file_path',
            type: 'text',
            required: true,
          },
          {
            name: 'file_size',
            type: 'number',
            required: true,
          },
        ],
      });
      console.log('✅ File Attachments collection created\n');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('⚠️  File Attachments collection already exists\n');
      } else {
        throw error;
      }
    }

    console.log('✅ Schema setup complete!\n');
    console.log('📊 Collections created:');
    console.log('   - pis');
    console.log('   - sponsors');
    console.log('   - files');
    console.log('   - file_attachments\n');
    console.log('Next steps:');
    console.log('1. Verify in admin UI: http://localhost:8091');
    console.log('2. Run import script: node scripts/import-csv-to-pocketbase.js\n');

  } catch (error) {
    console.error('❌ Schema setup failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

setupSchema();
