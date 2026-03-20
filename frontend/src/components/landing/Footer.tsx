import Link from 'next/link';
import Image from 'next/image';

export function Footer() {
  return (
    <footer className="bg-footer text-white/80 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
          {/* Logo */}
          <div>
            <Image src="/logo.png" alt="MITRA" width={480} height={112} className="h-8 w-auto brightness-0 invert opacity-90" />
          </div>

          {/* Links */}
          <div className="flex items-center gap-4 text-sm">
            <Link href="/login" className="text-white/60 hover:text-white transition-colors">
              Entrar
            </Link>
            <span className="text-white/30">·</span>
            <Link href="/register" className="text-white/60 hover:text-white transition-colors">
              Criar conta
            </Link>
            <span className="text-white/30">·</span>
            <a href="#" className="text-white/60 hover:text-white transition-colors">
              Sobre
            </a>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-6 flex flex-col md:flex-row items-center justify-between gap-2 text-sm">
          <p>Feito com 💛 para pets</p>
          <p className="text-white/50">&copy; 2026 MITRA</p>
        </div>
      </div>
    </footer>
  );
}
