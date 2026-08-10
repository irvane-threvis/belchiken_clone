<script setup>
import { ref, computed, watch } from 'vue'
import { SAUCES, DRINK_SIZES } from '../data/menu.js'
import { useCartStore } from '../store/cart.js'

const props = defineProps({
  item: {
    type: Object,
    default: null,
  },
  modelValue: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'added'])

const cart = useCartStore()

// ── Options locales ────────────────────────────────────────────────────────────
const spicy     = ref(false)
const sauce     = ref(null)
const drinkSize = ref('small')
const quantity  = ref(1)

// Réinitialiser à chaque ouverture
watch(() => props.modelValue, (open) => {
  if (open) {
    spicy.value     = false
    sauce.value     = null
    drinkSize.value = 'small'
    quantity.value  = 1
  }
})

// ── Prix calculé ──────────────────────────────────────────────────────────────
const unitPrice = computed(() => {
  if (!props.item) return 0
  let extra = 0
  if (sauce.value) {
    const s = SAUCES.find(s => s.id === sauce.value)
    if (s) extra += s.price
  }
  if (props.item.options?.drinkSize && drinkSize.value) {
    const d = DRINK_SIZES.find(d => d.id === drinkSize.value)
    if (d) extra += d.price
  }
  return props.item.price + extra
})

const totalPrice = computed(() => unitPrice.value * quantity.value)

const formattedTotal = computed(() =>
  new Intl.NumberFormat('fr-FR').format(totalPrice.value) + ' FCFA'
)

// ── Actions ───────────────────────────────────────────────────────────────────
function close() {
  emit('update:modelValue', false)
}

function confirm() {
  if (!props.item) return

  const options = {}
  if (props.item.options?.spicy)     options.spicy     = spicy.value
  if (props.item.options?.sauce)     options.sauce     = sauce.value
  if (props.item.options?.drinkSize) options.drinkSize = drinkSize.value

  cart.addItem(props.item, options, quantity.value)
  emit('added')
  close()
}

function decQty() { if (quantity.value > 1) quantity.value-- }
function incQty() { quantity.value++ }
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="modelValue && item"
        class="modal-backdrop"
        role="dialog"
        aria-modal="true"
        :aria-label="`Personnaliser ${item.name}`"
        @click.self="close"
      >
        <div class="modal-card">
          <!-- Header -->
          <div class="modal-header">
            <div>
              <h2 class="modal-title">{{ item.name }}</h2>
              <p class="modal-desc">{{ item.description }}</p>
            </div>
            <button class="modal-close" aria-label="Fermer" @click="close">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2.5"
                stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div class="modal-body">

            <!-- Option : Épicé / Doux -->
            <section v-if="item.options?.spicy" class="opt-section">
              <h3 class="opt-title">Intensité</h3>
              <div class="toggle-group" role="radiogroup" aria-label="Intensité">
                <button
                  role="radio"
                  :aria-checked="!spicy"
                  :class="['toggle-btn', { active: !spicy }]"
                  @click="spicy = false"
                >
                  😌 Doux
                </button>
                <button
                  role="radio"
                  :aria-checked="spicy"
                  :class="['toggle-btn', { active: spicy }]"
                  @click="spicy = true"
                >
                  🌶️ Épicé
                </button>
              </div>
            </section>

            <!-- Option : Sauce -->
            <section v-if="item.options?.sauce" class="opt-section">
              <h3 class="opt-title">Sauce <span class="opt-hint">(optionnel)</span></h3>
              <div class="sauce-list" role="radiogroup" aria-label="Choix de sauce">
                <button
                  v-for="s in SAUCES"
                  :key="s.id"
                  role="radio"
                  :aria-checked="sauce === s.id"
                  :class="['sauce-btn', { active: sauce === s.id }]"
                  @click="sauce = sauce === s.id ? null : s.id"
                >
                  {{ s.label }}
                  <span v-if="s.price > 0" class="sauce-price">
                    +{{ s.price }} FCFA
                  </span>
                </button>
              </div>
            </section>

            <!-- Option : Taille boisson -->
            <section v-if="item.options?.drinkSize" class="opt-section">
              <h3 class="opt-title">Taille de la boisson</h3>
              <div class="size-list" role="radiogroup" aria-label="Taille">
                <button
                  v-for="d in DRINK_SIZES"
                  :key="d.id"
                  role="radio"
                  :aria-checked="drinkSize === d.id"
                  :class="['size-btn', { active: drinkSize === d.id }]"
                  @click="drinkSize = d.id"
                >
                  <span class="size-label">{{ d.label }}</span>
                  <span v-if="d.price > 0" class="size-price">+{{ d.price }} FCFA</span>
                </button>
              </div>
            </section>

            <!-- Quantité -->
            <section class="opt-section">
              <h3 class="opt-title">Quantité</h3>
              <div class="qty-control" aria-label="Quantité">
                <button class="qty-btn" :disabled="quantity <= 1" aria-label="Diminuer" @click="decQty">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" stroke-width="2.5"
                    stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                </button>
                <span class="qty-value" aria-live="polite">{{ quantity }}</span>
                <button class="qty-btn" aria-label="Augmenter" @click="incQty">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" stroke-width="2.5"
                    stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                </button>
              </div>
            </section>
          </div>

          <!-- Footer -->
          <div class="modal-footer">
            <span class="total-label">Total</span>
            <span class="total-price">{{ formattedTotal }}</span>
            <button class="btn-confirm" @click="confirm">
              Ajouter au panier
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* ── Backdrop ──────────────────────────────────────────────────────────────── */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 1000;
  padding: 0;
}

@media (min-width: 640px) {
  .modal-backdrop {
    align-items: center;
    padding: 1rem;
  }
}

/* ── Card ──────────────────────────────────────────────────────────────────── */
.modal-card {
  background: var(--bk-surface);
  border-radius: 1.5rem 1.5rem 0 0;
  width: 100%;
  max-width: 520px;
  max-height: 92dvh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

@media (min-width: 640px) {
  .modal-card {
    border-radius: 1.5rem;
    max-height: 85dvh;
  }
}

/* ── Header ────────────────────────────────────────────────────────────────── */
.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 1.25rem 1.25rem 0.75rem;
  border-bottom: 1px solid var(--bk-border);
  gap: 1rem;
}

.modal-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--bk-text);
  margin: 0 0 0.2rem;
}

.modal-desc {
  font-size: 0.8rem;
  color: var(--bk-text-muted);
  margin: 0;
}

.modal-close {
  flex-shrink: 0;
  background: var(--bk-bg-muted);
  border: none;
  border-radius: 50%;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--bk-text-muted);
  transition: background 0.2s;
}

.modal-close:hover {
  background: var(--bk-border);
  color: var(--bk-text);
}

/* ── Body ──────────────────────────────────────────────────────────────────── */
.modal-body {
  padding: 1rem 1.25rem;
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.opt-section {}

.opt-title {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--bk-text);
  margin: 0 0 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.opt-hint {
  font-weight: 400;
  text-transform: none;
  color: var(--bk-text-muted);
}

/* Toggle épicé/doux */
.toggle-group {
  display: flex;
  gap: 0.5rem;
}

.toggle-btn {
  flex: 1;
  padding: 0.5rem;
  border: 2px solid var(--bk-border);
  border-radius: 0.75rem;
  background: var(--bk-surface);
  color: var(--bk-text-muted);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.toggle-btn.active {
  border-color: var(--bk-primary);
  background: var(--bk-primary-light);
  color: var(--bk-primary);
}

/* Sauces */
.sauce-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.sauce-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.4rem 0.75rem;
  border: 2px solid var(--bk-border);
  border-radius: 9999px;
  background: var(--bk-surface);
  color: var(--bk-text-muted);
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.sauce-btn.active {
  border-color: var(--bk-primary);
  background: var(--bk-primary-light);
  color: var(--bk-primary);
}

.sauce-price {
  font-size: 0.72rem;
  color: var(--bk-primary);
  font-weight: 700;
}

/* Tailles boisson */
.size-list {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.size-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem 0.9rem;
  border: 2px solid var(--bk-border);
  border-radius: 0.75rem;
  background: var(--bk-surface);
  color: var(--bk-text-muted);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.size-btn.active {
  border-color: var(--bk-primary);
  background: var(--bk-primary-light);
  color: var(--bk-primary);
}

.size-price {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--bk-primary);
}

/* Quantité */
.qty-control {
  display: inline-flex;
  align-items: center;
  gap: 1rem;
  border: 2px solid var(--bk-border);
  border-radius: 9999px;
  padding: 0.3rem 0.75rem;
}

.qty-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--bk-text-muted);
  display: flex;
  align-items: center;
  padding: 0.2rem;
  border-radius: 50%;
  transition: color 0.2s, background 0.2s;
}

.qty-btn:hover:not(:disabled) {
  color: var(--bk-primary);
  background: var(--bk-primary-light);
}

.qty-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.qty-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--bk-text);
  min-width: 1.5rem;
  text-align: center;
}

/* ── Footer ────────────────────────────────────────────────────────────────── */
.modal-footer {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border-top: 1px solid var(--bk-border);
}

.total-label {
  font-size: 0.85rem;
  color: var(--bk-text-muted);
}

.total-price {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--bk-primary);
  flex: 1;
}

.btn-confirm {
  padding: 0.65rem 1.25rem;
  background: var(--bk-primary);
  color: #fff;
  border: none;
  border-radius: 9999px;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s, transform 0.15s;
  white-space: nowrap;
}

.btn-confirm:hover {
  background: var(--bk-primary-dark);
  transform: scale(1.03);
}

.btn-confirm:active {
  transform: scale(0.97);
}

/* ── Transitions ───────────────────────────────────────────────────────────── */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.25s ease;
}

.modal-enter-active .modal-card,
.modal-leave-active .modal-card {
  transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-card,
.modal-leave-to .modal-card {
  transform: translateY(40px);
}

@media (min-width: 640px) {
  .modal-enter-from .modal-card,
  .modal-leave-to .modal-card {
    transform: scale(0.95) translateY(0);
  }
}
</style>
