#!/usr/bin/env node

/**
 * Create collections in PocketBase with simplified schema
 */

const POCKETBASE_URL = 'http://localhost:8090';
const ADMIN_EMAIL = 'admin@local.test';
const ADMIN_PASSWORD = 'admin123456';

async function createCollections() {
  console.log('\n🚀 Creating PocketBase collections...\n');

  try {
    // Get auth token
    console.log('🔐 Authenticating...');
    const authRes = await fetch(`${POCKETBASE_URL}/api/admins/auth-with-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identity: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
      }),
    });

    if (!authRes.ok) {
      throw new Error(`Auth failed: ${authRes.statusText}`);
    }

    const { token } = await authRes.json();
    console.log('✅ Authenticated\n');

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };

    // Create PIs collection
    console.log('📝 Creating pis collection...');
    let res = await fetch(`${POCKETBASE_URL}/api/collections`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: 'pis',
        type: 'base',
        schema: [
          {
            name: 'name',
            type: 'text',
            required: true,
          },
        ],
      }),
    });
    if (res.ok) {
      console.log('✅ pis collection created\n');
    } else if (res.status === 400) {
      const error = await res.json();
      if (error.message?.includes('exists')) {
        console.log('⚠️  pis collection already exists\n');
      } else {
        throw new Error(`Failed to create pis: ${error.message}`);
      }
    } else {
      throw new Error(`Failed to create pis: ${res.statusText}`);
    }

    // Create sponsors collection
    console.log('📝 Creating sponsors collection...');
    res = await fetch(`${POCKETBASE_URL}/api/collections`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: 'sponsors',
        type: 'base',
        schema: [
          {
            name: 'name',
            type: 'text',
            required: true,
          },
        ],
      }),
    });
    if (res.ok) {
      console.log('✅ sponsors collection created\n');
    } else if (res.status === 400) {
      const error = await res.json();
      if (error.message?.includes('exists')) {
        console.log('⚠️  sponsors collection already exists\n');
      } else {
        throw new Error(`Failed to create sponsors: ${error.message}`);
      }
    } else {
      throw new Error(`Failed to create sponsors: ${res.statusText}`);
    }

    // Create files collection (without relations first - we'll add them after)
    console.log('📝 Creating files collection...');
    res = await fetch(`${POCKETBASE_URL}/api/collections`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: 'files',
        type: 'base',
        schema: [
          { name: 'db_no', type: 'text', required: true },
          { name: 'status', type: 'text', required: true },
          { name: 'pi_name', type: 'text', required: true },
          { name: 'sponsor_name', type: 'text', required: true },
          { name: 'cayuse', type: 'text' },
          { name: 'date_received', type: 'date' },
          { name: 'date_status_change', type: 'date' },
          { name: 'notes', type: 'text' },
          { name: 'to_set_up', type: 'text' },
          { name: 'external_link', type: 'text' },
          { name: 'pi_id', type: 'text', required: true },
          { name: 'sponsor_id', type: 'text', required: true },
        ],
      }),
    });
    if (res.ok) {
      console.log('✅ files collection created\n');
    } else if (res.status === 400) {
      const error = await res.json();
      if (error.message?.includes('exists')) {
        console.log('⚠️  files collection already exists\n');
      } else {
        throw new Error(`Failed to create files: ${error.message}`);
      }
    } else {
      throw new Error(`Failed to create files: ${res.statusText}`);
    }

    // Create file_attachments collection
    console.log('📝 Creating file_attachments collection...');
    res = await fetch(`${POCKETBASE_URL}/api/collections`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: 'file_attachments',
        type: 'base',
        schema: [
          { name: 'file_id', type: 'text', required: true },
          { name: 'filename', type: 'text', required: true },
          { name: 'file_path', type: 'text', required: true },
          { name: 'file_size', type: 'number', required: true },
        ],
      }),
    });
    if (res.ok) {
      console.log('✅ file_attachments collection created\n');
    } else if (res.status === 400) {
      const error = await res.json();
      if (error.message?.includes('exists')) {
        console.log('⚠️  file_attachments collection already exists\n');
      } else {
        throw new Error(`Failed to create file_attachments: ${error.message}`);
      }
    } else {
      throw new Error(`Failed to create file_attachments: ${res.statusText}`);
    }

    console.log('✅ All collections created successfully!\n');
    console.log('Next step: node scripts/import-csv-to-pocketbase.js\n');

  } catch (error) {
    console.error('❌ Failed:', error.message);
    process.exit(1);
  }
}

createCollections();
