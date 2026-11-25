import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Instagram, Clock, Sparkles, Facebook } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0B0B0B] text-[#F5F1E9] border-t border-[#222222] pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          
          {/* Columna 1: Marca y Concepto */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img
                src="/logo.png"
                alt="Logo AURA IA COLOR"
                className="w-10 h-10 rounded-full object-contain shrink-0"
              />
              <div className="flex flex-col justify-center">
                <span className="font-serif text-lg tracking-[0.2em] text-[#FFFFFF] font-bold block leading-none">
                  AURA
                </span>
                <span className="text-[10px] tracking-[0.25em] text-[#C6A15B] font-light uppercase mt-1 leading-none">
                  IA COLOR
                </span>
              </div>
            </div>
            <p className="text-xs text-[#888888] leading-relaxed mb-4">
              Servicios profesionales de coloración capilar combinados con tecnología de inteligencia artificial para alcanzar el matiz, brillo y salud perfectos en cada hebra.
            </p>
            <p className="text-[11px] text-[#C6A15B]/80 font-medium">
              Atención profesional personalizada por Master Coloristas especializadas.
            </p>
          </div>

          {/* Columna 2: Enlaces Rápidos */}
          <div>
            <h4 className="font-serif text-sm uppercase tracking-widest text-[#C6A15B] mb-4">
              Navegación
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/servicios" className="text-[#888888] hover:text-[#C6A15B] transition-colors">
                  Catálogo de Servicios
                </Link>
              </li>
              <li>
                <Link to="/tecnologia-ia" className="text-[#888888] hover:text-[#C6A15B] transition-colors">
                  Diferenciador de Inteligencia Artificial
                </Link>
              </li>
              <li>
                <Link to="/galeria" className="text-[#888888] hover:text-[#C6A15B] transition-colors">
                  Galería de Transformaciones
                </Link>
              </li>
              <li>
                <Link 
                  to="/promociones" 
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#C6A15B]/15 text-[#DFBF7E] font-semibold rounded border border-[#C6A15B]/40 hover:bg-[#C6A15B]/25 hover:border-[#DFBF7E] transition-all"
                >
                  <Sparkles className="w-3 h-3 text-[#DFBF7E]" />
                  <span>Promoción: 50% en tu 5ta visita</span>
                </Link>
              </li>
              <li>
                <Link to="/reservar" className="text-[#888888] hover:text-[#C6A15B] transition-colors">
                  Reservaciones en Línea
                </Link>
              </li>
              <li>
                <Link to="/lealtad" className="inline-flex items-center gap-1.5 text-[#888888] hover:text-[#C6A15B] transition-colors">
                  🏅 Mi Tarjeta de Lealtad QR
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 3: Horarios Oficiales */}
          <div>
            <h4 className="font-serif text-sm uppercase tracking-widest text-[#C6A15B] mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Horarios de Atención</span>
            </h4>
            <div className="space-y-2 text-xs text-[#888888]">
              <div className="flex justify-between border-b border-[#222222] pb-1">
                <span>Martes a Sábado:</span>
                <span className="text-[#F5F1E9]">10:00 - 20:00 hrs</span>
              </div>
              <div className="flex justify-between border-b border-[#222222] pb-1">
                <span>Domingos:</span>
                <span className="text-[#DFBF7E] font-medium">10:00 - 16:00 hrs (Bajo confirmación)</span>
              </div>
              <div className="flex justify-between border-b border-[#222222] pb-1">
                <span>Lunes:</span>
                <span className="text-[#777777]">Cerrado</span>
              </div>
              <p className="text-[11px] text-[#888888] pt-2 italic">
                * Atención personalizada previa reservación en línea o por WhatsApp.
              </p>
            </div>
          </div>

          {/* Columna 4: Ubicación y Contacto Directo */}
          <div>
            <h4 className="font-serif text-sm uppercase tracking-widest text-[#C6A15B] mb-4">
              Ubicación & Contacto
            </h4>
            <ul className="space-y-3 text-xs text-[#888888]">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#C6A15B] shrink-0 mt-0.5" />
                <span>
                  Obrero Mundial 122, Local 2, Col. Del Valle Norte, Benito Juárez, Ciudad de México.
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#C6A15B] shrink-0" />
                <a
                  href="https://wa.me/525537293887"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#C6A15B] transition-colors"
                >
                  WhatsApp: 55 3729 3887
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Instagram className="w-4 h-4 text-[#C6A15B] shrink-0" />
                <a
                  href="https://instagram.com/aura.iacolor"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#C6A15B] transition-colors"
                >
                  @aura.iacolor
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Facebook className="w-4 h-4 text-[#C6A15B] shrink-0" />
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#C6A15B] transition-colors"
                >
                  Facebook: AURA IA COLOR
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Separador inferior */}
        <div className="border-t border-[#222222] pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] text-[#666666]">
          <p>© {new Date().getFullYear()} AURA IA COLOR. Todos los derechos reservados.</p>
          <p className="flex items-center gap-1">
            <span>Desarrollado con excelencia por</span>
            <span className="text-[#C6A15B] font-semibold">ALTUS MKT DIGITAL</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
