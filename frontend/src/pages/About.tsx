import React from 'react';
import { Sparkles, ShieldCheck, Heart, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

export const About: React.FC = () => {
  return (
    <div className="bg-[#111111] py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Encabezado con efecto dinámico en títulos */}
        <div className="text-center mb-16">
          <span className="text-xs uppercase tracking-[0.25em] text-[#C6A15B] font-medium block mb-2">
            Nuestra Historia & Filosofía
          </span>
          <h1 className="text-4xl sm:text-5xl font-serif text-[#FFFFFF] mb-6 tracking-tight">
            <span className="relative inline-block">
              <span className="slogan-multicolor-flow font-serif font-extrabold tracking-wide">
                El Arte del Color Asistido por la Ciencia
              </span>
              <span className="absolute -bottom-2 left-1/4 right-1/4 h-[2px] bg-gradient-to-r from-transparent via-[#C6A15B] to-transparent shadow-[0_0_8px_#C6A15B]" />
            </span>
          </h1>
          <p className="text-sm sm:text-base text-[#888888] font-light max-w-2xl mx-auto leading-relaxed">
            AURA IA COLOR nace de la pasión por la excelencia cromática y la necesidad de resolver la mayor frustración en los salones: la falta de predictibilidad y precisión en los resultados de coloración capilar.
          </p>
        </div>

        {/* Sección de Concepto con Render Oficial de Estudio */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
          <div className="relative group">
            <div className="aspect-[16/10] sm:aspect-[4/3] rounded-sm overflow-hidden border border-[#C6A15B]/40 shadow-2xl relative">
              <img
                src="/salon-render.jpg"
                alt="Render Arquitectónico Oficial de AURA IA COLOR"
                className="w-full h-full object-cover filter brightness-95 group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#111111]/80 via-transparent to-transparent opacity-60" />
            </div>
            <div className="absolute -bottom-4 -right-4 bg-[#1A1A1A]/95 border border-[#C6A15B]/50 px-4 py-2 rounded-sm shadow-xl backdrop-blur-md">
              <span className="text-[10px] text-[#C6A15B] uppercase tracking-widest font-mono font-semibold">
                Concepto Arquitectónico • Próxima Inauguración
              </span>
            </div>
          </div>
          <div className="space-y-6">
            <span className="text-[11px] uppercase tracking-widest text-[#C6A15B] font-semibold block">
              Instalaciones de Vanguardia
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif text-[#FFFFFF]">
              Una Visión Transformadora del Espacio y el Color
            </h2>
            <p className="text-xs sm:text-sm text-[#F5F1E9]/80 leading-relaxed font-light">
              Nuestro espacio físico ha sido concebido para combinar el lujo contemporáneo, la calidez botánica y la más alta ingeniería en colorimetría capilar. Con estaciones de atención privada, iluminación diseñada para evaluar reflejos cromáticos reales y nuestra estación central de formulación con Inteligencia Artificial.
            </p>
            <p className="text-xs sm:text-sm text-[#F5F1E9]/80 leading-relaxed font-light">
              En AURA IA COLOR eliminamos las suposiciones integrando herramientas de cálculo algorítmico y dispensación robótica directa que determinan los gramos exactos de pigmentos primarios y secundarios necesarios para alcanzar la altura de tono deseada sin comprometer la estructura capilar.
            </p>
            <div className="pt-4 border-t border-[#262626] space-y-3">
              <p className="font-serif text-lg text-[#DFBF7E] italic leading-snug">
                "Nuestra misión es que cada persona experimente el tono exacto que soñó, manteniendo su cabello radiante, sano y con máxima fortaleza, con la confianza en la precisión de la ciencia."
              </p>
              <p className="font-serif text-base text-[#C6A15B] font-semibold tracking-wide">
                "No solo es arte... es ciencia y salud."
              </p>
              <p className="text-xs text-[#888888] font-medium uppercase tracking-wider">
                — Equipo Master Colorista AURA IA COLOR
              </p>
            </div>
          </div>
        </div>

        {/* Pilares Fundamentales */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-20">
          <div className="bg-[#171717] border border-[#292929] p-6 rounded-sm text-center">
            <div className="w-12 h-12 rounded-full border border-[#C6A15B]/50 bg-[#1A1A1A] flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-5 h-5 text-[#C6A15B]" />
            </div>
            <h3 className="font-serif text-lg text-[#FFFFFF] mb-2">Innovación Real</h3>
            <p className="text-xs text-[#888888] font-light leading-relaxed">
              Tecnología aplicada para perfeccionar mezclas y evitar tonos no deseados (naranjas o cenizos opacos).
            </p>
          </div>

          <div className="bg-[#171717] border border-[#292929] p-6 rounded-sm text-center">
            <div className="w-12 h-12 rounded-full border border-[#C6A15B]/50 bg-[#1A1A1A] flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-5 h-5 text-[#C6A15B]" />
            </div>
            <h3 className="font-serif text-lg text-[#FFFFFF] mb-2">Cuidado de la Fibra</h3>
            <p className="text-xs text-[#888888] font-light leading-relaxed">
              Trabajamos únicamente con fórmulas de grado profesional y protectores de enlaces capilares de alta gama.
            </p>
          </div>

          <div className="bg-[#171717] border border-[#292929] p-6 rounded-sm text-center">
            <div className="w-12 h-12 rounded-full border border-[#C6A15B]/50 bg-[#1A1A1A] flex items-center justify-center mx-auto mb-4">
              <Heart className="w-5 h-5 text-[#C6A15B]" />
            </div>
            <h3 className="font-serif text-lg text-[#FFFFFF] mb-2">Atención Exclusiva</h3>
            <p className="text-xs text-[#888888] font-light leading-relaxed">
              Sesiones personalizadas en un espacio privado y tranquilo en la Colonia Del Valle Norte, CDMX.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-[#171717] border border-[#262626] p-10 rounded-sm">
          <h3 className="font-serif text-2xl text-[#FFFFFF] mb-3">
            Experimenta la Excelencia en Coloración
          </h3>
          <p className="text-xs text-[#888888] max-w-md mx-auto mb-6">
            Agenda tu cita hoy mismo y permite que formulemos el tono perfecto para tu esencia.
          </p>
          <Link
            to="/reservar"
            className="inline-block px-8 py-3.5 bg-[#C6A15B] hover:bg-[#DFBF7E] text-[#111111] font-semibold text-xs uppercase tracking-widest rounded-sm transition-all shadow-md"
          >
            Reservar Asesoría & Cita
          </Link>
        </div>

      </div>
    </div>
  );
};
