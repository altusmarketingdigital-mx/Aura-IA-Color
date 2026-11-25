"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('--- Iniciando Semilla de Base de Datos para AURA IA COLOR ---');
    // 1. Limpieza inicial controlada (idempotente)
    await prisma.activityLog.deleteMany();
    await prisma.appointmentPhoto.deleteMany();
    await prisma.appointment.deleteMany();
    await prisma.blockedSlot.deleteMany();
    await prisma.businessHours.deleteMany();
    await prisma.service.deleteMany();
    await prisma.serviceCategory.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.promotion.deleteMany();
    await prisma.gallery.deleteMany();
    await prisma.websiteContent.deleteMany();
    await prisma.user.deleteMany();
    // 2. Usuarios Administrativos Iniciales
    const passwordAdmin = await bcryptjs_1.default.hash('AuraAdmin2026!Master', 10);
    const passwordOperativo = await bcryptjs_1.default.hash('AuraOperativa2026!', 10);
    const adminPrincipal = await prisma.user.create({
        data: {
            name: 'Sara Beltrán Arias',
            email: 'direccion@auraiacolor.mx',
            passwordHash: passwordAdmin,
            role: 'ADMIN_PRINCIPAL',
            isActive: true,
        },
    });
    const adminOperativo = await prisma.user.create({
        data: {
            name: 'Luz Adriana González Varela',
            email: 'operaciones@auraiacolor.mx',
            passwordHash: passwordOperativo,
            role: 'ADMIN_OPERATIVO',
            isActive: true,
        },
    });
    console.log(`[Seed] Usuarios creados: ${adminPrincipal.email} y ${adminOperativo.email}`);
    // 3. Horarios Oficiales de Atención (Lunes a Sábado de 09:00 a 19:00, Domingos cerrado)
    const daysOfWeek = [
        { dayOfWeek: 0, openTime: '09:00', closeTime: '19:00', isOpen: false }, // Domingo
        { dayOfWeek: 1, openTime: '09:00', closeTime: '19:00', isOpen: true }, // Lunes
        { dayOfWeek: 2, openTime: '09:00', closeTime: '19:00', isOpen: true }, // Martes
        { dayOfWeek: 3, openTime: '09:00', closeTime: '19:00', isOpen: true }, // Miércoles
        { dayOfWeek: 4, openTime: '09:00', closeTime: '19:00', isOpen: true }, // Jueves
        { dayOfWeek: 5, openTime: '09:00', closeTime: '19:00', isOpen: true }, // Viernes
        { dayOfWeek: 6, openTime: '09:00', closeTime: '19:00', isOpen: true }, // Sábado
    ];
    for (const day of daysOfWeek) {
        await prisma.businessHours.create({ data: day });
    }
    console.log('[Seed] Horarios de atención registrados');
    // 4. Categorías Oficiales y Servicios de AURA IA COLOR
    const catMantenimiento = await prisma.serviceCategory.create({
        data: {
            name: 'Mantenimiento y Coloración',
            slug: 'mantenimiento-y-coloracion',
            description: 'Cuidado continuo y cobertura experta para mantener tu tono impecable y con brillo vibrante.',
            displayOrder: 1,
        },
    });
    const catIluminacion = await prisma.serviceCategory.create({
        data: {
            name: 'Técnicas de Iluminación',
            slug: 'tecnicas-de-iluminacion',
            description: 'Efectos de luz dimensionales personalizados con degradados sutiles y elegantes.',
            displayOrder: 2,
        },
    });
    const catDecoloracion = await prisma.serviceCategory.create({
        data: {
            name: 'Decoloración',
            slug: 'decoloracion',
            description: 'Aclaración global progresiva con máxima protección de la fibra capilar.',
            displayOrder: 3,
        },
    });
    const catCreativa = await prisma.serviceCategory.create({
        data: {
            name: 'Coloración Creativa',
            slug: 'coloracion-creativa',
            description: 'Formulaciones audaces y tonos fantasía con pigmentos puros de alta durabilidad.',
            displayOrder: 4,
        },
    });
    const catIA = await prisma.serviceCategory.create({
        data: {
            name: 'Colorimetría con Inteligencia Artificial',
            slug: 'colorimetria-con-ia',
            description: 'Diagnóstico asistido y precisión matemática en la mezcla cromática para tu tono exacto.',
            displayOrder: 5,
        },
    });
    // Servicios por Categoría
    const servicesData = [
        // A. Mantenimiento y Coloración
        {
            categoryId: catMantenimiento.id,
            name: 'Retoque de Crecimiento',
            description: 'Aplicación precisa de color en la raíz para igualar el tono sin sobreprocesar las puntas.',
            durationMinutes: 90,
            price: 1100.0,
            bufferMinutes: 15,
            isFeatured: false,
        },
        {
            categoryId: catMantenimiento.id,
            name: 'Baño de Color / Gloss',
            description: 'Tratamiento tonificador que aporta brillo espejo y revitaliza el matiz del cabello apagado.',
            durationMinutes: 60,
            price: 950.0,
            bufferMinutes: 15,
            isFeatured: false,
        },
        {
            categoryId: catMantenimiento.id,
            name: 'Tinte Global',
            description: 'Coloración integral de raíz a puntas con pigmentos nutritivos y acabado uniforme.',
            durationMinutes: 120,
            price: 1600.0,
            bufferMinutes: 15,
            isFeatured: true,
        },
        // B. Técnicas de Iluminación
        {
            categoryId: catIluminacion.id,
            name: 'Balayage',
            description: 'Técnica de aclaración degradada y natural que aporta luz, dimensión y movimiento al cabello. (Largo: Mediano, Largo y Extra Largo — Precio desde $1,600)',
            durationMinutes: 240,
            price: 1600.0,
            bufferMinutes: 30,
            isFeatured: true,
        },
        {
            categoryId: catIluminacion.id,
            name: 'Babylights',
            description: 'Técnica de coloración que crea mechas ultra finas y delicadas, imitando los reflejos naturales del sol. Aporta luz, dimensión y un efecto suave y sofisticado en tu cabello. (Largo: Mediano, Largo y Extra Largo — Precio desde $1,700)',
            durationMinutes: 210,
            price: 1700.0,
            bufferMinutes: 20,
            isFeatured: true,
        },
        {
            categoryId: catIluminacion.id,
            name: 'Money Piece',
            description: 'Aclaración estratégica en el contorno del rostro que enmarca, ilumina y realza tus facciones. (Largo: Mediano, Largo y Extra Largo — Precio desde $900)',
            durationMinutes: 120,
            price: 900.0,
            bufferMinutes: 15,
            isFeatured: true,
        },
        {
            categoryId: catIluminacion.id,
            name: 'Efectos de Iluminación Personalizados',
            description: 'Diseño tridimensional a medida combinando contrastes estratégicos según tu tipo de corte.',
            durationMinutes: 180,
            price: 2400.0,
            bufferMinutes: 20,
            isFeatured: false,
        },
        // C. Decoloración
        {
            categoryId: catDecoloracion.id,
            name: 'Decoloración Global',
            description: 'Aclaración uniforme en todo el cabello, ideal para lograr rubios muy claros, colores fantasía o como base para otros servicios. (Largo: Corto, Mediano, Largo y Extra Largo — Precio desde $990)',
            durationMinutes: 240,
            price: 990.0,
            bufferMinutes: 30,
            isFeatured: true,
        },
        // D. Coloración Creativa
        {
            categoryId: catCreativa.id,
            name: 'Tonos Fantasía y Pasteles',
            description: 'Coloración vibrante en tonos pastel, neón o fantasía con base previamente neutralizada.',
            durationMinutes: 180,
            price: 2600.0,
            bufferMinutes: 20,
            isFeatured: false,
        },
        // E. Colorimetría con Inteligencia Artificial
        {
            categoryId: catIA.id,
            name: 'Asesoría y Diagnóstico con IA',
            description: 'Evaluación técnica de subtono de piel, porosidad y pigmento residual mediante asistencia algorítmica.',
            durationMinutes: 45,
            price: 650.0,
            bufferMinutes: 15,
            isFeatured: true,
        },
        {
            categoryId: catIA.id,
            name: 'Coloración Completa con Formulación Tecnológica',
            description: 'Experiencia insignia de AURA IA COLOR: formulación de pigmentos asistida por IA + aplicación master.',
            durationMinutes: 210,
            price: 3400.0,
            bufferMinutes: 30,
            isFeatured: true,
        },
    ];
    for (const s of servicesData) {
        await prisma.service.create({ data: s });
    }
    console.log(`[Seed] ${servicesData.length} servicios registrados en catálogo`);
    // 5. Promoción Oficial
    await prisma.promotion.create({
        data: {
            title: 'Premio a tu Lealtad',
            discountText: '50% DE DESCUENTO',
            description: 'En tu quinta visita recibe 50% de descuento en el servicio de color de tu preferencia.',
            conditions: 'Válido al completar 4 visitas previas en el sistema. No acumulable con otras promociones.',
            isActive: true,
        },
    });
    console.log('[Seed] Promoción oficial registrada');
    // 6. Galería Inicial
    const galleryItems = [
        {
            title: 'Balayage Caramelo Miel',
            category: 'BALAYAGE',
            imageUrl: 'https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=800&q=80',
            beforeImage: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
            isPublished: true,
            displayOrder: 1,
        },
        {
            title: 'Babylights Vainilla Luminoso',
            category: 'BABYLIGHTS',
            imageUrl: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=800&q=80',
            isPublished: true,
            displayOrder: 2,
        },
        {
            title: 'Corrección y Tinte Global Chocolate',
            category: 'COLORACION',
            imageUrl: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?auto=format&fit=crop&w=800&q=80',
            isPublished: true,
            displayOrder: 3,
        },
        {
            title: 'Transformación Total Rubio Beige',
            category: 'TRANSFORMACIONES',
            imageUrl: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=800&q=80',
            isPublished: true,
            displayOrder: 4,
        },
    ];
    for (const item of galleryItems) {
        await prisma.gallery.create({ data: item });
    }
    console.log('[Seed] Galería inicial registrada');
    // 7. Contenido Institucional Administrable
    await prisma.websiteContent.create({
        data: {
            sectionKey: 'business_info',
            contentJson: JSON.stringify({
                name: 'AURA IA COLOR',
                slogan: 'TU COLOR. TU ESENCIA. TU TECNOLOGÍA.',
                subheadline: 'Descubre una nueva experiencia de coloración capilar con tecnología de inteligencia artificial y asesoría personalizada.',
                address: 'Obrero Mundial 122, Local 2, Colonia Del Valle Norte, Benito Juárez, Ciudad de México',
                phone: '55 3729 3887',
                whatsapp: '525537293887',
                instagram: '@aura.iacolor',
                responsible: 'Sara Beltrán Arias y Luz Adriana González Varela',
                hoursText: 'Lunes a sábado de 09:00 a 19:00 horas. Domingos cerrado.',
                googleMapsUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3763.1554581452267!2d-99.1625902!3d19.4005995!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85d1ff11005a818f%3A0x6b77ea8c538a7c26!2sC.%20Obrero%20Mundial%20122%2C%20Del%20Valle%20Nte.%2C%20Benito%20Ju%C3%A1rez%2C%2003103%20Ciudad%20de%20M%C3%A9xico%2C%20CDMX!5e0!3m2!1ses-419!2smx!4v1700000000000!5m2!1ses-419!2smx'
            }),
        },
    });
    console.log('--- Semilla completada con éxito para AURA IA COLOR ---');
}
main()
    .catch((e) => {
    console.error('Error durante la ejecución del seed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
