# Scripts Reference Guide

## Overview

This document describes all utility scripts available in the [scripts/](../scripts/) directory. Scripts are organized by purpose into subdirectories.

## Directory Structure

```
scripts/
├── setup/          # One-time setup scripts
├── data/           # Data import/export scripts
└── utils/          # Development utilities
```

---

## Setup Scripts

Scripts for initial PocketBase configuration. Run these once during setup.

### `setup/setup-pocketbase-schema.js`

**Purpose:** Creates all required PocketBase collections with proper schemas and relationships.

**Usage:**
```bash
node scripts/setup/setup-pocketbase-schema.js
```

**What it does:**
1. Connects to PocketBase at `VITE_POCKETBASE_URL`
2. Creates 4 collections:
   - `pis` - Principal Investigators
   - `sponsors` - Funding sponsors
   - `files` - Proposal/file records
   - `file_attachments` - File attachments
3. Configures all fields, types, and relationships
4. Sets up validation rules

**Prerequisites:**
- PocketBase container must be running
- `.env` file with `VITE_POCKETBASE_URL` configured

**Output:**
```
✅ PIs collection created
✅ Sponsors collection created
✅ Files collection created
✅ File Attachments collection created
Schema setup complete!
```

**When to use:**
- First-time PocketBase setup
- After clearing all collections
- After major schema changes

---

### `setup/create-collections.js`

**Purpose:** Alternative collection creation script (older version).

**Usage:**
```bash
node scripts/setup/create-collections.js
```

**Note:** `setup-pocketbase-schema.js` is the preferred script as it includes more complete schema definitions.

---

## Data Scripts

Scripts for importing and exporting data between systems.

### `data/import-csv-to-pocketbase.js`

**Purpose:** Imports data from CSV files into PocketBase collections.

**Usage:**
```bash
node scripts/data/import-csv-to-pocketbase.js
```

**What it does:**
1. Reads CSV files from [data-for-importing/](../data-for-importing/):
   - `pis.csv`
   - `sponsors.csv`
   - `files.csv`
2. Transforms data to match PocketBase schema
3. Imports records in order (PIs → Sponsors → Files)
4. Handles relationships and references
5. Shows progress and final counts

**Expected CSV structure:**

**pis.csv:**
```csv
id,name,email,phone,institution,created_at
```

**sponsors.csv:**
```csv
id,name,contact_email,phone,website,created_at
```

**files.csv:**
```csv
id,title,description,status,pi_id,sponsor_id,created_at,updated_at
```

**Output:**
```
📊 Importing PIs...
✅ Imported 505 PIs

📊 Importing Sponsors...
✅ Imported 527 Sponsors

📊 Importing Files (Proposals)...
✅ Imported 1,125 Files

🎉 CSV import complete!
```

**Prerequisites:**
- PocketBase container running
- Schema created (run `setup-pocketbase-schema.js` first)
- CSV files in [data-for-importing/](../data-for-importing/)

**Troubleshooting:**
- If import fails partway, run `utils/delete-collections.js` and start over
- Check CSV encoding (must be UTF-8)
- Verify CSV headers match expected format

---

### `data/import-to-pocketbase.js`

**Purpose:** Imports data from Supabase export JSON files.

**Usage:**
```bash
node scripts/data/import-to-pocketbase.js
```

**Note:** This script is for migrating from Supabase. If you have CSV files, use `import-csv-to-pocketbase.js` instead.

**What it does:**
1. Reads JSON export from [data-exports/](../data-exports/)
2. Transforms Supabase schema to PocketBase schema
3. Imports all records and relationships

**When to use:**
- Migrating from Supabase to PocketBase
- Have existing Supabase export JSON

---

### `data/export-supabase-data.js`

**Purpose:** Exports data from Supabase to JSON files.

**Usage:**
```bash
node scripts/data/export-supabase-data.js
```

**What it does:**
1. Connects to Supabase using credentials from `.env`
2. Fetches all records from `files`, `pis`, `sponsors` tables
3. Saves to `data-exports/supabase-export-TIMESTAMP.json`

**Prerequisites:**
- `.env` with Supabase credentials:
  ```bash
  VITE_SUPABASE_URL="..."
  VITE_SUPABASE_PUBLISHABLE_KEY="..."
  ```

**Output:**
```
📊 Exporting from Supabase...
✅ Exported 36 files
✅ Exported 12 PIs
✅ Exported 14 sponsors
📁 Saved to: data-exports/supabase-export-20231102-143045.json
```

---

## Utility Scripts

Development and maintenance utilities.

### `utils/list-collections.js`

**Purpose:** Lists all collections and their record counts.

**Usage:**
```bash
node scripts/utils/list-collections.js
```

**Output:**
```
📊 PocketBase Collections:

Collection: pis
  Records: 505
  Fields: id, name, email, phone, institution

Collection: sponsors
  Records: 527
  Fields: id, name, contact_email, phone, website

Collection: files
  Records: 1125
  Fields: id, title, status, pi_id, sponsor_id, ...
```

**When to use:**
- Verify data was imported correctly
- Check collection schemas
- Debug data issues

---

### `utils/delete-collections.js`

**Purpose:** Deletes all records from all collections (does NOT delete the collections themselves).

**Usage:**
```bash
node scripts/utils/delete-collections.js
```

**⚠️ Warning:** This permanently deletes all data!

**What it does:**
1. Lists all collections
2. Deletes all records from each collection
3. Keeps the collection schemas intact

**Output:**
```
⚠️  WARNING: This will delete all records from all collections!
Press Ctrl+C to cancel...

Deleting records from: pis
✅ Deleted 505 records from pis

Deleting records from: sponsors
✅ Deleted 527 records from sponsors

...
```

**When to use:**
- Before re-importing data
- Testing import scripts
- Resetting to clean state

**Note:** To also delete the collection schemas, use the PocketBase admin UI.

---

### `utils/test-files-collection.js`

**Purpose:** Tests the files collection by querying and displaying sample data.

**Usage:**
```bash
node scripts/utils/test-files-collection.js
```

**What it does:**
1. Queries the `files` collection
2. Displays first 5 records with all fields
3. Shows relationships (PI and Sponsor data)

**When to use:**
- Verify import worked correctly
- Debug query issues
- Check field values

---

### `utils/test-select-field.js`

**Purpose:** Tests specific select field values and enums.

**Usage:**
```bash
node scripts/utils/test-select-field.js
```

**What it does:**
- Queries specific field configurations
- Validates enum values
- Tests field constraints

**When to use:**
- Debugging select/dropdown fields
- Verifying schema validation

---

## Common Workflows

### Initial Setup (Fresh Install)

```bash
# 1. Start PocketBase
docker-compose -f docker-compose.local.yml up -d

# 2. Create schema
node scripts/setup/setup-pocketbase-schema.js

# 3. Import data
node scripts/data/import-csv-to-pocketbase.js

# 4. Verify
node scripts/utils/list-collections.js
```

---

### Reset and Re-import Data

```bash
# 1. Clear all records
node scripts/utils/delete-collections.js

# 2. Re-import
node scripts/data/import-csv-to-pocketbase.js

# 3. Verify
node scripts/utils/list-collections.js
```

---

### Migrate from Supabase

```bash
# 1. Export from Supabase
node scripts/data/export-supabase-data.js

# 2. Create PocketBase schema
node scripts/setup/setup-pocketbase-schema.js

# 3. Import to PocketBase
node scripts/data/import-to-pocketbase.js
```

---

## Environment Variables

All scripts use these environment variables from [.env](../.env):

```bash
# PocketBase
VITE_POCKETBASE_URL="http://localhost:8090"

# Supabase (for export script only)
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="your-key"
```

## Error Handling

### "Connection refused" / "ECONNREFUSED"

**Problem:** PocketBase is not running

**Solution:**
```bash
docker-compose -f docker-compose.local.yml up -d
```

---

### "Collection not found"

**Problem:** Schema not created

**Solution:**
```bash
node scripts/setup/setup-pocketbase-schema.js
```

---

### "Invalid credentials" (Supabase)

**Problem:** Missing or incorrect Supabase credentials

**Solution:** Check `.env` file has correct `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`

---

### "Cannot read property 'csv'"

**Problem:** CSV files missing

**Solution:** Ensure CSV files exist in [data-for-importing/](../data-for-importing/):
```bash
ls data-for-importing/
# Should show: pis.csv, sponsors.csv, files.csv
```

---

## Script Development

### Adding New Scripts

1. **Determine category:**
   - `setup/` - One-time configuration
   - `data/` - Import/export operations
   - `utils/` - Development tools

2. **Create script file:**
   ```bash
   touch scripts/category/your-script.js
   ```

3. **Use consistent patterns:**
   ```javascript
   import PocketBase from 'pocketbase';

   const pb = new PocketBase(process.env.VITE_POCKETBASE_URL);

   async function main() {
     try {
       // Your logic here
       console.log('✅ Success');
     } catch (error) {
       console.error('❌ Error:', error.message);
       process.exit(1);
     }
   }

   main();
   ```

4. **Document in this file** - Add description above

---

## See Also

- [Phase 1 Setup Guide](phase1-setup.md) - Full setup instructions
- [Phase 1 Quickstart](phase1-quickstart.md) - Quick setup checklist
- [Deployment Guide](deployment.md) - Production deployment
