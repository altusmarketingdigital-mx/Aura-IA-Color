import multer from 'multer';
import path from 'path';
import fs from 'fs';

const publicDir = path.resolve(__dirname, '../../uploads/public');
const privateDir = path.resolve(__dirname, '../../uploads/private');

if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
if (!fs.existsSync(privateDir)) fs.mkdirSync(privateDir, { recursive: true });

// Almacenamiento privado para fotografías de clientes (citas)
const privateStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, privateDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `cita-${uniqueSuffix}${ext}`);
  },
});

// Almacenamiento público para imágenes de galería / catálogo
const publicStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, publicDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `public-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Formato de imagen no permitido. Solo se aceptan JPEG, PNG y WEBP.'));
  }
};

export const uploadPrivate = multer({
  storage: privateStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter,
});

export const uploadPublic = multer({
  storage: publicStorage,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB
  fileFilter,
});
