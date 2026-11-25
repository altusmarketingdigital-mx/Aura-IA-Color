import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Sparkles, ZoomIn, X, MessageSquare } from 'lucide-react';
import api from '../services/api';
import { OFFICIAL_SERVICE_CATEGORIES } from '../data/officialServices';

export const Services: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [loading, setLoading] = useState<boolean>(true);
  const [isPosterZoomed, setIsPosterZoomed] = useState<boolean>(false);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await api.get('/services');
        if (res.data.success && Array.isArray(res.data.categories) && res.data.categories.length > 0) {
          setCategories(res.data.categories);
        } else {
          setCategories(OFFICIAL_SERVICE_CATEGORIES);
        }
      } catch (e) {
        console.error('Error al cargar servicios:', e);
        setCategories(OFFICIAL_SERVICE_CATEGORIES);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  useEffect(() => {
    if (!isPosterZoomed) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsPosterZoomed(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPosterZoomed]);

  const filteredCategories = selectedCategory === 'ALL'
    ? categories
    : categories.filter((c) => c.id === selectedCategory);

  return (
    <div className="bg-[#111111] py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Encabezado con efecto dinámico en títulos */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs uppercase tracking-[0.25em] text-[#C6A15B] font-medium block mb-2">
            Catálogo Oficial de Servicios
          </span>
          <h1 className="text-4xl sm:text-5xl font-serif text-[#FFFFFF] mb-6 tracking-tight">
            <span className="relative inline-block">
              <span className="slogan-multicolor-flow font-serif font-extrabold tracking-wide">
                Nuestros Servicios Profesionales
              </span>
              <span className="absolute -bottom-2 left-1/4 right-1/4 h-[2px] bg-gradient-to-r from-transparent via-[#C6A15B] to-transparent shadow-[0_0_8px_#C6A15B]" />
            </span>
          </h1>
          <p className="text-sm text-[#888888] font-light leading-relaxed">
            Cada servicio incluye valoración técnica capilar, productos de formulación premium y la asesoría de expertas en colorimetría.
          </p>
        </div>

        {/* Lista Oficial Gráfica de Servicios */}
        <div className="max-w-3xl mx-auto mb-20">
          <div className="bg-[#171717] border border-[#C6A15B]/40 rounded-sm p-4 sm:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.85)]">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 mb-4 border-b border-[#262626]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#C6A15B]" />
                <span className="text-xs uppercase tracking-[0.2em] text-[#C6A15B] font-semibold">
                  Lista Oficial de Precios y Largos del Cabello
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsPosterZoomed(true)}
                className="inline-flex items-center gap-1.5 text-[11px] text-[#DFBF7E] hover:text-[#FFFFFF] transition-colors self-start sm:self-auto"
              >
                <ZoomIn className="w-3.5 h-3.5" />
                <span>Ampliar lista</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsPosterZoomed(true)}
              className="block w-full overflow-hidden rounded-sm border border-[#2A2A2A] hover:border-[#C6A15B]/60 transition-colors group cursor-zoom-in"
              aria-label="Ampliar imagen de la lista oficial de servicios AURA"
            >
              <img
                src="/lista-servicios.jpg"
                alt="Lista oficial de servicios AURA Hair Color With AI: Balayage, Babylights, Money Piece y Decoloración Global"
                className="w-full h-auto object-contain mx-auto group-hover:scale-[1.01] transition-transform duration-300"
              />
            </button>

            <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/reservar"
                className="w-full sm:w-auto px-7 py-3 bg-[#C6A15B] hover:bg-[#DFBF7E] text-[#111111] font-semibold text-xs uppercase tracking-widest rounded-sm transition-all flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Agenda tu Cita</span>
              </Link>
              <a
                href="https://wa.me/525537293887?text=Hola%2C%20vi%20su%20lista%20de%20servicios%20en%20la%20p%C3%A1gina%20web%20y%20me%20gustar%C3%ADa%20agendar%20una%20valoraci%C3%B3n."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-7 py-3 border border-[#C6A15B]/70 text-[#C6A15B] hover:bg-[#C6A15B]/15 font-semibold text-xs uppercase tracking-widest rounded-sm transition-all flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Cotizar por WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

        {/* Filtro por Categorías */}
        <div className="flex flex-wrap justify-center gap-2 mb-14">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-4 py-2 text-xs uppercase tracking-wider rounded-sm transition-all ${
              selectedCategory === 'ALL'
                ? 'bg-[#C6A15B] text-[#111111] font-bold'
                : 'bg-[#1A1A1A] text-[#888888] hover:text-[#FFFFFF] border border-[#2D2D2D]'
            }`}
          >
            Todas las Técnicas
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 text-xs uppercase tracking-wider rounded-sm transition-all ${
                selectedCategory === cat.id
                  ? 'bg-[#C6A15B] text-[#111111] font-bold'
                  : 'bg-[#1A1A1A] text-[#888888] hover:text-[#FFFFFF] border border-[#2D2D2D]'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Listado de Servicios Agrupados */}
        {loading ? (
          <div className="text-center py-20 text-[#888888]">Cargando catálogo oficial...</div>
        ) : (
          <div className="space-y-16">
            {filteredCategories.map((cat) => (
              <div key={cat.id}>
                <div className="border-b border-[#262626] pb-4 mb-8">
                  <h2 className="text-2xl font-serif text-[#FFFFFF] flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-[#C6A15B]" />
                    <span>{cat.name}</span>
                  </h2>
                  {cat.description && (
                    <p className="text-xs text-[#888888] mt-1">{cat.description}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {cat.services.map((service: any) => (
                    <div
                      key={service.id}
                      className="bg-[#171717] border border-[#262626] hover:border-[#C6A15B]/50 rounded-sm p-6 flex flex-col justify-between transition-all"
                    >
                      <div>
                        {service.isFeatured && (
                          <span className="inline-block px-2 py-0.5 bg-[#C6A15B]/10 border border-[#C6A15B]/30 text-[#C6A15B] text-[9px] uppercase tracking-widest font-semibold rounded mb-3">
                            Servicio Destacado
                          </span>
                        )}
                        <h3 className="font-serif text-xl text-[#FFFFFF] mb-2">{service.name}</h3>
                        <p className="text-xs text-[#888888] font-light leading-relaxed mb-4">
                          {service.description}
                        </p>
                        {Array.isArray(service.lengths) && service.lengths.length > 0 && (
                          <div className="mb-5 pt-3 border-t border-[#222222]">
                            <span className="text-[10px] uppercase tracking-widest text-[#C6A15B] font-semibold block mb-2">
                              Largo del Cabello
                            </span>
                            <ul className="space-y-1 text-[11px] text-[#C5C5C5] font-light">
                              {service.lengths.map((len: string) => (
                                <li key={len} className="flex items-start gap-1.5">
                                  <span className="text-[#C6A15B] mt-0.5">•</span>
                                  <span>{len}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      <div className="pt-4 border-t border-[#262626] space-y-3">
                        <div className="flex items-center justify-between text-xs text-[#888888]">
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-[#C6A15B]" />
                            <span>Duración: {service.durationMinutes} min</span>
                          </span>
                          <span className="text-base font-serif text-[#FFFFFF] font-bold">
                            {service.pricePrefix ? `${service.pricePrefix} ` : ''}
                            ${service.price.toLocaleString('es-MX')} MXN
                          </span>
                        </div>
                        <Link
                          to={service.isFallback ? '/reservar' : `/reservar?serviceId=${service.id}`}
                          className="w-full py-2.5 bg-[#C6A15B] hover:bg-[#DFBF7E] text-[#111111] font-semibold text-xs uppercase tracking-wider rounded-sm transition-all flex items-center justify-center gap-2"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Solicitar Cita</span>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Modal Lightbox para ampliar la Lista de Servicios */}
      {isPosterZoomed && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsPosterZoomed(false)}
        >
          <button
            type="button"
            onClick={() => setIsPosterZoomed(false)}
            className="fixed top-5 right-5 z-50 w-10 h-10 rounded-full bg-[#1A1A1A] border border-[#C6A15B]/60 text-[#FFFFFF] hover:text-[#C6A15B] flex items-center justify-center transition-colors"
            aria-label="Cerrar vista ampliada"
          >
            <X className="w-5 h-5" />
          </button>
          <div
            className="max-w-3xl max-h-[90vh] overflow-auto rounded-sm border border-[#C6A15B]/40 bg-[#111111]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src="/lista-servicios.jpg"
              alt="Lista oficial de servicios AURA Hair Color With AI"
              className="w-full h-auto object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};
