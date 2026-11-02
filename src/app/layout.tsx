import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ScamLens — Think Before You Transfer",
  description:
    "AI-powered financial fraud awareness and scam risk inspection for Vietnamese banking and payment scenarios.",
  keywords: ["ScamLens", "fintech", "scam detection", "Vietnamese banking", "Gemini 3.8", "fraud prevention"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className="antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
        {children}
      </body>
    </html>
  );
}
