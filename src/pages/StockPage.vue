<template>
    <div class="stock-page">
        <n-spin :show="store.loading && Object.keys(store.data).length === 0">
            <div class="card-grid">
                <PriceCard
                    v-for="(config, key) in stockConfig"
                    :key="key"
                    clickable
                    :name="config.name"
                    :icon="config.icon"
                    unit="点"
                    :decimals="config.decimals"
                    :current="store.data[key]?.current ?? 0"
                    :open="store.data[key]?.open ?? 0"
                    :high="store.data[key]?.high ?? 0"
                    :low="store.data[key]?.low ?? 0"
                    :change="store.data[key]?.change ?? 0"
                    :changePercent="store.data[key]?.changePercent ?? 0"
                    :volume="store.data[key]?.volume ?? 0"
                    :amount="store.data[key]?.amount ?? 0"
                    :passionTemp="getPassion(key)?.temp"
                    :passionTempIntro="getPassion(key)?.temp_intro"
                    :passionValuation="getPassion(key)?.valuation"
                    :passionSentiment="getPassion(key)?.sentiment"
                    @click="goDetail(key as StockKey)"
                />
            </div>
        </n-spin>

        <h3 class="section-title">逻辑复盘</h3>

        <div class="stock-detail">
            <div class="detail-panel surface-card review-card">
                <n-tabs
                    v-model:value="reviewTab"
                    type="line"
                    animated
                    size="small"
                >
                    <n-tab-pane name="macro" tab="宏观视角" />
                    <n-tab-pane name="aShare" tab="A股复盘" />
                    <n-tab-pane name="usShare" tab="美股复盘" />
                    <n-tab-pane name="hotNews" tab="热点要闻" />
                    <n-tab-pane name="dragonTiger" tab="龙虎榜单" />
                </n-tabs>

                <!-- 宏观视角 -->
                <template v-if="reviewTab === 'macro'">
                    <div class="review-content" v-if="macroReview">
                        <div class="review-section">
                            <div class="review-section-header">
                                <span class="section-icon">🇨🇳</span>
                                <span class="section-title-text"
                                    >A股市场主线</span
                                >
                            </div>
                            <p class="review-text">
                                {{ macroReview.aShareTheme }}
                            </p>
                        </div>

                        <div class="review-section">
                            <div class="review-section-header">
                                <span class="section-icon">🇺🇸</span>
                                <span class="section-title-text"
                                    >美股市场主线</span
                                >
                            </div>
                            <p class="review-text">
                                {{ macroReview.usShareTheme }}
                            </p>
                        </div>

                        <div class="review-section">
                            <div class="review-section-header">
                                <span class="section-icon">🌍</span>
                                <span class="section-title-text"
                                    >全球共识长期产业主线</span
                                >
                            </div>
                            <div class="sector-list">
                                <div
                                    class="sector-item"
                                    v-for="(s, i) in macroReview.globalThemes"
                                    :key="i"
                                >
                                    <n-tag
                                        size="small"
                                        :bordered="false"
                                        type="warning"
                                        >{{ s.name }}</n-tag
                                    >
                                    <span class="sector-reason">{{
                                        s.desc
                                    }}</span>
                                </div>
                            </div>
                        </div>

                        <div class="review-section">
                            <div class="review-section-header">
                                <span class="section-icon">⚖️</span>
                                <span class="section-title-text"
                                    >投资配置建议</span
                                >
                            </div>
                            <p class="review-text">
                                {{ macroReview.allocation }}
                            </p>
                        </div>

                        <div class="review-section">
                            <div class="review-section-header">
                                <span class="section-icon">📋</span>
                                <span class="section-title-text">
                                    长期发展结论
                                </span>
                            </div>
                            <p class="review-text">
                                {{ macroReview.conclusion }}
                            </p>
                        </div>
                    </div>
                </template>

                <!-- A股复盘 / 美股复盘 -->
                <template
                    v-if="reviewTab === 'aShare' || reviewTab === 'usShare'"
                >
                    <div class="review-content" v-if="reviewData">
                        <div class="review-section">
                            <div class="review-section-header">
                                <span class="section-icon">📈</span>
                                <span class="section-title-text">走势概述</span>
                            </div>
                            <p class="review-text">{{ reviewData.trend }}</p>
                        </div>

                        <div class="review-section">
                            <div class="review-section-header">
                                <span class="section-icon">🌡️</span>
                                <span class="section-title-text">市场温度</span>
                            </div>
                            <div class="temperature-bar-wrap">
                                <div class="temperature-bar">
                                    <div
                                        class="temperature-fill"
                                        :style="{
                                            width:
                                                reviewData.temperatureScore +
                                                '%',
                                        }"
                                        :class="
                                            tempClass(
                                                reviewData.temperatureScore,
                                            )
                                        "
                                    />
                                </div>
                                <span class="temperature-label"
                                    >{{ reviewData.temperature }} ({{
                                        reviewData.temperatureScore
                                    }}°)</span
                                >
                            </div>
                        </div>

                        <div class="review-section">
                            <div class="review-section-header">
                                <span class="section-icon">🔥</span>
                                <span class="section-title-text">主线板块</span>
                            </div>
                            <div class="sector-list">
                                <div
                                    class="sector-item"
                                    v-for="(s, i) in reviewData.mainSectors"
                                    :key="i"
                                >
                                    <n-tag
                                        size="small"
                                        :bordered="false"
                                        type="success"
                                        >{{ s.name }}</n-tag
                                    >
                                    <span class="sector-reason">{{
                                        s.reason
                                    }}</span>
                                </div>
                            </div>
                        </div>

                        <div class="review-section">
                            <div class="review-section-header">
                                <span class="section-icon">💡</span>
                                <span class="section-title-text">支线板块</span>
                            </div>
                            <div class="sector-list">
                                <div
                                    class="sector-item"
                                    v-for="(s, i) in reviewData.subSectors"
                                    :key="i"
                                >
                                    <n-tag
                                        size="small"
                                        :bordered="false"
                                        type="info"
                                        >{{ s.name }}</n-tag
                                    >
                                    <span class="sector-reason">{{
                                        s.reason
                                    }}</span>
                                </div>
                            </div>
                        </div>

                        <div class="review-row-2col">
                            <div class="review-section">
                                <div class="review-section-header">
                                    <span class="section-icon">💰</span>
                                    <span class="section-title-text"
                                        >仓位建议</span
                                    >
                                </div>
                                <p class="review-text">
                                    {{ reviewData.positionAdvice }}
                                </p>
                            </div>
                            <div class="review-section">
                                <div class="review-section-header">
                                    <span class="section-icon">🎯</span>
                                    <span class="section-title-text"
                                        >投资策略</span
                                    >
                                </div>
                                <p class="review-text">
                                    {{ reviewData.strategy }}
                                </p>
                            </div>
                        </div>

                        <div class="review-row-2col">
                            <div class="review-section">
                                <div class="review-section-header">
                                    <span class="section-icon">🚫</span>
                                    <span class="section-title-text"
                                        >回避方向</span
                                    >
                                </div>
                                <ul class="review-list">
                                    <li
                                        v-for="(
                                            item, i
                                        ) in reviewData.avoidance"
                                        :key="i"
                                    >
                                        {{ item }}
                                    </li>
                                </ul>
                            </div>
                            <div class="review-section">
                                <div class="review-section-header">
                                    <span class="section-icon">⚠️</span>
                                    <span class="section-title-text"
                                        >利空因素</span
                                    >
                                </div>
                                <ul class="review-list">
                                    <li
                                        v-for="(
                                            item, i
                                        ) in reviewData.negativeFactors"
                                        :key="i"
                                    >
                                        {{ item }}
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </template>

                <!-- 热点要闻 -->
                <template v-if="reviewTab === 'hotNews'">
                    <div class="news-list">
                        <div
                            class="news-item"
                            v-for="item in hotNews"
                            :key="item.id"
                        >
                            <div class="news-title">{{ item.title }}</div>
                            <div class="news-meta">
                                <span class="news-source">{{
                                    item.source
                                }}</span>
                                <span class="news-time">{{ item.time }}</span>
                            </div>
                        </div>
                    </div>
                </template>

                <!-- 龙虎榜单 -->
                <template v-if="reviewTab === 'dragonTiger'">
                    <n-data-table
                        :columns="dragonTigerColumns"
                        :data="dragonTigerData"
                        :bordered="false"
                        size="small"
                        :pagination="false"
                    />
                </template>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, h, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStockStore } from '../stores/stock'
import { useBreakpoint } from '../composables/useBreakpoint'
import {
    NTabs,
    NTabPane,
    NTag,
    NDataTable,
    type DataTableColumns,
} from 'naive-ui'
import PriceCard from '../components/PriceCard.vue'
import {
    getMarketReview,
    getMacroReview,
    getHotNews,
    getDragonTiger,
    type ReviewTab,
    type MarketReview,
    type MacroReview,
    type HotNewsItem,
    type DragonTigerItem,
} from '../data/stockDetailMock'
import type { StockKey, SymbolConfig, QuoteData, PassionItem } from '../types'

const router = useRouter()
const store = useStockStore()
const { isMobile } = useBreakpoint()
const stockConfig = store.getConfig() as Record<StockKey, SymbolConfig>

// ── 逻辑复盘 ──
const reviewTab = ref<ReviewTab>('macro')

const reviewData = computed<MarketReview>(() =>
    getMarketReview(reviewTab.value),
)
const macroReview = computed<MacroReview>(() => getMacroReview())
const hotNews = computed<HotNewsItem[]>(() => getHotNews())
const dragonTigerData = computed<DragonTigerItem[]>(() => getDragonTiger())

function tempClass(score: number): string {
    if (score >= 70) return 'hot'
    if (score >= 40) return 'warm'
    return 'cold'
}

function formatWan(val: number): string {
    if (val >= 10000) return (val / 10000).toFixed(2) + '亿'
    return val.toFixed(0) + '万'
}

const dragonTigerColumns: DataTableColumns<DragonTigerItem> = [
    {
        title: '排名',
        key: 'rank',
        width: 48,
        align: 'center',
        render(row) {
            return h('span', { class: 'num-mono' }, String(row.rank))
        },
    },
    {
        title: '股票',
        key: 'stockName',
        width: 90,
        render(row) {
            return h(
                'div',
                {
                    style: 'cursor:pointer',
                    onClick: () =>
                        router.push({
                            name: 'StockInfo',
                            params: { code: row.stockCode },
                        }),
                },
                [
                    h(
                        'div',
                        { style: 'font-weight:600;color:var(--gold-primary)' },
                        row.stockName,
                    ),
                    h(
                        'div',
                        { style: 'font-size:11px;color:var(--text-muted)' },
                        row.stockCode,
                    ),
                ],
            )
        },
    },
    {
        title: '买入额',
        key: 'buyAmount',
        width: 80,
        align: 'right',
        render(row) {
            return h(
                'span',
                { class: 'num-mono', style: 'color:var(--color-up)' },
                formatWan(row.buyAmount),
            )
        },
    },
    {
        title: '卖出额',
        key: 'sellAmount',
        width: 80,
        align: 'right',
        render(row) {
            return h(
                'span',
                { class: 'num-mono', style: 'color:var(--color-down)' },
                formatWan(row.sellAmount),
            )
        },
    },
    {
        title: '净买入',
        key: 'netBuy',
        width: 80,
        align: 'right',
        render(row) {
            return h(
                'span',
                {
                    class: 'num-mono',
                    style: 'color:var(--color-up);font-weight:600',
                },
                formatWan(row.netBuy),
            )
        },
    },
    {
        title: '上榜原因',
        key: 'reason',
        ellipsis: { tooltip: true },
    },
    {
        title: '营业部',
        key: 'department',
        width: 140,
        ellipsis: { tooltip: true },
    },
]

/** StockKey → market 映射 */
const stockMarketMap: Record<StockKey, string> = {
    sh: 'CN',
    cy: 'CN',
    hk: 'HK',
    us: 'US',
}

function getPassion(key: StockKey): PassionItem | undefined {
    const market = stockMarketMap[key]
    return store.passion.find((p) => p.market === market)
}

function goDetail(key: StockKey): void {
    const config = stockConfig[key]
    router.push({
        name: 'StockDetail',
        params: { key },
        query: { name: config?.name },
    })
}
</script>

<style scoped>
.stock-page {
    width: 100%;
    min-width: 0;
    padding: var(--content-padding);
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

/* ── 逻辑复盘 ── */
.review-card {
    padding: 8px 0 4px;
    overflow: hidden;
}

.review-card :deep(.n-tabs-nav) {
    padding: 0 16px;
}

.review-content {
    padding: 0 20px 16px;
}

.review-section {
    margin-top: 16px;
}

.review-section-header {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 8px;
}

.section-icon {
    font-size: 16px;
    line-height: 1;
}

.section-title-text {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
}

.review-text {
    margin: 0;
    font-size: 13px;
    line-height: 1.7;
    color: var(--text-secondary);
}

/* temperature bar */
.temperature-bar-wrap {
    display: flex;
    align-items: center;
    gap: 12px;
}

.temperature-bar {
    flex: 1;
    height: 8px;
    border-radius: 4px;
    background: var(--surface-muted);
    overflow: hidden;
}

.temperature-fill {
    height: 100%;
    border-radius: 4px;
    transition: width 0.4s ease;
}

.temperature-fill.hot {
    background: linear-gradient(90deg, #f59e0b, #ef4444);
}

.temperature-fill.warm {
    background: linear-gradient(90deg, #22c55e, #f59e0b);
}

.temperature-fill.cold {
    background: linear-gradient(90deg, #3b82f6, #22c55e);
}

.temperature-label {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-primary);
    white-space: nowrap;
}

/* sector list */
.sector-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.sector-item {
    display: flex;
    align-items: baseline;
    gap: 8px;
}

.sector-reason {
    font-size: 13px;
    line-height: 1.6;
    color: var(--text-secondary);
}

/* 2-col row */
.review-row-2col {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    margin-top: 16px;
}

@media (max-width: 768px) {
    .review-row-2col {
        grid-template-columns: 1fr;
    }
}

/* review list (avoidance, negative factors) */
.review-list {
    margin: 0;
    padding-left: 18px;
    font-size: 13px;
    line-height: 1.8;
    color: var(--text-secondary);
}

/* ── 热点要闻 ── */
.news-list {
    padding: 12px 20px 8px;
    display: flex;
    flex-direction: column;
}

.news-item {
    padding: 12px 0;
    border-bottom: 1px solid var(--border-subtle);
}

.news-item:last-child {
    border-bottom: none;
}

.news-title {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-primary);
    line-height: 1.5;
}

.news-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 4px;
}

.news-source {
    font-size: 11px;
    color: var(--text-muted);
}

.news-time {
    font-size: 11px;
    color: var(--text-muted);
}

/* ── 龙虎榜单 ── */
.review-card :deep(.n-data-table .n-data-table-th) {
    background: var(--surface-muted) !important;
    color: var(--text-muted) !important;
    font-weight: 600;
    font-size: 11px;
}

.review-card :deep(.n-data-table .n-data-table-td) {
    border-bottom: 1px solid var(--border-subtle) !important;
}

@media (max-width: 768px) {
    .review-row-2col {
        grid-template-columns: 1fr;
    }
}
</style>
