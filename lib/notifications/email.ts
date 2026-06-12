import { Resend } from "resend";
import { render } from "@react-email/render";
import type { AppointmentWithRelations } from "@/lib/supabase/types";
import { BookingConfirmationEmail } from "./templates/booking-confirmation";
import { CancellationEmail } from "./templates/cancellation";
import { RescheduleConfirmationEmail } from "./templates/reschedule-confirmation";
import { ReminderEmail } from "./templates/reminder";
import { IntakeInviteEmail } from "./templates/intake-invite";
import { formatApptDateTime } from "./format";

let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY ?? "missing");
  return _resend;
}
const FROM = () => process.env.RESEND_FROM_EMAIL ?? "appointments@yourdomain.com";

export type EmailType = "booking" | "cancellation" | "reschedule" | "reminder_24h" | "intake";

export interface EmailResult {
  ok: boolean;
  error?: string;
}

export async function sendEmail(
  type: EmailType,
  appt: AppointmentWithRelations,
  options: {
    manageUrl?: string;
    intakeUrl?: string;
    oldAppt?: AppointmentWithRelations;
    doorCode?: string;
  } = {}
): Promise<EmailResult> {
  const { manageUrl = "", intakeUrl, oldAppt, doorCode } = options;
  const { client, type: apptType, location } = appt;
  const { date, time } = formatApptDateTime(appt.start_at, appt.end_at, appt.timezone);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let reactEl: any;
  let subject: string;

  switch (type) {
    case "booking": {
      subject = `Appointment confirmed — ${apptType.name} on ${date}`;
      reactEl = BookingConfirmationEmail({
        clientFirstName: client.first_name,
        appointmentType: apptType.name,
        locationName: location.name,
        locationAddress: location.address,
        date,
        time,
        price: apptType.price,
        manageUrl,
        isNewClient: !!intakeUrl,
        intakeUrl,
      });
      break;
    }
    case "cancellation": {
      subject = `Appointment cancelled — ${apptType.name} on ${date}`;
      reactEl = CancellationEmail({
        clientFirstName: client.first_name,
        appointmentType: apptType.name,
        locationName: location.name,
        date,
        time,
      });
      break;
    }
    case "reschedule": {
      const oldFmt = oldAppt
        ? formatApptDateTime(oldAppt.start_at, oldAppt.end_at, oldAppt.timezone)
        : { date, time };
      subject = `Appointment rescheduled — ${apptType.name}`;
      reactEl = RescheduleConfirmationEmail({
        clientFirstName: client.first_name,
        appointmentType: apptType.name,
        locationName: location.name,
        oldDate: oldFmt.date,
        oldTime: oldFmt.time,
        newDate: date,
        newTime: time,
        manageUrl,
      });
      break;
    }
    case "reminder_24h": {
      subject = `Reminder: ${apptType.name} tomorrow`;
      reactEl = ReminderEmail({
        clientFirstName: client.first_name,
        appointmentType: apptType.name,
        locationName: location.name,
        date,
        time,
        manageUrl,
        reminderType: "24h",
        doorCode,
      });
      break;
    }
    case "intake": {
      subject = "Please complete your intake form — Wildheart Psychotherapy";
      reactEl = IntakeInviteEmail({
        clientFirstName: client.first_name,
        appointmentType: apptType.name,
        date,
        intakeUrl: intakeUrl ?? "",
      });
      break;
    }
  }

  try {
    const html = await render(reactEl);
    const { error } = await getResend().emails.send({
      from: FROM(),
      to: client.email,
      replyTo: "workshops@melbournebreathwork.com",
      subject,
      html,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}
