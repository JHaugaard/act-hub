# PocketBase Migration - Phase 1 Quick Start Checklist

## Prepare (5 mins)

- [ ] Verify external drive is mounted:
  ```bash
  ls /Volumes/990-Pro-2TB/development/proposal-tracker/
  ```

- [ ] Verify Docker is running:
  ```bash
  docker --version && docker-compose --version
  ```

- [ ] Verify you're in project directory:
  ```bash
  cd /Users/john/Documents/dev-top/proposal_tracker_2
  ```

## Step 1: Start PocketBase (5 mins)

- [ ] Start container:
  ```bash
  docker-compose -f docker-compose.local.yml up -d
  ```

- [ ] Verify running:
  ```bash
  docker-compose -f docker-compose.local.yml logs pocketbase
  ```
  Look for: "Server started at" message

- [ ] Test API:
  ```bash
  curl http://localhost:8090/api/health
  ```
  Should return: `{"code":200,"message":"."}`

- [ ] Open admin UI:
  - URL: http://localhost:8091
  - Login: admin@local.test / admin123456
  - You should see empty PocketBase interface

## Step 2: Create Schema (3 mins)

- [ ] Run schema setup:
  ```bash
  node scripts/setup-pocketbase-schema.js
  ```

- [ ] Verify output shows:
  - ✅ PIs collection created
  - ✅ Sponsors collection created
  - ✅ Files collection created
  - ✅ File Attachments collection created

- [ ] Refresh admin UI:
  - URL: http://localhost:8091
  - You should see 4 collections in sidebar

## Step 3: Import CSV Data (2 mins)

- [ ] Import from CSV files:
  ```bash
  node scripts/import-csv-to-pocketbase.js
  ```

- [ ] Wait for completion, verify output shows:
  - ✅ Importing PIs...
  - ✅ Importing Sponsors...
  - ✅ Importing Files (Proposals)...
  - ✅ CSV import complete!

- [ ] Check summary shows correct counts:
  - PIs: ~505
  - Sponsors: ~527
  - Files: ~1,125

- [ ] Verify in admin UI:
  - Visit http://localhost:8091
  - Click "files" collection
  - Should see all proposals listed
  - Click a file, see all fields populated

## Step 4: Switch App to PocketBase (2 mins)

- [ ] Edit .env file:
  ```bash
  nano .env
  ```

  Change this line:
  ```
  VITE_USE_MOCK_DATA="true"
  ```

  To these lines:
  ```
  VITE_DATA_SOURCE="pocketbase"
  VITE_POCKETBASE_URL="http://localhost:8090"
  ```

  Save: Ctrl+X, then Y, then Enter

- [ ] Verify .env changed:
  ```bash
  grep VITE_DATA_SOURCE .env
  ```

- [ ] Restart dev server:
  ```bash
  npm run dev
  ```

- [ ] Watch console output:
  Should see: `🔧 Data Source: POCKETBASE`

## Step 5: Test Application (20 mins)

In browser at http://localhost:3000:

- [ ] **Dashboard page:**
  - Shows proposal count (should be ~1,125)
  - Status breakdown displays
  - Recent proposals list shows

- [ ] **Proposals page:**
  - See all proposals listed
  - Search works (try searching for a PI name)
  - Filter by status works
  - Sorting works
  - Click a proposal to view details

- [ ] **Proposal details page:**
  - See all proposal fields
  - Status can be changed and saves
  - See related proposals
  - See attachments (if any)

- [ ] **PIs page:**
  - See ~505 PIs listed
  - Can create new PI

- [ ] **Sponsors page:**
  - See ~527 sponsors listed
  - Can create new sponsor

- [ ] **DB Distiller page:**
  - Can upload Excel files
  - Processing works

**If all tests pass ✅ → PHASE 1 COMPLETE!**

## Troubleshooting

If something fails:

1. **Check PocketBase logs:**
   ```bash
   docker-compose -f docker-compose.local.yml logs -f pocketbase
   ```

2. **Verify it's running:**
   ```bash
   docker-compose -f docker-compose.local.yml ps
   ```

3. **Check data in admin UI:**
   - URL: http://localhost:8091
   - Login: admin@local.test / admin123456

4. **Check external drive:**
   ```bash
   ls -la /Volumes/990-Pro-2TB/development/proposal-tracker/pocketbase-data/
   ```

5. **View browser console errors:**
   Chrome/Firefox DevTools → Console tab

For detailed help, see [phase1-setup.md](phase1-setup.md)

## Cleanup (if you need to start over)

- [ ] Stop containers:
  ```bash
  docker-compose -f docker-compose.local.yml down
  ```

- [ ] Clear data (WARNING: Deletes all imported data):
  ```bash
  rm -rf /Volumes/990-Pro-2TB/development/proposal-tracker/pocketbase-data/*
  ```

- [ ] Then start over from Step 1

---

**Total Time:** ~35 minutes
**Success:** See all production data (from CSVs) now running in local PocketBase!
