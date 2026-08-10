<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../store/cart.js'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
})

const emit   = defineEmits(['update:modelValue', 'checkout'])
const router = useRouter()
const cart   = useCartStore()

function close() {
  emit('update:modelValue', false)
}

function checkout() {
  close()
  router.push('/checkout')
}

const isEmpty = computed(() => cart.items.length === 0)
</script>

<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <Transition name="backdrop-fade">
      <div
        v-if="modelValue"
        class="cart-backdrop"
        aria-hidden="true"
        @click="close"
      />
    </Transition>

    <!-- Sidebar panel -->
    <Transition name="sidebar-slide">
      <aside
        v-if="modelValue"
        class="cart-sidebar"
        role="complementary"
        aria-label="Votre panier"
      >
        <!-- Header -->
        <div class="sidebar-header">
          <div class="sidebar-title-row">
            <h2 class="sidebar-title">
              🛒 Mon Panier
              <span v-if="cart.totalItems > 0" class="cart-count">
                {{ cart.totalItems }}
              </span>
            </h2>
            <button class="close-btn" aria-label="Fermer le panier" @click="close">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2.5"
                stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Empty state -->
        <div v-if="isEmpty" class="cart-empty">
          <span class="empty-emoji">🛒</span>
          <p class="empty-text">Votre panier est vide</p>
          <p class="empty-sub">Ajoutez des articles depuis le menu !</p>
          <button class="btn-browse" @click="close">Parcourir le menu</button>
        </div>

        <!-- Items list -->
        <ul v-else class="cart-list" aria-label="Articles dans le panier">
          <li
            v-for="item in cart.items"
            :key="item.cartItemId"
            class="cart-item"
          >
            <div class="cart-item-info">
              <span class="cart-item-name">{{ item.name }}</span>
              <span v-if="cart.optionsLabel(item)" class="cart-item-opts">
                {{ cart.optionsLabel(item) }}
              </span>
            </div>

            <!-- Quantity controls -->
            <div class="cart-item-controls">
              <button
                class="qty-btn"
                :aria-label="`Réduire la quantité de ${item.name}`"
                @click="cart.updateQuantity(item.cartItemId, item.quantity - 1)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" stroke-width="2.5"
                  stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </button>
              <span class="qty-val" aria-live="polite">{{ item.quantity }}</span>
              <button
                class="qty-btn"
                :aria-label="`Augmenter la quantité de ${item.name}`"
                @click="cart.updateQuantity(item.cartItemId, item.quantity + 1)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" stroke-width="2.5"
                  stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </button>
            </div>

            <!-- Line total + remove -->
            <div class="cart-item-right">
              <span class="line-total">
                {{ cart.formatPrice(cart.lineTotal(item)) }}
              </span>
              <button
                class="remove-btn"
                :aria-label="`Supprimer ${item.name}`"
                @click="cart.removeItem(item.cartItemId)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" stroke-width="2"
                  stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                  <path d="M10 11v6"/>
                  <path d="M14 11v6"/>
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                </svg>
              </button>
            </div>
          </li>
        </ul>

        <!-- Footer : total + CTA -->
        <div v-if="!isEmpty" class="sidebar-footer">
          <div class="subtotal-row">
            <span class="subtotal-label">Sous-total</span>
            <span class="subtotal-value">{{ cart.formatPrice(cart.subtotal) }}</span>
          </div>
          <p class="delivery-note">Frais de livraison calculés à l'étape suivante</p>

          <button class="btn-checkout" @click="checkout">
            Commander via WhatsApp 📲
          </button>

          <button class="btn-clear" @click="cart.clearCart()">
            Vider le panier
          </button>
        </div>
      </aside>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* ── Backdrop ──────────────────────────────────────────────────────────────── */
.cart-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(2px);
  z-index: 900;
}

/* ── Sidebar ───────────────────────────────────────────────────────────────── */
.cart-sidebar {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: min(420px, 100vw);
  background: var(--bk-surface);
  border-left: 1px solid var(--bk-border);
  z-index: 901;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: -8px 0 32px rgba(0, 0, 0, 0.15);
}

/* ── Header ────────────────────────────────────────────────────────────────── */
.sidebar-header {
  padding: 1.25rem 1.25rem 1rem;
  border-bottom: 1px solid var(--bk-border);
  flex-shrink: 0;
}

.sidebar-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sidebar-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--bk-text);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.cart-count {
  background: var(--bk-primary);
  color: #fff;
  font-size: 0.72rem;
  font-weight: 700;
  width: 1.35rem;
  height: 1.35rem;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.close-btn {
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

.close-btn:hover {
  background: var(--bk-border);
  color: var(--bk-text);
}

/* ── Empty state ───────────────────────────────────────────────────────────── */
.cart-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 2rem;
  text-align: center;
}

.empty-emoji {
  font-size: 3.5rem;
  line-height: 1;
  margin-bottom: 0.5rem;
}

.empty-text {
  font-size: 1rem;
  font-weight: 700;
  color: var(--bk-text);
  margin: 0;
}

.empty-sub {
  font-size: 0.85rem;
  color: var(--bk-text-muted);
  margin: 0;
}

.btn-browse {
  margin-top: 1rem;
  padding: 0.6rem 1.25rem;
  background: var(--bk-primary);
  color: #fff;
  border: none;
  border-radius: 9999px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-browse:hover {
  background: var(--bk-primary-dark);
}

/* ── List ──────────────────────────────────────────────────────────────────── */
.cart-list {
  list-style: none;
  margin: 0;
  padding: 0.75rem 0;
  overflow-y: auto;
  flex: 1;
}

.cart-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem 1.25rem;
  border-bottom: 1px solid var(--bk-border);
}

.cart-item:last-child {
  border-bottom: none;
}

.cart-item-info {
  flex: 1;
  min-width: 0;
}

.cart-item-name {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--bk-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cart-item-opts {
  display: block;
  font-size: 0.75rem;
  color: var(--bk-text-muted);
  margin-top: 0.15rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Quantity controls */
.cart-item-controls {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  border: 1.5px solid var(--bk-border);
  border-radius: 9999px;
  padding: 0.15rem 0.45rem;
  flex-shrink: 0;
}

.qty-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--bk-text-muted);
  display: flex;
  align-items: center;
  padding: 0.15rem;
  border-radius: 50%;
  transition: color 0.2s, background 0.2s;
}

.qty-btn:hover {
  color: var(--bk-primary);
  background: var(--bk-primary-light);
}

.qty-val {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--bk-text);
  min-width: 1.1rem;
  text-align: center;
}

/* Right side */
.cart-item-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.3rem;
  flex-shrink: 0;
}

.line-total {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--bk-primary);
  white-space: nowrap;
}

.remove-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--bk-text-muted);
  padding: 0.2rem;
  border-radius: 4px;
  transition: color 0.2s;
  display: flex;
  align-items: center;
}

.remove-btn:hover {
  color: #ef4444;
}

/* ── Footer ────────────────────────────────────────────────────────────────── */
.sidebar-footer {
  padding: 1rem 1.25rem 1.25rem;
  border-top: 1px solid var(--bk-border);
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.subtotal-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.subtotal-label {
  font-size: 0.9rem;
  color: var(--bk-text-muted);
}

.subtotal-value {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--bk-text);
}

.delivery-note {
  font-size: 0.75rem;
  color: var(--bk-text-muted);
  margin: 0;
  text-align: center;
}

.btn-checkout {
  width: 100%;
  padding: 0.75rem;
  background: linear-gradient(135deg, #25d366, #1ebe5d);
  color: #fff;
  border: none;
  border-radius: 9999px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.15s;
  box-shadow: 0 4px 14px rgba(37,211,102,0.35);
}

.btn-checkout:hover { opacity: 0.9; transform: translateY(-1px); }

.btn-checkout:active {
  transform: scale(0.98);
}

.btn-clear {
  width: 100%;
  padding: 0.5rem;
  background: none;
  border: 1.5px solid var(--bk-border);
  border-radius: 9999px;
  font-size: 0.85rem;
  color: var(--bk-text-muted);
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s;
}

.btn-clear:hover {
  border-color: #ef4444;
  color: #ef4444;
}

/* ── Transitions ───────────────────────────────────────────────────────────── */
.backdrop-fade-enter-active,
.backdrop-fade-leave-active {
  transition: opacity 0.25s ease;
}
.backdrop-fade-enter-from,
.backdrop-fade-leave-to {
  opacity: 0;
}

.sidebar-slide-enter-active,
.sidebar-slide-leave-active {
  transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);
}
.sidebar-slide-enter-from,
.sidebar-slide-leave-to {
  transform: translateX(100%);
}
</style>
