import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import prisma from '../config/prisma';
import { createAppointmentSchema } from '../validators/schemas';
import { calculateAvailability, generateFolio } from '../services/availabilityService';
import { AuthRequest } from '../middleware/auth';

/**
 * Consulta de disponibilidad pública
 */
export const getAvailability = async (req: Request, res: Response): Promise<void> => {
  try {
    const { date, serviceId } = req.query;

    if (!date || !serviceId) {
      res.status(400).json({ success: false, error: 'Parámetros "date" y "serviceId" requeridos' });
      return;
    }

    const result = await calculateAvailability(String(date), String(serviceId));
    res.json({ success: true, ...result });
  } catch (error: any) {
    console.error('Error al consultar disponibilidad:', error);
    res.status(500).json({ success: false, error: error.message || 'Error al calcular disponibilidad' });
  }
};

/**
 * Solicitud de Cita Pública
 */
export const createAppointment = async (req: Request, res: Response): Promise<void> => {
  try {
    const parse = createAppointmentSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ success: false, error: parse.error.errors[0].message });
      return;
    }

    const { customerName, customerPhone, customerEmail, serviceId, appointmentDate, clientNotes } = parse.data;

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service || !service.isActive) {
      res.status(400).json({ success: false, error: 'El servicio seleccionado no está disponible' });
      return;
    }

    // 1. Validar que el slot siga disponible
    const appDate = new Date(appointmentDate);
    const dateStr = appDate.toISOString().split('T')[0];
    const availability = await calculateAvailability(dateStr, serviceId);

    const hours = appDate.getUTCHours().toString().padStart(2, '0');
    const mins = appDate.getUTCMinutes().toString().padStart(2, '0');
    const reqSlot = `${hours}:${mins}`;

    const matchingSlot = availability.slots.find((s) => s.time === reqSlot);
    if (!matchingSlot || !matchingSlot.available) {
      res.status(409).json({
        success: false,
        error: 'El horario seleccionado acaba de ocuparse o no está disponible. Por favor elige otro.',
      });
      return;
    }

    // 2. Transacción de creación de cliente (o búsqueda) + cita + fotos
    const folio = await generateFolio();

    const appointment = await prisma.$transaction(async (tx) => {
      // Buscar cliente por teléfono para unificar historial
      let customer = await tx.customer.findFirst({
        where: { phone: customerPhone.trim() },
      });

      if (!customer) {
        customer = await tx.customer.create({
          data: {
            name: customerName.trim(),
            phone: customerPhone.trim(),
            email: customerEmail?.trim() || null,
          },
        });
      }

      // Crear cita en estado PENDING
      const newApp = await tx.appointment.create({
        data: {
          folio,
          customerId: customer.id,
          serviceId,
          appointmentDate: appDate,
          durationMinutes: service.durationMinutes,
          status: 'PENDING',
          clientNotes: clientNotes?.trim() || null,
        },
        include: {
          service: true,
          customer: true,
        },
      });

      // Procesar fotos adjuntas
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      if (files) {
        if (files['currentPhoto'] && files['currentPhoto'][0]) {
          const f = files['currentPhoto'][0];
          await tx.appointmentPhoto.create({
            data: {
              appointmentId: newApp.id,
              photoType: 'CURRENT',
              filePath: f.filename,
              originalName: f.originalname,
              mimeType: f.mimetype,
              fileSize: f.size,
            },
          });
        }

        if (files['referencePhoto'] && files['referencePhoto'][0]) {
          const f = files['referencePhoto'][0];
          await tx.appointmentPhoto.create({
            data: {
              appointmentId: newApp.id,
              photoType: 'REFERENCE',
              filePath: f.filename,
              originalName: f.originalname,
              mimeType: f.mimetype,
              fileSize: f.size,
            },
          });
        }
      }

      return newApp;
    });

    // 3. Formatear mensaje oficial de WhatsApp wa.me con cálculo de anticipo del 10%
    const businessPhone = process.env.BUSINESS_PHONE || '525537293887';
    const depositAmount = Math.round(service.price * 0.1);
    const formattedDate = appDate.toLocaleDateString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC',
    });

    const rawMessage = `Hola, soy ${customerName}.

Me gustaría confirmar mi cita y realizar el pago del 10% de anticipo en AURA IA COLOR.

Servicio: ${service.name}
Fecha: ${formattedDate}
Horario: ${reqSlot} hrs.
Folio: ${folio}
Anticipo del 10%: $${depositAmount.toLocaleString('es-MX')} MXN

Quedo al pendiente para completar mi pago y confirmar mi lugar.`;

    const encodedMessage = encodeURIComponent(rawMessage);
    const whatsappUrl = `https://wa.me/${businessPhone}?text=${encodedMessage}`;

    res.status(201).json({
      success: true,
      folio,
      depositAmount,
      depositPercentage: 10,
      appointment,
      whatsappUrl,
      message: 'Solicitud de cita registrada exitosamente con estado PENDIENTE',
    });
  } catch (error: any) {
    console.error('Error al crear reservación:', error);
    res.status(500).json({ success: false, error: error.message || 'Error al procesar la cita' });
  }
};

/**
 * Endpoints Administrativos
 */
export const getAdminAppointments = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, search, dateFrom, dateTo } = req.query;

    const whereClause: any = {};

    if (status && status !== 'ALL') {
      whereClause.status = String(status);
    }

    if (search) {
      const q = String(search).trim();
      whereClause.OR = [
        { folio: { contains: q } },
        { customer: { name: { contains: q } } },
        { customer: { phone: { contains: q } } },
      ];
    }

    if (dateFrom || dateTo) {
      whereClause.appointmentDate = {};
      if (dateFrom) whereClause.appointmentDate.gte = new Date(String(dateFrom));
      if (dateTo) whereClause.appointmentDate.lte = new Date(String(dateTo));
    }

    const appointments = await prisma.appointment.findMany({
      where: whereClause,
      orderBy: { appointmentDate: 'desc' },
      include: {
        customer: true,
        service: true,
        photos: true,
      },
    });

    res.json({ success: true, appointments });
  } catch (error) {
    console.error('Error al listar citas admin:', error);
    res.status(500).json({ success: false, error: 'Error al consultar citas' });
  }
};

export const getAdminAppointmentById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        customer: true,
        service: true,
        photos: true,
      },
    });

    if (!appointment) {
      res.status(404).json({ success: false, error: 'Cita no encontrada' });
      return;
    }

    res.json({ success: true, appointment });
  } catch (error) {
    console.error('Error al obtener cita admin:', error);
    res.status(500).json({ success: false, error: 'Error al consultar la cita' });
  }
};

/**
 * Servir fotos privadas de clientes con autorización
 */
export const getAppointmentPhoto = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id, photoId } = req.params;

    const photo = await prisma.appointmentPhoto.findFirst({
      where: { id: photoId, appointmentId: id },
    });

    if (!photo) {
      res.status(404).json({ success: false, error: 'Fotografía no encontrada' });
      return;
    }

    const filePath = path.resolve(__dirname, '../../uploads/private', photo.filePath);
    if (!fs.existsSync(filePath)) {
      res.status(404).json({ success: false, error: 'Archivo no encontrado en almacenamiento' });
      return;
    }

    res.setHeader('Content-Type', photo.mimeType);
    res.sendFile(filePath);
  } catch (error) {
    console.error('Error al servir foto de cita:', error);
    res.status(500).json({ success: false, error: 'Error al obtener imagen' });
  }
};

/**
 * Confirmar cita
 */
export const confirmAppointment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const app = await prisma.appointment.findUnique({
      where: { id },
      include: { service: true },
    });

    if (!app) {
      res.status(404).json({ success: false, error: 'Cita no encontrada' });
      return;
    }

    // Revalidación atómica de choque de horarios con otra cita ya CONFIRMED
    const dateStr = app.appointmentDate.toISOString().split('T')[0];
    const availability = await calculateAvailability(dateStr, app.serviceId);

    const hours = app.appointmentDate.getUTCHours().toString().padStart(2, '0');
    const mins = app.appointmentDate.getUTCMinutes().toString().padStart(2, '0');
    const slot = `${hours}:${mins}`;

    const isSlotAvailable = availability.slots.some((s) => s.time === slot && s.available);

    if (!isSlotAvailable) {
      res.status(409).json({
        success: false,
        error: 'No es posible confirmar la cita: existe un conflicto de horario con otra cita confirmada o bloqueo.',
      });
      return;
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: { status: 'CONFIRMED' },
      include: { customer: true, service: true },
    });

    await prisma.activityLog.create({
      data: {
        userId: req.user?.id,
        action: 'CONFIRM_APPOINTMENT',
        entity: 'Appointment',
        entityId: id,
        details: `Cita confirmada folio ${app.folio}`,
      },
    });

    res.json({ success: true, appointment: updated, message: 'Cita confirmada exitosamente' });
  } catch (error) {
    console.error('Error al confirmar cita:', error);
    res.status(500).json({ success: false, error: 'Error al confirmar la cita' });
  }
};

/**
 * Rechazar / Cancelar cita
 */
export const updateAppointmentStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    if (!['REJECTED', 'CANCELLED', 'COMPLETED'].includes(status)) {
      res.status(400).json({ success: false, error: 'Estado no válido' });
      return;
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        status,
        rejectionReason: reason || null,
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: req.user?.id,
        action: `CHANGE_STATUS_${status}`,
        entity: 'Appointment',
        entityId: id,
        details: reason ? `Motivo: ${reason}` : undefined,
      },
    });

    res.json({ success: true, appointment: updated, message: `Cita actualizada a ${status}` });
  } catch (error) {
    console.error('Error al actualizar estado de cita:', error);
    res.status(500).json({ success: false, error: 'Error al actualizar cita' });
  }
};

/**
 * Reprogramar cita
 */
export const rescheduleAppointment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { newDate } = req.body;

    if (!newDate) {
      res.status(400).json({ success: false, error: 'Nueva fecha y hora requerida' });
      return;
    }

    const app = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!app) {
      res.status(404).json({ success: false, error: 'Cita no encontrada' });
      return;
    }

    const targetDate = new Date(newDate);
    const dateStr = targetDate.toISOString().split('T')[0];
    const availability = await calculateAvailability(dateStr, app.serviceId);

    const hours = targetDate.getUTCHours().toString().padStart(2, '0');
    const mins = targetDate.getUTCMinutes().toString().padStart(2, '0');
    const slot = `${hours}:${mins}`;

    const matchingSlot = availability.slots.find((s) => s.time === slot);
    if (!matchingSlot || !matchingSlot.available) {
      res.status(409).json({
        success: false,
        error: 'El nuevo horario seleccionado no está disponible.',
      });
      return;
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        appointmentDate: targetDate,
        status: 'CONFIRMED',
      },
      include: { customer: true, service: true },
    });

    await prisma.activityLog.create({
      data: {
        userId: req.user?.id,
        action: 'RESCHEDULE_APPOINTMENT',
        entity: 'Appointment',
        entityId: id,
        details: `Reprogramada a ${targetDate.toISOString()}`,
      },
    });

    res.json({ success: true, appointment: updated, message: 'Cita reprogramada con éxito' });
  } catch (error) {
    console.error('Error al reprogramar cita:', error);
    res.status(500).json({ success: false, error: 'Error al reprogramar la cita' });
  }
};
