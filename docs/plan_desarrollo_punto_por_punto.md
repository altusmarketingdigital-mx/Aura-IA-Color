# PLAN MAESTRO DE DESARROLLO PUNTO POR PUNTO
## PLATAFORMA FULL STACK AURA IA COLOR
### DESARROLLADO POR ALTUS MKT DIGITAL — VERSIÓN 1.0

Este documento contiene el desglose exhaustivo de trabajo dividido en 8 fases, estructurado punto por punto con especificaciones técnicas, dependencias, entregables y criterios de aceptación, conforme a los requerimientos oficiales del negocio.

---

## ÍNDICE DE FASES
1. [FASE 1: Arquitectura, Entorno y Documentación Técnica](#fase-1-arquitectura-entorno-y-documentación-técnica)
2. [FASE 2: Modelado de Datos y Base de Datos Relacional (Prisma ORM)](#fase-2-modelado-de-datos-y-base-de-datos-relacional-prisma-orm)
3. [FASE 3: Desarrollo del Backend y API REST](#fase-3-desarrollo-del-backend-y-api-rest)
4. [FASE 4: Frontend Base y Sistema de Diseño UI/UX Premium](#fase-4-frontend-base-y-sistema-de-diseño-uiux-premium)
5. [FASE 5: Desarrollo del Sitio Web Público](#fase-5-desarrollo-del-sitio-web-público)
6. [FASE 6: Sistema de Reservaciones Interactivo & Integración WhatsApp](#fase-6-sistema-de-reservaciones-interactivo--integración-whatsapp)
7. [FASE 7: Panel Administrativo Privado (/admin)](#fase-7-panel-administrativo-privado-admin)
8. [FASE 8: Seguridad, SEO Local, Pruebas y Preparación para Despliegue](#fase-8-seguridad-seo-local-pruebas-y-preparación-para-despliegue)

---

## FASE 1: Arquitectura, Entorno y Documentación Técnica [COMPLETADA AL 100%]

- [x] **1.1 Estructura del Repositorio:**
  - Carpetas raíz: `/backend`, `/frontend`, `/docs`.
  - Archivos `.gitignore`, `.env.example` y `.env` configurados en frontend y backend.
- [x] **1.2 Documentación de Requerimientos y Arquitectura:**
  - `docs/requirements.md`: Detalle de requerimientos funcionales y no funcionales.
  - `docs/architecture.md`: Diagrama de componentes, flujo de datos, esquema de almacenamiento seguro (`uploads/private`).
  - `docs/database.md`: Diccionario de datos, tipos, relaciones, diagramas e índices.
  - `docs/api.md`: Especificación OpenAPI/REST de todos los endpoints y códigos HTTP.
- [x] **1.3 Configuración del Entorno Backend:**
  - `package.json` con dependencias instaladas (`express`, `helmet`, `cors`, `zod`, `jsonwebtoken`, `bcryptjs`, `prisma`, `multer`).
  - `tsconfig.json` configurado y verificado (Build exitoso sin errores de tipos).
  - Estructura `/backend/src`, `/backend/uploads/public` y `/backend/uploads/private`.
  - Servidor base funcional con endpoint `/api/health`.
- [x] **1.4 Configuración del Entorno Frontend:**
  - Aplicación React con Vite y TypeScript inicializada y compilando al 100%.
  - Tailwind CSS y PostCSS integrados con la paleta de lujo oficial:
    - Negro: `#111111`
    - Dorado: `#C6A15B`
    - Marfil: `#F5F1E9`
    - Blanco: `#FFFFFF`
  - Fuentes Google (`Playfair Display` + `Inter`) integradas en `index.html`.
  - Dependencias (`lucide-react`, `react-router-dom`, `axios`, `date-fns`) instaladas y verificadas.

---

## FASE 2: Modelado de Datos y Base de Datos Relacional (Prisma ORM) [COMPLETADA AL 100%]

- [x] **2.1 Configuración de Prisma:**
  - Inicializado en `backend/prisma/schema.prisma` con cliente generado.
  - Base de datos relacional conectada y sincronizada (`prisma db push`).
- [x] **2.2 Modelado de Entidades:**
  - `User`, `Customer`, `ServiceCategory`, `Service`, `Appointment`, `AppointmentPhoto`, `BusinessHours`, `BlockedSlot`, `Promotion`, `Gallery`, `WebsiteContent`, `ActivityLog`.
- [x] **2.3 Índices, Restricciones y Llaves Foráneas:**
  - Folio único (`folio`), Email único (`email`), índices sobre `(appointmentDate, status)` para optimizar cálculo de disponibilidad.
- [x] **2.4 Migraciones y Semilla de Datos Inicial (Seed):**
  - Script `backend/prisma/seed.ts` ejecutado con éxito.
  - 2 cuentas de administrador iniciales creadas con contraseñas cifradas con bcrypt (Sara Beltrán Arias y Luz Adriana González Varela).
  - Horarios de Lunes a Sábado de 09:00 a 19:00, Domingos cerrado.
  - 5 Categorías y 11 Servicios oficiales con tiempos y precios configurados.
  - Promoción del 50% de descuento en la quinta visita cargada.
  - Galería inicial y datos de contacto de Del Valle Norte, CDMX.

---

## FASE 3: Desarrollo del Backend y API REST [COMPLETADA AL 100%]

- [x] **3.1 Middleware Central y Seguridad:**
  - `helmet`: Seguridad en cabeceras HTTP.
  - `cors`: Configurado con origen frontend y credenciales.
  - `express-rate-limit`: Límite de 300 solicitudes por 15 minutos.
  - `errorHandler`: Captura centralizada de errores no controlados.
- [x] **3.2 Módulo de Autenticación y Autorización (`/api/auth`):**
  - `POST /api/auth/login`: Validación con Zod, hash bcrypt verificado y generación de token JWT.
  - `GET /api/auth/me`: Retorno de usuario autenticado.
  - Middlewares: `authenticateToken` y `requireRole(['ADMIN_PRINCIPAL'])`.
- [x] **3.3 Módulo de Catálogo de Servicios (`/api/services`):**
  - `GET /api/services`: Listado público agrupado por categorías activas con servicios asociados.
  - `GET /api/services/:id`: Detalle de servicio.
  - `POST /api/admin/services`: Creación de servicio (protegido).
  - `PUT /api/admin/services/:id`: Actualización de precios, tiempos y descripción.
  - `DELETE /api/admin/services/:id`: Desactivación lógica de servicio.
- [x] **3.4 Motor de Disponibilidad y Reglas de Negocio:**
  - `availabilityService.ts`: Cálculo de slots en intervalos de 30 min según `BusinessHours`, exclusión de citas `CONFIRMED` considerando duración + tiempo buffer, y bloqueos de agenda.
  - No permite citas en domingos ni fuera del rango comercial (09:00 - 19:00).
  - `GET /api/appointments/availability?date=YYYY-MM-DD&serviceId=XYZ`.
- [x] **3.5 Módulo de Reservaciones (`/api/appointments`):**
  - `POST /api/appointments`: Formulario con validación Zod, transacción atómica para cliente y cita, generación de folio `AURA-YYYY-XXXXX`, almacenamiento aislado de fotos de cliente en `uploads/private` y formateo oficial de URL de WhatsApp (`wa.me/525537293887`).
  - Endpoints administrativos: confirmación con revalidación atómica anti-colisión, rechazo con motivo, reprogramación de slot y visualización segura de fotos.
- [x] **3.6 Módulos Adicionales:**
  - `/api/admin/customers`: Listado y ficha de clientes con historial de visitas.
  - `/api/gallery`: Catálogo de antes y después con filtros.
  - `/api/promotions`: Promoción del 50% en la 5ta visita.
  - `/api/admin/dashboard`: KPIs de citas del día, pendientes, confirmadas y canceladas.

---

## FASE 4: Frontend Base y Sistema de Diseño UI/UX Premium [COMPLETADA AL 100%]

- [x] **4.1 Configuración de Estilos y Tipografía:**
  - Google Fonts `Playfair Display` + `Inter` integradas en `index.html`.
  - Paleta institucional configurada en Tailwind CSS: Negro `#111111`, Dorado `#C6A15B`, Marfil `#F5F1E9`.
- [x] **4.2 Capa de Infraestructura Frontend:**
  - Instancia de Axios en `frontend/src/services/api.ts` con interceptores para token JWT y errores 401.
  - `AuthContext.tsx` con manejo de estado global de usuario y persistencia segura.
  - Enrutamiento completo con React Router v6 y componente `ProtectedRoute`.
- [x] **4.3 Componentes Base Reutilizables:**
  - `Navbar.tsx` con navegación responsiva, logo oficial y botón de CTA "Agenda tu Cita".
  - `Footer.tsx` con horarios, dirección en Benito Juárez, CDMX y enlaces a WhatsApp e Instagram.
  - `MainLayout.tsx` y `AdminLayout.tsx` con navegación lateral para el panel privado.

---

## FASE 5: Desarrollo del Sitio Web Público [COMPLETADA AL 100%]

- [x] **5.1 Página de Inicio (`/`):**
  - Hero visual con lema "TU COLOR. TU ESENCIA. TU TECNOLOGÍA."
  - Módulo didáctico de valor tecnológico con IA, servicios insignia, testimonios autorizados y Google Maps.
- [x] **5.2 Página Nosotros (`/nosotros`):**
  - Historia, visión y filosofía de Sara Beltrán Arias y Luz Adriana González Varela.
- [x] **5.3 Catálogo de Servicios (`/servicios`):**
  - 5 categorías oficiales con filtrado dinámico, duraciones, precios reales y botón directo para agendar.
- [x] **5.4 Sección Tecnología IA (`/tecnologia-ia`):**
  - Explicación honesta de formulación cromática asistida por IA sin simulación falsa.
- [x] **5.5 Galería de Trabajos (`/galeria`):**
  - Grilla interactiva con filtros por técnica (Balayage, Babylights, Coloración, Transformaciones).
- [x] **5.6 Promociones (`/promociones`):**
  - Oferta oficial del 50% de descuento en la quinta visita con términos y condiciones.
- [x] **5.7 Contacto (`/contacto`):**
  - Datos de Del Valle Norte, horario Lun-Sáb 09:00 a 19:00, Google Maps y WhatsApp directo.

---

## FASE 6: Sistema de Reservaciones Interactivo & Integración WhatsApp [COMPLETADA AL 100%]

- [x] **6.1 Wizard / Formulario de Reserva (`/reservar`):**
  - Sin obligación de crear cuenta previa.
  - Consulta en tiempo real de slots disponibles según citas confirmadas y bloqueos.
  - Carga opcional de foto actual y foto de referencia del cabello.
  - Consentimiento del Aviso de Privacidad.
- [x] **6.2 Confirmación y WhatsApp Oficial:**
  - Generación de folio único correlativo `AURA-YYYY-XXXXX`.
  - Botón oficial con enlace `https://wa.me/525537293887?text=...` con el formato exacto requerido.

---

## FASE 7: Panel Administrativo Privado (/admin) [COMPLETADA AL 100%]

- [x] **7.1 Inicio de Sesión (`/admin/login`):**
  - Acceso con credenciales protegidas y JWT.
- [x] **7.2 Dashboard (`/admin`):**
  - Tarjetas de KPIs (citas de hoy, pendientes, confirmadas, canceladas), próximas reservaciones y registro de actividad.
- [x] **7.3 Citas y Reservaciones (`/admin/citas`):**
  - Buscador, filtros por estado, modal de detalle con visualizador seguro de fotos privadas, confirmación atómica anti-colisiones, rechazo, cancelación y reprogramación.
- [x] **7.4 Calendario y Bloqueos (`/admin/calendario`):**
  - Registro y eliminación de bloqueos de horario por fecha y horas.
- [x] **7.5 Clientes (`/admin/clientes`):**
  - Cartera de clientas con historial completo de visitas y servicios tomados.
- [x] **7.6 Catálogo de Servicios (`/admin/servicios`):**
  - Edición en tiempo real de precios en pesos mexicanos, duraciones y descripciones.
- [x] **7.7 Promociones y Galería (`/admin/promociones`, `/admin/galeria`):**
  - Edición de ofertas y publicación de fotografías de trabajos.

---

## FASE 8: Seguridad, SEO Local, Pruebas y Preparación para Despliegue [COMPLETADA AL 100%]

- [x] **8.1 Auditoría de Seguridad:**
  - Almacenamiento protegido en `uploads/private` accesible únicamente con token JWT.
  - Contraseñas cifradas con `bcryptjs`, cabeceras `helmet`, `cors` y rate limiting.
- [x] **8.2 SEO y Optimización Local:**
  - Metadatos Open Graph, `sitemap.xml`, `robots.txt` y datos estructurados Schema.org `HairSalon` geolocalizados en Benito Juárez, CDMX.
- [x] **8.3 Pruebas de Calidad (QA):**
  - Pruebas funcionales de extremo a extremo documentadas en `docs/testing.md`.
  - Build de producción verificado con éxito tanto en frontend como en backend.
- [x] **8.4 Documentación de Despliegue (`docs/deployment.md` y `README.md`):**
  - Instrucciones para VPS, Nginx, PostgreSQL, variables de entorno y respaldos.
