<template>
    <div
        class="price-card-wrap surface-card"
        :class="{ clickable }"
        @click="handleClick"
    >
        <div class="card-body">
            <div class="card-header">
                <span class="status-dot" :class="priceClass"></span>
                <span class="card-icon">{{ icon }}</span>
                <span class="card-name">{{ name }}</span>
                <span class="card-unit" v-if="unit">{{ unit }}</span>
            </div>
            <div class="card-content">
                <div class="card-left">
                    <span class="card-price num-mono" :class="priceClass">{{
                        formatPrice(current)
                    }}</span>
                    <span class="card-change num-mono" :class="priceClass">{{
                        changeStr
                    }}</span>
                </div>
                <div class="card-right">
                    <div class="detail-item">
                        <span class="detail-label">最高</span>
                        <span
                            class="detail-value num-mono"
                            :class="highClass"
                            >{{ formatPrice(high) }}</span
                        >
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">最低</span>
                        <span class="detail-value num-mono" :class="lowClass">{{
                            formatPrice(low)
                        }}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">开盘</span>
                        <span class="detail-value num-mono">{{
                            formatPrice(open)
                        }}</span>
                    </div>
                </div>
            </div>
            <div class="card-footer">
                <div class="footer-item">
                    <span class="footer-label">成交量</span>
                    <span class="footer-value num-mono">{{
                        formatVolume(volume)
                    }}</span>
                </div>
                <div class="footer-item">
                    <span class="footer-label">成交额</span>
                    <span class="footer-value num-mono">{{
                        formatAmount(amount)
                    }}</span>
                </div>
                <div class="footer-item">
                    <span class="footer-label">估值</span>
                    <span
                        class="footer-value"
                        :class="passionLevel(passionValuation)"
                        >{{ passionValuation
                        }}<span class="footer-desc"
                            >({{ valuationDesc(passionValuation) }})</span
                        ></span
                    >
                </div>
                <div class="footer-item">
                    <span class="footer-label">情绪</span>
                    <span
                        class="footer-value"
                        :class="passionLevel(passionSentiment)"
                    >
                        {{ passionSentiment }}
                        <span class="footer-desc"
                            >({{ sentimentDesc(passionSentiment) }})</span
                        ></span
                    >
                </div>
                <div class="footer-item">
                    <span class="footer-label" :title="passionTempIntro"
                        >温度</span
                    >
                    <span
                        class="footer-value"
                        :class="passionLevel(passionTemp)"
                        :title="passionTempIntro"
                        >{{ passionTemp }}°<span class="footer-desc"
                            >({{ tempDesc(passionTemp) }})</span
                        ></span
                    >
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
    defineProps<{
        name: string
        icon?: string
        unit?: string
        current?: number
        open?: number
        high?: number
        low?: number
        change?: number
        changePercent?: number
        volume?: number
        amount?: number
        decimals?: number
        passionTemp?: string
        passionTempIntro?: string
        passionValuation?: string
        passionSentiment?: string
        clickable?: boolean
    }>(),
    {
        icon: '',
        unit: '',
        current: 0,
        open: 0,
        high: 0,
        low: 0,
        change: 0,
        changePercent: 0,
        volume: 0,
        amount: 0,
        decimals: 2,
        passionTemp: '',
        passionTempIntro: '',
        passionValuation: '',
        passionSentiment: '',
        clickable: false,
    },
)

const emit = defineEmits<{
    click: []
}>()

function handleClick() {
    if (props.clickable) emit('click')
}

const isUp = computed(() => props.change > 0)
const isDown = computed(() => props.change < 0)
const priceClass = computed(() => {
    if (isUp.value) return 'up'
    if (isDown.value) return 'down'
    return 'flat'
})

const highClass = computed(() => {
    if (props.high > props.open) return 'price-up'
    if (props.high < props.open) return 'price-down'
    return ''
})

const lowClass = computed(() => {
    if (props.low > props.open) return 'price-up'
    if (props.low < props.open) return 'price-down'
    return ''
})

const changeStr = computed(() => {
    const sign = props.change > 0 ? '+' : ''
    return `${sign}${props.change.toFixed(
        props.decimals,
    )} · ${sign}${props.changePercent.toFixed(2)}%`
})

function formatPrice(val: number): string {
    if (val === 0 || val == null) return '--'
    return val.toFixed(props.decimals)
}

function formatVolume(val: number): string {
    if (!val) return '--'
    if (val >= 100000000) return (val / 100000000).toFixed(2) + '亿'
    if (val >= 10000) return (val / 10000).toFixed(2) + '万'
    return val.toString()
}

function formatAmount(val: number): string {
    if (!val) return '--'
    if (val >= 1000000000000) return (val / 1000000000000).toFixed(1) + '万亿'
    if (val >= 100000000) return (val / 100000000).toFixed(2) + '亿'
    if (val >= 10000) return (val / 10000).toFixed(2) + '万'
    return val.toString()
}

const hasPassion = computed(
    () =>
        !!(
            props.passionTemp ||
            props.passionValuation ||
            props.passionSentiment
        ),
)

function passionLevel(val: string): string {
    const n = parseInt(val, 10)
    if (isNaN(n)) return ''
    if (n >= 80) return 'hot'
    if (n >= 50) return 'warm'
    return 'cool'
}

function tempDesc(val: string): string {
    const n = parseInt(val, 10)
    if (isNaN(n)) return ''
    if (n >= 80) return '暴热'
    if (n >= 60) return '过热'
    if (n >= 30) return '适度'
    return '冰点'
}

function valuationDesc(val: string): string {
    const n = parseInt(val, 10)
    if (isNaN(n)) return ''
    if (n >= 80) return '极高'
    if (n >= 60) return '偏高'
    if (n >= 30) return '适中'
    return '偏低'
}

function sentimentDesc(val: string): string {
    const n = parseInt(val, 10)
    if (isNaN(n)) return ''
    if (n >= 80) return '亢奋'
    if (n >= 60) return '积极'
    if (n >= 30) return '平静'
    return '低落'
}
</script>

<style scoped>
.price-card-wrap.clickable {
    cursor: pointer;
    transition:
        background var(--transition-fast),
        box-shadow var(--transition-fast);
}

.price-card-wrap.clickable:hover {
    background: var(--bg-card-hover);
    box-shadow: var(--shadow-card);
}

.card-body {
    padding: 14px 16px;
}

.card-header {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 12px;
}

.status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    flex-shrink: 0;
}

.status-dot.up {
    background: var(--color-up);
}
.status-dot.down {
    background: var(--color-down);
}
.status-dot.flat {
    background: var(--color-flat);
}

.card-icon {
    font-size: 16px;
    line-height: 1;
}

.card-name {
    font-size: 13px;
    font-weight: 500;
    color: var(--text-secondary);
    flex: 1;
}

.card-unit {
    font-size: 10px;
    color: var(--text-muted);
    background: var(--surface-muted);
    padding: 1px 6px;
    border-radius: 100px;
}

.card-content {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 12px;
}

.card-left {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
}

.card-price {
    font-size: 26px;
    font-weight: 600;
    line-height: 1.1;
    letter-spacing: -0.03em;
}

.card-price.up {
    color: var(--color-up);
}
.card-price.down {
    color: var(--color-down);
}
.card-price.flat {
    color: var(--text-primary);
}

.card-change {
    font-size: 12px;
    font-weight: 500;
}

.card-change.up {
    color: var(--color-up);
}
.card-change.down {
    color: var(--color-down);
}
.card-change.flat {
    color: var(--color-flat);
}

.card-right {
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex-shrink: 0;
}

.detail-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    min-width: 0;
}

.detail-label {
    color: var(--text-muted);
    font-size: 11px;
    font-weight: 500;
    flex-shrink: 0;
}

.detail-value {
    color: var(--text-primary);
    font-size: 12px;
    font-weight: 500;
    text-align: right;
    min-width: 48px;
}

.detail-value.price-up {
    color: var(--color-up);
}

.detail-value.price-down {
    color: var(--color-down);
}

.card-footer {
    display: flex;
    gap: 0;
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px solid var(--border-subtle);
}

.footer-item {
    display: flex;
    align-items: center;
    gap: 2px;
    flex: 1;
    min-width: 0;
}

.footer-label {
    font-size: 10px;
    color: var(--text-muted);
    font-weight: 500;
    flex-shrink: 0;
}

.footer-value {
    font-size: 11px;
    font-weight: 600;
    color: var(--text-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.footer-desc {
    font-size: 9px;
    font-weight: 600;
    margin-left: 1px;
    opacity: 0.85;
}

.footer-value.hot {
    color: var(--color-up);
}

.footer-value.warm {
    color: #f59e0b;
}

.footer-value.cool {
    color: var(--color-down);
}

@media (max-width: 768px) {
    .card-body {
        padding: 12px 14px;
    }

    .card-price {
        font-size: 22px;
    }
}
</style>
