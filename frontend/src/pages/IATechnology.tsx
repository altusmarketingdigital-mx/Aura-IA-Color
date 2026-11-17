import React from 'react';
import { Cpu, CheckCircle2, ShieldAlert, Sparkles, Sliders, Database, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const IATechnology: React.FC = () => {
  return (
    <div className="bg-[#111111] py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Encabezado */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#C6A15B]/30 bg-[#1A1A1A] mb-4">
            <Cpu className="w-4 h-4 text-[#C6A15B]" />
            <span className="text-[11px] uppercase tracking-widest text-[#C6A15B]">
              Diferenciador Tecnológico Oficial
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-serif text-[#FFFFFF] mb-6">
            Inteligencia Artificial en Colorimetría
          </h1>
          <p className="text-sm sm:text-base text-[#888888] font-light max-w-2xl mx-auto leading-relaxed">
            Conoce cómo aplicamos modelos computacionales y lógica cromática matemática al proceso de formulación de color en el salón.
          </p>
        </div>

        {/* Explicación Transparente y Sin Simulación Falsa */}
        <div className="bg-[#171717] border border-[#292929] p-8 md:p-10 rounded-sm mb-16">
          <h2 className="text-2xl font-serif text-[#FFFFFF] mb-4 flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-[#C6A15B]" />
            <span>¿En qué consiste nuestra tecnología?</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#F5F1E9]/80 leading-relaxed font-light mb-6">
            La formulación de tintes capilares ha dependido históricamente de la intuición del estilista. Sin embargo, cuando se trabaja con decoloraciones, fondos de aclaración (rojizos, cobrizos o amarillos) y porosidades desiguales, una variación de 2 gramos de un matizador puede alterar completamente el resultado final.
          </p>
          <p className="text-xs sm:text-sm text-[#F5F1E9]/80 leading-relaxed font-light">
            En <strong>AURA IA COLOR</strong>, la asesoría humana es insustituible: la realiza un estilista profesional especializado en colorimetría capilar. El especialista evalúa física y técnicamente tu cabello y programa nuestra máquina formuladora asistida por Inteligencia Artificial. La máquina calcula y dosifica los pigmentos puros y oxidantes con exactitud matemática, asegurando la mezcla perfecta sin margen de error.
          </p>
        </div>

        {/* Paso a Paso del Proceso en Salón */}
        <div className="mb-20">
          <h2 className="text-2xl font-serif text-[#FFFFFF] text-center mb-12">
            El Proceso de Formulación en 4 Pasos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="bg-[#151515] border border-[#262626] p-6 rounded-sm">
              <span className="font-serif text-2xl text-[#C6A15B] font-bold block mb-2">01</span>
              <h3 className="font-serif text-lg text-[#FFFFFF] mb-2">Diagnóstico Presencial</h3>
              <p className="text-xs text-[#888888] font-light leading-relaxed">
                Evaluamos físicamente la elasticidad, porosidad, grosor del cabello y el tono residual de procesos químicos anteriores.
              </p>
            </div>

            <div className="bg-[#151515] border border-[#262626] p-6 rounded-sm">
              <span className="font-serif text-2xl text-[#C6A15B] font-bold block mb-2">02</span>
              <h3 className="font-serif text-lg text-[#FFFFFF] mb-2">Cálculo Cromático con IA</h3>
              <p className="text-xs text-[#888888] font-light leading-relaxed">
                El algoritmo analiza la interacción entre la melanina residual del cabello y las tablas de pigmentación para generar la fórmula óptima.
              </p>
            </div>

            <div className="bg-[#151515] border border-[#262626] p-6 rounded-sm">
              <span className="font-serif text-2xl text-[#C6A15B] font-bold block mb-2">03</span>
              <h3 className="font-serif text-lg text-[#FFFFFF] mb-2">Pesaje de Precisión</h3>
              <p className="text-xs text-[#888888] font-light leading-relaxed">
                Mezclamos los tintes en básculas digitales siguiendo la receta sugerida al gramo exacto para consistencia total.
              </p>
            </div>

            <div className="bg-[#151515] border border-[#262626] p-6 rounded-sm">
              <span className="font-serif text-2xl text-[#C6A15B] font-bold block mb-2">04</span>
              <h3 className="font-serif text-lg text-[#FFFFFF] mb-2">Registro de Fórmula</h3>
              <p className="text-xs text-[#888888] font-light leading-relaxed">
                Guardamos tu fórmula y tiempos de exposición en tu expediente para que tus futuros retoques conserven exactamente el mismo matiz.
              </p>
            </div>

          </div>
        </div>

        {/* Declaración de Integridad y Ética */}
        <div className="bg-[#1A1A1A] border-l-4 border-[#C6A15B] p-6 rounded-sm mb-16">
          <div className="flex items-start gap-4">
            <ShieldAlert className="w-5 h-5 text-[#C6A15B] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-[#FFFFFF] mb-1">
                La Fusión Perfecta: Talento Profesional y Tecnología
              </h4>
              <p className="text-xs text-[#888888] leading-relaxed">
                La asesoría técnica es 100% personalizada y la realiza un estilista especialista en colorimetría capilar para mujeres, hombres y cualquier género. La máquina con Inteligencia Artificial es el instrumento tecnológico que formula y dosifica la mezcla exacta para garantizar resultados consistentes y cabello saludable.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            to="/reservar"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#C6A15B] hover:bg-[#DFBF7E] text-[#111111] font-semibold text-xs uppercase tracking-widest rounded-sm transition-all"
          >
            <span>Agenda tu Asesoría y Formulación</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
};
