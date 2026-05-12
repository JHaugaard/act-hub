# Status

## Where are we?

The proposal tracker is live at proposaltracker.net and in good shape. The app runs on a React/TypeScript frontend deployed to Fly.io, with a PocketBase backend (also Fly.io) holding the data.

Auth is token-based — a single long-lived token shared between the browser and Hermes. No email/password, no password reset flow.

This session cleaned up two things:

**Action Items removed.** The feature was never used, so all the code (page, table, dialog, hooks, types, nav link, dashboard button) has been deleted. The sidebar and dashboard are leaner for it.

**Agreement ID field added.** New proposals received after 2024-04-20 have an Agreement ID assigned by the grants office. The field (`agr_id`) is now on the Add Proposal form (optional, next to Cayuse), editable on each proposal's detail page, and included in the search bar. DB No. remains the daily working reference — agr_id is there for the eventual transition.

Both changes are live in production. The PocketBase `agr_id` field was added manually through the admin UI.

## What's unresolved?

Nothing urgent. One thing to watch: the `agr_id` field won't appear on proposals that predate this session — you'll need to fill those in manually as you encounter them. There's no bulk-import path for it yet.

## What's next?

The app is stable and complete for current needs. When you sit down next:
- Start entering Agreement IDs on active proposals as you encounter them
- If you ever want to do a bulk backfill of agr_id values for existing proposals, that would be a small import script — worth doing once you have a list
