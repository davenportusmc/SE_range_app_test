import './globals.css';
import type { Metadata, Viewport } from 'next';
import Image from 'next/image';
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
          <header className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <a href="/" aria-label="Home" className="block">
                <Image src="/SEnamelogo.png?v=5" alt="SENA ME" width={400} height={120} className="h-10 md:h-12 w-auto" priority />
              </a>
            </div>
          </header>
          {children}
        </div>
        <ClientBootstrap />
        <MobileActions />
      </body>
    </html>
  );
}
