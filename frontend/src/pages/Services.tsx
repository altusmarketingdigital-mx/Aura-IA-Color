import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, DollarSign, Sparkles } from 'lucide-react';
import api from '../services/api';

export const Services: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await api.get('/services');
        if (res.data.success) {
          setCategories(res.data.categories);
        }
      } catch (e) {
        console.error('Error al cargar servicios:', e);
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Encabezado con efecto dinámico en títulos */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-[0.25em] text-[#C6A15B] font-medium block mb-2">
            Catálogo Administrable de Servicios
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
                        <p className="text-xs text-[#888888] font-light leading-relaxed mb-6">
                          {service.description}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-[#262626] space-y-3">
                        <div className="flex items-center justify-between text-xs text-[#888888]">
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-[#C6A15B]" />
                            <span>Duración: {service.durationMinutes} min</span>
                          </span>
                          <span className="text-base font-serif text-[#FFFFFF] font-bold">
                            ${service.price.toLocaleString('es-MX')} MXN
                          </span>
                        </div>
                        <Link
                          to={`/reservar?serviceId=${service.id}`}
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
    </div>
  );
};
