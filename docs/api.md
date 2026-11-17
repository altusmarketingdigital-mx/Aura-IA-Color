# Especificación de API REST - AURA IA COLOR
## Versión 1.0

### Base URL: `/api`

---

### 1. Autenticación (`/api/auth`)
- **`POST /api/auth/login`**
  - Público (Rate limited: 10 req/15min).
  - Body: `{ "email": "string", "password": "string" }`
  - Respuesta 200: `{ "success": true, "token": "jwt...", "user": { "id": "...", "name": "...", "role": "..." } }`
- **`GET /api/auth/me`**
  - Protegido (Header `Authorization: Bearer <token>`).
  - Respuesta 200: `{ "success": true, "user": { ... } }`
- **`POST /api/auth/logout`**
  - Protegido. Respuesta 200: `{ "success": true, "message": "Sesión cerrada" }`

---

### 2. Servicios (`/api/services` y `/api/admin/services`)
- **`GET /api/services`**
  - Público. Retorna categorías activas con sus servicios activos.
- **`GET /api/services/:id`**
  - Público. Retorna detalle de un servicio.
- **`POST /api/admin/services`**
  - Protegido (`ADMIN_PRINCIPAL` o `ADMIN_OPERATIVO`).
  - Body: `{ "name", "categoryId", "description", "price", "durationMinutes", "bufferMinutes", "image" }`
- **`PUT /api/admin/services/:id`**
  - Protegido. Actualiza propiedades de un servicio.
- **`DELETE /api/admin/services/:id`**
  - Protegido (`ADMIN_PRINCIPAL`). Desactivación lógica (`isActive: false`).

---

### 3. Reservaciones (`/api/appointments` y `/api/admin/appointments`)
- **`GET /api/appointments/availability?date=YYYY-MM-DD&serviceId=XYZ`**
  - Público.
  - Retorna slots disponibles `["09:00", "09:30", "11:00", ...]` calculados en base a citas `CONFIRMED`, horario del día y bloqueos.
- **`POST /api/appointments`**
  - Público (Rate limited).
  - Content-Type: `multipart/form-data`.
  - Campos: `customerName`, `customerPhone`, `customerEmail` (opcional), `serviceId`, `appointmentDate` (ISO 8601), `clientNotes` (opcional), `acceptedPrivacy` (true).
  - Archivos opcionales: `currentPhoto`, `referencePhoto`.
  - Respuesta 201: `{ "success": true, "folio": "AURA-2026-00001", "appointment": { ... }, "whatsappUrl": "https://wa.me/525537293887?text=..." }`
- **`GET /api/admin/appointments`**
  - Protegido. Query params: `page`, `limit`, `status`, `dateFrom`, `dateTo`, `search`.
- **`GET /api/admin/appointments/:id`**
  - Protegido. Retorna detalle completo, incluyendo metadatos de fotos.
- **`GET /api/admin/appointments/:id/photos/:photoId`**
  - Protegido. Sirve de forma segura el binario de la foto del cliente (no indexable públicamente).
- **`POST /api/admin/appointments/:id/confirm`**
  - Protegido. Valida que no exista colisión y actualiza estado a `CONFIRMED`.
- **`POST /api/admin/appointments/:id/reject`**
  - Protegido. Body: `{ "reason": "string" }`. Estado `REJECTED`.
- **`POST /api/admin/appointments/:id/cancel`**
  - Protegido. Body: `{ "reason": "string" }`. Estado `CANCELLED`.
- **`POST /api/admin/appointments/:id/reschedule`**
  - Protegido. Body: `{ "newDate": "ISO8601" }`. Valida disponibilidad en nueva fecha/hora.
- **`POST /api/admin/appointments/manual`**
  - Protegido. Permite al administrador crear una cita recibida por teléfono/mostrador.

---

### 4. Clientes (`/api/admin/customers`)
- **`GET /api/admin/customers`**
  - Protegido. Lista paginada con buscador por nombre y teléfono.
- **`GET /api/admin/customers/:id`**
  - Protegido. Perfil con historial completo de reservaciones tomadas.
- **`PUT /api/admin/customers/:id`**
  - Protegido. Actualiza datos y notas privadas del cliente.

---

### 5. Galería y Promociones
- **`GET /api/gallery`**: Público.
- **`POST /api/admin/gallery`**: Protegido. Subida de imagen y técnica.
- **`GET /api/promotions`**: Público.
- **`POST /api/admin/promotions`**: Protegido. Creación/edición de ofertas.

---

### 6. Configuración y Métricas
- **`GET /api/settings`**: Público. Horarios de atención, redes y teléfono oficial.
- **`GET /api/admin/dashboard`**: Protegido. KPIs de citas del día, pendientes, confirmadas y próximas citas.
