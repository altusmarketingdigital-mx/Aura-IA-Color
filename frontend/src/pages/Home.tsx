import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Calendar, ArrowRight, ShieldCheck, CheckCircle2, ChevronRight, Star } from 'lucide-react';
import api from '../services/api';

export const Home: React.FC = () => {
  const [services, setServices] = useState<any[]>([]);
  const [promotions, setPromotions] = useState<any[]>([]);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [servicesRes, promoRes] = await Promise.all([
          api.get('/services'),
          api.get('/promotions'),
        ]);
        if (servicesRes.data.success) {
          // Extraer servicios destacados
          const allServices: any[] = [];
          servicesRes.data.categories.forEach((cat: any) => {
            cat.services.forEach((s: any) => {
              if (s.isFeatured) allServices.push({ ...s, categoryName: cat.name });
            });
          });
          setServices(allServices.slice(0, 4));
        }
        if (promoRes.data.success) {
          setPromotions(promoRes.data.promotions);
        }
      } catch (e) {
        console.error('Error cargando datos de inicio:', e);
      }
    };
    loadHomeData();
  }, []);

  return (
    <div className="bg-[#111111]">
      
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden border-b border-[#222222]">
        {/* Imagen de fondo con zoom sutil */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25 filter brightness-75 scale-105 animate-pulse duration-[8000ms]"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=1920&q=85')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-[#111111]/80 to-transparent" />
        
        {/* Splashes de Tintas Orgánicas sobre fondo negro y dorado */}
        <div className="absolute top-10 -left-20 w-[420px] h-[420px] ink-splash-magenta rounded-full pointer-events-none" />
        <div className="absolute top-1/3 -right-28 w-[480px] h-[480px] ink-splash-cyan rounded-full pointer-events-none" />
        <div className="absolute -bottom-24 left-1/3 w-[500px] h-[500px] ink-splash-amber rounded-full pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[360px] h-[360px] ink-splash-rose rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center py-20">
          <div className="flex justify-center mb-6">
            <div className="relative p-1 rounded-full flex items-center justify-center">
              <img
                src="/logo.png"
                alt="AURA IA COLOR Logo Oficial"
                className="w-36 h-36 sm:w-44 sm:h-44 rounded-full object-contain filter drop-shadow-[0_0_35px_rgba(198,161,91,0.55)] transform hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-[#C6A15B]/40 bg-[#1A1A1A]/90 backdrop-blur-md mb-6 shadow-[0_0_15px_rgba(198,161,91,0.2)]">
            <Sparkles className="w-4 h-4 text-[#C6A15B]" />
            <span className="text-xs uppercase tracking-[0.2em] text-[#C6A15B] font-medium text-center">
              COLORACIÓN CAPILAR DE ALTA GAMA CON INTELIGENCIA ARTIFICIAL IA
            </span>
          </div>

          {/* Slogan con texto en movimiento dinámico de colores sobre base dorada */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif text-[#FFFFFF] tracking-tight mb-6 leading-tight">
            TU COLOR. TU DISEÑO. <br />
            <span className="slogan-multicolor-flow font-serif font-extrabold tracking-wide">
              TU ESTILO.
            </span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-[#F5F1E9]/85 max-w-2xl mx-auto font-light leading-relaxed mb-6">
            Servicio profesional de coloración capilar para mujeres, hombres y todo género. Asesoría directa por estilistas especializados en colorimetría, respaldados por la precisión de nuestra máquina dispensadora con Inteligencia Artificial.
          </p>

          {/* Badge sutil de tecnología aliada */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#161616]/80 border border-[#333333] mb-10 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-[#06b6d4] animate-ping" />
            <span className="text-[11px] text-[#A3A3A3] font-light">
              Impulsado por tecnología certificada de dispensación cromática con IA • <strong className="text-[#DFBF7E] font-medium">Digital Color AI Architecture</strong>
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
            <Link
              to="/reservar"
              className="w-full sm:w-auto px-9 py-4 bg-[#C6A15B] hover:bg-[#DFBF7E] text-[#111111] font-semibold text-xs uppercase tracking-[0.2em] rounded-sm transition-all transform hover:-translate-y-1 shadow-[0_4px_25px_rgba(198,161,91,0.3)] hover:shadow-[0_4px_35px_rgba(198,161,91,0.5)] flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Agenda tu Cita</span>
            </Link>
            <Link
              to="/servicios"
              className="w-full sm:w-auto px-9 py-4 border border-[#C6A15B]/80 text-[#C6A15B] hover:bg-[#C6A15B]/15 hover:border-[#DFBF7E] font-semibold text-xs uppercase tracking-[0.2em] rounded-sm transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2"
            >
              <span>Conoce Nuestros Servicios</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 2. DIFERENCIADOR DE INTELIGENCIA ARTIFICIAL & ALIANZA TECNOLÓGICA */}
      <section className="py-24 bg-[#141414] border-b border-[#222222] relative overflow-hidden">
        {/* Splash de fondo sutil en sección técnica */}
        <div className="absolute top-1/2 -right-36 w-96 h-96 ink-splash-magenta rounded-full pointer-events-none opacity-20" />
        <div className="absolute bottom-0 -left-20 w-80 h-80 ink-splash-cyan rounded-full pointer-events-none opacity-20" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-xs uppercase tracking-[0.25em] text-[#C6A15B] font-medium block mb-2">
                Innovación Responsable • Tecnología Digital Color AI
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif text-[#FFFFFF] mb-6 leading-snug">
                Estilistas Especialistas con Apoyo de Dispensación Inteligente con IA
              </h2>
              <p className="text-sm text-[#F5F1E9]/75 leading-relaxed mb-6 font-light">
                En <strong>AURA IA COLOR</strong> la asesoría la realiza un estilista profesional especializado en colorimetría capilar. Evaluamos tu tono base, tipo de cabello y expectativas de forma 100% personalizada para todo género, y nos apoyamos en la arquitectura tecnológica de <strong>Digital Color AI</strong>: una máquina inteligente que formula y dispensa el tinte listo para aplicar con más de <strong>1,200 tonos posibles</strong> y cero margen de error.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div className="bg-[#191919] p-4 rounded-sm border border-[#262626]">
                  <span className="text-2xl font-serif text-[#C6A15B] font-bold block mb-1">1,200+</span>
                  <p className="text-xs text-[#FFFFFF] font-medium">Tonos de Alta Precisión</p>
                  <p className="text-[11px] text-[#888888] mt-1 font-light">Formulados matemáticamente con 12 latas de pigmentos orgánicos concentrados.</p>
                </div>
                <div className="bg-[#191919] p-4 rounded-sm border border-[#262626]">
                  <span className="text-2xl font-serif text-[#C6A15B] font-bold block mb-1">0%</span>
                  <p className="text-xs text-[#FFFFFF] font-medium">Improvisación & Desperdicio</p>
                  <p className="text-[11px] text-[#888888] mt-1 font-light">Dosificación exacta al miligramo. Menor residuo químico y máxima ecología capilar.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#C6A15B] shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-semibold text-[#FFFFFF]">Cuidado Botánico Activo</h3>
                    <p className="text-xs text-[#888888]">Pigmentos enriquecidos con Aceite de Argán, Aloe Vera, Pantenol y Vitamina E para efecto espejo y fibra capilar sana.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#C6A15B] shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-semibold text-[#FFFFFF]">Historial de Colorimetría Inmutable</h3>
                    <p className="text-xs text-[#888888]">Tu fórmula exacta queda registrada digitalmente en cada cita para que tu tono siempre conserve la misma perfección.</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex items-center gap-6">
                <Link
                  to="/tecnologia-ia"
                  className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#C6A15B] hover:text-[#DFBF7E] font-semibold border-b border-[#C6A15B] pb-1 transition-colors"
                >
                  <span>Conoce los 4 pasos del proceso</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
                <span className="text-[10px] text-[#666666] uppercase tracking-wider">
                  Partner Tech Certificado
                </span>
              </div>
            </div>

            {/* Fotografía de lujo */}
            <div className="relative">
              <div className="aspect-[4/5] rounded-sm overflow-hidden border border-[#333333] shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1000&q=80"
                  alt="Coloración Capilar de Precisión"
                  className="w-full h-full object-cover filter brightness-90 hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-[#1A1A1A] border border-[#C6A15B]/50 p-6 rounded-sm shadow-xl max-w-xs hidden sm:block">
                <p className="font-serif text-2xl text-[#C6A15B] font-bold">100%</p>
                <p className="text-xs text-[#F5F1E9]/80 mt-1 uppercase tracking-wider">
                  Personalización matemática del matiz
                </p>
                <p className="text-[10px] text-[#A3A3A3] mt-2 font-light">
                  Tecnología de formulación asistida por Digital Color AI
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SERVICIOS DESTACADOS */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-[0.25em] text-[#C6A15B] font-medium block mb-2">
            Experiencias Exclusivas
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif text-[#FFFFFF] mb-4">
            Servicios Insignia
          </h2>
          <p className="text-xs sm:text-sm text-[#888888] font-light">
            Tratamientos y técnicas especializadas formuladas para realzar tu belleza natural.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-[#171717] border border-[#292929] hover:border-[#C6A15B] rounded-sm p-6 flex flex-col justify-between transition-all duration-300 transform hover:-translate-y-2 hover:shadow-[0_10px_30px_rgba(198,161,91,0.15)] group"
            >
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#C6A15B] block mb-2 font-mono">
                  {service.categoryName}
                </span>
                <h3 className="font-serif text-lg text-[#FFFFFF] group-hover:text-[#C6A15B] transition-colors mb-2">
                  {service.name}
                </h3>
                <p className="text-xs text-[#888888] line-clamp-3 mb-6 font-light leading-relaxed">
                  {service.description}
                </p>
              </div>
              <div className="pt-4 border-t border-[#262626] flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#888888] block">Inversión</span>
                  <span className="font-serif text-lg text-[#FFFFFF] font-bold">
                    ${service.price.toLocaleString('es-MX')} MXN
                  </span>
                </div>
                <Link
                  to={`/reservar?serviceId=${service.id}`}
                  className="p-3 bg-[#222222] group-hover:bg-[#C6A15B] text-[#C6A15B] group-hover:text-[#111111] rounded-sm transition-all transform group-hover:rotate-6"
                  title="Reservar este servicio"
                >
                  <Calendar className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            to="/servicios"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#C6A15B] hover:text-[#DFBF7E] font-semibold border-b border-[#C6A15B] pb-1 transition-colors"
          >
            <span>Ver todas las categorías y técnicas</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* 4. BANNER DE PROMOCIÓN OFICIAL */}
      {promotions.length > 0 && (
        <section className="py-16 bg-[#161616] border-y border-[#262626]">
          <div className="max-w-5xl mx-auto px-4 text-center">
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#C6A15B] font-semibold block mb-2">
              Programa de Lealtad AURA
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif text-[#FFFFFF] mb-3">
              {promotions[0].title}: <span className="text-[#C6A15B]">{promotions[0].discountText}</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#888888] max-w-xl mx-auto mb-6">
              {promotions[0].description}
            </p>
            <Link
              to="/promociones"
              className="inline-block px-6 py-2.5 border border-[#C6A15B] text-[#C6A15B] hover:bg-[#C6A15B] hover:text-[#111111] text-xs uppercase tracking-widest font-semibold rounded-sm transition-all"
            >
              Consultar Condiciones
            </Link>
          </div>
        </section>
      )}

      {/* 5. TESTIMONIOS AUTORIZADOS */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-[0.25em] text-[#C6A15B] font-medium block mb-2">
            Confianza y Excelencia
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif text-[#FFFFFF] mb-4">
            La Experiencia de Quienes Nos Visitan
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-[#171717] border border-[#262626] p-8 rounded-sm">
            <div className="flex gap-1 text-[#C6A15B] mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <p className="text-xs text-[#F5F1E9]/80 leading-relaxed italic mb-6 font-light">
              "Llevaba años buscando un rubio beige que no se oxidara a naranja a las dos semanas. La formulación con IA dio en el clavo con mi tono de piel. La atención del equipo de coloristas es impecable."
            </p>
            <p className="text-xs font-semibold text-[#FFFFFF] uppercase tracking-wider">Mariana R.</p>
            <p className="text-[10px] text-[#888888]">Balayage & Colorimetría IA</p>
          </div>

          <div className="bg-[#171717] border border-[#262626] p-8 rounded-sm">
            <div className="flex gap-1 text-[#C6A15B] mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <p className="text-xs text-[#F5F1E9]/80 leading-relaxed italic mb-6 font-light">
              "El ambiente es muy exclusivo y privado en Del Valle Norte. Me explicaron paso a paso por qué mezclaban cada tono y mi cabello quedó súper suave y brillante."
            </p>
            <p className="text-xs font-semibold text-[#FFFFFF] uppercase tracking-wider">Sofía M.</p>
            <p className="text-[10px] text-[#888888]">Babylights y Gloss</p>
          </div>

          <div className="bg-[#171717] border border-[#262626] p-8 rounded-sm">
            <div className="flex gap-1 text-[#C6A15B] mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <p className="text-xs text-[#F5F1E9]/80 leading-relaxed italic mb-6 font-light">
              "La facilidad para agendar en línea y continuar directo en WhatsApp te da muchísima tranquilidad. Un servicio verdaderamente profesional y de primer nivel."
            </p>
            <p className="text-xs font-semibold text-[#FFFFFF] uppercase tracking-wider">Valentina G.</p>
            <p className="text-[10px] text-[#888888]">Tinte Global & Asesoría</p>
          </div>
        </div>
      </section>

      {/* 6. MAPA Y UBICACIÓN */}
      <section className="py-16 bg-[#141414] border-t border-[#222222]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs uppercase tracking-[0.25em] text-[#C6A15B] font-medium block mb-2">
                Visítanos
              </span>
              <h2 className="text-3xl font-serif text-[#FFFFFF] mb-4">
                Ubicación Privilegiada
              </h2>
              <p className="text-xs sm:text-sm text-[#888888] leading-relaxed mb-6 font-light">
                Nuestro estudio se encuentra en Obrero Mundial 122, Local 2, entre la Roma Sur y Del Valle Norte, Benito Juárez, Ciudad de México. Diseñado con privacidad, confort y la más alta tecnología para tu atención.
              </p>
              <div className="p-4 bg-[#1B1B1B] rounded border border-[#2D2D2D] mb-6">
                <p className="text-xs text-[#C6A15B] font-semibold mb-1">Horario Comercial:</p>
                <p className="text-xs text-[#FFFFFF]">Lunes a Sábado: 10:00 a 20:00 hrs.</p>
                <p className="text-xs text-[#C6A15B]">Domingos: Previa Cita Especial.</p>
              </div>
              <Link
                to="/reservar"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#C6A15B] hover:bg-[#DFBF7E] text-[#111111] font-semibold text-xs uppercase tracking-widest rounded-sm transition-all"
              >
                <Calendar className="w-4 h-4" />
                <span>Solicita tu Reservación</span>
              </Link>
            </div>
            <div className="h-80 w-full rounded-sm overflow-hidden border border-[#333333] shadow-lg">
              <iframe
                title="Google Maps AURA IA COLOR"
                src="https://maps.google.com/maps?q=Obrero+Mundial+122,+Del+Valle+Norte,+Benito+Juarez,+CDMX&t=&z=15&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0, filter: 'grayscale(0.6) contrast(1.1)' }}
                allowFullScreen={false}
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
