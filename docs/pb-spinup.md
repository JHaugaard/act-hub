## Project Status Assessment (saved in act-hub/docs as pb-spinup.md)

✅ **What's Ready:**

- Configuration file (`.env`) set to use PocketBase
- CSV data files exist (files.csv, pis.csv, sponsors.csv)
- PocketBase setup scripts exist
- Docker Compose configuration exists
- Node.js is installed (v24.8.0)

❌ **What's Missing:**

- **Docker is not installed** on your Mac
- PocketBase data directory doesn't exist yet (will be created automatically)
- No PocketBase container running yet

## Step-by-Step Guide to Start PocketBase

### Step 1: Install Docker Desktop for Mac

```bash
# Option 1: Download from Docker website (Recommended)
# Visit: https://www.docker.com/products/docker-desktop/

# Option 2: Install via Homebrew (if you have Homebrew)
brew install --cask docker
```

After installation:

1. Open Docker Desktop application
2. Wait for it to start (you'll see the whale icon in menu bar)
3. Verify installation:

```bash
docker --version
docker compose version
```

### Step 2: Create the PocketBase Data Directory

```bash
# Create the directory specified in docker-compose.local.yml
mkdir -p /Volumes/dev/development/act-hub/pocketbase-data
```

### Step 3: Start PocketBase Container

```bash
# Navigate to project directory (if not already there)
cd /Volumes/dev/develop/act-hub

# Start PocketBase in detached mode
docker compose -f docker-compose.local.yml up -d

# Watch the logs to see it start
docker compose -f docker-compose.local.yml logs -f pocketbase
```

You should see output like:

```
✅ PocketBase started on http://localhost:8090
```

Press `Ctrl+C` to stop watching logs (container keeps running).

### Step 4: Access PocketBase Admin Interface

Open your browser and go to:

```
http://localhost:8091/_/
```

**First-time setup:**

- Email: `admin@local.test`
- Password: `admin123456`

(These credentials are set in `docker-compose.local.yml`)

### Step 5: Create Database Schema

```bash
# Run the schema setup script
node scripts/setup-pocketbase-schema.js
```

Expected output:

```
✅ PIs collection created
✅ Sponsors collection created
✅ Files collection created
✅ File Attachments collection created
```

### Step 6: Import Your CSV Data

```bash
# Run the CSV import script
node scripts/import-csv-to-pocketbase.js
```

Expected output:

```
📥 Importing PIs...
✅ Imported XXX PIs

📥 Importing Sponsors...
✅ Imported XXX Sponsors

📥 Importing Files (Proposals)...
✅ Imported XXX Files
✅ CSV import complete!
```

### Step 7: Verify in Admin UI

1. Refresh the admin UI: `http://localhost:8091/_/`
2. You should now see 4 collections with data:
   - `pis`
   - `sponsors`
   - `files`
   - `file_attachments`

### Step 8: Start the React App

```bash
# Install dependencies (if not already done)
npm install

# Start dev server
npm run dev
```

Visit: `http://localhost:8080` 

You should see your application running with real data from PocketBase!

------

## Quick Reference Commands

```bash
# Start PocketBase
docker compose -f docker-compose.local.yml up -d

# Stop PocketBase
docker compose -f docker-compose.local.yml down

# View logs
docker compose -f docker-compose.local.yml logs -f pocketbase

# Restart PocketBase
docker compose -f docker-compose.local.yml restart pocketbase

# Check if container is running
docker ps

# Access Admin UI
# http://localhost:8091/_/

# Access API directly
# http://localhost:8090/api/health
```

------

## Troubleshooting

### If Docker Desktop won't start:

- Check system requirements (macOS 11+)
- Ensure you have enough disk space
- Restart your Mac

### If port 8090 or 8091 is already in use:

```bash
# Check what's using the port
lsof -i :8090
lsof -i :8091

# Kill the process if needed
kill -9 <PID>
```

### If schema creation fails:

- Ensure PocketBase container is running: `docker ps`
- Check PocketBase logs: `docker compose -f docker-compose.local.yml logs pocketbase`
- Verify you can access: `curl http://localhost:8090/api/health`

------

**Start with Step 1** (installing Docker Desktop) and work through each step. Once Docker is installed, the rest should take about 10-15 minutes total!