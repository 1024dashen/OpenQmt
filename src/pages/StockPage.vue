<template>
  <div class="stock-page">
    <div class="page-toolbar">
      <n-space align="center" :size="12">
        <n-button size="small" round @click="refreshData" :loading="store.loading">
          <template #icon><span style="font-size:14px">↻</span></template>
          刷新
        </n-button>
        <n-switch v-model:value="autoRefresh" size="small" class="toolbar-switch">
          <template #checked>自动刷新</template>
          <template #unchecked>手动</template>
        </n-switch>
      </n-space>
      <span class="update-time num-mono" v-if="store.lastUpdate">{{ store.lastUpdate }}</span>
    </div>

    <n-spin :show="store.loading && Object.keys(store.data).length === 0">
      <div class="card-grid">
        <PriceCard
          v-for="(config, key) in stockConfig"
          :key="key"
          :name="config.name"
          :icon="config.icon"
          unit="点"
          :current="store.data[key]?.current ?? 0"
          :open="store.data[key]?.open ?? 0"
          :high="store.data[key]?.high ?? 0"
          :low="store.data[key]?.low ?? 0"
          :change="store.data[key]?.change ?? 0"
          :changePercent="store.data[key]?.changePercent ?? 0"
          :volume="store.data[key]?.volume ?? 0"
          :amount="store.data[key]?.amount ?? 0"
        />
      </div>
    </n-spin>

    <h3 class="section-title">详细数据</h3>

    <div class="stock-detail">
      <n-grid :cols="detailCols" :x-gap="14" :y-gap="14">
        <n-gi>
          <div class="detail-panel surface-card">
            <div class="panel-header">
              <span class="panel-icon">🇨🇳</span>
              <span class="panel-title">A股市场</span>
            </div>
            <div class="panel-body">
              <div class="index-row" v-for="key in ['sh000001', 'sz399006']" :key="key">
                <span class="index-name">{{ stockConfig[key as StockKey]?.name }}</span>
                <span class="index-price num-mono" :class="priceColor(key as StockKey)">{{ formatVal(store.data[key as StockKey]?.current) }}</span>
                <span class="index-change num-mono" :class="priceColor(key as StockKey)">{{ formatChange(store.data[key as StockKey]) }}</span>
              </div>
            </div>
          </div>
        </n-gi>
        <n-gi>
          <div class="detail-panel surface-card">
            <div class="panel-header">
              <span class="panel-icon">🌏</span>
              <span class="panel-title">海外市场</span>
            </div>
            <div class="panel-body">
              <div class="index-row" v-for="key in ['hsi', 'ndx']" :key="key">
                <span class="index-name">{{ stockConfig[key as StockKey]?.name }}</span>
                <span class="index-price num-mono" :class="priceColor(key as StockKey)">{{ formatVal(store.data[key as StockKey]?.current) }}</span>
                <span class="index-change num-mono" :class="priceColor(key as StockKey)">{{ formatChange(store.data[key as StockKey]) }}</span>
              </div>
            </div>
          </div>
        </n-gi>
      </n-grid>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch, computed } from "vue";
import { useStockStore } from "../stores/stock";
import { useBreakpoint } from "../composables/useBreakpoint";
import PriceCard from "../components/PriceCard.vue";
import type { StockKey, SymbolConfig, QuoteData } from "../types";

const store = useStockStore();
const { isMobile } = useBreakpoint();
const detailCols = computed(() => (isMobile.value ? 1 : 2));
const stockConfig = store.getConfig() as Record<StockKey, SymbolConfig>;
const autoRefresh = ref(true);
let timer: ReturnType<typeof setInterval> | null = null;

function refreshData(): void { store.loadData(); }

function startAutoRefresh(): void {
  if (timer) clearInterval(timer);
  if (autoRefresh.value) { timer = setInterval(() => { store.loadData(); }, 10000); }
}

function priceColor(key: StockKey): string {
  const d = store.data[key];
  if (!d) return "flat";
  if (d.change > 0) return "up";
  if (d.change < 0) return "down";
  return "flat";
}

function formatVal(val: number | undefined): string {
  if (!val) return "--";
  return val.toFixed(2);
}

function formatChange(d: QuoteData | undefined): string {
  if (!d) return "--";
  const sign = d.change > 0 ? "+" : "";
  return `${sign}${d.change.toFixed(2)} (${sign}${d.changePercent.toFixed(2)}%)`;
}

watch(autoRefresh, (val) => {
  if (val) { startAutoRefresh(); }
  else { if (timer) clearInterval(timer); timer = null; }
});

onMounted(() => { refreshData(); startAutoRefresh(); });
onUnmounted(() => { if (timer) clearInterval(timer); });
</script>

<style scoped>
.stock-page {
  max-width: 1200px;
  width: 100%;
  min-width: 0;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

@media (max-width: 768px) {
  .card-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}

.detail-panel {
  padding: 18px 20px;
}

.detail-panel:hover {
  transform: none;
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
}

.panel-icon {
  font-size: 20px;
}

.panel-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: -0.01em;
}

.panel-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.index-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid var(--border-subtle);
}

.index-row:last-child {
  border-bottom: none;
}

.index-name {
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
  flex: 1;
}

.index-price {
  font-size: 16px;
  font-weight: 700;
}

.index-price.up { color: var(--color-up); }
.index-price.down { color: var(--color-down); }
.index-price.flat { color: var(--color-flat); }

.index-change {
  font-size: 13px;
  font-weight: 600;
}

.index-change.up { color: var(--color-up); }
.index-change.down { color: var(--color-down); }
.index-change.flat { color: var(--color-flat); }

@media (max-width: 480px) {
  .index-row {
    flex-wrap: wrap;
    gap: 4px 12px;
  }

  .index-change {
    width: 100%;
    font-size: 12px;
  }
}
</style>