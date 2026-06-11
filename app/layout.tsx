import type { Metadata } from "next";
import { Geist, Geist_Mono, Montserrat_Alternates, Poppins } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const montserratAlternates = Montserrat_Alternates({
  variable: "--font-heading-public",
  subsets: ["latin"],
  weight: ["300", "600", "700"],
});

const poppins = Poppins({
  variable: "--font-body-public",
  subsets: ["latin"],
  weight: ["200", "300", "600", "700"],
});

export const metadata: Metadata = {
  title: "Wildheart Psychotherapy",
  description: "Wildheart Psychotherapy — psychotherapy, holotropic breathwork, and men's groups in Melbourne and on the Surf Coast.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${montserratAlternates.variable} ${poppins.variable} h-full antialiased font-sans`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
