import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import localFont from 'next/font/local';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { NotificacaoProvider } from '@/contexts/NotificacaoContext';
import { ToastProvider } from '@/components/ToastContainer';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const satoshi = localFont({
  src: [
    { path: '../../public/fonts/Satoshi-Regular.woff2', weight: '400', style: 'normal' },
    { path: '../../public/fonts/Satoshi-Medium.woff2', weight: '500', style: 'normal' },
    { path: '../../public/fonts/Satoshi-Bold.woff2', weight: '700', style: 'normal' },
    { path: '../../public/fonts/Satoshi-Black.woff2', weight: '900', style: 'normal' },
  ],
  variable: '--font-satoshi',
  display: 'swap',
  fallback: ['system-ui', 'sans-serif'],
});

export const metadata: Metadata = {
  title: 'MITRA — Gestão completa do pet',
  description: 'Saúde, guarda, histórico e governança do seu pet num único lugar. Organização e tranquilidade para tutores, prestadores e familiares.',
  keywords: ['pet', 'gestão', 'saúde animal', 'guarda compartilhada', 'veterinário', 'tutor'],
  openGraph: {
    title: 'MITRA — Gestão completa do pet',
    description: 'Saúde, guarda, histórico e governança do seu pet num único lugar.',
    type: 'website',
    locale: 'pt_BR',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${satoshi.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-surface antialiased font-body text-texto">
        <AuthProvider>
          <ToastProvider>
            <NotificacaoProvider>{children}</NotificacaoProvider>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
