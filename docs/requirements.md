# Documento de Requerimientos del Sistema (SRS)
## Proyecto: AURA IA COLOR
**Desarrollado por:** ALTUS MKT DIGITAL  
**Versión:** 1.0  
**Fecha:** Noviembre 2026  

---

## 1. Información General del Negocio
- **Razón Comercial:** AURA IA COLOR
- **Responsables:** Sara Beltrán Arias y Luz Adriana González Varela
- **Giro:** Servicios profesionales de coloración capilar con diferenciador de Inteligencia Artificial en la asesoría y formulación
- **Ubicación:** Obrero Mundial 122, Local 2, Colonia Del Valle Norte, Benito Juárez, CDMX
- **WhatsApp:** 55 3729 3887 (525537293887)
- **Instagram:** @aura.iacolor
- **Horario:** Lunes a sábado de 09:00 a 19:00 hrs. Domingos cerrado.

---

## 2. Requerimientos Funcionales

### 2.1 Sitio Web Público
- **RF-01:** Portal responsivo con identidad visual de lujo (Negro `#111111`, Dorado `#C6A15B`, Marfil `#F5F1E9`, Blanco `#FFFFFF`).
- **RF-02:** Catálogo de servicios organizado por 5 categorías:
  1. Mantenimiento y Coloración
  2. Técnicas de Iluminación
  3. Decoloración
  4. Coloración Creativa
  5. Colorimetría con Inteligencia Artificial
- **RF-03:** Módulo de Tecnología IA informativo (sin simulaciones falsas de diagnóstico en frontend).
- **RF-04:** Galería de trabajos con filtrado por técnica y autorización de imagen.
- **RF-05:** Sección de promociones administrables ("En tu quinta visita recibe 50% de descuento").
- **RF-06:** Sección de contacto con Google Maps y enlace directo a WhatsApp.

### 2.2 Sistema de Reservaciones
- **RF-07:** Reservación sin obligación de registro de usuario.
- **RF-08:** Selección de fecha, servicio y cálculo de horarios disponibles según citas confirmadas y bloqueos.
- **RF-09:** Subida opcional de foto actual y foto de referencia del cabello (almacenamiento privado).
- **RF-10:** Generación de folio único con nomenclatura `AURA-YYYY-XXXXX`.
- **RF-11:** Redirección a WhatsApp con mensaje estructurado oficial (`wa.me`).
- **RF-12:** Control de estados de cita: `PENDING`, `CONFIRMED`, `REJECTED`, `CANCELLED`, `COMPLETED`.

### 2.3 Panel Administrativo
- **RF-13:** Autenticación segura mediante JWT con expiración y hash bcrypt.
- **RF-14:** Dos roles con permisos diferenciados: `ADMIN_PRINCIPAL` y `ADMIN_OPERATIVO`.
- **RF-15:** Dashboard de métricas diarias, pendientes, confirmadas y próximas citas.
- **RF-16:** Gestión completa de reservaciones (confirmar, rechazar, reprogramar, cancelar, crear manual).
- **RF-17:** Calendario visual administrativo con vista de bloqueos y horarios especiales.
- **RF-18:** Cartera de clientes con historial de servicios.
- **RF-19:** Gestión de catálogo de servicios, precios, tiempos y categorías.
- **RF-20:** Gestión de galería de imágenes y promociones activas.
- **RF-21:** Auditoría de actividad (`ActivityLog`).

---

## 3. Requerimientos No Funcionales
- **RNF-01 Seguridad:** Helmet, Rate limiting, CORS, almacenamiento privado de fotos médicas/personales de clientes, sanitización de inputs con Zod.
- **RNF-02 Rendimiento:** Carga veloz con Vite + Tailwind CSS, imágenes optimizadas, API REST rápida.
- **RNF-03 Compatibilidad:** 100% responsivo en smartphones, tablets y equipos de escritorio.
- **RNF-04 Zona Horaria:** Operación fija en zona horaria de la Ciudad de México (`America/Mexico_City`).
