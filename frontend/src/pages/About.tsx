import React from 'react';
import { Sparkles, ShieldCheck, Heart, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

export const About: React.FC = () => {
  return (
    <div className="bg-[#111111] py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Encabezado */}
        <div className="text-center mb-16">
          <span className="text-xs uppercase tracking-[0.25em] text-[#C6A15B] font-medium block mb-2">
            Nuestra Historia & Filosofía
          </span>
          <h1 className="text-4xl sm:text-5xl font-serif text-[#FFFFFF] mb-6">
            El Arte del Color Asistido por la Ciencia
          </h1>
          <p className="text-sm sm:text-base text-[#888888] font-light max-w-2xl mx-auto leading-relaxed">
            AURA IA COLOR nace de la pasión por la excelencia cromática y la necesidad de resolver la mayor frustración en los salones: la falta de predictibilidad y precisión en los resultados de coloración capilar.
          </p>
        </div>

        {/* Sección de Concepto */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
          <div className="aspect-[4/5] rounded-sm overflow-hidden border border-[#333333]">
            <img
              src="https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=1000&q=80"
              alt="Estudio AURA IA COLOR"
              className="w-full h-full object-cover filter brightness-95"
            />
          </div>
          <div className="space-y-6">
            <h2 className="text-2xl sm:text-3xl font-serif text-[#FFFFFF]">
              Una Visión Transformadora
            </h2>
            <p className="text-xs sm:text-sm text-[#F5F1E9]/80 leading-relaxed font-light">
              La coloración capilar no es un proceso estandarizado. Cada cabello posee una historia química previa, porosidad, grosor y un subtono natural único.
            </p>
            <p className="text-xs sm:text-sm text-[#F5F1E9]/80 leading-relaxed font-light">
              En AURA IA COLOR eliminamos las suposiciones integrando herramientas de cálculo algorítmico que determinan los gramos exactos de pigmentos primarios y secundarios necesarios para alcanzar la altura de tono deseada sin comprometer la estructura capilar.
            </p>
            <div className="pt-4 border-t border-[#262626]">
              <p className="font-serif text-lg text-[#C6A15B] italic">
                "Nuestra misión es que cada clienta experimente el tono exacto que soñó, manteniendo su cabello radiante, sano y con máxima fortaleza."
              </p>
              <p className="text-xs text-[#888888] mt-2 font-medium uppercase tracking-wider">
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
