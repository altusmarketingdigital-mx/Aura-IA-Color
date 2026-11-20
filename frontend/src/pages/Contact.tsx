import React from 'react';
import { MapPin, Phone, Instagram, Clock, MessageSquare, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Contact: React.FC = () => {
  return (
    <div className="bg-[#111111] py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Encabezado */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-[0.25em] text-[#C6A15B] font-medium block mb-2">
            Estamos para Servirte
          </span>
          <h1 className="text-4xl sm:text-5xl font-serif text-[#FFFFFF] mb-6">
            Contacto y Citas
          </h1>
          <p className="text-sm text-[#888888] font-light leading-relaxed">
            Visítanos en una ubicación estratégica entre la Roma Sur y Del Valle Norte, o contáctanos directamente a través de nuestros canales oficiales.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-16">
          
          {/* Tarjeta de Información de Contacto */}
          <div className="bg-[#171717] border border-[#262626] p-8 sm:p-10 rounded-sm space-y-8">
            <div>
              <h2 className="font-serif text-2xl text-[#FFFFFF] mb-2">AURA IA COLOR</h2>
              <p className="text-xs text-[#C6A15B] uppercase tracking-wider font-semibold">
                Estudio de Coloración Capilar
              </p>
            </div>

            <div className="space-y-6">
              
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-sm bg-[#1A1A1A] border border-[#333333] flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-[#C6A15B]" />
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-[#888888] mb-1">Dirección Oficial</h4>
                  <p className="text-sm text-[#FFFFFF] font-medium">
                    Obrero Mundial 122, Local 2, Colonia Del Valle Norte, Benito Juárez, Ciudad de México.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-sm bg-[#1A1A1A] border border-[#333333] flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-[#C6A15B]" />
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-[#888888] mb-1">WhatsApp de Atención</h4>
                  <a
                    href="https://wa.me/525537293887"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[#C6A15B] hover:underline font-semibold"
                  >
                    55 3729 3887 (525537293887)
                  </a>
                  <p className="text-[11px] text-[#888888] mt-0.5">Atención personalizada y dudas sobre citas</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-sm bg-[#1A1A1A] border border-[#333333] flex items-center justify-center shrink-0">
                  <Instagram className="w-5 h-5 text-[#C6A15B]" />
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-[#888888] mb-1">Instagram Oficial</h4>
                  <a
                    href="https://instagram.com/aura.iacolor"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[#FFFFFF] hover:text-[#C6A15B] transition-colors"
                  >
                    @aura.iacolor
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-sm bg-[#1A1A1A] border border-[#333333] flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-[#C6A15B]" />
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-[#888888] mb-1">Horario Oficial de Operación</h4>
                  <p className="text-sm text-[#FFFFFF]">Martes a Sábado: 10:00 a 20:00 hrs</p>
                  <p className="text-xs text-[#C6A15B] font-medium mt-0.5">Domingos: 10:00 a 16:00 hrs</p>
                  <p className="text-xs text-[#777777] mt-0.5">Lunes: Cerrado</p>
                </div>
              </div>

            </div>

            <div className="pt-6 border-t border-[#262626] flex flex-col sm:flex-row gap-4">
              <Link
                to="/reservar"
                className="flex-1 py-3 bg-[#C6A15B] hover:bg-[#DFBF7E] text-[#111111] font-semibold text-xs uppercase tracking-widest rounded-sm text-center transition-all flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Solicitar Reservación</span>
              </Link>
              <a
                href="https://wa.me/525537293887"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 border border-[#C6A15B] text-[#C6A15B] hover:bg-[#C6A15B]/10 font-semibold text-xs uppercase tracking-widest rounded-sm text-center transition-all flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Chatear por WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Mapa Interactivo */}
          <div className="h-full min-h-[460px] w-full rounded-sm overflow-hidden border border-[#2D2D2D] shadow-xl">
            <iframe
              title="Ubicación AURA IA COLOR en Google Maps"
              src="https://maps.google.com/maps?q=Obrero+Mundial+122,+Del+Valle+Norte,+Benito+Juarez,+CDMX&t=&z=16&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: '460px', filter: 'grayscale(0.7) contrast(1.15)' }}
              allowFullScreen={false}
              loading="lazy"
            />
          </div>

        </div>

      </div>
    </div>
  );
};
