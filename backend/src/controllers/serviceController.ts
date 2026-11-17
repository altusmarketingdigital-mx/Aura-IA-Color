import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { serviceSchema } from '../validators/schemas';

export const getServices = async (_req: Request, res: Response): Promise<void> => {
  try {
    const categories = await prisma.serviceCategory.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
      include: {
        services: {
          where: { isActive: true },
          orderBy: { price: 'asc' },
        },
      },
    });

    res.json({ success: true, categories });
  } catch (error) {
    console.error('Error al obtener servicios:', error);
    res.status(500).json({ success: false, error: 'Error al consultar catálogo de servicios' });
  }
};

export const getServiceById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const service = await prisma.service.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!service) {
      res.status(404).json({ success: false, error: 'Servicio no encontrado' });
      return;
    }

    res.json({ success: true, service });
  } catch (error) {
    console.error('Error al obtener servicio:', error);
    res.status(500).json({ success: false, error: 'Error al consultar el servicio' });
  }
};

export const createService = async (req: Request, res: Response): Promise<void> => {
  try {
    const parse = serviceSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ success: false, error: parse.error.errors[0].message });
      return;
    }

    const newService = await prisma.service.create({
      data: parse.data,
      include: { category: true },
    });

    res.status(201).json({ success: true, service: newService });
  } catch (error) {
    console.error('Error al crear servicio:', error);
    res.status(500).json({ success: false, error: 'Error al crear el servicio' });
  }
};

export const updateService = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const parse = serviceSchema.partial().safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ success: false, error: parse.error.errors[0].message });
      return;
    }

    const updated = await prisma.service.update({
      where: { id },
      data: parse.data,
      include: { category: true },
    });

    res.json({ success: true, service: updated });
  } catch (error) {
    console.error('Error al actualizar servicio:', error);
    res.status(500).json({ success: false, error: 'Error al actualizar el servicio' });
  }
};

export const deleteService = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    // Baja lógica para mantener integridad de citas pasadas
    await prisma.service.update({
      where: { id },
      data: { isActive: false },
    });

    res.json({ success: true, message: 'Servicio desactivado exitosamente' });
  } catch (error) {
    console.error('Error al desactivar servicio:', error);
    res.status(500).json({ success: false, error: 'Error al desactivar el servicio' });
  }
};
