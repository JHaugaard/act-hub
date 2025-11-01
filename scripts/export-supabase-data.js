#!/usr/bin/env node

/**
 * Export all data from Lovable Supabase instance
 * Usage: node scripts/export-supabase-data.js
 *
 * This script exports all data from your Supabase instance and saves it as JSON
 * The output can then be imported into PocketBase
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Import Supabase client (using the same setup as the app)
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY must be set in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function exportData() {
  console.log('🚀 Starting Supabase data export...\n');

  try {
    const exportedData = {};

    // Export PIs
    console.log('📥 Exporting PIs...');
    const { data: pis, error: pisError } = await supabase
      .from('pis')
      .select('*');

    if (pisError) throw new Error(`Failed to export PIs: ${pisError.message}`);
    exportedData.pis = pis || [];
    console.log(`   ✅ Exported ${exportedData.pis.length} PIs\n`);

    // Export Sponsors
    console.log('📥 Exporting Sponsors...');
    const { data: sponsors, error: sponsorsError } = await supabase
      .from('sponsors')
      .select('*');

    if (sponsorsError) throw new Error(`Failed to export Sponsors: ${sponsorsError.message}`);
    exportedData.sponsors = sponsors || [];
    console.log(`   ✅ Exported ${exportedData.sponsors.length} Sponsors\n`);

    // Export Files (Proposals)
    console.log('📥 Exporting Files (Proposals)...');
    const { data: files, error: filesError } = await supabase
      .from('files')
      .select('*');

    if (filesError) throw new Error(`Failed to export Files: ${filesError.message}`);
    exportedData.files = files || [];
    console.log(`   ✅ Exported ${exportedData.files.length} Files\n`);

    // Export File Attachments
    console.log('📥 Exporting File Attachments...');
    const { data: attachments, error: attachmentsError } = await supabase
      .from('file_attachments')
      .select('*');

    if (attachmentsError) throw new Error(`Failed to export File Attachments: ${attachmentsError.message}`);
    exportedData.file_attachments = attachments || [];
    console.log(`   ✅ Exported ${exportedData.file_attachments.length} File Attachments\n`);

    // Save to file
    const exportDir = path.join(__dirname, '../data-exports');
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const exportPath = path.join(exportDir, `supabase-export-${timestamp}.json`);

    fs.writeFileSync(exportPath, JSON.stringify(exportedData, null, 2));

    console.log('✅ Export complete!\n');
    console.log(`📁 Data saved to: ${exportPath}\n`);
    console.log('📊 Summary:');
    console.log(`   - PIs: ${exportedData.pis.length}`);
    console.log(`   - Sponsors: ${exportedData.sponsors.length}`);
    console.log(`   - Files: ${exportedData.files.length}`);
    console.log(`   - Attachments: ${exportedData.file_attachments.length}\n`);
    console.log('Next steps:');
    console.log('1. Start PocketBase: docker-compose -f docker-compose.local.yml up');
    console.log('2. Run import script: node scripts/import-to-pocketbase.js\n');

  } catch (error) {
    console.error('❌ Export failed:', error.message);
    process.exit(1);
  }
}

exportData();
