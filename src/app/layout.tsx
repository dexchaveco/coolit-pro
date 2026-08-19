import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Coolit Pro",
  description: "Cool It With Rick — field service, intake, and dispatch",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-page text-ink">{children}</body>
    </html>
  );
}
