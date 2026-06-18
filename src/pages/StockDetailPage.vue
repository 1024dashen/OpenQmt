<template>
    <div class="stock-detail-page">
        <template v-if="info">
            <div class="detail-header surface-card">
                <div class="header-top">
                    <span class="stock-icon">{{ info.icon }}</span>
                    <div class="header-names">
                        <h2 class="stock-name">{{ info.name }}</h2>
                        <span class="stock-code num-mono">{{ info.code }} · {{ info.market }}</span>
                    </div>
                    <div class="header-price">
                        <span class="price-value num-mono" :class="priceClass">{{
                            info.current.toFixed(2)
                        }}</span>
                        <span class="price-change num-mono" :class="priceClass">{{
                            changeStr
                        }}</span>
                    </div>
                </div>
                <div class="info-grid">
                    <div class="info-item">
                        <span class="info-label">今开</span>
                        <span class="info-value num-mono">{{ info.open.toFixed(2) }}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">最高</span>
                        <span class="info-value num-mono up">{{ info.high.toFixed(2) }}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">最低</span>
                        <span class="info-value num-mono down">{{ info.low.toFixed(2) }}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">振幅</span>
                        <span class="info-value num-mono">{{ info.amplitude }}%</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">成交量</span>
                        <span class="info-value num-mono">{{ formatVolume(info.volume) }}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">成交额</span>
                        <span class="info-value num-mono">{{ formatAmount(info.amount) }}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">换手率</span>
                        <span class="info-value num-mono">{{ info.turnover }}%</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">PE / PB</span>
                        <span class="info-value num-mono">{{ info.pe }} / {{ info.pb }}</span>
                    </div>
                </div>
            </div>

            <h3 class="section-title">K 线图</h3>
            <div class="surface-card chart-card">
                <StockChart v-if="stockKey" :stock-key="stockKey" />
            </div>

            <h3 class="section-title">板块统计</h3>
            <div class="surface-card sector-card">
                <n-tabs v-model:value="sectorTab" type="line" animated size="small">
                    <n-tab-pane
                        v-for="tab in sectorTabs"
                        :key="tab.value"
                        :name="tab.value"
                        :tab="tab.label"
                    />
                </n-tabs>
                <n-data-table
                    :columns="sectorColumns"
                    :data="sectorData"
                    :bordered="false"
                    size="small"
                    :pagination="false"
                    class="sector-table"
                />
            </div>
        </template>

        <n-result v-else status="404" title="未找到该指数" description="请从股票行情页选择有效的大盘指数">
            <template #footer>
                <n-button type="primary" @click="router.push('/stock')">返回行情</n-button>
            </template>
        </n-result>
    </div>
</template>

<script setup lang="ts">
import { computed, h, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
    NButton,
    NDataTable,
    NResult,
    NTabs,
    NTabPane,
    type DataTableColumns,
} from 'naive-ui'
import StockChart from '../components/StockChart.vue'
import {
    getStockDetailInfo,
    getSectorData,
    isValidStockKey,
    type SectorItem,
    type SectorTab,
} from '../data/stockDetailMock'
import type { StockKey } from '../types'

const route = useRoute()
const router = useRouter()

const sectorTab = ref<SectorTab>('hot')

const sectorTabs: { label: string; value: SectorTab }[] = [
    { label: '热门板块', value: 'hot' },
    { label: '行业板块', value: 'industry' },
    { label: '概念板块', value: 'concept' },
    { label: '主力板块', value: 'main' },
]

const stockKey = computed<StockKey | null>(() => {
    const key = String(route.params.key ?? '')
    return isValidStockKey(key) ? key : null
})

const info = computed(() =>
    stockKey.value ? getStockDetailInfo(stockKey.value) : null
)

const sectorData = computed(() =>
    stockKey.value ? getSectorData(stockKey.value, sectorTab.value) : []
)

const priceClass = computed(() => {
    if (!info.value) return 'flat'
    if (info.value.change > 0) return 'up'
    if (info.value.change < 0) return 'down'
    return 'flat'
})

const changeStr = computed(() => {
    if (!info.value) return '--'
    const sign = info.value.change > 0 ? '+' : ''
    return `${sign}${info.value.change.toFixed(2)} (${sign}${info.value.changePercent.toFixed(2)}%)`
})

const sectorColumns: DataTableColumns<SectorItem> = [
    {
        title: '排名',
        key: 'rank',
        width: 56,
        align: 'center',
        render(row) {
            return h('span', { class: 'num-mono' }, String(row.rank))
        },
    },
    { title: '板块', key: 'name', ellipsis: { tooltip: true } },
    {
        title: '涨跌幅',
        key: 'changePercent',
        width: 88,
        align: 'right',
        render(row) {
            return changeCell(row.changePercent)
        },
    },
    {
        title: '领涨股',
        key: 'leadStock',
        width: 100,
        ellipsis: { tooltip: true },
    },
    {
        title: '领涨涨幅',
        key: 'leadChange',
        width: 88,
        align: 'right',
        render(row) {
            return changeCell(row.leadChange)
        },
    },
    {
        title: '成交额',
        key: 'amount',
        width: 96,
        align: 'right',
        render(row) {
            return h('span', { class: 'num-mono' }, formatAmount(row.amount))
        },
    },
]

function changeCell(val: number) {
    const sign = val > 0 ? '+' : ''
    const color =
        val > 0
            ? 'var(--color-up)'
            : val < 0
              ? 'var(--color-down)'
              : 'var(--color-flat)'
    return h(
        'span',
        { class: 'num-mono', style: { color, fontWeight: '600' } },
        `${sign}${val.toFixed(2)}%`
    )
}

function formatVolume(val: number): string {
    if (!val) return '--'
    if (val >= 1e8) return (val / 1e8).toFixed(2) + '亿'
    if (val >= 1e4) return (val / 1e4).toFixed(2) + '万'
    return val.toString()
}

function formatAmount(val: number): string {
    if (!val) return '--'
    if (val >= 1e12) return (val / 1e12).toFixed(1) + '万亿'
    if (val >= 1e8) return (val / 1e8).toFixed(2) + '亿'
    if (val >= 1e4) return (val / 1e4).toFixed(2) + '万'
    return val.toString()
}

watch(stockKey, () => {
    sectorTab.value = 'hot'
})
</script>

<style scoped>
.stock-detail-page {
    max-width: 100%;
    min-width: 0;
}

.detail-header {
    padding: 20px 22px;
    margin-bottom: 8px;
}

.header-top {
    display: flex;
    align-items: center;
    gap: 14px;
    flex-wrap: wrap;
}

.stock-icon {
    font-size: 28px;
    line-height: 1;
}

.header-names {
    flex: 1;
    min-width: 120px;
}

.stock-name {
    margin: 0;
    font-size: 20px;
    font-weight: 700;
    color: var(--text-primary);
}

.stock-code {
    font-size: 12px;
    color: var(--text-muted);
}

.header-price {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
}

.price-value {
    font-size: 28px;
    font-weight: 700;
    line-height: 1.1;
}

.price-value.up {
    color: var(--color-up);
}
.price-value.down {
    color: var(--color-down);
}
.price-value.flat {
    color: var(--text-primary);
}

.price-change {
    font-size: 14px;
    font-weight: 600;
}

.price-change.up {
    color: var(--color-up);
}
.price-change.down {
    color: var(--color-down);
}
.price-change.flat {
    color: var(--color-flat);
}

.info-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px 16px;
    margin-top: 18px;
    padding-top: 16px;
    border-top: 1px solid var(--border-subtle);
}

.info-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.info-label {
    font-size: 11px;
    color: var(--text-muted);
    font-weight: 500;
}

.info-value {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
}

.info-value.up {
    color: var(--color-up);
}

.info-value.down {
    color: var(--color-down);
}

.chart-card {
    padding: 12px 14px 16px;
    margin-bottom: 8px;
    overflow: hidden;
}

.sector-card {
    padding: 8px 0 4px;
    margin-bottom: 8px;
    overflow: hidden;
}

.sector-card :deep(.n-tabs-nav) {
    padding: 0 16px;
}

.sector-table {
    margin-top: 4px;
}

:deep(.n-data-table .n-data-table-th) {
    background: var(--surface-muted) !important;
    color: var(--text-muted) !important;
    font-weight: 600;
    font-size: 11px;
}

:deep(.n-data-table .n-data-table-td) {
    border-bottom: 1px solid var(--border-subtle) !important;
}

@media (max-width: 768px) {
    .info-grid {
        grid-template-columns: repeat(2, 1fr);
    }

    .header-price {
        width: 100%;
        align-items: flex-start;
    }
}
</style>
