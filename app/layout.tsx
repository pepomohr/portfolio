import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import BackgroundScene from '@/components/BackgroundScene';
import SmoothScrollProvider from '@/components/SmoothScrollProvider';
import ThemeProvider from '@/components/ThemeProvider';
import ThemeToggle from '@/components/ThemeToggle';
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
    <html lang="es" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="flex min-h-full flex-col font-sans text-white">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <BackgroundScene />
          <ThemeToggle />
          <SmoothScrollProvider>{children}</SmoothScrollProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
