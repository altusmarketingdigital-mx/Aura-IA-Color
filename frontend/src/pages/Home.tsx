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
          className="absolute inset-0 bg-cover bg-center opacity-30 filter brightness-75 scale-105 animate-pulse duration-[8000ms]"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=1920&q=85')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-[#111111]/75 to-transparent" />
        
        {/* Luces difusas decorativas de fondo */}
        <div className="absolute -top-32 left-1/4 w-96 h-96 bg-[#C6A15B]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 right-1/4 w-96 h-96 bg-[#C6A15B]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center py-20">
          <div className="flex justify-center mb-6">
            <img
              src="/logo.jpg"
              alt="AURA IA COLOR Logo Oficial"
              className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-2 border-[#C6A15B] shadow-[0_0_35px_rgba(198,161,91,0.5)] transform hover:scale-105 transition-transform duration-500"
            />
          </div>

          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-[#C6A15B]/40 bg-[#1A1A1A]/90 backdrop-blur-md mb-6 shadow-[0_0_15px_rgba(198,161,91,0.2)]">
            <Sparkles className="w-4 h-4 text-[#C6A15B]" />
            <span className="text-xs uppercase tracking-[0.2em] text-[#C6A15B] font-medium text-center">
              COLORACIÓN CAPILAR DE ALTA GAMA CON INTELIGENCIA ARTIFICIAL IA
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif text-[#FFFFFF] tracking-tight mb-6 leading-tight">
            TU COLOR. TU DISEÑO. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#DFBF7E] via-[#C6A15B] to-[#9E7B3B] gold-text-glow">
              TU ESTILO.
            </span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-[#F5F1E9]/85 max-w-2xl mx-auto font-light leading-relaxed mb-10">
            Descubre una nueva experiencia de coloración capilar con tecnología de inteligencia artificial y asesoría personalizada, en una ubicación privilegiada entre la Roma Sur y Del Valle Norte.
          </p>

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

      {/* 2. DIFERENCIADOR DE INTELIGENCIA ARTIFICIAL */}
      <section className="py-24 bg-[#141414] border-b border-[#222222]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-xs uppercase tracking-[0.25em] text-[#C6A15B] font-medium block mb-2">
                Innovación Responsable
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif text-[#FFFFFF] mb-6 leading-snug">
                Precisión Cromática con Inteligencia Artificial
              </h2>
              <p className="text-sm text-[#F5F1E9]/75 leading-relaxed mb-6 font-light">
                En <strong>AURA IA COLOR</strong> hemos transformado el método tradicional de tintura integrando algoritmos de cálculo cromático. Nuestras master coloristas analizan tu subtono dérmico, porosidad y pigmento residual para formular la combinación exacta de tintes y oxidantes.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#C6A15B] shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-semibold text-[#FFFFFF]">Cero Improvisación</h3>
                    <p className="text-xs text-[#888888]">Formulaciones exactas basadas en leyes de colorimetría y datos capilares medidos.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#C6A15B] shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-semibold text-[#FFFFFF]">Salud de la Fibra Capilar</h3>
                    <p className="text-xs text-[#888888]">Optimización de volúmenes de peróxido para minimizar el estrés estructural del cabello.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#C6A15B] shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-semibold text-[#FFFFFF]">Historial de Colorimetría</h3>
                    <p className="text-xs text-[#888888]">Registro exacto de mezclas en cada una de tus visitas para resultados consistentes.</p>
                  </div>
                </div>
              </div>
              <div className="mt-8">
                <Link
                  to="/tecnologia-ia"
                  className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#C6A15B] hover:text-[#DFBF7E] font-semibold border-b border-[#C6A15B] pb-1 transition-colors"
                >
                  <span>Descubre cómo funciona la tecnología</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
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
            La Experiencia de Nuestras Clientas
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
