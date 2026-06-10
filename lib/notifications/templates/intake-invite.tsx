import {
  Html, Head, Body, Container, Heading, Text, Link, Hr,
} from "@react-email/components";
import * as React from "react";

interface Props {
  clientFirstName: string;
  appointmentType: string;
  date: string;
  intakeUrl: string;
}

export function IntakeInviteEmail({
  clientFirstName,
  appointmentType,
  date,
  intakeUrl,
}: Props) {
  return (
    <Html lang="en">
      <Head />
      <Body style={body}>
        <Container style={container}>
          <Heading style={h1}>Welcome — please complete your intake form</Heading>
          <Text style={greeting}>Hi {clientFirstName},</Text>
          <Text style={text}>
            Thank you for booking a {appointmentType} on {date}. Before your first appointment, we&apos;d love to learn a bit more about you.
          </Text>
          <Text style={text}>
            Please take a few minutes to complete this short intake form:
          </Text>
          <Text style={text}>
            <Link href={intakeUrl} style={ctaLink}>Complete intake form →</Link>
          </Text>
          <Text style={text}>
            You can also skip this for now and come back to it before your appointment. The form is completely optional.
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
const ctaLink = { color: "#1d4ed8", fontWeight: "600", textDecoration: "underline", fontSize: "16px" };
const hr = { borderColor: "#e5e7eb", margin: "24px 0" };
const footer = { fontSize: "13px", color: "#9ca3af" };
