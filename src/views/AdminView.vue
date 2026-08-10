<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useOrdersStore } from '../store/orders.js'
import { Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js'

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend)

const router = useRouter()
const orders = useOrdersStore()

// ── Auth ───────────────────────────────────────────────────────────────────────
const ADMIN_PIN = '1234'
const pinInput  = ref('')
const pinError  = ref('')
const unlocked  = ref(sessionStorage.getItem('bk_admin') === '1')

function checkPin() {
  if (pinInput.value === ADMIN_PIN) {
    sessionStorage.setItem('bk_admin', '1')
    unlocked.value = true
    pinError.value = ''
  } else {
    pinError.value = 'Code PIN incorrect. Réessayez.'
    pinInput.value = ''
  }
}

function lock() {
  sessionStorage.removeItem('bk_admin')
  unlocked.value = false
  pinInput.value = ''
}

// ── Tabs ───────────────────────────────────────────────────────────────────────
const activeTab = ref('dashboard')

// ── Chart ──────────────────────────────────────────────────────────────────────
const chartCanvas = ref(null)
let chartInstance = null

function buildChart() {
  if (!chartCanvas.value) return
  if (chartInstance) { chartInstance.destroy(); chartInstance = null }

  const data = orders.topItemsToday.length ? orders.topItemsToday : orders.topItemsAll
  if (!data.length) return

  chartInstance = new Chart(chartCanvas.value, {
    type: 'bar',
    data: {
      labels: data.map(d => d.name),
      datasets: [{
        label: 'Quantité vendue',
        data: data.map(d => d.qty),
        backgroundColor: [
          '#dc2626','#ef4444','#f97316','#f59e0b',
          '#16a34a','#2563eb','#7c3aed','#ec4899',
        ],
        borderRadius: 8,
        borderSkipped: false,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.parsed.y} vendu${ctx.parsed.y > 1 ? 's' : ''}`,
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { size: 11 }, maxRotation: 30 },
        },
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1, precision: 0 },
          grid: { color: 'rgba(0,0,0,0.06)' },
        },
      },
    },
  })
}

watch([activeTab, () => orders.topItemsToday.length, () => orders.topItemsAll.length], async ([tab]) => {
  if (tab === 'dashboard' && unlocked.value) {
    await nextTick()
    buildChart()
  }
})

onMounted(async () => {
  if (unlocked.value) {
    await nextTick()
    buildChart()
  }
})

// ── Formatters ─────────────────────────────────────────────────────────────────
function formatDate(iso) {
  return new Date(iso).toLocaleString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

const statsCards = computed(() => [
  { label: "Commandes aujourd'hui", value: orders.todayOrders.length, icon: '📋', color: '#2563eb' },
  { label: "CA du jour",            value: orders.formatPrice(orders.dailyRevenue),  icon: '💰', color: '#16a34a' },
  { label: "CA total",              value: orders.formatPrice(orders.totalRevenue),  icon: '📈', color: '#7c3aed' },
  { label: "Toutes commandes",      value: orders.orders.length, icon: '🗂️', color: '#dc2626' },
])
</script>

<template>
  <div class="admin-page">

    <!-- Navbar -->
    <header class="admin-nav">
      <div class="admin-nav-inner">
        <button class="back-btn" @click="router.push('/')">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Menu
        </button>
        <span class="admin-brand">⚙️ Administration</span>
        <button v-if="unlocked" class="lock-btn" @click="lock">🔒 Verrouiller</button>
        <div v-else style="width:100px"/>
      </div>
    </header>

    <!-- PIN Screen -->
    <div v-if="!unlocked" class="pin-screen">
      <div class="pin-card">
        <div class="pin-icon">🔐</div>
        <h1 class="pin-title">Espace Admin</h1>
        <p class="pin-sub">Entrez le code PIN pour accéder</p>
        <input
          v-model="pinInput"
          type="password"
          inputmode="numeric"
          maxlength="6"
          placeholder="••••"
          class="pin-input"
          @keyup.enter="checkPin"
        />
        <p v-if="pinError" class="pin-error">{{ pinError }}</p>
        <button class="btn-primary" @click="checkPin">Accéder</button>
        <p class="pin-hint">Code démo : <strong>1234</strong></p>
      </div>
    </div>

    <!-- Dashboard -->
    <main v-else class="admin-main">

      <!-- Tabs -->
      <div class="admin-tabs">
        <button :class="['tab-btn', { active: activeTab === 'dashboard' }]" @click="activeTab = 'dashboard'">
          📊 Tableau de bord
        </button>
        <button :class="['tab-btn', { active: activeTab === 'orders' }]" @click="activeTab = 'orders'">
          📋 Commandes
          <span v-if="orders.todayOrders.length" class="tab-badge">{{ orders.todayOrders.length }}</span>
        </button>
      </div>

      <!-- ── Dashboard tab ───────────────────────────────────────────────── -->
      <div v-if="activeTab === 'dashboard'" class="tab-content">

        <!-- Stats cards -->
        <div class="stats-grid">
          <div v-for="card in statsCards" :key="card.label" class="stat-card"
            :style="`--c: ${card.color}`">
            <div class="stat-icon">{{ card.icon }}</div>
            <div class="stat-info">
              <p class="stat-label">{{ card.label }}</p>
              <p class="stat-value">{{ card.value }}</p>
            </div>
          </div>
        </div>

        <!-- Chart -->
        <div class="chart-card">
          <h2 class="chart-title">
            🏆 Top articles
            <span class="chart-subtitle">
              {{ orders.topItemsToday.length ? "Aujourd'hui" : 'Tous temps' }}
            </span>
          </h2>
          <div v-if="(orders.topItemsToday.length || orders.topItemsAll.length)" class="chart-wrap">
            <canvas ref="chartCanvas" />
          </div>
          <div v-else class="chart-empty">
            <p>📭 Aucune donnée disponible</p>
            <p>Passez quelques commandes pour voir les statistiques !</p>
          </div>
        </div>
      </div>

      <!-- ── Orders tab ──────────────────────────────────────────────────── -->
      <div v-else-if="activeTab === 'orders'" class="tab-content">
        <div class="orders-header">
          <h2 class="orders-title">Historique des commandes</h2>
          <button v-if="orders.orders.length" class="btn-danger-outline" @click="orders.clearAll()">
            🗑️ Tout effacer
          </button>
        </div>

        <div v-if="!orders.orders.length" class="orders-empty">
          <p>📭 Aucune commande enregistrée</p>
        </div>

        <div v-else class="orders-list">
          <details v-for="order in orders.orders" :key="order.id" class="order-card">
            <summary class="order-summary">
              <div class="order-head">
                <span class="order-id">{{ order.id }}</span>
                <span class="order-client">👤 {{ order.client.name }}</span>
              </div>
              <div class="order-meta">
                <span class="order-date">{{ formatDate(order.timestamp) }}</span>
                <span class="order-zone">📍 {{ order.zone.label }}</span>
                <span class="order-total">{{ orders.formatPrice(order.total) }}</span>
              </div>
            </summary>
            <div class="order-body">
              <div class="order-client-info">
                <p><strong>Téléphone :</strong> {{ order.client.phone }}</p>
                <p><strong>Adresse :</strong> {{ order.client.address }}</p>
              </div>
              <ul class="order-items">
                <li v-for="(item, i) in order.items" :key="i" class="order-item-row">
                  <span>{{ item.name }} ×{{ item.quantity }}</span>
                  <span v-if="item.options" class="item-opts">{{ item.options }}</span>
                  <span class="item-price">{{ orders.formatPrice(item.lineTotal) }}</span>
                </li>
              </ul>
              <div class="order-totals">
                <span>Sous-total : {{ orders.formatPrice(order.subtotal) }}</span>
                <span>Livraison : {{ orders.formatPrice(order.delivery) }}</span>
                <strong>Total : {{ orders.formatPrice(order.total) }}</strong>
              </div>
            </div>
          </details>
        </div>
      </div>

    </main>
  </div>
</template>

<style scoped>
.admin-page { min-height: 100dvh; background: var(--bk-bg); }

/* Navbar */
.admin-nav { background: var(--bk-surface); border-bottom: 1px solid var(--bk-border); position: sticky; top: 0; z-index: 100; }
.admin-nav-inner { max-width: 1100px; margin: 0 auto; padding: 0.85rem 1.5rem; display: flex; align-items: center; justify-content: space-between; }
.admin-brand { font-size: 1.1rem; font-weight: 800; color: var(--bk-text); }
.back-btn, .lock-btn { display: inline-flex; align-items: center; gap: 0.35rem; background: none; border: 1.5px solid var(--bk-border); border-radius: 9999px; padding: 0.4rem 0.9rem; color: var(--bk-text-muted); font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.back-btn:hover { border-color: var(--bk-primary); color: var(--bk-primary); }
.lock-btn:hover { border-color: #ef4444; color: #ef4444; }

/* PIN Screen */
.pin-screen { display: flex; align-items: center; justify-content: center; min-height: calc(100dvh - 60px); padding: 2rem; }
.pin-card { background: var(--bk-surface); border: 1px solid var(--bk-border); border-radius: 1.5rem; padding: 3rem 2rem; text-align: center; max-width: 380px; width: 100%; display: flex; flex-direction: column; gap: 0.75rem; align-items: center; }
.pin-icon { font-size: 3rem; }
.pin-title { font-size: 1.5rem; font-weight: 800; color: var(--bk-text); margin: 0; }
.pin-sub { font-size: 0.875rem; color: var(--bk-text-muted); margin: 0; }
.pin-input { width: 100%; padding: 0.8rem 1rem; border: 2px solid var(--bk-border); border-radius: 0.75rem; background: var(--bk-bg-muted); color: var(--bk-text); font-size: 1.5rem; text-align: center; letter-spacing: 0.5em; outline: none; font-family: inherit; transition: border-color 0.2s; box-sizing: border-box; }
.pin-input:focus { border-color: var(--bk-primary); }
.pin-error { color: #ef4444; font-size: 0.8rem; margin: 0; }
.pin-hint { font-size: 0.78rem; color: var(--bk-text-muted); margin: 0.5rem 0 0; }
.btn-primary { padding: 0.75rem 2rem; background: var(--bk-primary); color: #fff; border: none; border-radius: 9999px; font-size: 1rem; font-weight: 700; cursor: pointer; transition: background 0.2s; width: 100%; }
.btn-primary:hover { background: var(--bk-primary-dark); }

/* Main */
.admin-main { max-width: 1100px; margin: 0 auto; padding: 1.5rem 1.5rem 4rem; }

/* Tabs */
.admin-tabs { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; }
.tab-btn { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.55rem 1.1rem; border: 2px solid var(--bk-border); border-radius: 9999px; background: var(--bk-surface); color: var(--bk-text-muted); font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.tab-btn.active { background: var(--bk-primary); border-color: var(--bk-primary); color: #fff; }
.tab-badge { background: #fff; color: var(--bk-primary); font-size: 0.7rem; font-weight: 800; padding: 0.1rem 0.4rem; border-radius: 9999px; }

/* Stats grid */
.stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
.stat-card { background: var(--bk-surface); border: 1px solid var(--bk-border); border-radius: 1rem; padding: 1.25rem; display: flex; align-items: center; gap: 1rem; border-left: 4px solid var(--c); }
.stat-icon { font-size: 2rem; flex-shrink: 0; }
.stat-label { font-size: 0.78rem; color: var(--bk-text-muted); margin: 0 0 0.25rem; font-weight: 500; }
.stat-value { font-size: 1.15rem; font-weight: 800; color: var(--c); margin: 0; }

/* Chart */
.chart-card { background: var(--bk-surface); border: 1px solid var(--bk-border); border-radius: 1.25rem; padding: 1.5rem; }
.chart-title { font-size: 1rem; font-weight: 700; color: var(--bk-text); margin: 0 0 1.25rem; display: flex; align-items: center; gap: 0.5rem; }
.chart-subtitle { font-size: 0.78rem; font-weight: 400; color: var(--bk-text-muted); }
.chart-wrap { height: 300px; position: relative; }
.chart-empty { text-align: center; padding: 2rem; color: var(--bk-text-muted); font-size: 0.875rem; display: flex; flex-direction: column; gap: 0.4rem; }

/* Orders */
.orders-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; }
.orders-title { font-size: 1.1rem; font-weight: 700; color: var(--bk-text); margin: 0; }
.btn-danger-outline { padding: 0.45rem 0.9rem; border: 1.5px solid #ef4444; border-radius: 9999px; background: none; color: #ef4444; font-size: 0.8rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.btn-danger-outline:hover { background: #ef444415; }
.orders-empty { text-align: center; padding: 3rem; color: var(--bk-text-muted); }
.orders-list { display: flex; flex-direction: column; gap: 0.75rem; }

.order-card { background: var(--bk-surface); border: 1px solid var(--bk-border); border-radius: 1rem; overflow: hidden; }
.order-summary { padding: 1rem 1.25rem; cursor: pointer; list-style: none; display: flex; flex-direction: column; gap: 0.35rem; }
.order-summary::-webkit-details-marker { display: none; }
.order-summary:hover { background: var(--bk-bg-muted); }
.order-head { display: flex; align-items: center; gap: 0.75rem; }
.order-id { font-size: 0.72rem; font-weight: 700; color: var(--bk-text-muted); font-family: monospace; background: var(--bk-bg-muted); padding: 0.1rem 0.4rem; border-radius: 4px; }
.order-client { font-size: 0.9rem; font-weight: 700; color: var(--bk-text); }
.order-meta { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
.order-date { font-size: 0.75rem; color: var(--bk-text-muted); }
.order-zone { font-size: 0.75rem; color: var(--bk-text-muted); }
.order-total { font-size: 0.9rem; font-weight: 800; color: var(--bk-primary); margin-left: auto; }

.order-body { padding: 1rem 1.25rem; border-top: 1px solid var(--bk-border); background: var(--bk-bg-muted); display: flex; flex-direction: column; gap: 0.75rem; }
.order-client-info { display: flex; flex-direction: column; gap: 0.2rem; font-size: 0.82rem; color: var(--bk-text-muted); }
.order-client-info p { margin: 0; }
.order-items { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.35rem; }
.order-item-row { display: flex; align-items: center; gap: 0.5rem; font-size: 0.82rem; }
.order-item-row span:first-child { flex: 1; color: var(--bk-text); font-weight: 600; }
.item-opts { color: var(--bk-text-muted); font-size: 0.75rem; }
.item-price { font-weight: 700; color: var(--bk-text); white-space: nowrap; }
.order-totals { display: flex; gap: 1rem; flex-wrap: wrap; font-size: 0.82rem; color: var(--bk-text-muted); padding-top: 0.5rem; border-top: 1px solid var(--bk-border); }
.order-totals strong { color: var(--bk-primary); font-size: 0.9rem; }
</style>
