import {
  Html, Head, Body, Container, Heading, Text, Link, Hr, Section,
} from "@react-email/components";
import * as React from "react";
import { s } from "./shared";

interface Props {
  clientFirstName: string;
  appointmentType: string;
  locationName: string;
  locationAddress?: string | null;
  date: string;
  time: string;
  price?: number;
  manageUrl: string;
  isNewClient: boolean;
  intakeUrl?: string;
}

export function BookingConfirmationEmail({
  clientFirstName,
  appointmentType,
  locationName,
  locationAddress,
  date,
  time,
  price,
  manageUrl,
  isNewClient,
  intakeUrl,
}: Props) {
  const location = locationAddress ? `${locationName}, ${locationAddress}` : locationName;

  return (
    <Html lang="en">
      <Head />
      <Body style={s.body}>
        <Container style={s.wrapper}>
          <Section style={s.header}>
            <Text style={s.brandName}>Wildheart Psychotherapy</Text>
          </Section>
          <Section style={s.card}>
            <Heading style={s.heading}>Your appointment is confirmed</Heading>
            <Text style={s.greeting}>Hi {clientFirstName},</Text>
            <Text style={s.text}>
              Your appointment has been booked. Here are your details:
            </Text>

            <Section style={s.detailBox}>
              <Text style={s.detailLabel}>Appointment details</Text>
              <Text style={s.detailRow}><strong>Service</strong> &nbsp;{appointmentType}</Text>
              <Text style={s.detailRow}><strong>Location</strong> &nbsp;{location}</Text>
              <Text style={s.detailRow}><strong>Date</strong> &nbsp;{date}</Text>
              <Text style={s.detailRow}><strong>Time</strong> &nbsp;{time}</Text>
              {price !== undefined && price > 0 && (
                <Text style={s.detailRow}><strong>Fee</strong> &nbsp;${price}</Text>
              )}
            </Section>

            <Text style={s.text}>
              Need to reschedule or cancel?{" "}
              <Link href={manageUrl} style={s.link}>Manage your appointment →</Link>
            </Text>

            {isNewClient && intakeUrl && (
              <>
                <Hr style={s.hr} />
                <Text style={s.text}>
                  <strong>One more thing:</strong> as a new client, please take a few minutes to
                  complete a short intake form before your appointment.
                </Text>
                <Text style={s.text}>
                  <Link href={intakeUrl} style={s.link}>Complete your intake form →</Link>
                </Text>
              </>
            )}

            <Hr style={s.hr} />
            <Text style={s.footer}>
              Wildheart Psychotherapy · This email was sent to confirm your booking.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
