# Guía de Pruebas de Calidad (QA) y Verificación - AURA IA COLOR

## 1. Casos de Prueba Ejecutados

| ID | Módulo | Caso de Prueba | Resultado |
|---|---|---|---|
| **CP-01** | Disponibilidad | Intentar agendar en Domingo (Día 0) | **APROBADO**: Motor retorna `isOpen: false` y bloquea la selección. |
| **CP-02** | Disponibilidad | Intentar agendar fuera del rango 09:00 - 19:00 | **APROBADO**: No se generan slots fuera del límite comercial. |
| **CP-03** | Reservaciones | Registro sin cuenta con generación de Folio | **APROBADO**: Se genera correlativo `AURA-2026-00001` con cliente asociado. |
| **CP-04** | Integración WhatsApp | Enlace oficial formateado `wa.me/525537293887` | **APROBADO**: Mensaje prellenado con Nombre, Servicio, Fecha, Horario y Folio. |
| **CP-05** | Anti-Colisión | Doble confirmación en el mismo horario y servicio | **APROBADO**: Transacción atómica rechaza con HTTP 409 la segunda cita en el mismo slot. |
| **CP-06** | Seguridad Fotos | Intento de visualización de fotos de clientes sin token | **APROBADO**: HTTP 401 Unauthorized. Las fotos no están en directorio público. |
| **CP-07** | Autenticación | Control de roles `ADMIN_PRINCIPAL` vs `ADMIN_OPERATIVO` | **APROBADO**: `ADMIN_OPERATIVO` no puede eliminar servicios ni acceder a rutas restringidas. |
| **CP-08** | SEO Local | Schema.org LocalBusiness + Sitemap + Robots | **APROBADO**: Metadatos geolocalizados en Benito Juárez, CDMX. |
