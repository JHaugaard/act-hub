# 🔄 ACT Hub Portable SSD Workflow

saved as: /Volumes/dev/develop/act-hub/portable-ssd-workflow.md

## 📥 **Attaching SSD & Starting Up**

### On a New Machine (or after restart):

```bash
# 1. Verify SSD is mounted
ls -la /Volumes/dev/develop/act-hub/

# 2. Navigate to project directory
cd /Volumes/dev/develop/act-hub

# 3. Verify Docker Desktop is running
docker ps

# 4. Start PocketBase container
docker-compose -f docker-compose.local.yml up -d

# 5. Wait for PocketBase to be healthy (optional but recommended)
sleep 5

# 6. Verify PocketBase is running
docker ps | grep act_hub
# Should show "Up" status, not "Restarting"

# 7. (Optional) Check PocketBase health
curl http://127.0.0.1:8090/api/health
# Should return: {"message":"API is healthy."...}

# 8. Start development server
npm run dev

# 9. Open browser to the URL shown (usually http://localhost:8080 or :8081)
```

### Quick Start (if everything was working before):
```bash
cd /Volumes/dev/develop/act-hub
docker-compose -f docker-compose.local.yml up -d && npm run dev
```

---

## 📤 **Shutting Down & Detaching SSD**

### Before Ejecting the SSD:

```bash
# 1. Stop the dev server
# Press Ctrl+C in the terminal running npm run dev

# 2. Stop the PocketBase container
docker-compose -f docker-compose.local.yml down

# 3. (Optional) Verify container is stopped
docker ps | grep act_hub
# Should return nothing

# 4. Wait a moment for any file writes to complete
sleep 2

# 5. Now safe to eject the SSD from macOS Finder or:
diskutil eject /Volumes/dev
```

### Quick Shutdown:
```bash
# Stop dev server with Ctrl+C, then:
docker-compose -f docker-compose.local.yml down
# Wait 2 seconds, then eject SSD
```

---

## 🔍 **Troubleshooting Commands**

### Check PocketBase Status:
```bash
# See if container is running
docker ps | grep act_hub

# View recent logs
docker logs act_hub_pocketbase_local --tail 50

# Check if PocketBase API is responding
curl http://127.0.0.1:8090/api/health
```

### Check Data:
```bash
# Verify database exists on SSD
ls -lh /Volumes/dev/develop/act-hub/pocketbase-data/data.db

# Count records in PocketBase
curl -s 'http://127.0.0.1:8090/api/collections/files/records?perPage=1' | grep totalItems
```

### Clear Caches (if seeing old/stale data):
```bash
# Clear Vite cache
rm -rf node_modules/.vite

# Clear build artifacts
rm -rf dist
```

### Restart Everything:
```bash
# Stop everything
docker-compose -f docker-compose.local.yml down

# Start fresh
docker-compose -f docker-compose.local.yml up -d
sleep 5
npm run dev
```

---

## 🆘 **Common Issues & Solutions**

### Issue: "No data showing in app"
**Solution:**
```bash
# Check if collections have public access
curl -s 'http://127.0.0.1:8090/api/collections/files/records?perPage=1'
# If you get 403 error, collections need public access rules set
```

### Issue: "Port 8080 already in use"
**Solution:** Vite will automatically try 8081, 8082, etc. Use whatever port it shows.

### Issue: "Container keeps restarting"
**Solution:**
```bash
# Check logs for errors
docker logs act_hub_pocketbase_local --tail 50

# Common fix: restart container
docker restart act_hub_pocketbase_local
```

### Issue: "Lost all my data!"
**Solution:** Your data is safe in CSV files:
```bash
# Re-import from CSV backups
node scripts/data/import-csv-to-pocketbase.js
```

---

## 📁 **What's on the SSD**

```
/Volumes/dev/develop/act-hub/
├── pocketbase-data/
│   ├── data.db              ← Your 1,125 proposals (persistent!)
│   ├── data.db-shm          ← SQLite shared memory
│   ├── data.db-wal          ← Write-ahead log
│   ├── logs.db              ← PocketBase logs
│   └── migrations/          ← Schema definitions (4 files)
├── data-for-importing/
│   ├── files.csv            ← Backup of proposals
│   ├── pis.csv              ← Backup of PIs
│   └── sponsors.csv         ← Backup of sponsors
├── src/                     ← Application code
├── docker-compose.local.yml ← Container configuration
└── .env                     ← Environment settings
```

---

## ⚙️ **Current Configuration**

### Environment (.env):
```bash
VITE_DATA_SOURCE="pocketbase"
VITE_POCKETBASE_URL="http://127.0.0.1:8090"
```

### PocketBase Admin:
- **URL:** http://localhost:8090/_/
- **Email:** admin@local.test
- **Password:** admin123456

### Data Summary:
- **1,125** Proposals (files)
- **505** Principal Investigators
- **527** Sponsors

---

## 💡 **Pro Tips**

1. **Always stop the container before ejecting the SSD** to prevent database corruption
2. **Keep those CSV files safe** - they're your backup!
3. **The SSD path is absolute** - it will always be `/Volumes/dev/develop/act-hub` when mounted
4. **Docker containers can be destroyed and recreated** - your data is safe on the SSD
5. **If in doubt, re-import from CSV** - it only takes ~30 seconds

---

## 🔧 **What Changed Today (2025-11-03)**

Fixed critical issues to enable proper SSD portability:

1. **docker-compose.local.yml** - Added `--dir=/pb_data` flag so PocketBase stores data on SSD
2. **import-csv-to-pocketbase.js** - Fixed path to `../../data-for-importing`
3. **pocketbase-data/migrations/** - Cleaned up duplicate migrations (kept only 4 final ones)
4. **Collection permissions** - Set public read access for all collections

These changes ensure your data persists on the SSD and moves with you between machines.
