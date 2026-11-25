import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Sparkles } from 'lucide-react';
import api from '../services/api';
import { OFFICIAL_SERVICE_CATEGORIES } from '../data/officialServices';

export const Services: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [loading, setLoading] = useState<boolean>(true);

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

  const filteredCategories = selectedCategory === 'ALL'
    ? categories
    : categories.filter((c) => c.id === selectedCategory);

  return (
    <div className="bg-[#111111] py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Encabezado con efecto dinámico en títulos */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs uppercase tracking-[0.25em] text-[#C6A15B] font-medium block mb-2">
            Lista Oficial de Servicios
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

        {/* Listado de Servicios en Forma de Lista */}
        {loading ? (
          <div className="text-center py-20 text-[#888888]">Cargando catálogo oficial...</div>
        ) : (
          <div className="space-y-14">
            {filteredCategories.map((cat) => (
              <div key={cat.id}>
                <div className="border-b border-[#262626] pb-4 mb-6">
                  <h2 className="text-2xl font-serif text-[#FFFFFF] flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-[#C6A15B]" />
                    <span>{cat.name}</span>
                  </h2>
                  {cat.description && (
                    <p className="text-xs text-[#888888] mt-1">{cat.description}</p>
                  )}
                </div>

                <div className="divide-y divide-[#262626] bg-[#171717] border border-[#262626] rounded-sm">
                  {cat.services.map((service: any) => (
                    <div
                      key={service.id}
                      className="p-6 sm:p-7 hover:bg-[#1B1B1B] transition-colors flex flex-col md:flex-row md:items-center md:justify-between gap-6"
                    >
                      {/* Información principal y largos */}
                      <div className="flex-1 space-y-2.5">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="font-serif text-xl sm:text-2xl text-[#FFFFFF] tracking-wide">
                            {service.name}
                          </h3>
                          {service.isFeatured && (
                            <span className="px-2 py-0.5 bg-[#C6A15B]/10 border border-[#C6A15B]/30 text-[#C6A15B] text-[9px] uppercase tracking-widest font-semibold rounded">
                              Destacado
                            </span>
                          )}
                        </div>

                        <p className="text-xs sm:text-sm text-[#A3A3A3] font-light leading-relaxed max-w-2xl">
                          {service.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1 text-xs text-[#888888]">
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-[#C6A15B]" />
                            <span>Duración aprox.: {service.durationMinutes} min</span>
                          </span>
                        </div>

                        {Array.isArray(service.lengths) && service.lengths.length > 0 && (
                          <div className="pt-2">
                            <span className="text-[10px] uppercase tracking-widest text-[#C6A15B] font-semibold block mb-1.5">
                              Largo del cabello
                            </span>
                            <ul className="flex flex-wrap gap-2">
                              {service.lengths.map((len: string) => (
                                <li
                                  key={len}
                                  className="px-2.5 py-1 bg-[#111111] border border-[#2D2D2D] rounded-sm text-[11px] text-[#E5E5E5] font-light"
                                >
                                  {len}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {/* Columna derecha: Precio y Acción */}
                      <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-4 pt-4 md:pt-0 border-t md:border-t-0 border-[#262626] shrink-0 md:min-w-[190px]">
                        <div className="md:text-right">
                          <span className="text-[10px] uppercase tracking-[0.2em] text-[#C6A15B] font-semibold block">
                            {service.pricePrefix ? `Precio ${service.pricePrefix}` : 'Precio'}
                          </span>
                          <span className="text-2xl font-serif text-[#FFFFFF] font-bold">
                            ${service.price.toLocaleString('es-MX')} <span className="text-xs font-sans font-normal text-[#888888]">MXN</span>
                          </span>
                        </div>

                        <Link
                          to={service.isFallback ? '/reservar' : `/reservar?serviceId=${service.id}`}
                          className="px-5 py-2.5 bg-[#C6A15B] hover:bg-[#DFBF7E] text-[#111111] font-semibold text-xs uppercase tracking-wider rounded-sm transition-all flex items-center justify-center gap-2 whitespace-nowrap"
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
    </div>
  );
};
