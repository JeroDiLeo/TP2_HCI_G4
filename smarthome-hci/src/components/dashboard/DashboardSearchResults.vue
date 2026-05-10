<template>
  <section class="dashboard-search" aria-labelledby="dashboard-search-title">
    <header class="dashboard-search__header">
      <div class="dashboard-search__heading">
        <span class="dashboard-search__icon" aria-hidden="true">
          <v-icon icon="mdi-magnify" size="20" />
        </span>
        <div class="dashboard-search__copy">
          <h2 id="dashboard-search-title" class="dashboard-search__title">
            Resultados de búsqueda
          </h2>
          <p class="dashboard-search__summary">
            "{{ query }}" · {{ resultsLabel }}
          </p>
        </div>
      </div>

      <button type="button" class="dashboard-search__clear" @click="emit('clear')">
        <v-icon icon="mdi-close" size="16" aria-hidden="true" />
        Limpiar
      </button>
    </header>

    <div v-if="loading" class="dashboard-search__loading" role="status" aria-live="polite">
      <v-progress-circular indeterminate color="var(--sh-primary)" size="18" width="2" />
      <span>Actualizando resultados…</span>
    </div>

    <div v-if="totalResults === 0" class="dashboard-search__empty" role="status">
      <v-icon icon="mdi-magnify-remove-outline" size="46" class="dashboard-search__empty-icon" aria-hidden="true" />
      <p class="dashboard-search__empty-title">Sin resultados</p>
      <p class="dashboard-search__empty-text">
        No encontramos dispositivos, habitaciones ni rutinas para "{{ query }}".
      </p>
      <button type="button" class="dashboard-search__empty-btn" @click="emit('clear')">
        Limpiar búsqueda
      </button>
    </div>

    <div v-else class="dashboard-search__sections">
      <section
        v-for="section in nonEmptySections"
        :key="section.id"
        class="search-section"
        :aria-labelledby="`dashboard-search-${section.id}`"
      >
        <header class="search-section__header">
          <h3 :id="`dashboard-search-${section.id}`" class="search-section__title">
            <v-icon :icon="section.icon" size="18" aria-hidden="true" />
            {{ section.title }}
          </h3>
          <span class="search-section__count" aria-hidden="true">{{ section.items.length }}</span>
        </header>

        <div class="search-section__grid" role="list">
          <article
            v-for="item in section.items"
            :key="`${item.kind}-${item.id}`"
            class="search-result-card"
            :class="`search-result-card--${item.kind}`"
            role="listitem"
          >
            <button
              type="button"
              class="search-result-card__main"
              :aria-label="`Abrir ${item.eyebrow} ${item.title}`"
              @click="emit('select', item)"
            >
              <span class="search-result-card__icon" aria-hidden="true">
                <v-icon :icon="item.icon" size="20" />
              </span>

              <span class="search-result-card__body">
                <span class="search-result-card__topline">
                  <span class="search-result-card__eyebrow">{{ item.eyebrow }}</span>
                  <v-icon
                    v-if="item.favorite"
                    icon="mdi-star"
                    size="14"
                    class="search-result-card__star"
                    aria-label="Favorito"
                  />
                </span>

                <span class="search-result-card__title">{{ item.title }}</span>
                <span class="search-result-card__meta">{{ item.meta }}</span>
                <span class="search-result-card__detail">{{ item.detail }}</span>
              </span>
            </button>

            <button
              v-if="item.actionLabel"
              type="button"
              class="search-result-card__action"
              :disabled="item.actionLoading"
              @click="emit('action', item)"
            >
              <v-progress-circular
                v-if="item.actionLoading"
                indeterminate
                size="16"
                width="2"
                color="var(--sh-primary)"
              />
              <v-icon v-else icon="mdi-play" size="16" aria-hidden="true" />
              {{ item.actionLabel }}
            </button>
          </article>
        </div>
      </section>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { DashboardSearchItem, DashboardSearchSection } from '@/utils/dashboardSearch'

const props = defineProps<{
  query: string
  sections: DashboardSearchSection[]
  totalResults: number
  loading?: boolean
}>()

const emit = defineEmits<{
  (event: 'clear'): void
  (event: 'select', item: DashboardSearchItem): void
  (event: 'action', item: DashboardSearchItem): void
}>()

const nonEmptySections = computed(() =>
  props.sections.filter(section => section.items.length > 0),
)

const resultsLabel = computed(() =>
  props.totalResults === 1
    ? '1 resultado'
    : `${props.totalResults} resultados`,
)
</script>

<style scoped>
.dashboard-search {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.dashboard-search__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 20px;
  border: 1px solid rgba(99, 102, 241, .18);
  border-radius: 16px;
  background: linear-gradient(135deg, var(--sh-primary-light) 0%, #ffffff 76%);
}

.dashboard-search__heading {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.dashboard-search__icon {
  width: 42px;
  height: 42px;
  border-radius: 11px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #ffffff;
  background: var(--sh-primary);
  box-shadow: 0 8px 18px -10px rgba(99, 102, 241, .7);
}

.dashboard-search__icon :deep(.v-icon) {
  color: #ffffff !important;
}

.dashboard-search__copy {
  min-width: 0;
}

.dashboard-search__title {
  margin: 0;
  font-size: 18px;
  line-height: 1.25;
  font-weight: 700;
  color: var(--sh-text-main);
}

.dashboard-search__summary {
  margin: 4px 0 0;
  font-size: 13px;
  line-height: 1.35;
  color: var(--sh-text-muted);
  overflow-wrap: anywhere;
}

.dashboard-search__clear,
.dashboard-search__empty-btn,
.search-result-card__action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  height: 36px;
  padding: 0 14px;
  border-radius: 9px;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 150ms, border-color 150ms, color 150ms, transform 150ms;
}

.dashboard-search__clear {
  border: 1px solid var(--sh-border);
  color: var(--sh-text-muted);
  background: #ffffff;
}

.dashboard-search__clear:hover {
  color: var(--sh-primary);
  border-color: rgba(99, 102, 241, .35);
  background: var(--sh-primary-light);
}

.dashboard-search__clear:focus-visible,
.dashboard-search__empty-btn:focus-visible,
.search-result-card__main:focus-visible,
.search-result-card__action:focus-visible {
  outline: 2px solid var(--sh-primary);
  outline-offset: 2px;
}

.dashboard-search__loading {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  align-self: flex-start;
  min-height: 32px;
  padding: 0 12px;
  border-radius: 999px;
  background: #ffffff;
  border: 1px solid var(--sh-border);
  color: var(--sh-text-muted);
  font-size: 12px;
  font-weight: 600;
}

.dashboard-search__empty {
  min-height: 260px;
  padding: 48px 24px;
  border: 1px dashed var(--sh-border);
  border-radius: 16px;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 10px;
}

.dashboard-search__empty-icon {
  color: var(--sh-text-light);
}

.dashboard-search__empty-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--sh-text-main);
}

.dashboard-search__empty-text {
  margin: 0;
  max-width: 360px;
  color: var(--sh-text-muted);
  font-size: 14px;
  line-height: 1.45;
  overflow-wrap: anywhere;
}

.dashboard-search__empty-btn {
  margin-top: 4px;
  border: none;
  color: #ffffff;
  background: var(--sh-primary);
}

.dashboard-search__empty-btn:hover {
  background: var(--sh-primary-dark);
}

.dashboard-search__sections,
.search-section {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.dashboard-search__sections {
  gap: 20px;
}

.search-section__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.search-section__title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  color: var(--sh-text-main);
  font-size: 16px;
  font-weight: 700;
}

.search-section__title :deep(.v-icon) {
  color: var(--sh-primary);
}

.search-section__count {
  min-width: 28px;
  height: 24px;
  padding: 0 9px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #eef2ff;
  color: var(--sh-primary);
  font-size: 12px;
  font-weight: 800;
}

.search-section__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
  gap: 14px;
}

.search-result-card {
  position: relative;
  min-width: 0;
  min-height: 132px;
  background: #ffffff;
  border: 1px solid var(--sh-border);
  border-radius: 14px;
  box-shadow: 0 1px 4px rgba(15, 23, 42, .06);
  display: flex;
  flex-direction: column;
  transition: border-color 180ms, box-shadow 180ms, transform 180ms;
}

.search-result-card:hover {
  border-color: rgba(99, 102, 241, .34);
  box-shadow: 0 8px 18px -16px rgba(15, 23, 42, .34);
  transform: translateY(-1px);
}

.search-result-card__main {
  width: 100%;
  min-width: 0;
  flex: 1;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 48px 12px 16px;
  border: none;
  background: transparent;
  text-align: left;
  cursor: pointer;
  border-radius: 14px;
  font-family: 'Inter', sans-serif;
}

.search-result-card__icon {
  width: 36px;
  height: 36px;
  border-radius: 9px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--sh-primary);
  background: var(--sh-primary-light);
}

.search-result-card__body {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.search-result-card__topline {
  min-height: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-result-card__eyebrow {
  color: #64748b;
  font-size: 12px;
  line-height: 1.2;
  font-weight: 700;
  letter-spacing: 0;
}

.search-result-card__title {
  color: var(--sh-text-main);
  font-size: 14px;
  line-height: 1.2;
  font-weight: 700;
  font-family: 'Inter', sans-serif;
  overflow-wrap: anywhere;
}

.search-result-card__meta,
.search-result-card__detail {
  font-size: 13px;
  line-height: 1.35;
  color: var(--sh-text-muted);
  overflow-wrap: anywhere;
}

.search-result-card__detail {
  color: #64748b;
  font-weight: 700;
}

.search-result-card__star {
  position: absolute;
  top: 14px;
  right: 16px;
  color: #f59e0b;
}

.search-result-card__action {
  align-self: flex-start;
  margin: 0 16px 14px 64px;
  border: 1px solid rgba(99, 102, 241, .28);
  color: var(--sh-primary);
  background: var(--sh-primary-light);
}

.search-result-card__action:hover:not(:disabled) {
  border-color: var(--sh-primary);
  background: #eef2ff;
}

.search-result-card__action:disabled {
  cursor: wait;
  opacity: .72;
}

@media (max-width: 720px) {
  .dashboard-search__header {
    align-items: flex-start;
    flex-direction: column;
  }

  .dashboard-search__clear {
    width: 100%;
  }

  .search-section__grid {
    grid-template-columns: 1fr;
  }

  .search-result-card__main {
    padding-right: 42px;
  }

  .search-result-card__action {
    margin-left: 16px;
  }
}
</style>
