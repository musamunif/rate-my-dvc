import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rate My DVC",
  description: "Rate professors at Diablo Valley College",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#0a0a0f]">{children}</body>
    </html>
  );
}
