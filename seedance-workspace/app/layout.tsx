import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Seedance workspace',
  description: 'A frontend workspace for Seedance 2.0 video generation via Kie.ai'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans text-paper antialiased">
        {children}
      </body>
    </html>
  );
}
