import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'School Lost & Found',
  description: 'Find your lost items',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
