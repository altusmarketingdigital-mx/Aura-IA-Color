import React from 'react';
import { Cpu, CheckCircle2, ShieldAlert, Sparkles, Database, ArrowRight, Layers, Droplet, Sparkle, HeartPulse } from 'lucide-react';
import { Link } from 'react-router-dom';

export const IATechnology: React.FC = () => {
  return (
    <div className="bg-[#111111] py-16 relative overflow-hidden">
      {/* Splashes de fondo en la página técnica */}
      <div className="absolute top-10 -left-20 w-[450px] h-[450px] ink-splash-magenta rounded-full pointer-events-none opacity-25" />
      <div className="absolute top-1/2 -right-28 w-[500px] h-[500px] ink-splash-cyan rounded-full pointer-events-none opacity-20" />
      <div className="absolute bottom-10 left-1/3 w-[450px] h-[450px] ink-splash-amber rounded-full pointer-events-none opacity-20" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Encabezado con efecto dinámico en títulos */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#C6A15B]/40 bg-[#1A1A1A]/90 backdrop-blur-md mb-4 shadow-[0_0_15px_rgba(198,161,91,0.2)]">
            <Cpu className="w-4 h-4 text-[#C6A15B]" />
            <span className="text-[11px] uppercase tracking-widest text-[#C6A15B] font-semibold">
              Arquitectura Tecnológica • Smart Color Master con IA
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-serif text-[#FFFFFF] mb-4 tracking-tight">
            <span className="relative inline-block">
              <span className="slogan-multicolor-flow font-serif font-extrabold tracking-wide">
                Colorimetría Capilar con Inteligencia Artificial
              </span>
              <span className="absolute -bottom-2 left-1/4 right-1/4 h-[2px] bg-gradient-to-r from-transparent via-[#C6A15B] to-transparent shadow-[0_0_8px_#C6A15B]" />
            </span>
          </h1>
          <p className="text-lg font-serif slogan-multicolor-flow font-bold max-w-xl mx-auto mb-4">
            TU COLOR. TU DISEÑO. TU ESTILO.
          </p>
          <p className="text-sm sm:text-base text-[#888888] font-light max-w-2xl mx-auto leading-relaxed">
            La convergencia entre la maestría de nuestros estilistas en colorimetría y la ingeniería de dispensación inteligente con IA para resultados precisos, saludables y consistentes.
          </p>
        </div>

        {/* Métricas de Alto Impacto */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-16">
          <div className="bg-[#171717] border border-[#262626] p-5 rounded-sm text-center">
            <span className="text-3xl font-serif text-[#C6A15B] font-bold block mb-1">1,200+</span>
            <p className="text-xs text-[#FFFFFF] uppercase tracking-wider font-semibold">Tonos Exactos</p>
            <p className="text-[10px] text-[#888888] mt-1">Generados con precisión microscópica</p>
          </div>
          <div className="bg-[#171717] border border-[#262626] p-5 rounded-sm text-center">
            <span className="text-3xl font-serif text-[#06b6d4] font-bold block mb-1">12</span>
            <p className="text-xs text-[#FFFFFF] uppercase tracking-wider font-semibold">Latas Clave & Cuidado</p>
            <p className="text-[10px] text-[#888888] mt-1">Concentrados puros de alta pureza con claves internacionales que protegen tu cabello</p>
          </div>
          <div className="bg-[#171717] border border-[#262626] p-5 rounded-sm text-center">
            <span className="text-3xl font-serif text-[#DFBF7E] font-bold block mb-1">100%</span>
            <p className="text-xs text-[#FFFFFF] uppercase tracking-wider font-semibold">Todo Género y Edades</p>
            <p className="text-[10px] text-[#888888] mt-1">Formulado para todo tipo de cabello</p>
          </div>
        </div>

        {/* Explicación de la Alianza y Rol del Estilista */}
        <div className="bg-[#171717] border border-[#292929] p-8 md:p-10 rounded-sm mb-16 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-6">
            <div className="lg:col-span-7">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-[#C6A15B]" />
                <span className="text-xs uppercase tracking-widest text-[#C6A15B] font-medium">Tecnología de Punta en Cabina</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif text-[#FFFFFF] mb-4">
                ¿Cómo funciona nuestra tecnología de formulación?
              </h2>
              <p className="text-xs sm:text-sm text-[#F5F1E9]/80 leading-relaxed font-light mb-4">
                En la peluquería convencional, mezclar tonos dependía enteramente de la intuición y el 'ojo' del momento, donde le ponían a la fórmula gramaje sin medición científica. Factores críticos como el fondo de aclaración (tonos cobrizos o amarillos residuales) y la porosidad capilar provocaban que un tinte quedara desigual o cambiara de tono a las dos semanas.
              </p>
              <p className="text-xs sm:text-sm text-[#F5F1E9]/80 leading-relaxed font-light">
                En <strong>AURA IA COLOR</strong> operamos con tecnología y algoritmos de formulación inteligente asistida por computadora. El corazón del servicio sigue siendo el estilista humano especializado en colorimetría, quien evalúa tu fibra capilar, selecciona la altura de tono requerida y envía la instrucción a nuestra máquina dosificadora blanca con IA. El sistema computa los coeficientes cromáticos exactos y dispensa la fórmula pura lista para su aplicación.
              </p>
            </div>
            
            <div className="lg:col-span-5">
              <div className="rounded-sm overflow-hidden border border-[#C6A15B]/40 shadow-2xl relative group bg-[#161616]">
                <img
                  src="/aura-white-machine-branded.jpg"
                  alt="Estación Oficial de Formulación y Dispensación con IA - AURA IA COLOR"
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="p-3 bg-[#141414] border-t border-[#222222] text-center">
                  <span className="text-[11px] text-[#C6A15B] font-mono tracking-wider">
                    Smart Color Master • Dispensación Robótica Inteligente
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-sm bg-[#121212] border border-[#2b2b2b] flex items-center justify-between flex-wrap gap-4">
            <div className="text-xs text-[#888888]">
              <strong className="text-[#FFFFFF]">Precisión Robótica:</strong> Dispensación automatizada de 12 concentrados puros y microdosificación sin error humano.
            </div>
            <span className="text-[11px] text-[#C6A15B] font-medium font-mono">
              Estándar de Calidad AURA IA COLOR
            </span>
          </div>
        </div>

        {/* Paso a Paso del Proceso en Salón (Los 4 Pasos Oficiales) */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <span className="text-xs uppercase tracking-[0.25em] text-[#C6A15B] font-medium block mb-2">
              Flujo de Precisión
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif">
              <span className="slogan-multicolor-flow font-extrabold tracking-wide">
                Los 4 Pasos Hacia el Color Perfecto
              </span>
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="bg-[#151515] border border-[#262626] hover:border-[#C6A15B]/50 p-6 rounded-sm transition-all hover:-translate-y-0.5">
              <div className="flex items-center justify-between mb-3">
                <span className="font-serif text-2xl text-[#C6A15B] font-bold">01</span>
                <span className="text-[10px] uppercase tracking-widest text-[#888888] px-2 py-0.5 border border-[#333333] rounded">Analizamos</span>
              </div>
              <h3 className="font-serif text-lg text-[#FFFFFF] mb-2">El Colorista Elige el Color</h3>
              <p className="text-xs text-[#888888] font-light leading-relaxed">
                Selección visual y diagnóstico minucioso. El estilista evalúa el tono deseado, fondo de aclaración y salud de tu fibra capilar.
              </p>
            </div>

            <div className="bg-[#151515] border border-[#262626] hover:border-[#06b6d4]/50 p-6 rounded-sm transition-all hover:-translate-y-0.5">
              <div className="flex items-center justify-between mb-3">
                <span className="font-serif text-2xl text-[#06b6d4] font-bold">02</span>
                <span className="text-[10px] uppercase tracking-widest text-[#888888] px-2 py-0.5 border border-[#333333] rounded">Calculamos</span>
              </div>
              <h3 className="font-serif text-lg text-[#FFFFFF] mb-2">La IA Calcula la Fórmula Exacta</h3>
              <p className="text-xs text-[#888888] font-light leading-relaxed">
                Nuestros algoritmos calculan la combinación matemática idónea de pigmentos y activadores para llegar al matiz perfecto y cuidando tu cabello en cada miligramo.
              </p>
            </div>

            <div className="bg-[#151515] border border-[#262626] hover:border-[#bc13fe]/50 p-6 rounded-sm transition-all hover:-translate-y-0.5">
              <div className="flex items-center justify-between mb-3">
                <span className="font-serif text-2xl text-[#bc13fe] font-bold">03</span>
                <span className="text-[10px] uppercase tracking-widest text-[#888888] px-2 py-0.5 border border-[#333333] rounded">Preparamos</span>
              </div>
              <h3 className="font-serif text-lg text-[#FFFFFF] mb-2">La Máquina Prepara el Color</h3>
              <p className="text-xs text-[#888888] font-light leading-relaxed">
                La máquina automatizada dispensa y dosifica cada ingrediente y pigmento al gramo sin intervención manual susceptible a fallos.
              </p>
            </div>

            <div className="bg-[#151515] border border-[#262626] hover:border-[#DFBF7E]/50 p-6 rounded-sm transition-all hover:-translate-y-0.5">
              <div className="flex items-center justify-between mb-3">
                <span className="font-serif text-2xl text-[#DFBF7E] font-bold">04</span>
                <span className="text-[10px] uppercase tracking-widest text-[#888888] px-2 py-0.5 border border-[#333333] rounded">Aplicamos</span>
              </div>
              <h3 className="font-serif text-lg text-[#FFFFFF] mb-2">Aplicación Profesional del Tinte</h3>
              <p className="text-xs text-[#888888] font-light leading-relaxed">
                Técnica experta de aplicación en salón con tiempos de exposición monitoreados para una textura sedosa y color de larga duración.
              </p>
            </div>

          </div>
        </div>

        {/* Salud Capilar & Ingredientes Botánicos con diseño premium destacado */}
        <div className="relative bg-gradient-to-b from-[#1C1812] via-[#161616] to-[#121212] border-2 border-[#C6A15B]/50 p-8 sm:p-10 rounded-xl mb-16 shadow-[0_10px_40px_rgba(198,161,91,0.15)] overflow-hidden">
          {/* Acento decorativo luminoso de fondo */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#C6A15B]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[#bc13fe]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 text-center max-w-xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C6A15B]/20 border border-[#C6A15B]/50 text-[#DFBF7E] text-[10px] uppercase tracking-widest font-semibold mb-3">
              <Sparkles className="w-3 h-3 text-[#DFBF7E]" />
              <span>Fórmula Protectora Exclusiva</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-serif">
              <span className="slogan-multicolor-flow font-extrabold tracking-wide">
                Salud Capilar con Alto Contenido Orgánico
              </span>
            </h3>
            <p className="text-xs sm:text-sm text-[#CCCCCC] mt-3 font-light leading-relaxed">
              Color que cuida el cabello y restaura la cutícula en cada sesión, fusionando activos botánicos de alta pureza con tecnología robótica de infusión.
            </p>
          </div>

          <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-5 bg-[#1E1E1E]/90 hover:bg-[#252525] rounded-lg border border-[#C6A15B]/30 hover:border-[#C6A15B] transition-all transform hover:-translate-y-1 shadow-lg group">
              <div className="w-10 h-10 rounded-full bg-[#C6A15B]/15 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Droplet className="w-5 h-5 text-[#C6A15B]" />
              </div>
              <p className="text-xs font-bold text-[#FFFFFF] uppercase tracking-wider">Aceite de Argán</p>
              <p className="text-[11px] text-[#A0A0A0] mt-2 font-light leading-snug">Efecto espejo y brillo sublime de larga duración.</p>
            </div>
            <div className="p-5 bg-[#1E1E1E]/90 hover:bg-[#252525] rounded-lg border border-[#06b6d4]/30 hover:border-[#06b6d4] transition-all transform hover:-translate-y-1 shadow-lg group">
              <div className="w-10 h-10 rounded-full bg-[#06b6d4]/15 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Sparkle className="w-5 h-5 text-[#06b6d4]" />
              </div>
              <p className="text-xs font-bold text-[#FFFFFF] uppercase tracking-wider">Aloe Vera</p>
              <p className="text-[11px] text-[#A0A0A0] mt-2 font-light leading-snug">Nutrición calmante e hidratación celular profunda.</p>
            </div>
            <div className="p-5 bg-[#1E1E1E]/90 hover:bg-[#252525] rounded-lg border border-[#bc13fe]/30 hover:border-[#bc13fe] transition-all transform hover:-translate-y-1 shadow-lg group">
              <div className="w-10 h-10 rounded-full bg-[#bc13fe]/15 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <HeartPulse className="w-5 h-5 text-[#bc13fe]" />
              </div>
              <p className="text-xs font-bold text-[#FFFFFF] uppercase tracking-wider">Pantenol</p>
              <p className="text-[11px] text-[#A0A0A0] mt-2 font-light leading-snug">Restaura la elasticidad biológica y previene quiebres.</p>
            </div>
            <div className="p-5 bg-[#1E1E1E]/90 hover:bg-[#252525] rounded-lg border border-[#DFBF7E]/30 hover:border-[#DFBF7E] transition-all transform hover:-translate-y-1 shadow-lg group">
              <div className="w-10 h-10 rounded-full bg-[#DFBF7E]/15 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Layers className="w-5 h-5 text-[#DFBF7E]" />
              </div>
              <p className="text-xs font-bold text-[#FFFFFF] uppercase tracking-wider">Vitamina E</p>
              <p className="text-[11px] text-[#A0A0A0] mt-2 font-light leading-snug">Escudo térmico y potente antioxidante natural.</p>
            </div>
          </div>
        </div>

        {/* Declaración de Integridad y Ética */}
        <div className="bg-[#1A1A1A] border-l-4 border-[#C6A15B] p-6 rounded-sm mb-16">
          <div className="flex items-start gap-4">
            <ShieldAlert className="w-5 h-5 text-[#C6A15B] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-[#FFFFFF] mb-1">
                La Fusión Perfecta: Talento Humano y Precisión Robótica
              </h4>
              <p className="text-xs text-[#888888] leading-relaxed">
                La asesoría y el diagnóstico son 100% personalizados y realizados por estilistas profesionales para mujeres, hombres, cualquier género y edades, siempre cuidando tu salud. Nuestra máquina dosificadora con tecnología de Inteligencia Artificial es el copiloto de precisión que elimina el error de pesaje y garantiza formulaciones perfectas en todo momento.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            to="/reservar"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#C6A15B] hover:bg-[#DFBF7E] text-[#111111] font-semibold text-xs uppercase tracking-widest rounded-sm transition-all shadow-[0_4px_25px_rgba(198,161,91,0.3)]"
          >
            <span>Agenda tu Cita y Vive la Experiencia</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
};
