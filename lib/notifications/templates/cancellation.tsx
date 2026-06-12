import {
  Html, Head, Body, Container, Heading, Text, Section, Hr,
} from "@react-email/components";
import * as React from "react";
import { s } from "./shared";

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
      <Body style={s.body}>
        <Container style={s.wrapper}>
          <Section style={s.header}>
            <Text style={s.brandName}>Wildheart Psychotherapy</Text>
          </Section>
          <Section style={s.card}>
            <Heading style={s.heading}>Appointment cancelled</Heading>
            <Text style={s.greeting}>Hi {clientFirstName},</Text>
            <Text style={s.text}>
              Your appointment has been cancelled. Here are the details for your records:
            </Text>

            <Section style={s.detailBox}>
              <Text style={s.detailLabel}>Cancelled appointment</Text>
              <Text style={s.detailRow}><strong>Service</strong> &nbsp;{appointmentType}</Text>
              <Text style={s.detailRow}><strong>Location</strong> &nbsp;{locationName}</Text>
              <Text style={s.detailRow}><strong>Date</strong> &nbsp;{date}</Text>
              <Text style={s.detailRow}><strong>Time</strong> &nbsp;{time}</Text>
            </Section>

            <Text style={s.text}>
              If you&apos;d like to book a new appointment, please visit our website.
            </Text>

            <Hr style={s.hr} />
            <Text style={s.footer}>
              Wildheart Psychotherapy · This email confirms your cancellation.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
