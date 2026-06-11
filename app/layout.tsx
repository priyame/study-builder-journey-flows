import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/AppShell";

export const metadata: Metadata = {
  title: "Study Builder & Journey Flows — Kelly's v2 model",
  description: "Focused sketch of PRD #12 v0.8: Tag model, Draft/UAT/Live versioning, Pooja/Ana operational asks.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
