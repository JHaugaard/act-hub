# Phase 1: Local PocketBase Setup Guide

This guide walks you through setting up PocketBase locally with Docker on your machine, importing all data from your production CSV files, and testing the application locally.

**Estimated Time: ~40 minutes**

---

## Prerequisites

- Docker and Docker Compose installed on your machine
- External drive mounted at: `/Volumes/dev/development/act-hub/pocketbase-data`
- Node.js and npm installed
- CSV data files in `data-for-importing/` directory:
  - `pis.csv`
  - `sponsors.csv`
  - `files.csv`

---

## Step 1: Start PocketBase Container

The PocketBase Docker container will run a complete PocketBase instance with all data stored on your external drive.

```bash
# Start PocketBase in the background
docker-compose -f docker-compose.local.yml up -d

# Verify it's running
docker-compose -f docker-compose.local.yml logs pocketbase

# You should see something like:
# ✅ PocketBase started on http://localhost:8090
```

**What's happening:**
- PocketBase runs on port `8090` (API)
- Admin UI is on port `8091` (for manual data inspection)
- All data persists to your external drive at the path you specified
- Initial admin user: `admin@local.test` / `admin123456`

---

## Step 2: Create the Database Schema

The schema defines the structure of your collections (tables). This creates the same structure you had in Supabase.

```bash
# Create collections and fields
node scripts/setup-pocketbase-schema.js

# Output should show:
# ✅ PIs collection created
# ✅ Sponsors collection created
# ✅ Files collection created
# ✅ File Attachments collection created
```

**What's happening:**
- Creates 4 collections: `pis`, `sponsors`, `files`, `file_attachments`
- Sets up fields to match your Supabase schema
- Establishes relationships between collections

**Verify in Admin UI:**
- Open http://localhost:8091 in your browser
- Login with `admin@local.test` / `admin123456`
- You should see the 4 collections created

---

## Step 3: Import Data from CSV Files

This script reads your production CSV files and imports them into PocketBase.

```bash
# Import CSV data into PocketBase
node scripts/import-csv-to-pocketbase.js

# Output should show:
# 📥 Importing PIs...
# ✅ Imported 504 PIs
#
# 📥 Importing Sponsors...
# ✅ Imported 526 Sponsors
#
# 📥 Importing Files (Proposals)...
# ✅ Imported 1126 Files
# ✅ CSV import complete!
```

**What's happening:**
- Reads all three CSV files from `data-for-importing/`
- Creates PI records from `pis.csv`
- Creates Sponsor records from `sponsors.csv`
- Creates File records from `files.csv` with proper relationships
- Handles missing/empty fields gracefully
- Generates PocketBase IDs and maintains relationships

**Verify in Admin UI:**
- Refresh http://localhost:8091
- Click into "files" collection
- You should see all 1126+ proposals with their data
- Click "pis" collection - should see 504 PIs
- Click "sponsors" collection - should see 526 sponsors

---

## Step 4: Update Application Configuration

Tell the app to use PocketBase instead of Supabase for data.

```bash
# Edit .env
# Change/add these lines:
VITE_DATA_SOURCE="pocketbase"
VITE_POCKETBASE_URL="http://localhost:8090"

# Save and restart dev server
npm run dev
```

**Watch the console output:**
```
🔧 Data Source: POCKETBASE
```

If you see `POCKETBASE` in the browser console, you're connected!

---

## Step 5: Test the Application

Now test all the features of the app with your real production data in PocketBase.

**What to test:**

1. **Proposals Page** (`/proposals`)
   - ✅ Can see all 36 proposals
   - ✅ Filtering works (by status)
   - ✅ Search works (by db_no, PI name, sponsor name)
   - ✅ Sorting works
   - ✅ Can click a proposal and view details

2. **Proposal Details** (`/proposals/:id`)
   - ✅ Can view proposal details
   - ✅ Can see related proposals (by same PI or sponsor)
   - ✅ Can see attachments (if any)
   - ✅ Can update status (and see it save)

3. **PIs Page** (`/pis`)
   - ✅ Can see all 12 PIs
   - ✅ Can create new PI

4. **Sponsors Page** (`/sponsors`)
   - ✅ Can see all 14 sponsors
   - ✅ Can create new sponsor

5. **Dashboard** (`/`)
   - ✅ Statistics show correct counts
   - ✅ Status breakdown chart displays correctly

6. **DB Distiller** (`/distiller`)
   - ✅ Can upload Excel files
   - ✅ Can filter and export

**If you encounter errors:**
- Check browser console for error messages
- Check that PocketBase is running: `docker-compose -f docker-compose.local.yml ps`
- Check PocketBase logs: `docker-compose -f docker-compose.local.yml logs -f pocketbase`
- Verify data in admin UI: http://localhost:8091

---

## Troubleshooting

### PocketBase not responding
```bash
# Check if container is running
docker-compose -f docker-compose.local.yml ps

# View logs
docker-compose -f docker-compose.local.yml logs pocketbase

# Restart container
docker-compose -f docker-compose.local.yml restart pocketbase
```

### Data not imported
```bash
# Verify CSV files exist
ls -la data-for-importing/

# Check admin UI to see what data is there
# http://localhost:8091

# Verify schema was created (collections should exist)
# If not, run: node scripts/setup-pocketbase-schema.js

# Try import again
node scripts/import-csv-to-pocketbase.js

# Check import logs for errors
```

### App not connecting to PocketBase
```bash
# Verify PocketBase is accessible
curl http://localhost:8090/api/health

# Should return: {"code":200,"message":"."}

# Check .env has correct settings
cat .env | grep -E "VITE_DATA_SOURCE|VITE_POCKETBASE_URL"

# Restart dev server
npm run dev
```

### View external drive data
```bash
# See what PocketBase stored on external drive
ls -la /Volumes/dev/development/act-hub/pocketbase-data/

# You'll see:
# - pb.db (SQLite database file)
# - pb_public/ (uploaded files directory)
# - migrations/ (schema migrations)
```

---

## Next Steps

Once Phase 1 is complete and tested locally:

1. **Phase 2: VPS Preparation** - Set up Hostinger VPS with Docker and Nginx
2. **Phase 3: Production Deployment** - Deploy containers to VPS
3. **Phase 4: Cutover** - Point domain to VPS and go live

---

## Quick Reference Commands

```bash
# Start PocketBase
docker-compose -f docker-compose.local.yml up -d

# View logs
docker-compose -f docker-compose.local.yml logs -f pocketbase

# Stop PocketBase
docker-compose -f docker-compose.local.yml down

# Create schema
node scripts/setup-pocketbase-schema.js

# Import CSV data to PocketBase
node scripts/import-csv-to-pocketbase.js

# Start dev server
npm run dev

# Access admin UI
# http://localhost:8091 (admin@local.test / admin123456)

# Access PocketBase API
# http://localhost:8090

# Verify CSV files ready
ls -la data-for-importing/

# View external drive data
ls -la /Volumes/dev/development/act-hub/pocketbase-data/
```

---

## Getting Help

If you get stuck:
1. Check the troubleshooting section above
2. Review the console output carefully for error messages
3. Check PocketBase admin UI to verify data is there
4. Check Docker logs to see what's happening server-side

You've got this! 🚀
