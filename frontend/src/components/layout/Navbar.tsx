import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Calendar, ShieldCheck, ChevronRight, Sparkles } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Inicio', path: '/' },
    { name: 'Nosotros', path: '/nosotros' },
    { name: 'Servicios', path: '/servicios' },
    { name: 'Tecnología IA', path: '/tecnologia-ia' },
    { name: 'Galería', path: '/galeria' },
    { name: 'Promociones', path: '/promociones' },
    { name: 'Contacto', path: '/contacto' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 px-4 sm:px-6 lg:px-8 py-3 transition-all duration-300">
      <div
        className={`max-w-7xl mx-auto rounded-full border transition-all duration-500 ${
          isScrolled
            ? 'bg-[#111111]/90 backdrop-blur-xl border-[#C6A15B]/30 shadow-[0_10px_35px_rgba(0,0,0,0.8)] py-2.5 px-6'
            : 'bg-[#141414]/70 backdrop-blur-md border-[#2B2B2B] py-3 px-6 shadow-lg'
        }`}
      >
        <div className="flex items-center justify-between">
          
          {/* Logo Oficial con Efecto de Luz */}
          <Link to="/" className="flex items-center gap-3.5 group">
            <div className="relative">
              <img
                src="/logo.jpg"
                alt="AURA IA COLOR Logo"
                className="w-11 h-11 rounded-full object-cover border border-[#C6A15B] shadow-[0_0_15px_rgba(198,161,91,0.35)] group-hover:scale-105 transition-transform duration-300"
              />
              <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C6A15B] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#C6A15B]"></span>
              </span>
            </div>
            <div>
              <span className="font-serif text-lg tracking-[0.25em] text-[#FFFFFF] font-bold block leading-none">
                AURA <span className="text-[#C6A15B] font-light">IA COLOR</span>
              </span>
              <span className="text-[9px] tracking-[0.3em] text-[#888888] group-hover:text-[#C6A15B] uppercase block mt-1 transition-colors">
                Coloración de Alta Gama
              </span>
            </div>
          </Link>

          {/* Menú de Navegación Estilo Flotante / Cápsula */}
          <nav className="hidden lg:flex items-center gap-1 bg-[#1A1A1A]/80 border border-[#2D2D2D] rounded-full px-3 py-1.5 shadow-inner">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative px-4 py-2 rounded-full text-xs uppercase tracking-widest font-medium transition-all duration-300 ${
                    active
                      ? 'bg-gradient-to-r from-[#DFBF7E] via-[#C6A15B] to-[#9E7B3B] text-[#111111] font-bold shadow-[0_0_15px_rgba(198,161,91,0.4)]'
                      : 'text-[#F5F1E9]/75 hover:text-[#FFFFFF] hover:bg-[#262626]/60'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* CTA Principal y Enlace a Panel */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              to="/admin/login"
              className="text-[#666666] hover:text-[#C6A15B] p-2 transition-colors rounded-full hover:bg-[#202020]"
              title="Panel Administrativo"
            >
              <ShieldCheck className="w-5 h-5" />
            </Link>

            <Link
              to="/reservar"
              className="relative group overflow-hidden px-6 py-2.5 rounded-full bg-gradient-to-r from-[#C6A15B] via-[#DFBF7E] to-[#C6A15B] text-[#111111] font-bold text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(198,161,91,0.3)] hover:shadow-[0_0_30px_rgba(198,161,91,0.6)] transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
            >
              <span className="absolute inset-0 w-full h-full bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
              <Calendar className="w-3.5 h-3.5" />
              <span>Agenda tu Cita</span>
            </Link>
          </div>

          {/* Disparador Móvil */}
          <div className="lg:hidden flex items-center gap-2.5">
            <Link
              to="/reservar"
              className="px-4 py-1.5 rounded-full bg-[#C6A15B] text-[#111111] font-bold text-xs uppercase tracking-wider"
            >
              Agendar
            </Link>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-[#FFFFFF] hover:text-[#C6A15B] focus:outline-none rounded-full bg-[#1F1F1F] border border-[#333333]"
              aria-label="Abrir Menú"
            >
              {isOpen ? <X className="w-5 h-5 text-[#C6A15B]" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Menú Desplegable Móvil Renovado */}
      {isOpen && (
        <div className="lg:hidden max-w-7xl mx-auto mt-2 bg-[#161616]/95 backdrop-blur-2xl border border-[#C6A15B]/40 rounded-2xl p-5 shadow-2xl animate-fadeIn space-y-2">
          {navLinks.map((link) => {
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs uppercase tracking-widest font-semibold transition-all ${
                  active
                    ? 'bg-gradient-to-r from-[#C6A15B] to-[#9E7B3B] text-[#111111] shadow-md'
                    : 'text-[#F5F1E9]/80 hover:text-[#C6A15B] hover:bg-[#202020]'
                }`}
              >
                <span>{link.name}</span>
                <ChevronRight className={`w-4 h-4 ${active ? 'text-[#111111]' : 'text-[#666666]'}`} />
              </Link>
            );
          })}

          <div className="pt-3 border-t border-[#262626] flex items-center justify-between px-2">
            <Link
              to="/admin/login"
              onClick={() => setIsOpen(false)}
              className="text-xs text-[#888888] hover:text-[#C6A15B] flex items-center gap-2 py-1"
            >
              <ShieldCheck className="w-4 h-4 text-[#C6A15B]" />
              <span>Acceso Administrativo</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
