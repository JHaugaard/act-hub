# Proposal Tracker - Development Guide

## Overview

This is a self-hosted proposal tracking application, migrated from Lovable.dev for independent development and deployment.

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Choose Your Data Source

The application supports two modes:

#### **Mock Mode** (Default - Recommended for Development)
Uses localStorage for data persistence. No backend required.

```bash
# .env file
VITE_USE_MOCK_DATA="true"
```

#### **Supabase Mode** (For comparison with Lovable)
Uses real Supabase backend.

```bash
# .env file
VITE_USE_MOCK_DATA="false"
```

### 3. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:8080](http://localhost:8080)

---

## Mock Data System

### How It Works

When `VITE_USE_MOCK_DATA="true"`:
- All data stored in browser's localStorage
- Realistic sample data auto-generates on first load
- Data persists between sessions
- No network requests required

### Sample Data Included

- **36 Proposals** distributed across statuses:
  - 4 "In"
  - 16 "Pending"
  - 14 "Pending Signatures"
  - 2 other statuses
- **12 Principal Investigators** (PIs)
- **14 Sponsors**

### Features That Work in Mock Mode

✅ All CRUD operations (Create, Read, Update, Delete)
✅ Search and filtering
✅ Sorting and pagination
✅ Status updates with timestamps
✅ Dashboard statistics
✅ Related proposals popover
✅ PI and Sponsor management
✅ File attachments (base64 encoded)
✅ DB Distiller (Excel processor)

### Limitations in Mock Mode

⚠️ File attachments stored as base64 (size limited)
⚠️ No real-time sync across devices
⚠️ No Row-Level Security (RLS)
⚠️ Data stored locally only

---

## Switching Between Mock and Supabase

### To Use Mock Data (localStorage)

1. Edit `.env`:
   ```bash
   VITE_USE_MOCK_DATA="true"
   ```

2. Restart dev server:
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   ```

3. Check console for confirmation:
   ```
   🔧 Data Source: MOCK (localStorage)
   ```

### To Use Lovable Supabase (for comparison)

1. Edit `.env`:
   ```bash
   VITE_USE_MOCK_DATA="false"
   ```

2. Restart dev server

3. Check console for confirmation:
   ```
   🔧 Data Source: SUPABASE (cloud)
   ```

---

## Development Workflow

### 1. UI/UX Development
Use mock mode for fast iteration:
- No backend setup required
- Instant data operations
- Perfect for testing UI components

### 2. Feature Development
- Build and test features with mock data
- Switch to Supabase to verify compatibility
- Ensure hooks work with both modes

### 3. Testing
```bash
# Run linting
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Project Structure

```
src/
├── config/
│   └── dataSource.ts          # Environment configuration
├── hooks/
│   ├── mock/                  # Mock data hooks
│   │   ├── useMockFiles.ts
│   │   ├── useMockProposalData.ts
│   │   ├── useMockDashboard.ts
│   │   ├── useMockRelatedProposals.ts
│   │   └── useMockFileAttachments.ts
│   ├── useData.ts             # Hook factory (auto-switches)
│   ├── useFiles.ts            # Real Supabase hooks
│   ├── useProposalData.ts
│   ├── useDashboard.ts
│   ├── useRelatedProposals.ts
│   └── useFileAttachments.ts
├── lib/
│   ├── mockStorage.ts         # localStorage wrapper
│   └── mockData.ts            # Sample data generator
├── components/                # React components
├── pages/                     # Route pages
└── utils/                     # Helper functions
```

### Key Files

- **`.env`** - Environment configuration
- **`src/config/dataSource.ts`** - Data source selector
- **`src/hooks/useData.ts`** - Smart hook exporter
- **`src/lib/mockStorage.ts`** - Mock database API
- **`src/lib/mockData.ts`** - Sample data

---

## Common Tasks

### Clear Mock Data

Open browser DevTools console:
```javascript
localStorage.clear()
```
Then refresh the page to regenerate sample data.

### Add More Sample Data

Edit `src/lib/mockData.ts`:
```typescript
export const mockPIs = [
  // Add more PIs here
  { id: generateId(), name: 'New PI Name', created_at: new Date().toISOString() },
]
```

### Debug Data Source

Check console on app load:
```
🔧 Data Source: MOCK (localStorage)  // or SUPABASE (cloud)
```

---

## Troubleshooting

### Issue: Changes not reflected
**Solution:** Clear browser cache and localStorage, restart dev server

### Issue: "Module not found" errors
**Solution:** Run `npm install` again

### Issue: Mock data not loading
**Solution:**
1. Open DevTools console
2. Run `localStorage.clear()`
3. Refresh page

### Issue: Dev server won't start
**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

---

## Next Steps

### For Production Deployment

See [Deployment Guide](deployment.md) for:
- Self-hosted Supabase setup
- VPS/Hostinger deployment
- Environment configuration
- Data migration from Lovable

---

## Tech Stack

- **Frontend:** React 18.3.1 + TypeScript + Vite
- **UI:** shadcn/ui + Tailwind CSS
- **State:** TanStack Query v5
- **Forms:** React Hook Form + Zod
- **Data:** localStorage (mock) or Supabase (production)

---

## Repository

- **GitHub:** https://github.com/JHaugaard/act-hub
- **Branch:** `development` (current)
- **Main:** Production-ready code (after testing)

---

## Support

For issues or questions:
1. Check the [Technical Overview](technical-overview.md)
2. Review this guide
3. Open an issue on GitHub
