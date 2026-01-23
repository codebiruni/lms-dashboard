import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ThemeProvider from "./default/ThemeProvider";
import { Toaster } from "sonner";
import AuthContext from "./default/utils/auth-context";
import TanStackProvider from "./default/wrapper/TanStackProvider";
import Logout from "./default/utils/Logout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Learning Management System",
  description: "A modern Learning Management System designed to help students, teachers, and institutions manage courses.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthContext><Toaster />
          <TanStackProvider>
            <Logout />
            {children}
            </TanStackProvider>
          </AuthContext>
          </ThemeProvider>
      </body>
    </html>
  );
}
