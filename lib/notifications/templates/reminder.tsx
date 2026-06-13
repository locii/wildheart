import {
  Html, Head, Body, Container, Heading, Text, Link, Section, Hr,
} from "@react-email/components";
import * as React from "react";
import { s } from "./shared";

interface Props {
  clientFirstName: string;
  appointmentType: string;
  locationName: string;
  date: string;
  time: string;
  manageUrl: string;
  reminderType: "24h" | "48h" | "1h";
  doorCode?: string;
}

export function ReminderEmail({
  clientFirstName,
  appointmentType,
  locationName,
  date,
  time,
  manageUrl,
  reminderType,
  doorCode,
}: Props) {
  const when = reminderType === "48h" ? "in 2 days" : reminderType === "24h" ? "tomorrow" : "in about an hour";

  return (
    <Html lang="en">
      <Head />
      <Body style={s.body}>
        <Container style={s.wrapper}>
          <Section style={s.header}>
            <Text style={s.brandName}>Wildheart Psychotherapy</Text>
          </Section>
          <Section style={s.card}>
            <Heading style={s.heading}>Appointment reminder</Heading>
            <Text style={s.greeting}>Hi {clientFirstName},</Text>
            <Text style={s.text}>
              Just a reminder — your appointment is {when}.
            </Text>

            <Section style={s.detailBox}>
              <Text style={s.detailLabel}>Appointment details</Text>
              <Text style={s.detailRow}><strong>Service</strong> &nbsp;{appointmentType}</Text>
              <Text style={s.detailRow}><strong>Location</strong> &nbsp;{locationName}</Text>
              <Text style={s.detailRow}><strong>Date</strong> &nbsp;{date}</Text>
              <Text style={s.detailRow}><strong>Time</strong> &nbsp;{time}</Text>
            </Section>

            {doorCode && (
              <Section style={s.doorCodeBox}>
                <Text style={s.doorCodeLabel}>Door code</Text>
                <Text style={s.doorCodeValue}>{doorCode}</Text>
              </Section>
            )}

            <Text style={s.text}>
              Need to reschedule or cancel?{" "}
              <Link href={manageUrl} style={s.link}>Manage your appointment →</Link>
            </Text>

            <Hr style={s.hr} />
            <Text style={s.footer}>
              Wildheart Psychotherapy · This is an automated reminder.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
