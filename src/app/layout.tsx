import type { Metadata } from 'next';
import { Cairo } from 'next/font/google';
import './globals.css';

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-cairo',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'بودكاست إيه المشكلة؟ وعالـمغرب | المنصة الرقمية',
  description: 'مساحات لفهم النفس والواقع وإصلاح ما بيننا وبين الله. استمع وشاهد جميع حلقات بودكاست إيه المشكلة وعالـمغرب للدكتور محمد الغليظ، د. أمير منير، وم. ياسر ممدوح.',
  keywords: ['إيه المشكلة', 'عالـمغرب', 'محمد الغليظ', 'أمير منير', 'ياسر ممدوح', 'بودكاست ديني', 'تزكية'],
  authors: [{ name: 'إيه المشكلة؟' }],
  metadataBase: new URL('https://ehelmoshkla.vercel.app'),
  openGraph: {
    title: 'بودكاست إيه المشكلة؟ وعالـمغرب',
    description: 'مساحات لفهم النفس والواقع وإصلاح ما بيننا وبين الله. استمع وشاهد الحلقات بدون مشتتات.',
    url: 'https://ehelmoshkla.vercel.app',
    siteName: 'إيه المشكلة؟',
    images: [
      {
        url: '/hero-banner.jpg',
        width: 1280,
        height: 720,
        alt: 'بودكاست إيه المشكلة وعالـمغرب',
      },
    ],
    locale: 'ar_EG',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'بودكاست إيه المشكلة؟ وعالـمغرب',
    description: 'مساحات لفهم النفس والواقع وإصلاح ما بيننا وبين الله.',
    images: ['/hero-banner.jpg'],
  },
  manifest: '/manifest.json',
  themeColor: '#07080b',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} font-sans`}>
      <head>
        <link rel="icon" href="/logo.png" />
      </head>
      <body className="bg-[#07080b] text-zinc-100 antialiased selection:bg-amber-400 selection:text-zinc-950">
        {children}
      </body>
    </html>
  );
}
