import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ContIA Argentina',
  description: 'Comparador inteligente de balances',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-slate-50 text-slate-900">{children}</body>
    </html>
  );
}
