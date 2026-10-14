import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CliftonStrengths Gallup | Оценка талантов линейных сотрудников",
  description: "Адаптированная система тестирования 34 талантов в 4 доменах для линейного персонала.",
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
      <body className="antialiased selection:bg-purple-200">
        <div className="min-h-screen flex flex-col justify-between max-w-lg mx-auto md:max-w-4xl shadow-xl bg-white/70 backdrop-blur-md border-x border-slate-200/60">
          <main className="flex-1 w-full">{children}</main>
        </div>
      </body>
    </html>
  );
}
