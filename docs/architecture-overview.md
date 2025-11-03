# Proposal Tracker - PocketBase Migration Architecture

## Phase 1: Local Development

### Your Machine (MacBook)

```
┌─────────────────────────────────────────────────────────────────┐
│                         YOUR MACHINE (MacBook)                   │
│                                                                  │
│  ┌────────────────────────────────┐                             │
│  │   React Dev Server (port 3000) │                             │
│  │   npm run dev                  │                             │
│  │                                │                             │
│  │  ├── Pages/                    │                             │
│  │  ├── Components/               │                             │
│  │  └── hooks/useData.ts ─────┐   │                             │
│  │     (hook factory)         │   │                             │
│  └────────────────────────────┼───┘                             │
│                               │                                 │
│                  HTTP (REST)  │                                 │
│                               │                                 │
│  ┌────────────────────────────▼───┐        ┌──────────────────┐│
│  │     PocketBase Container       │        │  DATA VOLUME     ││
│  │     (Docker)                   │        │  pocketbase-data ││
│  │     Ports: 8090, 8091          │        │                  ││
│  │                                │        │  ├── pb.db       ││
│  │  ┌────────────────────────┐    │        │  ├── pb_public/ ││
│  │  │ Collections:           │    │────────┼──└── migrations/ ││
│  │  │ • pis                  │    │        │                  ││
│  │  │ • sponsors             │    │        │  (Persistent)    ││
│  │  │ • files (proposals)    │    │        │                  ││
│  │  │ • file_attachments     │    │        │                  ││
│  │  └────────────────────────┘    │        └──────────────────┘│
│  └────────────────────────────────┘                             │
│                                                                  │
│           Admin UI: http://localhost:8091                        │
│           (View collections, inspect data)                       │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

## Phase 1: Data Migration Flow

```
┌─────────────────┐
│ Lovable Supabase│  ← (Read-only, production data)
│ (Cloud)         │
└────────┬────────┘
         │
         │ export-supabase-data.js
         │ (Node.js script)
         │
         ▼
┌──────────────────────┐
│ data-exports/        │
│ supabase-export-     │
│ TIMESTAMP.json       │  ← (All proposals + metadata as JSON)
└──────────┬───────────┘
           │
           │ import-csv-to-pocketbase.js
           │ (Node.js script)
           │
           ▼
┌──────────────────────────────────────────┐
│ LOCAL POCKETBASE                         │
│ (In Docker container)                    │
│                                          │
│ Collections now have data:               │
│ • 505 PIs                                │
│ • 527 Sponsors                           │
│ • 1,125 Files (proposals)                │
│ • File Attachments                       │
└──────────────┬───────────────────────────┘
               │
               │ persists to
               ▼
        pocketbase-data/
```

## Hook Factory Pattern

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         src/hooks/useData.ts                             │
│                        (Hook Factory Pattern)                            │
│                                                                          │
│  Environment Variable: VITE_DATA_SOURCE                                  │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐
│  │ If "mock":                                                          │
│  │   export useFiles = useMockFiles                                    │
│  │   export usePIs = useMockPIs                                        │
│  │   (Data from localStorage)                                          │
│  └─────────────────────────────────────────────────────────────────────┘
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐
│  │ If "pocketbase" (CURRENT PRODUCTION):                               │
│  │   export useFiles = usePocketBaseFiles                              │
│  │   export usePIs = usePocketBasePIs                                  │
│  │   (Data from local Docker PocketBase)                               │
│  └─────────────────────────────────────────────────────────────────────┘
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐
│  │ If "supabase":                                                      │
│  │   export useFiles = useSupabaseFiles                                │
│  │   export usePIs = useSupabasePIs                                    │
│  │   (Data from cloud Supabase - LEGACY)                               │
│  └─────────────────────────────────────────────────────────────────────┘
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

**All components use:**
```typescript
import { useFiles, usePIs } from '@/hooks/useData'
```
→ Automatically get correct backend ✅
→ Zero component changes needed! ✅

## Phase 2: VPS Preparation

```
┌──────────────────────────────────────────────────────────────────────────┐
│                   HOSTINGER VPS (bare-metal)                             │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐
│  │ Nginx Reverse Proxy (ports 80/443)                                  │
│  │ • Listens on yourdomain.com:80 (HTTP)                               │
│  │ • Listens on yourdomain.com:443 (HTTPS + SSL cert)                  │
│  │ • Routes traffic to containers                                      │
│  │                                                                     │
│  │   yourdomain.com/api/* → PocketBase:8090                            │
│  │   yourdomain.com/*     → React App:3000                             │
│  └─────────────────────────────────────────────────────────────────────┘
│                          │
│         ┌────────────────┴────────────────┐
│         ▼                                 ▼
│  ┌──────────────────┐           ┌─────────────────────┐
│  │ React Container  │           │ PocketBase Container│
│  │ Port: 3000       │           │ Ports: 8090, 8091   │
│  │ (Internal)       │           │ (Internal)          │
│  │                  │           │                     │
│  │ ├── Built app    │           │ ├── Collections     │
│  │ └── Node.js      │           │ ├── API endpoints   │
│  │     server       │           │ └── Data storage    │
│  └──────────────────┘           └────────┬────────────┘
│                                          │
│                                  Docker volume mount
│                                          │
│                          ┌───────────────▼──────────────┐
│                          │   PRODUCTION DATA VOLUME     │
│                          │   (SSD Storage)              │
│                          │                              │
│                          │ ├── pb.db (SQLite)           │
│                          │ ├── pb_public/ (files)       │
│                          │ └── backups/                 │
│                          └──────────────────────────────┘
│                                                          │
│  DNS (via Cloudflare) points yourdomain.com to VPS IP   │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

## Phase 3: Production Deployment

### Deployment Process

1. **Build Docker images** (on your machine)
   - React app image (npm run build → Docker)
   - PocketBase image (already exists on Docker Hub)

2. **Push to VPS**
   - SSH into VPS
   - Pull Docker images

3. **Start containers via docker-compose**
   ```bash
   docker-compose up -d
   ```
   - PocketBase starts on 8090/8091
   - React app starts on 3000
   - Nginx routes traffic from 80/443 to containers

4. **Restore production data**
   - Copy production backup to VPS
   - PocketBase restores from backup
   - All data available instantly

5. **Verify**
   - Test all features work
   - Check logs for errors
   - Monitor performance

## Phase 4: Live Cutover

**Before:**
```
yourdomain.com (via Cloudflare)
    │ CNAME points to old server
    ▼
Old Lovable.dev production
```

**After:**
```
yourdomain.com (via Cloudflare)
    │ CNAME points to Hostinger VPS
    ▼
Nginx ← PocketBase + React
```

### Cutover Steps:
1. Verify everything works on VPS (private testing)
2. Update Cloudflare DNS record
   - A record: yourdomain.com → VPS IP address
   - TTL: 300 (5 minutes for quick rollback if needed)
3. Monitor for 5 minutes (should work instantly)
4. If issues: revert DNS, troubleshoot, re-deploy
5. After 1 hour of success: increase TTL for stability

## Data Safety Measures

### Phase 1 (Local):
- ✅ Original Supabase untouched
- ✅ All data in Docker volume (backup-friendly)
- ✅ Can delete and re-import anytime

### Phase 2-3 (VPS):
- ✅ Production backup created before deployment
- ✅ Rollback procedure documented
- ✅ Docker allows instant container restart

### Phase 4 (Cutover):
- ✅ DNS TTL set low (5 minutes) for quick rollback
- ✅ Both systems run simultaneously during transition
- ✅ Instant fallback to old system if needed

## Component Interaction Flow

```
User Browser
     │
     │ HTTP request to yourdomain.com/proposals
     │
     ▼
Nginx (Port 80/443 via Cloudflare)
     │
     ├─ /api/* → PocketBase:8090
     │            ├─ Query collections
     │            ├─ Return JSON
     │            └─ Handle mutations (create/update/delete)
     │
     └─ /* → React App:3000
              ├─ Serve index.html
              ├─ Load JavaScript
              ├─ Browser runs useData hook factory
              │   └─ Which calls PocketBase hooks
              ├─ Components render
              └─ Show proposal list
```

## Performance Expectations

### Local (Phase 1):
- API latency: <10ms (same machine)
- Page load: ~2-3 seconds (React build overhead)
- Real-time: Instant (no network delay)

### Production (Phase 3+):
- API latency: 50-100ms (VPS network)
- Page load: ~3-4 seconds (network + server)
- Real-time: Still instant (local processing)

**PocketBase is extremely fast:**
- SQLite: Optimized for reads
- In-process: No external database servers
- Minimal overhead: ~10MB RAM base, ~50MB under load

## Security Architecture

### Public (Internet-facing):
- Nginx reverse proxy (all traffic goes through)
- HTTPS only (SSL certificate)
- Rate limiting
- DDoS protection (via Cloudflare if enabled)

### Internal (VPS network):
- PocketBase on private port 8090 (not exposed)
- React app on private port 3000 (not exposed)
- Communication via internal network
- No direct access to database ports

### Admin Access (SSH tunnel):
- PocketBase admin UI on port 8091
- Accessible only via SSH tunnel for security
- Default credentials changed in production
- All access logged

## File Storage Strategy

### Phase 1 (Local):
- Files stored in: `pocketbase-data/pb_public/`
- Access: Direct filesystem access

### Phase 3 (Production):
- Files stored in: `/var/pocketbase/pb_public/` (on VPS)
- Access: Via PocketBase API (`/api/files/`)
- Backup: Included in nightly backups
