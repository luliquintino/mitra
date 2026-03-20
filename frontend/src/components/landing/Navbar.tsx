'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-creme/95 backdrop-blur-md shadow-card'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image src="/logo.png" alt="MITRA" width={480} height={112} className="h-10 w-auto" priority />
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/login"
              className="pt-btn-ghost text-sm px-4 py-2"
            >
              Entrar
            </Link>
            <Link
              href="/register"
              className="pt-btn text-sm px-5 py-2"
            >
              Começar grátis
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
          >
            {menuOpen ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-texto">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-texto">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile fullscreen overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-[60] bg-creme flex flex-col items-center justify-center gap-8 animate-fade-in">
          <button
            className="absolute top-5 right-6 p-2"
            onClick={() => setMenuOpen(false)}
            aria-label="Fechar menu"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-texto">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
            className="flex items-center"
          >
            <Image src="/logo.png" alt="MITRA" width={480} height={112} className="h-12 w-auto" />
          </Link>

          <Link
            href="/login"
            onClick={() => setMenuOpen(false)}
            className="pt-btn-ghost text-lg px-6 py-3"
          >
            Entrar
          </Link>
          <Link
            href="/register"
            onClick={() => setMenuOpen(false)}
            className="pt-btn text-lg px-8 py-4"
          >
            Começar grátis
          </Link>
        </div>
      )}
    </>
  );
}
