import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "35 HEALTH CLUBS | CliftonStrengths® Оценка Команды",
  description: "Адаптированная система коммерческого аудита и оценки 34 талантов для команды 35 Health Clubs.",
  icons: {
    icon: "/logo.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <head>
        {/* Telegram WebApp integration */}
        <script src="https://telegram.org/js/telegram-web-app.js" async />
      </head>
      <body className="antialiased selection:bg-teal-200">
        <div className="min-h-screen flex flex-col justify-between max-w-lg mx-auto md:max-w-4xl shadow-xl bg-white/80 backdrop-blur-md border-x border-slate-200/60">
          <main className="flex-1 w-full">{children}</main>
        </div>
      </body>
    </html>
  );
}
