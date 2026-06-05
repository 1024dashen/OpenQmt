<template>
  <div class="price-card-wrap surface-card">
    <div class="card-body">
      <div class="card-header">
        <span class="status-dot" :class="priceClass"></span>
        <span class="card-icon">{{ icon }}</span>
        <span class="card-name">{{ name }}</span>
        <span class="card-unit" v-if="unit">{{ unit }}</span>
      </div>
      <div class="card-price-row">
        <span class="card-price num-mono" :class="priceClass">{{ formatPrice(current) }}</span>
        <span class="card-change-pill num-mono" :class="priceClass">{{ changeStr }}</span>
      </div>
      <div class="card-detail">
        <div class="detail-item">
          <span class="detail-label">开盘</span>
          <span class="detail-value num-mono">{{ formatPrice(open) }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">最高</span>
          <span class="detail-value num-mono price-up">{{ formatPrice(high) }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">最低</span>
          <span class="detail-value num-mono price-down">{{ formatPrice(low) }}</span>
        </div>
        <div class="detail-item" v-if="volume > 0">
          <span class="detail-label">成交量</span>
          <span class="detail-value num-mono">{{ formatVolume(volume) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(defineProps<{
  name: string;
  icon?: string;
  unit?: string;
  current?: number;
  open?: number;
  high?: number;
  low?: number;
  change?: number;
  changePercent?: number;
  volume?: number;
  amount?: number;
  decimals?: number;
}>(), {
  icon: "",
  unit: "",
  current: 0,
  open: 0,
  high: 0,
  low: 0,
  change: 0,
  changePercent: 0,
  volume: 0,
  amount: 0,
  decimals: 2,
});

const isUp = computed(() => props.change > 0);
const isDown = computed(() => props.change < 0);
const priceClass = computed(() => {
  if (isUp.value) return "up";
  if (isDown.value) return "down";
  return "flat";
});

const changeStr = computed(() => {
  const sign = props.change > 0 ? "+" : "";
  return `${sign}${props.change.toFixed(props.decimals)} · ${sign}${props.changePercent.toFixed(2)}%`;
});

function formatPrice(val: number): string {
  if (val === 0 || val == null) return "--";
  return val.toFixed(props.decimals);
}

function formatVolume(val: number): string {
  if (!val) return "--";
  if (val >= 100000000) return (val / 100000000).toFixed(2) + "亿";
  if (val >= 10000) return (val / 10000).toFixed(2) + "万";
  return val.toString();
}
</script>

<style scoped>
.price-card-wrap {
  cursor: default;
}

.price-card-wrap:hover {
  transform: none;
}

.card-body {
  padding: 18px 20px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-dot.up { background: var(--color-up); }
.status-dot.down { background: var(--color-down); }
.status-dot.flat { background: var(--color-flat); }

.card-icon {
  font-size: 18px;
  line-height: 1;
}

.card-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  flex: 1;
}

.card-unit {
  font-size: 11px;
  color: var(--text-muted);
  background: var(--surface-muted);
  padding: 2px 8px;
  border-radius: 100px;
}

.card-price-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 18px;
}

.card-price {
  font-size: 28px;
  font-weight: 600;
  line-height: 1.1;
  letter-spacing: -0.03em;
}

.card-price.up { color: var(--color-up); }
.card-price.down { color: var(--color-down); }
.card-price.flat { color: var(--text-primary); }

.card-change-pill {
  font-size: 12px;
  font-weight: 500;
  padding: 4px 10px;
  border-radius: 100px;
  white-space: nowrap;
}

.card-change-pill.up {
  color: var(--color-up);
  background: var(--color-up-bg);
}

.card-change-pill.down {
  color: var(--color-down);
  background: var(--color-down-bg);
}

.card-change-pill.flat {
  color: var(--color-flat);
  background: var(--surface-muted);
}

.card-detail {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px 16px;
  padding-top: 16px;
  border-top: 1px solid var(--border-subtle);
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.detail-label {
  color: var(--text-muted);
  font-size: 11px;
  font-weight: 500;
}

.detail-value {
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 500;
}

@media (max-width: 768px) {
  .card-body {
    padding: 16px;
  }

  .card-price {
    font-size: 24px;
  }

  .card-change-pill {
    font-size: 11px;
    padding: 3px 8px;
  }
}
</style>
