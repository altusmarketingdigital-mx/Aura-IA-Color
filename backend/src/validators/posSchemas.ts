import { z } from 'zod';

export const createClientSchema = z.object({
  name: z.string().trim().min(2, 'El nombre del cliente debe tener al menos 2 caracteres'),
  phone: z
    .string()
    .trim()
    .min(10, 'El teléfono debe tener al menos 10 dígitos')
    .max(20, 'El teléfono no puede exceder 20 caracteres'),
  email: z.string().trim().email('Correo electrónico inválido').optional().or(z.literal('')),
});

export const updateClientSchema = createClientSchema.partial();

export const adjustClientPointsSchema = z.object({
  pointsDelta: z.number().int('Los puntos deben ser un número entero'),
  visitsDelta: z.number().int('Las visitas deben ser un número entero').default(0),
  description: z.string().trim().min(3, 'Debes indicar un motivo para el ajuste'),
});

export const catalogItemSchema = z.object({
  name: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres'),
  category: z.enum(['Servicio', 'Producto'], {
    errorMap: () => ({ message: 'La categoría debe ser "Servicio" o "Producto"' }),
  }),
  price: z.number().nonnegative('El precio no puede ser negativo'),
  pointsAwarded: z.number().int('Los puntos deben ser enteros').nonnegative('Los puntos no pueden ser negativos'),
  active: z.boolean().default(true),
});

export const rewardSchema = z.object({
  title: z.string().trim().min(3, 'El título debe tener al menos 3 caracteres'),
  description: z.string().trim().min(5, 'La descripción debe tener al menos 5 caracteres'),
  requiredPoints: z.number().int('Los puntos requeridos deben ser enteros').positive('Los puntos requeridos deben ser mayores a cero'),
  discountType: z.enum(['percentage', 'fixed', 'free_service'], {
    errorMap: () => ({ message: 'Tipo de descuento inválido (percentage | fixed | free_service)' }),
  }),
  discountValue: z.number().nonnegative('El valor del descuento no puede ser negativo'),
  active: z.boolean().default(true),
});

export const posCartItemSchema = z.object({
  id: z.string().min(1, 'ID de ítem requerido'),
  quantity: z.number().int().positive('La cantidad debe ser al menos 1').max(50, 'Cantidad máxima por ítem excedida'),
});

export const createPosTransactionSchema = z.object({
  idempotencyKey: z.string().uuid('idempotency_key debe ser un UUID v4 válido'),
  clientId: z.string().uuid('client_id inválido'),
  items: z.array(posCartItemSchema).min(1, 'Debes agregar al menos un servicio o producto al carrito'),
  rewardId: z.string().uuid('reward_id inválido').nullable().optional(),
  notes: z.string().trim().max(500, 'Las notas no pueden exceder 500 caracteres').optional().or(z.literal('')),
});
