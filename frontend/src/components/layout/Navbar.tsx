import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Sparkles, Calendar, ShieldCheck } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Inicio', path: '/' },
    { name: 'Nosotros', path: '/nosotros' },
    { name: 'Servicios', path: '/servicios' },
    { name: 'Tecnología IA', path: '/tecnologia-ia' },
    { name: 'Galería', path: '/galeria' },
    { name: 'Promociones', path: '/promociones' },
    { name: 'Contacto', path: '/contacto' },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="sticky top-0 z-50 bg-[#111111]/90 backdrop-blur-md border-b border-[#333333]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo Oficial */}
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src="/logo.jpg"
              alt="Logo AURA IA COLOR"
              className="w-12 h-12 rounded-full object-cover border border-[#C6A15B]/60 shadow-[0_0_12px_rgba(198,161,91,0.25)] group-hover:scale-105 transition-all"
            />
            <div>
              <span className="font-serif text-xl tracking-[0.2em] text-[#FFFFFF] font-bold block">
                AURA <span className="text-[#C6A15B] font-light">IA COLOR</span>
              </span>
              <span className="text-[10px] tracking-[0.25em] text-[#C6A15B] uppercase block">
                Coloración Capilar con IA
              </span>
            </div>
          </Link>

          {/* Menú Escritorio */}
          <nav className="hidden lg:flex items-center gap-7">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-xs uppercase tracking-widest transition-colors font-medium ${
                  isActive(link.path)
                    ? 'text-[#C6A15B] border-b-2 border-[#C6A15B] pb-1'
                    : 'text-[#F5F1E9]/75 hover:text-[#C6A15B]'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Botón CTA y Acceso Admin */}
          <div className="hidden lg:flex items-center gap-4">
            <Link
              to="/admin/login"
              className="text-[#888888] hover:text-[#C6A15B] p-2 transition-colors title='Panel Privado'"
              title="Panel Administrativo"
            >
              <ShieldCheck className="w-5 h-5" />
            </Link>
            <Link
              to="/reservar"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#C6A15B] text-[#111111] hover:bg-[#DFBF7E] font-semibold text-xs uppercase tracking-widest rounded-sm transition-all shadow-md shadow-[#C6A15B]/10 hover:shadow-[#C6A15B]/20"
            >
              <Calendar className="w-4 h-4" />
              <span>Agenda tu Cita</span>
            </Link>
          </div>

          {/* Botón Móvil */}
          <div className="lg:hidden flex items-center gap-3">
            <Link
              to="/reservar"
              className="px-3 py-1.5 bg-[#C6A15B] text-[#111111] font-semibold text-xs uppercase tracking-widest rounded-sm"
            >
              Agendar
            </Link>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-[#F5F1E9] p-2 focus:outline-none"
              aria-label="Abrir menú"
            >
              {isOpen ? <X className="w-6 h-6 text-[#C6A15B]" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Menú Móvil Desplegable */}
      {isOpen && (
        <div className="lg:hidden bg-[#1A1A1A] border-b border-[#333333] px-4 pt-3 pb-6 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={`block py-2 text-sm uppercase tracking-wider ${
                isActive(link.path) ? 'text-[#C6A15B] font-semibold' : 'text-[#F5F1E9]/80'
              }`}
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-3 border-t border-[#333333] flex justify-between items-center">
            <Link
              to="/admin/login"
              onClick={() => setIsOpen(false)}
              className="text-xs text-[#888888] flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Panel Administrativo</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
