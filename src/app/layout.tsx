import type { Metadata } from 'next';
import './globals.css';
import { IBM_Plex_Sans, Source_Sans_3 } from 'next/font/google';
import { cn } from '@/lib/utils';
import { TooltipProvider } from '@/components/ui/tooltip';

const sourceSans3Heading = Source_Sans_3({ subsets: ['latin'], variable: '--font-heading' });

const ibmPlexSans = IBM_Plex_Sans({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Forme — Your work, beautifully presented',
  description:
    'Build a portfolio that feels like you. A thoughtful home for your work, ideas, and next chapter.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={cn('font-sans antialiased', ibmPlexSans.variable, sourceSans3Heading.variable)}
    >
      <body>
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
