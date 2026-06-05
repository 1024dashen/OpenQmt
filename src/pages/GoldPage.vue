<template>
  <div class="gold-page">
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
      <span class="update-time num-mono" v-if="store.lastUpdate">
        {{ store.lastUpdate }}
      </span>
    </div>

    <n-spin :show="store.loading && Object.keys(store.data).length === 0">
      <div class="card-grid">
        <PriceCard
          v-for="(config, key) in goldConfig"
          :key="key"
          :name="config.name"
          :icon="config.icon"
          :unit="config.unit"
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

    <div class="section-divider">
      <span class="section-label">市场资讯</span>
    </div>

    <div class="gold-info">
      <div class="info-grid">
        <div class="info-card">
          <div class="info-icon-wrap warning">
            <span class="info-icon-text">🪙</span>
          </div>
          <div class="info-body">
            <h4>上海黄金交易所</h4>
            <p>经国务院批准，由中国人民银行组建的国家级黄金交易平台，Au99.99为标准黄金合约。</p>
          </div>
        </div>
        <div class="info-card">
          <div class="info-icon-wrap info">
            <span class="info-icon-text">🏦</span>
          </div>
          <div class="info-body">
            <h4>积存金</h4>
            <p>银行推出的黄金积存产品，价格参考上海黄金交易所金价，门槛低、适合长期定投。</p>
          </div>
        </div>
        <div class="info-card">
          <div class="info-icon-wrap success">
            <span class="info-icon-text">🌍</span>
          </div>
          <div class="info-body">
            <h4>伦敦金/银</h4>
            <p>伦敦金（XAUUSD）和伦敦银（XAGUSD）是国际贵金属基准价格，以美元/盎司计价。</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from "vue";
import { useGoldStore } from "../stores/gold";
import PriceCard from "../components/PriceCard.vue";
import type { GoldKey, SymbolConfig } from "../types";

const store = useGoldStore();
const goldConfig = store.getConfig() as Record<GoldKey, SymbolConfig>;
const autoRefresh = ref(true);
let timer: ReturnType<typeof setInterval> | null = null;

function refreshData(): void {
  store.loadData();
}

function startAutoRefresh(): void {
  if (timer) clearInterval(timer);
  if (autoRefresh.value) {
    timer = setInterval(() => { store.loadData(); }, 10000);
  }
}

watch(autoRefresh, (val) => {
  if (val) { startAutoRefresh(); }
  else { if (timer) clearInterval(timer); timer = null; }
});

onMounted(() => { refreshData(); startAutoRefresh(); });
onUnmounted(() => { if (timer) clearInterval(timer); });
</script>

<style scoped>
.gold-page {
  max-width: 1200px;
  width: 100%;
  min-width: 0;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 18px;
}

@media (max-width: 1024px) {
  .card-grid {
    gap: 14px;
  }
}

@media (max-width: 768px) {
  .card-grid {
    grid-template-columns: 1fr;
  }
}

.section-divider {
  display: flex;
  align-items: center;
  margin: 28px 0 18px;
  gap: 12px;
}

.section-divider::before,
.section-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(212,168,67,0.15), transparent);
}

.section-label {
  color: var(--gold-primary);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 2px;
}

.gold-info {
  margin-top: 2px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}

@media (max-width: 1024px) {
  .info-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .info-grid {
    grid-template-columns: 1fr;
  }
}

.info-card {
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  gap: 14px;
  transition: all 0.3s;
}

.info-card:hover {
  border-color: rgba(212,168,67,0.15);
  background: var(--bg-card-hover);
}

.info-icon-wrap {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.info-icon-wrap.warning {
  background: rgba(212,168,67,0.12);
}
.info-icon-wrap.info {
  background: rgba(99,179,237,0.12);
}
.info-icon-wrap.success {
  background: rgba(34,197,94,0.12);
}

.info-icon-text {
  font-size: 20px;
}

.info-body h4 {
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
}

.info-body p {
  color: var(--text-muted);
  font-size: 13px;
  line-height: 1.5;
}
</style>