# Project Learnings

## Date & Timezone Convention (2026-02-27)
- **Canonical display timezone:** US Eastern (`America/New_York`)
- **All date formatting** must go through `src/utils/dateUtils.ts`:
  - `formatDateOnly(dateStr, fmt?)` — for YYYY-MM-DD date strings (uses noon-UTC to prevent day shift)
  - `formatTimestamp(isoStr, fmt?)` — for ISO 8601 timestamps (converts to Eastern via `date-fns-tz`)
- **Storage format** remains ISO 8601 / YYYY-MM-DD — no timezone conversion on write
- **Dependency:** `date-fns-tz` (companion to `date-fns`)
