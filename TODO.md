# Wildheart — Ship Checklist

> Audited 2026-06-13 across product, engineering, and UX lenses.

---

## 🔴 Blockers (must fix before launch)

### Product
- [ ] **Intake form param bug** — booking flow passes `?appt=` in the redirect URL but the intake page reads `?appointmentId=`. New clients land on the intake page with no appointment linked. Fix the param name in one place.
- [ ] **CMS edit pages missing** — admins can create pages/articles/menus/sidebar-blocks but cannot edit them after creation. Routes `/admin/_pages/[slug]`, `/admin/_resources/[id]`, `/admin/_menus/[id]`, `/admin/_sidebar-blocks/[id]` need edit page components.
- [ ] **Payment situation** — price is shown on booking confirmation but there's no payment step and `paid` is a manual boolean. Either (a) integrate Stripe for online payments, (b) add a "payment due at session" note and remove the fee display from confirmation email, or (c) leave as-is and document it's manual. Pick one and ship it.

### Engineering
- [ ] **`.env.example`** — no environment variable documentation exists. Anyone deploying the app has no idea what to set. Copy `.env.local` keys (without values) to `.env.example` and commit it.
- [ ] **Rate limiting on public endpoints** — `/api/appointments` (POST), `/api/contact`, and `/api/availability/slots` have no rate limiting. A spam POST loop can fill the DB or exhaust Twilio/Resend credits. Add `upstash/ratelimit` or simple IP-based limiting via middleware on these three routes.
- [ ] **Intake form is unauthenticated and unvalidated** — `/api/intake` POST doesn't verify that the `appointmentId` actually belongs to the person submitting. Add a token check (same mechanism as manage tokens) or at minimum verify the appointment exists before writing.

---

## 🟡 Important (ship week)

### Hardcoded values to move into settings
- [ ] **Business name** is hardcoded in 11+ files. Add a `site_name` key to the settings table, fetch it server-side, and replace the literals. Alternatively make it a single constant in `lib/config.ts`.
- [ ] **Contact / reply-to email** — `workshops@melbournebreathwork.com` and similar are hardcoded in `email.ts` and `contact/route.ts`. Move to env vars or settings.
- [ ] **Timezone default** — `Australia/Melbourne` is hardcoded in 6+ places. It's per-location in the DB schema but defaulted everywhere in code. Ensure all datetime operations use `appt.timezone` / `location.timezone` rather than a hardcoded string.

### Admin UX gaps
- [ ] **Client notes field** — no free-text notes on a client record. Therapists always need somewhere to store context. Add a `notes` text column to `clients` and a textarea in the admin client detail page.
- [ ] **Intake form viewer** — clients submit intake forms but there's no admin page to read them. Add `/admin/clients/[id]/intake` or surface the intake data on the existing client detail page.
- [ ] **Cancellation reason** — when an appointment is cancelled, nothing records why. Add an optional `cancel_reason` text field to the `appointments` table and a small prompt in the admin cancel flow.
- [ ] **Appointment source clarity** — `source` column stores `admin | self-book | embed` but it isn't surfaced anywhere in the admin UI. Show it as a small badge on the appointment detail.

### Client-facing UX
- [ ] **"Add to calendar" on manage page** — after booking or on the manage page, clients should be able to add the appointment to their calendar. Generate an `.ics` file server-side (the iCal infrastructure already exists) and add a download button.
- [ ] **Contact form feedback** — the contact form submits but shows no success or error message to the user. Add a visible confirmation state after submission.
- [ ] **Reschedule back-link** — after a reschedule completes, the client is on a success screen with no way back to the manage page. Add a "back to your appointment" link.
- [ ] **Terms / consent checkbox** — before confirming a booking, clients should tick a box acknowledging the cancellation policy. This is a standard therapy practice requirement. One checkbox, one line of copy.

### Notifications
- [ ] **SMS opt-in** — collecting a phone number does not equal consent to receive SMS marketing. Add a "Receive appointment reminders by SMS" opt-in checkbox to the booking form and store it on the client record. Only send SMS if opted in.
- [ ] **CMS page visibility** — the `pages` table has `is_public` but the public page renderer ignores it, so draft pages are live. Add a `.eq("is_public", true)` filter to the public pages query.

---

## 🟢 Quality pass (post-launch sprint)

### Engineering
- [ ] **Missing DB indexes** — add composite index on `(appointments.location_id, appointments.start_at)` for the dashboard query, and `(notifications.appointment_id, notifications.type, notifications.status)` for the dedup check in the cron job.
- [ ] **N+1 in client import** — `clients/import` fetches all clients then filters in memory. Replace with a `.in("email", emailArray)` query.
- [ ] **Supabase type generation** — the project uses ~90 `as any` casts because Supabase types aren't generated. Run `supabase gen types typescript` and pipe the output to `lib/supabase/database.types.ts`. Wire it into the client. This will eliminate most casts and catch schema drift at compile time.
- [ ] **Startup env validation** — add a check (e.g. with `zod` or a simple throw) that required env vars are present when the app boots. Silent `?? ""` fallbacks hide misconfigurations until runtime.
- [ ] **Error observability** — `console.error` in dispatch and routes is invisible in production. Add Sentry (one `npm install @sentry/nextjs` and a wizard run) or at minimum funnel errors to a Slack webhook.
- [ ] **Structured audit log** — admin actions (create/cancel/reschedule appointment, update client) are untracked. Add an `audit_log` table with `(user_id, action, resource_type, resource_id, payload, created_at)` and write to it on mutations. Invaluable for support and compliance.

### UX / design polish
- [ ] **Booking flow error state** — if the availability API fails, the time slot area shows nothing. Add an explicit error message and a retry button.
- [ ] **Admin list skeletons** — clients and appointments lists load with no skeleton. Add shimmer placeholders so the page doesn't look broken on slow connections.
- [ ] **Phone number validation** — booking form accepts any string for phone. Add basic Australian number validation (10 digits, starts with 0 or +61) with a clear error message.
- [ ] **Intake form required-field validation** — currently submittable with empty required fields. Add client-side validation before the form POST.
- [ ] **Empty state: no appointments this week** — the dashboard "No appointments" message is flat text. Make it actionable: "No appointments this week — [+ New appointment]".
- [ ] **Report page: date range selector** — reports show a fixed window. A simple date-range picker would make it immediately more useful.

---

## 💡 Later / nice-to-have

- [ ] **Bulk SMS/email blast** — ability to message all clients with a specific appointment type or date range (e.g. "practice closed next Monday, here's a reschedule link"). Needs a compose UI and a bulk-dispatch API.
- [ ] **Waitlist** — when all slots are full for a day, offer clients the option to join a waitlist. Notify them if a cancellation opens up.
- [ ] **Recurring appointments** — book a weekly or fortnightly recurring slot. Generates multiple `appointments` rows linked by a `series_id`.
- [ ] **Client portal** — replace the single-use manage token with a lightweight client login (magic link via Supabase) so returning clients can see all their appointments, history, and update their own details.
- [ ] **Google Calendar sync** — two-way sync via Google Calendar API so the therapist's personal calendar stays in sync without importing iCal manually.
- [ ] **Appointment type colours on dashboard** — the `appointment_types` table doesn't have a colour field. Add one and use it as the appointment chip colour on the week view, like a real calendar.
- [ ] **Dark mode** — the admin already uses a dark theme. The public booking flow is light-only. A `prefers-color-scheme` media query pass would round it out.
- [ ] **Stripe integration** — if payments are in scope, `@stripe/stripe-js` + a `/api/checkout` route + a Stripe webhook handler. The `paid` / `amount_paid` fields in the schema are ready for it.
