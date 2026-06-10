# Scheduling App — Claude Code Build Plan

## Mobile-First Principle

> The admin was previously managed via the Squarespace mobile app. The replacement must feel equally natural on a phone — both for day-to-day management and quick actions on the go.

**Admin views that must be mobile-first (designed at 390px, scaled up to desktop):**
- Dashboard — today's schedule at a glance, large tap targets
- Appointment detail — quick cancel, reschedule, mark paid, send notification
- New appointment — full create flow usable with one hand
- Availability overrides — fast day-blocking from a phone calendar

**Patterns to follow throughout:**
- Bottom sheet / drawer for detail panels instead of sidebars on mobile
- Sticky action bars at the bottom of the screen (not top) for primary CTAs
- No hover-only interactions — everything reachable by tap
- Large touch targets (min 44px), generous spacing between list items
- Date/time pickers use native inputs on mobile (`input type="date"`, `type="time"`) falling back to custom on desktop
- Table views collapse to card stacks on small screens

**Fine-tuning note:** Mobile layout will need iterative feedback as real usage reveals friction points. Flag any screen during build that feels cramped or tap-heavy.

---

## Stack
| Layer | Tool | Reason |
|---|---|---|
| Framework | Next.js 15 (App Router) | API routes + public booking pages + embeddable widget |
| Database + Auth | Supabase | Managed Postgres, built-in auth, easy dashboard access |
| UI | Tailwind CSS + shadcn/ui | Fast, consistent components — mobile-first utility classes |
| Email | Resend | Best Next.js integration, reliable AU delivery |
| SMS | Twilio | AU SMS, programmable reminders |
| Hosting | Vercel | Zero-config Next.js deploy, cron jobs built in |

---

## Data Model

```sql
-- Two clinics
locations (
  id uuid PK,
  name text,           -- "Brunswick" | "Lorne"
  slug text unique,    -- "brunswick" | "lorne"
  timezone text        -- "Australia/Melbourne"
)

-- e.g. Psychotherapy 50min $160, Extended 80min $240, Free intro 20min
appointment_types (
  id uuid PK,
  name text,
  duration_minutes int,
  price numeric,
  location_id uuid FK  -- null = available at both
)

clients (
  id uuid PK,
  first_name text,
  last_name text,
  phone text,
  email text,
  created_at timestamptz,
  imported_from text,        -- "squarespace" | null
  last_appointment_at timestamptz  -- populated on import from days-since field
)

-- Intake form responses (one per client, nullable fields = skipped)
intake_forms (
  id uuid PK,
  client_id uuid FK,
  appointment_id uuid FK,    -- which booking triggered the form
  completed_at timestamptz,  -- null = skipped
  data jsonb                 -- flexible key/value responses
)

-- Intake form question config (admin-defined)
intake_questions (
  id uuid PK,
  question text,
  field_key text,
  field_type text,           -- "text" | "textarea" | "select" | "checkbox"
  options jsonb,             -- for select fields
  required bool,
  sort_order int,
  is_active bool
)

-- Weekly recurring schedule per location
availability_rules (
  id uuid PK,
  location_id uuid FK,
  day_of_week int,           -- 0=Sun … 6=Sat
  start_time time,
  end_time time,
  is_active bool
)

-- One-off overrides: block a day, block a range, or unblock
availability_overrides (
  id uuid PK,
  location_id uuid FK,
  date date,
  is_blocked bool,
  start_time time,           -- null = whole day
  end_time time,
  repeat_weekly bool,        -- repeats every week on this weekday
  notes text
)

appointments (
  id uuid PK,
  client_id uuid FK,
  location_id uuid FK,
  type_id uuid FK,
  start_at timestamptz,
  end_at timestamptz,
  timezone text,
  paid bool default false,
  amount_paid numeric default 0,
  scheduled_by text,         -- email of who booked, or "client-self"
  source text,               -- "admin" | "self-book" | "embed"
  created_at timestamptz,
  rescheduled_at timestamptz,
  cancelled_at timestamptz
)

-- Secure tokens for client self-serve manage links (in emails)
appointment_tokens (
  id uuid PK,
  appointment_id uuid FK,
  token text unique,         -- signed random token
  action text,               -- "manage" (covers both reschedule + cancel)
  expires_at timestamptz,
  used_at timestamptz
)

-- Notification log
notifications (
  id uuid PK,
  appointment_id uuid FK,
  type text,                 -- "booking" | "cancellation" | "reschedule" | "reminder_24h" | "reminder_1h"
  channel text,              -- "email" | "sms"
  sent_at timestamptz,
  status text                -- "sent" | "failed" | "skipped"
)
```

---

## Key Logic

### Availability & Slot Generation
1. Load `availability_rules` for the location + day of week
2. Subtract any `availability_overrides` blocking time on that date
3. Subtract existing `appointments` (both locations — practitioner is shared)
4. Return slots matching appointment type duration

### Cross-Location Blocking
- Practitioner is one person across both clinics
- Slot query always checks `appointments WHERE location_id IN (both)` for the same time window
- Booking at Brunswick blocks Lorne and vice versa

### Availability Override Logic
- Whole-day block: `start_time = null`
- Partial block: `start_time` + `end_time` set
- `repeat_weekly = true` → treated as recurring, applied to matching weekdays
- Standard schedule managed via `availability_rules`; one-offs via `availability_overrides`

### Client Self-Serve (Token Links)
- On booking, generate a signed token stored in `appointment_tokens`
- Token expires 1 hour before appointment start
- Email contains link: `https://app.com/manage/[token]`
- Token page shows appointment details + Reschedule and Cancel buttons
- Reschedule: re-runs booking flow pre-filled, cancels old on confirmation
- Cancel: soft-delete (sets `cancelled_at`), triggers optional notifications

### Embeddable Widget
- `/book/[location]` serves a clean, frameable page
- Add `?embed=true` query param to suppress header/footer/nav
- Embed code provided in admin: `<iframe src="..." />` snippet
- Widget is fully self-contained — booking, confirmation, intake form all within the iframe flow

### Intake Form (New Clients Only)
- Triggered after booking confirmation for clients with no prior appointments
- Form page linked from confirmation page and confirmation email
- "Skip for now" button available — sets `completed_at = null`
- Admin can see intake status per client and resend the link

### Sales Reporting
- Query `appointments` joined with `appointment_types` (price) and `locations`
- Filter: exclude cancelled, include only appointments in range
- Group by: week / month / year (selectable)
- Metrics: total revenue, appointment count, avg value, breakdown by type, breakdown by location
- Comparison: same period prior year / prior period toggle
- Export: CSV download of any report view

### Squarespace Client Import
- CSV format: `First Name, Last Name, Phone, Email, Days Since Last Appointment`
- Parse on upload, map to `clients` table
- Calculate `last_appointment_at` = today minus days-since value
- Skip rows where email already exists (dedup by email)
- Preview table before confirming import (shows new vs skipped)

---

## File Structure

```
app/
  (admin)/
    layout.tsx                    # Auth guard, nav
    dashboard/page.tsx            # Today's schedule, quick stats
    appointments/
      page.tsx                    # Full list, filters, CSV export
      new/page.tsx                # Admin-create appointment
      [id]/page.tsx               # View / edit / cancel / send notifications
    availability/
      page.tsx                    # Weekly schedule + override calendar per location
    clients/
      page.tsx                    # Client list + import button
      [id]/page.tsx               # Client detail: history, intake form status, resend links
    intake/
      page.tsx                    # Manage intake questions
    reports/
      page.tsx                    # Sales reporting: weekly/monthly/annual + comparison
    embed/
      page.tsx                    # Embed code generator per location

  book/
    [location]/
      page.tsx                    # Public booking flow (type → date → time → details → confirm)
      success/page.tsx            # Confirmation + intake form prompt
      intake/page.tsx             # Intake form (skippable)

  manage/
    [token]/
      page.tsx                    # Client self-serve: view appointment + reschedule/cancel
      reschedule/page.tsx         # Re-runs booking flow, cancels old on confirm
      cancel/page.tsx             # Cancel confirmation page

  api/
    appointments/
      route.ts                    # GET list, POST create
      [id]/
        route.ts                  # GET, PATCH, DELETE
        notify/route.ts           # POST — manually trigger notification
    availability/
      slots/route.ts              # GET available slots
      rules/route.ts              # GET/POST/PATCH rules
      overrides/route.ts          # GET/POST/PATCH/DELETE overrides
    clients/
      route.ts                    # GET list, POST create
      import/route.ts             # POST — Squarespace CSV upload
    intake/
      route.ts                    # GET questions, POST response
      [appointmentId]/route.ts    # GET/POST form for a specific booking
    reports/
      route.ts                    # GET sales data with params
    tokens/
      [token]/route.ts            # GET — validate token + return appointment
    cron/
      reminders/route.ts          # Vercel cron — 24h + 1h reminders

lib/
  supabase/
    client.ts
    server.ts
  availability.ts                 # Slot generation logic
  tokens.ts                       # Generate + validate appointment tokens
  notifications/
    email.ts                      # Resend + React Email templates
    sms.ts                        # Twilio send
    dispatch.ts                   # Unified send(appointment, type, channels[])
  reports.ts                      # Sales aggregation queries
  import.ts                       # Squarespace CSV parser
  types.ts

components/
  booking/
    TypePicker.tsx
    DatePicker.tsx
    TimeSlotGrid.tsx
    ClientForm.tsx
    ConfirmSummary.tsx
  manage/
    AppointmentManageCard.tsx
    RescheduleFlow.tsx
    CancelConfirm.tsx
  intake/
    IntakeForm.tsx
    SkipButton.tsx
  admin/
    AppointmentCard.tsx
    AvailabilityRuleEditor.tsx
    OverrideCalendar.tsx
    NotificationControls.tsx      # Checkboxes: send email / send SMS
    ReportChart.tsx               # Revenue/count bar chart
    ClientImportPreview.tsx       # Table preview before confirming import
    EmbedCodePanel.tsx
  ui/                             # shadcn components
```

---

## Email Templates

| Template | Trigger | Contains |
|---|---|---|
| Booking confirmation | New appointment | Date, time, location, type, manage link |
| Cancellation | Appointment cancelled | Details of cancelled appointment |
| Reschedule confirmation | Appointment rescheduled | Old + new time, new manage link |
| 24h reminder | Cron, day before | Date, time, location, manage link |
| 1h reminder | Cron, 1hr before | Date, time, location, manage link |
| Intake form invite | Post-booking, new clients | Link to intake form with skip option |

All emails include: `Manage your appointment →` link (token-based, no login required)

---

## Build Phases

### Phase 1 — Foundation
- [ ] Init Next.js 15 project with Tailwind + shadcn/ui
- [ ] Supabase schema: run all SQL, seed locations + appointment types + intake questions
- [ ] Supabase Auth: admin login only
- [ ] Admin layout with auth guard + nav

### Phase 2 — Availability Management
- [ ] Weekly schedule grid (availability_rules) per location
- [ ] Override calendar: block whole day, partial day, repeating blocks
- [ ] Slot generation logic (`lib/availability.ts`) — cross-location aware
- [ ] `GET /api/availability/slots` endpoint

### Phase 3 — Public Booking Flow + Embed
- [ ] `/book/[location]` full multi-step flow
- [ ] `?embed=true` mode strips chrome for iframe use
- [ ] Admin embed code generator page (`/admin/embed`)
- [ ] `/book/[location]/success` with intake form prompt for new clients
- [ ] Intake form page with skip option

### Phase 4 — Admin Appointment Management
- [ ] Dashboard: today's appointments, counts per location
- [ ] Appointments list: filter by location/date/client, export CSV
- [ ] Admin create appointment (search existing client or create new)
- [ ] Appointment detail: edit, mark paid, cancel, manual notification send

### Phase 5 — Client Self-Serve (Manage Links)
- [ ] Token generation on booking (`lib/tokens.ts`)
- [ ] `/manage/[token]` — view appointment, reschedule, cancel
- [ ] Reschedule flow: re-runs booking, cancels old on confirm
- [ ] Cancel confirmation with optional notification

### Phase 6 — Notifications
- [ ] Resend + domain setup
- [ ] Twilio AU number setup
- [ ] All email templates (React Email)
- [ ] SMS templates
- [ ] `dispatch.ts` unified sender with notification logging
- [ ] Auto-send on booking; optional send on cancellation/reschedule via checkboxes
- [ ] Vercel cron `/api/cron/reminders` — 24h + 1h reminders

### Phase 7 — Client Management + Import
- [ ] Client list with search
- [ ] Client detail: appointment history, intake form status, resend intake link
- [ ] Squarespace CSV import (`lib/import.ts`)
- [ ] Import preview table + confirm flow
- [ ] Dedup by email, calculate `last_appointment_at` from days-since field

### Phase 8 — Reporting
- [ ] Sales report page: select week/month/year + comparison toggle
- [ ] Metrics: revenue, count, avg value, by type, by location
- [ ] Bar chart (shadcn/recharts)
- [ ] CSV export of report data

### Phase 9 — Polish + Deploy
- [ ] Mobile-responsive booking and manage pages
- [ ] Double-booking race condition guard (DB constraint on overlapping slots)
- [ ] Token expiry enforcement
- [ ] Environment variable documentation
- [ ] Vercel production deploy + Supabase production project

---

## Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

RESEND_API_KEY=
RESEND_FROM_EMAIL=appointments@yourdomain.com

TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_FROM_NUMBER=       # AU virtual number

NEXT_PUBLIC_APP_URL=https://yourdomain.com
CRON_SECRET=              # Shared secret to protect /api/cron/* routes
TOKEN_SECRET=             # Secret for signing appointment manage tokens
```

---

## Estimated Build Sessions

| Session | Scope |
|---|---|
| 1 | Project init, Supabase schema, auth, admin shell |
| 2 | Availability rules + overrides UI + slot generation |
| 3 | Public booking flow + embed mode + intake form |
| 4 | Admin dashboard + appointment management |
| 5 | Client self-serve manage links (reschedule + cancel) |
| 6 | Notifications — email templates, SMS, cron reminders |
| 7 | Client management + Squarespace CSV import |
| 8 | Sales reporting (weekly/monthly/annual + comparison) |
| 9 | Polish, edge cases, mobile, deploy |
