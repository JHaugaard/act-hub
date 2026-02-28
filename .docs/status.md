# Status

## Where are we?
The proposal tracker app is live at proposaltracker.net with PocketBase backend on fly.io. All core features work — proposals table, detail pages, file attachments, DB Distiller, PDF export, action items.

The last coding session (Feb 27) fixed a timezone inconsistency where dates could shift by a day depending on the user's browser timezone. All date display now goes through a shared utility (`src/utils/dateUtils.ts`) that pins everything to US Eastern time. Those changes are uncommitted on main — they compile and build cleanly but haven't been deployed yet.

This session (Feb 28) explored switching from email/password auth to GitHub OAuth2. After research and planning, the decision was made to shelve this — the app's expected useful life doesn't warrant the effort right now. A complete plan is saved at `.docs/github-oauth-plan.md` if you revisit it later. No code was changed.

## What's unresolved?
- The timezone changes from last session still need to be committed, pushed, and deployed. Visual spot-check recommended first.
- The GitHub OAuth migration plan is parked in `.docs/github-oauth-plan.md` — pick it up whenever it makes sense, or delete it if it never does.
- The Calendar date picker popover still uses local browser time for its label while saved/displayed values use Eastern. Only matters if editing from a non-Eastern timezone.

## What's next?
1. Run `npm run dev`, spot-check that dates look right on the proposals table and a file detail page
2. Commit and push the timezone changes to deploy via CI/CD
3. If you notice date weirdness in production, the single file to check is `src/utils/dateUtils.ts`
