#!/usr/bin/env node

/**
 * Import CSV data into PocketBase
 * Usage: node scripts/import-csv-to-pocketbase.js
 *
 * This script reads three CSV files and imports them into PocketBase:
 * - data-for-importing/pis.csv
 * - data-for-importing/sponsors.csv
 * - data-for-importing/files.csv
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { parse } from 'csv-parse/sync';
import PocketBase from 'pocketbase';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const POCKETBASE_URL = process.env.VITE_POCKETBASE_URL || 'http://localhost:8090';
const DATA_DIR = join(__dirname, '../../data-for-importing');

// CSV file paths
const CSV_FILES = {
  pis: join(DATA_DIR, 'pis.csv'),
  sponsors: join(DATA_DIR, 'sponsors.csv'),
  files: join(DATA_DIR, 'files.csv'),
};

/**
 * Parse CSV file
 */
function parseCSV(filePath) {
  const fileContent = readFileSync(filePath, 'utf-8');
  // Remove BOM if present
  const cleanContent = fileContent.replace(/^\ufeff/, '');
  return parse(cleanContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });
}

/**
 * Sanitize field value (handle quotes, empty strings, etc.)
 */
function sanitizeValue(value) {
  if (!value || value === '' || value === 'null' || value === 'NULL') {
    return null;
  }
  // Remove surrounding quotes if present
  if (typeof value === 'string' && value.startsWith('"') && value.endsWith('"')) {
    return value.slice(1, -1).trim();
  }
  return value ? String(value).trim() : null;
}

async function importData() {
  console.log(`\n🚀 Starting PocketBase CSV import from ${POCKETBASE_URL}...\n`);

  const pb = new PocketBase(POCKETBASE_URL);

  try {
    // Authenticate with admin
    console.log('🔐 Authenticating with PocketBase...');
    const authRes = await fetch(`${POCKETBASE_URL}/api/admins/auth-with-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identity: 'admin@local.test',
        password: 'admin123456',
      }),
    });

    if (!authRes.ok) {
      throw new Error(`Authentication failed: ${authRes.statusText}`);
    }

    const { token, admin } = await authRes.json();
    pb.authStore.save(token, admin);
    console.log('✅ Authenticated\n');

    // Create maps for PI and Sponsor name to ID lookup (to handle relationships)
    const piNameToId = {};
    const sponsorNameToId = {};

    // ========== IMPORT PIs ==========
    console.log('📥 Importing PIs...');
    const piRecords = parseCSV(CSV_FILES.pis);
    let piCount = 0;

    for (const record of piRecords) {
      try {
        const name = sanitizeValue(record.name);
        if (!name) continue;

        const piData = {
          name: name,
        };

        // Let PocketBase generate the ID
        const created = await pb.collection('pis').create(piData);
        piNameToId[name] = created.id;
        piCount++;
      } catch (error) {
        console.error(`  ⚠️  Error importing PI: ${error.message}`);
      }
    }
    console.log(`✅ Imported ${piCount} PIs\n`);

    // ========== IMPORT SPONSORS ==========
    console.log('📥 Importing Sponsors...');
    const sponsorRecords = parseCSV(CSV_FILES.sponsors);
    let sponsorCount = 0;

    for (const record of sponsorRecords) {
      try {
        const name = sanitizeValue(record.sponsor);
        if (!name) continue;

        const sponsorData = {
          name: name,
        };

        // Let PocketBase generate the ID
        const created = await pb.collection('sponsors').create(sponsorData);
        sponsorNameToId[name] = created.id;
        sponsorCount++;
      } catch (error) {
        console.error(`  ⚠️  Error importing Sponsor: ${error.message}`);
      }
    }
    console.log(`✅ Imported ${sponsorCount} Sponsors\n`);

    // ========== IMPORT FILES ==========
    console.log('📥 Importing Files (Proposals)...');
    const fileRecords = parseCSV(CSV_FILES.files);
    let fileCount = 0;
    let skippedCount = 0;

    for (const record of fileRecords) {
      try {
        const db_no = sanitizeValue(record.db_no);
        const status = sanitizeValue(record.status) || 'In';
        const piName = sanitizeValue(record.pi_name);
        const sponsorName = sanitizeValue(record.sponsor_name);

        // Skip if missing required fields
        if (!db_no || !piName || !sponsorName) {
          skippedCount++;
          continue;
        }

        // Look up PI and Sponsor IDs
        const piId = piNameToId[piName];
        const sponsorId = sponsorNameToId[sponsorName];

        if (!piId) {
          console.error(`  ⚠️  PI not found: ${piName}`);
          skippedCount++;
          continue;
        }

        if (!sponsorId) {
          console.error(`  ⚠️  Sponsor not found: ${sponsorName}`);
          skippedCount++;
          continue;
        }

        // Parse dates (handle empty/null)
        const parseDate = (dateStr) => {
          if (!dateStr) return null;
          // Try to parse various date formats
          const parsed = new Date(dateStr);
          return isNaN(parsed.getTime()) ? null : parsed.toISOString();
        };

        const fileData = {
          db_no: db_no,
          status: status,
          pi_id: piId,
          sponsor_id: sponsorId,
          cayuse: sanitizeValue(record.cayuse),
          date_received: parseDate(record.date_received),
          date_status_change: parseDate(record.date_status_change),
          notes: sanitizeValue(record.notes),
          to_set_up: sanitizeValue(record.to_set_up),
          external_link: sanitizeValue(record.external_link),
        };

        await pb.collection('files').create(fileData);
        fileCount++;
      } catch (error) {
        console.error(`  ⚠️  Error importing File: ${error.message}`);
      }
    }
    console.log(`✅ Imported ${fileCount} Files (${skippedCount} skipped due to missing data)\n`);

    console.log('✅ CSV import complete!\n');
    console.log('📊 Summary:');
    console.log(`   - PIs: ${piCount}`);
    console.log(`   - Sponsors: ${sponsorCount}`);
    console.log(`   - Files: ${fileCount}`);
    console.log(`   - Skipped: ${skippedCount}\n`);
    console.log('Next steps:');
    console.log('1. Verify data in PocketBase admin panel: http://localhost:8090/_/');
    console.log('2. Update your .env: VITE_DATA_SOURCE="pocketbase"');
    console.log('3. Restart dev server: npm run dev\n');

  } catch (error) {
    console.error('❌ CSV import failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response);
    }
    process.exit(1);
  }
}

importData();
