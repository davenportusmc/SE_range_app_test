import './globals.css';
import type { Metadata, Viewport } from 'next';
import Image from 'next/image';
import MobileActions from '@/components/MobileActions';
import ClientBootstrap from '@/components/ClientBootstrap';
import senaLogo from '../../public/senamelogo.png';
import seplanLogo from '../../public/seplanlogo.png';

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
                <Image src={senaLogo} alt="SENA ME" className="h-10 md:h-12 w-auto" priority />
              </a>
            </div>
            <div>
              <Image src={seplanLogo} alt="Strategic Edge Plan" className="h-8 md:h-10 w-auto" priority />
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
