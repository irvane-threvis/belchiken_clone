// ─── Zones de livraison — Ouagadougou ─────────────────────────────────────────
// Tarifs en FCFA, basés sur la distance approximative au centre-ville

export const DELIVERY_ZONES = [
  {
    id: 'centre',
    label: 'Centre-ville / Koulouba',
    neighborhoods: ['Koulouba', 'Zogona', 'Larlé', 'Paspanga'],
    price: 500,
    delay: '15–25 min',
    color: '#16a34a',
  },
  {
    id: 'zone2',
    label: 'Zone 2 — Proximité',
    neighborhoods: ['Dassasgho', 'Gounghin', 'Hamdalaye', 'Bilbalogho'],
    price: 800,
    delay: '20–35 min',
    color: '#2563eb',
  },
  {
    id: 'zone3',
    label: 'Zone 3 — Mi-distance',
    neighborhoods: ['Ouaga 2000', 'Wemtenga', 'Pissy', 'Karpala'],
    price: 1200,
    delay: '30–45 min',
    color: '#d97706',
  },
  {
    id: 'zone4',
    label: 'Zone 4 — Périphérie',
    neighborhoods: ['Kamboinsé', 'Tanghin', 'Saaba', 'Pabré'],
    price: 1500,
    delay: '40–60 min',
    color: '#dc2626',
  },
  {
    id: 'zone5',
    label: 'Zone 5 — Grande périphérie',
    neighborhoods: ['Koubri', 'Kombissiri', 'Loumbila', 'Ziniaré'],
    price: 2000,
    delay: '60–90 min',
    color: '#7c3aed',
  },
]

export function getZoneById(id) {
  return DELIVERY_ZONES.find(z => z.id === id) ?? null
}
