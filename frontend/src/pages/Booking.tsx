import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Calendar,
  Clock,
  User,
  Upload,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  Sparkles,
  ArrowRight,
  CreditCard,
  ShieldCheck,
  Landmark,
  RefreshCw,
} from 'lucide-react';
import api from '../services/api';
import { OFFICIAL_SERVICE_CATEGORIES } from '../data/officialServices';

interface SlotItem {
  time: string;
  available: boolean;
  reason?: string;
}

const formatSlotLabel = (time24: string): string => {
  const [hStr, mStr] = time24.split(':');
  const h = Number(hStr);
  const suffix = h >= 12 ? 'p.m.' : 'a.m.';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${mStr} ${suffix}`;
};

const getLocalAvailability = (dateStr: string): { isOpen: boolean; slots: SlotItem[]; dayInfo: string } => {
  const [year, month, day] = dateStr.split('-').map(Number);
  const targetDate = new Date(Date.UTC(year, month - 1, day));
  const dayOfWeek = targetDate.getUTCDay(); // 0=Dom, 1=Lun, ..., 6=Sáb

  if (dayOfWeek === 1) {
    return {
      isOpen: false,
      slots: [],
      dayInfo: 'Los días lunes el salón permanece cerrado. Por favor elige un día de martes a domingo.',
    };
  }

  if (dayOfWeek === 0) {
    return {
      isOpen: true,
      slots: [
        { time: '10:00', available: true },
        { time: '12:00', available: true },
        { time: '14:00', available: true },
      ],
      dayInfo: 'Horario de domingo: 10:00 a.m. a 4:00 p.m. (citas cada 2 horas, última cita 2:00 p.m.).',
    };
  }

  return {
    isOpen: true,
    slots: [
      { time: '10:00', available: true },
      { time: '12:00', available: true },
      { time: '14:00', available: true },
      { time: '16:00', available: true },
      { time: '18:00', available: true },
    ],
    dayInfo: 'Horario de martes a sábado: 10:00 a.m. a 8:00 p.m. (citas cada 2 horas, última cita 6:00 p.m.).',
  };
};

const getLocalTodayString = (): string => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const Booking: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const preselectedServiceId = searchParams.get('serviceId') || '';
  const paymentStatusParam = searchParams.get('payment');
  const sessionIdParam = searchParams.get('session_id');
  const folioParam = searchParams.get('folio') || '';

  // Estados de datos del catálogo
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string>(preselectedServiceId);
  const [selectedService, setSelectedService] = useState<any>(null);

  // Estados de fecha y slots
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<SlotItem[]>([]);
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

  // Estados del proceso y pago de anticipo con Stripe
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [bookingSuccess, setBookingSuccess] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<'TARJETA' | 'TRANSFERENCIA'>('TARJETA');
  const [stripeLoading, setStripeLoading] = useState<boolean>(false);
  const [stripeError, setStripeError] = useState<string>('');
  const [stripeReturnInfo, setStripeReturnInfo] = useState<{
    status: 'success' | 'cancelled';
    folio?: string;
    amountTotal?: number | null;
    serviceName?: string;
    appointmentDate?: string;
    slot?: string;
  } | null>(null);

  // Verificar regreso desde Stripe Checkout (?payment=success|cancelled)
  useEffect(() => {
    if (paymentStatusParam !== 'success' && paymentStatusParam !== 'cancelled') return;

    if (paymentStatusParam === 'cancelled') {
      setStripeReturnInfo({ status: 'cancelled', folio: folioParam });
      return;
    }

    const verifySession = async () => {
      if (!sessionIdParam) {
        setStripeReturnInfo({ status: 'success', folio: folioParam });
        return;
      }
      try {
        const res = await api.get(`/payments/session/${encodeURIComponent(sessionIdParam)}`);
        if (res.data.success) {
          setStripeReturnInfo({
            status: 'success',
            folio: res.data.metadata?.folio || folioParam,
            amountTotal: res.data.amountTotal,
            serviceName: res.data.metadata?.serviceName,
            appointmentDate: res.data.metadata?.appointmentDate,
            slot: res.data.metadata?.slot,
          });
          return;
        }
      } catch (e) {
        console.error('Error al verificar sesión de Stripe:', e);
      }
      setStripeReturnInfo({ status: 'success', folio: folioParam });
    };

    verifySession();
  }, [paymentStatusParam, sessionIdParam, folioParam]);

  // 1. Cargar servicios (con respaldo oficial si el backend no está conectado)
  useEffect(() => {
    const applyCategories = (cats: any[]) => {
      setCategories(cats);
      if (preselectedServiceId) {
        for (const cat of cats) {
          const found = cat.services?.find((s: any) => s.id === preselectedServiceId);
          if (found) {
            setSelectedService(found);
            break;
          }
        }
      }
    };

    const loadServices = async () => {
      try {
        const res = await api.get('/services');
        if (res.data.success && Array.isArray(res.data.categories) && res.data.categories.length > 0) {
          applyCategories(res.data.categories);
        } else {
          applyCategories(OFFICIAL_SERVICE_CATEGORIES);
        }
      } catch (e) {
        console.error('Error al cargar servicios:', e);
        applyCategories(OFFICIAL_SERVICE_CATEGORIES);
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
        return;
      }
    }
    setSelectedService(null);
  };

  // 2. Consultar disponibilidad cada 2 horas (con cálculo local si el backend no está disponible)
  useEffect(() => {
    const checkAvailability = async () => {
      if (!selectedDate || !selectedServiceId) {
        setAvailableSlots([]);
        setDayInfo('');
        return;
      }
      setLoadingSlots(true);
      setErrorMessage('');
      setSelectedSlot('');

      const applyLocal = () => {
        const local = getLocalAvailability(selectedDate);
        setAvailableSlots(local.slots);
        setDayInfo(local.dayInfo);
      };

      if (selectedService?.isFallback) {
        applyLocal();
        setLoadingSlots(false);
        return;
      }

      try {
        const res = await api.get(`/appointments/availability?date=${selectedDate}&serviceId=${selectedServiceId}`);
        if (res.data.success) {
          setAvailableSlots(res.data.slots || []);
          setDayInfo(res.data.dayInfo || '');
        } else {
          applyLocal();
        }
      } catch {
        applyLocal();
      } finally {
        setLoadingSlots(false);
      }
    };

    checkAvailability();
  }, [selectedDate, selectedServiceId, selectedService]);

  const today = getLocalTodayString();

  const buildLocalWhatsAppUrl = (folio: string, depositAmount: number, methodLabel: string) => {
    const [year, month, day] = selectedDate.split('-').map(Number);
    const appDate = new Date(Date.UTC(year, month - 1, day));
    const formattedDate = appDate.toLocaleDateString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC',
    });

    const rawMessage = `Hola, soy ${customerName.trim()}.

Me gustaría confirmar mi cita y realizar el pago del 10% de anticipo en AURA IA COLOR.

Servicio: ${selectedService?.name}
Fecha: ${formattedDate}
Horario: ${formatSlotLabel(selectedSlot)} (${selectedSlot} hrs.)
Folio: ${folio}
Anticipo del 10%: $${depositAmount.toLocaleString('es-MX')} MXN
Método de pago elegido: ${methodLabel}

Quedo al pendiente para completar mi pago y confirmar mi lugar.`;

    return `https://wa.me/525537293887?text=${encodeURIComponent(rawMessage)}`;
  };

  // Enviar reservación y mostrar pantalla de pago del 10%
  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!selectedServiceId || !selectedService) {
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
    const depositAmount = Math.round(Number(selectedService.price) * 0.1);

    try {
      if (!selectedService.isFallback) {
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
          setBookingSuccess({
            ...res.data,
            depositAmount: res.data.depositAmount ?? depositAmount,
          });
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
      }

      // Respaldo cuando el servicio es local o no hay backend conectado
      const randomSeq = Math.floor(10000 + Math.random() * 89999);
      const localFolio = `AURA-${new Date().getFullYear()}-${randomSeq}`;
      setBookingSuccess({
        success: true,
        folio: localFolio,
        depositAmount,
        whatsappUrl: buildLocalWhatsAppUrl(localFolio, depositAmount, 'Transferencia bancaria / SPEI'),
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      // Si es un error de validación o choque real del servidor (4xx), mostrarlo
      if (err.response && err.response.status >= 400 && err.response.status < 500) {
        setErrorMessage(
          err.response?.data?.error || 'Ocurrió un error al procesar tu solicitud. Intenta nuevamente.'
        );
      } else {
        // Si el backend no responde, confirmar con respaldo local para no bloquear la cita
        const randomSeq = Math.floor(10000 + Math.random() * 89999);
        const localFolio = `AURA-${new Date().getFullYear()}-${randomSeq}`;
        setBookingSuccess({
          success: true,
          folio: localFolio,
          depositAmount,
          whatsappUrl: buildLocalWhatsAppUrl(localFolio, depositAmount, 'Transferencia bancaria / SPEI'),
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleStripeCheckout = async () => {
    if (!bookingSuccess || !selectedService) return;
    setStripeLoading(true);
    setStripeError('');
    try {
      const res = await api.post('/payments/create-checkout-session', {
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        servicePrice: Number(selectedService.price),
        folio: bookingSuccess.folio,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        appointmentDate: selectedDate,
        slot: selectedSlot,
      });

      if (res.data.success && res.data.url) {
        window.location.href = res.data.url;
        return;
      }
      setStripeError('No se pudo obtener el enlace de pago de Stripe.');
    } catch (err: any) {
      setStripeError(
        err.response?.data?.error ||
          'No fue posible conectar con la pasarela de Stripe en este momento. Puedes continuar enviando tu comprobante por WhatsApp.'
      );
    } finally {
      setStripeLoading(false);
    }
  };

  // Pantalla de Regreso desde Stripe Checkout
  if (stripeReturnInfo) {
    const isPaid = stripeReturnInfo.status === 'success';
    const whatsappMessage = isPaid
      ? `Hola, acabo de realizar el pago de mi anticipo del 10% en Stripe para mi cita en AURA IA COLOR.\n\nFolio: ${stripeReturnInfo.folio || 'Confirmado'}${
          stripeReturnInfo.serviceName ? `\nServicio: ${stripeReturnInfo.serviceName}` : ''
        }${stripeReturnInfo.appointmentDate ? `\nFecha: ${stripeReturnInfo.appointmentDate}` : ''}${
          stripeReturnInfo.slot ? `\nHorario: ${stripeReturnInfo.slot} hrs.` : ''
        }`
      : `Hola, intenté realizar el pago con tarjeta en Stripe para mi cita (Folio: ${
          stripeReturnInfo.folio || 'Pendiente'
        }) y me gustaría completar el anticipo del 10%.`;

    return (
      <div className="bg-[#111111] py-16 min-h-[80vh] flex items-center justify-center">
        <div className="max-w-xl mx-auto px-4 w-full">
          <div className="bg-[#171717] border border-[#C6A15B]/50 p-8 sm:p-10 rounded-sm text-center shadow-2xl space-y-6">
            <div className="w-16 h-16 rounded-full bg-[#C6A15B]/20 border border-[#C6A15B] flex items-center justify-center mx-auto">
              {isPaid ? (
                <CheckCircle className="w-8 h-8 text-[#C6A15B]" />
              ) : (
                <AlertCircle className="w-8 h-8 text-[#C6A15B]" />
              )}
            </div>

            <div>
              <span className="text-xs uppercase tracking-[0.25em] text-[#C6A15B] font-semibold block mb-2">
                {isPaid ? 'Anticipo del 10% Confirmado con Stripe' : 'Pago con Tarjeta Cancelado'}
              </span>
              <h1 className="text-2xl sm:text-3xl font-serif text-[#FFFFFF] mb-3">
                {isPaid ? '¡Pago Recibido con Éxito!' : 'Tu pago no se completó'}
              </h1>
              <p className="text-xs sm:text-sm text-[#A3A3A3] font-light leading-relaxed">
                {isPaid
                  ? 'Tu anticipo del 10% quedó registrado y será tomado en cuenta en tu pago final en sucursal. Recuerda que cuentas con 24 horas para cancelar o modificar tu cita (con devolución en un plazo de 24 horas en caso de cancelación).'
                  : 'El cargo no fue realizado. Puedes volver a intentarlo o finalizar tu anticipo del 10% directamente por WhatsApp.'}
              </p>
            </div>

            {stripeReturnInfo.folio && (
              <div className="bg-[#1F1F1F] border border-[#333333] p-4 rounded-sm text-xs space-y-2 text-left">
                <div className="flex justify-between">
                  <span className="text-[#888888]">Folio Oficial:</span>
                  <span className="font-mono text-[#C6A15B] font-bold">{stripeReturnInfo.folio}</span>
                </div>
                {stripeReturnInfo.serviceName && (
                  <div className="flex justify-between">
                    <span className="text-[#888888]">Servicio:</span>
                    <span className="text-[#FFFFFF]">{stripeReturnInfo.serviceName}</span>
                  </div>
                )}
                {typeof stripeReturnInfo.amountTotal === 'number' && (
                  <div className="flex justify-between">
                    <span className="text-[#888888]">Anticipo pagado (10%):</span>
                    <span className="text-[#C6A15B] font-bold">
                      ${stripeReturnInfo.amountTotal.toLocaleString('es-MX')} MXN
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-3">
              <a
                href={`https://wa.me/525537293887?text=${encodeURIComponent(whatsappMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-3 px-6 py-3.5 bg-[#25D366] hover:bg-[#20ba59] text-[#FFFFFF] font-bold text-xs uppercase tracking-widest rounded-sm transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Enviar Confirmación por WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  setStripeReturnInfo(null);
                  setSearchParams({});
                }}
                className="inline-flex items-center gap-1.5 text-xs text-[#C6A15B] hover:text-[#DFBF7E] pt-2 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Volver al formulario de citas</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Pantalla de Confirmación + Pago del 10% de Anticipo + Políticas de 24 horas
  if (bookingSuccess) {
    const servicePrice = Number(selectedService?.price || 0);
    const depositAmount = Number(bookingSuccess.depositAmount ?? Math.round(servicePrice * 0.1));
    const remainingAmount = Math.max(0, servicePrice - depositAmount);
    const methodLabel =
      paymentMethod === 'TARJETA'
        ? 'Tarjeta (Stripe)'
        : 'Transferencia bancaria / SPEI';
    const paymentWhatsappUrl = buildLocalWhatsAppUrl(bookingSuccess.folio, depositAmount, methodLabel);
    const hasStripePublishableKey = Boolean(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

    return (
      <div className="bg-[#111111] py-16 min-h-[80vh] flex items-center justify-center">
        <div className="max-w-2xl mx-auto px-4 w-full">
          <div className="bg-[#171717] border border-[#C6A15B]/50 p-6 sm:p-10 rounded-sm shadow-2xl space-y-7">
            {/* Cabecera de confirmación */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-[#C6A15B]/20 border border-[#C6A15B] flex items-center justify-center mx-auto mb-5">
                <CheckCircle className="w-8 h-8 text-[#C6A15B]" />
              </div>

              <span className="text-xs uppercase tracking-[0.25em] text-[#C6A15B] font-semibold block mb-2">
                Solicitud Registrada • Paso Final: Anticipo del 10%
              </span>
              <h1 className="text-2xl sm:text-3xl font-serif text-[#FFFFFF] mb-3">
                ¡Gracias, {customerName}!
              </h1>
              <p className="text-xs sm:text-sm text-[#A3A3A3] font-light max-w-lg mx-auto leading-relaxed">
                Para asegurar tu horario, realiza el pago del{' '}
                <strong className="text-[#C6A15B]">10% de anticipo</strong>. Este monto será tomado en cuenta y descontado de tu pago final el día de tu cita.
              </p>
            </div>

            {/* Tarjeta de Resumen de Cita y Desglose del 10% */}
            <div className="bg-[#1F1F1F] border border-[#333333] p-5 sm:p-6 rounded-sm space-y-3 text-xs">
              <div className="flex justify-between items-center border-b border-[#2D2D2D] pb-2.5">
                <span className="text-[#888888]">Folio Oficial:</span>
                <span className="font-mono text-sm text-[#C6A15B] font-bold">
                  {bookingSuccess.folio}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#888888]">Servicio:</span>
                <span className="text-[#FFFFFF] font-medium">{selectedService?.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#888888]">Fecha:</span>
                <span className="text-[#FFFFFF]">{selectedDate}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#888888]">Horario:</span>
                <span className="text-[#FFFFFF]">
                  {formatSlotLabel(selectedSlot)} ({selectedSlot} hrs.)
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-[#2D2D2D]">
                <span className="text-[#888888]">
                  Costo total {selectedService?.pricePrefix ? `(${selectedService.pricePrefix.toLowerCase()})` : 'del servicio'}:
                </span>
                <span className="text-[#FFFFFF]">
                  ${servicePrice.toLocaleString('es-MX')} MXN
                </span>
              </div>
              <div className="flex justify-between items-center bg-[#141414] border border-[#C6A15B]/40 px-3.5 py-3 rounded-sm">
                <span className="text-[#DFBF7E] font-semibold uppercase tracking-wider text-[11px]">
                  Anticipo a pagar hoy (10%):
                </span>
                <span className="font-serif text-xl text-[#C6A15B] font-bold">
                  ${depositAmount.toLocaleString('es-MX')} MXN
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px] text-[#888888]">
                <span>Saldo restante en tu visita (se descuenta tu 10%):</span>
                <span className="text-[#E5E5E5] font-medium">
                  ${remainingAmount.toLocaleString('es-MX')} MXN
                </span>
              </div>
            </div>

            {/* Selección de Método de Pago del 10% */}
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-wider text-[#C6A15B] font-semibold">
                Selecciona cómo deseas pagar tu anticipo del 10%
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod('TARJETA');
                    setStripeError('');
                  }}
                  className={`p-4 rounded-sm border text-left transition-all flex items-start gap-3 ${
                    paymentMethod === 'TARJETA'
                      ? 'bg-[#222222] border-[#C6A15B] text-[#FFFFFF]'
                      : 'bg-[#141414] border-[#2D2D2D] text-[#888888] hover:border-[#444444]'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-[#C6A15B] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-[#FFFFFF]">
                      Pago con Tarjeta (Stripe)
                    </p>
                    <p className="text-[11px] text-[#888888] mt-0.5">
                      Paga ${depositAmount.toLocaleString('es-MX')} MXN en línea de forma segura con tarjeta de débito o crédito.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod('TRANSFERENCIA');
                    setStripeError('');
                  }}
                  className={`p-4 rounded-sm border text-left transition-all flex items-start gap-3 ${
                    paymentMethod === 'TRANSFERENCIA'
                      ? 'bg-[#222222] border-[#C6A15B] text-[#FFFFFF]'
                      : 'bg-[#141414] border-[#2D2D2D] text-[#888888] hover:border-[#444444]'
                  }`}
                >
                  <Landmark className="w-5 h-5 text-[#C6A15B] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-[#FFFFFF]">Transferencia / SPEI</p>
                    <p className="text-[11px] text-[#888888] mt-0.5">
                      Recibe los datos bancarios oficiales por WhatsApp y envía tu comprobante.
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {stripeError && (
              <div className="p-3.5 bg-red-950/40 border border-red-500/40 rounded-sm text-red-200 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{stripeError}</span>
              </div>
            )}

            {/* Políticas de Cancelación, Modificación y Devolución (24 horas) */}
            <div className="bg-[#141414] border border-[#C6A15B]/35 rounded-sm p-5 space-y-2.5">
              <div className="flex items-center gap-2 text-[#C6A15B]">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span className="text-xs uppercase tracking-wider font-semibold">
                  Políticas de Anticipo, Cambios y Devolución
                </span>
              </div>
              <ul className="space-y-1.5 text-xs text-[#C5C5C5] font-light leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-[#C6A15B] mt-0.5">•</span>
                  <span>
                    El pago del <strong className="text-[#FFFFFF]">10% de anticipo</strong> (${depositAmount.toLocaleString('es-MX')} MXN) será tomado en cuenta y descontado de tu pago final en el estudio.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#C6A15B] mt-0.5">•</span>
                  <span>
                    Cuentas con <strong className="text-[#FFFFFF]">24 horas de anticipación</strong> para cancelar o modificar la fecha/horario de tu cita.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#C6A15B] mt-0.5">•</span>
                  <span>
                    En caso de cancelación, se cuenta con un plazo máximo de <strong className="text-[#FFFFFF]">24 horas</strong> para realizar la devolución de tu dinero.
                  </span>
                </li>
              </ul>
            </div>

            {/* Botones de Acción */}
            <div className="text-center space-y-3 pt-1">
              {paymentMethod === 'TARJETA' && (
                <button
                  type="button"
                  onClick={handleStripeCheckout}
                  disabled={stripeLoading}
                  className="w-full inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#C6A15B] hover:bg-[#DFBF7E] text-[#111111] font-bold text-xs uppercase tracking-widest rounded-sm transition-all shadow-lg disabled:opacity-50"
                >
                  <CreditCard className="w-5 h-5" />
                  <span>
                    {stripeLoading
                      ? 'Conectando con Stripe...'
                      : `Pagar 10% (${`$${depositAmount.toLocaleString('es-MX')} MXN`}) con Stripe`}
                  </span>
                </button>
              )}

              <a
                href={paymentWhatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#25D366] hover:bg-[#20ba59] text-[#FFFFFF] font-bold text-xs uppercase tracking-widest rounded-sm transition-all shadow-lg"
              >
                <MessageSquare className="w-5 h-5" />
                <span>
                  {paymentMethod === 'TARJETA'
                    ? 'Confirmar / Solicitar Enlace por WhatsApp'
                    : `Realizar Pago del 10% ($${depositAmount.toLocaleString('es-MX')} MXN) por WhatsApp`}
                </span>
              </a>

              {hasStripePublishableKey && paymentMethod === 'TARJETA' && (
                <p className="text-[10px] text-[#777777] font-mono">
                  Pasarela segura procesada por Stripe (Modo Prueba)
                </p>
              )}

              <button
                type="button"
                onClick={() => {
                  setBookingSuccess(null);
                  setSelectedSlot('');
                }}
                className="inline-flex items-center gap-1.5 text-xs text-[#C6A15B] hover:text-[#DFBF7E] pt-2 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Agendar otra cita</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#111111] py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Encabezado con efecto dinámico en títulos */}
        <div className="text-center mb-12">
          <span className="text-xs uppercase tracking-[0.25em] text-[#C6A15B] font-medium block mb-2">
            Reservaciones en Línea
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif text-[#FFFFFF] mb-4 tracking-tight">
            <span className="relative inline-block">
              <span className="slogan-multicolor-flow font-serif font-extrabold tracking-wide">
                Agenda tu Experiencia de Color
              </span>
              <span className="absolute -bottom-2 left-1/4 right-1/4 h-[2px] bg-gradient-to-r from-transparent via-[#C6A15B] to-transparent shadow-[0_0_8px_#C6A15B]" />
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-[#888888] font-light max-w-xl mx-auto">
            Selecciona tu servicio, consulta los horarios disponibles cada 2 horas y aparta tu cita con el 10% de anticipo.
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
                        {s.name} — {s.pricePrefix ? `${s.pricePrefix} ` : ''}${s.price.toLocaleString('es-MX')} MXN ({s.durationMinutes} min)
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>

              {selectedService && (
                <div className="p-4 bg-[#1F1F1F] border border-[#2D2D2D] rounded-sm text-xs text-[#888888] flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                  <div>
                    <p className="text-[#FFFFFF] font-medium">{selectedService.name}</p>
                    <p className="font-light mt-0.5">{selectedService.description}</p>
                  </div>
                  <div className="sm:text-right shrink-0 sm:ml-4">
                    <span className="font-serif text-base text-[#C6A15B] font-bold block">
                      {selectedService.pricePrefix ? `${selectedService.pricePrefix} ` : ''}
                      ${selectedService.price.toLocaleString('es-MX')} MXN
                    </span>
                    <span className="text-[10px] block">
                      Anticipo (10%): ${Math.round(selectedService.price * 0.1).toLocaleString('es-MX')} MXN
                    </span>
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
                <p className="text-[11px] text-[#888888] mt-2 leading-relaxed">
                  * Citas cada 2 horas: Martes a Sábado de 10:00 a.m. a 8:00 p.m. (última cita 6:00 p.m.). Domingos de 10:00 a.m. a 4:00 p.m. (última cita 2:00 p.m.). Lunes cerrado.
                </p>
                {dayInfo && (
                  <p className="text-xs text-[#C6A15B] mt-2 font-medium">{dayInfo}</p>
                )}
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#888888] mb-2">
                  Horarios Disponibles (Citas cada 2 hrs)
                </label>
                {loadingSlots ? (
                  <div className="text-xs text-[#888888] py-8 text-center">Consultando disponibilidad en tiempo real...</div>
                ) : !selectedServiceId ? (
                  <div className="text-xs text-[#666666] py-8 text-center border border-dashed border-[#2A2A2A] rounded">
                    Selecciona un servicio primero
                  </div>
                ) : !selectedDate ? (
                  <div className="text-xs text-[#666666] py-8 text-center border border-dashed border-[#2A2A2A] rounded">
                    Selecciona una fecha primero
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="text-xs text-[#C6A15B] py-8 px-4 text-center border border-[#2A2A2A] rounded">
                    No hay horarios disponibles para esta fecha o el salón se encuentra cerrado.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {availableSlots.map((slot) => (
                      <button
                        type="button"
                        key={slot.time}
                        disabled={!slot.available}
                        onClick={() => setSelectedSlot(slot.time)}
                        className={`py-2.5 px-3 text-xs rounded text-center transition-all flex items-center justify-center gap-1.5 ${
                          !slot.available
                            ? 'bg-[#181818] text-[#444444] cursor-not-allowed line-through'
                            : selectedSlot === slot.time
                            ? 'bg-[#C6A15B] text-[#111111] font-bold shadow'
                            : 'bg-[#222222] text-[#F5F1E9] hover:border-[#C6A15B] border border-[#333333]'
                        }`}
                      >
                        <Clock className="w-3 h-3 shrink-0" />
                        <span>{formatSlotLabel(slot.time)}</span>
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
              <span>3. Tus Datos de Contacto</span>
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
              Estas imágenes son estrictamente privadas, no se publican y solo las verá el equipo de estilistas especialistas en colorimetría para preparar la máquina de formulación antes de tu llegada.
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

          {/* PASO 5: Aviso de Privacidad, Política de Anticipo y Botón de Envío */}
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
                Acepto el <strong className="text-[#FFFFFF]">Aviso de Privacidad</strong> y consiento el tratamiento confidencial de mis datos personales y fotografías capilares para la gestión exclusiva de mi reservación en AURA IA COLOR conforme a la Ley. Entiendo que al confirmar se requiere un anticipo del 10% (tomado en cuenta en mi pago final) y que cuento con 24 horas para cancelar o modificar mi cita.
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
                  <span>Confirmar Cita y Pasar a Pago (10%)</span>
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
