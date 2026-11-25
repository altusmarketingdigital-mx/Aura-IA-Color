import { Request, Response } from 'express';
import Stripe from 'stripe';
import { z } from 'zod';
import prisma from '../config/prisma';

const checkoutSessionSchema = z.object({
  serviceId: z.string().optional(),
  serviceName: z.string().min(1, 'El nombre del servicio es requerido'),
  servicePrice: z.number().positive('El precio del servicio debe ser positivo'),
  folio: z.string().min(3, 'El folio es requerido'),
  customerName: z.string().min(2, 'El nombre del cliente es requerido'),
  customerEmail: z.string().email().optional().or(z.literal('')),
  appointmentDate: z.string().min(1, 'La fecha es requerida'),
  slot: z.string().min(1, 'El horario es requerido'),
});

const getStripeClient = (): Stripe => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY no está configurada en el servidor');
  }
  return new Stripe(secretKey);
};

/**
 * Retorna la clave publicable de Stripe configurada
 */
export const getStripeConfig = (_req: Request, res: Response): void => {
  const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY || '';
  res.json({
    success: true,
    publishableKey,
    enabled: Boolean(publishableKey && process.env.STRIPE_SECRET_KEY),
  });
};

/**
 * Crea una sesión de Stripe Checkout para cobrar el 10% de anticipo de la cita
 */
export const createCheckoutSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const parse = checkoutSessionSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ success: false, error: parse.error.errors[0].message });
      return;
    }

    const {
      serviceId,
      serviceName,
      servicePrice,
      folio,
      customerName,
      customerEmail,
      appointmentDate,
      slot,
    } = parse.data;

    // Verificar precio autoritativo desde base de datos si el serviceId es un UUID válido
    let authoritativeName = serviceName;
    let authoritativePrice = servicePrice;

    if (serviceId && /^[0-9a-f-]{36}$/i.test(serviceId)) {
      const dbService = await prisma.service.findUnique({ where: { id: serviceId } });
      if (dbService && dbService.isActive) {
        authoritativeName = dbService.name;
        authoritativePrice = dbService.price;
      }
    }

    const depositAmount = Math.round(authoritativePrice * 0.1);
    const unitAmountCentavos = Math.max(1000, Math.round(authoritativePrice * 100 * 0.1));

    const stripe = getStripeClient();
    const frontendBaseUrl = (process.env.FRONTEND_URL || process.env.CORS_ORIGIN || 'http://localhost:5173')
      .split(',')[0]
      .trim()
      .replace(/\/$/, '');

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: customerEmail && customerEmail.trim() ? customerEmail.trim() : undefined,
      line_items: [
        {
          price_data: {
            currency: 'mxn',
            unit_amount: unitAmountCentavos,
            product_data: {
              name: `Anticipo 10% — ${authoritativeName}`,
              description: `Folio ${folio} | Cita: ${appointmentDate} (${slot} hrs). Se toma en cuenta en tu pago final. Cancelación o cambio con 24 hrs de anticipación; devolución en 24 hrs.`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        folio,
        serviceName: authoritativeName,
        servicePrice: String(authoritativePrice),
        depositAmount: String(depositAmount),
        appointmentDate,
        slot,
        customerName,
      },
      success_url: `${frontendBaseUrl}/reservar?payment=success&folio=${encodeURIComponent(folio)}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendBaseUrl}/reservar?payment=cancelled&folio=${encodeURIComponent(folio)}`,
    });

    res.json({
      success: true,
      sessionId: session.id,
      url: session.url,
      depositAmount,
    });
  } catch (error: any) {
    console.error('Error al crear sesión de Stripe:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'No se pudo iniciar la sesión de pago con Stripe',
    });
  }
};

/**
 * Consulta el estado de una sesión de Stripe Checkout al regresar de la pasarela
 */
export const getCheckoutSessionStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;
    if (!sessionId) {
      res.status(400).json({ success: false, error: 'sessionId requerido' });
      return;
    }

    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    res.json({
      success: true,
      status: session.status,
      paymentStatus: session.payment_status,
      amountTotal: session.amount_total ? session.amount_total / 100 : null,
      currency: session.currency,
      metadata: session.metadata,
    });
  } catch (error: any) {
    console.error('Error al verificar sesión de Stripe:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error al consultar el estado del pago',
    });
  }
};

/**
 * Webhook oficial de Stripe (opcional para confirmación asíncrona)
 */
export const handleStripeWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const stripe = getStripeClient();
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let event: Stripe.Event;

    if (webhookSecret && req.headers['stripe-signature']) {
      event = stripe.webhooks.constructEvent(
        req.body,
        req.headers['stripe-signature'],
        webhookSecret
      );
    } else {
      event = JSON.parse(req.body.toString('utf8'));
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const folio = session.metadata?.folio;
      if (folio) {
        await prisma.activityLog.create({
          data: {
            action: 'STRIPE_DEPOSIT_PAID',
            entity: 'Appointment',
            details: `Anticipo 10% pagado vía Stripe para folio ${folio} (Sesión ${session.id})`,
          },
        });
      }
    }

    res.json({ received: true });
  } catch (error: any) {
    console.error('Error en webhook de Stripe:', error.message);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
};
