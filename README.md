# ESTUDIO ARKIPELAGO V2 — Studio Operations System

A Progressive Web App (PWA) built for **Estudio Arkipelago**, an architecture firm, to centralize all daily operations: time tracking, project management, scheduling, communications, and design collaboration.

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 16 (App Router) + React 19 + TypeScript |
| **Styling** | Tailwind CSS v4 — Brutalist design system |
| **Icons** | Lucide React |
| **Database** | Supabase (PostgreSQL) — *localStorage fallback for dev* |
| **Auth** | Supabase Auth — *localStorage mock for dev* |
| **Real-time** | Supabase Realtime (WebSockets) — *Phase 2* |
| **Backend API** | Python FastAPI — *Phase 2 (requires Python install)* |
| **PWA** | Service Workers + manifest.json |
| **Hosting** | Vercel (Free Tier) |

## Getting Started

### Prerequisites

- **Node.js** v18+ (tested with v22.16.0)
- **npm** v9+

### Installation

```bash
# Clone the repo
git clone <repo-url> E:\estudio-arkipelago
cd E:\estudio-arkipelago

# Install dependencies
npm install

# Copy environment template
copy .env.local.example .env.local

# Start development server
npm run dev
```

The app will be available at **http://localhost:3000**

### Default Login

For the MVP, authentication is mocked with localStorage:
- **Email**: any email address (e.g. `admin@arkipelago.com`)
- **Password**: `admin`

## Project Structure

```
src/
├── app/
│   ├── (auth)/           # Unauthenticated routes
│   │   └── login/        # Login page
│   ├── (studio)/         # Authenticated routes
│   │   ├── dashboard/    # Main dashboard
│   │   ├── hr/           # Clock-in & time tracking
│   │   ├── projects/     # Project hub
│   │   ├── calendar/     # Google Calendar sync (stub)
│   │   ├── chat/         # Communications (stub)
│   │   ├── directory/    # Specialty directory (stub)
│   │   └── sketch/       # Sketching studio (stub)
│   └── api/
│       └── health/       # Health check endpoint
├── components/
│   ├── layout/           # Sidebar, BottomNav, TopBar
│   ├── auth/             # Login form
│   ├── hr/               # Clock-in components
│   └── ui/               # Reusable primitives (Button, Card, etc.)
├── lib/
│   ├── hooks/            # Custom React hooks
│   ├── supabase/         # Supabase client config
│   ├── constants.ts      # App constants & mock data
│   └── utils.ts          # Utility functions
├── types/                # TypeScript type definitions
└── supabase/
    └── migrations/       # SQL schema migrations
```

## Features (MVP)

- [x] Brutalist dark-theme UI with responsive layout
- [x] Desktop sidebar ↔ Mobile bottom navigation
- [x] Mock authentication (localStorage)
- [x] HR Clock-In/Out with live timer
- [x] Time tracking with project attribution
- [x] Session history and daily summaries
- [ ] Google Calendar 2-way sync (Phase 2)
- [ ] Real-time chat & announcements (Phase 2)
- [ ] Offline PWA with IndexedDB sync (Phase 2)
- [ ] PDF sketching/redlining studio (Phase 2)
- [ ] Supabase cloud database (requires account setup)
- [ ] Python FastAPI backend (requires Python installation)

## Deployment

```bash
# Build for production
npm run build

# Start production server
npm start
```

For Vercel deployment, connect the GitHub repo and it will auto-deploy.

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | No* | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | No* | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | No* | Supabase service role key |
| `GOOGLE_CLIENT_ID` | No | Google OAuth client ID (Phase 2) |
| `GOOGLE_CLIENT_SECRET` | No | Google OAuth secret (Phase 2) |

*\*App runs in localStorage-only mode without Supabase credentials.*

## License

Proprietary — Estudio Arkipelago © 2024
