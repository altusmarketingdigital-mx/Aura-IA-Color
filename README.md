# AURA IA COLOR — Plataforma Web Full Stack & Sistema de Gestión
### Desarrollado con Excelencia por ALTUS MKT DIGITAL (Versión 1.0)

Plataforma web profesional, moderna y completamente administrable desarrollada a medida para **AURA IA COLOR**, estudio de coloración capilar de alta gama con diferenciador de Inteligencia Artificial en Del Valle Norte, Benito Juárez, Ciudad de México.

---

## 💎 Identidad de Marca y Estilo
- **Paleta Oficial**:
  - Negro Profundo: `#111111`
  - Dorado AURA: `#C6A15B`
  - Marfil Satinado: `#F5F1E9`
  - Blanco: `#FFFFFF`
- **Tipografía**: `Playfair Display` (editorial y lujo) + `Inter` (legibilidad moderna).

---

## 🚀 Arquitectura Tecnológica
- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, React Router v6, Axios, Date-fns.
- **Backend**: Node.js, Express, TypeScript, Zod, JWT, bcryptjs, Helmet, Express Rate Limit, Multer.
- **Base de Datos & ORM**: Prisma ORM con arquitectura relacional (SQLite para desarrollo local, PostgreSQL para producción).
- **Seguridad**: Almacenamiento aislado y privado para fotografías de clientas (`/backend/uploads/private`), protección CORS, cabeceras seguras Helmet y control de roles (`ADMIN_PRINCIPAL`, `ADMIN_OPERATIVO`).

---

## 📋 Módulos Implementados

### 1. Sitio Web Público
- **Inicio (`/`)**: Hero visual de impacto ("TU COLOR. TU ESENCIA. TU TECNOLOGÍA."), propuesta de valor con IA, servicios destacados, programa de lealtad, testimonios autorizados y mapa interactivo.
- **Nosotros (`/nosotros`)**: Historia y filosofía de Sara Beltrán Arias y Luz Adriana González Varela.
- **Servicios (`/servicios`)**: Catálogo administrable de las 5 categorías oficiales (Mantenimiento, Técnicas de Iluminación, Decoloración, Coloración Creativa y Colorimetría con IA) con precios y duraciones reales.
- **Tecnología IA (`/tecnologia-ia`)**: Explicación transparente y didáctica del modelo algorítmico sin simulación falsa.
- **Galería (`/galeria`)**: Fotos reales de transformaciones con filtros por técnica.
- **Promociones (`/promociones`)**: Promoción oficial del 50% en la quinta visita.
- **Contacto (`/contacto`)**: Ubicación física (Obrero Mundial 122, Local 2, Del Valle Norte, CDMX), horarios (Lun-Sáb 09:00 a 19:00) y enlaces a WhatsApp e Instagram.

### 2. Motor de Reservaciones & WhatsApp
- **Reservación sin registro (`/reservar`)**:
  - Consulta en tiempo real de slots disponibles según horario laboral y citas confirmadas.
  - Subida opcional y confidencial de foto actual y foto de referencia del cabello.
  - Generación de Folio Oficial correlativo (ej. `AURA-2026-00001`).
  - Redirección con un clic a WhatsApp oficial (`525537293887`) con el mensaje prellenado formal.

### 3. Panel Administrativo Privado (`/admin`)
- **Login Seguro (`/admin/login`)**.
- **Dashboard Operativo**: KPIs de citas del día, pendientes, confirmadas, canceladas y bitácora de actividad.
- **Gestión Integral de Citas**: Confirmar (con revalidación anti-choque), rechazar con motivo, reprogramar fecha/hora y visualización de fotos privadas de diagnóstico.
- **Calendario y Bloqueos**: Cierres especiales y descansos que deshabilitan slots en tiempo real.
- **Gestión de Clientes**: Historial completo de citas tomadas y notas privadas.
- **Catálogo de Servicios**: Edición de precios en pesos mexicanos ($ MXN), duraciones y descripciones.
- **Promociones y Galería**: Administración de contenidos promocionales y fotografías de trabajos.

---

## 🛠️ Puesta en Marcha Local

### Backend:
```bash
cd backend
npm install
npx prisma db push
npx ts-node prisma/seed.ts
npm run dev
```
*Servidor escuchando en: `http://localhost:4000`*

### Frontend:
```bash
cd frontend
npm install
npm run dev
```
*Aplicación disponible en: `http://localhost:5173`*

### Cuentas Administrativas Iniciales (Semilla Oficial):
1. **Administrador Principal**:
   - Correo: `direccion@auraiacolor.mx`
   - Contraseña: `AuraAdmin2026!Master`
2. **Administrador Operativo**:
   - Correo: `operaciones@auraiacolor.mx`
   - Contraseña: `AuraOperativa2026!`

---

## 📚 Documentación Técnica
- [Requerimientos del Sistema (SRS)](file:///D:/PAGINA%20WEB%20-%20AURA%20IA%20COLOR/docs/requirements.md)
- [Arquitectura del Sistema](file:///D:/PAGINA%20WEB%20-%20AURA%20IA%20COLOR/docs/architecture.md)
- [Base de Datos & Esquema Prisma](file:///D:/PAGINA%20WEB%20-%20AURA%20IA%20COLOR/docs/database.md)
- [Especificación OpenAPI / REST](file:///D:/PAGINA%20WEB%20-%20AURA%20IA%20COLOR/docs/api.md)
- [Plan de Desarrollo Punto por Punto](file:///D:/PAGINA%20WEB%20-%20AURA%20IA%20COLOR/docs/plan_desarrollo_punto_por_punto.md)
- [Guía de Despliegue en Producción](file:///D:/PAGINA%20WEB%20-%20AURA%20IA%20COLOR/docs/deployment.md)
- [Pruebas de Calidad (QA)](file:///D:/PAGINA%20WEB%20-%20AURA%20IA%20COLOR/docs/testing.md)
