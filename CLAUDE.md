# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
```bash
npm install          # Install dependencies
npm run dev          # Start dev server (http://localhost:8080)
npm run build        # Production build
npm run build:dev    # Development build
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Data Source Control
The application has **dual-mode architecture** controlled by environment variable:

```bash
# .env file
VITE_USE_MOCK_DATA="true"   # Use localStorage (no backend needed)
VITE_USE_MOCK_DATA="false"  # Use Supabase backend
```

**CRITICAL**: Always restart dev server after changing `.env` to apply new mode.

Check console for: `🔧 Data Source: MOCK (localStorage)` or `SUPABASE (cloud)`

### Clear Mock Data
```javascript
// In browser DevTools console
localStorage.clear()
// Then refresh page to regenerate sample data
```

## Architecture

### Dual-Mode Data Layer (Most Important!)

This app uses a **hook factory pattern** to seamlessly switch between mock and real data:

**Entry Point**: `src/hooks/useData.ts`
- Reads `VITE_USE_MOCK_DATA` from `src/config/dataSource.ts`
- Exports either mock hooks (`src/hooks/mock/*`) or real Supabase hooks
- Components import from `@/hooks/useData` only - never directly from individual hooks

**Implementation Flow**:
```typescript
// ✅ ALWAYS import from useData
import { useFiles, usePIs, useSponsors } from '@/hooks/useData'

// ❌ NEVER import directly (breaks dual-mode)
import { useFiles } from '@/hooks/useFiles'  // Wrong!
```

**Hook Pairs**:
- `useFiles` → `useMockFiles` / `useRealFiles`
- `usePIs`, `useSponsors` → `useMockProposalData` / `useRealProposalData`
- `useDashboard` → `useMockDashboard` / `useRealDashboard`
- `useRelatedProposals` → `useMockRelatedProposals` / `useRealRelatedProposals`
- `useFileAttachments` → `useMockFileAttachments` / `useRealFileAttachments`

### Mock Storage System

**Core Files**:
- `src/lib/mockStorage.ts` - localStorage wrapper mimicking Supabase API (CRUD operations)
- `src/lib/mockData.ts` - Sample data generator (36 proposals, 12 PIs, 14 sponsors)

**Storage Keys**:
```typescript
STORAGE_KEYS = {
  FILES: 'mock_files',           // Proposals
  PIS: 'mock_pis',              // Principal Investigators
  SPONSORS: 'mock_sponsors',     // Sponsors
  FILE_ATTACHMENTS: 'mock_file_attachments'
}
```

**Mock API Methods**: `getAll`, `getById`, `insert`, `update`, `delete`, `query`, `setInitialData`, `clearAll`

### State Management

**TanStack Query v5** (`@tanstack/react-query`) for all server state:
- QueryClient configured in `src/App.tsx`
- All data hooks use `useQuery` and mutations
- Automatic caching, background refetching, optimistic updates

**Client-side filtering**: Search, filter, sort operations happen in browser (no network calls after initial fetch)

### Routing & Navigation

**React Router v6** with protected routes:
- All routes wrapped in `<ProtectedRoute>` (auth currently mocked)
- Main routes: `/`, `/proposals`, `/proposals/:id`, `/pis`, `/sponsors`, `/distiller`
- Layout: `AppLayout` → `AppSidebar` + `AppHeader` + page content

### UI Architecture

**shadcn/ui** components (in `src/components/ui/`):
- Components are **copied into project** (not npm package)
- Can be customized directly
- Built on Radix UI primitives + Tailwind CSS

**Form Handling**:
- React Hook Form + Zod validation
- Pattern: `useForm` → `zodResolver(schema)` → submit handler

### Database Schema (Supabase Mode)

**Tables**: `files` (proposals), `pis`, `sponsors`, `file_attachments`, `profiles`

**Key Relationships**:
- `files.pi_id` → `pis.id`
- `files.sponsor_id` → `sponsors.id`
- `file_attachments.file_id` → `files.id`

**Migrations**: `supabase/migrations/*.sql` - apply these to self-hosted Supabase

## Critical Patterns

### Adding New Data Hooks

When creating new data operations:

1. **Create mock version** in `src/hooks/mock/useMockYourFeature.ts`
2. **Create real version** using Supabase in `src/hooks/useYourFeature.ts`
3. **Export from useData.ts**:
   ```typescript
   import { useMockYourFeature } from './mock/useMockYourFeature'
   import { useYourFeature as useRealYourFeature } from './useYourFeature'

   export const useYourFeature = USE_MOCK_DATA ? useMockYourFeature : useRealYourFeature
   ```
4. **Import in components**: `import { useYourFeature } from '@/hooks/useData'`

### DB Distiller Feature

**Location**: `src/pages/DBDistiller.tsx`

**Unique Aspects**:
- **Pure client-side** - works independently of data mode
- Excel file processing using `xlsx` library
- Custom filtering logic in `src/utils/distiller/spreadsheetProcessor.ts`
- Fixed 7 statuses with color coding for print
- Auto-timeout functionality (5 minutes)

### File Attachments

**Mock Mode**: Files stored as base64 in localStorage (limited size)
**Supabase Mode**: Files in Supabase Storage bucket `file-attachments`

Handle both modes in `useFileAttachments` hook.

## Environment Variables

Required in `.env` (never commit this file):

```bash
# Mode selector
VITE_USE_MOCK_DATA="true"

# Supabase config (only used when VITE_USE_MOCK_DATA="false")
VITE_SUPABASE_PROJECT_ID="..."
VITE_SUPABASE_URL="..."
VITE_SUPABASE_PUBLISHABLE_KEY="..."
```

## Migration Context

This project was **migrated from Lovable.dev** to enable:
- Self-hosted deployment
- Independent development
- Mock mode for offline work

**Original Lovable Supabase** can still be accessed by setting `VITE_USE_MOCK_DATA="false"` with original credentials.

## Adding New Routes

1. Create page component in `src/pages/YourPage.tsx`
2. Add route in `src/App.tsx`:
   ```typescript
   <Route path="/your-path" element={<ProtectedRoute><YourPage /></ProtectedRoute>} />
   ```
3. Add navigation link in `src/components/AppSidebar.tsx`

## Key Files Reference

- `src/hooks/useData.ts` - Hook factory (mode switcher)
- `src/config/dataSource.ts` - Mode configuration
- `src/lib/mockStorage.ts` - Mock database API
- `src/lib/mockData.ts` - Sample data
- `src/integrations/supabase/client.ts` - Supabase client
- `src/integrations/supabase/types.ts` - Database types (auto-generated)

## Deployment

See `DEPLOYMENT.md` for self-hosted Supabase setup and VPS deployment instructions.
