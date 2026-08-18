import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import RainyWindow from '@/components/RainyWindow';
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
      <body className="flex min-h-full flex-col font-sans text-white">
        <RainyWindow />
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
      </body>
    </html>
  );
}
