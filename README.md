# ACT Hub - Activity Tracker Hub

A full-stack research proposal tracking application for managing proposals, principal investigators, sponsors, and related documentation.

## 🚀 Quick Start

### Development (Mock Data - No Backend Required)

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Visit [http://localhost:8080](http://localhost:8080)

**Default Mode:** Uses localStorage (mock data) - perfect for UI/UX development!

---

## 📚 Documentation

- **[Getting Started](docs/getting-started.md)** - Quick start guide for new developers
- **[Development Guide](docs/development.md)** - Setup, mock data, switching modes
- **[Deployment Guide](docs/deployment.md)** - Self-hosted deployment and VPS setup
- **[Technical Overview](docs/technical-overview.md)** - Architecture, features, codebase
- **[Migration Summary](docs/migration-summary.md)** - PocketBase migration details
- **[CSV Import Guide](docs/csv-import.md)** - Data import instructions
- **[Phase 1 Setup](docs/phase1-setup.md)** - Initial PocketBase setup
- **[Phase 1 Guide](docs/phase1-guide.md)** - Phase 1 documentation guide

---

## ✨ Features

### Core Functionality
- ✅ **Proposal Management** - Full CRUD operations with search, filter, sort
- ✅ **PI & Sponsor Management** - Autocomplete, relationship tracking
- ✅ **Dashboard** - Real-time stats and status overview
- ✅ **File Attachments** - Upload/download documents per proposal
- ✅ **DB Distiller** - Excel file processor with advanced filtering

### Development Features
- 🔄 **Dual Mode**: Toggle between mock data (localStorage) and Supabase
- 📦 **Offline Development** - Work without backend using realistic sample data
- 🎯 **Mock Data** - Pre-loaded with 36 proposals, 12 PIs, 14 sponsors
- 🔌 **Hot Swapping** - Switch data sources via environment variable

---

## 🛠 Tech Stack

- **Frontend:** React 18.3.1 + TypeScript + Vite
- **UI:** shadcn/ui + Tailwind CSS + Radix UI
- **State:** TanStack Query v5
- **Forms:** React Hook Form + Zod validation
- **Data:** localStorage (mock) or Supabase (production)
- **Icons:** Lucide React
- **Dates:** date-fns

---

## 🔧 Development Modes

### Mock Mode (Default)
Perfect for UI/UX development without backend setup:

```bash
# .env
VITE_USE_MOCK_DATA="true"
```

**Features:**
- Data persists in localStorage
- 36 realistic sample proposals
- All CRUD operations work
- File attachments (base64)
- No network requests

### Supabase Mode
Connect to Lovable Supabase (for comparison) or self-hosted instance:

```bash
# .env
VITE_USE_MOCK_DATA="false"
VITE_SUPABASE_URL="your-supabase-url"
VITE_SUPABASE_PUBLISHABLE_KEY="your-key"
```

---

## 📁 Project Structure

```
src/
├── config/           # Environment configuration
├── hooks/
│   ├── mock/        # Mock data hooks (localStorage)
│   └── useData.ts   # Smart hook factory (auto-switches)
├── lib/
│   ├── mockStorage.ts   # localStorage wrapper
│   └── mockData.ts      # Sample data generator
├── components/      # React components
├── pages/           # Route pages
└── utils/           # Helper functions
```

---

## 🚢 Deployment

### Self-Hosted (Recommended)

1. **Setup Supabase** (Docker or manual)
2. **Configure environment** variables
3. **Build application**: `npm run build`
4. **Deploy** to VPS or Hostinger

See [DEPLOYMENT.md](DEPLOYMENT.md) for complete guide.

### Quick Deploy to VPS

```bash
# Build
npm run build

# Upload dist/ to server
scp -r dist/* user@your-server:/var/www/html/

# Configure Nginx (see DEPLOYMENT.md)
```

---

## 🔐 Environment Variables

```bash
# Data Source Mode
VITE_USE_MOCK_DATA="true"  # or "false"

# Supabase Configuration (when using real backend)
VITE_SUPABASE_PROJECT_ID="your-project-id"
VITE_SUPABASE_URL="https://your-supabase-url.com"
VITE_SUPABASE_PUBLISHABLE_KEY="your-anon-key"
```

---

## 🧪 Available Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

---

## 🗂 Database Schema

### Tables
- **files** (proposals) - Main proposal tracking
- **pis** - Principal Investigators
- **sponsors** - Funding organizations
- **file_attachments** - Document storage metadata
- **profiles** - User profiles

### Features
- Row-Level Security (RLS)
- Foreign key relationships
- Automatic timestamp triggers
- Storage buckets for files

---

## 🤝 Migration from Lovable

This project was migrated from Lovable.dev for:
- ✅ Independent development control
- ✅ Self-hosted infrastructure
- ✅ Custom deployment options
- ✅ No platform lock-in

**Original Lovable Project:** `4acaaeda-dcd2-4794-8834-c3f769c37d1f`

---

## 📊 Sample Data (Mock Mode)

### Proposals by Status
- **4** In
- **16** Pending
- **14** Pending Signatures
- **2** Process/Done

### Sample PIs
McLelland Megan, Walker Marcia, Edwards Mark, King David, and more...

### Sample Sponsors
MBRC, Western United States Agricultural Trade Association, and more...

---

## 🐛 Troubleshooting

### Mock data not loading?
```javascript
// Browser console
localStorage.clear()
// Refresh page
```

### Build errors?
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Can't switch modes?
1. Update `.env` file
2. Restart dev server
3. Check console for: `🔧 Data Source: MOCK` or `SUPABASE`

---

## 📖 Learn More

- [Development Guide](docs/development.md) - Full development documentation
- [Deployment Guide](docs/deployment.md) - Production deployment guide
- [Technical Overview](docs/technical-overview.md) - Architecture details

---

## 📜 License

This project is for internal use. Contact repository owner for licensing details.

---

## 🔗 Repository

**GitHub:** [https://github.com/JHaugaard/act-hub](https://github.com/JHaugaard/act-hub)

**Branches:**
- `main` - Production-ready code
- `development` - Active development

---

## 🙋 Support

1. Check documentation (links above)
2. Review troubleshooting section
3. Open GitHub issue

---

**Built with** ❤️ **using React, TypeScript, and Supabase**
