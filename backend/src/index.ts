import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import path from 'path';
import apiRoutes from './routes/api';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

// Configuración de Seguridad
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  })
);

// Rate Limiting global
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 300, // Límite de 300 solicitudes por ventana
  message: { success: false, error: 'Demasiadas solicitudes desde esta IP, por favor intente más tarde.' },
});
app.use('/api', limiter);

// Parsing de JSON y URL encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos públicos estáticos (galería)
app.use('/uploads/public', express.static(path.resolve(__dirname, '../uploads/public')));

// Rutas de API REST
app.use('/api', apiRoutes);

// Endpoint de Health Check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'OK',
    business: 'AURA IA COLOR',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Manejador centralizado de errores
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Error no controlado]:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Error interno del servidor',
  });
});

export default app;

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`[AURA IA COLOR] Servidor backend escuchando en http://localhost:${port}`);
  });
}
