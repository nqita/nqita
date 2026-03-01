import type { Metadata, Viewport } from 'next';
import { Space_Grotesk, DM_Sans } from 'next/font/google';
import { AuthProvider } from '@wokspec/auth/client';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  variable: '--font-heading',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const dmSans = DM_Sans({
  variable: '--font-body',
  subsets: ['latin'],
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0d0d0d',
};

export const metadata: Metadata = {
  title: 'Eral — WokSpec AI',
  description: 'Your AI. Built into WokSpec. Chat, generate, and analyze with Eral.',
  metadataBase: new URL('https://eral.wokspec.org'),
  openGraph: {
    type: 'website',
    siteName: 'Eral',
    url: 'https://eral.wokspec.org',
    title: 'Eral — WokSpec AI',
    description: 'Your AI. Built into WokSpec.',
    images: [{ url: '/og.png' }],
  },
  twitter: { card: 'summary_large_image', site: '@wokspec' },
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" style={{ background: '#0d0d0d' }}>
      <body className={`${spaceGrotesk.variable} ${dmSans.variable}`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
