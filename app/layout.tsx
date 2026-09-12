import type { Metadata } from "next";
import { Archivo_Black, Space_Grotesk, Special_Elite } from "next/font/google";
import { AuthBar } from "@/components/auth/AuthBar";
import { ProgressProvider } from "@/components/auth/ProgressProvider";
import "./globals.css";

const display = Archivo_Black({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display-loaded",
});

const body = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-body-loaded",
});

const elite = Special_Elite({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-elite-loaded",
});

export const metadata: Metadata = {
  title: "kneecAPP — Learn Irish off Kneecap",
  description:
    "Irish language lessons through Kneecap: live bilingual lyrics and Duolingo-style mini games.",
  icons: {
    icon: [{ url: "/icon.png", type: "image/png", sizes: "32x32" }],
    apple: [{ url: "/apple-icon.png", sizes: "80x80" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${display.variable} ${body.variable} ${elite.variable} grain bg-atmosphere antialiased`}
        style={
          {
            "--font-display": "var(--font-display-loaded), 'Archivo Black', sans-serif",
            "--font-body": "var(--font-body-loaded), 'Space Grotesk', sans-serif",
            "--font-elite": "var(--font-elite-loaded), 'Special Elite', cursive",
          } as React.CSSProperties
        }
      >
        <ProgressProvider>
          <AuthBar />
          {children}
        </ProgressProvider>
      </body>
    </html>
  );
}
