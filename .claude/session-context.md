# Session Context - February 27, 2026

## Current Focus
Timezone standardization — all date display now pinned to US Eastern (America/New_York).

## MCP Servers Added This Session
None

## Completed This Session

### Timezone Fix (1 item)

1. **Standardized all date handling to US Eastern timezone**
   - Created `src/utils/dateUtils.ts` with two helpers:
     - `formatDateOnly()` — for YYYY-MM-DD date strings (noon-UTC trick prevents day shift)
     - `formatTimestamp()` — for ISO 8601 timestamps (converts to America/New_York)
   - Added `date-fns-tz` dependency (companion to existing `date-fns`)
   - Updated 7 files to use the new helpers:
     - `src/components/ProposalsTable.tsx`
     - `src/pages/FileDetail.tsx`
     - `src/components/FileAttachmentsManager.tsx`
     - `src/components/ActionItemsTable.tsx`
     - `src/components/RelatedProposalsPopover.tsx`
     - `src/utils/pdfExport.ts`
     - `src/pages/DBDistiller.tsx`
   - Build passes cleanly

### Key Decisions
- US Eastern (America/New_York) is the canonical display timezone
- Date-only fields use noon-UTC construction to avoid day-boundary shift
- Timestamps are converted to Eastern via `date-fns-tz` before display
- Write-side code (storing dates) was left unchanged — ISO 8601 storage is correct

---

## Previous Session Summary (December 9, 2025)

### UI Improvements
- Added Cayuse column to Proposals table
- Fixed Calendar component for react-day-picker v9
- FileDetail page improvements (editable Cayuse, cleaner heading)

### Security Hardening (December 7, 2025)
- SQL injection protection, default creds removed, CSP headers, CORS

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
**Deployment Platform:** fly.io
