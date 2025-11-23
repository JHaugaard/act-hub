# Session Summary - November 23, 2025

## First Production Deployment to fly.io Complete

### Overview
Successfully deployed ACT Hub (Proposal Tracker) to fly.io with custom domain configuration. This was the user's first fly.io deployment, done step-by-step via CLI for learning purposes.

---

## Deployment Architecture

### Production URLs
| Service | fly.io URL | Custom Domain |
|---------|------------|---------------|
| Frontend | https://proposaltracker-web.fly.dev | https://proposaltracker.net |
| PocketBase API | https://proposaltracker-api.fly.dev | https://api.proposaltracker.net |
| PocketBase Admin | - | https://api.proposaltracker.net/_/ |

### Infrastructure
- **Platform:** fly.io (San Jose region - sjc)
- **Frontend:** Docker container (Node build → Nginx serve)
- **Backend:** PocketBase in Docker with persistent volume
- **SSL:** Let's Encrypt (auto-renewing)
- **DNS:** Cloudflare (DNS-only mode, gray cloud)
- **CI/CD:** GitHub Actions (ready, needs FLY_API_TOKEN secret)

---

## Tasks Completed This Session

### 1. Pre-Deployment Security Audit
- Identified and fixed **mocked authentication** (was bypassing all auth with hardcoded dev user)
- Removed **hardcoded credentials** from PocketBase client
- Cleaned up legacy Supabase configuration

### 2. Authentication Rewrite
- **Complete rewrite** of `src/contexts/AuthContext.tsx`
- Changed from Supabase mock to real PocketBase authentication
- Re-enabled auth checks in `src/components/ProtectedRoute.tsx`
- Updated 5 PocketBase hooks to remove `ensurePocketBaseAuth()` calls

### 3. Project Cleanup
- Removed `.bmad-core/` directory (required sudo due to permission issues)
- Removed `supabase/` directory (legacy, not needed)
- Updated `.env` configuration

### 4. fly.io Deployment Files Created
| File | Purpose |
|------|---------|
| `Dockerfile` | Frontend multi-stage build (Node → Nginx) |
| `nginx.conf` | SPA routing, caching, security headers |
| `fly.toml` | Frontend fly.io configuration |
| `fly.pocketbase.toml` | PocketBase fly.io configuration |
| `.github/workflows/deploy.yml` | CI/CD pipeline |
| `.env.example` | Environment template |
| `.dockerignore` | Docker build exclusions |

### 5. fly.io Deployment Steps (CLI)
1. Installed flyctl via Homebrew
2. Authenticated with `fly auth login`
3. Created PocketBase app: `fly apps create proposaltracker-api`
4. Created persistent volume: `fly volumes create pb_data --app proposaltracker-api --region sjc --size 1`
5. Deployed PocketBase: `fly deploy --config fly.pocketbase.toml --remote-only`
6. Created frontend app: `fly apps create proposaltracker-web`
7. Deployed frontend: `fly deploy --remote-only`

### 6. PocketBase Production Setup
- Created admin account at https://proposaltracker-api.fly.dev/_/
- Created 4 collections: `pis`, `sponsors`, `files`, `file_attachments`
- Configured API rules for authenticated access

### 7. Custom Domain Configuration
- Added SSL certificates via `fly certs add`
- Configured Cloudflare DNS records:
  - A record: `@` → `66.241.124.42`
  - AAAA record: `@` → `2a09:8280:1::b3:5399:0`
  - CNAME: `www` → `proposaltracker-web.fly.dev`
  - CNAME: `api` → `proposaltracker-api.fly.dev`
- Verified SSL certificates issued by Let's Encrypt

---

## Files Modified

### Authentication
- `src/contexts/AuthContext.tsx` - Complete rewrite for PocketBase auth
- `src/components/ProtectedRoute.tsx` - Re-enabled auth checks
- `src/integrations/pocketbase/client.ts` - Removed hardcoded credentials

### PocketBase Hooks (removed ensurePocketBaseAuth)
- `src/hooks/data/pocketbase/usePocketBaseFiles.ts`
- `src/hooks/data/pocketbase/usePocketBaseProposalData.ts`
- `src/hooks/data/pocketbase/usePocketBaseDashboard.ts`
- `src/hooks/data/pocketbase/usePocketBaseRelatedProposals.ts`
- `src/hooks/data/pocketbase/usePocketBaseFileAttachments.ts`

### Docker
- `Dockerfile.pocketbase` - Updated port to 8080 for fly.io
- `docker-compose.local.yml` - Changed to relative volume path

---

## Remaining Tasks

### Immediate (Before Using Production)
1. **Add GitHub Secret** for CI/CD automation:
   - Repository Settings → Secrets → Actions
   - Add `FLY_API_TOKEN` (get via `fly tokens create deploy -x 999999h`)

2. **Update fly.toml** to use custom API domain:
   ```toml
   VITE_POCKETBASE_URL = "https://api.proposaltracker.net"
   ```
   Then redeploy: `fly deploy`

3. **Import production data** into PocketBase at https://api.proposaltracker.net/_/

### Optional Enhancements
- Set up monitoring/alerting on fly.io dashboard
- Configure backup strategy for PocketBase volume
- Add www redirect to apex domain

---

## Key Learnings

### fly.io CLI vs Dashboard
- CLI approach (`flyctl`) provides more control and understanding
- "Launch an App" button is faster but abstracts the process
- CLI is preferred for learning first deployment

### fly.io Architecture
- Apps are containers that can auto-stop/start
- Persistent volumes required for databases (SQLite in PocketBase)
- Certificates auto-provision with Let's Encrypt
- Region selection affects latency (sjc = San Jose)

### Cloudflare DNS for fly.io
- Must use "DNS only" mode (gray cloud, not orange)
- fly.io handles SSL termination, not Cloudflare
- CNAME records point to fly.io hostnames with unique prefixes

---

## Environment Configuration

### Production (.env on fly.io - set via fly.toml)
```bash
VITE_DATA_SOURCE=pocketbase
VITE_POCKETBASE_URL=https://proposaltracker-api.fly.dev
# After DNS verification, change to:
# VITE_POCKETBASE_URL=https://api.proposaltracker.net
```

### Local Development (.env)
```bash
VITE_DATA_SOURCE=mock  # or pocketbase with local Docker
VITE_POCKETBASE_URL=http://127.0.0.1:8090
```

---

## Project Status

| Component | Status |
|-----------|--------|
| Frontend Deployment | Deployed to fly.io |
| PocketBase Deployment | Deployed to fly.io |
| Custom Domain (web) | SSL issued, working |
| Custom Domain (api) | SSL issued, working |
| CI/CD Pipeline | Created, needs GitHub secret |
| Production Data | Not yet imported |
| Authentication | Real PocketBase auth enabled |

---

## Previous Sessions

- **November 2, 2025:** PocketBase local development setup, schema creation, CSV data import (2,157 records)
- **November 1, 2025:** Project rename and documentation reorganization

---

**Current Branch:** development
**Working Directory:** `/Volumes/dev/develop/act-hub`
**Deployment Platform:** fly.io
**Status:** Production deployment complete, custom domains active
