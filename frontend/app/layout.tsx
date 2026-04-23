import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BETARENA — Алекс",
  description: "Avatar AI Demo",
};

const FONT_LINK =
  "https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link rel="stylesheet" href={FONT_LINK} />
      </head>
      <body>{children}</body>
    </html>
  );
}
