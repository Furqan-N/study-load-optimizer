# Study Load Optimizer — Frontend

Next.js frontend for the Study Load Optimizer application.

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- shadcn/ui
- Framer Motion
- Recharts (analytics charts)
- Axios (API client)
- Lucide React (icons)

## Setup

```bash
npm install
npm run dev
```

The app runs at `http://localhost:3000`. The backend API should be running at `http://localhost:8000`.

## Pages

| Route                         | Description                    |
| ----------------------------- | ------------------------------ |
| `/`                           | Landing page (hero section)    |
| `/login`                      | User login                     |
| `/register`                   | User registration              |
| `/dashboard`                  | Dashboard home                 |
| `/dashboard/courses`          | Course list and management     |
| `/dashboard/courses/[id]`     | Individual course detail       |
| `/dashboard/assessments`      | Assessment tracker             |
| `/dashboard/calendar`         | Calendar view                  |
| `/dashboard/schedule`         | Study schedule                 |
| `/dashboard/insights`         | Analytics and study breakdowns |
| `/dashboard/settings`         | User settings                  |

## Project Structure

```
frontend/
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── page.tsx             # Landing page
│   │   ├── layout.tsx           # Root layout
│   │   ├── globals.css          # Global styles
│   │   ├── login/               # Login page
│   │   ├── register/            # Registration page
│   │   ├── dashboard/           # Dashboard pages
│   │   │   ├── page.tsx         # Dashboard home
│   │   │   ├── layout.tsx       # Dashboard layout (sidebar + header)
│   │   │   ├── courses/         # Course management
│   │   │   ├── assessments/     # Assessment tracking
│   │   │   ├── calendar/        # Calendar view
│   │   │   ├── schedule/        # Study schedule
│   │   │   ├── insights/        # Analytics
│   │   │   └── settings/        # User settings
│   │   └── utils/
│   │       └── dateHelpers.ts   # Date utilities
│   ├── components/
│   │   ├── auth/
│   │   │   └── ProtectedRoute.tsx
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   └── Sidebar.tsx
│   │   └── ui/                  # shadcn/ui + custom components
│   └── lib/
│       ├── api.ts               # Axios API client
│       ├── utils.ts             # Utility functions (cn, etc.)
│       └── selectedTermStorage.ts # Term selection persistence
├── public/                      # Static assets (logos, icons)
├── package.json
├── tsconfig.json
├── next.config.ts
├── components.json              # shadcn/ui config
├── postcss.config.mjs
└── eslint.config.mjs
```

## Scripts

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```
