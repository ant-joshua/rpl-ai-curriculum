import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'RPL AI Tutor',
  description: 'Tutor AI untuk kurikulum SMK RPL AI',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
