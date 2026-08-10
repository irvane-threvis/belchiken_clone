<script setup>
import { CATEGORIES } from '../data/menu.js'

const props = defineProps({ modelValue: { type: String, default: 'all' } })
const emit  = defineEmits(['update:modelValue'])

function select(id) { emit('update:modelValue', id) }
</script>

<template>
  <div class="menu-filter" role="tablist" aria-label="Filtrer par catégorie">
    <button
      v-for="cat in CATEGORIES"
      :key="cat.id"
      role="tab"
      :aria-selected="modelValue === cat.id"
      :class="['filter-btn', { active: modelValue === cat.id }]"
      @click="select(cat.id)"
    >
      <span class="filter-emoji" aria-hidden="true">{{ cat.emoji }}</span>
      <span class="filter-label">{{ cat.label }}</span>
    </button>
  </div>
</template>

<style scoped>
.menu-filter {
  display: flex; gap: 0.5rem; flex-wrap: nowrap;
  padding: 1rem 0;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}
.menu-filter::-webkit-scrollbar { display: none; }

.filter-btn {
  display: inline-flex; align-items: center; gap: 0.4rem;
  padding: 0.5rem 1.1rem;
  border-radius: 9999px; border: 2px solid var(--bk-border);
  background: var(--bk-surface); color: var(--bk-text-muted);
  font-size: 0.85rem; font-weight: 600; cursor: pointer;
  transition: all 0.2s ease; white-space: nowrap; flex-shrink: 0;
  box-shadow: var(--bk-shadow-sm);
}
.filter-btn:hover {
  border-color: var(--bk-primary);
  color: var(--bk-primary);
  background: var(--bk-primary-light);
  transform: translateY(-1px);
  box-shadow: var(--bk-shadow-md);
}
.filter-btn.active {
  background: linear-gradient(135deg, var(--bk-primary), var(--bk-accent));
  border-color: transparent; color: #fff;
  box-shadow: 0 4px 14px rgba(225,29,72,0.35);
  transform: translateY(-1px);
}
.filter-emoji { font-size: 1rem; }

@media (max-width: 640px) {
  .filter-btn { padding: 0.45rem 0.85rem; font-size: 0.8rem; }
}
</style>
