# CSV Import Guide

## Overview

Phase 1 now uses production data directly from CSV files instead of exporting from Supabase. This is faster, more reliable, and eliminates cloud dependencies.

---

## The Three CSV Files

### 1. `data-for-importing/pis.csv`
**Principal Investigators**
- 504 records
- Columns: `name`, `db_no`
- Example:
  ```
  name,db_no
  Abbas, Houssam,DB 1858
  Abbasi, Bahman,DB 1406
  ```

### 2. `data-for-importing/sponsors.csv`
**Sponsors/Funding Organizations**
- 526 records
- Columns: `sponsor`, `db_no`
- Example:
  ```
  sponsor,db_no
  ACT, Inc.,DB 2784
  AHCA/NCAL Solutions LLC,DB 3860
  ```

### 3. `data-for-importing/files.csv`
**Proposals/Files**
- 1126 records
- Columns: `db_no`, `status`, `pi_name`, `sponsor_name`, `cayuse`, `date_received`, `date_status_change`, `notes`, `to_set_up`, `external_link`
- Example:
  ```
  db_no,status,pi_name,sponsor_name,cayuse,date_received,date_status_change,notes,to_set_up,external_link
  DB 10,Done,"Mignot, Guillaume",Several,,2020-12-29,2022-10-31,"(Prev DB 2251) Master Agreement...",2022-10-31,
  ```

---

## How The Import Works

### Step 1: Script reads all three CSVs
```
data-for-importing/pis.csv
data-for-importing/sponsors.csv
data-for-importing/files.csv
```

### Step 2: Create PIs in PocketBase
- Parses each row from `pis.csv`
- Extracts `name` field
- Creates PI record with auto-generated ID
- Stores name → ID mapping for later relationship linking

### Step 3: Create Sponsors in PocketBase
- Parses each row from `sponsors.csv`
- Extracts `sponsor` field (renamed to `name`)
- Creates Sponsor record with auto-generated ID
- Stores name → ID mapping

### Step 4: Create Files with Relationships
- Parses each row from `files.csv`
- Looks up PI ID using `pi_name` (from mapping created in Step 2)
- Looks up Sponsor ID using `sponsor_name` (from mapping created in Step 3)
- Creates File record with `pi_id` and `sponsor_id` relationships

### Step 5: Handle Data Cleaning
- Trims whitespace
- Removes surrounding quotes from fields
- Converts empty strings to null
- Parses dates (handles various formats)
- Skips records with missing required fields

---

## Running the Import

```bash
# Make sure PocketBase is running
docker-compose -f docker-compose.local.yml up -d

# Make sure schema exists
node scripts/setup-pocketbase-schema.js

# Import CSV data
node scripts/import-csv-to-pocketbase.js
```

### Expected Output
```
🚀 Starting PocketBase CSV import from http://localhost:8090...

🔐 Authenticating with PocketBase...
✅ Authenticated

📥 Importing PIs...
✅ Imported 504 PIs

📥 Importing Sponsors...
✅ Imported 526 Sponsors

📥 Importing Files (Proposals)...
✅ Imported 1126 Files (0 skipped due to missing data)

✅ CSV import complete!

📊 Summary:
   - PIs: 504
   - Sponsors: 526
   - Files: 1126
   - Skipped: 0
```

---

## Data Quality Notes

### CSV Parsing
- Handles quoted fields with commas inside
- Removes BOM (Byte Order Mark) if present
- Properly handles escaped quotes

### Date Parsing
- Accepts ISO format (YYYY-MM-DD)
- Accepts various date formats
- Returns null for unparseable dates
- Converts to ISO 8601 format for storage

### Null/Empty Handling
- Empty strings → null
- "null" string → null
- Missing fields → null
- Required fields: `db_no`, `pi_name`, `sponsor_name` (files) and `name` (pis/sponsors)

### Relationships
- Files are linked to PIs by matching `pi_name` with PI `name`
- Files are linked to Sponsors by matching `sponsor_name` with Sponsor `name`
- If PI or Sponsor not found, file is skipped with warning

---

## Verifying the Import

### In PocketBase Admin UI
```
http://localhost:8091
Login: admin@local.test / admin123456
```

1. Click "pis" collection → should see 504 records
2. Click "sponsors" collection → should see 526 records
3. Click "files" collection → should see 1126 records
4. Click a file record → verify `pi_id` and `sponsor_id` are populated

### Via API
```bash
# Count files
curl http://localhost:8090/api/collections/files/records

# Query a file with relationships
curl http://localhost:8090/api/collections/files/records?expand=pi_id,sponsor_id
```

### Check External Drive
```bash
ls -la /Volumes/dev/development/act-hub/pocketbase-data/

# You'll see:
# pb.db (SQLite database with all data)
# pb_public/ (file attachments directory)
```

---

## If Import Fails

### CSV files not found
```bash
ls -la data-for-importing/
# Should show: files.csv, pis.csv, sponsors.csv
```

### PocketBase not running
```bash
docker-compose -f docker-compose.local.yml ps
# Should show pocketbase container running

# If not, start it:
docker-compose -f docker-compose.local.yml up -d
```

### Schema not created
```bash
# Re-run schema setup
node scripts/setup-pocketbase-schema.js

# Verify in admin UI - collections should exist
```

### Authentication failed
```bash
# Verify PocketBase admin credentials are correct
# Default: admin@local.test / admin123456

# If changed, update in import script or reset PocketBase
docker-compose -f docker-compose.local.yml down
rm -rf /Volumes/dev/development/act-hub/pocketbase-data/*
docker-compose -f docker-compose.local.yml up -d
```

### Partial import completed
```bash
# The script shows skipped counts
# Check logs for which records were skipped and why

# Common reasons:
# - PI name not found in pis.csv
# - Sponsor name not found in sponsors.csv
# - Missing required field (db_no, pi_name, sponsor_name)
```

---

## Data Flow Diagram

```
data-for-importing/pis.csv
          ↓
    Parse CSV rows
          ↓
    Extract PI names
          ↓
   Create PocketBase PI records
          ↓
    Store name → ID mapping
          ↓


data-for-importing/sponsors.csv
          ↓
    Parse CSV rows
          ↓
    Extract Sponsor names
          ↓
   Create PocketBase Sponsor records
          ↓
    Store name → ID mapping
          ↓


data-for-importing/files.csv
          ↓
    Parse CSV rows
          ↓
    For each file:
    - Look up PI ID from mapping
    - Look up Sponsor ID from mapping
    - Create File record with relationships
          ↓
   All data in PocketBase ✅
```

---

## Advantages Over Supabase Export

| Aspect | CSV | Supabase Export |
|--------|-----|-----------------|
| **Data Source** | Cleaned production CSVs | Test data from cloud |
| **Dependencies** | None (local files) | Requires cloud connectivity |
| **Speed** | ~5 minutes | Slower (API calls) |
| **Reliability** | Always works | Depends on service availability |
| **Data Control** | You own it | External service |
| **Version Control** | CSVs in repo | Not tracked |
| **Reproducibility** | Always same result | May vary |

---

## For Your Learning

Understanding this import helps you learn:
- CSV parsing and data transformation
- Handling relationships in databases
- Data validation and error handling
- PocketBase API usage
- Database integrity (matching foreign keys)

Feel free to inspect the script: `scripts/import-csv-to-pocketbase.js`

---

## Next Steps

1. **Run Phase 1:** Follow `PHASE1-QUICKSTART.txt`
2. **Verify data:** Check admin UI and test features
3. **Proceed to Phase 2:** VPS preparation

You're ready! 🚀
