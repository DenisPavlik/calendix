# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun dev       # start dev server (uses Bun, not npm/yarn)
bun build     # production build
bun lint      # ESLint via next lint
```

## Environment Variables

Required in `.env.local`:
- `NYLAS_CLIENT_ID`, `NYLAS_API_KEY`, `NYLAS_API_URI` — Nylas calendar integration
- `NEXT_PUBLIC_URL` — public base URL (used for Nylas OAuth callback URI)
- `SECRET` — iron-session cookie encryption password
- `MONGODB_URI` — MongoDB connection string

## Architecture

**Next.js 14 App Router** with two route groups:
- `(site)` — marketing pages + authenticated dashboard (`/dashboard/*`)
- `(booking)` — public booking flow (`/[username]/[booking-uri]/` → time picker; `/[username]/[booking-uri]/[booking-time]/` → confirmation form)

### Auth Flow
Authentication is OAuth via Nylas (Google Calendar). `/api/auth` redirects to Nylas OAuth; `/api/oauth/exchange` handles the callback, upserts a `Profile` doc in MongoDB, and stores `email` in an encrypted iron-session cookie. Session is read server-side via `getSessionEmailFromCookies()` (in Server Components/layouts) or `getSessionEmailFromRequest()` (in API routes).

The `IronSessionData` type is extended in `src/types/iron-session.d.ts` to include `email`.

### Data Models (`src/models/`)
- **Profile** — `email` (unique), `username` (unique), `grantId` (Nylas grant ID linking the user to their calendar)
- **EventType** — owned by `email`; has `uri` (slug), `title`, `description`, `length` (minutes), and `bookingTimes` (per-weekday availability windows with `from`/`to`/`active`)
- **Booking** — guest info (`name`, `email`, `notes`), `when` (Date), `eventTypeId`

### API Routes (`src/app/api/`)
| Route | Purpose |
|---|---|
| `GET /api/auth` | Start Nylas OAuth |
| `GET /api/oauth/exchange` | OAuth callback → create session |
| `GET /api/logout` | Clear session |
| `GET/POST/PUT/DELETE /api/event-types` | Manage event types |
| `GET/PUT /api/profile` | Manage profile (username) |
| `POST /api/bookings` | Create booking + Nylas calendar event with Google Meet |
| `GET /api/busy` | Query Nylas free/busy for a time range |

### Key Libraries (`src/libs/`)
- `connectToDB.ts` — singleton Mongoose connection
- `nylas.ts` — Nylas SDK client (exported as `nylas` and `nylasConfig`)
- `session.ts` — iron-session options and `getSession()` for API routes
- `getSessionEmail.ts` — helpers to read `session.email` in Server Components and API routes
- `db-utils.ts` — `getUsernameByEmail()` helper
- `shared.ts` — `WeekdaysNames` and `shortWeekdays` arrays

### Dashboard Auth Guard
`src/app/(site)/dashboard/layout.tsx` calls `getSessionEmailFromCookies()` and renders `<NotLoggedIn />` when no session exists — no middleware involved.

---

## Project Roadmap

This is a Calendly clone being modernized for a portfolio. Work is divided into phases. Always check status here before starting a new task.

### Phase 1 — UI Modernization (Marketing / Public pages)
> Goal: impress at first glance when shown to Upwork clients.

- [x] Switch font from Noto Sans → Inter
- [x] Redesign `globals.css` — new design tokens (colors, shadows, radius, `btn` variants)
- [x] **Header** — glass-morphism effect, active nav link indicator, smooth mobile menu
- [x] **Homepage** (`(site)/page.tsx`) — gradient hero with floating UI preview card, "How it works" section (3 steps), features grid with icons, CTA banner before footer
- [x] **Features page** — real feature cards with icons, two-column layout, comparison table
- [x] **Pricing page** — highlighted "Popular" card, fix typo "Standart"→"Standard", per-seat pricing note
- [x] **About page** — add actual content (tech stack, motivation, GitHub link)
- [x] **Footer** — add a global footer with links and copyright

### Phase 2 — UI Modernization (Dashboard & Booking)
> Goal: the product itself looks polished, not like a raw prototype.

- [x] **Dashboard layout** — replace top pill-nav with a left sidebar (desktop) / bottom bar (mobile)
- [x] **Event types list** — replace bare `<Link>` list with proper cards (color accent, duration badge, public URL copy button)
- [x] **EventTypeForm** — multi-step or tabbed form (basic info / availability / preview)
- [x] **ProfileForm** — add avatar upload placeholder, username availability check (debounced)
- [x] **Booked events page** — table/card view with status badge, guest info, date formatting
- [x] **Booking layout** — modernize the two-pane layout (`[username]/[booking-uri]/layout.tsx`)
- [x] **TimePicker** — visual polish, loading skeleton while fetching busy slots
- [x] **Booking confirmation page** — add "Add to calendar" button after successful booking

### Phase 3 — Logic & Feature Improvements
> Goal: make the app actually work better and cover edge cases.

- [x] Move auth guard from layout render to `middleware.ts` (protect `/dashboard/*` at edge)
- [ ] Add timezone support — store timezone in Profile, show local time in booking flow
- [x] Add booking cancellation — host cancels from dashboard, guest receives cancellation email
- [x] Add email notifications — send confirmation email to guest after booking (use Nylas or Resend)
- [x] Validate username format (slug: lowercase, letters/numbers/hyphens only) before saving
- [x] Handle Nylas grant expiry gracefully — detect 401 from Nylas and prompt re-auth
- [x] Fix: `cookieOptions.sequre` typo → `secure` in `session.ts`

### Phase 4 — Performance & Code Quality
> Goal: production-ready code, good Lighthouse score.

- [ ] Add `loading.tsx` files for all dashboard routes (Next.js Suspense streaming)
- [ ] Add `error.tsx` boundaries for dashboard and booking routes
- [ ] Convert `EventTypesPage` and `BookedEventsPage` to use `Suspense` + async Server Components properly
- [ ] Lazy-load heavy client components (`TimePicker`, `EventTypeForm`) with `dynamic()` + `ssr: false`
- [ ] Add `next/image` optimization for all external images (company logos in `Companies.tsx` already use it — verify `remotePatterns` in `next.config`)
- [ ] Remove dead commented-out code (`next-app-session` remnants in `session.ts`, `oauth/exchange/route.ts`)
- [ ] Add proper TypeScript strict checks — fix `@ts-ignore` in `busy/route.ts`
- [ ] Set up `next.config.ts` with `images.remotePatterns` for ctfassets.net logos

### Phase 5 — Polish & Deploy
> Goal: ready to show and share.

- [ ] Add `og:image` and proper metadata for all public pages
- [ ] Add a demo mode / seed script so the booking flow works without a real Nylas account
- [ ] Deploy to Vercel, add live URL to README and About page
- [ ] Record a short screen-capture demo GIF for the README
