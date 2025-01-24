/* eslint-disable @typescript-eslint/no-unused-vars */
import { ReactNode } from "react";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-black text-white antialiased selection:bg-blue-500 selection:text-white">
        <div className="fixed inset-0 -z-10 bg-gradient-to-br from-black via-blue-900/20 to-black opacity-90"></div>
        <main className="relative z-10">{children}</main>
      </body>
    </html>
  );
}
