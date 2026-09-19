import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Institutional Memory & Decision Traceability Platform',
  description: 'Dual-engine engineering lineage combining SpaCy Knowledge Graph Triples, 384-Dim FAISS Vector RAG, and Google Gemini synthesis.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="antialiased min-h-screen bg-slate-50 text-slate-900 selection:bg-lime-200 selection:text-slate-900">
        {children}
      </body>
    </html>
  );
}
