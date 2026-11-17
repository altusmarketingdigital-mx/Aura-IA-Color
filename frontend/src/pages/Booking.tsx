import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  Upload,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import api from '../services/api';

export const Booking: React.FC = () => {
  const [searchParams] = useSearchParams();
  const preselectedServiceId = searchParams.get('serviceId') || '';

  // Estados de datos del catálogo
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string>(preselectedServiceId);
  const [selectedService, setSelectedService] = useState<any>(null);

  // Estados de fecha y slots
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);
  const [dayInfo, setDayInfo] = useState<string>('');

  // Datos del Cliente
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [clientNotes, setClientNotes] = useState<string>('');
  const [acceptedPrivacy, setAcceptedPrivacy] = useState<boolean>(false);

  // Archivos de fotos opcionales
  const [currentPhoto, setCurrentPhoto] = useState<File | null>(null);
  const [referencePhoto, setReferencePhoto] = useState<File | null>(null);

  // Estados del proceso
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [bookingSuccess, setBookingSuccess] = useState<any>(null);

  // 1. Cargar servicios
  useEffect(() => {
    const loadServices = async () => {
      try {
        const res = await api.get('/services');
        if (res.data.success) {
          setCategories(res.data.categories);
          if (preselectedServiceId) {
            for (const cat of res.data.categories) {
              const found = cat.services.find((s: any) => s.id === preselectedServiceId);
              if (found) {
                setSelectedService(found);
                break;
              }
            }
          }
        }
      } catch (e) {
        console.error('Error al cargar servicios:', e);
      }
    };
    loadServices();
  }, [preselectedServiceId]);

  // Manejar cambio de servicio
  const handleServiceChange = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    setSelectedSlot('');
    for (const cat of categories) {
      const found = cat.services.find((s: any) => s.id === serviceId);
      if (found) {
        setSelectedService(found);
        break;
      }
    }
  };

  // 2. Consultar disponibilidad en tiempo real cuando cambie la fecha o el servicio
  useEffect(() => {
    const checkAvailability = async () => {
      if (!selectedDate || !selectedServiceId) {
        setAvailableSlots([]);
        return;
      }
      setLoadingSlots(true);
      setErrorMessage('');
      try {
        const res = await api.get(`/appointments/availability?date=${selectedDate}&serviceId=${selectedServiceId}`);
        if (res.data.success) {
          setAvailableSlots(res.data.slots || []);
          setDayInfo(res.data.dayInfo || '');
        }
      } catch (err: any) {
        setAvailableSlots([]);
        setDayInfo(err.response?.data?.error || 'No disponible en este día');
      } finally {
        setLoadingSlots(false);
      }
    };

    checkAvailability();
  }, [selectedDate, selectedServiceId]);

  // Generar fecha mínima (hoy en formato YYYY-MM-DD)
  const today = new Date().toISOString().split('T')[0];

  // Enviar reservación
  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!selectedServiceId) {
      setErrorMessage('Por favor selecciona un servicio');
      return;
    }
    if (!selectedDate) {
      setErrorMessage('Por favor selecciona una fecha');
      return;
    }
    if (!selectedSlot) {
      setErrorMessage('Por favor selecciona un horario disponible');
      return;
    }
    if (!customerName.trim() || !customerPhone.trim()) {
      setErrorMessage('Nombre y teléfono son obligatorios');
      return;
    }
    if (!acceptedPrivacy) {
      setErrorMessage('Debes aceptar el aviso de privacidad para continuar');
      return;
    }

    setSubmitting(true);

    try {
      // Construir ISO DateTime a partir de la fecha seleccionada y el slot "HH:mm"
      const [year, month, day] = selectedDate.split('-').map(Number);
      const [hours, mins] = selectedSlot.split(':').map(Number);
      const appointmentDate = new Date(Date.UTC(year, month - 1, day, hours, mins, 0)).toISOString();

      const formData = new FormData();
      formData.append('customerName', customerName);
      formData.append('customerPhone', customerPhone);
      if (customerEmail) formData.append('customerEmail', customerEmail);
      formData.append('serviceId', selectedServiceId);
      formData.append('appointmentDate', appointmentDate);
      if (clientNotes) formData.append('clientNotes', clientNotes);
      formData.append('acceptedPrivacy', 'true');

      if (currentPhoto) formData.append('currentPhoto', currentPhoto);
      if (referencePhoto) formData.append('referencePhoto', referencePhoto);

      const res = await api.post('/appointments', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        setBookingSuccess(res.data);
      }
    } catch (err: any) {
      console.error('Error al registrar cita:', err);
      setErrorMessage(
        err.response?.data?.error || 'Ocurrió un error al procesar tu solicitud. Intenta nuevamente.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Pantalla de Éxito con Folio y Botón Oficial wa.me
  if (bookingSuccess) {
    return (
      <div className="bg-[#111111] py-20 min-h-[80vh] flex items-center justify-center">
        <div className="max-w-2xl mx-auto px-4 w-full">
          <div className="bg-[#171717] border border-[#C6A15B]/50 p-8 sm:p-12 rounded-sm text-center shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-[#C6A15B]/20 border border-[#C6A15B] flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-[#C6A15B]" />
            </div>

            <span className="text-xs uppercase tracking-[0.25em] text-[#C6A15B] font-semibold block mb-2">
              Solicitud Registrada con Éxito
            </span>
            <h1 className="text-3xl font-serif text-[#FFFFFF] mb-4">
              ¡Gracias, {customerName}!
            </h1>
            <p className="text-sm text-[#888888] font-light max-w-md mx-auto mb-6 leading-relaxed">
              Tu solicitud de reservación ha sido registrada en el sistema con estado{' '}
              <span className="text-[#C6A15B] font-semibold">PENDIENTE</span>.
            </p>

            {/* Tarjeta de Resumen con Folio */}
            <div className="bg-[#1F1F1F] border border-[#333333] p-6 rounded-sm text-left max-w-md mx-auto mb-8 space-y-2.5">
              <div className="flex justify-between items-center border-b border-[#2D2D2D] pb-2">
                <span className="text-xs text-[#888888]">Folio Oficial:</span>
                <span className="font-mono text-sm text-[#C6A15B] font-bold">
                  {bookingSuccess.folio}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#888888]">Servicio:</span>
                <span className="text-[#FFFFFF] font-medium">{selectedService?.name}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#888888]">Fecha:</span>
                <span className="text-[#FFFFFF]">{selectedDate}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#888888]">Horario:</span>
                <span className="text-[#FFFFFF]">{selectedSlot} hrs.</span>
              </div>
            </div>

            <div className="space-y-4">
              <a
                href={bookingSuccess.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#25D366] hover:bg-[#20ba59] text-[#FFFFFF] font-bold text-xs uppercase tracking-widest rounded-sm transition-all shadow-lg"
              >
                <MessageSquare className="w-5 h-5" />
                <span>Continuar Confirmación por WhatsApp</span>
              </a>
              <p className="text-[11px] text-[#666666] max-w-sm mx-auto">
                * Para agilizar y asegurar tu lugar, envía el mensaje precargado oficial a nuestro WhatsApp empresarial.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#111111] py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Encabezado */}
        <div className="text-center mb-12">
          <span className="text-xs uppercase tracking-[0.25em] text-[#C6A15B] font-medium block mb-2">
            Reservaciones en Línea
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif text-[#FFFFFF] mb-4">
            Agenda tu Experiencia de Color
          </h1>
          <p className="text-xs sm:text-sm text-[#888888] font-light max-w-xl mx-auto">
            Selecciona tu servicio, consulta los horarios disponibles en tiempo real y solicita tu cita sin necesidad de crear una cuenta.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-8 p-4 bg-red-950/40 border border-red-500/50 rounded-sm text-red-200 text-xs flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmitBooking} className="space-y-10">
          
          {/* PASO 1: Selección de Servicio */}
          <div className="bg-[#171717] border border-[#262626] p-6 sm:p-8 rounded-sm">
            <h3 className="font-serif text-lg text-[#FFFFFF] mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C6A15B]" />
              <span>1. Selecciona tu Servicio</span>
            </h3>

            <div className="space-y-4">
              <select
                value={selectedServiceId}
                onChange={(e) => handleServiceChange(e.target.value)}
                className="w-full bg-[#111111] border border-[#333333] text-[#FFFFFF] px-4 py-3 rounded-sm text-xs focus:outline-none focus:border-[#C6A15B]"
                required
              >
                <option value="">-- Elige una técnica o servicio --</option>
                {categories.map((cat) => (
                  <optgroup key={cat.id} label={cat.name}>
                    {cat.services.map((s: any) => (
                      <option key={s.id} value={s.id}>
                        {s.name} — ${s.price.toLocaleString('es-MX')} MXN ({s.durationMinutes} min)
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>

              {selectedService && (
                <div className="p-4 bg-[#1F1F1F] border border-[#2D2D2D] rounded-sm text-xs text-[#888888] flex justify-between items-center">
                  <div>
                    <p className="text-[#FFFFFF] font-medium">{selectedService.name}</p>
                    <p className="font-light mt-0.5">{selectedService.description}</p>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <span className="font-serif text-base text-[#C6A15B] font-bold block">
                      ${selectedService.price.toLocaleString('es-MX')} MXN
                    </span>
                    <span className="text-[10px]">Aprox. {selectedService.durationMinutes} min</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* PASO 2: Selección de Fecha y Consulta de Horario */}
          <div className="bg-[#171717] border border-[#262626] p-6 sm:p-8 rounded-sm">
            <h3 className="font-serif text-lg text-[#FFFFFF] mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#C6A15B]" />
              <span>2. Fecha y Horario Disponible</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#888888] mb-2">
                  Fecha Deseada
                </label>
                <input
                  type="date"
                  min={today}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full bg-[#111111] border border-[#333333] text-[#FFFFFF] px-4 py-3 rounded-sm text-xs focus:outline-none focus:border-[#C6A15B]"
                  required
                />
                <p className="text-[11px] text-[#888888] mt-2">
                  * Horario de atención: Lunes a Sábado de 09:00 a 19:00 hrs. Domingos cerrado.
                </p>
                {dayInfo && (
                  <p className="text-xs text-[#C6A15B] mt-2 font-medium">{dayInfo}</p>
                )}
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#888888] mb-2">
                  Horarios Disponibles
                </label>
                {loadingSlots ? (
                  <div className="text-xs text-[#888888] py-8 text-center">Consultando disponibilidad en tiempo real...</div>
                ) : !selectedDate ? (
                  <div className="text-xs text-[#666666] py-8 text-center border border-dashed border-[#2A2A2A] rounded">
                    Selecciona una fecha primero
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="text-xs text-[#C6A15B] py-8 text-center border border-[#2A2A2A] rounded">
                    No hay horarios disponibles para esta fecha o el salón se encuentra cerrado.
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                    {availableSlots.map((slot) => (
                      <button
                        type="button"
                        key={slot.time}
                        disabled={!slot.available}
                        onClick={() => setSelectedSlot(slot.time)}
                        className={`py-2 px-2 text-xs rounded text-center transition-all ${
                          !slot.available
                            ? 'bg-[#181818] text-[#444444] cursor-not-allowed line-through'
                            : selectedSlot === slot.time
                            ? 'bg-[#C6A15B] text-[#111111] font-bold shadow'
                            : 'bg-[#222222] text-[#F5F1E9] hover:border-[#C6A15B] border border-[#333333]'
                        }`}
                      >
                        {slot.time} hrs
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* PASO 3: Datos de Contacto */}
          <div className="bg-[#171717] border border-[#262626] p-6 sm:p-8 rounded-sm">
            <h3 className="font-serif text-lg text-[#FFFFFF] mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-[#C6A15B]" />
              <span>3. Datos de la Clienta</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#888888] mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Ej. María Fernanda Morales"
                  className="w-full bg-[#111111] border border-[#333333] text-[#FFFFFF] px-4 py-2.5 rounded-sm text-xs focus:outline-none focus:border-[#C6A15B]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#888888] mb-1">
                  Teléfono / WhatsApp (10 dígitos) *
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Ej. 5512345678"
                  className="w-full bg-[#111111] border border-[#333333] text-[#FFFFFF] px-4 py-2.5 rounded-sm text-xs focus:outline-none focus:border-[#C6A15B]"
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs uppercase tracking-wider text-[#888888] mb-1">
                Correo Electrónico (Opcional)
              </label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="cliente@ejemplo.com"
                className="w-full bg-[#111111] border border-[#333333] text-[#FFFFFF] px-4 py-2.5 rounded-sm text-xs focus:outline-none focus:border-[#C6A15B]"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#888888] mb-1">
                Comentarios o Historial Químico del Cabello (Opcional)
              </label>
              <textarea
                value={clientNotes}
                onChange={(e) => setClientNotes(e.target.value)}
                rows={3}
                placeholder="Indícanos si tienes tintes negros previos, decoloraciones, queratinas o requerimientos específicos..."
                className="w-full bg-[#111111] border border-[#333333] text-[#FFFFFF] px-4 py-2.5 rounded-sm text-xs focus:outline-none focus:border-[#C6A15B]"
              />
            </div>
          </div>

          {/* PASO 4: Fotografías de Diagnóstico (Opcionales y Almacenamiento Privado) */}
          <div className="bg-[#171717] border border-[#262626] p-6 sm:p-8 rounded-sm">
            <h3 className="font-serif text-lg text-[#FFFFFF] mb-2 flex items-center gap-2">
              <Upload className="w-4 h-4 text-[#C6A15B]" />
              <span>4. Fotografías de Diagnóstico (Opcional)</span>
            </h3>
            <p className="text-xs text-[#888888] mb-6">
              Estas imágenes son estrictamente privadas, no se publican y solo las verán las master coloristas para preparar tu fórmula antes de tu llegada.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-dashed border-[#333333] p-4 rounded-sm text-center">
                <p className="text-xs font-semibold text-[#FFFFFF] mb-1">Foto Actual de tu Cabello</p>
                <p className="text-[10px] text-[#888888] mb-3">Con luz natural si es posible</p>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => setCurrentPhoto(e.target.files ? e.target.files[0] : null)}
                  className="text-xs text-[#888888] file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-[11px] file:bg-[#2A2A2A] file:text-[#C6A15B]"
                />
              </div>

              <div className="border border-dashed border-[#333333] p-4 rounded-sm text-center">
                <p className="text-xs font-semibold text-[#FFFFFF] mb-1">Foto de Referencia Deseada</p>
                <p className="text-[10px] text-[#888888] mb-3">Tono o técnica que te gustaría lograr</p>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => setReferencePhoto(e.target.files ? e.target.files[0] : null)}
                  className="text-xs text-[#888888] file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-[11px] file:bg-[#2A2A2A] file:text-[#C6A15B]"
                />
              </div>
            </div>
          </div>

          {/* PASO 5: Aviso de Privacidad y Botón de Envío */}
          <div className="space-y-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={acceptedPrivacy}
                onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                className="mt-1 w-4 h-4 accent-[#C6A15B] rounded"
                required
              />
              <span className="text-xs text-[#888888] leading-relaxed">
                Acepto el <strong className="text-[#FFFFFF]">Aviso de Privacidad</strong> y consiento el tratamiento confidencial de mis datos personales y fotografías capilares para la gestión exclusiva de mi reservación en AURA IA COLOR conforme a la Ley.
              </span>
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-[#C6A15B] hover:bg-[#DFBF7E] text-[#111111] font-bold text-xs uppercase tracking-[0.2em] rounded-sm transition-all shadow-lg shadow-[#C6A15B]/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <span>Procesando Reservación...</span>
              ) : (
                <>
                  <span>Confirmar Solicitud de Cita</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
