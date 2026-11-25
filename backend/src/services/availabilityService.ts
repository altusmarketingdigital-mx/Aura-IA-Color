import prisma from '../config/prisma';

export interface TimeSlot {
  time: string;
  available: boolean;
  reason?: string;
}

/**
 * Convierte cadena "HH:mm" a minutos desde la medianoche
 */
export function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Convierte minutos desde la medianoche a cadena "HH:mm"
 */
export function minutesToTime(mins: number): string {
  const hours = Math.floor(mins / 60);
  const minutes = mins % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

/**
 * Genera folio correlativo único AURA-YYYY-XXXXX
 */
export async function generateFolio(): Promise<string> {
  const currentYear = new Date().getFullYear();
  const prefix = `AURA-${currentYear}-`;

  const lastAppointment = await prisma.appointment.findFirst({
    where: { folio: { startsWith: prefix } },
    orderBy: { createdAt: 'desc' },
    select: { folio: true },
  });

  let nextSequence = 1;
  if (lastAppointment && lastAppointment.folio) {
    const parts = lastAppointment.folio.split('-');
    if (parts.length === 3) {
      const seq = parseInt(parts[2], 10);
      if (!isNaN(seq)) {
        nextSequence = seq + 1;
      }
    }
  }

  return `${prefix}${nextSequence.toString().padStart(5, '0')}`;
}

/**
 * Calcula los slots disponibles para una fecha y servicio
 */
export async function calculateAvailability(dateStr: string, serviceId: string): Promise<{
  isOpen: boolean;
  slots: TimeSlot[];
  dayInfo: string;
}> {
  // Parsing de fecha: YYYY-MM-DD
  const [year, month, day] = dateStr.split('-').map(Number);
  const targetDate = new Date(Date.UTC(year, month - 1, day));
  const dayOfWeek = targetDate.getUTCDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado

  // 1. Obtener horario oficial para ese día de la semana
  const businessHour = await prisma.businessHours.findUnique({
    where: { dayOfWeek },
  });

  if (!businessHour || !businessHour.isOpen) {
    return {
      isOpen: false,
      slots: [],
      dayInfo: dayOfWeek === 1 ? 'Los días lunes el salón permanece cerrado.' : 'Cerrado en este día',
    };
  }

  // 2. Obtener duración del servicio
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
  });

  if (!service || !service.isActive) {
    throw new Error('Servicio no encontrado o inactivo');
  }

  const serviceTotalMinutes = service.durationMinutes + service.bufferMinutes;

  // 3. Obtener citas confirmadas de ese día
  const startOfDay = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
  const endOfDay = new Date(Date.UTC(year, month - 1, day, 23, 59, 59));

  const confirmedAppointments = await prisma.appointment.findMany({
    where: {
      appointmentDate: {
        gte: startOfDay,
        lte: endOfDay,
      },
      status: 'CONFIRMED',
    },
    include: {
      service: {
        select: { durationMinutes: true, bufferMinutes: true },
      },
    },
  });

  // 4. Obtener bloqueos de horario de ese día
  const blockedSlots = await prisma.blockedSlot.findMany({
    where: { date: dateStr },
  });

  // 5. Generar slots cada 2 horas (120 min), dejando como última cita 2 hrs antes del cierre
  // Martes a Sábado (10:00 - 20:00 -> última cita 18:00), Domingo (10:00 - 16:00 -> última cita 14:00)
  const openMins = timeToMinutes(businessHour.openTime);
  const closeMins = timeToMinutes(businessHour.closeTime);
  const slots: TimeSlot[] = [];

  for (let slotTime = openMins; slotTime <= closeMins - 120; slotTime += 120) {
    const slotEndTime = slotTime + serviceTotalMinutes;
    let isAvailable = true;
    let reason = '';

    // Validar contra citas confirmadas
    for (const app of confirmedAppointments) {
      const appDate = new Date(app.appointmentDate);
      // Minutos locales de la cita
      const appStartMins = appDate.getUTCHours() * 60 + appDate.getUTCMinutes();
      const appDuration = (app.service?.durationMinutes || app.durationMinutes) + (app.service?.bufferMinutes || 15);
      const appEndMins = appStartMins + appDuration;

      // Choque de intervalos: max(start1, start2) < min(end1, end2)
      if (Math.max(slotTime, appStartMins) < Math.min(slotEndTime, appEndMins)) {
        isAvailable = false;
        reason = 'Horario reservado';
        break;
      }
    }

    // Validar contra bloqueos administrativos si aún sigue disponible
    if (isAvailable) {
      for (const block of blockedSlots) {
        const bStart = timeToMinutes(block.startTime);
        const bEnd = timeToMinutes(block.endTime);
        if (Math.max(slotTime, bStart) < Math.min(slotEndTime, bEnd)) {
          isAvailable = false;
          reason = `Bloqueado: ${block.reason}`;
          break;
        }
      }
    }

    slots.push({
      time: minutesToTime(slotTime),
      available: isAvailable,
      reason: isAvailable ? undefined : reason,
    });
  }

  return {
    isOpen: true,
    slots,
    dayInfo: `Horario regular de ${businessHour.openTime} a ${businessHour.closeTime} hrs.`,
  };
}
