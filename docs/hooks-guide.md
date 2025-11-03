# Hooks Architecture Guide

## Overview

This application uses a **hook factory pattern** to seamlessly switch between different data sources (Mock, PocketBase, Supabase) without changing any component code.

## Directory Structure

```
src/hooks/
├── data/
│   ├── mock/              # Mock implementations (localStorage)
│   │   ├── useMockFiles.ts
│   │   ├── useMockProposalData.ts
│   │   ├── useMockDashboard.ts
│   │   ├── useMockRelatedProposals.ts
│   │   └── useMockFileAttachments.ts
│   │
│   ├── pocketbase/        # PocketBase implementations (CURRENT PRODUCTION)
│   │   ├── usePocketBaseFiles.ts
│   │   ├── usePocketBaseProposalData.ts
│   │   ├── usePocketBaseDashboard.ts
│   │   ├── usePocketBaseRelatedProposals.ts
│   │   └── usePocketBaseFileAttachments.ts
│   │
│   └── supabase/          # Supabase implementations (LEGACY)
│       ├── useFiles.ts
│       ├── useProposalData.ts
│       ├── useDashboard.ts
│       ├── useRelatedProposals.ts
│       └── useFileAttachments.ts
│
├── ui/                    # UI-specific hooks
│   ├── use-mobile.tsx     # Responsive design utilities
│   └── use-toast.ts       # Toast notifications
│
├── features/              # Feature-specific hooks
│   ├── useDataImport.ts   # CSV/data import functionality
│   └── useDistillerTimeout.ts  # DB Distiller timeout management
│
└── useData.ts            # HOOK FACTORY (main export point)
```

## How It Works

### The Hook Factory Pattern

**[src/hooks/useData.ts](../src/hooks/useData.ts)** acts as a factory that exports the correct hooks based on the `VITE_DATA_SOURCE` environment variable:

```typescript
// Components always import from useData.ts
import { useFiles, usePIs, useSponsors } from '@/hooks/useData'

// At runtime, these resolve to the correct implementation:
// - If VITE_DATA_SOURCE="mock" → uses mock hooks
// - If VITE_DATA_SOURCE="pocketbase" → uses PocketBase hooks
// - If VITE_DATA_SOURCE="supabase" → uses Supabase hooks
```

### Configuration

Set your data source in [.env](.env):

```bash
# For mock data (development/testing)
VITE_DATA_SOURCE="mock"

# For PocketBase (current production)
VITE_DATA_SOURCE="pocketbase"
VITE_POCKETBASE_URL="http://localhost:8090"

# For Supabase (legacy)
VITE_DATA_SOURCE="supabase"
VITE_SUPABASE_URL="..."
VITE_SUPABASE_PUBLISHABLE_KEY="..."
```

**Important:** Always restart the dev server after changing `.env` for changes to take effect.

## Available Hooks

### Data Hooks

All data hooks are exported from `@/hooks/useData`:

#### `useFiles()`
Manages proposal/file records.

**Returns:**
- `files`: Array of file records
- `isLoading`: Loading state
- `createFile()`: Create new file
- `updateFile()`: Update existing file
- `deleteFile()`: Delete file
- `refetch()`: Manually refetch data

**Example:**
```typescript
import { useFiles } from '@/hooks/useData'

const MyComponent = () => {
  const { files, isLoading, createFile } = useFiles();

  const handleCreate = async (data) => {
    await createFile(data);
  };

  // ...
}
```

#### `usePIs()` / `useSponsors()`
Manages Principal Investigators and Sponsors.

**Returns:**
- `pis` / `sponsors`: Array of records
- `isLoading`: Loading state
- `createPI()` / `createSponsor()`: Create new record
- `updatePI()` / `updateSponsor()`: Update record
- `deletePI()` / `deleteSponsor()`: Delete record

#### `useDashboard()`
Provides dashboard statistics and metrics.

**Returns:**
- `stats`: Dashboard statistics object
- `recentProposals`: Recent proposal records
- `isLoading`: Loading state

#### `useRelatedProposals(fileId)`
Fetches proposals related to a given file.

**Parameters:**
- `fileId`: ID of the file to find relations for

**Returns:**
- `relatedProposals`: Array of related proposals
- `isLoading`: Loading state

#### `useFileAttachments(fileId)`
Manages file attachments for proposals.

**Parameters:**
- `fileId`: ID of the file/proposal

**Returns:**
- `attachments`: Array of attachment records
- `isLoading`: Loading state
- `uploadAttachment()`: Upload new attachment
- `deleteAttachment()`: Delete attachment

### UI Hooks

#### `useToast()`
Show toast notifications. Located in [src/hooks/ui/use-toast.ts](../src/hooks/ui/use-toast.ts).

**Example:**
```typescript
import { useToast } from '@/hooks/ui/use-toast'

const MyComponent = () => {
  const { toast } = useToast();

  const showSuccess = () => {
    toast({
      title: "Success",
      description: "Operation completed",
    });
  };
}
```

#### `useMobile()`
Detect mobile viewport. Located in [src/hooks/ui/use-mobile.tsx](../src/hooks/ui/use-mobile.tsx).

**Returns:**
- `isMobile`: boolean indicating if viewport is mobile-sized

### Feature Hooks

#### `useDataImport()`
Handle CSV/data imports. Located in [src/hooks/features/useDataImport.ts](../src/hooks/features/useDataImport.ts).

#### `useDistillerTimeout()`
Manage DB Distiller auto-timeout. Located in [src/hooks/features/useDistillerTimeout.ts](../src/hooks/features/useDistillerTimeout.ts).

## Adding New Data Hooks

When adding new data operations, follow this pattern:

### 1. Create Mock Implementation

Create [src/hooks/data/mock/useMockYourFeature.ts](../src/hooks/data/mock/):

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';
import { mockStorage } from '@/lib/mockStorage';

export const useMockYourFeature = () => {
  const query = useQuery({
    queryKey: ['yourFeature'],
    queryFn: () => mockStorage.getAll('your_storage_key'),
  });

  // Add mutations...

  return {
    data: query.data,
    isLoading: query.isLoading,
    // ...
  };
};
```

### 2. Create PocketBase Implementation

Create [src/hooks/data/pocketbase/usePocketBaseYourFeature.ts](../src/hooks/data/pocketbase/):

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';
import { pb } from '@/integrations/pocketbase/client';

export const usePocketBaseYourFeature = () => {
  const query = useQuery({
    queryKey: ['yourFeature'],
    queryFn: () => pb.collection('your_collection').getFullList(),
  });

  // Add mutations...

  return {
    data: query.data,
    isLoading: query.isLoading,
    // ...
  };
};
```

### 3. Export from Hook Factory

Update [src/hooks/useData.ts](../src/hooks/useData.ts):

```typescript
// Import implementations
import { useMockYourFeature } from './data/mock/useMockYourFeature';
import { usePocketBaseYourFeature } from './data/pocketbase/usePocketBaseYourFeature';

// Add to exports
export const useYourFeature = USE_MOCK_DATA
  ? useMockYourFeature
  : USE_POCKETBASE
    ? usePocketBaseYourFeature
    : useRealYourFeature;
```

### 4. Use in Components

```typescript
import { useYourFeature } from '@/hooks/useData'

const MyComponent = () => {
  const { data, isLoading } = useYourFeature();
  // Component automatically uses correct backend!
}
```

## Best Practices

1. **Always import from `@/hooks/useData`** - Never import data hooks directly from their implementation files
2. **Use TanStack Query** - All data hooks should use `useQuery` and `useMutation` for consistency
3. **Match interfaces** - Mock, PocketBase, and Supabase implementations must return the same shape
4. **Handle loading states** - Always expose `isLoading` from data hooks
5. **Error handling** - Use try/catch in mutations and show user-friendly error messages
6. **Refetch support** - Expose `refetch()` method for manual data updates

## Troubleshooting

### "Cannot find module '@/hooks/useData'"

Make sure your import path is correct and the file exists at [src/hooks/useData.ts](../src/hooks/useData.ts).

### "Data not updating after switch"

Restart your dev server after changing `VITE_DATA_SOURCE` in `.env`:
```bash
# Stop the server (Ctrl+C)
npm run dev
```

### "Hook returns undefined"

Check that:
1. The correct data source is configured in `.env`
2. For PocketBase: The container is running and accessible
3. For Mock: localStorage is not disabled in your browser
4. The collection/storage key exists

### Console shows "Data Source: MOCK" but expected PocketBase

Check [.env](.env) file:
```bash
# Should be:
VITE_DATA_SOURCE="pocketbase"

# NOT:
VITE_USE_MOCK_DATA="true"  # This is the old variable name
```

## Migration Notes

### From Old to New Structure

If you have code importing hooks from old locations:

**Old:**
```typescript
import { useFiles } from '@/hooks/useFiles'
import { usePocketBaseFiles } from '@/hooks/usePocketBaseFiles'
```

**New:**
```typescript
import { useFiles } from '@/hooks/useData'
// PocketBase vs Supabase vs Mock is handled automatically
```

The factory pattern eliminates the need for conditional imports in components.
