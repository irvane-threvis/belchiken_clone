<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { MENU_ITEMS } from '../data/menu.js'
import { useCartStore } from '../store/cart.js'
import MenuFilter from '../components/MenuFilter.vue'
import MenuItem from '../components/MenuItem.vue'
import CustomizationModal from '../components/CustomizationModal.vue'
import CartSidebar from '../components/CartSidebar.vue'

const router = useRouter()
const cart   = useCartStore()

// ── Filtrage ──────────────────────────────────────────────────────────────────
const activeCategory = ref('all')
const filteredItems  = computed(() =>
  activeCategory.value === 'all'
    ? MENU_ITEMS
    : MENU_ITEMS.filter(i => i.category === activeCategory.value)
)

// ── Modal personnalisation ────────────────────────────────────────────────────
const modalOpen    = ref(false)
const selectedItem = ref(null)

function openCustomize(item) {
  selectedItem.value = item
  modalOpen.value    = true
}

// ── Cart sidebar ──────────────────────────────────────────────────────────────
const cartOpen = ref(false)
const cartBump = ref(false)

function onItemAdded() {
  cartBump.value = true
  setTimeout(() => { cartBump.value = false }, 500)
}

// ── Checkout ──────────────────────────────────────────────────────────────────
function handleCheckout() {
  router.push('/checkout')
}
</script>

<template>
  <div class="menu-page">

    <!-- ── Navbar ──────────────────────────────────────────────────────────── -->
    <header class="navbar">
      <div class="navbar-inner">
        <!-- Logo -->
        <a href="/" class="brand" aria-label="Belchiken accueil">
          <span class="brand-icon" aria-hidden="true">🍗</span>
          <span class="brand-name">Belchiken</span>
        </a>

        <!-- Nav links -->
        <nav class="nav-links" aria-label="Navigation principale">
          <a href="#menu" class="nav-link">Menu</a>
          <a href="/admin" class="nav-link nav-link--admin">⚙️ Admin</a>
        </nav>

        <!-- Cart button -->
        <button
          class="cart-btn"
          :class="{ bump: cartBump }"
          aria-label="`Ouvrir le panier (${cart.totalItems} articles)`"
          @click="cartOpen = true"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
          <span class="cart-text">Panier</span>
          <Transition name="badge-pop">
            <span v-if="cart.totalItems > 0" class="cart-badge" aria-live="polite">
              {{ cart.totalItems }}
            </span>
          </Transition>
        </button>
      </div>
    </header>

    <!-- ── Hero ────────────────────────────────────────────────────────────── -->
    <section class="hero" aria-label="Bienvenue chez Belchiken">
      <!-- Image de fond -->
      <div class="hero-bg" aria-hidden="true">
        <img
          src="https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=1600&q=85&auto=format"
          alt=""
          class="hero-bg-img"
          fetchpriority="high"
        />
        <div class="hero-overlay" />
      </div>

      <div class="hero-content">
        <div class="hero-badge">
          <span>🔥</span> Livraison rapide à Ouaga
        </div>
        <h1 class="hero-title">
          Poulet Croustillant<br>
          <span class="hero-accent">comme vous l'aimez</span>
        </h1>
        <p class="hero-sub">
          Composez votre panier en ligne et recevez votre commande directement chez vous.
        </p>
        <div class="hero-cta-row">
          <a href="#menu" class="btn-hero-primary">
            Voir la carte
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </a>
          <div class="hero-pills">
            <span class="hero-pill">🕐 15–60 min</span>
            <span class="hero-pill">📍 Toute Ouaga</span>
          </div>
        </div>
      </div>

      <!-- Features strip -->
      <div class="hero-strip">
        <div class="strip-item">
          <span class="strip-icon">🍗</span>
          <span>Poulet frais chaque jour</span>
        </div>
        <div class="strip-divider" aria-hidden="true" />
        <div class="strip-item">
          <span class="strip-icon">🛵</span>
          <span>Livraison express</span>
        </div>
        <div class="strip-divider" aria-hidden="true" />
        <div class="strip-item">
          <span class="strip-icon">📲</span>
          <span>Commande via WhatsApp</span>
        </div>
        <div class="strip-divider" aria-hidden="true" />
        <div class="strip-item">
          <span class="strip-icon">💯</span>
          <span>Satisfaction garantie</span>
        </div>
      </div>
    </section>

    <!-- ── Menu section ────────────────────────────────────────────────────── -->
    <main id="menu" class="menu-section">
      <div class="menu-header">
        <div>
          <h2 class="section-title">Notre Carte</h2>
          <p class="section-sub">
            {{ filteredItems.length }} article{{ filteredItems.length !== 1 ? 's' : '' }} disponible{{ filteredItems.length !== 1 ? 's' : '' }}
          </p>
        </div>
      </div>

      <!-- Filtres catégories -->
      <MenuFilter v-model="activeCategory" />

      <!-- Grille -->
      <Transition name="fade-grid" mode="out-in">
        <div :key="activeCategory" class="items-grid">
          <MenuItem
            v-for="item in filteredItems"
            :key="item.id"
            :item="item"
            @customize="openCustomize"
          />
        </div>
      </Transition>

      <div v-if="filteredItems.length === 0" class="no-items">
        <span>😕</span>
        <p>Aucun article dans cette catégorie pour le moment.</p>
      </div>
    </main>

    <!-- ── Footer ──────────────────────────────────────────────────────────── -->
    <footer class="site-footer">
      <div class="footer-inner">
        <span class="footer-brand">🍗 Belchiken — Ouagadougou</span>
        <span class="footer-copy">Commandez maintenant via WhatsApp 📲</span>
      </div>
    </footer>

    <!-- ── Modals & Sidebar ─────────────────────────────────────────────────── -->
    <CustomizationModal
      v-model="modalOpen"
      :item="selectedItem"
      @added="onItemAdded"
    />

    <CartSidebar
      v-model="cartOpen"
      @checkout="handleCheckout"
    />

  </div>
</template>

<style scoped>
/* ── Page ──────────────────────────────────────────────────────────────────── */
.menu-page { min-height: 100dvh; background: var(--bk-bg); }

/* ── Navbar ────────────────────────────────────────────────────────────────── */
.navbar {
  position: sticky; top: 0; z-index: 800;
  background: rgba(255,255,255,0.92);
  backdrop-filter: blur(12px) saturate(1.5);
  border-bottom: 1px solid var(--bk-border);
}
@media (prefers-color-scheme: dark) {
  .navbar { background: rgba(24,22,15,0.92); }
}

.navbar-inner {
  max-width: 1200px; margin: 0 auto;
  padding: 0.75rem 1.5rem;
  display: flex; align-items: center; gap: 1rem;
}

.brand {
  display: flex; align-items: center; gap: 0.5rem;
  text-decoration: none; flex-shrink: 0;
}
.brand-icon { font-size: 1.8rem; line-height: 1; }
.brand-name { font-size: 1.4rem; font-weight: 900; color: var(--bk-primary); letter-spacing: -0.03em; }

.nav-links { display: flex; align-items: center; gap: 0.5rem; flex: 1; justify-content: center; }
.nav-link {
  padding: 0.4rem 0.9rem; border-radius: 9999px;
  color: var(--bk-text-muted); font-size: 0.875rem; font-weight: 600;
  text-decoration: none; transition: all 0.2s;
}
.nav-link:hover { color: var(--bk-primary); background: var(--bk-primary-light); }
.nav-link--admin { font-size: 0.8rem; }

@media (max-width: 640px) { .nav-links { display: none; } }

/* Cart button */
.cart-btn {
  position: relative; display: flex; align-items: center; gap: 0.45rem;
  padding: 0.6rem 1.1rem; background: var(--bk-primary); color: #fff;
  border: none; border-radius: 9999px; font-size: 0.875rem; font-weight: 700;
  cursor: pointer; transition: background 0.2s, transform 0.2s; flex-shrink: 0;
  box-shadow: 0 4px 14px rgba(225,29,72,0.35);
}
.cart-btn:hover { background: var(--bk-primary-dark); transform: translateY(-1px); }
.cart-btn.bump { animation: bump 0.4s ease; }
@keyframes bump { 0%,100%{transform:scale(1)} 40%{transform:scale(1.2)} 70%{transform:scale(0.93)} }

.cart-text { font-weight: 700; }
@media (max-width: 480px) { .cart-text { display: none; } }

.cart-badge {
  position: absolute; top: -7px; right: -7px;
  background: var(--bk-accent); color: #fff;
  font-size: 0.65rem; font-weight: 800; min-width: 1.3rem; height: 1.3rem;
  border-radius: 9999px; display: flex; align-items: center; justify-content: center;
  border: 2px solid white;
}

.badge-pop-enter-active { transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s; }
.badge-pop-enter-from   { transform: scale(0); opacity: 0; }

/* ── Hero ──────────────────────────────────────────────────────────────────── */
.hero { position: relative; min-height: 580px; display: flex; flex-direction: column; }
@media (max-width: 768px) { .hero { min-height: 480px; } }

.hero-bg { position: absolute; inset: 0; overflow: hidden; }
.hero-bg-img { width: 100%; height: 100%; object-fit: cover; object-position: center; }
.hero-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(
    160deg,
    rgba(10,5,0,0.82) 0%,
    rgba(30,10,0,0.70) 40%,
    rgba(20,5,0,0.55) 100%
  );
}

.hero-content {
  position: relative; z-index: 1; flex: 1;
  max-width: 1200px; margin: 0 auto; width: 100%;
  padding: 5rem 1.5rem 3rem;
  display: flex; flex-direction: column; align-items: flex-start; gap: 1.25rem;
}
@media (max-width: 768px) { .hero-content { padding: 3rem 1.25rem 2rem; } }

.hero-badge {
  display: inline-flex; align-items: center; gap: 0.4rem;
  background: rgba(249,115,22,0.15); border: 1px solid rgba(249,115,22,0.4);
  color: #fdba74; padding: 0.35rem 0.85rem; border-radius: 9999px;
  font-size: 0.8rem; font-weight: 600; backdrop-filter: blur(4px);
}

.hero-title {
  font-size: clamp(2.2rem, 6vw, 3.5rem);
  font-weight: 900; color: #fff;
  letter-spacing: -0.03em; line-height: 1.1;
}
.hero-accent {
  color: var(--bk-accent);
  background: linear-gradient(90deg, #f97316, #fbbf24);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-sub {
  font-size: 1.05rem; color: rgba(255,255,255,0.75);
  max-width: 500px; line-height: 1.6;
}

.hero-cta-row { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }

.btn-hero-primary {
  display: inline-flex; align-items: center; gap: 0.4rem;
  padding: 0.85rem 1.75rem;
  background: linear-gradient(135deg, var(--bk-primary) 0%, var(--bk-accent) 100%);
  color: #fff; border: none; border-radius: 9999px;
  font-size: 1rem; font-weight: 800; text-decoration: none; cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 6px 20px rgba(225,29,72,0.4);
}
.btn-hero-primary:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(225,29,72,0.5); }

.hero-pills { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.hero-pill {
  background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.2);
  color: rgba(255,255,255,0.85); padding: 0.4rem 0.85rem;
  border-radius: 9999px; font-size: 0.8rem; font-weight: 500; backdrop-filter: blur(4px);
}

/* Features strip */
.hero-strip {
  position: relative; z-index: 1;
  background: rgba(0,0,0,0.55); backdrop-filter: blur(8px);
  border-top: 1px solid rgba(255,255,255,0.08);
  display: flex; align-items: center; justify-content: center;
  padding: 1rem 1.5rem; gap: 0; flex-wrap: wrap;
}
.strip-item {
  display: flex; align-items: center; gap: 0.5rem;
  color: rgba(255,255,255,0.82); font-size: 0.82rem; font-weight: 500;
  padding: 0.25rem 1.5rem;
}
.strip-icon { font-size: 1.1rem; }
.strip-divider { width: 1px; height: 20px; background: rgba(255,255,255,0.15); }
@media (max-width: 640px) {
  .strip-item { padding: 0.4rem 0.75rem; font-size: 0.75rem; }
  .strip-divider { display: none; }
}

/* ── Menu section ──────────────────────────────────────────────────────────── */
.menu-section {
  max-width: 1200px; margin: 0 auto;
  padding: 2.5rem 1.5rem 5rem;
}

.menu-header { margin-bottom: 0.25rem; }
.section-title { font-size: 1.75rem; font-weight: 900; color: var(--bk-text); letter-spacing: -0.02em; }
.section-sub { font-size: 0.85rem; color: var(--bk-text-muted); margin-top: 0.2rem; }

/* Grid */
.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1.5rem; margin-top: 1.25rem;
}
@media (max-width: 480px) {
  .items-grid { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 0.75rem; }
}

.no-items {
  text-align: center; padding: 4rem 2rem;
  color: var(--bk-text-muted); font-size: 0.9rem;
  display: flex; flex-direction: column; align-items: center; gap: 0.5rem;
}
.no-items span { font-size: 2.5rem; }

/* Grid transition */
.fade-grid-enter-active, .fade-grid-leave-active { transition: opacity 0.2s ease; }
.fade-grid-enter-from, .fade-grid-leave-to { opacity: 0; }

/* ── Footer ────────────────────────────────────────────────────────────────── */
.site-footer {
  background: var(--bk-text); color: rgba(255,255,255,0.7);
  padding: 1.5rem;
}
.footer-inner {
  max-width: 1200px; margin: 0 auto;
  display: flex; align-items: center; justify-content: space-between;
  flex-wrap: wrap; gap: 0.5rem; font-size: 0.82rem;
}
.footer-brand { font-weight: 700; color: #fff; }
</style>
