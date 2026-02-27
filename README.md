# MyChef — Professional Chef Marketplace

A production-ready MVP marketplace connecting clients with verified professional chefs for catering and event services.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router, TypeScript) |
| Styling | Tailwind CSS + custom Radix UI components |
| Auth / Database / Storage | Supabase |
| Payments | Stripe (PaymentIntents with manual capture for escrow) |
| Video Interviews | Daily.co (WebRTC) |
| Email | Resend |
| Deployment | Vercel-ready |

## Features

### Chef Onboarding
- Multi-step application form (personal info, experience, portfolio images)
- Admin reviews and schedules video interview via built-in Daily.co rooms
- Email notifications at each stage (scheduled, approved, rejected)
- Admin can approve -> auto-creates chef profile and activates account

### Event & Booking System
- Clients post events with type, date, location, budget, guest count
- Verified chefs browse open events and submit proposals
- Clients select a chef and pay upfront via Stripe Checkout
- Funds held in escrow (manual capture PaymentIntent)
- Chef marks complete -> Client confirms -> Payment released
- 15% platform commission deducted automatically

### Admin Dashboard
- Full application management (review, schedule, approve, reject, no-show)
- Interview management with join-room links
- All bookings overview with dispute resolution (manual release/refund)
- User management

### Public Pages
- Landing page with featured chefs
- Chef directory (verified chefs only)
- Open events board
- Individual chef profile pages

## Getting Started

### 1. Clone and install

```bash
git clone <your-repo>
cd mychef
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in all values in `.env.local`:
- **Supabase**: URL + anon key + service role key
- **Stripe**: publishable key + secret key + webhook secret
- **Daily.co**: API key (optional for dev, auto-fallback otherwise)
- **Resend**: API key

### 3. Set up Supabase database

Run the migrations in order in your Supabase SQL editor:
1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_storage.sql`
3. `supabase/migrations/003_payments.sql`

### 4. Create admin user

After registering at `/register`, update your profile in Supabase Table Editor:
- Table: `profiles` -> set `role` = `admin`

### 5. Set up Stripe webhook

Point to `https://your-domain.com/api/webhooks/stripe`
Events: `checkout.session.completed`, `payment_intent.payment_failed`

### 6. Run development server

```bash
npm run dev
```

Open http://localhost:3000

## Commission Model

Platform collects **15%** on completed bookings. Funds are held via Stripe manual capture and released after client confirms completion.

## Deployment (Vercel)

```bash
vercel deploy
```

Set all environment variables in Vercel. Update `NEXT_PUBLIC_APP_URL` to your production URL.
