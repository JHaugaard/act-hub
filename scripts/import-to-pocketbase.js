#!/usr/bin/env node

/**
 * Import exported Supabase data into PocketBase
 * Usage: node scripts/import-to-pocketbase.js [path-to-export-file]
 *
 * If no path provided, uses the most recent export from data-exports/
 */

const fs = require('fs');
const path = require('path');
const PocketBase = require('pocketbase/cjs');

const POCKETBASE_URL = process.env.VITE_POCKETBASE_URL || 'http://localhost:8090';

async function importData() {
  console.log(`\n🚀 Starting PocketBase data import from ${POCKETBASE_URL}...\n`);

  // Find export file
  let exportFilePath = process.argv[2];

  if (!exportFilePath) {
    // Find most recent export
    const exportsDir = path.join(__dirname, '../data-exports');
    if (!fs.existsSync(exportsDir)) {
      console.error('❌ No data-exports directory found. Please run export script first.');
      process.exit(1);
    }

    const files = fs
      .readdirSync(exportsDir)
      .filter(f => f.startsWith('supabase-export-') && f.endsWith('.json'))
      .sort()
      .reverse();

    if (files.length === 0) {
      console.error('❌ No export files found in data-exports/. Please run export script first.');
      process.exit(1);
    }

    exportFilePath = path.join(exportsDir, files[0]);
    console.log(`📁 Using most recent export: ${files[0]}\n`);
  }

  if (!fs.existsSync(exportFilePath)) {
    console.error(`❌ Export file not found: ${exportFilePath}`);
    process.exit(1);
  }

  try {
    // Read export file
    const rawData = fs.readFileSync(exportFilePath, 'utf-8');
    const exportedData = JSON.parse(rawData);

    // Initialize PocketBase client
    const pb = new PocketBase(POCKETBASE_URL);

    // Authenticate with admin user
    // Note: These credentials should match your docker-compose setup
    console.log('🔐 Authenticating with PocketBase...');
    await pb.admins.authWithPassword('admin@local.test', 'admin123456');
    console.log('✅ Authenticated\n');

    // Import PIs
    if (exportedData.pis && exportedData.pis.length > 0) {
      console.log(`📥 Importing ${exportedData.pis.length} PIs...`);
      for (const pi of exportedData.pis) {
        try {
          await pb.collection('pis').create({
            id: pi.id,
            name: pi.name,
          });
        } catch (error) {
          if (error.response?.status !== 400) {
            // Ignore duplicate key errors (400)
            console.error(`  ⚠️  Error importing PI ${pi.name}:`, error.message);
          }
        }
      }
      console.log(`✅ Imported PIs\n`);
    }

    // Import Sponsors
    if (exportedData.sponsors && exportedData.sponsors.length > 0) {
      console.log(`📥 Importing ${exportedData.sponsors.length} Sponsors...`);
      for (const sponsor of exportedData.sponsors) {
        try {
          await pb.collection('sponsors').create({
            id: sponsor.id,
            name: sponsor.name,
          });
        } catch (error) {
          if (error.response?.status !== 400) {
            console.error(`  ⚠️  Error importing Sponsor ${sponsor.name}:`, error.message);
          }
        }
      }
      console.log(`✅ Imported Sponsors\n`);
    }

    // Import Files
    if (exportedData.files && exportedData.files.length > 0) {
      console.log(`📥 Importing ${exportedData.files.length} Files (Proposals)...`);
      for (const file of exportedData.files) {
        try {
          await pb.collection('files').create({
            id: file.id,
            db_no: file.db_no,
            status: file.status,
            date_received: file.date_received,
            date_status_change: file.date_status_change,
            notes: file.notes,
            external_link: file.external_link,
            cayuse: file.cayuse,
            to_set_up: file.to_set_up,
            created_at: file.created_at,
            updated_at: file.updated_at,
            pi_id: file.pi_id,
            sponsor_id: file.sponsor_id,
          });
        } catch (error) {
          if (error.response?.status !== 400) {
            console.error(`  ⚠️  Error importing File ${file.db_no}:`, error.message);
          }
        }
      }
      console.log(`✅ Imported Files\n`);
    }

    // Import File Attachments
    if (exportedData.file_attachments && exportedData.file_attachments.length > 0) {
      console.log(`📥 Importing ${exportedData.file_attachments.length} File Attachments...`);
      for (const attachment of exportedData.file_attachments) {
        try {
          await pb.collection('file_attachments').create({
            id: attachment.id,
            file_id: attachment.file_id,
            filename: attachment.filename,
            file_path: attachment.file_path,
            file_size: attachment.file_size,
            uploaded_at: attachment.uploaded_at,
          });
        } catch (error) {
          if (error.response?.status !== 400) {
            console.error(`  ⚠️  Error importing attachment ${attachment.filename}:`, error.message);
          }
        }
      }
      console.log(`✅ Imported File Attachments\n`);
    }

    console.log('✅ Import complete!\n');
    console.log('📊 Summary:');
    console.log(`   - PIs: ${exportedData.pis?.length || 0}`);
    console.log(`   - Sponsors: ${exportedData.sponsors?.length || 0}`);
    console.log(`   - Files: ${exportedData.files?.length || 0}`);
    console.log(`   - Attachments: ${exportedData.file_attachments?.length || 0}\n`);
    console.log('Next steps:');
    console.log('1. Verify data in PocketBase admin panel: http://localhost:8091');
    console.log('2. Update your .env: VITE_DATA_SOURCE="pocketbase"');
    console.log('3. Restart dev server: npm run dev\n');

  } catch (error) {
    console.error('❌ Import failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response);
    }
    process.exit(1);
  }
}

importData();
