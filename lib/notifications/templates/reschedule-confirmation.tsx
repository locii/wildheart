import {
  Html, Head, Body, Container, Heading, Text, Link, Section, Hr,
} from "@react-email/components";
import * as React from "react";
import { s } from "./shared";

interface Props {
  clientFirstName: string;
  appointmentType: string;
  locationName: string;
  oldDate: string;
  oldTime: string;
  newDate: string;
  newTime: string;
  manageUrl: string;
}

export function RescheduleConfirmationEmail({
  clientFirstName,
  appointmentType,
  locationName,
  oldDate,
  oldTime,
  newDate,
  newTime,
  manageUrl,
}: Props) {
  return (
    <Html lang="en">
      <Head />
      <Body style={s.body}>
        <Container style={s.wrapper}>
          <Section style={s.header}>
            <Text style={s.brandName}>Wildheart Psychotherapy</Text>
          </Section>
          <Section style={s.card}>
            <Heading style={s.heading}>Appointment rescheduled</Heading>
            <Text style={s.greeting}>Hi {clientFirstName},</Text>
            <Text style={s.text}>
              Your appointment has been rescheduled. Here are your updated details:
            </Text>

            <Section style={s.detailBox}>
              <Text style={s.detailLabel}>New time</Text>
              <Text style={s.detailRow}><strong>Service</strong> &nbsp;{appointmentType}</Text>
              <Text style={s.detailRow}><strong>Location</strong> &nbsp;{locationName}</Text>
              <Text style={s.detailRow}><strong>Date</strong> &nbsp;{newDate}</Text>
              <Text style={s.detailRow}><strong>Time</strong> &nbsp;{newTime}</Text>
            </Section>

            <Text style={{ ...s.detailMuted, marginBottom: "20px" }}>
              Previous time: {oldDate} at {oldTime}
            </Text>

            <Text style={s.text}>
              Need to make another change?{" "}
              <Link href={manageUrl} style={s.link}>Manage your appointment →</Link>
            </Text>

            <Hr style={s.hr} />
            <Text style={s.footer}>
              Wildheart Psychotherapy · This email confirms your rescheduled appointment.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
