import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Inn0gram",
  description: "Social platform built with Next.js",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="
        min-h-screen
        bg-gray-50
        text-gray-900
        antialiased
      ">
        <Providers>
          <div className="min-h-screen flex flex-col">
            {children}
          </div>
        </Providers>

        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
