#!/usr/bin/env node

/**
 * Initialize PocketBase schema (collections and fields)
 * This creates the necessary collections that match your Supabase schema
 *
 * Usage: node scripts/setup-pocketbase-schema.js
 * Run this AFTER starting PocketBase container
 */

const PocketBase = require('pocketbase/cjs');

const POCKETBASE_URL = process.env.VITE_POCKETBASE_URL || 'http://localhost:8090';

async function setupSchema() {
  console.log(`\n🚀 Setting up PocketBase schema at ${POCKETBASE_URL}...\n`);

  const pb = new PocketBase(POCKETBASE_URL);

  try {
    // Authenticate
    console.log('🔐 Authenticating...');
    await pb.admins.authWithPassword('admin@local.test', 'admin123456');
    console.log('✅ Authenticated\n');

    // Create PIs collection
    console.log('📝 Creating PIs collection...');
    try {
      await pb.collections.create({
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
      } else {
        throw error;
      }
    }

    // Create Sponsors collection
    console.log('📝 Creating Sponsors collection...');
    try {
      await pb.collections.create({
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
      } else {
        throw error;
      }
    }

    // Create Files collection (Proposals)
    console.log('📝 Creating Files (Proposals) collection...');
    try {
      await pb.collections.create({
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
              values: [
                'In',
                'Pending',
                'Pending Signatures',
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
              collectionId: 'pis',
              cascadeDelete: false,
            },
          },
          {
            name: 'sponsor_id',
            type: 'relation',
            required: true,
            options: {
              collectionId: 'sponsors',
              cascadeDelete: false,
            },
          },
        ],
      });
      console.log('✅ Files collection created\n');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('⚠️  Files collection already exists\n');
      } else {
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
              collectionId: 'files',
              cascadeDelete: true,
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
    console.log('2. Run export script: node scripts/export-supabase-data.js');
    console.log('3. Run import script: node scripts/import-to-pocketbase.js\n');

  } catch (error) {
    console.error('❌ Schema setup failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

setupSchema();
