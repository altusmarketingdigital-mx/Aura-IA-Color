# Guía de Despliegue en Producción - AURA IA COLOR
## Desarrollado por ALTUS MKT DIGITAL (Versión 1.0)

Esta guía detalla los pasos para poner en marcha la plataforma Full Stack en servidores de producción (VPS, Render, Railway o Vercel).

---

## 1. Requisitos del Servidor
- Node.js versión 20.x o superior.
- Base de datos relacional PostgreSQL (Neon, Supabase, RDS o PostgreSQL local en Ubuntu/Debian).
- Servidor web reverso (Nginx o Caddy con certificado SSL Let's Encrypt).

---

## 2. Despliegue del Backend

### Paso 1: Clonar e instalar dependencias
```bash
git clone <URL_REPOSITORIO> aura-ia-color
cd aura-ia-color/backend
npm install --omit=dev
```

### Paso 2: Configurar Variables de Entorno (`.env`)
```env
PORT=4000
NODE_ENV=production
DATABASE_URL="postgresql://usuario:password@host:5432/aura_db?schema=public"
JWT_SECRET="clave_secreta_super_segura_de_produccion"
JWT_EXPIRES_IN=24h
CORS_ORIGIN="https://auraiacolor.mx"
BUSINESS_NAME="AURA IA COLOR"
BUSINESS_PHONE="525537293887"
BUSINESS_TIMEZONE="America/Mexico_City"
UPLOAD_DIR="./uploads"
```

### Paso 3: Migraciones y Generación de Cliente Prisma
```bash
npx prisma generate
npx prisma migrate deploy
npx ts-node prisma/seed.ts
```

### Paso 4: Iniciar con PM2 (Process Manager)
```bash
npm run build
pm2 start dist/index.js --name "aura-backend"
pm2 save
pm2 startup
```

---

## 3. Despliegue del Frontend

### En Vercel / Netlify:
- Root directory: `frontend`
- Build command: `npm run build`
- Output directory: `dist`
- Variable de entorno: `VITE_API_URL=https://api.auraiacolor.mx/api`

### En Servidor Propio con Nginx:
```nginx
server {
    listen 80;
    server_name auraiacolor.mx www.auraiacolor.mx;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name auraiacolor.mx www.auraiacolor.mx;

    ssl_certificate /etc/letsencrypt/live/auraiacolor.mx/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/auraiacolor.mx/privkey.pem;

    root /var/www/aura-ia-color/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:4000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 4. Respaldos Automáticos de Base de Datos
Programar tarea en `crontab`:
```bash
0 3 * * * pg_dump -U postgres aura_db | gzip > /backups/aura_db_$(date +\%F).sql.gz
```
