import {
  Html, Head, Body, Container, Heading, Text, Link, Section, Hr,
} from "@react-email/components";
import * as React from "react";
import { s } from "./shared";

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
      <Body style={s.body}>
        <Container style={s.wrapper}>
          <Section style={s.header}>
            <Text style={s.brandName}>Wildheart Psychotherapy</Text>
          </Section>
          <Section style={s.card}>
            <Heading style={s.heading}>Welcome — please complete your intake form</Heading>
            <Text style={s.greeting}>Hi {clientFirstName},</Text>
            <Text style={s.text}>
              Thank you for booking a {appointmentType} on {date}. Before your first appointment,
              we&apos;d love to learn a little more about you.
            </Text>
            <Text style={s.text}>
              Please take a few minutes to complete this short intake form:
            </Text>

            <Section style={{ marginBottom: "20px" }}>
              <Link href={intakeUrl} style={{ ...s.link, fontSize: "15px" }}>
                Complete your intake form →
              </Link>
            </Section>

            <Text style={{ ...s.text, color: "#78716c" }}>
              The form is optional — you&apos;re welcome to skip it and come back before your appointment.
            </Text>

            <Hr style={s.hr} />
            <Text style={s.footer}>
              Wildheart Psychotherapy · We look forward to meeting you.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
