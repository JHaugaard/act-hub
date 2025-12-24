# Session Context - December 9, 2025

## Current Focus
UI improvements deployed - Cayuse column, calendar fix, detail page updates.

## MCP Servers Added This Session
None

## Completed This Session

### UI Improvements (3 items)

1. **Added Cayuse column to Proposals table**
   - New column between Status and Date Received
   - Displays Cayuse ID or dash if empty
   - Files: `src/components/ProposalsTable.tsx`

2. **Fixed Calendar component for react-day-picker v9**
   - Updated from v8 API to v9 API
   - `Caption` → `MonthCaption`, `IconLeft/IconRight` → `Chevron`
   - Month/year dropdown selectors now display properly
   - Files: `src/components/ui/calendar.tsx`

3. **FileDetail page improvements**
   - Removed "Proposal" prefix from heading (now just shows DB number)
   - Cayuse field now always visible (shows "-" if empty)
   - Cayuse field is editable with inline Edit button
   - Added `updateCayuse` function to both PocketBase and mock hooks
   - Files: `src/pages/FileDetail.tsx`, `src/hooks/data/pocketbase/usePocketBaseFileDetail.ts`, `src/hooks/data/mock/useMockFileDetail.ts`

### Housekeeping

- **Deleted stale branch**: `wonderful-jepsen` (was an outdated auto-generated branch that would have reverted security fixes)
- **Committed & pushed**: All UI changes to main
- **CI/CD**: Automatic deployment triggered via GitHub Actions

---

## Previous Session Summary (December 7, 2025)

### Security Hardening Complete
- SQL injection protection in PocketBase filters
- Default admin credentials removed from scripts
- CSP and security headers added to nginx.conf
- CORS restrictions configured for PocketBase

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
- **CI/CD:** GitHub Actions (auto-deploys on push to main)

### Data Status (Production)
| Collection | Count |
|------------|-------|
| PIs | 505 |
| Sponsors | 527 |
| Files | 1,125+ |

---

**Current Version:** v1.0.0
**Current Branch:** main
**Working Directory:** `/Volumes/dev/develop/act-hub`
**Deployment Platform:** fly.io
