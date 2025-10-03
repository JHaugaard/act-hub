# Research Proposal Tracker - Technical Documentation

## Table of Contents
1. [Application Overview](#application-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture](#architecture)
4. [Core Features](#core-features)
5. [Database Schema](#database-schema)
6. [Application Structure](#application-structure)
7. [Key Components & Pages](#key-components--pages)
8. [Data Flow & State Management](#data-flow--state-management)
9. [How It All Fits Together](#how-it-all-fits-together)

---

## Application Overview

This is a **full-stack research proposal tracking application** designed to help research administrators manage:
- Research proposals (submissions, status tracking, deadlines)
- Principal Investigators (PIs)
- Sponsor organizations
- File attachments for proposals
- Excel-based data import and filtering (DB Distiller feature)

The app provides a complete CRUD (Create, Read, Update, Delete) interface with search, filtering, and relationship management between proposals, PIs, and sponsors.

---

## Technology Stack

### Frontend
- **React 18.3.1** - UI library
- **TypeScript** - Type safety and better developer experience
- **Vite** - Build tool and development server (fast HMR)
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Pre-built accessible UI components (built on Radix UI)
- **React Router v6** - Client-side routing
- **TanStack Query v5** - Server state management and data fetching

### UI Component Libraries
- **Radix UI** - Headless, accessible component primitives
- **Lucide React** - Icon library
- **date-fns** - Date manipulation and formatting
- **Recharts** - Charting library (available for future use)

### Backend & Infrastructure
- **Supabase** - Backend-as-a-Service providing:
  - PostgreSQL database
  - Authentication (currently disabled for development)
  - Storage for file attachments
  - Row-Level Security (RLS) policies
  - Real-time subscriptions (available but not currently used)

### Data Processing
- **XLSX (SheetJS)** - Excel file parsing and processing
- **PapaParse** - CSV parsing (available)

### Form Management
- **React Hook Form** - Form state management
- **Zod** - Schema validation
- **@hookform/resolvers** - Integration between RHF and Zod

---

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       USER BROWSER                           │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              React Application (Vite)                  │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐ │  │
│  │  │   Pages     │  │  Components  │  │    Hooks     │ │  │
│  │  │ (Routes)    │  │    (UI)      │  │  (Logic)     │ │  │
│  │  └─────────────┘  └──────────────┘  └──────────────┘ │  │
│  │         │                 │                 │          │  │
│  │         └─────────────────┴─────────────────┘          │  │
│  │                         │                               │  │
│  │              ┌──────────▼──────────┐                   │  │
│  │              │  TanStack Query     │                   │  │
│  │              │  (Data Fetching)    │                   │  │
│  │              └──────────┬──────────┘                   │  │
│  │                         │                               │  │
│  │              ┌──────────▼──────────┐                   │  │
│  │              │  Supabase Client    │                   │  │
│  │              │  (@supabase/...)    │                   │  │
│  │              └──────────┬──────────┘                   │  │
│  └───────────────────────────┼──────────────────────────────┘
│                              │                               │
└──────────────────────────────┼───────────────────────────────┘
                               │ HTTPS
                               │
┌──────────────────────────────▼───────────────────────────────┐
│                    SUPABASE BACKEND                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │  PostgreSQL  │  │   Auth (*)   │  │   Storage    │       │
│  │   Database   │  │   Service    │  │   Buckets    │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│                                                               │
│  * Currently disabled for development                        │
└───────────────────────────────────────────────────────────────┘
```

### Application Flow

```
1. User navigates → React Router matches route → Page component loads
2. Page uses custom hooks → Hooks use TanStack Query → Queries Supabase
3. Supabase returns data → TanStack Query caches → React renders UI
4. User interacts → Form submission/mutation → Supabase updates
5. TanStack Query invalidates cache → Re-fetches → UI updates
```

---

## Core Features

### 1. Dashboard
- **Overview cards** showing counts by proposal status (In, Pending, Pending Signatures, Process)
- **Click-to-filter** - Click any status card to view proposals in that status
- **Quick add** proposal button

### 2. Proposals Management
- **Full CRUD operations** on proposals
- **Advanced search** - Search across DB#, PI name, Sponsor, Cayuse ID
- **Status filtering** - Filter by proposal status with live counts
- **Sorting** - Sort by any column (DB#, Date Received, PI, Sponsor, Status, etc.)
- **Related entities** - Click PI or Sponsor to see related proposals in popover
- **File attachments** - Upload and manage multiple files per proposal
- **Status tracking** with automatic timestamp updates

### 3. PI (Principal Investigator) Management
- **List all PIs** with search and alphabetical filtering
- **Add new PIs** with autocomplete (prevents duplicates)
- **Edit PI names**
- **Related proposals popover** - Click PI to see all their proposals
- **Quick navigation** to proposals

### 4. Sponsor Management
- **List all sponsors** with search and alphabetical filtering
- **Add new sponsors** with autocomplete
- **Edit sponsor names**
- **Related proposals popover** - Click sponsor to see all proposals
- **Alphabetical quick filter** sidebar

### 5. DB Distiller (Excel Processor)
- **Upload Excel files** (.xlsx, .xls) with drag-and-drop
- **Automatic column mapping** - Intelligently maps Excel columns to expected fields
- **Smart date parsing** - Handles Excel serial numbers and various date formats
- **Filtering**:
  - Hard-coded filter for "Haugaard" in GCO/GCA/SCCO field
  - Checkbox filters for 7 proposal statuses
- **Color-coded status badges** - Different colors for each status (display and print)
- **Print functionality** - Print filtered results with properly styled badges
- **Auto-timeout** - Resets after period of inactivity (security feature)
- **Re-upload capability** - Process multiple files in session

### 6. File Attachments
- **Upload files** to Supabase Storage
- **Download files** via signed URLs
- **Delete attachments** with confirmation
- **File metadata** tracking (name, size, upload date)

---

## Database Schema

### Tables

#### `files` (Proposals)
Primary table for research proposals.

```sql
- id (uuid, primary key)
- db_no (text, unique identifier, auto-normalized)
- pi_id (uuid, foreign key → pis.id)
- sponsor_id (uuid, foreign key → sponsors.id)
- cayuse (text, external system ID)
- status (enum: 'In', 'Process', 'Pending', 'Pending Signatures', etc.)
- date_received (date)
- date_status_change (timestamp)
- to_set_up (date, deadline)
- notes (text)
- external_link (text)
- created_at (timestamp)
- updated_at (timestamp, auto-updated via trigger)
```

**Trigger**: `normalize_db_no()` - Removes "DB " prefix on insert/update

#### `pis` (Principal Investigators)
```sql
- id (uuid, primary key)
- name (text, unique, required)
- created_at (timestamp)
```

#### `sponsors`
```sql
- id (uuid, primary key)
- name (text, unique, required)
- created_at (timestamp)
```

#### `file_attachments`
```sql
- id (uuid, primary key)
- file_id (uuid, foreign key → files.id)
- filename (text)
- file_path (text, path in Supabase Storage)
- file_size (integer, bytes)
- uploaded_at (timestamp)
```

#### `profiles` (User Profiles)
```sql
- id (uuid, primary key)
- user_id (uuid, foreign key → auth.users.id)
- display_name (text)
- last_name (text)
- created_at (timestamp)
- updated_at (timestamp)
```

### Row-Level Security (RLS)

All tables have RLS enabled with policies like:
- **Files**: "Authenticated users can manage Files" (ALL operations)
- **PIs**: "Authenticated users can manage PIs" (ALL operations)
- **Sponsors**: "Authenticated users can manage Sponsors" (ALL operations)
- **Profiles**: Users can only view/edit their own profile

*Note: Authentication is currently disabled for development, so RLS isn't actively enforced.*

### Storage Bucket

- **`file-attachments`** (private bucket)
  - Stores uploaded files for proposals
  - Access via signed URLs

---

## Application Structure

```
src/
├── App.tsx                    # Root component, routing setup
├── main.tsx                   # Entry point
├── index.css                  # Global styles, Tailwind directives
│
├── components/                # Reusable UI components
│   ├── AppHeader.tsx          # Top header with breadcrumbs
│   ├── AppLayout.tsx          # Main layout wrapper
│   ├── AppSidebar.tsx         # Collapsible sidebar with navigation
│   ├── AuthContext.tsx        # Auth provider (mock for now)
│   ├── ProtectedRoute.tsx     # Route guard (disabled)
│   ├── ProposalForm.tsx       # Create/edit proposal form
│   ├── ProposalsTable.tsx     # Table displaying proposals
│   ├── SearchBar.tsx          # Search input with results count
│   ├── StatusFilters.tsx      # Status filter chips
│   ├── FileAttachmentsManager.tsx  # File upload/download UI
│   ├── RelatedProposalsPopover.tsx # Popover showing related proposals
│   ├── HighlightText.tsx      # Text highlighting for search results
│   │
│   ├── distiller/             # DB Distiller components
│   │   ├── DataTable.tsx      # Display processed Excel data
│   │   ├── FileUpload.tsx     # Drag-drop Excel upload
│   │   └── StatusFilter.tsx   # Checkbox status filters
│   │
│   └── ui/                    # shadcn/ui components (40+ files)
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── form.tsx
│       ├── input.tsx
│       ├── select.tsx
│       ├── table.tsx
│       └── ... (many more)
│
├── hooks/                     # Custom React hooks
│   ├── use-mobile.tsx         # Responsive breakpoint detection
│   ├── use-toast.ts           # Toast notification hook
│   ├── useDashboard.ts        # Dashboard stats logic
│   ├── useDataImport.ts       # CSV import logic
│   ├── useDistillerTimeout.ts # Distiller auto-timeout
│   ├── useFileAttachments.ts  # File attachment operations
│   ├── useFiles.ts            # Proposals CRUD + filtering
│   ├── useProposalData.ts     # PIs & Sponsors CRUD
│   └── useRelatedProposals.ts # Fetch related proposals
│
├── integrations/
│   └── supabase/
│       ├── client.ts          # Supabase client instance
│       └── types.ts           # Auto-generated DB types
│
├── lib/
│   └── utils.ts               # Utility functions (cn, etc.)
│
├── pages/                     # Route pages
│   ├── Index.tsx              # Dashboard (home)
│   ├── Auth.tsx               # Login/signup (not active)
│   ├── PasswordReset.tsx      # Password reset flow
│   ├── Dashboard.tsx          # Dashboard content
│   ├── Proposals.tsx          # Proposals list
│   ├── FileDetail.tsx         # Single proposal detail
│   ├── PIs.tsx                # PI management
│   ├── EditPI.tsx             # Edit PI form
│   ├── Sponsors.tsx           # Sponsor management
│   ├── EditSponsor.tsx        # Edit sponsor form
│   ├── DBDistiller.tsx        # Excel processor tool
│   ├── ImportData.tsx         # CSV import tool
│   └── NotFound.tsx           # 404 page
│
└── utils/
    ├── fileUtils.ts           # File upload/download helpers
    └── distiller/
        ├── spreadsheetProcessor.ts  # Parse Excel files
        └── spreadsheetFilter.ts     # Filter & color logic
```

---

## Key Components & Pages

### Core Pages

#### 1. **Dashboard** (`src/pages/Dashboard.tsx`)
- Displays 4 status cards with proposal counts
- Uses `useDashboard()` hook to fetch statistics
- Click-to-filter functionality
- Quick add proposal dialog

**Key Logic:**
```typescript
const { stats, loading } = useDashboard();
// stats.statusCounts = { 'In': 5, 'Pending': 3, ... }
```

#### 2. **Proposals** (`src/pages/Proposals.tsx`)
- Full proposal management interface
- Uses `useFiles()` hook for data fetching and mutations
- Search bar with real-time filtering
- Status filter chips with counts
- Sortable table with status change capability

**Key Logic:**
```typescript
const {
  files,              // Filtered proposal list
  statusFilter,       // Current status filter
  searchQuery,        // Current search text
  statusCounts,       // Counts per status
  updateFileStatus,   // Mutation to change status
  refetch             // Manual refresh
} = useFiles();
```

#### 3. **DBDistiller** (`src/pages/DBDistiller.tsx`)
The most unique feature - processes Excel spreadsheets.

**Workflow:**
1. User uploads Excel file
2. `processExcelFile()` parses it using XLSX library
3. Auto-detects columns using flexible mapping
4. Filters by "Haugaard" in GCO/GCA/SCCO column
5. User selects statuses to display
6. Results shown in table with color-coded badges
7. Print function generates styled printout
8. Auto-timeout clears data after inactivity

**Key Constants:**
```typescript
const FIXED_STATUSES = [
  'OSRAA Review',
  'Out for Review',
  'Requested',
  'Internal Docs/Info Requested',
  'Out for Signature',
  'External Docs/Info Requested',
  'Set-Up in Process'
];
```

**Color Coding:**
- Each status has distinct pastel color for both screen and print
- `getStatusColor()` - Returns Tailwind classes for display
- `getStatusColorForPrint()` - Returns hex codes for print

#### 4. **PIs & Sponsors Pages**
Similar structure for both:
- Alphabetical list with search
- A-Z quick filter sidebar
- Autocomplete input to prevent duplicates
- Related proposals popover on click
- Edit capability for each entry

### Key Components

#### **AppSidebar** (`src/components/AppSidebar.tsx`)
- Collapsible sidebar using shadcn/ui sidebar component
- Navigation menu with active state highlighting
- User dropdown with profile edit and password change
- Links to all main sections

#### **ProposalForm** (`src/components/ProposalForm.tsx`)
- Complex form using React Hook Form + Zod validation
- Autocomplete for PI and Sponsor selection (prevents duplicates)
- All proposal fields (DB#, dates, status, notes, etc.)
- Create or edit mode

#### **FileAttachmentsManager** (`src/components/FileAttachmentsManager.tsx`)
- File upload with progress tracking
- File list with download and delete actions
- Integrates with Supabase Storage

#### **RelatedProposalsPopover** (`src/components/RelatedProposalsPopover.tsx`)
- Reusable component for showing related proposals
- Triggered by clicking PI or Sponsor name
- Displays proposals in a popover with search
- Click proposal to navigate to detail page

---

## Data Flow & State Management

### Data Fetching Pattern

The app uses **TanStack Query** (React Query) for all server state:

```typescript
// Example from useFiles.ts
const { data: files, isLoading, refetch } = useQuery({
  queryKey: ['files'],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('files')
      .select(`
        *,
        pi:pis(name),
        sponsor:sponsors(name)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }
});
```

**Benefits:**
- Automatic caching
- Background refetching
- Loading and error states
- Optimistic updates

### Mutations Pattern

```typescript
const updateStatus = async (fileId: string, newStatus: string) => {
  const { error } = await supabase
    .from('files')
    .update({ 
      status: newStatus,
      date_status_change: new Date().toISOString()
    })
    .eq('id', fileId);

  if (!error) {
    queryClient.invalidateQueries({ queryKey: ['files'] });
  }
};
```

### Client-Side Filtering

Many filters happen client-side for performance:
- Search query filtering
- Status filtering
- Alphabetical filtering
- Sorting

This is efficient because:
1. Initial data fetch loads all proposals
2. TanStack Query caches the data
3. Filters operate on cached data (no network calls)
4. Only mutations trigger refetches

---

## How It All Fits Together

### 1. **Application Startup**
```
User visits app 
→ main.tsx creates React root
→ App.tsx wraps everything in providers:
   - QueryClientProvider (TanStack Query)
   - AuthProvider (mock auth context)
   - TooltipProvider (UI tooltips)
   - BrowserRouter (routing)
→ Routes render based on URL
```

### 2. **Typical User Flow: Viewing Proposals**
```
User clicks "Proposals" in sidebar
→ React Router navigates to /proposals
→ Proposals page component mounts
→ useFiles() hook executes
→ TanStack Query checks cache
→ If cache miss, queries Supabase
→ Supabase returns proposals with joined PI/Sponsor data
→ TanStack Query caches result
→ React renders ProposalsTable with data
→ User sees proposals with search and filter UI
```

### 3. **Creating a New Proposal**
```
User clicks "Add Proposal"
→ Dialog opens with ProposalForm
→ User fills form (PI selected via autocomplete)
→ Form validates with Zod schema
→ Submit button triggers mutation:
   - Insert into 'files' table
   - TanStack Query invalidates cache
   - Refetch triggers
   - New data loads
→ Dialog closes
→ User sees new proposal in table
```

### 4. **DB Distiller Workflow**
```
User navigates to /distiller
→ DBDistiller component renders FileUpload
→ User drops Excel file
→ handleFileUpload() executes:
   - FileReader reads file as ArrayBuffer
   - XLSX.read() parses workbook
   - spreadsheetProcessor.processExcelFile() extracts data
   - Auto-maps columns based on header names
   - Converts Excel dates to readable format
→ Component state updates with processed records
→ Filter applies (hard-coded "Haugaard" filter)
→ StatusFilter component shows available statuses
→ User selects statuses to view
→ DataTable renders filtered results with colored badges
→ User can print formatted results or re-upload new file
→ Auto-timeout resets everything after inactivity
```

### 5. **File Attachments**
```
User opens proposal detail
→ FileAttachmentsManager component loads
→ useFileAttachments() hook fetches attachments for proposal
→ User uploads file:
   - File sent to Supabase Storage bucket 'file-attachments'
   - Metadata saved to 'file_attachments' table
   - Component refetches attachments list
→ User downloads file:
   - Creates signed URL from Supabase
   - Browser downloads file
→ User deletes file:
   - Removes from Storage bucket
   - Deletes database record
```

### 6. **Related Proposals Feature**
```
User sees PI name in proposals table
→ Name is wrapped in RelatedProposalsPopover
→ User clicks PI name
→ useRelatedProposals() hook queries:
   - SELECT * FROM files WHERE pi_id = 
→ Popover displays all proposals for that PI
→ User can search within the popover
→ Click any proposal to navigate to detail page
```

---

## Key Learning Points

### 1. **Component Composition**
The app uses **composition patterns**:
- Layout components (AppLayout) wrap page content
- Reusable UI components (SearchBar, StatusFilters) compose into pages
- shadcn/ui components are copied into the project (not imported from npm), allowing customization

### 2. **Custom Hooks for Logic Separation**
Business logic is extracted into hooks:
- `useFiles()` - Proposals logic
- `useDashboard()` - Dashboard statistics
- `useProposalData()` - PIs and Sponsors
- This keeps components focused on UI rendering

### 3. **Type Safety with TypeScript**
- Supabase generates types from database schema → `src/integrations/supabase/types.ts`
- Custom interfaces for Excel data (`ProposalRecord`, `ProcessedData`)
- React Hook Form + Zod ensures form data matches expected types

### 4. **Progressive Enhancement**
Features can be enabled/disabled:
- Authentication is currently mocked (easy to enable later)
- DB Distiller is a standalone tool (doesn't require database)
- File attachments are optional per proposal

### 5. **User Experience Details**
- **Autocomplete inputs** prevent duplicate PIs/Sponsors
- **Search highlighting** shows matched terms
- **Toast notifications** confirm actions
- **Loading states** prevent confusion
- **Error boundaries** would catch runtime errors (not yet implemented)

### 6. **Excel Processing Intelligence**
The DB Distiller demonstrates advanced data processing:
- **Flexible column mapping** handles variations in Excel headers
- **Excel date serial number conversion** (days since 1900)
- **Fallback parsing** for various date formats
- **Empty row filtering** removes junk data
- **Status normalization** (e.g., "Set-Up" vs "Set-up")

### 7. **Performance Optimizations**
- **Client-side filtering** reduces server requests
- **TanStack Query caching** prevents redundant fetches
- **Memoization** in table components (via React.memo)
- **Lazy loading** could be added for large datasets

---

## Conclusion

This application demonstrates a **modern, production-ready React architecture**:
- ✅ Type-safe with TypeScript
- ✅ Server state managed by TanStack Query
- ✅ Backend handled by Supabase (BaaS)
- ✅ Reusable component library (shadcn/ui)
- ✅ Form validation (React Hook Form + Zod)
- ✅ Advanced data processing (Excel parsing)
- ✅ Responsive design (Tailwind CSS)
- ✅ Proper separation of concerns (pages, components, hooks, utils)

The codebase is well-structured for maintainability and scalability. Each piece has a clear purpose, and the patterns are consistent throughout.
