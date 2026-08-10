// ─── Catégories ───────────────────────────────────────────────────────────────
export const CATEGORIES = [
  { id: 'all',             label: 'Tout le menu',    emoji: '🍽️' },
  { id: 'bucket',          label: 'Bucket Poulet',   emoji: '🍗' },
  { id: 'burgers',         label: 'Burgers',         emoji: '🍔' },
  { id: 'accompagnements', label: 'Accompagnements', emoji: '🍟' },
  { id: 'boissons',        label: 'Boissons',        emoji: '🥤' },
  { id: 'combos',          label: 'Menus Combo',     emoji: '🎁' },
]

// ─── Options de sauce ─────────────────────────────────────────────────────────
export const SAUCES = [
  { id: 'ketchup', label: 'Ketchup',        price: 0   },
  { id: 'mayo',    label: 'Mayonnaise',     price: 0   },
  { id: 'bbq',     label: 'BBQ',            price: 0   },
  { id: 'piment',  label: 'Sauce Piment',   price: 0   },
  { id: 'belchi',  label: 'Sauce Belchiken',price: 200 },
]

// ─── Tailles de boisson ───────────────────────────────────────────────────────
export const DRINK_SIZES = [
  { id: 'small',  label: 'Small  (33 cl)', price: 0   },
  { id: 'medium', label: 'Medium (50 cl)', price: 200 },
  { id: 'large',  label: 'Large  (1 L)',   price: 500 },
]

// ─── Images Unsplash — toutes vérifiées actives ───────────────────────────────
const IMG = {
  bucket4:    'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=480&q=80',
  bucket8:    'https://images.unsplash.com/photo-1562967914-608f82629710?w=480&q=80',
  bucket12:   'https://images.unsplash.com/photo-1587241321921-91a834d6d191?w=480&q=80',
  ailes:      'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=480&q=80',
  classic:    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=480&q=80',
  double:     'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=480&q=80',
  zinger:     'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=480&q=80',
  tower:      'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=480&q=80',
  frites:     'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=480&q=80',
  coleslaw:   'https://images.unsplash.com/photo-1546069901-5ec6a79120b0?w=480&q=80', // ✓ salade fraîche
  corn:       'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=480&q=80',
  onion:      'https://images.unsplash.com/photo-1639024471283-03518883512d?w=480&q=80',
  coca:       'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=480&q=80',
  fanta:      'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=480&q=80',
  eau:        'https://images.unsplash.com/photo-1559839914-17aae19cec71?w=480&q=80',
  bissap:     'https://images.unsplash.com/photo-1560963689-b5682b6440f8?w=480&q=80', // ✓ boisson rouge/violette
  combo1:     'https://images.unsplash.com/photo-1550547660-d9450f859349?w=480&q=80',
  combo2:     'https://images.unsplash.com/photo-1561758033-7e924f619b47?w=480&q=80',
  combofam:   'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=480&q=80',
}

// ─── Articles du menu ─────────────────────────────────────────────────────────
export const MENU_ITEMS = [
  // ── Bucket Poulet ──────────────────────────────────────────────────────────
  {
    id: 'bucket-4', category: 'bucket',
    name: 'Bucket 4 Pièces',
    description: '4 morceaux de poulet frit dorés et croustillants, marinés dans notre mélange secret',
    price: 3500, image: IMG.bucket4,
    customizable: true, options: { spicy: true, sauce: true, drinkSize: false },
  },
  {
    id: 'bucket-8', category: 'bucket',
    name: 'Bucket 8 Pièces',
    description: '8 morceaux généreux pour partager — la star de nos tablées',
    price: 6500, image: IMG.bucket8,
    customizable: true, options: { spicy: true, sauce: true, drinkSize: false },
    badge: 'Populaire',
  },
  {
    id: 'bucket-12', category: 'bucket',
    name: 'Bucket 12 Pièces',
    description: '12 morceaux croustillants — idéal pour toute la famille',
    price: 9500, image: IMG.bucket12,
    customizable: true, options: { spicy: true, sauce: true, drinkSize: false },
    badge: 'Famille',
  },
  {
    id: 'aile', category: 'bucket',
    name: 'Ailes de Poulet ×6',
    description: '6 ailes croustillantes et juteuses, marinées maison',
    price: 2500, image: IMG.ailes,
    customizable: true, options: { spicy: true, sauce: true, drinkSize: false },
  },

  // ── Burgers ────────────────────────────────────────────────────────────────
  {
    id: 'burger-classic', category: 'burgers',
    name: 'Burger Classic',
    description: 'Poulet frit doré, salade fraîche, tomate, mayonnaise maison',
    price: 2000, image: IMG.classic,
    customizable: true, options: { spicy: true, sauce: true, drinkSize: false },
  },
  {
    id: 'burger-double', category: 'burgers',
    name: 'Double Burger',
    description: 'Double filet de poulet frit, fromage fondu, oignons caramélisés, pickles',
    price: 3000, image: IMG.double,
    customizable: true, options: { spicy: true, sauce: true, drinkSize: false },
    badge: 'Best-seller',
  },
  {
    id: 'burger-zinger', category: 'burgers',
    name: 'Zinger Burger',
    description: 'Filet épicé extra-croustillant, coleslaw maison, sauce piment rouge',
    price: 2500, image: IMG.zinger,
    customizable: true, options: { spicy: true, sauce: true, drinkSize: false },
    badge: '🌶 Épicé',
  },
  {
    id: 'burger-tower', category: 'burgers',
    name: 'Tower Burger',
    description: 'Poulet XXL, double fromage fondu, sauce Belchiken signature, coleslaw',
    price: 3500, image: IMG.tower,
    customizable: true, options: { spicy: true, sauce: true, drinkSize: false },
    badge: 'Signature',
  },

  // ── Accompagnements ────────────────────────────────────────────────────────
  {
    id: 'frites-reg', category: 'accompagnements',
    name: 'Frites Régulières',
    description: 'Frites croustillantes dorées à la perfection',
    price: 700, image: IMG.frites,
    customizable: false, options: { spicy: false, sauce: true, drinkSize: false },
  },
  {
    id: 'frites-large', category: 'accompagnements',
    name: 'Grandes Frites',
    description: 'Grande portion généreuse de frites croustillantes',
    price: 1000, image: IMG.frites,
    customizable: false, options: { spicy: false, sauce: true, drinkSize: false },
  },
  {
    id: 'coleslaw', category: 'accompagnements',
    name: 'Coleslaw',
    description: 'Salade de chou crémeuse, fraîche et légèrement sucrée',
    price: 500, image: IMG.coleslaw,
    customizable: false, options: { spicy: false, sauce: false, drinkSize: false },
  },
  {
    id: 'corn', category: 'accompagnements',
    name: 'Épi de Maïs',
    description: 'Maïs grillé au beurre doux, fondant et savoureux',
    price: 500, image: IMG.corn,
    customizable: false, options: { spicy: false, sauce: false, drinkSize: false },
  },
  {
    id: 'onion-rings', category: 'accompagnements',
    name: 'Onion Rings ×6',
    description: 'Rondelles d\'oignon panées, légères et croustillantes',
    price: 800, image: IMG.onion,
    customizable: false, options: { spicy: false, sauce: true, drinkSize: false },
  },

  // ── Boissons ───────────────────────────────────────────────────────────────
  {
    id: 'coca', category: 'boissons',
    name: 'Coca-Cola',
    description: 'Boisson gazeuse bien fraîche',
    price: 500, image: IMG.coca,
    customizable: true, options: { spicy: false, sauce: false, drinkSize: true },
  },
  {
    id: 'fanta', category: 'boissons',
    name: 'Fanta Orange',
    description: 'Boisson gazeuse à l\'orange pétillante',
    price: 500, image: IMG.fanta,
    customizable: true, options: { spicy: false, sauce: false, drinkSize: true },
  },
  {
    id: 'sprite', category: 'boissons',
    name: 'Sprite',
    description: 'Boisson gazeuse citron-lime rafraîchissante',
    price: 500, image: IMG.coca,
    customizable: true, options: { spicy: false, sauce: false, drinkSize: true },
  },
  {
    id: 'eau', category: 'boissons',
    name: 'Eau Minérale',
    description: 'Eau fraîche 50 cl',
    price: 300, image: IMG.eau,
    customizable: false, options: { spicy: false, sauce: false, drinkSize: false },
  },
  {
    id: 'jus-bissap', category: 'boissons',
    name: 'Jus de Bissap',
    description: 'Jus de fleur d\'hibiscus maison, fruité et rafraîchissant',
    price: 500, image: IMG.bissap,
    customizable: false, options: { spicy: false, sauce: false, drinkSize: false },
    badge: 'Maison',
  },
  {
    id: 'jus-gingembre', category: 'boissons',
    name: 'Jus de Gingembre',
    description: 'Jus de gingembre frais pressé maison, légèrement épicé',
    price: 500, image: IMG.bissap,
    customizable: false, options: { spicy: false, sauce: false, drinkSize: false },
    badge: 'Maison',
  },

  // ── Menus Combo ────────────────────────────────────────────────────────────
  {
    id: 'combo-1', category: 'combos',
    name: 'Combo Solo',
    description: '1 Burger Classic + Frites Régulières + 1 Boisson au choix',
    price: 3000, image: IMG.combo1,
    customizable: true, options: { spicy: true, sauce: true, drinkSize: true },
    badge: 'Populaire',
  },
  {
    id: 'combo-2', category: 'combos',
    name: 'Combo Duo',
    description: '2 Burgers Classic + 2 Frites + 2 Boissons — parfait pour deux',
    price: 5500, image: IMG.combo2,
    customizable: true, options: { spicy: true, sauce: true, drinkSize: true },
    badge: 'Économique',
  },
  {
    id: 'combo-3', category: 'combos',
    name: 'Combo Famille',
    description: 'Bucket 8 Pièces + Grandes Frites + 4 Boissons + Coleslaw',
    price: 11000, image: IMG.combofam,
    customizable: true, options: { spicy: true, sauce: true, drinkSize: true },
    badge: 'Famille',
  },
  {
    id: 'combo-zinger', category: 'combos',
    name: 'Combo Zinger',
    description: 'Zinger Burger épicé + Grandes Frites + 1 Boisson',
    price: 3500, image: IMG.combo1,
    customizable: true, options: { spicy: true, sauce: true, drinkSize: true },
    badge: '🌶 Épicé',
  },
]

export function getItemById(id) {
  return MENU_ITEMS.find(item => item.id === id) ?? null
}
