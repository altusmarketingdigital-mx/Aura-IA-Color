import { Request, Response } from 'express';
import crypto from 'crypto';
import prisma from '../config/prisma';
import { AuthRequest } from '../middleware/auth';
import {
  adjustClientPointsSchema,
  catalogItemSchema,
  createClientSchema,
  createPosTransactionSchema,
  rewardSchema,
  updateClientSchema,
} from '../validators/posSchemas';

/**
 * Genera un token QR único y seguro para cada cliente (ej. AURA-QR-8F3A19B2)
 */
const generateQrToken = (): string => {
  return `AURA-QR-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
};

/**
 * Normaliza un código QR que pudiera venir como URL completa (ej. .../lealtad/AURA-QR-XXXX)
 */
const normalizeQrToken = (rawToken: string): string => {
  const trimmed = rawToken.trim();
  if (trimmed.includes('/lealtad/')) {
    const parts = trimmed.split('/lealtad/');
    return parts[parts.length - 1].split(/[?#]/)[0].trim();
  }
  return trimmed;
};

/**
 * Calcula el descuento en MXN de una recompensa sobre un subtotal
 */
const calculateRewardDiscount = (
  subtotal: number,
  discountType: string,
  discountValue: number
): number => {
  if (discountType === 'percentage') {
    const pct = Math.min(100, Math.max(0, discountValue));
    return Math.round(subtotal * (pct / 100) * 100) / 100;
  }
  if (discountType === 'fixed' || discountType === 'free_service') {
    const val = discountValue > 0 ? discountValue : subtotal;
    return Math.min(subtotal, Math.round(val * 100) / 100);
  }
  return 0;
};

// ============================================================================
// 1. CLIENTES Y ESCANEO QR (/system/clients)
// ============================================================================

export const getPosClients = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search } = req.query;
    const where: any = {};

    if (search && String(search).trim()) {
      const q = String(search).trim();
      where.OR = [
        { name: { contains: q } },
        { phone: { contains: q } },
        { email: { contains: q } },
        { qrToken: { contains: q } },
      ];
    }

    const clients = await prisma.client.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { posTransactions: true, loyaltyLedger: true },
        },
      },
    });

    res.json({ success: true, clients });
  } catch (error) {
    console.error('Error al listar clientes POS:', error);
    res.status(500).json({ success: false, error: 'Error al consultar el directorio de clientes' });
  }
};

export const createPosClient = async (req: Request, res: Response): Promise<void> => {
  try {
    const parse = createClientSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ success: false, error: parse.error.errors[0].message });
      return;
    }

    const { name, phone, email } = parse.data;
    const cleanPhone = phone.trim();

    const existing = await prisma.client.findUnique({ where: { phone: cleanPhone } });
    if (existing) {
      res.status(409).json({
        success: false,
        error: `Ya existe un cliente registrado con el teléfono ${cleanPhone}`,
        client: existing,
      });
      return;
    }

    let qrToken = generateQrToken();
    // Asegurar unicidad de token
    while (await prisma.client.findUnique({ where: { qrToken } })) {
      qrToken = generateQrToken();
    }

    const client = await prisma.client.create({
      data: {
        name: name.trim(),
        phone: cleanPhone,
        email: email && email.trim() ? email.trim() : null,
        qrToken,
      },
    });

    res.status(201).json({ success: true, client });
  } catch (error) {
    console.error('Error al crear cliente POS:', error);
    res.status(500).json({ success: false, error: 'No se pudo registrar el cliente' });
  }
};

export const updatePosClient = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const parse = updateClientSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ success: false, error: parse.error.errors[0].message });
      return;
    }

    const client = await prisma.client.update({
      where: { id },
      data: {
        ...(parse.data.name ? { name: parse.data.name.trim() } : {}),
        ...(parse.data.phone ? { phone: parse.data.phone.trim() } : {}),
        ...(parse.data.email !== undefined
          ? { email: parse.data.email && parse.data.email.trim() ? parse.data.email.trim() : null }
          : {}),
      },
    });

    res.json({ success: true, client });
  } catch (error: any) {
    if (error?.code === 'P2002') {
      res.status(409).json({ success: false, error: 'El teléfono ingresado ya pertenece a otro cliente' });
      return;
    }
    console.error('Error al actualizar cliente POS:', error);
    res.status(500).json({ success: false, error: 'Error al actualizar datos del cliente' });
  }
};

export const getPosClientById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        posTransactions: {
          orderBy: { createdAt: 'desc' },
          include: {
            reward: {
              select: { id: true, title: true, discountType: true, discountValue: true },
            },
          },
        },
        loyaltyLedger: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!client) {
      res.status(404).json({ success: false, error: 'Cliente no encontrado' });
      return;
    }

    const activeRewards = await prisma.rewardsCatalog.findMany({
      where: { active: true },
      orderBy: { requiredPoints: 'asc' },
    });

    const availableRewards = activeRewards.filter((r) => client.currentPoints >= r.requiredPoints);

    res.json({
      success: true,
      client: {
        ...client,
        posTransactions: client.posTransactions.map((tx) => ({
          ...tx,
          items: JSON.parse(tx.items),
        })),
      },
      availableRewards,
      allRewards: activeRewards,
    });
  } catch (error) {
    console.error('Error al consultar detalle de cliente POS:', error);
    res.status(500).json({ success: false, error: 'Error al obtener historial del cliente' });
  }
};

export const getPosClientByQr = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = normalizeQrToken(req.params.qrToken || '');
    if (!token) {
      res.status(400).json({ success: false, error: 'Código QR inválido' });
      return;
    }

    const client = await prisma.client.findUnique({
      where: { qrToken: token },
    });

    if (!client) {
      res.status(404).json({ success: false, error: `No se encontró ningún cliente con el QR "${token}"` });
      return;
    }

    const activeRewards = await prisma.rewardsCatalog.findMany({
      where: { active: true },
      orderBy: { requiredPoints: 'asc' },
    });

    const availableRewards = activeRewards.filter((r) => client.currentPoints >= r.requiredPoints);

    res.json({
      success: true,
      client,
      availableRewards,
    });
  } catch (error) {
    console.error('Error al escanear QR de cliente:', error);
    res.status(500).json({ success: false, error: 'Error al validar código QR' });
  }
};

export const adjustClientPoints = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const parse = adjustClientPointsSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ success: false, error: parse.error.errors[0].message });
      return;
    }

    const { pointsDelta, visitsDelta, description } = parse.data;

    const result = await prisma.$transaction(async (tx) => {
      const client = await tx.client.findUnique({ where: { id } });
      if (!client) {
        throw new Error('CLIENT_NOT_FOUND');
      }

      const nextPoints = client.currentPoints + pointsDelta;
      const nextVisits = client.totalVisits + visitsDelta;

      if (nextPoints < 0) {
        throw new Error('NEGATIVE_POINTS');
      }
      if (nextVisits < 0) {
        throw new Error('NEGATIVE_VISITS');
      }

      const updatedClient = await tx.client.update({
        where: { id },
        data: {
          currentPoints: nextPoints,
          totalVisits: nextVisits,
        },
      });

      const ledgerEntry = await tx.loyaltyLedger.create({
        data: {
          clientId: id,
          type: 'ADJUSTMENT',
          pointsDelta,
          visitsDelta,
          description: `${description} (Por: ${req.user?.name || 'Admin'})`,
        },
      });

      await tx.activityLog.create({
        data: {
          userId: req.user?.id,
          action: 'POS_POINTS_ADJUSTMENT',
          entity: 'Client',
          entityId: id,
          details: `Ajuste manual: ${pointsDelta >= 0 ? '+' : ''}${pointsDelta} pts, ${visitsDelta >= 0 ? '+' : ''}${visitsDelta} visitas. Motivo: ${description}`,
        },
      });

      return { updatedClient, ledgerEntry };
    });

    res.json({
      success: true,
      client: result.updatedClient,
      ledgerEntry: result.ledgerEntry,
    });
  } catch (error: any) {
    if (error.message === 'CLIENT_NOT_FOUND') {
      res.status(404).json({ success: false, error: 'Cliente no encontrado' });
      return;
    }
    if (error.message === 'NEGATIVE_POINTS') {
      res.status(400).json({ success: false, error: 'El ajuste no puede dejar el saldo de puntos en negativo' });
      return;
    }
    if (error.message === 'NEGATIVE_VISITS') {
      res.status(400).json({ success: false, error: 'El ajuste no puede dejar las visitas en negativo' });
      return;
    }
    console.error('Error al ajustar puntos:', error);
    res.status(500).json({ success: false, error: 'Error al registrar el ajuste manual' });
  }
};

// ============================================================================
// 2. CATÁLOGO POS DE SERVICIOS Y PRODUCTOS (/system/catalog)
// ============================================================================

export const getCatalogItems = async (req: Request, res: Response): Promise<void> => {
  try {
    const includeInactive = req.query.includeInactive === 'true';
    const items = await prisma.servicesCatalog.findMany({
      where: includeInactive ? {} : { active: true },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });
    res.json({ success: true, items });
  } catch (error) {
    console.error('Error al consultar catálogo POS:', error);
    res.status(500).json({ success: false, error: 'Error al consultar catálogo de servicios y productos' });
  }
};

export const createCatalogItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const parse = catalogItemSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ success: false, error: parse.error.errors[0].message });
      return;
    }

    const item = await prisma.servicesCatalog.create({ data: parse.data });
    res.status(201).json({ success: true, item });
  } catch (error) {
    console.error('Error al crear ítem de catálogo POS:', error);
    res.status(500).json({ success: false, error: 'No se pudo crear el ítem en el catálogo' });
  }
};

export const updateCatalogItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const parse = catalogItemSchema.partial().safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ success: false, error: parse.error.errors[0].message });
      return;
    }

    const item = await prisma.servicesCatalog.update({
      where: { id },
      data: parse.data,
    });

    res.json({ success: true, item });
  } catch (error) {
    console.error('Error al actualizar ítem de catálogo POS:', error);
    res.status(500).json({ success: false, error: 'No se pudo actualizar el ítem del catálogo' });
  }
};

// ============================================================================
// 3. CATÁLOGO DE RECOMPENSAS (/system/rewards)
// ============================================================================

export const getRewardsCatalog = async (req: Request, res: Response): Promise<void> => {
  try {
    const includeInactive = req.query.includeInactive === 'true';
    const rewards = await prisma.rewardsCatalog.findMany({
      where: includeInactive ? {} : { active: true },
      orderBy: { requiredPoints: 'asc' },
    });
    res.json({ success: true, rewards });
  } catch (error) {
    console.error('Error al consultar recompensas:', error);
    res.status(500).json({ success: false, error: 'Error al consultar catálogo de recompensas' });
  }
};

export const createReward = async (req: Request, res: Response): Promise<void> => {
  try {
    const parse = rewardSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ success: false, error: parse.error.errors[0].message });
      return;
    }

    const reward = await prisma.rewardsCatalog.create({ data: parse.data });
    res.status(201).json({ success: true, reward });
  } catch (error) {
    console.error('Error al crear recompensa:', error);
    res.status(500).json({ success: false, error: 'No se pudo crear la recompensa' });
  }
};

export const updateReward = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const parse = rewardSchema.partial().safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ success: false, error: parse.error.errors[0].message });
      return;
    }

    const reward = await prisma.rewardsCatalog.update({
      where: { id },
      data: parse.data,
    });

    res.json({ success: true, reward });
  } catch (error) {
    console.error('Error al actualizar recompensa:', error);
    res.status(500).json({ success: false, error: 'No se pudo actualizar la recompensa' });
  }
};

// ============================================================================
// 4. COBRO EN CAJA POS CON TRANSACCIÓN ATÓMICA E IDEMPOTENCIA
// ============================================================================

export const createPosTransaction = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const parse = createPosTransactionSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ success: false, error: parse.error.errors[0].message });
      return;
    }

    const { idempotencyKey, clientId, items: requestedItems, rewardId, notes } = parse.data;

    // 1. Verificar idempotencia antes de iniciar la transacción
    const existingByIdempotency = await prisma.posTransaction.findUnique({
      where: { idempotencyKey },
      include: { client: true },
    });

    if (existingByIdempotency) {
      res.status(409).json({
        success: false,
        duplicate: true,
        error: 'Esta operación ya fue procesada anteriormente (clave de idempotencia duplicada).',
        transaction: {
          ...existingByIdempotency,
          items: JSON.parse(existingByIdempotency.items),
        },
      });
      return;
    }

    // 2. Resolver ítems desde el catálogo oficial (evita manipulación de precios desde el cliente)
    const itemIds = requestedItems.map((i) => i.id);
    const catalogItems = await prisma.servicesCatalog.findMany({
      where: { id: { in: itemIds }, active: true },
    });

    const catalogMap = new Map(catalogItems.map((c) => [c.id, c]));
    const resolvedItems: Array<{
      id: string;
      name: string;
      category: string;
      unitPrice: number;
      quantity: number;
      pointsAwarded: number;
      lineTotal: number;
      linePoints: number;
    }> = [];

    let subtotal = 0;
    let pointsEarned = 0;

    for (const reqItem of requestedItems) {
      const cat = catalogMap.get(reqItem.id);
      if (!cat) {
        res.status(400).json({
          success: false,
          error: `Uno de los servicios o productos seleccionados ya no está activo o no existe.`,
        });
        return;
      }
      const lineTotal = Math.round(cat.price * reqItem.quantity * 100) / 100;
      const linePoints = cat.pointsAwarded * reqItem.quantity;
      subtotal += lineTotal;
      pointsEarned += linePoints;

      resolvedItems.push({
        id: cat.id,
        name: cat.name,
        category: cat.category,
        unitPrice: cat.price,
        quantity: reqItem.quantity,
        pointsAwarded: cat.pointsAwarded,
        lineTotal,
        linePoints,
      });
    }

    subtotal = Math.round(subtotal * 100) / 100;
    const serializedItems = JSON.stringify(resolvedItems);

    // 3. Transacción atómica en base de datos
    const txResult = await prisma.$transaction(async (tx) => {
      const client = await tx.client.findUnique({ where: { id: clientId } });
      if (!client) {
        throw new Error('CLIENT_NOT_FOUND');
      }

      // Validar recompensa si fue seleccionada
      let discountApplied = 0;
      let pointsRedeemed = 0;
      let rewardTitle: string | null = null;

      if (rewardId) {
        const reward = await tx.rewardsCatalog.findUnique({ where: { id: rewardId } });
        if (!reward || !reward.active) {
          throw new Error('REWARD_NOT_FOUND');
        }
        if (client.currentPoints < reward.requiredPoints) {
          throw new Error('INSUFFICIENT_POINTS');
        }
        discountApplied = calculateRewardDiscount(subtotal, reward.discountType, reward.discountValue);
        pointsRedeemed = reward.requiredPoints;
        rewardTitle = reward.title;
      }

      const totalPaid = Math.max(0, Math.round((subtotal - discountApplied) * 100) / 100);

      // Ventana anti-duplicados: bloquear mismo cliente + idéntico monto + idénticos ítems en < 60 segundos
      const sixtySecondsAgo = new Date(Date.now() - 60 * 1000);
      const recentDuplicate = await tx.posTransaction.findFirst({
        where: {
          clientId,
          totalPaid,
          items: serializedItems,
          createdAt: { gte: sixtySecondsAgo },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (recentDuplicate) {
        throw new Error('RECENT_DUPLICATE');
      }

      // 3.1 Insertar operación en pos_transactions
      const createdTransaction = await tx.posTransaction.create({
        data: {
          idempotencyKey,
          clientId,
          items: serializedItems,
          subtotal,
          discountApplied,
          totalPaid,
          pointsEarned,
          pointsRedeemed,
          rewardId: rewardId || null,
          notes: notes && notes.trim() ? notes.trim() : null,
        },
      });

      // 3.2 Actualizar saldo de puntos y total de visitas del cliente
      const updatedClient = await tx.client.update({
        where: { id: clientId },
        data: {
          currentPoints: client.currentPoints + pointsEarned - pointsRedeemed,
          totalVisits: client.totalVisits + 1,
        },
      });

      // 3.3 Registrar acumulación en loyalty_ledger
      const itemNamesSummary = resolvedItems.map((i) => `${i.quantity}x ${i.name}`).join(', ');
      await tx.loyaltyLedger.create({
        data: {
          clientId,
          transactionId: createdTransaction.id,
          type: 'EARN',
          pointsDelta: pointsEarned,
          visitsDelta: 1,
          description: `Compra en caja: ${itemNamesSummary}`,
        },
      });

      // 3.4 Registrar canje en loyalty_ledger si se usó una recompensa
      if (pointsRedeemed > 0 && rewardTitle) {
        await tx.loyaltyLedger.create({
          data: {
            clientId,
            transactionId: createdTransaction.id,
            type: 'REDEEM',
            pointsDelta: -pointsRedeemed,
            visitsDelta: 0,
            description: `Canje de recompensa: ${rewardTitle} (-$${discountApplied.toLocaleString('es-MX')} MXN)`,
          },
        });
      }

      // 3.5 Auditoría administrativa
      await tx.activityLog.create({
        data: {
          userId: req.user?.id,
          action: 'POS_SALE_COMPLETED',
          entity: 'PosTransaction',
          entityId: createdTransaction.id,
          details: `Cobro a ${client.name} por $${totalPaid} MXN (+${pointsEarned} pts, -${pointsRedeemed} pts)`,
        },
      });

      return {
        transaction: {
          ...createdTransaction,
          items: resolvedItems,
        },
        client: updatedClient,
      };
    });

    const activeRewards = await prisma.rewardsCatalog.findMany({
      where: { active: true },
      orderBy: { requiredPoints: 'asc' },
    });

    res.status(201).json({
      success: true,
      transaction: txResult.transaction,
      client: txResult.client,
      availableRewards: activeRewards.filter((r) => txResult.client.currentPoints >= r.requiredPoints),
      message: 'Cobro y actualización de lealtad registrados con éxito',
    });
  } catch (error: any) {
    if (error?.code === 'P2002') {
      res.status(409).json({
        success: false,
        duplicate: true,
        error: 'Operación duplicada detectada. La clave de idempotencia ya existe.',
      });
      return;
    }
    if (error.message === 'CLIENT_NOT_FOUND') {
      res.status(404).json({ success: false, error: 'El cliente seleccionado no existe' });
      return;
    }
    if (error.message === 'REWARD_NOT_FOUND') {
      res.status(400).json({ success: false, error: 'La recompensa seleccionada no está activa o no existe' });
      return;
    }
    if (error.message === 'INSUFFICIENT_POINTS') {
      res.status(400).json({ success: false, error: 'El cliente no cuenta con puntos suficientes para canjear esta recompensa' });
      return;
    }
    if (error.message === 'RECENT_DUPLICATE') {
      res.status(409).json({
        success: false,
        duplicate: true,
        error: 'Se detectó un cobro idéntico para este cliente hace menos de 60 segundos. Verifica el historial antes de reintentar.',
      });
      return;
    }
    console.error('Error al procesar venta POS:', error);
    res.status(500).json({ success: false, error: 'Error interno al procesar la venta en caja' });
  }
};

export const getPosTransactions = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = Math.min(100, Number(req.query.limit) || 25);
    const transactions = await prisma.posTransaction.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        client: { select: { id: true, name: true, phone: true, qrToken: true } },
        reward: { select: { id: true, title: true } },
      },
    });

    res.json({
      success: true,
      transactions: transactions.map((tx) => ({
        ...tx,
        items: JSON.parse(tx.items),
      })),
    });
  } catch (error) {
    console.error('Error al listar transacciones POS:', error);
    res.status(500).json({ success: false, error: 'Error al obtener historial de caja' });
  }
};

// ============================================================================
// 5. ENDPOINT PÚBLICO EN TIEMPO REAL PARA TARJETA DE LEALTAD DIGITAL (QR)
// ============================================================================

export const getPublicLoyaltyCard = async (req: Request, res: Response): Promise<void> => {
  try {
    const qrToken = normalizeQrToken(req.params.qrToken || '');
    if (!qrToken) {
      res.status(400).json({ success: false, error: 'Código QR requerido' });
      return;
    }

    const client = await prisma.client.findUnique({
      where: { qrToken },
      select: {
        id: true,
        name: true,
        qrToken: true,
        currentPoints: true,
        totalVisits: true,
        createdAt: true,
        loyaltyLedger: {
          orderBy: { createdAt: 'desc' },
          take: 15,
          select: {
            id: true,
            type: true,
            pointsDelta: true,
            visitsDelta: true,
            description: true,
            createdAt: true,
          },
        },
      },
    });

    if (!client) {
      res.status(404).json({ success: false, error: 'Tarjeta de lealtad no encontrada' });
      return;
    }

    const rewards = await prisma.rewardsCatalog.findMany({
      where: { active: true },
      orderBy: { requiredPoints: 'asc' },
    });

    const unlockedRewards = rewards.filter((r) => client.currentPoints >= r.requiredPoints);
    const nextReward = rewards.find((r) => client.currentPoints < r.requiredPoints) || null;

    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.json({
      success: true,
      card: {
        id: client.id,
        name: client.name,
        qrToken: client.qrToken,
        currentPoints: client.currentPoints,
        totalVisits: client.totalVisits,
        createdAt: client.createdAt,
        unlockedRewards,
        nextReward,
        rewardsCatalog: rewards,
        recentHistory: client.loyaltyLedger,
      },
    });
  } catch (error) {
    console.error('Error al consultar tarjeta digital QR:', error);
    res.status(500).json({ success: false, error: 'Error al consultar tarjeta de lealtad' });
  }
};

export const lookupPublicLoyaltyCard = async (req: Request, res: Response): Promise<void> => {
  try {
    const rawQuery = String(req.query.q || '').trim();
    if (!rawQuery) {
      res.status(400).json({ success: false, error: 'Ingresa tu teléfono o código QR' });
      return;
    }

    const normalizedToken = normalizeQrToken(rawQuery);
    const client = await prisma.client.findFirst({
      where: {
        OR: [
          { qrToken: normalizedToken },
          { phone: rawQuery },
        ],
      },
      select: { qrToken: true },
    });

    if (!client) {
      res.status(404).json({
        success: false,
        error: 'No encontramos una tarjeta registrada con ese teléfono o código QR.',
      });
      return;
    }

    res.json({ success: true, qrToken: client.qrToken });
  } catch (error) {
    console.error('Error al buscar tarjeta de lealtad:', error);
    res.status(500).json({ success: false, error: 'Error al buscar tarjeta de lealtad' });
  }
};
