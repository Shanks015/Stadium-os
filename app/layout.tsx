import type { Metadata } from 'next';
import './globals.css';

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
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;700;800&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="text-primary selection:bg-brutal-yellow selection:text-black">
        {children}
      </body>
    </html>
  );
}
