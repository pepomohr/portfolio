'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { ComponentProps } from 'react';

// Wrapper propio (patrón recomendado por next-themes) para poder pasarle
// children definidos en un Server Component sin romper el boundary cliente/servidor.
export default function ThemeProvider({ children, ...props }: ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
