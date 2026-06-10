import {
  Html, Head, Body, Container, Heading, Text, Link, Section, Hr,
} from "@react-email/components";
import * as React from "react";

interface Props {
  clientFirstName: string;
  appointmentType: string;
  locationName: string;
  date: string;
  time: string;
  manageUrl: string;
  reminderType: "24h" | "1h";
}

export function ReminderEmail({
  clientFirstName,
  appointmentType,
  locationName,
  date,
  time,
  manageUrl,
  reminderType,
}: Props) {
  const when = reminderType === "24h" ? "tomorrow" : "in about an hour";

  return (
    <Html lang="en">
      <Head />
      <Body style={body}>
        <Container style={container}>
          <Heading style={h1}>Appointment reminder</Heading>
          <Text style={greeting}>Hi {clientFirstName},</Text>
          <Text style={text}>
            Just a reminder that you have an appointment {when}.
          </Text>

          <Section style={card}>
            <Text style={detail}><strong>What:</strong> {appointmentType}</Text>
            <Text style={detail}><strong>Where:</strong> {locationName}</Text>
            <Text style={detail}><strong>When:</strong> {date}</Text>
            <Text style={detail}><strong>Time:</strong> {time}</Text>
          </Section>

          <Text style={text}>
            Need to reschedule or cancel?{" "}
            <Link href={manageUrl} style={link}>Manage your appointment →</Link>
          </Text>

          <Hr style={hr} />
          <Text style={footer}>Wildheart Psychotherapy</Text>
        </Container>
      </Body>
    </Html>
  );
}

export function smsReminderText(
  clientFirstName: string,
  appointmentType: string,
  date: string,
  time: string,
  manageUrl: string,
  reminderType: "24h" | "1h"
): string {
  const when = reminderType === "24h" ? "tomorrow" : "in 1 hour";
  return `Hi ${clientFirstName}, reminder: your ${appointmentType} is ${when} on ${date} at ${time}. Manage: ${manageUrl}`;
}

const body = { backgroundColor: "#f9fafb", fontFamily: "sans-serif" };
const container = { maxWidth: "540px", margin: "0 auto", padding: "40px 20px" };
const h1 = { fontSize: "22px", fontWeight: "700", color: "#111827", marginBottom: "8px" };
const greeting = { fontSize: "16px", color: "#374151", marginBottom: "4px" };
const text = { fontSize: "15px", color: "#374151", lineHeight: "1.6", marginBottom: "12px" };
const card = { backgroundColor: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "20px", marginBottom: "20px" };
const detail = { fontSize: "14px", color: "#374151", marginBottom: "6px" };
const link = { color: "#1d4ed8", textDecoration: "underline" };
const hr = { borderColor: "#e5e7eb", margin: "24px 0" };
const footer = { fontSize: "13px", color: "#9ca3af" };
