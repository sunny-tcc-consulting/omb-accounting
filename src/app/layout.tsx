import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "./providers";
import { SessionTimeoutWarning } from "@/components/auth";

export const metadata: Metadata = {
  title: "omb-accounting - Financial Management",
  description: "Financial management application designed for small and medium enterprises",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans">
        <Providers>
          {children}
          <SessionTimeoutWarning />
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
