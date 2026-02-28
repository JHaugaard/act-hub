# Plan: Switch Auth from Email/Password to GitHub OAuth2

## Context

Single-user personal app (Proposal Tracker) on PocketBase. Email/password auth adds unnecessary complexity — password management UI, reset flows, token handling. GitHub OAuth2 replaces all of that with a single button. PocketBase has built-in OAuth2, so no new dependencies needed. Net effect: ~420 lines removed, ~47 added.

**Target**: Production on Fly.io. Local dev follows the same pattern.

**Production topology**:
- Frontend: `proposaltracker-web.fly.dev` / `proposaltracker.net` (static nginx)
- PocketBase API: `proposaltracker-api.fly.dev`

---

## Phase 1: Admin Setup (You Do This Before Code Changes)

### 1A. Create GitHub OAuth App

1. https://github.com/settings/developers → "New OAuth App"
2. Fill in:
   - **Application name**: `Proposal Tracker`
   - **Homepage URL**: `https://proposaltracker.net`
   - **Authorization callback URL**: `https://proposaltracker-api.fly.dev/api/oauth2-redirect`
3. Copy **Client ID**, generate + copy **Client Secret**

> For local dev later, you can either add a second OAuth app or update this one temporarily to `http://127.0.0.1:8090/api/oauth2-redirect`. GitHub allows only one callback URL per app.

### 1B. Enable GitHub in PocketBase Admin (Production)

1. Open `https://proposaltracker-api.fly.dev/_/`
2. Collections → `users` → gear icon → Options → OAuth2
3. Enable **GitHub**, paste Client ID + Secret, save

---

## Phase 2: Code Changes (5 Files)

### 2A. `src/contexts/AuthContext.tsx`
- **Remove**: `signIn(email, password)`, `resetPassword(email)`, `updatePassword(newPassword)` — methods + interface types
- **Add**: `signInWithGitHub()` → calls `pb.collection('users').authWithOAuth2({ provider: 'github' })`
- **Keep**: `user`, `isAuthenticated`, `loading`, `signOut()`, mock mode, authStore listener

### 2B. `src/pages/Auth.tsx`
- **Replace** email/password form + forgot-password dialog with single "Sign in with GitHub" button
- Uses `Github` icon from `lucide-react` (already installed)

### 2C. `src/components/AppSidebar.tsx`
- **Remove**: "Change Password" dropdown item + dialog (~130 lines of password UI + state)
- **Keep**: Edit Profile dialog, Sign Out, all navigation

### 2D. `src/App.tsx`
- **Remove**: `/password-reset` route and `PasswordReset` import (2 lines)

### 2E. Delete `src/pages/PasswordReset.tsx`
- Entire file (163 lines) — not needed with OAuth

### Files NOT changing:
- `ProtectedRoute.tsx` — still works (uses `user` + `loading`)
- `pocketbase/client.ts` — unchanged
- `fly.toml`, `Dockerfile` — no changes needed
- Mock mode — still auto-logs in as `dev@localhost`

---

## Phase 3: Commit, Push & Deploy

1. Commit all changes to main
2. Push to GitHub
3. `fly deploy` to deploy to production
4. Verify on production (see below)

---

## Phase 4: Verify on Production

1. Open `https://proposaltracker.net` → should see "Sign in with GitHub" button
2. Click → GitHub popup → authorize → popup closes → redirected to dashboard
3. Refresh → still logged in
4. Sidebar → Sign Out → back to auth page
5. Sidebar → Edit Profile → still works
6. Navigate to `/password-reset` → should show 404

---

## Risks & Notes

- **GitHub OAuth app must be created first** — the code won't work without it configured in both GitHub and PocketBase admin
- **Popup blocking**: PocketBase's `authWithOAuth2()` opens a popup. Implementation avoids the Safari async/await issue by calling it synchronously from the click handler.
- **Single provider**: GitHub is the only login method. If GitHub is down, you can't log in. Acceptable for a personal tool.
- **Existing user**: Your current email/password PocketBase user will persist. First GitHub OAuth login creates a new user record. You can merge/delete the old one in PocketBase admin afterward if desired.
