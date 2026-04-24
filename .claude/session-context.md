# Session Context - April 23, 2026

## Current Focus
Token auth migration for Proposal Tracker (act-hub repo). Working on branch `token-auth`.

---

## Completed This Session

### 1. UI Fix: AutocompleteInput Dropdown Behavior
- **File:** `src/components/ui/autocomplete-input.tsx`
- **Changes:**
  - Removed `onFocus` auto-open behavior (dropdown no longer opens on tab/focus)
  - Reduced `max-h-60` → `max-h-48` to block fewer fields below
- **Reason:** Hermes struggled with dropdowns persisting and blocking other fields during proposal updates
- **Status:** Committed to `main` (commit `d16be9b`)

### 2. Auth Migration: Email/Password → Token-Based Login
- **Branch:** `token-auth` (branched from `main`)
- **Status:** Code changes complete, build passes, NOT yet deployed
- **Files changed:**
  - `src/contexts/AuthContext.tsx` — `signIn(token)` instead of `signIn(email, password)`; hardcoded identity `user@proposaltracker.local` (override via `VITE_AUTH_IDENTITY`); removed `resetPassword` and `updatePassword`
  - `src/pages/Auth.tsx` — Single "Access Token" field instead of email/password form; removed forgot-password dialog
  - `src/components/AppSidebar.tsx` — Removed "Change Password" menu item and all associated password UI (~120 lines)
  - `src/App.tsx` — Removed `/password-reset` route
  - `src/pages/PasswordReset.tsx` — **Deleted**
  - `.env.example` — Added `VITE_AUTH_IDENTITY` documentation
- **Key decisions:**
  - Hermes shares the same user account (same token stored in both password manager and Hermes config)
  - Token is just the PocketBase user's password
  - Token rotation requires updating: PocketBase admin → password manager → Hermes config
  - Goal: 2-year token duration (configured in PocketBase admin, not code)

### 3. Honcho Peer Registry Updates
- **Added `kimi`** to Core Peers — same domain as `claude` (coding sessions, tool usage, technical analysis)
- **Corrected `8535578727`** — moved from Legacy to Core Peers; labeled as active Telegram ID (not legacy)
- **Updated routing:** Claude/Kimi queries go to either or both peers interchangeably
- **Files updated:** `references/peers.md`, `SKILL.md`
- **Saved session facts to Honcho** (peer `john` and multi-peer `john` + `hermes`)

---

## Pending / Next Steps

### Immediate (before deployment)
1. **Set up PocketBase user for token auth**
   - **Dev (vps4 Docker):** `http://localhost:8091/_/` — superuser `admin@local.test` / `admin123456`
     - Port conflict exists: `lt-pocketbase` (legacy-transfer) occupies host port 8091
     - Fix: modify `docker-compose.local.yml` to remap Proposal Tracker PocketBase admin port (e.g., 8092:8091)
   - **Prod (fly.io):** `https://proposaltracker-api.fly.dev/_/` — use production admin creds
   - **Both:** Create/update user with email `user@proposaltracker.local` and a long random password (the token)
   - **Both:** Set token duration to ~2 years (PocketBase admin → Collections → users → gear → Options → Auth → Token duration)

2. **Test locally**
   - SSH tunnel from MacBook: `ssh -L 8080:localhost:8080 -L 8090:localhost:8090 vps4`
   - Start PocketBase: `docker compose -f docker-compose.local.yml up -d`
   - Start dev server: `npm run dev`
   - Open `http://localhost:8080` and test token login

3. **Deploy to fly.io from branch for live testing**
   - `fly deploy` (while on `token-auth` branch)
   - Test on `https://proposaltracker.net`
   - If good: merge to main, push, GitHub Actions auto-deploys

### Open Questions
- User wants to think about nuances of `kimi` peer inclusion in cross-peer queries
- User is rusty on PocketBase admin — step-by-step guidance needed

---

## Infrastructure (Confirmed April 2026)

### VPS Layout
| VPS | IP | Role | Notes |
|-----|-----|------|-------|
| vps8 | 72.60.27.146 | Homelab | Postgres, pgvector, Honcho. NOT for projects/repos. Connected to vps4 via persistent SSH tunnel (port 5433) |
| vps4 | 72.61.11.102 | Daily driver | Projects, repos, Claude Code. Docker available. Has `lt-pocketbase` on port 8091 |
| vps1 | 69.62.68.46 | The Vault | Obsidian, Hermes Agent. Single-purpose |
| vps2 | 31.97.131.163 | Apps | Lightly used, no repos |

### SSH Tunnels
- vps4 → vps8 Postgres: `127.0.0.1:5433` (systemd service `tunnel-vps8-postgres.service`)
- vps4 SSH config defines `vps1` and `vps8` entries

### Production URLs
| Service | URL |
|---------|-----|
| Frontend | `https://proposaltracker.net` |
| PocketBase API | `https://proposaltracker-api.fly.dev` |
| PocketBase Admin | `https://proposaltracker-api.fly.dev/_/` |

### CI/CD
- GitHub Actions auto-deploys to fly.io on push to `main`
- Manual deploy: `fly deploy` from local working directory (any branch)

---

**Current Branch:** `token-auth`
**Current Date:** April 23, 2026
**Repo:** act-hub (Proposal Tracker)
