/** Shared inline styles for all Wildheart email templates. */

export const s = {
  body: {
    backgroundColor: "#f5f0ea",
    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    margin: "0",
    padding: "0",
  },
  wrapper: {
    maxWidth: "560px",
    margin: "0 auto",
    padding: "32px 16px 48px",
  },
  // Brand header
  header: {
    backgroundColor: "#2d1a10",
    borderRadius: "10px 10px 0 0",
    padding: "22px 32px",
  },
  brandName: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#ffba08",
    letterSpacing: "2.5px",
    textTransform: "uppercase" as const,
    margin: "0",
  },
  // Main content card
  card: {
    backgroundColor: "#ffffff",
    padding: "32px",
    borderRadius: "0 0 10px 10px",
    marginBottom: "0",
  },
  heading: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#1c1917",
    margin: "0 0 6px",
    lineHeight: "1.3",
  },
  greeting: {
    fontSize: "15px",
    color: "#44403c",
    margin: "0 0 16px",
    lineHeight: "1.5",
  },
  text: {
    fontSize: "15px",
    color: "#44403c",
    lineHeight: "1.65",
    margin: "0 0 16px",
  },
  // Appointment detail card
  detailBox: {
    backgroundColor: "#fdf9f5",
    border: "1px solid #ede8e2",
    borderRadius: "8px",
    padding: "18px 20px",
    margin: "0 0 20px",
  },
  detailLabel: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#92400e",
    letterSpacing: "1.5px",
    textTransform: "uppercase" as const,
    margin: "0 0 10px",
  },
  detailRow: {
    fontSize: "14px",
    color: "#1c1917",
    margin: "0 0 5px",
    lineHeight: "1.5",
  },
  detailMuted: {
    fontSize: "13px",
    color: "#78716c",
    margin: "0 0 5px",
    lineHeight: "1.5",
  },
  // Door code highlight
  doorCodeBox: {
    backgroundColor: "#fff8ec",
    border: "1px solid #f59e0b",
    borderRadius: "8px",
    padding: "18px 20px",
    margin: "0 0 20px",
    textAlign: "center" as const,
  },
  doorCodeLabel: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#92400e",
    letterSpacing: "1.5px",
    textTransform: "uppercase" as const,
    margin: "0 0 6px",
  },
  doorCodeValue: {
    fontSize: "32px",
    fontWeight: "700",
    color: "#92400e",
    letterSpacing: "8px",
    margin: "0",
    fontVariantNumeric: "tabular-nums",
  },
  // CTA link
  link: {
    color: "#b45309",
    textDecoration: "underline",
    fontWeight: "500",
  },
  hr: {
    borderTop: "1px solid #e8e3dd",
    borderBottom: "none",
    margin: "24px 0",
  },
  footer: {
    fontSize: "12px",
    color: "#a8a29e",
    textAlign: "center" as const,
    lineHeight: "1.6",
    margin: "0",
  },
};
