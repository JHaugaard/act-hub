# Session Summary - November 23, 2025

## Data Migration & FileDetail Fix Complete

### Overview
Successfully migrated all data from local PocketBase to production on fly.io, and fixed the FileDetail page that was broken due to hardcoded Supabase calls. Created proper dual-mode hooks for file detail functionality.

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

### 1. Data Migration to Production
- Created `scripts/data/migrate-to-production.js` for bulk data transfer
- Migrated **505 PIs**, **527 Sponsors**, **1,125 Files** to production PocketBase
- Discovered schema mismatch: local had "Pending Signature" (singular), production had "Pending Signatures" (plural)
- Created `scripts/data/migrate-pending-signature.js` to handle the 15 affected files
- Updated production schema to include both status values

### 2. FileDetail Page Fix (Major Bug Fix)
**Problem:** FileDetail.tsx was hardcoded to use Supabase client directly, bypassing the dual-mode hook architecture. This caused "Failed to Fetch" errors and blank screens.

**Solution:** Created proper tri-mode hooks:
| File | Purpose |
|------|---------|
| `src/hooks/data/pocketbase/usePocketBaseFileDetail.ts` | PocketBase implementation with expand support |
| `src/hooks/data/supabase/useFileDetail.ts` | Supabase implementation |
| `src/hooks/data/mock/useMockFileDetail.ts` | Mock/localStorage implementation |

**Key Changes:**
- Added `useFileDetail` export to `src/hooks/useData.ts`
- Refactored `src/pages/FileDetail.tsx` to use unified hook
- Fixed Authorization header (was missing "Bearer " prefix)
- Fixed `uploadProgress` missing from file attachments hooks

### 3. PocketBase Collection Rules
Updated API rules on both local and production for:
- **files** collection: `@request.auth.id != ""`
- **pis** collection: `@request.auth.id != ""`
- **sponsors** collection: `@request.auth.id != ""`

This was required for the `expand=pi_id,sponsor_id` feature to work with user tokens (not just admin tokens).

### 4. File Attachments Hook Fixes
Fixed missing `uploadProgress` state in:
- `src/hooks/data/pocketbase/usePocketBaseFileAttachments.ts`
- `src/hooks/data/mock/useMockFileAttachments.ts`

Also added `uploadFile`, `downloadFile` functions to PocketBase hook.

### 5. Production Deployment
- Committed all changes with descriptive message
- Pushed to GitHub: `git push origin main`
- Deployed to fly.io: `fly deploy --config fly.toml`
- Verified API expand working on production

---

## Files Created This Session

| File | Purpose |
|------|---------|
| `scripts/data/migrate-to-production.js` | Bulk data migration script |
| `scripts/data/migrate-pending-signature.js` | Fix for 15 "Pending Signature" files |
| `src/hooks/data/pocketbase/usePocketBaseFileDetail.ts` | PocketBase file detail hook |
| `src/hooks/data/supabase/useFileDetail.ts` | Supabase file detail hook |
| `src/hooks/data/mock/useMockFileDetail.ts` | Mock file detail hook |

## Files Modified This Session

| File | Changes |
|------|---------|
| `src/hooks/useData.ts` | Added useFileDetail export with tri-mode support |
| `src/pages/FileDetail.tsx` | Refactored to use unified hook |
| `src/hooks/data/pocketbase/usePocketBaseFileAttachments.ts` | Added uploadProgress, uploadFile, downloadFile |
| `src/hooks/data/mock/useMockFileAttachments.ts` | Added uploadProgress |

---

## Data Status

### Production (proposaltracker-api.fly.dev)
| Collection | Count |
|------------|-------|
| PIs | 505 |
| Sponsors | 527 |
| Files | 1,125 |

### Status Field Values (files collection)
- In, Process, Pending, Pending Signature, Pending Signatures, Done, On Hold, Withdrawn

---

## Remaining Tasks

### CI/CD Setup (Deferred)
1. **Add GitHub Secret** for automation:
   - Repository Settings → Secrets → Actions
   - Add `FLY_API_TOKEN` (get via `fly tokens create deploy -x 999999h`)

2. **Workflow file** already exists: `.github/workflows/deploy.yml`

### Optional Enhancements
- Set up monitoring/alerting on fly.io dashboard
- Configure backup strategy for PocketBase volume
- Add www redirect to apex domain

---

## Local Development

### Start Local Environment
```bash
# Start PocketBase (Docker)
docker-compose -f docker-compose.local.yml up -d

# Start frontend dev server
npm run dev
# → http://localhost:8080
```

### Environment Configuration
```bash
# .env (local development)
VITE_DATA_SOURCE="pocketbase"
VITE_POCKETBASE_URL="http://127.0.0.1:8090"
VITE_USE_MOCK_DATA="false"
```

### Test Credentials (Local)
- **Email:** jhaugaard@mac.com
- **Password:** test123456

---

## Key Architecture Pattern

### Dual/Tri-Mode Hook Factory
The app uses a hook factory pattern in `src/hooks/useData.ts`:

```typescript
export const useFileDetail = USE_MOCK_DATA
  ? useMockFileDetail
  : USE_POCKETBASE
    ? usePocketBaseFileDetail
    : useSupabaseFileDetail;
```

**IMPORTANT:** Components should ALWAYS import from `@/hooks/useData`, never directly from individual hook files.

---

## Previous Sessions

- **November 23, 2025 (earlier):** First production deployment to fly.io, custom domain setup
- **November 2, 2025:** PocketBase local development setup, schema creation, CSV data import
- **November 1, 2025:** Project rename and documentation reorganization

---

**Current Branch:** main
**Working Directory:** `/Volumes/dev/develop/act-hub`
**Deployment Platform:** fly.io
**Status:** Production deployment complete, data migrated, FileDetail fix deployed
