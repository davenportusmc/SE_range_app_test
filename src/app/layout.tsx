import './globals.css';
import type { Metadata, Viewport } from 'next';
import MobileActions from '@/components/MobileActions';
import ClientBootstrap from '@/components/ClientBootstrap';

export const metadata: Metadata = {
  title: 'Range-Tuned Ballistics Assistant',
  description: 'Zero to DOPE in seconds',
  manifest: '/manifest.webmanifest',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: '#0a0a0a',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="container pt-4 pb-28">
          <header className="mb-4">
            <h1 className="text-xl md:text-2xl font-semibold">Strategic Edge Gun Range</h1>
            <p className="text-xs md:text-sm text-neutral-400">Chapel Hill, TN</p>
          </header>
          {children}
        </div>
        <ClientBootstrap />
        <MobileActions />
      </body>
    </html>
  );
}
