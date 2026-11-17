# Arquitectura del Sistema - AURA IA COLOR

## 1. Visión General
El sistema implementa una arquitectura desacoplada Full Stack Client-Server con comunicación vía API REST con JSON y autenticación basada en Bearer Tokens (JWT).

```
[ Cliente Web / Móvil ] <---> [ Frontend: React + Vite + Tailwind ]
                                       |
                                       | HTTPS / JSON (REST API)
                                       v
[ Panel Admin ] <-----------> [ Backend: Express + TypeScript ]
                                       |
                   +-------------------+-------------------+
                   |                   |                   |
            [ Prisma ORM ]      [ Auth & JWT ]      [ Multer Storage ]
                   |                                       |
         [ Base de Datos Relacional ]              [ uploads/private ]
         (PostgreSQL / SQLite)                     [ uploads/public ]
```

## 2. Separación de Almacenamiento de Medios
- **`backend/uploads/public/`**: Fotografías de galería, banners institucionales y servicios (accesibles públicamente con caching).
- **`backend/uploads/private/`**: Fotografías de cabello de clientes enviadas en reservaciones para diagnóstico (accesibles únicamente por administradores autenticados mediante endpoint protegido `/api/admin/appointments/:id/photos/:filename`).

## 3. Seguridad
- **Protección HTTP**: Helmet activa cabeceras como HSTS, X-Content-Type-Options y CSP básico.
- **Control de Abuso**: `express-rate-limit` en rutas críticas (`/api/auth/login`, `/api/appointments`).
- **Control de Acceso**: Middleware de autenticación `authMiddleware` y verificación de roles `roleMiddleware('ADMIN_PRINCIPAL', 'ADMIN_OPERATIVO')`.
- **Validación Estricta**: Esquemas de Zod antes de ingresar a controladores.
