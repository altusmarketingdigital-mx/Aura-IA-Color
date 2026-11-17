import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  Calendar,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  MapPin,
  Phone,
  Instagram,
  Clock,
  ArrowRight,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Bloquear el scroll del body cuando el menú lateral está abierto
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isDrawerOpen]);

  const navLinks = [
    { name: 'Inicio', path: '/', subtitle: 'Experiencia principal y bienvenida' },
    { name: 'Nosotros', path: '/nosotros', subtitle: 'Filosofía, Sara Beltrán & Luz Adriana' },
    { name: 'Servicios', path: '/servicios', subtitle: 'Catálogo de coloración y técnicas' },
    { name: 'Tecnología IA', path: '/tecnologia-ia', subtitle: 'Formulación algorítmica de precisión' },
    { name: 'Galería', path: '/galeria', subtitle: 'Resultados y transformaciones reales' },
    { name: 'Promociones', path: '/promociones', subtitle: '50% de descuento en tu 5ta visita' },
    { name: 'Contacto', path: '/contacto', subtitle: 'Entre Roma Sur y Del Valle Norte, CDMX' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* 1. BARRA SUPERIOR ULTRA MINIMALISTA Y LIMPIA */}
      <header
        className={`sticky top-0 z-40 transition-all duration-500 ${
          isScrolled
            ? 'bg-[#0F0F0F]/95 backdrop-blur-md border-b border-[#252525] py-3.5 shadow-[0_4px_25px_rgba(0,0,0,0.7)]'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* Botón Disparador del Menú Lateral Oculto (Estilo Hamburguesa Exclusiva) */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="group flex items-center gap-3 text-[#FFFFFF] hover:text-[#C6A15B] transition-all p-2 rounded-full focus:outline-none"
            aria-label="Abrir Menú de Navegación"
          >
            <div className="w-10 h-10 rounded-full border border-[#333333] group-hover:border-[#C6A15B] bg-[#141414] flex flex-col items-center justify-center gap-1.5 transition-all shadow-md group-hover:shadow-[0_0_15px_rgba(198,161,91,0.3)]">
              <span className="w-5 h-0.5 bg-[#C6A15B] transition-all group-hover:w-6"></span>
              <span className="w-3.5 h-0.5 bg-[#FFFFFF] transition-all group-hover:w-6"></span>
              <span className="w-5 h-0.5 bg-[#C6A15B] transition-all group-hover:w-6"></span>
            </div>
            <span className="hidden sm:inline-block text-xs uppercase tracking-[0.25em] font-semibold text-[#888888] group-hover:text-[#C6A15B] transition-colors">
              Menú
            </span>
          </button>

          {/* Logo Central Oficial */}
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src="/logo.jpg"
              alt="AURA IA COLOR Logo"
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover border border-[#C6A15B] shadow-[0_0_15px_rgba(198,161,91,0.3)] group-hover:scale-105 transition-transform duration-300"
            />
            <div className="text-left">
              <span className="font-serif text-lg sm:text-xl tracking-[0.2em] text-[#FFFFFF] font-bold block leading-tight">
                AURA <span className="text-[#C6A15B] font-light">IA COLOR</span>
              </span>
              <span className="text-[8px] sm:text-[9px] tracking-[0.2em] text-[#C6A15B] uppercase block">
                Colorimetría con Inteligencia Artificial
              </span>
            </div>
          </Link>

          {/* Botón de Cita Rápida a la Derecha */}
          <div className="flex items-center gap-3">
            <Link
              to="/reservar"
              className="px-5 py-2 sm:px-6 sm:py-2.5 rounded-full bg-[#C6A15B] hover:bg-[#DFBF7E] text-[#111111] font-bold text-[11px] sm:text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(198,161,91,0.25)] hover:shadow-[0_0_30px_rgba(198,161,91,0.45)] transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Agenda tu Cita</span>
            </Link>
          </div>

        </div>
      </header>

      {/* 2. TELÓN DE FONDO OSCURECIDO (BACKDROP OVERLAY) */}
      <div
        className={`fixed inset-0 z-50 bg-black/80 backdrop-blur-sm transition-opacity duration-500 ${
          isDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsDrawerOpen(false)}
      />

      {/* 3. MENÚ LATERAL OCULTO (OFF-CANVAS SLIDE-OVER DRAWER) */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-full max-w-md bg-[#0D0D0D] border-r border-[#262626] shadow-[20px_0_60px_rgba(0,0,0,0.9)] transform transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col justify-between ${
          isDrawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Cabecera del Menú Lateral */}
        <div className="p-6 border-b border-[#202020] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/logo.jpg"
              alt="AURA IA COLOR Logo"
              className="w-10 h-10 rounded-full object-cover border border-[#C6A15B]/70 shadow-[0_0_10px_rgba(198,161,91,0.3)]"
            />
            <div>
              <span className="font-serif text-base tracking-widest text-[#FFFFFF] font-bold block">
                AURA <span className="text-[#C6A15B]">IA COLOR</span>
              </span>
              <span className="text-[9px] uppercase tracking-wider text-[#888888]">
                Navegación Exclusiva
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsDrawerOpen(false)}
            className="w-9 h-9 rounded-full bg-[#161616] border border-[#333333] hover:border-[#C6A15B] text-[#FFFFFF] hover:text-[#C6A15B] flex items-center justify-center transition-all"
            aria-label="Cerrar Menú"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lista de Enlaces de Navegación */}
        <nav className="flex-1 overflow-y-auto px-6 py-6 space-y-2">
          {navLinks.map((link, idx) => {
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsDrawerOpen(false)}
                className={`group flex items-center justify-between p-3.5 rounded-sm border transition-all duration-300 ${
                  active
                    ? 'bg-[#181818] border-[#C6A15B] shadow-[0_0_15px_rgba(198,161,91,0.15)]'
                    : 'bg-transparent border-transparent hover:bg-[#141414] hover:border-[#2D2D2D]'
                }`}
              >
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[10px] text-[#C6A15B]">0{idx + 1}</span>
                    <span
                      className={`font-serif text-base tracking-wider transition-colors ${
                        active
                          ? 'text-[#C6A15B] font-bold'
                          : 'text-[#F5F1E9] group-hover:text-[#C6A15B]'
                      }`}
                    >
                      {link.name}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#666666] font-light mt-0.5 ml-6">
                    {link.subtitle}
                  </p>
                </div>
                <ChevronRight
                  className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${
                    active ? 'text-[#C6A15B]' : 'text-[#444444] group-hover:text-[#C6A15B]'
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        {/* Pie del Menú Lateral: Información de Contacto & Acceso Admin */}
        <div className="p-6 border-t border-[#202020] bg-[#111111] space-y-4">
          <div className="space-y-2 text-xs text-[#888888]">
            <p className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-[#C6A15B] shrink-0" />
              <span>Entre Roma Sur y Del Valle Norte, CDMX</span>
            </p>
            <p className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-[#C6A15B] shrink-0" />
              <span>WhatsApp: 55 3729 3887</span>
            </p>
            <p className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-[#C6A15B] shrink-0" />
              <span>Lun a Sáb: 09:00 - 19:00 hrs</span>
            </p>
          </div>

          <div className="pt-3 border-t border-[#1C1C1C] flex items-center justify-between">
            <Link
              to="/admin/login"
              onClick={() => setIsDrawerOpen(false)}
              className="text-[11px] text-[#666666] hover:text-[#C6A15B] flex items-center gap-1.5 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Panel Administrativo</span>
            </Link>
            <Link
              to="/reservar"
              onClick={() => setIsDrawerOpen(false)}
              className="text-xs text-[#C6A15B] hover:underline font-semibold flex items-center gap-1"
            >
              <span>Reservar Cita</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
};
