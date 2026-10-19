import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Periskope Prototype',
  description: 'Netskope UX prototype built with the Periskope design system',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
