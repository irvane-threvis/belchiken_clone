import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const STORAGE_KEY = 'belchiken_orders'

function loadOrders() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveOrders(orders) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders))
  } catch {}
}

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

export const useOrdersStore = defineStore('orders', () => {
  const orders = ref(loadOrders())

  // ── Getters ────────────────────────────────────────────────────────────────

  const todayOrders = computed(() =>
    orders.value.filter(o => o.date === todayStr())
  )

  const dailyRevenue = computed(() =>
    todayOrders.value.reduce((sum, o) => sum + o.total, 0)
  )

  const totalRevenue = computed(() =>
    orders.value.reduce((sum, o) => sum + o.total, 0)
  )

  /** Top articles du jour : [{ name, qty, revenue }] trié par qty desc */
  const topItemsToday = computed(() => {
    const map = {}
    todayOrders.value.forEach(order => {
      order.items.forEach(item => {
        if (!map[item.name]) {
          map[item.name] = { name: item.name, qty: 0, revenue: 0 }
        }
        map[item.name].qty     += item.quantity
        map[item.name].revenue += item.lineTotal
      })
    })
    return Object.values(map).sort((a, b) => b.qty - a.qty).slice(0, 8)
  })

  /** Top articles tous temps : [{ name, qty }] */
  const topItemsAll = computed(() => {
    const map = {}
    orders.value.forEach(order => {
      order.items.forEach(item => {
        if (!map[item.name]) map[item.name] = { name: item.name, qty: 0 }
        map[item.name].qty += item.quantity
      })
    })
    return Object.values(map).sort((a, b) => b.qty - a.qty).slice(0, 8)
  })

  // ── Actions ────────────────────────────────────────────────────────────────

  /**
   * Enregistrer une nouvelle commande
   * @param {Object} payload
   *   - items      : cart items snapshot
   *   - subtotal   : number (FCFA)
   *   - delivery   : number (FCFA)
   *   - total      : number (FCFA)
   *   - zone       : { id, label, price }
   *   - client     : { name, phone, address }
   */
  function saveOrder(payload) {
    const order = {
      id:        `ORD-${Date.now()}`,
      date:      todayStr(),
      timestamp: new Date().toISOString(),
      ...payload,
    }
    orders.value.unshift(order)
    saveOrders(orders.value)
    return order
  }

  function clearAll() {
    orders.value = []
    saveOrders([])
  }

  function formatPrice(amount) {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA'
  }

  return {
    orders,
    todayOrders,
    dailyRevenue,
    totalRevenue,
    topItemsToday,
    topItemsAll,
    saveOrder,
    clearAll,
    formatPrice,
  }
})
