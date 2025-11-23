#!/usr/bin/env node

/**
 * Migrate the 15 "Pending Signature" files that failed initial migration
 */

import PocketBase from 'pocketbase';

const LOCAL_URL = 'http://localhost:8090';
const PROD_URL = 'https://proposaltracker-api.fly.dev';

const LOCAL_ADMIN = { email: 'admin@local.test', password: 'admin123456' };
const PROD_ADMIN = { email: 'admin@local.test', password: 'admin123456' };

async function authenticateAdmin(pb, credentials, label) {
  const response = await fetch(`${pb.baseUrl}/api/admins/auth-with-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: credentials.email, password: credentials.password }),
  });
  if (!response.ok) throw new Error(`Auth failed for ${label}`);
  const { token, admin } = await response.json();
  pb.authStore.save(token, admin);
  console.log(`✅ Authenticated with ${label}`);
}

async function migrate() {
  console.log('\n🔧 Migrating 15 "Pending Signature" files...\n');

  const localPb = new PocketBase(LOCAL_URL);
  const prodPb = new PocketBase(PROD_URL);

  await authenticateAdmin(localPb, LOCAL_ADMIN, 'Local');
  await authenticateAdmin(prodPb, PROD_ADMIN, 'Production');

  // Get PI and Sponsor mappings by name (since IDs differ between environments)
  console.log('\n📥 Building name-to-ID mappings...');

  const localPis = await localPb.collection('pis').getFullList();
  const prodPis = await prodPb.collection('pis').getFullList();
  const piLocalToName = new Map(localPis.map(p => [p.id, p.name]));
  const piNameToProd = new Map(prodPis.map(p => [p.name, p.id]));

  const localSponsors = await localPb.collection('sponsors').getFullList();
  const prodSponsors = await prodPb.collection('sponsors').getFullList();
  const sponsorLocalToName = new Map(localSponsors.map(s => [s.id, s.name]));
  const sponsorNameToProd = new Map(prodSponsors.map(s => [s.name, s.id]));

  // Fetch the 15 "Pending Signature" files from local
  console.log('📥 Fetching "Pending Signature" files from local...');
  const pendingFiles = await localPb.collection('files').getFullList({
    filter: "status = 'Pending Signature'"
  });
  console.log(`   Found ${pendingFiles.length} files\n`);

  // Import to production
  console.log('📤 Importing to production...');
  let count = 0;
  for (const file of pendingFiles) {
    try {
      const piName = piLocalToName.get(file.pi_id);
      const sponsorName = sponsorLocalToName.get(file.sponsor_id);
      const prodPiId = piNameToProd.get(piName);
      const prodSponsorId = sponsorNameToProd.get(sponsorName);

      if (!prodPiId || !prodSponsorId) {
        console.error(`   ⚠️  Missing mapping for ${file.db_no}`);
        continue;
      }

      await prodPb.collection('files').create({
        db_no: file.db_no,
        status: file.status,
        pi_id: prodPiId,
        sponsor_id: prodSponsorId,
        cayuse: file.cayuse || '',
        date_received: file.date_received || null,
        date_status_change: file.date_status_change || null,
        notes: file.notes || '',
        to_set_up: file.to_set_up || '',
        external_link: file.external_link || '',
      });
      count++;
      console.log(`   ✅ ${file.db_no}`);
    } catch (error) {
      console.error(`   ❌ ${file.db_no}: ${error.message}`);
    }
  }

  console.log(`\n✅ Imported ${count}/${pendingFiles.length} files\n`);
}

migrate();
