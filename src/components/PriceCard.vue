<template>
  <div class="price-card-wrap" :class="{ 'card-up': isUp, 'card-down': isDown }">
    <div class="card-top-bar" :class="priceClass"></div>
    <div class="card-body">
      <div class="card-header">
        <span class="card-icon">{{ icon }}</span>
        <span class="card-name">{{ name }}</span>
        <span class="card-unit" v-if="unit">{{ unit }}</span>
      </div>
      <div class="card-price-row">
        <span class="card-price num-mono" :class="priceClass">{{ formatPrice(current) }}</span>
      </div>
      <div class="card-change-row" :class="priceClass">
        <span class="card-change-val num-mono">{{ changeStr }}</span>
      </div>
      <div class="card-divider"></div>
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
      </div>
      <div class="card-volume" v-if="volume > 0">
        <span class="detail-label">成交量</span>
        <span class="detail-value num-mono">{{ formatVolume(volume) }}</span>
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
  return `${sign}${props.change.toFixed(props.decimals)}  ${sign}${props.changePercent.toFixed(2)}%`;
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
  position: relative;
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: 14px;
  overflow: hidden;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: default;
}

.price-card-wrap:hover {
  transform: translateY(-3px);
  background: var(--bg-card-hover);
  border-color: rgba(212, 168, 67, 0.18);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4), 0 0 24px rgba(212, 168, 67, 0.08);
}

.card-top-bar {
  height: 3px;
  width: 100%;
  transition: background 0.3s;
}

.card-top-bar.up {
  background: linear-gradient(90deg, var(--color-up), rgba(239, 68, 68, 0.4));
}

.card-top-bar.down {
  background: linear-gradient(90deg, var(--color-down), rgba(34, 197, 94, 0.4));
}

.card-top-bar.flat {
  background: linear-gradient(90deg, var(--color-flat), rgba(156, 163, 175, 0.3));
}

.card-body {
  padding: 18px 20px 16px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
}

.card-icon {
  font-size: 22px;
  line-height: 1;
}

.card-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  flex: 1;
}

.card-unit {
  font-size: 11px;
  color: var(--text-muted);
  background: rgba(212, 168, 67, 0.1);
  padding: 2px 8px;
  border-radius: 5px;
  letter-spacing: 0.3px;
}

.card-price-row {
  margin-bottom: 4px;
}

.card-price {
  font-size: 30px;
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: -0.5px;
}

.card-price.up { color: var(--color-up); }
.card-price.down { color: var(--color-down); }
.card-price.flat { color: var(--color-flat); }

.card-change-row {
  margin-bottom: 4px;
}

.card-change-row.up {
  color: var(--color-up);
  background: var(--color-up-bg);
  padding: 3px 10px;
  border-radius: 6px;
  display: inline-block;
}

.card-change-row.down {
  color: var(--color-down);
  background: var(--color-down-bg);
  padding: 3px 10px;
  border-radius: 6px;
  display: inline-block;
}

.card-change-row.flat {
  color: var(--color-flat);
}

.card-change-val {
  font-size: 13px;
  font-weight: 600;
}

.card-divider {
  height: 1px;
  margin: 12px 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.06), transparent);
}

.card-detail {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-label {
  color: var(--text-muted);
  font-size: 13px;
  font-weight: 500;
}

.detail-value {
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 600;
}

.card-volume {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.04);
}

@media (max-width: 768px) {
  .card-body {
    padding: 14px 16px 12px;
  }

  .card-price {
    font-size: 26px;
  }

  .card-header {
    margin-bottom: 10px;
  }
}
</style>