import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "omb-accounting - 财务管理",
  description: "专为中小企业设计的财务管理应用",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="font-sans">
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
