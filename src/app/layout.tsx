import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AppBar from "@/components/AppBar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Taponn - PSD to JPEG Converter",
  description: "Convert PSD files to JPEG format easily and efficiently",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
          {/* Main area: AppBar + Content */}
          <AppBar />
          <main className="pt-0 flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
