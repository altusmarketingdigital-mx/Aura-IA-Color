import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { BeforeAfterSlider } from '../components/common/BeforeAfterSlider';
import { Sparkles } from 'lucide-react';

export const Gallery: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [loading, setLoading] = useState<boolean>(true);

  const categories = [
    { key: 'ALL', label: 'Todas' },
    { key: 'BALAYAGE', label: 'Balayage' },
    { key: 'BABYLIGHTS', label: 'Babylights' },
    { key: 'COLORACION', label: 'Coloración' },
    { key: 'TRANSFORMACIONES', label: 'Transformaciones' },
  ];

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const res = await api.get('/gallery');
        if (res.data.success) {
          setItems(res.data.items);
        }
      } catch (e) {
        console.error('Error al cargar galería:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, []);

  const filteredItems = selectedCategory === 'ALL'
    ? items
    : items.filter((item) => item.category === selectedCategory);

  return (
    <div className="bg-[#111111] py-16 relative overflow-hidden">
      {/* Splashes sutiles de fondo */}
      <div className="absolute top-24 -left-20 w-80 h-80 ink-splash-cyan rounded-full pointer-events-none opacity-20" />
      <div className="absolute bottom-32 -right-20 w-80 h-80 ink-splash-rose rounded-full pointer-events-none opacity-20" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Encabezado con efecto de texto animado */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-[0.25em] text-[#C6A15B] font-medium block mb-2">
            Galería Oficial de Trabajos
          </span>
          <h1 className="text-4xl sm:text-5xl font-serif text-[#FFFFFF] mb-6 tracking-tight">
            <span className="relative inline-block">
              <span className="slogan-multicolor-flow font-serif font-extrabold tracking-wide">
                Resultados & Transformaciones
              </span>
              <span className="absolute -bottom-2 left-1/4 right-1/4 h-[2px] bg-gradient-to-r from-transparent via-[#C6A15B] to-transparent shadow-[0_0_8px_#C6A15B]" />
            </span>
          </h1>
          <p className="text-sm text-[#888888] font-light leading-relaxed">
            Fotografías reales de resultados obtenidos en AURA IA COLOR con consentimiento de nuestras clientas.
          </p>
        </div>

        {/* Módulo Especial: Comparador Interactivo de Transformación en Cabina */}
        <div className="mb-20 max-w-3xl mx-auto bg-[#171717] border border-[#2D2D2D] p-6 sm:p-8 rounded-sm shadow-[0_15px_45px_rgba(0,0,0,0.7)]">
          <BeforeAfterSlider
            beforeImage="/transform-aura-blonde-before.jpg"
            afterImage="/transform-aura-blonde-after.jpg"
            beforeLabel="Antes"
            afterLabel="Después"
            title="Corrección y Formulación Inteligente"
            subtitle="Transformación Destacada"
            aspectRatio="aspect-[4/5] sm:aspect-[4/5]"
          />
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((c) => (
            <button
              key={c.key}
              onClick={() => setSelectedCategory(c.key)}
              className={`px-4 py-2 text-xs uppercase tracking-wider rounded-sm transition-all ${
                selectedCategory === c.key
                  ? 'bg-[#C6A15B] text-[#111111] font-bold'
                  : 'bg-[#1A1A1A] text-[#888888] hover:text-[#FFFFFF] border border-[#2D2D2D]'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Grilla */}
        {loading ? (
          <div className="text-center py-20 text-[#888888]">Cargando galería...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-[#171717] border border-[#262626] rounded-sm overflow-hidden group hover:border-[#C6A15B]/50 transition-all"
              >
                <div className="aspect-[4/5] relative overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-[#111111]/80 backdrop-blur-sm px-2.5 py-1 rounded text-[10px] text-[#C6A15B] uppercase tracking-widest font-semibold border border-[#C6A15B]/30">
                    {item.category}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-serif text-base text-[#FFFFFF]">{item.title}</h3>
                  {item.beforeImage && (
                    <p className="text-[11px] text-[#888888] mt-1 italic">
                      Incluye comparativa Antes y Después en cabina
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
