import { Router } from 'express';
import {
  login,
  getMe,
} from '../controllers/authController';
import {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
} from '../controllers/serviceController';
import {
  getAvailability,
  createAppointment,
  getAdminAppointments,
  getAdminAppointmentById,
  confirmAppointment,
  updateAppointmentStatus,
  rescheduleAppointment,
  getAppointmentPhoto,
} from '../controllers/appointmentController';
import {
  getCustomers,
  updateCustomer,
  getGallery,
  createGalleryItem,
  getPromotions,
  updatePromotion,
  getBlockedSlots,
  createBlockedSlot,
  deleteBlockedSlot,
  getDashboardStats,
} from '../controllers/adminController';
import {
  getStripeConfig,
  createCheckoutSession,
  getCheckoutSessionStatus,
} from '../controllers/paymentController';
import {
  getPosClients,
  createPosClient,
  updatePosClient,
  getPosClientById,
  getPosClientByQr,
  adjustClientPoints,
  getCatalogItems,
  createCatalogItem,
  updateCatalogItem,
  getRewardsCatalog,
  createReward,
  updateReward,
  createPosTransaction,
  getPosTransactions,
  getPublicLoyaltyCard,
  lookupPublicLoyaltyCard,
} from '../controllers/posController';
import { authenticateToken, requireRole } from '../middleware/auth';
import { uploadPrivate, uploadPublic } from '../middleware/upload';

const router = Router();

// =======================
// RUTAS PÚBLICAS
// =======================

// Auth
router.post('/auth/login', login);

// Servicios
router.get('/services', getServices);
router.get('/services/:id', getServiceById);

// Disponibilidad y Citas
router.get('/appointments/availability', getAvailability);
router.post(
  '/appointments',
  uploadPrivate.fields([
    { name: 'currentPhoto', maxCount: 1 },
    { name: 'referencePhoto', maxCount: 1 },
  ]),
  createAppointment
);

// Galería y Promociones
router.get('/gallery', getGallery);
router.get('/promotions', getPromotions);

// Pagos con Stripe (Anticipo 10%)
router.get('/payments/config', getStripeConfig);
router.post('/payments/create-checkout-session', createCheckoutSession);
router.get('/payments/session/:sessionId', getCheckoutSessionStatus);

// Tarjeta de Lealtad Digital QR (Pública en tiempo real)
router.get('/loyalty/lookup', lookupPublicLoyaltyCard);
router.get('/loyalty/card/:qrToken', getPublicLoyaltyCard);

// =======================
// RUTAS ADMINISTRATIVAS PROTEGIDAS
// =======================
router.use(authenticateToken);

// Auth Me
router.get('/auth/me', getMe);

// Dashboard KPIs
router.get('/admin/dashboard', getDashboardStats);

// Citas Admin
router.get('/admin/appointments', getAdminAppointments);
router.get('/admin/appointments/:id', getAdminAppointmentById);
router.get('/admin/appointments/:id/photos/:photoId', getAppointmentPhoto);
router.post('/admin/appointments/:id/confirm', confirmAppointment);
router.post('/admin/appointments/:id/reject', (req, res) => {
  req.body.status = 'REJECTED';
  updateAppointmentStatus(req, res);
});
router.post('/admin/appointments/:id/cancel', (req, res) => {
  req.body.status = 'CANCELLED';
  updateAppointmentStatus(req, res);
});
router.post('/admin/appointments/:id/reschedule', rescheduleAppointment);

// Servicios Admin
router.post('/admin/services', requireRole(['ADMIN_PRINCIPAL']), createService);
router.put('/admin/services/:id', updateService);
router.delete('/admin/services/:id', requireRole(['ADMIN_PRINCIPAL']), deleteService);

// Clientes Admin
router.get('/admin/customers', getCustomers);
router.put('/admin/customers/:id', updateCustomer);

// Bloqueos de Horario
router.get('/admin/blocked-slots', getBlockedSlots);
router.post('/admin/blocked-slots', createBlockedSlot);
router.delete('/admin/blocked-slots/:id', deleteBlockedSlot);

// Galería y Promociones Admin
router.post('/admin/gallery', uploadPublic.single('image'), createGalleryItem);
router.put('/admin/promotions/:id', updatePromotion);

// =======================
// MÓDULO POS Y LEALTAD (/system)
// =======================
router.get('/system/clients', getPosClients);
router.post('/system/clients', createPosClient);
router.get('/system/clients/qr/:qrToken', getPosClientByQr);
router.get('/system/clients/:id', getPosClientById);
router.put('/system/clients/:id', updatePosClient);
router.post('/system/clients/:id/adjust', adjustClientPoints);

router.get('/system/catalog', getCatalogItems);
router.post('/system/catalog', createCatalogItem);
router.put('/system/catalog/:id', updateCatalogItem);

router.get('/system/rewards', getRewardsCatalog);
router.post('/system/rewards', createReward);
router.put('/system/rewards/:id', updateReward);

router.get('/system/pos/transactions', getPosTransactions);
router.post('/system/pos/transactions', createPosTransaction);

export default router;
