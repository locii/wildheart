# Appointment Scheduling System — Strategy

**Goal:** Replace Squarespace Scheduling ($40 AUD/month) with a self-owned system.  
**Context:** Psychotherapy practice, two clinic locations (Brunswick, Lorne), Australia/Melbourne timezone.

---

## What the System Needs to Do

### Core Features (derived from current export)
| Feature | Detail |
|---|---|
| Appointment types | Psychotherapy (50 min, $160), Extended Psychotherapy (80 min, $240), Free intro call (20 min, $0) |
| Locations / Calendars | Brunswick, Lorne — each with independent availability |
| Client records | First name, last name, phone, email |
| Booking | Admin-initiated + client self-serve (web + mobile-responsive) |
| Rescheduling & cancellation | With audit trail (date rescheduled, date cancelled) |
| Payment tracking | Record whether paid, amount paid — no online payment processing required initially |
| Notifications | Email confirmations and reminders to client; email alert to practitioner |
| Scheduled By tracking | Who booked (admin via web, admin via mobile, or client self-serve) |

### Out of Scope (for now)
- Certificate / Medicare rebate codes
- Internal notes
- Online payment processing (Stripe etc.)

---

## Option A — Self-Host Cal.com (Recommended Starting Point)

[Cal.com](https://cal.com) is open-source scheduling software with feature parity to Acuity/Squarespace Scheduling.

### What it covers out of the box
- Multiple event types with custom durations and prices
- Multiple calendars (map to Brunswick / Lorne)
- Client-facing booking page
- Email confirmations and reminders
- Reschedule / cancel flows
- Admin booking on behalf of client
- Google Calendar / iCal sync
- Mobile-responsive

### What it doesn't cover without customisation
- The "Paid?" / "Amount Paid Online" tracking from the CSV — would need the Stripe integration enabled, or a workaround via manual marking

### Hosting stack
| Component | Service | Cost |
|---|---|---|
| App hosting | Railway or Render (Docker deploy) | ~$5–10 AUD/month |
| Database | PostgreSQL (bundled with Railway/Render) | Included |
| Email | Resend or Postmark (transactional) | Free tier covers ~3,000 emails/month |
| Domain (optional) | Already owned or ~$15/year | ~$15/year |
| **Total** | | **~$10–15 AUD/month** |

### Effort to deploy
- 4–8 hours to configure, connect Google Calendar, set up event types and locations
- No custom code required for core functionality

### Trade-offs
- You're running someone else's software — upgrades are your responsibility
- Less flexibility for bespoke workflows
- Cal.com UI is clean but branded; minor CSS overrides possible

---

## Option B — Custom Build

Build a purpose-fit system from scratch, tailored exactly to the practice's workflow.

### Recommended Stack

```
Frontend      Next.js 15 (App Router) + Tailwind CSS
Backend       Next.js API routes (serverless)
Database      Supabase (PostgreSQL + Row Level Security)
Auth          Supabase Auth (admin login only)
Email         Resend (transactional email via React Email templates)
Calendar sync Google Calendar API (read/write availability)
Hosting       Vercel (frontend + API) + Supabase (DB)
```

### Why this stack
- **Next.js + Vercel**: zero-config deploy, excellent for a booking UI that needs fast public pages (SEO, mobile)
- **Supabase**: managed Postgres with a clean dashboard — easy to query/export data like the current CSV; free tier is generous
- **Resend**: best-in-class transactional email for Next.js, Australian deliverability is reliable
- **Google Calendar**: bidirectional sync so the practitioner's existing calendar remains the source of truth for availability

### Data model (simplified)

```
clients         id, first_name, last_name, phone, email, created_at
appointment_types  id, name, duration_minutes, price, location
appointments    id, client_id, type_id, location, start_at, end_at,
                timezone, paid, amount_paid, scheduled_by,
                scheduled_at, rescheduled_at, cancelled_at
```

### Cost breakdown

| Component | Service | Cost |
|---|---|---|
| Frontend + API | Vercel (Hobby) | Free |
| Database | Supabase (Free tier) | Free |
| Email | Resend (Free tier, 3k/month) | Free |
| **Total ongoing** | | **$0/month** |
| Upgrade path if needed | Vercel Pro + Supabase Pro | ~$45 AUD/month combined |

### Development effort estimate

| Module | Estimated Hours |
|---|---|
| Project setup, auth, DB schema | 4–6 hrs |
| Admin dashboard (view/manage appointments) | 8–12 hrs |
| Client booking flow (public page, location/type selection, time slot picker) | 12–16 hrs |
| Email notifications (confirmation, reminder, cancellation) | 4–6 hrs |
| Reschedule / cancel flows | 4–6 hrs |
| Google Calendar availability sync | 6–10 hrs |
| CSV export (to match current format) | 2–3 hrs |
| **Total** | **~40–60 hrs** |

At a freelance rate of $100–150 AUD/hr, this is a **$4,000–$9,000** one-time build cost — but $0–15/month ongoing vs $40/month forever.

**Break-even:** 8–19 months if professionally built, or near-immediate if built in-house.

---

## Option C — Cheaper SaaS Alternatives

Before building anything, worth knowing there are cheaper hosted tools:

| Product | Cost | Notes |
|---|---|---|
| **TidyCal** | ~$30 AUD one-time (lifetime) | Basic but functional; limited multi-location |
| **Cal.com Cloud** | ~$18 AUD/month/user | Fully hosted, no ops burden |
| **Calendly Standard** | ~$16 AUD/month | Widely used, polished UX |
| **HubSpot Meetings** | Free (with HubSpot CRM) | Less scheduling-focused |

---

## Recommendation

| If you want to... | Go with |
|---|---|
| Minimise ongoing cost with minimal effort | **TidyCal** (one-time) or **Cal.com Cloud** |
| Self-host and own the system, low dev effort | **Option A** (Cal.com self-hosted) |
| Full control, custom workflows, own the data | **Option B** (custom build) |

**Practical suggestion:** Start with Cal.com Cloud at ~$18/month to validate the workflow is right, then migrate to a custom build if you want the lower ongoing cost and tighter control over the data/export format.

---

## Questions to Resolve Before Building

1. Does the practitioner book all appointments (admin-only), or do clients self-book?
2. Is Google Calendar the source of truth for availability, or should the app manage availability independently?
3. Is a mobile app needed, or is a mobile-responsive web app sufficient?
4. Are payment reminders / follow-up emails in scope?
5. Should Brunswick and Lorne have separate booking URLs (e.g. `/brunswick`, `/lorne`) or one unified page?
