# 🚀 Proposal Tracker - PocketBase Migration: START HERE

Welcome! You're about to transition from Lovable's Supabase to a self-hosted PocketBase setup. This document is your roadmap.

---

## 📍 Where You Are

✅ **Current State:**
- Lovable app is running in production with Supabase
- You have a new Hostinger bare-metal VPS
- You want to migrate to PocketBase (lightweight, self-hosted, Docker-based)

✅ **What's Been Built:**
- Complete PocketBase integration layer (5 React hooks)
- Docker setup for local development
- Data migration scripts (export from Supabase, import to PocketBase)
- Full documentation and guides

---

## 🎯 Your Journey: 4 Phases

### Phase 1: Local Development (TODAY)
**Goal:** Get PocketBase running locally with all your production data

**Time:** ~40-60 minutes

**What you'll do:**
1. Start PocketBase in Docker
2. Create database schema
3. Export data from Lovable
4. Import into local PocketBase
5. Test your app with real data

**Files to read:**
- [PHASE1-QUICKSTART.txt](PHASE1-QUICKSTART.txt) ← Start here (checklist format)
- [Phase 1 Setup](phase1-setup.md) ← Detailed walkthrough with troubleshooting

**Status:** Infrastructure ready, waiting for you to execute

---

### Phase 2: VPS Preparation (AFTER Phase 1)
**Goal:** Prepare your Hostinger VPS for production deployment

**Time:** ~2-3 hours

**What you'll do:**
1. SSH into Hostinger VPS
2. Install Docker and Docker Compose
3. Configure Nginx reverse proxy
4. Set up SSL certificates (Let's Encrypt)
5. Create production docker-compose.yml

**Status:** To be built (I'll create this after Phase 1 succeeds)

---

### Phase 3: Production Deployment (AFTER Phase 2)
**Goal:** Deploy PocketBase and React app to your VPS

**Time:** ~1-2 hours

**What you'll do:**
1. Push Docker images to VPS
2. Deploy PocketBase container
3. Deploy React app container
4. Restore production data
5. Verify everything works

**Status:** To be built

---

### Phase 4: DNS Cutover (AFTER Phase 3)
**Goal:** Point your domain to the VPS and go live

**Time:** ~30 minutes

**What you'll do:**
1. Configure Cloudflare DNS
2. Point domain to VPS
3. Final smoke tests
4. Celebrate! 🎉

**Status:** To be built

---

## 📋 Quick Start for Phase 1

### Prerequisites Check
```bash
# You should have:
✅ Docker installed (docker --version)
✅ External drive mounted (ls /Volumes/dev/development/act-hub/)
✅ Node.js/npm installed (npm --version)
✅ .env file with Supabase credentials (cat .env | grep SUPABASE)
```

### Execute Phase 1 (Copy & Paste)
```bash
# 1. Start PocketBase container
docker-compose -f docker-compose.local.yml up -d

# 2. Create database schema
node scripts/setup-pocketbase-schema.js

# 3. Export all data from Lovable
node scripts/export-supabase-data.js

# 4. Import into local PocketBase
node scripts/import-to-pocketbase.js

# 5. Update .env (add these lines):
# VITE_DATA_SOURCE="pocketbase"
# VITE_POCKETBASE_URL="http://localhost:8090"

# 6. Restart dev server
npm run dev

# 7. Test at http://localhost:3000
```

### What to Check
```bash
# PocketBase running?
curl http://localhost:8090/api/health

# Admin UI working?
# http://localhost:8091 (login: admin@local.test / admin123456)

# App connected?
# Check browser console: should say "🔧 Data Source: POCKETBASE"

# Data on external drive?
ls -la /Volumes/dev/development/act-hub/pocketbase-data/
```

---

## 📚 Documentation Structure

```
project-root/
├── START-HERE.md ← You are here
├── PHASE1-QUICKSTART.txt ← Do this first (checklist)
├── PHASE1-SETUP.md ← Detailed guide + troubleshooting
├── MIGRATION-SUMMARY.md ← Technical deep-dive
├── DEPLOYMENT.md ← (for later phases)
├── CLAUDE.md ← Project guidelines
└── docker-compose.local.yml ← Docker config
```

---

## 🎓 What You'll Learn

By doing this migration, you'll understand:

1. **Docker & Containerization**
   - How containers isolate applications
   - Volume mounting for data persistence
   - Port mapping and networking

2. **Database Concepts**
   - Collections and schemas
   - Relationships between tables
   - Data export/import patterns

3. **React Patterns**
   - Hook factory pattern for abstraction
   - Environment-based configuration
   - Seamless backend switching

4. **DevOps & Deployment**
   - Self-hosted database management
   - Reverse proxy configuration (Nginx)
   - SSL/TLS certificates

5. **Data Migration**
   - Moving data between systems safely
   - Preserving data integrity and relationships
   - Zero-downtime transitions

---

## ⚠️ Key Points to Remember

1. **Your data is safe**
   - Export scripts are read-only
   - Import is reversible (you can delete and re-import)
   - Production Supabase remains untouched

2. **Zero component changes**
   - All React components work as-is
   - Hook factory pattern handles switching
   - Same data structure, different backend

3. **External drive is important**
   - All data persists there
   - You can inspect SQLite database directly
   - Easy to backup/restore

4. **One source of truth at a time**
   - `VITE_DATA_SOURCE` controls which backend you use
   - Can't have app using both Supabase and PocketBase simultaneously
   - But you can switch anytime by changing environment variable

---

## 🚨 Common Issues & Quick Fixes

### "Connection refused" on http://localhost:8090
```bash
# PocketBase probably isn't running
docker-compose -f docker-compose.local.yml ps
docker-compose -f docker-compose.local.yml logs pocketbase
```

### "Admin UI shows empty collections"
```bash
# Schema probably wasn't created
node scripts/setup-pocketbase-schema.js
```

### "Import fails with 'collection not found'"
```bash
# Run schema creation first!
node scripts/setup-pocketbase-schema.js
```

### "App still says 'Data Source: SUPABASE'"
```bash
# .env file wasn't updated properly
cat .env | grep VITE_DATA_SOURCE
# Should show: VITE_DATA_SOURCE=pocketbase

# If not, add it and restart: npm run dev
```

### "External drive files not appearing"
```bash
# Check if drive is actually mounted
mount | grep 990-Pro
# Should show the mount point
```

---

## 📞 Getting Help

If you get stuck:

1. **Read the error message carefully** - 99% have helpful hints
2. **Check the relevant guide:**
   - Phase 1 issues? → Read PHASE1-SETUP.md troubleshooting section
   - Docker issues? → Run `docker logs` to see what's happening
   - Database issues? → Check admin UI at http://localhost:8091
3. **Inspect the data:**
   - View external drive: `ls /Volumes/dev/development/act-hub/pocketbase-data/`
   - View PocketBase: http://localhost:8091
   - View browser console: Chrome DevTools → Console

---

## ✨ Success Criteria for Phase 1

You'll know Phase 1 is complete when:

- ✅ PocketBase runs in Docker (`docker-compose up -d`)
- ✅ Schema exists (4 collections visible in admin UI)
- ✅ Data imported (36 files visible in admin UI)
- ✅ App shows "Data Source: POCKETBASE" in console
- ✅ All features work:
  - View proposals
  - Filter/search proposals
  - View proposal details
  - Change status
  - View PIs and Sponsors
  - View dashboard with correct counts

---

## 🎬 Ready?

**Next action:** Open [PHASE1-QUICKSTART.txt](PHASE1-QUICKSTART.txt)

It's a simple checklist you can follow step-by-step. Takes about 40 minutes.

**I'll be here** when you need help or have questions. Just let me know how it goes!

---

## 📊 Timeline Overview

| Phase | Task | Duration | Status |
|-------|------|----------|--------|
| **1** | Local setup + testing | 1 hour | ⏳ Ready to go |
| **2** | VPS preparation | 2-3 hours | ⏳ After Phase 1 |
| **3** | Production deploy | 1-2 hours | ⏳ After Phase 2 |
| **4** | DNS cutover | 30 mins | ⏳ After Phase 3 |
| **TOTAL** | | ~5-7 hours | 🎯 To production |

---

**Good luck! You've got this. 🚀**

*— Claude Code*
