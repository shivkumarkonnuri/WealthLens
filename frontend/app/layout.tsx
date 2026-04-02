import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WealthLens — Personal Finance Intelligence",
  description: "AI-powered personal finance tracker with smart risk analysis and actionable insights.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
