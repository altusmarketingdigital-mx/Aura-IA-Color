import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Correo electrónico no válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export const createAppointmentSchema = z.object({
  customerName: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  customerPhone: z.string().min(10, 'El teléfono debe tener al menos 10 dígitos'),
  customerEmail: z.string().email('Correo electrónico inválido').optional().or(z.literal('')),
  serviceId: z.string().uuid('ID de servicio inválido'),
  appointmentDate: z.string().datetime('Formato de fecha inválido ISO 8601'),
  clientNotes: z.string().max(500).optional(),
  acceptedPrivacy: z.preprocess((val) => val === 'true' || val === true, z.literal(true, {
    errorMap: () => ({ message: 'Debes aceptar el aviso de privacidad para continuar' })
  })),
});

export const serviceSchema = z.object({
  categoryId: z.string().uuid('Categoría inválida'),
  name: z.string().min(3, 'El nombre del servicio debe tener al menos 3 caracteres'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  durationMinutes: z.number().int().positive('La duración debe ser positiva'),
  price: z.number().positive('El precio debe ser un número positivo'),
  bufferMinutes: z.number().int().nonnegative().default(15),
  image: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
});

export const customerSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  phone: z.string().min(10, 'El teléfono debe tener al menos 10 dígitos'),
  email: z.string().email().optional().or(z.literal('')),
  notes: z.string().optional().nullable(),
});

export const blockedSlotSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha YYYY-MM-DD'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Formato HH:mm'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Formato HH:mm'),
  reason: z.string().min(3, 'Debes ingresar un motivo de bloqueo'),
});
