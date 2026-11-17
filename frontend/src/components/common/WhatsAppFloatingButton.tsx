import React, { useState } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';

export const WhatsAppFloatingButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userMsg, setUserMsg] = useState('');

  const phone = '525537293887';
  const defaultMessage = '¡Hola! Me gustaría recibir información sobre los servicios de colorimetría y formulación con máquina de IA en AURA IA COLOR.';

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const textToSend = userMsg.trim() || defaultMessage;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(textToSend)}`;
    window.open(url, '_blank');
    setIsOpen(false);
    setUserMsg('');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {/* Ventana Emergente de Chat Rápido */}
      {isOpen && (
        <div className="mb-4 w-80 sm:w-88 bg-[#181818] border border-[#C6A15B]/50 rounded-lg shadow-[0_10px_35px_rgba(0,0,0,0.8)] overflow-hidden transition-all transform animate-fadeIn">
          {/* Header del Chat */}
          <div className="bg-gradient-to-r from-[#111111] via-[#1E1E1E] to-[#111111] p-4 border-b border-[#333333] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src="/logo.jpg"
                  alt="AURA IA COLOR"
                  className="w-10 h-10 rounded-full object-cover border border-[#C6A15B]"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#181818]"></span>
              </div>
              <div>
                <h4 className="text-xs font-serif font-bold text-[#FFFFFF]">AURA IA COLOR</h4>
                <p className="text-[10px] text-[#C6A15B] font-medium">En línea • Asesoría de Color</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-[#888888] hover:text-[#FFFFFF] p-1 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Cuerpo del Mensaje */}
          <div className="p-4 bg-[#141414] space-y-3 text-xs">
            <div className="bg-[#1F1F1F] text-[#F5F1E9]/90 p-3 rounded-tr-lg rounded-br-lg rounded-bl-lg max-w-[90%] border border-[#2D2D2D]">
              <p className="leading-relaxed">
                ¡Hola! ✨ Te damos la bienvenida a <strong>AURA IA COLOR</strong>, entre la Roma Sur y Del Valle Norte, CDMX.
              </p>
              <p className="mt-2 text-[11px] text-[#888888]">
                ¿Tienes dudas sobre tu tono ideal o deseas una cita con nuestros estilistas especialistas en colorimetría y formulación con máquina de IA?
              </p>
            </div>
          </div>

          {/* Formulario de Envío Rápido */}
          <form onSubmit={handleSend} className="p-3 bg-[#181818] border-t border-[#262626] flex gap-2">
            <input
              type="text"
              placeholder="Escribe tu consulta..."
              value={userMsg}
              onChange={(e) => setUserMsg(e.target.value)}
              className="flex-1 bg-[#111111] border border-[#333333] text-[#FFFFFF] px-3 py-2 rounded text-xs focus:outline-none focus:border-[#C6A15B]"
            />
            <button
              type="submit"
              className="bg-[#25D366] hover:bg-[#20ba59] text-white p-2 rounded transition-colors flex items-center justify-center shrink-0"
              title="Enviar a WhatsApp"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Botón Flotante con Animación de Pulso */}
      <div className="relative group">
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#25D366]"></span>
        </span>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white flex items-center justify-center shadow-[0_4px_25px_rgba(37,211,102,0.4)] hover:shadow-[0_4px_35px_rgba(37,211,102,0.6)] transform hover:scale-110 transition-all duration-300"
          aria-label="Abrir WhatsApp"
        >
          {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6 fill-current" />}
        </button>
      </div>

    </div>
  );
};
