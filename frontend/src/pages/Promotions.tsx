import React, { useEffect, useState } from 'react';
import { Tag, Calendar, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export const Promotions: React.FC = () => {
  const [promotions, setPromotions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPromos = async () => {
      try {
        const res = await api.get('/promotions');
        if (res.data.success) {
          setPromotions(res.data.promotions);
        }
      } catch (e) {
        console.error('Error al cargar promociones:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchPromos();
  }, []);

  return (
    <div className="bg-[#111111] py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Encabezado */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#C6A15B]/30 bg-[#1A1A1A] mb-4">
            <Tag className="w-4 h-4 text-[#C6A15B]" />
            <span className="text-[11px] uppercase tracking-widest text-[#C6A15B]">
              Beneficios Exclusivos
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-serif text-[#FFFFFF] mb-6">
            Promociones y Lealtad
          </h1>
          <p className="text-sm sm:text-base text-[#888888] font-light max-w-xl mx-auto leading-relaxed">
            Recompensamos tu preferencia con beneficios especiales en cada etapa de tu proceso de coloración.
          </p>
        </div>

        {/* Listado de Promociones */}
        {loading ? (
          <div className="text-center py-20 text-[#888888]">Cargando promociones vigentes...</div>
        ) : (
          <div className="space-y-8">
            {promotions.map((promo) => (
              <div
                key={promo.id}
                className="bg-[#171717] border border-[#2D2D2D] hover:border-[#C6A15B]/60 p-8 rounded-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 transition-all"
              >
                <div className="space-y-2 max-w-xl">
                  {promo.discountText && (
                    <span className="inline-block px-3 py-1 bg-[#C6A15B]/15 border border-[#C6A15B]/30 text-[#C6A15B] text-xs uppercase tracking-widest font-bold rounded">
                      {promo.discountText}
                    </span>
                  )}
                  <h3 className="font-serif text-2xl text-[#FFFFFF]">{promo.title}</h3>
                  <p className="text-xs sm:text-sm text-[#F5F1E9]/80 font-light leading-relaxed">
                    {promo.description}
                  </p>
                  {promo.conditions && (
                    <div className="flex items-center gap-2 pt-2 text-[11px] text-[#888888]">
                      <CheckCircle className="w-3.5 h-3.5 text-[#C6A15B]" />
                      <span>{promo.conditions}</span>
                    </div>
                  )}
                </div>

                <div className="shrink-0 w-full md:w-auto">
                  <Link
                    to="/reservar"
                    className="w-full md:w-auto px-6 py-3 bg-[#C6A15B] hover:bg-[#DFBF7E] text-[#111111] font-semibold text-xs uppercase tracking-widest rounded-sm transition-all flex items-center justify-center gap-2"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Aprovechar Promoción</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
