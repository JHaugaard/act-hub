#!/usr/bin/env node

/**
 * Migrate data from local PocketBase to production
 *
 * Usage:
 *   LOCAL_ADMIN_EMAIL=admin@local.test LOCAL_ADMIN_PASSWORD=yourpassword \
 *   PROD_ADMIN_EMAIL=admin@prod.com PROD_ADMIN_PASSWORD=prodpassword \
 *   node scripts/data/migrate-to-production.js
 */

import PocketBase from 'pocketbase';

const LOCAL_URL = process.env.LOCAL_POCKETBASE_URL || 'http://localhost:8090';
const PROD_URL = process.env.PROD_POCKETBASE_URL || 'https://proposaltracker-api.fly.dev';

// No default credentials - must be provided via environment variables
const LOCAL_ADMIN = {
  email: process.env.LOCAL_ADMIN_EMAIL,
  password: process.env.LOCAL_ADMIN_PASSWORD,
};

const PROD_ADMIN = {
  email: process.env.PROD_ADMIN_EMAIL,
  password: process.env.PROD_ADMIN_PASSWORD,
};

async function authenticateAdmin(pb, credentials, label) {
  console.log(`🔐 Authenticating with ${label}...`);
  const response = await fetch(`${pb.baseUrl}/api/admins/auth-with-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identity: credentials.email,
      password: credentials.password,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Authentication failed for ${label}: ${error}`);
  }

  const { token, admin } = await response.json();
  pb.authStore.save(token, admin);
  console.log(`✅ Authenticated with ${label}\n`);
}

async function fetchAllRecords(pb, collection) {
  const records = [];
  let page = 1;
  const perPage = 200;

  while (true) {
    const result = await pb.collection(collection).getList(page, perPage);
    records.push(...result.items);

    if (page >= result.totalPages) break;
    page++;
  }

  return records;
}

async function migrateData() {
  // Validate required environment variables
  if (!LOCAL_ADMIN.email || !LOCAL_ADMIN.password) {
    console.error('❌ Missing local admin credentials:');
    console.error('   LOCAL_ADMIN_EMAIL - Local PocketBase admin email');
    console.error('   LOCAL_ADMIN_PASSWORD - Local PocketBase admin password');
    process.exit(1);
  }

  if (!PROD_ADMIN.email || !PROD_ADMIN.password) {
    console.error('❌ Missing production admin credentials:');
    console.error('   PROD_ADMIN_EMAIL - Production PocketBase admin email');
    console.error('   PROD_ADMIN_PASSWORD - Production PocketBase admin password');
    process.exit(1);
  }

  console.log('\n🚀 Starting PocketBase data migration\n');
  console.log(`📤 Source: ${LOCAL_URL}`);
  console.log(`📥 Target: ${PROD_URL}\n`);

  const localPb = new PocketBase(LOCAL_URL);
  const prodPb = new PocketBase(PROD_URL);

  try {
    // Authenticate with both instances
    await authenticateAdmin(localPb, LOCAL_ADMIN, 'Local PocketBase');
    await authenticateAdmin(prodPb, PROD_ADMIN, 'Production PocketBase');

    // Maps to track ID translations (local ID -> production ID)
    const piIdMap = new Map();
    const sponsorIdMap = new Map();

    // ========== MIGRATE PIs ==========
    console.log('📥 Fetching PIs from local...');
    const localPis = await fetchAllRecords(localPb, 'pis');
    console.log(`   Found ${localPis.length} PIs`);

    console.log('📤 Importing PIs to production...');
    let piCount = 0;
    for (const pi of localPis) {
      try {
        const created = await prodPb.collection('pis').create({
          name: pi.name,
        });
        piIdMap.set(pi.id, created.id);
        piCount++;
        if (piCount % 50 === 0) {
          process.stdout.write(`   ${piCount}/${localPis.length}\r`);
        }
      } catch (error) {
        console.error(`   ⚠️  Error importing PI "${pi.name}": ${error.message}`);
      }
    }
    console.log(`✅ Imported ${piCount} PIs\n`);

    // ========== MIGRATE SPONSORS ==========
    console.log('📥 Fetching Sponsors from local...');
    const localSponsors = await fetchAllRecords(localPb, 'sponsors');
    console.log(`   Found ${localSponsors.length} Sponsors`);

    console.log('📤 Importing Sponsors to production...');
    let sponsorCount = 0;
    for (const sponsor of localSponsors) {
      try {
        const created = await prodPb.collection('sponsors').create({
          name: sponsor.name,
        });
        sponsorIdMap.set(sponsor.id, created.id);
        sponsorCount++;
        if (sponsorCount % 50 === 0) {
          process.stdout.write(`   ${sponsorCount}/${localSponsors.length}\r`);
        }
      } catch (error) {
        console.error(`   ⚠️  Error importing Sponsor "${sponsor.name}": ${error.message}`);
      }
    }
    console.log(`✅ Imported ${sponsorCount} Sponsors\n`);

    // ========== MIGRATE FILES ==========
    console.log('📥 Fetching Files from local...');
    const localFiles = await fetchAllRecords(localPb, 'files');
    console.log(`   Found ${localFiles.length} Files`);

    console.log('📤 Importing Files to production...');
    let fileCount = 0;
    let skippedCount = 0;
    for (const file of localFiles) {
      try {
        // Translate PI and Sponsor IDs
        const newPiId = piIdMap.get(file.pi_id);
        const newSponsorId = sponsorIdMap.get(file.sponsor_id);

        if (!newPiId || !newSponsorId) {
          console.error(`   ⚠️  Skipping file "${file.db_no}": missing PI or Sponsor mapping`);
          skippedCount++;
          continue;
        }

        await prodPb.collection('files').create({
          db_no: file.db_no,
          status: file.status || 'In',
          pi_id: newPiId,
          sponsor_id: newSponsorId,
          cayuse: file.cayuse || '',
          date_received: file.date_received || null,
          date_status_change: file.date_status_change || null,
          notes: file.notes || '',
          to_set_up: file.to_set_up || '',
          external_link: file.external_link || '',
        });
        fileCount++;
        if (fileCount % 50 === 0) {
          process.stdout.write(`   ${fileCount}/${localFiles.length}\r`);
        }
      } catch (error) {
        console.error(`   ⚠️  Error importing File "${file.db_no}": ${error.message}`);
      }
    }
    console.log(`✅ Imported ${fileCount} Files (${skippedCount} skipped)\n`);

    // ========== SUMMARY ==========
    console.log('═══════════════════════════════════════');
    console.log('📊 Migration Summary');
    console.log('═══════════════════════════════════════');
    console.log(`   PIs:      ${piCount}/${localPis.length}`);
    console.log(`   Sponsors: ${sponsorCount}/${localSponsors.length}`);
    console.log(`   Files:    ${fileCount}/${localFiles.length}`);
    console.log('═══════════════════════════════════════\n');

    console.log('✅ Migration complete!\n');
    console.log('Next steps:');
    console.log(`1. Verify data at ${PROD_URL}/_/`);
    console.log('2. Test the production frontend\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response);
    }
    process.exit(1);
  }
}

migrateData();
