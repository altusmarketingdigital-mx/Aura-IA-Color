# Especificación de Base de Datos - AURA IA COLOR
## Versión 1.0 — Prisma ORM

### 1. Diagrama Entidad-Relación Lógico
```mermaid
erDiagram
    User ||--o{ ActivityLog : generates
    Customer ||--o{ Appointment : requests
    ServiceCategory ||--o{ Service : contains
    Service ||--o{ Appointment : booked_in
    Appointment ||--o{ AppointmentPhoto : includes
    User ||--o{ BlockedSlot : creates

    User {
        string id PK
        string email UK
        string passwordHash
        string name
        string role "ADMIN_PRINCIPAL | ADMIN_OPERATIVO"
        boolean isActive
        datetime createdAt
        datetime updatedAt
    }

    Customer {
        string id PK
        string name
        string phone
        string email
        string notes
        datetime createdAt
        datetime updatedAt
    }

    ServiceCategory {
        string id PK
        string name
        string slug UK
        string description
        int displayOrder
        boolean isActive
    }

    Service {
        string id PK
        string categoryId FK
        string name
        string description
        int durationMinutes
        float price
        int bufferMinutes
        string image
        boolean isActive
        boolean isFeatured
    }

    Appointment {
        string id PK
        string folio UK "AURA-YYYY-XXXXX"
        string customerId FK
        string serviceId FK
        datetime appointmentDate
        int durationMinutes
        string status "PENDING | CONFIRMED | REJECTED | CANCELLED | COMPLETED"
        string clientNotes
        string adminNotes
        datetime createdAt
        datetime updatedAt
    }

    AppointmentPhoto {
        string id PK
        string appointmentId FK
        string photoType "CURRENT | REFERENCE"
        string filePath
        string originalName
        string mimeType
        datetime createdAt
    }

    BusinessHours {
        string id PK
        int dayOfWeek "0=Dom, 1=Lun, ..., 6=Sab"
        string openTime "09:00"
        string closeTime "19:00"
        boolean isOpen
    }

    BlockedSlot {
        string id PK
        string date "YYYY-MM-DD"
        string startTime "09:00"
        string endTime "19:00"
        string reason
        string createdBy FK
        datetime createdAt
    }

    Promotion {
        string id PK
        string title
        string description
        string discountText
        string image
        datetime validFrom
        datetime validTo
        string conditions
        boolean isActive
    }

    Gallery {
        string id PK
        string title
        string category "BALAYAGE | BABYLIGHTS | COLORACION | TRANSFORMACIONES"
        string imageUrl
        string beforeImageUrl
        boolean isPublished
        int displayOrder
        datetime createdAt
    }

    WebsiteContent {
        string id PK
        string sectionKey UK
        string contentJson
        datetime updatedAt
    }

    ActivityLog {
        string id PK
        string userId FK
        string action
        string entity
        string entityId
        string details
        string ipAddress
        datetime createdAt
    }
```

### 2. Índices y Reglas de Integridad
- `User(email)`: Índice único.
- `Appointment(folio)`: Índice único correlativo.
- `Appointment(appointmentDate, status)`: Índice compuesto para consultas instantáneas de disponibilidad.
- `Customer(phone)`: Índice no único para búsquedas rápidas al agendar.
- `ServiceCategory(slug)`: Índice único para URLs amigables.
