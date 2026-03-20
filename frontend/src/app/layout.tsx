import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Be_Vietnam_Pro } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { NotificacaoProvider } from '@/contexts/NotificacaoContext';
import { ToastProvider } from '@/components/ToastContainer';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jakarta',
  weight: ['400', '500', '600', '700', '800'],
});

const vietnam = Be_Vietnam_Pro({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-vietnam',
  weight: ['400', '500', '600', '700'],
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
    <html lang="pt-BR" className={`${jakarta.variable} ${vietnam.variable}`}>
      <body className="min-h-screen bg-creme antialiased font-body text-texto">
        <AuthProvider>
          <ToastProvider>
            <NotificacaoProvider>{children}</NotificacaoProvider>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
