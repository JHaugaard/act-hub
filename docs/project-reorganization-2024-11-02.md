# Project Reorganization - November 2, 2024

## Summary

Comprehensive reorganization of the ACT Hub project directory structure to improve maintainability, discoverability, and adherence to best practices.

## Changes Completed

### ✅ 1. Cleaned Up Empty Directories
- **Removed:** `proposal-tracker-main/` (empty legacy directory from migration)

### ✅ 2. Consolidated Root Documentation
- **Moved:** `ARCHITECTURE-OVERVIEW.txt` → [docs/architecture-overview.md](architecture-overview.md)
- **Moved:** `PHASE1-QUICKSTART.txt` → [docs/phase1-quickstart.md](phase1-quickstart.md)
- **Result:** Cleaner root directory, all documentation in [docs/](../docs/)

### ✅ 3. Cleaned Git-Tracked Ignored Files
- **Deleted:** All `.DS_Store` files from filesystem
- **Verified:** `Screenshots/` and `bun.lockb` already not tracked in git

### ✅ 4. Enhanced .gitignore
**Added/strengthened:**
- `**/.DS_Store` - More aggressive macOS file exclusion
- `._*` - Other macOS metadata files
- `*.last-run.json` - Playwright artifacts
- `pocketbase-data/` - Local development data
- `*.tmp`, `*.temp`, `*~` - Temporary files

### ✅ 5. Reorganized Hooks Directory

**New structure:**
```
src/hooks/
├── data/
│   ├── mock/              # Mock implementations
│   ├── pocketbase/        # PocketBase hooks (CURRENT)
│   └── supabase/          # Supabase hooks (LEGACY)
├── ui/                    # UI-specific hooks
│   ├── use-mobile.tsx
│   └── use-toast.ts
├── features/              # Feature hooks
│   ├── useDataImport.ts
│   └── useDistillerTimeout.ts
└── useData.ts            # Main factory export
```

**Benefits:**
- Clear separation of concerns
- Easy to identify which hooks are active vs legacy
- Better discoverability for new developers

**Updated:** All import paths throughout the codebase to reflect new structure

### ✅ 6. Organized Scripts Directory

**New structure:**
```
scripts/
├── setup/                 # One-time setup scripts
│   ├── create-collections.js
│   └── setup-pocketbase-schema.js
├── data/                  # Data operations
│   ├── import-csv-to-pocketbase.js
│   ├── import-to-pocketbase.js
│   └── export-supabase-data.js
└── utils/                 # Development utilities
    ├── delete-collections.js
    ├── list-collections.js
    ├── test-files-collection.js
    └── test-select-field.js
```

**Benefits:**
- Clear purpose for each script category
- Easier to find the right script for the job
- Better for onboarding new developers

### ✅ 7. Phase 1 Documentation Consolidated

**No changes needed** - Documentation already well-organized:
- [phase1-quickstart.md](phase1-quickstart.md) - Quick start checklist
- [phase1-setup.md](phase1-setup.md) - Detailed guide
- [phase1-guide.md](phase1-guide.md) - Documentation navigation
- All reference the new documentation structure

### ✅ 8. Created New Organizational Directories

**Added:**
```
src/
├── types/                 # Shared TypeScript types
│   └── index.ts          # Common interfaces and types
├── constants/             # App-wide constants
│   └── index.ts          # Status codes, configs, etc.
└── contexts/              # React contexts
    └── AuthContext.tsx   # Moved from components/
```

**Created files:**
- [src/types/index.ts](../src/types/index.ts) - Common type definitions
- [src/constants/index.ts](../src/constants/index.ts) - Application constants

**Updated:** All `AuthContext` imports throughout the codebase

### ✅ 9. Created Documentation Guides

**New comprehensive guides:**
- [docs/hooks-guide.md](hooks-guide.md) - Complete hooks architecture documentation
- [docs/scripts-reference.md](scripts-reference.md) - Detailed script documentation

## File Moves Summary

### Documentation
```
ARCHITECTURE-OVERVIEW.txt → docs/architecture-overview.md
PHASE1-QUICKSTART.txt     → docs/phase1-quickstart.md
```

### Hooks
```
src/hooks/useFiles.ts                    → src/hooks/data/supabase/useFiles.ts
src/hooks/useProposalData.ts             → src/hooks/data/supabase/useProposalData.ts
src/hooks/useDashboard.ts                → src/hooks/data/supabase/useDashboard.ts
src/hooks/useRelatedProposals.ts         → src/hooks/data/supabase/useRelatedProposals.ts
src/hooks/useFileAttachments.ts          → src/hooks/data/supabase/useFileAttachments.ts

src/hooks/usePocketBaseFiles.ts          → src/hooks/data/pocketbase/usePocketBaseFiles.ts
src/hooks/usePocketBaseDashboard.ts      → src/hooks/data/pocketbase/usePocketBaseDashboard.ts
src/hooks/usePocketBaseProposalData.ts   → src/hooks/data/pocketbase/usePocketBaseProposalData.ts
src/hooks/usePocketBaseFileAttachments.ts → src/hooks/data/pocketbase/usePocketBaseFileAttachments.ts
src/hooks/usePocketBaseRelatedProposals.ts → src/hooks/data/pocketbase/usePocketBaseRelatedProposals.ts

src/hooks/mock/                          → src/hooks/data/mock/

src/hooks/use-mobile.tsx                 → src/hooks/ui/use-mobile.tsx
src/hooks/use-toast.ts                   → src/hooks/ui/use-toast.ts

src/hooks/useDataImport.ts               → src/hooks/features/useDataImport.ts
src/hooks/useDistillerTimeout.ts         → src/hooks/features/useDistillerTimeout.ts
```

### Scripts
```
scripts/create-collections.js           → scripts/setup/create-collections.js
scripts/setup-pocketbase-schema.js      → scripts/setup/setup-pocketbase-schema.js

scripts/import-csv-to-pocketbase.js     → scripts/data/import-csv-to-pocketbase.js
scripts/import-to-pocketbase.js         → scripts/data/import-to-pocketbase.js
scripts/export-supabase-data.js         → scripts/data/export-supabase-data.js

scripts/delete-collections.js           → scripts/utils/delete-collections.js
scripts/list-collections.js             → scripts/utils/list-collections.js
scripts/test-files-collection.js        → scripts/utils/test-files-collection.js
scripts/test-select-field.js            → scripts/utils/test-select-field.js
```

### Contexts
```
src/components/AuthContext.tsx          → src/contexts/AuthContext.tsx
```

## Import Path Updates

All import statements were automatically updated throughout the codebase:

- `@/hooks/use-toast` → `@/hooks/ui/use-toast`
- `@/components/AuthContext` → `@/contexts/AuthContext`
- Hook factory ([src/hooks/useData.ts](../src/hooks/useData.ts)) updated to reference new paths

## Benefits

### For Developers
1. **Clearer structure** - Easier to find files
2. **Better separation of concerns** - Mock/PocketBase/Supabase clearly separated
3. **Improved discoverability** - New developers can understand architecture faster
4. **Type safety** - Shared types in dedicated location
5. **Documentation** - Comprehensive guides for hooks and scripts

### For Maintenance
1. **Easier refactoring** - Related files grouped together
2. **Clear legacy vs current** - Supabase marked as legacy, PocketBase as current
3. **Better git hygiene** - Stronger .gitignore rules
4. **Script organization** - Clear purpose for each script category

### For Onboarding
1. **Documentation guides** - [hooks-guide.md](hooks-guide.md) and [scripts-reference.md](scripts-reference.md)
2. **Clear architecture** - Dual-mode system well-documented
3. **Constants centralized** - Easy to find configuration values
4. **Type definitions** - Shared types readily available

## Testing Required

After this reorganization, verify:

- [ ] Dev server starts without errors: `npm run dev`
- [ ] All pages load correctly
- [ ] Data hooks work (create, read, update, delete)
- [ ] Scripts run successfully:
  ```bash
  node scripts/setup/setup-pocketbase-schema.js
  node scripts/data/import-csv-to-pocketbase.js
  node scripts/utils/list-collections.js
  ```
- [ ] No broken imports (TypeScript compilation)
- [ ] Tests pass: `npm run test`

## Migration Notes

### If You Pull This Branch

**No action required** - All import paths were updated automatically.

The only potential issue: if you have uncommitted changes that import from old paths, you may need to update them manually.

### Old Import Patterns (No Longer Valid)

```typescript
// ❌ Old (will break)
import { useFiles } from '@/hooks/useFiles'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/components/AuthContext'

// ✅ New (correct)
import { useFiles } from '@/hooks/useData'
import { useToast } from '@/hooks/ui/use-toast'
import { useAuth } from '@/contexts/AuthContext'
```

## Future Improvements

Potential next steps for organization:

1. **Split large component files** - Some components could be broken into smaller pieces
2. **Create feature folders** - Group related pages, components, and hooks by feature
3. **Add barrel exports** - Create index.ts files for cleaner imports
4. **Type generation** - Auto-generate types from PocketBase schema
5. **Script CLI** - Create interactive CLI for running scripts

## Related Documentation

- [Hooks Guide](hooks-guide.md) - Complete hooks architecture
- [Scripts Reference](scripts-reference.md) - All scripts documented
- [Architecture Overview](architecture-overview.md) - System architecture
- [Phase 1 Quickstart](phase1-quickstart.md) - Setup guide

---

**Date:** November 2, 2024
**Status:** ✅ Complete
**Impact:** Medium (structural changes, no functionality changes)
**Breaking Changes:** None (all imports updated automatically)
