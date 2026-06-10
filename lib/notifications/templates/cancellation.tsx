import {
  Html, Head, Body, Container, Heading, Text, Section, Hr,
} from "@react-email/components";
import * as React from "react";

interface Props {
  clientFirstName: string;
  appointmentType: string;
  locationName: string;
  date: string;
  time: string;
}

export function CancellationEmail({
  clientFirstName,
  appointmentType,
  locationName,
  date,
  time,
}: Props) {
  return (
    <Html lang="en">
      <Head />
      <Body style={body}>
        <Container style={container}>
          <Heading style={h1}>Appointment cancelled</Heading>
          <Text style={greeting}>Hi {clientFirstName},</Text>
          <Text style={text}>
            Your appointment has been cancelled. Here are the details:
          </Text>

          <Section style={card}>
            <Text style={detail}><strong>What:</strong> {appointmentType}</Text>
            <Text style={detail}><strong>Where:</strong> {locationName}</Text>
            <Text style={detail}><strong>When:</strong> {date}</Text>
            <Text style={detail}><strong>Time:</strong> {time}</Text>
          </Section>

          <Text style={text}>
            If you&apos;d like to book a new appointment, please visit our website.
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
const card = { backgroundColor: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "20px", marginBottom: "20px" };
const detail = { fontSize: "14px", color: "#374151", marginBottom: "6px" };
const hr = { borderColor: "#e5e7eb", margin: "24px 0" };
const footer = { fontSize: "13px", color: "#9ca3af" };
