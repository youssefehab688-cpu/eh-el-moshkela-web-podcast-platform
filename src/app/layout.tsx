import type { Metadata, Viewport } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import RegisterSW from "@/components/RegisterSW";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "600", "700", "800", "900"],
  variable: "--font-cairo",
});

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "إيه المشكلة؟ | المنصة الرسمية للحلقات والبودكاست",
  description: "استمع وشاهد حلقات بودكاست إيه المشكلة بدقة عالية، مع إمكانية التبديل اللحظي بين الصوت والفيديو والملاحظات المخصصة.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "إيه المشكلة؟",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className="dark">
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon.svg" />
      </head>
      <body className={`${cairo.variable} font-sans bg-zinc-950 text-zinc-100 min-h-screen antialiased selection:bg-slate-200 selection:text-black`}>
        <RegisterSW />
        {children}
      </body>
    </html>
  );
}
