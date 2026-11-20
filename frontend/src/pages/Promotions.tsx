import React, { useEffect, useState } from 'react';
import { Tag, Calendar, CheckCircle, CreditCard, Award, Sparkles, Clock, ShieldCheck, HeartHandshake } from 'lucide-react';
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
    <div className="bg-[#111111] py-16 relative overflow-hidden">
      {/* Splashes sutiles de fondo */}
      <div className="absolute top-20 -left-24 w-96 h-96 ink-splash-amber rounded-full pointer-events-none opacity-20" />
      <div className="absolute bottom-20 -right-24 w-96 h-96 ink-splash-magenta rounded-full pointer-events-none opacity-20" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Encabezado con efecto dinámico */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#C6A15B]/40 bg-[#1A1A1A]/90 backdrop-blur-md mb-4 shadow-[0_0_15px_rgba(198,161,91,0.2)]">
            <Tag className="w-4 h-4 text-[#C6A15B]" />
            <span className="text-[11px] uppercase tracking-widest text-[#C6A15B] font-semibold">
              Beneficios Exclusivos
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-serif text-[#FFFFFF] mb-6 tracking-tight">
            <span className="relative inline-block">
              <span className="slogan-multicolor-flow font-serif font-extrabold tracking-wide">
                Promociones y Lealtad
              </span>
              <span className="absolute -bottom-2 left-1/4 right-1/4 h-[2px] bg-gradient-to-r from-transparent via-[#C6A15B] to-transparent shadow-[0_0_8px_#C6A15B]" />
            </span>
          </h1>
          <p className="text-sm sm:text-base text-[#888888] font-light max-w-xl mx-auto leading-relaxed">
            Recompensamos tu preferencia con beneficios especiales en cada etapa de tu proceso de coloración.
          </p>
        </div>

        {/* Tarjeta Promocional / Expediente de Lealtad (Visual Placeholder Elegante) */}
        <div className="mb-16 bg-[#161616] border border-[#2D2D2D] hover:border-[#C6A15B]/50 rounded-sm p-8 sm:p-10 shadow-[0_15px_40px_rgba(0,0,0,0.7)] relative overflow-hidden">
          <div className="absolute top-0 right-0 px-4 py-1.5 bg-[#C6A15B] text-[#111111] text-[10px] uppercase font-mono font-bold tracking-widest rounded-bl-sm">
            Programa Exclusivo
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Visualización de la Tarjeta de Lealtad AURA */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-sm aspect-[1.58/1] rounded-xl bg-gradient-to-br from-[#242424] via-[#1A1A1A] to-[#121212] border-2 border-[#C6A15B]/60 p-6 relative shadow-[0_10px_35px_rgba(198,161,91,0.25)] flex flex-col justify-between">
                {/* Chip y Logo de la Tarjeta */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img src="/logo.png" alt="AURA Logo" className="w-9 h-9 rounded-full object-contain filter drop-shadow-[0_0_8px_rgba(198,161,91,0.5)]" />
                    <div>
                      <p className="font-serif text-xs font-bold text-[#FFFFFF] tracking-wider">AURA</p>
                      <p className="text-[8px] text-[#C6A15B] font-mono tracking-widest uppercase">IA COLOR CLUB</p>
                    </div>
                  </div>
                  <CreditCard className="w-6 h-6 text-[#C6A15B]" />
                </div>

                {/* Sello de Visitas Acumuladas */}
                <div className="my-auto py-2">
                  <p className="text-[9px] uppercase tracking-widest text-[#888888] font-mono mb-2">
                    Registro de Visitas & Expediente
                  </p>
                  <div className="flex items-center gap-2 justify-between">
                    {[1, 2, 3, 4].map((step) => (
                      <div key={step} className="w-8 h-8 rounded-full border border-[#C6A15B]/50 bg-[#141414] flex items-center justify-center text-[11px] font-mono font-bold text-[#DFBF7E]">
                        {step}
                      </div>
                    ))}
                    <div className="w-9 h-9 rounded-full bg-[#C6A15B] text-[#111111] flex items-center justify-center text-xs font-bold font-mono shadow-[0_0_10px_rgba(198,161,91,0.8)] animate-pulse">
                      5ª
                    </div>
                  </div>
                </div>

                {/* Pie de la Tarjeta */}
                <div className="flex items-center justify-between text-[9px] text-[#A3A3A3] font-mono pt-2 border-t border-[#333333]">
                  <span>EXPEDIENTE DIGITAL IA</span>
                  <span className="text-[#C6A15B] font-bold">50% EN TU 5ª VISITA</span>
                </div>
              </div>
            </div>

            {/* Explicación del Programa */}
            <div className="lg:col-span-7 space-y-4">
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#C6A15B] block">
                Acumulación de Visitas con Expediente
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl text-[#FFFFFF]">
                Tu Historial de Colorimetría te Premia
              </h2>
              <p className="text-xs sm:text-sm text-[#F5F1E9]/80 leading-relaxed font-light">
                Cada servicio que realizas en AURA IA COLOR queda registrado en tu expediente digital de formulación capilar: tono exacto, miligramos de pigmentos, oxidantes y tiempos de exposición.
              </p>
              <div className="space-y-2 pt-2">
                <div className="flex items-start gap-2 text-xs text-[#888888]">
                  <CheckCircle className="w-4 h-4 text-[#C6A15B] shrink-0 mt-0.5" />
                  <span>Acumula visitas vinculadas directamente a tu número de WhatsApp y expediente.</span>
                </div>
                <div className="flex items-start gap-2 text-xs text-[#888888]">
                  <CheckCircle className="w-4 h-4 text-[#C6A15B] shrink-0 mt-0.5" />
                  <span>Obtén <strong>50% de descuento en la mano de obra o servicio de tu 5ª visita</strong>.</span>
                </div>
                <div className="flex items-start gap-2 text-xs text-[#888888]">
                  <CheckCircle className="w-4 h-4 text-[#C6A15B] shrink-0 mt-0.5" />
                  <span>Beneficios transferibles a familiares o amigos en fechas especiales.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Listado de Promociones */}
        {loading ? (
          <div className="text-center py-20 text-[#888888]">Cargando promociones vigentes...</div>
        ) : (
          <div className="space-y-8">
            {promotions.map((promo) => (
              <div
                key={promo.id}
                className="bg-[#171717] border border-[#2D2D2D] hover:border-[#C6A15B]/60 p-8 rounded-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 transition-all shadow-lg"
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
