import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { ClientProviders } from "@/components/providers/client-providers";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "Connect Chuba - Общение без границ",
  description: "Платформа для общения, голосовых и видеозвонков. Создавайте серверы, общайтесь в каналах, играйте вместе!",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="ru" suppressHydrationWarning>
        <body className={`${inter.variable} font-sans antialiased`}>
          <ClientProviders>
            {children}
          </ClientProviders>
        </body>
      </html>
    </ClerkProvider>
  );
}
