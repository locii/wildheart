import {
  Body, Container, Head, Heading, Html, Preview,
  Section, Text, Hr,
} from "@react-email/components";

interface Props {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

export function ContactNotificationEmail({ name, email, phone, message }: Props) {
  return (
    <Html>
      <Head />
      <Preview>New contact message from {name}</Preview>
      <Body style={{ backgroundColor: "#f9fafb", fontFamily: "sans-serif" }}>
        <Container style={{ maxWidth: 560, margin: "40px auto", backgroundColor: "#fff", borderRadius: 12, padding: 32 }}>
          <Heading style={{ fontSize: 20, color: "#1c1917", marginBottom: 4 }}>
            New contact message
          </Heading>
          <Text style={{ color: "#78716c", marginTop: 0 }}>from {name}</Text>
          <Hr style={{ borderColor: "#e7e5e4", margin: "20px 0" }} />
          <Section>
            <Text style={{ margin: "0 0 4px", fontWeight: 600, color: "#1c1917" }}>Name</Text>
            <Text style={{ margin: "0 0 16px", color: "#44403c" }}>{name}</Text>
            <Text style={{ margin: "0 0 4px", fontWeight: 600, color: "#1c1917" }}>Email</Text>
            <Text style={{ margin: "0 0 16px", color: "#44403c" }}>{email}</Text>
            {phone && (
              <>
                <Text style={{ margin: "0 0 4px", fontWeight: 600, color: "#1c1917" }}>Phone</Text>
                <Text style={{ margin: "0 0 16px", color: "#44403c" }}>{phone}</Text>
              </>
            )}
            <Text style={{ margin: "0 0 4px", fontWeight: 600, color: "#1c1917" }}>Message</Text>
            <Text style={{ margin: 0, color: "#44403c", whiteSpace: "pre-wrap" }}>{message}</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
