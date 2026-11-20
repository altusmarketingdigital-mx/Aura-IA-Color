import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Sparkles, MoveHorizontal } from 'lucide-react';

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  title?: string;
  subtitle?: string;
  aspectRatio?: string;
  className?: string;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  beforeImage,
  afterImage,
  beforeLabel = 'Antes',
  afterLabel = 'Después',
  title,
  subtitle,
  aspectRatio = 'aspect-[4/5] sm:aspect-[3/4]',
  className = '',
}) => {
  const [sliderPosition, setSliderPosition] = useState<number>(50); // porcentaje 0 - 100
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    let percentage = (x / rect.width) * 100;
    if (percentage < 0) percentage = 0;
    if (percentage > 100) percentage = 100;
    setSliderPosition(percentage);
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging) return;
    handleMove(e.touches[0].clientX);
  }, [isDragging, handleMove]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  }, [isDragging, handleMove]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove]);

  const startDragging = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    if ('touches' in e) {
      handleMove(e.touches[0].clientX);
    } else {
      handleMove(e.clientX);
    }
  };

  return (
    <div className={`w-full select-none ${className}`}>
      {/* Título y subtítulo opcionales */}
      {(title || subtitle) && (
        <div className="text-center mb-6">
          {subtitle && (
            <span className="text-[11px] uppercase tracking-[0.25em] text-[#C6A15B] font-semibold block mb-2">
              {subtitle}
            </span>
          )}
          {title && (
            <h3 className="text-2xl sm:text-3xl font-serif text-[#FFFFFF]">
              {title}
            </h3>
          )}
          <p className="text-xs text-[#888888] font-light mt-2 flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#C6A15B]" />
            <span>Desliza la barra central o el control inferior para comparar el cambio</span>
          </p>
        </div>
      )}

      {/* Contenedor del Deslizador Interactivo */}
      <div
        ref={containerRef}
        onMouseDown={startDragging}
        onTouchStart={startDragging}
        className={`relative ${aspectRatio} w-full max-w-xl mx-auto rounded-sm overflow-hidden border border-[#C6A15B]/40 shadow-[0_15px_50px_rgba(0,0,0,0.85)] cursor-ew-resize group bg-[#111111]`}
      >
        {/* Capa de la Imagen del DESPUÉS (Base de fondo completa) */}
        <img
          src={afterImage}
          alt={afterLabel}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />

        {/* Badge "Después" */}
        <div className="absolute top-4 right-4 z-20 px-3.5 py-1.5 rounded-full bg-[#111111]/85 backdrop-blur-md border border-[#C6A15B]/40 shadow-lg pointer-events-none">
          <span className="text-[11px] font-semibold text-[#DFBF7E] tracking-wider uppercase font-mono">
            {afterLabel}
          </span>
        </div>

        {/* Capa de la Imagen del ANTES (Recortada dinámicamente con clip-path) */}
        <div
          className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none"
          style={{
            clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)`,
          }}
        >
          <img
            src={beforeImage}
            alt={beforeLabel}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>

        {/* Badge "Antes" */}
        <div className="absolute top-4 left-4 z-20 px-3.5 py-1.5 rounded-full bg-[#111111]/85 backdrop-blur-md border border-[#555555]/60 shadow-lg pointer-events-none">
          <span className="text-[11px] font-semibold text-[#FFFFFF] tracking-wider uppercase font-mono">
            {beforeLabel}
          </span>
        </div>

        {/* Línea Divisoria Vertical & Handle Interactivo */}
        <div
          className="absolute top-0 bottom-0 z-30 pointer-events-none"
          style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
        >
          {/* Línea Vertical Iluminada */}
          <div className="w-[2px] h-full bg-gradient-to-b from-[#DFBF7E] via-[#C6A15B] to-[#DFBF7E] shadow-[0_0_12px_rgba(198,161,91,0.9)]" />

          {/* Botón Circular Central Deslizante (Inspirado en el diseño AURA) */}
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 left-1/2 w-11 h-11 rounded-full bg-[#F5F1E9] text-[#111111] border-2 border-[#C6A15B] shadow-[0_4px_20px_rgba(0,0,0,0.7)] flex items-center justify-center transform transition-transform group-hover:scale-110">
            <MoveHorizontal className="w-5 h-5 text-[#111111]" />
          </div>
        </div>
      </div>

      {/* Control Inferior de Rango Deslizante (Slider Bar como en el mockup) */}
      <div className="max-w-xl mx-auto mt-5 px-2">
        <div className="flex items-center gap-3">
          <span className="text-[10px] uppercase font-mono text-[#888888] tracking-wider shrink-0">
            {beforeLabel}
          </span>
          <input
            type="range"
            min="0"
            max="100"
            value={sliderPosition}
            onChange={(e) => setSliderPosition(Number(e.target.value))}
            className="w-full h-1.5 bg-[#252525] rounded-lg appearance-none cursor-pointer accent-[#C6A15B] focus:outline-none"
            aria-label="Control deslizante de antes y después"
          />
          <span className="text-[10px] uppercase font-mono text-[#C6A15B] tracking-wider shrink-0 font-semibold">
            {afterLabel}
          </span>
        </div>
        <p className="text-center text-[11px] text-[#666666] mt-2 font-light">
          Mueve la línea sobre la foto o utiliza la barra inferior
        </p>
      </div>
    </div>
  );
};
