import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MEMSYS - Institutional Memory & Decision Traceability',
  description: 'AI-powered knowledge graph and vector RAG for organizational memory.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
