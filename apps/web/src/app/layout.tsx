import type { Metadata } from "next";

import "./globals.css";
import { Providers } from "@/lib/providers";

export const metadata: Metadata = {
  title: "Chinta",
  description: "A clean multi-provider AI workspace.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
