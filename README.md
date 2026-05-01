# Calendix

> Simple scheduling for everyone — share a link, let others pick a time.

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-green?logo=mongodb)](https://www.mongodb.com)
[![Nylas](https://img.shields.io/badge/Nylas-Calendar_API-purple)](https://www.nylas.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A full-featured Calendly alternative built with the modern Next.js App Router stack. Hosts connect their Google Calendar via OAuth, create event types with custom availability windows, and share a booking link — guests pick a time, fill in their details, and a Google Meet event is automatically created.

**Live demo:** [https://calendix-booking.vercel.app](https://calendix-booking.vercel.app)

---

## Features

- **Google Calendar OAuth** via Nylas — one-click sign-in, no manual API keys for hosts
- **Event types** — title, description, duration, custom public URL slug
- **Availability windows** — per-weekday `from`/`to` time ranges with toggle
- **Timezone support** — hosts set their timezone; guests see slots in their local time
- **Guest booking flow** — pick a date, pick a slot, fill in name / email / notes
- **Google Meet links** — generated automatically for every confirmed booking
- **Email notifications** — confirmation email sent to guest via Resend after booking
- **Booking cancellation** — hosts cancel from the dashboard; guest receives a cancellation email
- **Dashboard** — manage event types, view all upcoming bookings
- **Responsive UI** — sidebar nav on desktop, bottom bar on mobile

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router, Server Components, Streaming) |
| Language | TypeScript 5 |
| Database | MongoDB + Mongoose |
| Calendar / OAuth | Nylas SDK v7 |
| Styling | Tailwind CSS 3 |
| Session | iron-session (encrypted cookie) |
| Email | Resend |
| Runtime | Bun |

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) ≥ 1.0
- MongoDB instance (local or Atlas)
- [Nylas](https://www.nylas.com) account with a Google Calendar application configured

### Installation

```bash
git clone https://github.com/your-username/calendix.git
cd calendix
bun install
```

Create a `.env.local` file in the project root (see [Environment Variables](#environment-variables) below), then:

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build for Production

```bash
bun build
bun start
```

## Environment Variables

| Variable | Description |
|---|---|
| `NYLAS_CLIENT_ID` | Nylas application client ID |
| `NYLAS_API_KEY` | Nylas API key (server-side) |
| `NYLAS_API_URI` | Nylas API base URI (e.g. `https://api.eu.nylas.com`) |
| `NEXT_PUBLIC_URL` | Public base URL of your deployment (used as Nylas OAuth callback) |
| `SECRET` | ≥ 32-character random string for iron-session cookie encryption |
| `MONGODB_URI` | MongoDB connection string |
| `RESEND_API_KEY` | Resend API key for transactional emails |

## Testing

The project has a comprehensive test suite covering all critical layers.

**Stack:** Vitest + Testing Library + MSW (Mock Service Worker)

```bash
bun test            # run all tests
bun test:watch      # watch mode
bun test:coverage   # with coverage report
```

| Layer | What's tested |
|---|---|
| **Utilities** | `WeekdaysNames` / `shortWeekdays` arrays, `getUsernameByEmail` (found / not found) |
| **Middleware** | Redirect when no session; pass-through with valid session; matcher config |
| **API routes** | `logout`, `profile` (regex + 401 + upsert), `event-types` (CRUD + 409 + ownership), `busy` (Nylas 401 → 503, slot filtering), `oauth/exchange` (new profile + grantId update), `bookings` (create + cancel, Nylas fallback) |
| **Components** | `CopyButton`, `CancelBookingButton`, `ProfileForm` (debounce + validation), `TimePicker` (calendar grid, month navigation, busy fetch) |

## Architecture

The app is split into two Next.js route groups:

- **`(site)`** — marketing pages (`/`, `/features`, `/pricing`, `/about`) and the authenticated dashboard (`/dashboard/*`). Dashboard routes are protected at the edge via `middleware.ts`.
- **`(booking)`** — public guest-facing booking flow: `/[username]/[booking-uri]` (time picker) → `/[username]/[booking-uri]/[booking-time]` (confirmation form).

```
src/app/
├── (site)/
│   ├── page.tsx              # Landing page
│   ├── features/
│   ├── pricing/
│   ├── about/
│   └── dashboard/            # Protected dashboard
│       ├── event-types/
│       └── booked-events/
└── (booking)/
    └── [username]/
        └── [booking-uri]/
            └── [booking-time]/
```

Auth is handled via Nylas OAuth: `/api/auth` redirects to Google, `/api/oauth/exchange` receives the callback, upserts a `Profile` document in MongoDB, and stores the `email` in an encrypted iron-session cookie.

## License

[MIT](LICENSE)
