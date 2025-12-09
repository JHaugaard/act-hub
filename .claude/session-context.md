# Session Context - December 7, 2025

## Current Focus
Security hardening complete - all audit findings addressed.

## MCP Servers Added This Session
None active (zen server cleaned up)

## Key Decisions
- Kept nginx.conf - Dockerfile depends on it for serving static files
- Removed ALL Supabase code completely
- Disabled public user registration (removed signUp function)
- Added updatePassword function to AuthContext for direct password changes

## Completed This Session

### Security Audit & Remediation (Round 2)
Addressed remaining security findings:

1. **Fixed: SQL Injection in PocketBase Filters**
   - Added `isValidPocketBaseId()` and `escapePocketBaseFilter()` utilities in `src/lib/utils.ts`
   - Updated `usePocketBaseRelatedProposals.ts` - validates IDs before use in filters
   - Updated `usePocketBaseFileAttachments.ts` - validates IDs before use in filters

2. **Fixed: Default Admin Credentials Removed**
   - `scripts/setup/setup-pocketbase-schema.js` - now requires `PB_ADMIN_EMAIL` and `PB_ADMIN_PASSWORD` env vars
   - `scripts/data/migrate-to-production.js` - now requires env vars, no default fallbacks
   - Both scripts validate password length (min 10 chars)

3. **Fixed: CSP and Security Headers Added**
   - Added to `nginx.conf`:
     - Content-Security-Policy header (restricts sources)
     - Referrer-Policy header
     - Permissions-Policy header (disables geolocation, mic, camera)
   - Moved headers into location blocks (nginx `add_header` in locations overrides server-level)

4. **Fixed: CORS Restrictions for PocketBase**
   - Updated `Dockerfile.pocketbase` to use `--origins` flag
   - Configurable via `PB_CORS_ORIGINS` env var
   - Defaults to production domains only

### Security Note: Auth Token Storage
PocketBase SDK stores auth tokens in localStorage by default. This is acceptable for this application because:
- Single-user app with no shared computers
- HTTPS-only in production (tokens encrypted in transit)
- XSS mitigated via CSP headers
- Short token expiration (configurable in PocketBase admin)

For higher-security needs, consider:
- Custom token storage with encryption
- Session-based auth via PocketBase's built-in session handling
- Shorter token expiration times

### Security Audit & Remediation (Round 1)

1. **CRITICAL - Fixed**: Disabled public user registration
   - Removed signUp function from AuthContext.tsx
   - App is single-user, existing account is only access

2. **HIGH - Fixed**: Removed ALL Supabase code
   - Deleted `src/integrations/supabase/` directory
   - Deleted `src/hooks/data/supabase/` directory
   - Updated useData.ts to only support mock/pocketbase
   - Migrated all components to use PocketBase

3. **Files Modified**:
   - `src/contexts/AuthContext.tsx` - removed signUp, added updatePassword
   - `src/hooks/useData.ts` - removed Supabase, simplified to mock/pocketbase
   - `src/config/dataSource.ts` - removed supabase option
   - `src/hooks/data/pocketbase/usePocketBaseFiles.ts` - added createFile, updateFile
   - `src/components/ProposalForm.tsx` - migrated to useFiles hook
   - `src/pages/EditPI.tsx` - migrated to PocketBase
   - `src/pages/EditSponsor.tsx` - migrated to PocketBase
   - `src/pages/PasswordReset.tsx` - migrated to PocketBase
   - `src/components/AppSidebar.tsx` - migrated to PocketBase
   - `src/hooks/features/useDataImport.ts` - complete rewrite for PocketBase

---

## Previous Session Summary (December 6, 2025)

### v1.0.0 Released - Action Items Tracker
Implemented Action Items tracker feature and released as v1.0.0. Full CRUD with inline editing, sidebar and dashboard integration.

### Deployment Architecture

#### Production URLs
| Service | fly.io URL | Custom Domain |
|---------|------------|---------------|
| Frontend | https://proposaltracker-web.fly.dev | https://proposaltracker.net |
| PocketBase API | https://proposaltracker-api.fly.dev | https://api.proposaltracker.net |
| PocketBase Admin | - | https://api.proposaltracker.net/_/ |

#### Infrastructure
- **Platform:** fly.io (San Jose region - sjc)
- **Frontend:** Docker container (Node build → Nginx serve)
- **Backend:** PocketBase in Docker with persistent volume
- **SSL:** Let's Encrypt (auto-renewing)
- **DNS:** Cloudflare (DNS-only mode, gray cloud)
- **CI/CD:** GitHub Actions (fully operational)

### Data Status (Production)
| Collection | Count |
|------------|-------|
| PIs | 505 |
| Sponsors | 527 |
| Files | 1,125 |
| action_items | (pending creation) |

---

**Current Version:** v1.0.0
**Current Branch:** main
**Working Directory:** `/Volumes/dev/develop/act-hub`
**Deployment Platform:** fly.io
