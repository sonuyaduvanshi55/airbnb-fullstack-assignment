import type { Metadata } from "next";

import { AppProviders } from "@/components/AppProviders";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Staybnb — Find your next stay",
  description: "A full-stack Airbnb-inspired marketplace built with Next.js, FastAPI, and SQLite."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
