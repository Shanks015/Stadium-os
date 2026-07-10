import type { Metadata } from 'next';
import { Hanken_Grotesk } from 'next/font/google';
import './globals.css';
import NavigationFrame from './components/NavigationFrame';

const hankenGrotesk = Hanken_Grotesk({
  subsets: ['latin'],
  weight: ['400', '700', '800'],
  variable: '--font-hanken-grotesk',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'STADIUM OS v1.0 - Operations Dashboard',
  description: 'AI-driven event monitoring and operations control panel',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={hankenGrotesk.variable}>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="text-primary selection:bg-brutal-yellow selection:text-black">
        <a href="#main-content" className="skip-nav">Skip to main content</a>
        <NavigationFrame>{children}</NavigationFrame>
      </body>
    </html>
  );
}
