import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import SmoothScrollProvider from '@/components/SmoothScrollProvider';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Tu Nombre — Portfolio',
  description: 'Desarrollador Full-Stack — Next.js, React, Supabase.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="es" className={`${inter.variable} h-full antialiased`}>
      <body className="bg-noise flex min-h-full flex-col bg-[#0a0a0c] font-sans text-white">
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
      </body>
    </html>
  );
}
