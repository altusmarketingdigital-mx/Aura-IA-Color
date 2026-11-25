export interface OfficialServiceItem {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  price: number;
  pricePrefix?: string;
  lengths?: string[];
  isFeatured?: boolean;
  isFallback?: boolean;
}

export interface OfficialServiceCategory {
  id: string;
  name: string;
  description?: string;
  services: OfficialServiceItem[];
}

export const OFFICIAL_SERVICE_CATEGORIES: OfficialServiceCategory[] = [
  {
    id: 'cat-iluminacion',
    name: 'Técnicas de Iluminación',
    description: 'Efectos de luz dimensionales personalizados con degradados sutiles y elegantes.',
    services: [
      {
        id: 'balayage',
        name: 'Balayage',
        description:
          'Técnica de aclaración degradada y natural que aporta luz, dimensión y movimiento al cabello.',
        durationMinutes: 240,
        price: 1600,
        pricePrefix: 'Desde',
        lengths: [
          'Mediano (a la altura del hombro)',
          'Largo (debajo del hombro y media espalda)',
          'Extra Largo (debajo de media espalda)',
        ],
        isFeatured: true,
        isFallback: true,
      },
      {
        id: 'babylights',
        name: 'Babylights',
        description:
          'Técnica de coloración que crea mechas ultra finas y delicadas, imitando los reflejos naturales del sol. Aporta luz, dimensión y un efecto suave y sofisticado en tu cabello.',
        durationMinutes: 210,
        price: 1700,
        pricePrefix: 'Desde',
        lengths: [
          'Mediano (a la altura del hombro)',
          'Largo (debajo del hombro y media espalda)',
          'Extra Largo (debajo de media espalda)',
        ],
        isFeatured: true,
        isFallback: true,
      },
      {
        id: 'money-piece',
        name: 'Money Piece',
        description:
          'Aclaración estratégica en el contorno del rostro que enmarca, ilumina y realza tus facciones.',
        durationMinutes: 120,
        price: 900,
        pricePrefix: 'Desde',
        lengths: [
          'Mediano (a la altura del hombro)',
          'Largo (debajo del hombro y media espalda)',
          'Extra Largo (debajo de media espalda)',
        ],
        isFeatured: true,
        isFallback: true,
      },
    ],
  },
  {
    id: 'cat-decoloracion',
    name: 'Decoloración',
    description: 'Aclaración global uniforme con máxima protección de la fibra capilar.',
    services: [
      {
        id: 'decoloracion-global',
        name: 'Decoloración Global',
        description:
          'Aclaración uniforme en todo el cabello, ideal para lograr rubios muy claros, colores fantasía o como base para otros servicios.',
        durationMinutes: 240,
        price: 990,
        pricePrefix: 'Desde',
        lengths: [
          'Corto (hasta la nuca)',
          'Mediano (a la altura del hombro)',
          'Largo (debajo del hombro y media espalda)',
          'Extra Largo (debajo de media espalda)',
        ],
        isFeatured: true,
        isFallback: true,
      },
    ],
  },
];
