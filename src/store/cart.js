import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { SAUCES, DRINK_SIZES } from '../data/menu.js'

const STORAGE_KEY = 'belchiken_cart'

// ─── Helpers ──────────────────────────────────────────────────────────────────
function generateCartItemId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function optionPrice(opts) {
  let extra = 0
  if (opts?.sauce) {
    const sauce = SAUCES.find(s => s.id === opts.sauce)
    if (sauce) extra += sauce.price
  }
  if (opts?.drinkSize) {
    const size = DRINK_SIZES.find(s => s.id === opts.drinkSize)
    if (size) extra += size.price
  }
  return extra
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveToStorage(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // Silently fail if storage is unavailable
  }
}

// ─── Store ────────────────────────────────────────────────────────────────────
export const useCartStore = defineStore('cart', () => {
  // ── State ──────────────────────────────────────────────────────────────────
  const items = ref(loadFromStorage())

  // ── Getters ────────────────────────────────────────────────────────────────

  /** Nombre total d'articles dans le panier */
  const totalItems = computed(() =>
    items.value.reduce((sum, item) => sum + item.quantity, 0)
  )

  /** Sous-total en FCFA */
  const subtotal = computed(() =>
    items.value.reduce((sum, item) => {
      const unitPrice = item.basePrice + optionPrice(item.options)
      return sum + unitPrice * item.quantity
    }, 0)
  )

  /** Formater un montant en FCFA */
  function formatPrice(amount) {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA'
  }

  // ── Actions ────────────────────────────────────────────────────────────────

  /**
   * Ajouter un article au panier.
   * Si un article identique (même id + mêmes options) existe déjà,
   * on incrémente sa quantité.
   *
   * @param {Object} menuItem  - L'objet article depuis menu.js
   * @param {Object} options   - { sauce?: string, spicy?: boolean, drinkSize?: string }
   * @param {number} quantity  - Quantité à ajouter (défaut : 1)
   */
  function addItem(menuItem, options = {}, quantity = 1) {
    // Clé de déduplication basée sur l'id + les options sérialisées
    const optKey = JSON.stringify(options)

    const existing = items.value.find(
      i => i.menuItemId === menuItem.id && JSON.stringify(i.options) === optKey
    )

    if (existing) {
      existing.quantity += quantity
    } else {
      items.value.push({
        cartItemId: generateCartItemId(),
        menuItemId: menuItem.id,
        name: menuItem.name,
        basePrice: menuItem.price,
        options: { ...options },
        quantity,
      })
    }

    saveToStorage(items.value)
  }

  /**
   * Retirer un article du panier par son cartItemId.
   */
  function removeItem(cartItemId) {
    const idx = items.value.findIndex(i => i.cartItemId === cartItemId)
    if (idx !== -1) {
      items.value.splice(idx, 1)
      saveToStorage(items.value)
    }
  }

  /**
   * Changer la quantité d'un article.
   * Si quantity <= 0, l'article est supprimé.
   */
  function updateQuantity(cartItemId, quantity) {
    if (quantity <= 0) {
      removeItem(cartItemId)
      return
    }
    const item = items.value.find(i => i.cartItemId === cartItemId)
    if (item) {
      item.quantity = quantity
      saveToStorage(items.value)
    }
  }

  /**
   * Vider complètement le panier.
   */
  function clearCart() {
    items.value = []
    saveToStorage(items.value)
  }

  /**
   * Prix unitaire calculé d'un article (base + options).
   */
  function unitPrice(cartItem) {
    return cartItem.basePrice + optionPrice(cartItem.options)
  }

  /**
   * Prix total d'une ligne (unitPrice × quantity).
   */
  function lineTotal(cartItem) {
    return unitPrice(cartItem) * cartItem.quantity
  }

  /**
   * Label lisible pour les options sélectionnées.
   */
  function optionsLabel(cartItem) {
    const parts = []
    if (cartItem.options?.spicy !== undefined) {
      parts.push(cartItem.options.spicy ? '🌶️ Épicé' : '😌 Doux')
    }
    if (cartItem.options?.sauce) {
      const sauce = SAUCES.find(s => s.id === cartItem.options.sauce)
      if (sauce) parts.push(`Sauce : ${sauce.label}`)
    }
    if (cartItem.options?.drinkSize) {
      const size = DRINK_SIZES.find(s => s.id === cartItem.options.drinkSize)
      if (size) parts.push(size.label)
    }
    return parts.join(' · ')
  }

  return {
    items,
    totalItems,
    subtotal,
    formatPrice,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    unitPrice,
    lineTotal,
    optionsLabel,
  }
})
