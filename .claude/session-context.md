# Session Context

## Current Focus
redeploy-assess: Considering a redeploy of act-hub (currently on Fly.io). Goal is a tidy repo before proceeding — sweep for cruft candidates to move into `/home/john/dev/cruft/<named-subfolder>` (never delete).

## Honcho Context
- act-hub = proposaltracker.net, React/Vite frontend + PocketBase/SQLite backend, deployed on Fly.io.
- Fly apps: `proposaltracker-api` (active, PocketBase backend), `proposaltracker-web` (suspended, frontend).
- Deploy mechanics: push to GitHub → CI/CD deploys to Fly.io. Requires SSH agent running on vps8 for the GitHub key (`~/.ssh/id_ed25519_github`); known issue that it doesn't auto-start.
- Last known clean push: commit `b42dc46` (June 8, 2026).
- Established cruft pattern (from mccoy-tyner project cleanup): move stale/superseded items to `/home/john/dev/cruft/<name>/`, never delete; confirm clean git status before pushing.
- Known risk flagged: check for a leftover `/home/john/dev/stable/act-hub-broken/` directory from a May 1 re-clone — **checked this session, does not exist.**
- Pre-redeploy checklist from Honcho: confirm SSH agent, git status clean, git log matches Fly.io state, review docs/.claude for stale artifacts, check fly.toml for config drift, verify proposaltracker-api health, then push.

## Key Decisions
-

## Notes
- Session started: 2026-07-05
- Untracked at session start: `tailnet-migation/vps8-tailnet-app-deploy-pattern.md` (single doc, not yet committed) — needs a decision: commit, or move out of repo.
