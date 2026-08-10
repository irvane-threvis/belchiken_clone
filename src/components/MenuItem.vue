<script setup>
import { ref, computed } from 'vue'
import { useCartStore } from '../store/cart.js'

const props = defineProps({
  item: { type: Object, required: true },
})
const emit = defineEmits(['customize'])
const cart = useCartStore()

const categoryEmoji = {
  bucket: '🍗', burgers: '🍔', accompagnements: '🍟', boissons: '🥤', combos: '🎁',
}
const emoji = computed(() => categoryEmoji[props.item.category] ?? '🍽️')

const formattedPrice = computed(() =>
  new Intl.NumberFormat('fr-FR').format(props.item.price) + ' FCFA'
)

const badgeClass = computed(() => {
  const b = props.item.badge ?? ''
  if (b.includes('Épicé') || b.includes('🌶')) return 'badge--spicy'
  if (b.includes('Famille'))    return 'badge--family'
  if (b.includes('Économique')) return 'badge--eco'
  if (b.includes('Maison'))     return 'badge--maison'
  if (b.includes('Signature'))  return 'badge--signature'
  if (b.includes('Best') || b.includes('Populaire')) return 'badge--popular'
  return 'badge--default'
})

// ── Feedback visuel d'ajout ───────────────────────────────────────────────────
const added   = ref(false)
const imgError = ref(false)

function handleAdd() {
  if (props.item.customizable) {
    emit('customize', props.item)
  } else {
    cart.addItem(props.item)
    // Flash du bouton
    added.value = true
    setTimeout(() => { added.value = false }, 1200)
  }
}

function onImgError() {
  imgError.value = true
}
</script>

<template>
  <article class="menu-item" :aria-label="item.name">
    <!-- Badge -->
    <span v-if="item.badge" :class="['badge', badgeClass]">{{ item.badge }}</span>

    <!-- Image -->
    <div class="item-image" aria-hidden="true">
      <img
        v-if="item.image && !imgError"
        :src="item.image"
        :alt="item.name"
        class="img"
        loading="lazy"
        @error="onImgError"
      />
      <span v-else class="placeholder-emoji">{{ emoji }}</span>
      <div v-if="item.image && !imgError" class="img-overlay" />
    </div>

    <!-- Body -->
    <div class="item-body">
      <h3 class="item-name">{{ item.name }}</h3>
      <p class="item-desc">{{ item.description }}</p>
    </div>

    <!-- Footer : prix + bouton -->
    <div class="item-footer">
      <span class="item-price">{{ formattedPrice }}</span>
      <button
        :class="['btn-add', { 'btn-add--done': added }]"
        :aria-label="`Ajouter ${item.name} au panier`"
        :disabled="added"
        @click="handleAdd"
      >
        <!-- Icône check quand ajouté -->
        <svg v-if="added" xmlns="http://www.w3.org/2000/svg" width="14" height="14"
          viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"
          stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        <!-- Icône + par défaut -->
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14"
          viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"
          stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        {{ added ? 'Ajouté !' : (item.customizable ? 'Personnaliser' : 'Ajouter') }}
      </button>
    </div>
  </article>
</template>

<style scoped>
.menu-item {
  position: relative;
  display: flex; flex-direction: column;
  background: var(--bk-surface);
  border: 1px solid var(--bk-border);
  border-radius: 1.25rem;
  overflow: hidden;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  box-shadow: var(--bk-shadow-sm);
}
.menu-item:hover {
  transform: translateY(-5px);
  box-shadow: var(--bk-shadow-lg);
}

/* ── Badge ──────────────────────────────────────────────────────────────────── */
.badge {
  position: absolute; top: 0.75rem; left: 0.75rem;
  font-size: 0.68rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;
  padding: 0.22rem 0.6rem; border-radius: 9999px; z-index: 2; white-space: nowrap;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
}
.badge--popular   { background: var(--bk-primary); color: #fff; }
.badge--spicy     { background: #ea580c;            color: #fff; }
.badge--family    { background: #7c3aed;            color: #fff; }
.badge--eco       { background: #16a34a;            color: #fff; }
.badge--maison    { background: var(--bk-gold);     color: #78350f; }
.badge--signature { background: #0f172a;            color: #f8fafc; }
.badge--default   { background: var(--bk-accent);  color: #fff; }

/* ── Image ──────────────────────────────────────────────────────────────────── */
.item-image {
  width: 100%; aspect-ratio: 16/10;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #fbbf24 100%);
  display: flex; align-items: center; justify-content: center;
  overflow: hidden; position: relative; flex-shrink: 0;
}
.img {
  width: 100%; height: 100%; object-fit: cover;
  transition: transform 0.45s cubic-bezier(0.25,0.46,0.45,0.94);
}
.menu-item:hover .img { transform: scale(1.08); }
.img-overlay {
  position: absolute; bottom: 0; left: 0; right: 0; height: 40%;
  background: linear-gradient(to top, rgba(0,0,0,0.4), transparent);
  pointer-events: none;
}
.placeholder-emoji {
  font-size: 3.5rem; line-height: 1; user-select: none;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
}

/* ── Body ───────────────────────────────────────────────────────────────────── */
.item-body { padding: 0.9rem 1rem 0.5rem; flex: 1; }
.item-name {
  font-size: 0.95rem; font-weight: 800; color: var(--bk-text);
  margin: 0 0 0.35rem; line-height: 1.3;
}
.item-desc {
  font-size: 0.76rem; color: var(--bk-text-muted); line-height: 1.5; margin: 0;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}

/* ── Footer ─────────────────────────────────────────────────────────────────── */
.item-footer {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0.75rem 1rem; border-top: 1px solid var(--bk-border); gap: 0.5rem;
}
.item-price {
  font-size: 1rem; font-weight: 900; color: var(--bk-primary); white-space: nowrap;
}

.btn-add {
  display: inline-flex; align-items: center; gap: 0.3rem;
  padding: 0.5rem 0.9rem;
  background: linear-gradient(135deg, var(--bk-primary), var(--bk-accent));
  color: #fff; border: none; border-radius: 9999px;
  font-size: 0.78rem; font-weight: 700; cursor: pointer;
  transition: transform 0.15s, box-shadow 0.2s, background 0.3s;
  box-shadow: 0 3px 10px rgba(225,29,72,0.3); white-space: nowrap;
  min-width: 90px; justify-content: center;
}
.btn-add:hover:not(:disabled) {
  transform: scale(1.07);
  box-shadow: 0 5px 16px rgba(225,29,72,0.45);
}
.btn-add:active:not(:disabled) { transform: scale(0.96); }
.btn-add:focus-visible { outline: 2px solid var(--bk-primary); outline-offset: 2px; }

/* État "Ajouté !" */
.btn-add--done {
  background: linear-gradient(135deg, #16a34a, #22c55e);
  box-shadow: 0 3px 10px rgba(22,163,74,0.35);
  cursor: default;
  animation: pop-confirm 0.35s cubic-bezier(0.34,1.56,0.64,1);
}
@keyframes pop-confirm {
  0%   { transform: scale(1); }
  50%  { transform: scale(1.15); }
  100% { transform: scale(1); }
}
</style>
