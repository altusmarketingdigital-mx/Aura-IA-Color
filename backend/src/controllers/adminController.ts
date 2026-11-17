import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { customerSchema, blockedSlotSchema } from '../validators/schemas';
import { AuthRequest } from '../middleware/auth';

/**
 * Clientes
 */
export const getCustomers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search } = req.query;
    const where: any = {};
    if (search) {
      const q = String(search).trim();
      where.OR = [
        { name: { contains: q } },
        { phone: { contains: q } },
        { email: { contains: q } },
      ];
    }

    const customers = await prisma.customer.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        appointments: {
          select: {
            id: true,
            folio: true,
            appointmentDate: true,
            status: true,
            service: { select: { name: true, price: true } },
          },
        },
      },
    });

    res.json({ success: true, customers });
  } catch (error) {
    console.error('Error al listar clientes:', error);
    res.status(500).json({ success: false, error: 'Error al obtener clientes' });
  }
};

export const updateCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const parse = customerSchema.partial().safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ success: false, error: parse.error.errors[0].message });
      return;
    }

    const updated = await prisma.customer.update({
      where: { id },
      data: parse.data,
    });

    res.json({ success: true, customer: updated });
  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    res.status(500).json({ success: false, error: 'Error al actualizar datos del cliente' });
  }
};

/**
 * Galería
 */
export const getGallery = async (_req: Request, res: Response): Promise<void> => {
  try {
    const items = await prisma.gallery.findMany({
      where: { isPublished: true },
      orderBy: { displayOrder: 'asc' },
    });
    res.json({ success: true, items });
  } catch (error) {
    console.error('Error al consultar galería:', error);
    res.status(500).json({ success: false, error: 'Error al consultar galería' });
  }
};

export const createGalleryItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, category, imageUrl, beforeImage, isPublished, displayOrder } = req.body;
    const item = await prisma.gallery.create({
      data: {
        title,
        category,
        imageUrl,
        beforeImage: beforeImage || null,
        isPublished: isPublished !== undefined ? isPublished : true,
        displayOrder: displayOrder ? Number(displayOrder) : 0,
      },
    });
    res.status(201).json({ success: true, item });
  } catch (error) {
    console.error('Error al agregar a galería:', error);
    res.status(500).json({ success: false, error: 'Error al agregar elemento' });
  }
};

/**
 * Promociones
 */
export const getPromotions = async (_req: Request, res: Response): Promise<void> => {
  try {
    const promotions = await prisma.promotion.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, promotions });
  } catch (error) {
    console.error('Error al consultar promociones:', error);
    res.status(500).json({ success: false, error: 'Error al consultar promociones' });
  }
};

export const updatePromotion = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updated = await prisma.promotion.update({
      where: { id },
      data: req.body,
    });
    res.json({ success: true, promotion: updated });
  } catch (error) {
    console.error('Error al actualizar promoción:', error);
    res.status(500).json({ success: false, error: 'Error al actualizar promoción' });
  }
};

/**
 * Bloqueos de Horario
 */
export const getBlockedSlots = async (_req: Request, res: Response): Promise<void> => {
  try {
    const slots = await prisma.blockedSlot.findMany({
      orderBy: { date: 'asc' },
    });
    res.json({ success: true, slots });
  } catch (error) {
    console.error('Error al consultar bloqueos:', error);
    res.status(500).json({ success: false, error: 'Error al consultar bloqueos' });
  }
};

export const createBlockedSlot = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const parse = blockedSlotSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ success: false, error: parse.error.errors[0].message });
      return;
    }

    const slot = await prisma.blockedSlot.create({
      data: {
        ...parse.data,
        userId: req.user?.id,
      },
    });

    res.status(201).json({ success: true, slot });
  } catch (error) {
    console.error('Error al crear bloqueo:', error);
    res.status(500).json({ success: false, error: 'Error al crear bloqueo' });
  }
};

export const deleteBlockedSlot = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.blockedSlot.delete({ where: { id } });
    res.json({ success: true, message: 'Bloqueo eliminado' });
  } catch (error) {
    console.error('Error al eliminar bloqueo:', error);
    res.status(500).json({ success: false, error: 'Error al eliminar bloqueo' });
  }
};

/**
 * Dashboard KPIs
 */
export const getDashboardStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const now = new Date();
    const startOfToday = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0));
    const endOfToday = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59));

    const [todayCount, pendingCount, confirmedCount, cancelledCount, upcomingAppointments, recentLogs] = await Promise.all([
      prisma.appointment.count({
        where: {
          appointmentDate: { gte: startOfToday, lte: endOfToday },
        },
      }),
      prisma.appointment.count({ where: { status: 'PENDING' } }),
      prisma.appointment.count({ where: { status: 'CONFIRMED' } }),
      prisma.appointment.count({ where: { status: 'CANCELLED' } }),
      prisma.appointment.findMany({
        where: {
          appointmentDate: { gte: startOfToday },
          status: { in: ['PENDING', 'CONFIRMED'] },
        },
        orderBy: { appointmentDate: 'asc' },
        take: 5,
        include: { customer: true, service: true },
      }),
      prisma.activityLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 8,
        include: { user: { select: { name: true, role: true } } },
      }),
    ]);

    res.json({
      success: true,
      stats: {
        todayCount,
        pendingCount,
        confirmedCount,
        cancelledCount,
      },
      upcomingAppointments,
      recentLogs,
    });
  } catch (error) {
    console.error('Error al obtener estadísticas de dashboard:', error);
    res.status(500).json({ success: false, error: 'Error al calcular métricas' });
  }
};
