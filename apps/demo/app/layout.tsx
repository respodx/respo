import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { ResponsiveDX } from 'responsive-dx';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'respo.dx — a testing suite for responsive apps',
  description: 'In-browser responsive testing suite for modern web development',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} dark`} suppressHydrationWarning>
      <body className="bg-black text-white antialiased min-h-screen selection:bg-white selection:text-black font-sans" suppressHydrationWarning>
        {children}
        <ResponsiveDX />
      </body>
    </html>
  );
}
