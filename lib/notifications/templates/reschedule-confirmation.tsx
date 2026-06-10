import {
  Html, Head, Body, Container, Heading, Text, Link, Section, Hr,
} from "@react-email/components";
import * as React from "react";

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
      <Body style={body}>
        <Container style={container}>
          <Heading style={h1}>Appointment rescheduled</Heading>
          <Text style={greeting}>Hi {clientFirstName},</Text>
          <Text style={text}>
            Your appointment has been rescheduled. Here are your updated details:
          </Text>

          <Section style={card}>
            <Text style={label}>NEW TIME</Text>
            <Text style={detail}><strong>What:</strong> {appointmentType}</Text>
            <Text style={detail}><strong>Where:</strong> {locationName}</Text>
            <Text style={detail}><strong>When:</strong> {newDate}</Text>
            <Text style={detail}><strong>Time:</strong> {newTime}</Text>
          </Section>

          <Text style={oldLabel}>Previous time: {oldDate} at {oldTime}</Text>

          <Text style={text}>
            Need to make another change?{" "}
            <Link href={manageUrl} style={link}>Manage your appointment →</Link>
          </Text>

          <Hr style={hr} />
          <Text style={footer}>Wildheart Psychotherapy</Text>
        </Container>
      </Body>
    </Html>
  );
}

const body = { backgroundColor: "#f9fafb", fontFamily: "sans-serif" };
const container = { maxWidth: "540px", margin: "0 auto", padding: "40px 20px" };
const h1 = { fontSize: "22px", fontWeight: "700", color: "#111827", marginBottom: "8px" };
const greeting = { fontSize: "16px", color: "#374151", marginBottom: "4px" };
const text = { fontSize: "15px", color: "#374151", lineHeight: "1.6", marginBottom: "12px" };
const card = { backgroundColor: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "20px", marginBottom: "12px" };
const label = { fontSize: "11px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase" as const, letterSpacing: "0.05em", marginBottom: "8px" };
const detail = { fontSize: "14px", color: "#374151", marginBottom: "6px" };
const oldLabel = { fontSize: "13px", color: "#9ca3af", marginBottom: "16px" };
const link = { color: "#1d4ed8", textDecoration: "underline" };
const hr = { borderColor: "#e5e7eb", margin: "24px 0" };
const footer = { fontSize: "13px", color: "#9ca3af" };
