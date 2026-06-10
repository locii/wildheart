# Questions for Anthony

These need to be answered before the app is ready to go live.

## Resend (Email)

1. **RESEND_API_KEY** — Create an account at resend.com and get an API key. Add it to `.env.local`.
2. **Sending domain** — What domain should confirmation emails come from? (e.g. `appointments@wildheart.com.au`). You'll need to verify the domain in Resend. Update `RESEND_FROM_EMAIL` in `.env.local`.
3. ~~**Reply-to address**~~ — Set to `workshops@melbournebreathwork.com` ✓

## Twilio (SMS)

4. **Do you want SMS notifications?** — Twilio credentials are empty. If SMS is not needed for launch, we can skip it (email-only works without any config). If yes:
   - Create a Twilio account, buy an AU number
   - Fill in `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER` in `.env.local`

## Production Domain

5. **NEXT_PUBLIC_APP_URL** — What is the production URL? (e.g. `https://book.wildheart.com.au`). This is used in all manage/intake links sent in emails.
6. **Custom domain on Vercel** — Do you have a domain ready to point at Vercel, or do you want to use the auto-generated Vercel URL for now?

## Intake Form Questions

7. **What questions do you want on the intake form?** — The intake form is stored in the database via `intake_questions`. The table is empty right now — I need a list of questions to seed it. For each question, let me know: the question text, whether it's required, and the field type (short text / long text / multiple choice / checkbox).

## Notifications Schema

8. **The notifications table in Supabase** does not include `intake` as a valid type. If you want intake emails logged, run this migration on Supabase:
   ```sql
   alter table notifications drop constraint notifications_type_check;
   alter table notifications add constraint notifications_type_check
     check (type in ('booking','cancellation','reschedule','reminder_24h','reminder_1h','intake'));
   ```
   If you don't care about logging intake emails (it's not critical), no action needed.

## Cron (Vercel reminders)

9. **Cron secret** — `CRON_SECRET` is already generated in `.env.local`. When you deploy to Vercel, add this same value to Vercel's environment variables so the cron job is protected.

## Business Details

10. **Practitioner name** — Email templates currently say "Wildheart Psychotherapy" as the sender. Is this correct, or should it say the practitioner's name instead?
