# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Stays Observator** is a React + TypeScript dashboard application for monitoring Stays.net property bookings. It displays two main views:
1. **Dashboard** - Week-by-week booking overview with statistics
2. **Calendar** - Visual calendar view of all property bookings

The app features auto-rotation between views, real-time data updates, and celebration animations for new bookings.

## Development Commands

```bash
# Start development server (default command)
npm run dev

# Build for production
npm run build

# Lint code
npm run lint

# Preview production build
npm run preview
```

## Environment Configuration

The app requires Stays.net API credentials in `.env`:

```bash
VITE_STAYS_API_BASE_URL=https://casap.stays.net  # Your Stays.net domain
VITE_STAYS_CLIENT_ID=your_client_id_here
VITE_STAYS_CLIENT_SECRET=your_client_secret_here
```

Use `.env.example` as reference. The Booking API automatically retrieves all reservations - no need for listing IDs.

## Architecture

### Data Flow Architecture

The app uses a **centralized data context pattern** to prevent duplicate API calls:

```
BookingDataProvider (5-min cache)
    ↓
    ├─ Dashboard (via useDashboardData)
    └─ Calendar (via useCalendarViewData)
```

**Key principle**: `BookingDataContext` (`src/contexts/BookingDataContext.tsx`) is the single source of truth. It:
- Fetches all bookings once every 5 minutes
- Auto-refreshes at midnight
- Provides shared data to both Dashboard and Calendar views
- Builds a complete map of all property listings

### Context Providers

Two global contexts wrap the entire app in `App.tsx`:

1. **BookingDataProvider**: Manages all booking data and API calls
2. **AutoRotationProvider**: Controls automatic view switching (Dashboard ↔ Calendar)

### Service Layer Organization

- **API Clients** (`src/services/api/`):
  - `staysApi.ts` - Listing Calendar API (legacy, minimal use)
  - `staysBookingApi.ts` - **Primary API** for all booking data
  - `staysContentApi.ts` - Listing metadata (names, codes)

- **Data Transformers** (`src/services/`):
  - `bookingTransformers.ts` - Raw bookings → dashboard format
  - `calendarTransformers.ts` - Raw bookings → calendar format
  - `bookingDetailsExtractor.ts` - Parse HTML for booking details
  - `bookingDetailsCache.ts` - Cache enriched booking data

- **Configuration** (`src/services/config.ts`):
  - Validates environment variables
  - Exports typed config object

### Custom Hooks Pattern

Each view has a dedicated hook that consumes `BookingDataContext`:

- `useDashboardData.ts` - Transforms bookings for Dashboard view
- `useCalendarViewData.ts` - Transforms bookings for Calendar view

**Never call API services directly from components** - always go through these hooks.

### Routing Structure

```
/ (root)           → Dashboard view
/calendar          → Calendar view
```

Auto-rotation switches between these routes when enabled.

## API Integration Notes

### Proxy Configuration

Development uses Vite proxy (`vite.config.ts`) to avoid CORS:
- `/api/*` → proxied to `https://casap.stays.net`
- Production: Direct API calls

### Authentication

All API calls use **Basic Auth** with base64-encoded credentials (`clientId:clientSecret`).

### Data Fetching Strategy

1. **Initial Load**: Fetch 360 days of bookings (180 days back + 180 forward)
2. **Enrichment**: Parallel requests for booking details (10 concurrent max)
3. **Caching**: 5-minute cache in context, prevents duplicate requests
4. **Auto-refresh**: Every 5 minutes + midnight refresh

## Component Structure

- **Navigation** (`src/components/Navigation/`):
  - Navigation bar with auto-rotation controls
  - View switching (Dashboard ↔ Calendar)

- **Dashboard** (`src/components/Dashboard/`):
  - Week-by-week booking cards
  - Statistics panel
  - Loading skeleton state

- **Calendar** (`src/components/Calendar/`):
  - Visual calendar grid
  - Property availability display
  - Loading skeleton state

- **UI Components** (`src/components/ui/`):
  - Shared primitives (badge, card, marquee text)

## Key Files to Understand

1. **src/contexts/BookingDataContext.tsx** - Master data provider (start here)
2. **src/App.tsx** - App structure, routing, auto-rotation logic
3. **src/services/api/staysBookingApi.ts** - Primary API client
4. **src/services/bookingDetailsCache.ts** - Data enrichment pipeline
5. **vite.config.ts** - Path aliases (`@/`) and proxy config

## Important Patterns

### Path Aliases

Use `@/` prefix for absolute imports:
```typescript
import { staysBookingApi } from '@/services/api/staysBookingApi';
```

### Type Definitions

API types are centralized in:
- `src/services/api/bookingTypes.ts` - Booking API response types
- `src/services/api/types.ts` - Calendar API types
- Component-specific types in `types.ts` next to components

### Error Handling

The app shows user-friendly error states for:
- Missing environment variables → Configuration error screen
- API failures → Error screen with retry button
- Loading states → Skeleton components

### Auto-Rotation Behavior

When enabled via Navigation controls:
- Switches views every N seconds (configurable)
- Uses `useEffect` with `setInterval` in `App.tsx`
- Navigation persists across rotations via React Router

## Styling

- **Tailwind CSS 4.x** with PostCSS
- Custom color palette (`#ecf0f1`, `#3498db`, `#2C3E50`, etc.)
- Utility-first approach, minimal custom CSS
- Responsive design considerations
