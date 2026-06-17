<template>
    <div class="gold-page">
        <n-spin :show="store.loading && Object.keys(store.data).length === 0">
            <div class="card-grid">
                <PriceCard
                    v-for="(config, key) in goldConfig"
                    :key="key"
                    :name="config.name"
                    :icon="config.icon"
                    :unit="config.unit"
                    :decimals="config.decimals"
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

        <h3 class="section-title">市场资讯</h3>

        <div class="gold-info">
            <div class="info-grid">
                <div class="info-card surface-card">
                    <div class="info-icon-wrap warning">
                        <span class="info-icon-text">🪙</span>
                    </div>
                    <div class="info-body">
                        <h4>上海黄金交易所</h4>
                        <p>
                            经国务院批准，由中国人民银行组建的国家级黄金交易平台，Au99.99为标准黄金合约。
                        </p>
                    </div>
                </div>
                <div class="info-card surface-card">
                    <div class="info-icon-wrap info">
                        <span class="info-icon-text">🏦</span>
                    </div>
                    <div class="info-body">
                        <h4>积存金</h4>
                        <p>
                            银行推出的黄金积存产品，价格参考上海黄金交易所金价，门槛低、适合长期定投。
                        </p>
                    </div>
                </div>
                <div class="info-card surface-card">
                    <div class="info-icon-wrap success">
                        <span class="info-icon-text">🌍</span>
                    </div>
                    <div class="info-body">
                        <h4>伦敦金/银</h4>
                        <p>
                            伦敦金（XAUUSD）和伦敦银（XAGUSD）是国际贵金属基准价格，以美元/盎司计价。
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useGoldStore } from '../stores/gold'
import PriceCard from '../components/PriceCard.vue'
import type { GoldKey, SymbolConfig } from '../types'

const store = useGoldStore()
const goldConfig = store.getConfig() as Record<GoldKey, SymbolConfig>
</script>

<style scoped>
.gold-page {
    max-width: 100%;
    width: 100%;
    min-width: 0;
}

.card-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
}

@media (max-width: 768px) {
    .card-grid {
        grid-template-columns: 1fr;
        gap: 10px;
    }
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
    padding: 16px;
    display: flex;
    gap: 14px;
}

.info-icon-wrap {
    width: 40px;
    height: 40px;
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    background: var(--surface-muted);
}

.info-icon-text {
    font-size: 18px;
}

.info-body h4 {
    color: var(--text-primary);
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 4px;
    letter-spacing: -0.01em;
}

.info-body p {
    color: var(--text-muted);
    font-size: 13px;
    line-height: 1.55;
}
</style>
