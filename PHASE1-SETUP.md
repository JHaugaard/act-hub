# Phase 1: Local PocketBase Setup Guide

This guide walks you through setting up PocketBase locally with Docker on your machine, migrating all data from your Lovable Supabase instance, and testing the application locally.

**Estimated Time: 2-3 hours**

---

## Prerequisites

- Docker and Docker Compose installed on your machine
- External drive mounted at: `/Volumes/990-Pro-2TB/development/proposal-tracker/pocketbase-data`
- Node.js and npm installed
- Your `.env` file with valid Supabase credentials (for data export)

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

## Step 3: Export Your Lovable Supabase Data

This script pulls ALL your production data from your Lovable Supabase instance.

```bash
# Export all data from Supabase
node scripts/export-supabase-data.js

# Output should show:
# 📥 Exporting PIs... ✅ Exported 12 PIs
# 📥 Exporting Sponsors... ✅ Exported 14 Sponsors
# 📥 Exporting Files... ✅ Exported 36 Files
# 📥 Exporting File Attachments... ✅ Exported X Attachments
# ✅ Export complete!
# 📁 Data saved to: data-exports/supabase-export-TIMESTAMP.json
```

**What's happening:**
- Connects to your live Supabase using credentials in `.env`
- Fetches all records from each table
- Saves as a JSON file for importing into PocketBase
- The export file is timestamped and saved in `data-exports/`

**Check the export:**
```bash
# See the most recent export file
ls -lah data-exports/ | head -5
cat data-exports/supabase-export-*.json | head -20
```

---

## Step 4: Import Data into PocketBase

This script takes the exported JSON data and imports it into your local PocketBase instance.

```bash
# Import the data (will auto-find the most recent export)
node scripts/import-to-pocketbase.js

# Output should show:
# 📥 Importing 12 PIs... ✅ Imported PIs
# 📥 Importing 14 Sponsors... ✅ Imported Sponsors
# 📥 Importing 36 Files... ✅ Imported Files
# 📥 Importing X Attachments... ✅ Imported File Attachments
# ✅ Import complete!
```

**What's happening:**
- Authenticates with PocketBase admin user
- Inserts all records from the JSON export
- Skips duplicate records (uses IDs from Supabase)
- Creates the full mirror of your production data locally

**Verify in Admin UI:**
- Refresh http://localhost:8091
- Click into "files" collection
- You should see all 36 proposals with their data

---

## Step 5: Update Application Configuration

Tell the app to use PocketBase instead of Supabase for data.

```bash
# Edit .env
# Change this line:
# VITE_USE_MOCK_DATA="true"

# To this:
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

## Step 6: Test the Application

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
# Verify export file exists
ls -la data-exports/

# Check admin UI to see what data is there
# http://localhost:8091

# Try importing specific file
node scripts/import-to-pocketbase.js data-exports/supabase-export-YOUR-FILENAME.json
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
ls -la /Volumes/990-Pro-2TB/development/proposal-tracker/pocketbase-data/

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

# Export Supabase data
node scripts/export-supabase-data.js

# Import to PocketBase
node scripts/import-to-pocketbase.js

# Start dev server
npm run dev

# Access admin UI
# http://localhost:8091 (admin@local.test / admin123456)

# Access PocketBase API
# http://localhost:8090

# View external drive data
ls -la /Volumes/990-Pro-2TB/development/proposal-tracker/pocketbase-data/
```

---

## Getting Help

If you get stuck:
1. Check the troubleshooting section above
2. Review the console output carefully for error messages
3. Check PocketBase admin UI to verify data is there
4. Check Docker logs to see what's happening server-side

You've got this! 🚀
