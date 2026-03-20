import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Content Forge — ManTech Designs",
  description: "AI-powered content generation platform. Topic → Scripts → Videos → Images → Published Everywhere.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
