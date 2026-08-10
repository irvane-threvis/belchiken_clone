<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../store/cart.js'
import { useOrdersStore } from '../store/orders.js'
import { DELIVERY_ZONES } from '../data/zones.js'

const router = useRouter()
const cart   = useCartStore()
const orders = useOrdersStore()

// ── Numéro WhatsApp de l'établissement ────────────────────────────────────────
const WHATSAPP_NUMBER = '22600000000' // ← à remplacer par le vrai numéro

// ── Formulaire client ─────────────────────────────────────────────────────────
const form = ref({
  name:    '',
  phone:   '',
  address: '',
})

const selectedZoneId = ref('')
const errors         = ref({})
const submitted      = ref(false)

// ── Zone sélectionnée ─────────────────────────────────────────────────────────
const selectedZone = computed(() =>
  DELIVERY_ZONES.find(z => z.id === selectedZoneId.value) ?? null
)

const deliveryFee = computed(() => selectedZone.value?.price ?? 0)

const total = computed(() => cart.subtotal + deliveryFee.value)

const formattedSubtotal  = computed(() => cart.formatPrice(cart.subtotal))
const formattedDelivery  = computed(() => deliveryFee.value ? cart.formatPrice(deliveryFee.value) : 'Sélectionner une zone')
const formattedTotal     = computed(() => cart.formatPrice(total.value))

// ── Validation ────────────────────────────────────────────────────────────────
function validate() {
  const e = {}
  if (!form.value.name.trim())    e.name    = 'Le nom est requis'
  if (!form.value.phone.trim())   e.phone   = 'Le téléphone est requis'
  else if (!/^[0-9+\s]{8,15}$/.test(form.value.phone.trim()))
                                  e.phone   = 'Numéro invalide (ex: 70 00 00 00)'
  if (!form.value.address.trim()) e.address = 'L\'adresse est requise'
  if (!selectedZoneId.value)      e.zone    = 'Choisissez une zone de livraison'
  errors.value = e
  return Object.keys(e).length === 0
}

// ── Génération message WhatsApp ───────────────────────────────────────────────
function buildWhatsAppMessage() {
  const lines = []
  lines.push('🍗 *NOUVELLE COMMANDE BELCHIKEN*')
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━')
  lines.push('')
  lines.push('👤 *CLIENT*')
  lines.push(`Nom : ${form.value.name.trim()}`)
  lines.push(`Tél : ${form.value.phone.trim()}`)
  lines.push(`Adresse : ${form.value.address.trim()}`)
  lines.push('')
  lines.push('🛒 *COMMANDE*')
  cart.items.forEach(item => {
    const opts = cart.optionsLabel(item)
    const price = cart.formatPrice(cart.lineTotal(item))
    lines.push(`• ${item.name} ×${item.quantity} — ${price}`)
    if (opts) lines.push(`  ↳ ${opts}`)
  })
  lines.push('')
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━')
  lines.push(`📦 Sous-total : ${formattedSubtotal.value}`)
  lines.push(`🛵 Livraison (${selectedZone.value?.label}) : ${cart.formatPrice(deliveryFee.value)}`)
  lines.push(`⏱️ Délai estimé : ${selectedZone.value?.delay}`)
  lines.push(`💰 *TOTAL : ${formattedTotal.value}*`)
  lines.push('')
  lines.push('Merci de confirmer la commande ! 🙏')
  return lines.join('\n')
}

// ── Soumission ────────────────────────────────────────────────────────────────
function submitOrder() {
  if (!validate()) return

  // Snapshot de la commande pour l'historique
  const itemsSnapshot = cart.items.map(item => ({
    name:      item.name,
    quantity:  item.quantity,
    unitPrice: cart.unitPrice(item),
    lineTotal: cart.lineTotal(item),
    options:   cart.optionsLabel(item),
  }))

  orders.saveOrder({
    items:    itemsSnapshot,
    subtotal: cart.subtotal,
    delivery: deliveryFee.value,
    total:    total.value,
    zone:     { id: selectedZone.value.id, label: selectedZone.value.label, price: deliveryFee.value },
    client:   { ...form.value },
  })

  // Génération lien WhatsApp
  const message = buildWhatsAppMessage()
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`

  // Vider le panier
  cart.clearCart()
  submitted.value = true

  // Ouvrir WhatsApp
  window.open(url, '_blank', 'noopener,noreferrer')
}

function goBack() {
  router.push('/')
}
</script>

<template>
  <div class="checkout-page">

    <!-- ── Navbar ─────────────────────────────────────────────────────────── -->
    <header class="ck-navbar">
      <div class="ck-navbar-inner">
        <button class="back-btn" aria-label="Retour au menu" @click="goBack">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Retour
        </button>
        <span class="ck-brand">🍗 Belchiken</span>
        <div style="width:80px" />
      </div>
    </header>

    <!-- ── Success screen ────────────────────────────────────────────────── -->
    <div v-if="submitted" class="success-screen">
      <div class="success-card">
        <div class="success-icon">✅</div>
        <h1 class="success-title">Commande envoyée !</h1>
        <p class="success-sub">
          Votre commande a été transmise à notre équipe via WhatsApp.<br>
          Nous vous confirmons sous peu.
        </p>
        <button class="btn-primary" @click="goBack">Retour au menu</button>
      </div>
    </div>

    <!-- ── Checkout form ──────────────────────────────────────────────────── -->
    <main v-else class="ck-main">

      <!-- Panier vide -->
      <div v-if="cart.items.length === 0" class="empty-cart">
        <p class="empty-emoji">🛒</p>
        <p class="empty-text">Votre panier est vide</p>
        <button class="btn-primary" @click="goBack">Parcourir le menu</button>
      </div>

      <template v-else>
        <div class="ck-layout">

          <!-- ── Colonne gauche : formulaire ─────────────────────────────── -->
          <div class="ck-form-col">

            <!-- Zone de livraison -->
            <section class="ck-card">
              <h2 class="ck-section-title">
                <span class="section-icon">🛵</span> Zone de livraison
              </h2>

              <div class="zone-grid">
                <button
                  v-for="zone in DELIVERY_ZONES"
                  :key="zone.id"
                  :class="['zone-btn', { active: selectedZoneId === zone.id }]"
                  :style="selectedZoneId === zone.id ? `--zone-color: ${zone.color}` : ''"
                  type="button"
                  @click="selectedZoneId = zone.id; delete errors.zone"
                >
                  <span class="zone-label">{{ zone.label }}</span>
                  <span class="zone-hoods">{{ zone.neighborhoods.join(', ') }}</span>
                  <span class="zone-meta">
                    <span class="zone-price" :style="`color: ${zone.color}`">
                      {{ zone.price.toLocaleString('fr-FR') }} FCFA
                    </span>
                    <span class="zone-delay">⏱️ {{ zone.delay }}</span>
                  </span>
                </button>
              </div>
              <p v-if="errors.zone" class="field-error">{{ errors.zone }}</p>
            </section>

            <!-- Infos client -->
            <section class="ck-card">
              <h2 class="ck-section-title">
                <span class="section-icon">👤</span> Vos informations
              </h2>

              <div class="form-grid">
                <!-- Nom -->
                <div class="field">
                  <label class="field-label" for="name">Nom complet</label>
                  <input
                    id="name"
                    v-model="form.name"
                    type="text"
                    class="field-input"
                    :class="{ 'field-input--error': errors.name }"
                    placeholder="Ex: Moussa Traoré"
                    autocomplete="name"
                    @input="delete errors.name"
                  />
                  <p v-if="errors.name" class="field-error">{{ errors.name }}</p>
                </div>

                <!-- Téléphone -->
                <div class="field">
                  <label class="field-label" for="phone">Téléphone</label>
                  <input
                    id="phone"
                    v-model="form.phone"
                    type="tel"
                    class="field-input"
                    :class="{ 'field-input--error': errors.phone }"
                    placeholder="Ex: 70 00 00 00"
                    autocomplete="tel"
                    @input="delete errors.phone"
                  />
                  <p v-if="errors.phone" class="field-error">{{ errors.phone }}</p>
                </div>

                <!-- Adresse -->
                <div class="field field--full">
                  <label class="field-label" for="address">Adresse / Repère local</label>
                  <textarea
                    id="address"
                    v-model="form.address"
                    class="field-input field-textarea"
                    :class="{ 'field-input--error': errors.address }"
                    placeholder="Ex: Quartier Zogona, près de la pharmacie Saint-Luc, porte bleue"
                    rows="3"
                    @input="delete errors.address"
                  />
                  <p v-if="errors.address" class="field-error">{{ errors.address }}</p>
                </div>
              </div>
            </section>
          </div>

          <!-- ── Colonne droite : récapitulatif ──────────────────────────── -->
          <div class="ck-summary-col">
            <div class="ck-card summary-sticky">
              <h2 class="ck-section-title">
                <span class="section-icon">🧾</span> Récapitulatif
              </h2>

              <!-- Articles -->
              <ul class="summary-items">
                <li v-for="item in cart.items" :key="item.cartItemId" class="summary-item">
                  <div class="summary-item-info">
                    <span class="summary-item-name">{{ item.name }} ×{{ item.quantity }}</span>
                    <span v-if="cart.optionsLabel(item)" class="summary-item-opts">
                      {{ cart.optionsLabel(item) }}
                    </span>
                  </div>
                  <span class="summary-item-price">
                    {{ cart.formatPrice(cart.lineTotal(item)) }}
                  </span>
                </li>
              </ul>

              <div class="summary-divider" />

              <!-- Totaux -->
              <div class="summary-totals">
                <div class="summary-row">
                  <span>Sous-total</span>
                  <span>{{ formattedSubtotal }}</span>
                </div>
                <div class="summary-row">
                  <span>Livraison</span>
                  <span :class="{ 'text-muted': !selectedZone }">
                    {{ formattedDelivery }}
                  </span>
                </div>
              </div>

              <div class="summary-total-row">
                <span>Total</span>
                <span class="total-amount">{{ formattedTotal }}</span>
              </div>

              <!-- Zone sélectionnée badge -->
              <div v-if="selectedZone" class="zone-badge" :style="`background: ${selectedZone.color}15; border-color: ${selectedZone.color}40`">
                <span :style="`color: ${selectedZone.color}`">📍 {{ selectedZone.label }}</span>
                <span :style="`color: ${selectedZone.color}`">⏱️ {{ selectedZone.delay }}</span>
              </div>

              <!-- CTA WhatsApp -->
              <button class="btn-whatsapp" @click="submitOrder">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Commander via WhatsApp
              </button>

              <p class="wa-note">
                Vous serez redirigé vers WhatsApp avec votre bon de commande pré-rempli.
              </p>
            </div>
          </div>
        </div>
      </template>
    </main>
  </div>
</template>

<style scoped>
/* ── Page ──────────────────────────────────────────────────────────────────── */
.checkout-page {
  min-height: 100dvh;
  background: var(--bk-bg);
}

/* ── Navbar ────────────────────────────────────────────────────────────────── */
.ck-navbar {
  background: var(--bk-surface);
  border-bottom: 1px solid var(--bk-border);
  position: sticky;
  top: 0;
  z-index: 100;
}

.ck-navbar-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0.85rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: none;
  border: 1.5px solid var(--bk-border);
  border-radius: 9999px;
  padding: 0.4rem 0.9rem;
  color: var(--bk-text-muted);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.back-btn:hover { border-color: var(--bk-primary); color: var(--bk-primary); }

.ck-brand {
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--bk-primary);
}

/* ── Main layout ───────────────────────────────────────────────────────────── */
.ck-main {
  max-width: 1100px;
  margin: 0 auto;
  padding: 2rem 1.5rem 4rem;
}

.ck-layout {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 1.75rem;
  align-items: start;
}

@media (max-width: 900px) {
  .ck-layout {
    grid-template-columns: 1fr;
  }
}

/* ── Card ──────────────────────────────────────────────────────────────────── */
.ck-card {
  background: var(--bk-surface);
  border: 1px solid var(--bk-border);
  border-radius: 1.25rem;
  padding: 1.5rem;
  margin-bottom: 1.25rem;
}

.ck-form-col .ck-card:last-child { margin-bottom: 0; }

.ck-section-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--bk-text);
  margin: 0 0 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-icon { font-size: 1.2rem; }

/* ── Zone grid ─────────────────────────────────────────────────────────────── */
.zone-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

@media (max-width: 600px) {
  .zone-grid { grid-template-columns: 1fr; }
}

.zone-btn {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  padding: 0.9rem 1rem;
  border: 2px solid var(--bk-border);
  border-radius: 1rem;
  background: var(--bk-surface);
  text-align: left;
  cursor: pointer;
  transition: all 0.2s;
}

.zone-btn:hover {
  border-color: var(--bk-primary);
  background: var(--bk-primary-light);
}

.zone-btn.active {
  border-color: var(--zone-color, var(--bk-primary));
  background: color-mix(in srgb, var(--zone-color, var(--bk-primary)) 8%, transparent);
}

.zone-label {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--bk-text);
  line-height: 1.3;
}

.zone-hoods {
  font-size: 0.72rem;
  color: var(--bk-text-muted);
  line-height: 1.4;
}

.zone-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-top: 0.2rem;
}

.zone-price {
  font-size: 0.82rem;
  font-weight: 800;
}

.zone-delay {
  font-size: 0.72rem;
  color: var(--bk-text-muted);
}

/* ── Form fields ───────────────────────────────────────────────────────────── */
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

@media (max-width: 600px) {
  .form-grid { grid-template-columns: 1fr; }
}

.field { display: flex; flex-direction: column; gap: 0.4rem; }
.field--full { grid-column: 1 / -1; }

.field-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--bk-text);
}

.field-input {
  padding: 0.65rem 0.9rem;
  border: 1.5px solid var(--bk-border);
  border-radius: 0.75rem;
  background: var(--bk-bg-muted);
  color: var(--bk-text);
  font-size: 0.9rem;
  font-family: inherit;
  transition: border-color 0.2s, box-shadow 0.2s;
  outline: none;
}

.field-input:focus {
  border-color: var(--bk-primary);
  box-shadow: 0 0 0 3px var(--bk-primary-light);
}

.field-input--error {
  border-color: #ef4444;
}

.field-textarea {
  resize: vertical;
  min-height: 80px;
}

.field-error {
  font-size: 0.75rem;
  color: #ef4444;
  margin: 0;
}

/* ── Summary ───────────────────────────────────────────────────────────────── */
.summary-sticky {
  position: sticky;
  top: 80px;
  margin-bottom: 0;
}

.summary-items {
  list-style: none;
  margin: 0 0 1rem;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  align-items: flex-start;
}

.summary-item-info { flex: 1; min-width: 0; }

.summary-item-name {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--bk-text);
}

.summary-item-opts {
  display: block;
  font-size: 0.72rem;
  color: var(--bk-text-muted);
  margin-top: 0.1rem;
}

.summary-item-price {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--bk-text);
  white-space: nowrap;
}

.summary-divider {
  height: 1px;
  background: var(--bk-border);
  margin: 0.75rem 0;
}

.summary-totals {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-bottom: 0.75rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: var(--bk-text-muted);
}

.text-muted { color: var(--bk-text-muted); font-style: italic; }

.summary-total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-top: 2px solid var(--bk-border);
  font-size: 1rem;
  font-weight: 700;
  color: var(--bk-text);
  margin-bottom: 1rem;
}

.total-amount {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--bk-primary);
}

/* Zone badge */
.zone-badge {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.6rem 0.9rem;
  border-radius: 0.75rem;
  border: 1px solid transparent;
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 1rem;
  gap: 0.5rem;
}

/* WhatsApp CTA */
.btn-whatsapp {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  padding: 0.85rem;
  background: #25d366;
  color: #fff;
  border: none;
  border-radius: 9999px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s, transform 0.15s;
  box-shadow: 0 4px 15px rgba(37, 211, 102, 0.35);
}

.btn-whatsapp:hover { background: #1ebe5d; transform: translateY(-1px); }
.btn-whatsapp:active { transform: translateY(0); }

.wa-note {
  font-size: 0.72rem;
  color: var(--bk-text-muted);
  text-align: center;
  margin: 0.75rem 0 0;
  line-height: 1.5;
}

/* ── Success screen ────────────────────────────────────────────────────────── */
.success-screen {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100dvh - 60px);
  padding: 2rem;
}

.success-card {
  background: var(--bk-surface);
  border: 1px solid var(--bk-border);
  border-radius: 1.5rem;
  padding: 3rem 2rem;
  text-align: center;
  max-width: 440px;
  width: 100%;
}

.success-icon { font-size: 4rem; margin-bottom: 1rem; }

.success-title {
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--bk-text);
  margin: 0 0 0.75rem;
}

.success-sub {
  font-size: 0.95rem;
  color: var(--bk-text-muted);
  line-height: 1.6;
  margin: 0 0 2rem;
}

/* ── Empty cart ────────────────────────────────────────────────────────────── */
.empty-cart {
  text-align: center;
  padding: 4rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.empty-emoji { font-size: 3.5rem; margin: 0; }
.empty-text  { font-size: 1.1rem; font-weight: 600; color: var(--bk-text); margin: 0; }

/* ── Shared buttons ────────────────────────────────────────────────────────── */
.btn-primary {
  padding: 0.75rem 1.75rem;
  background: var(--bk-primary);
  color: #fff;
  border: none;
  border-radius: 9999px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s, transform 0.15s;
}
.btn-primary:hover { background: var(--bk-primary-dark); transform: translateY(-1px); }
</style>
