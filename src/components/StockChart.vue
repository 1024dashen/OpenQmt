<template>
    <div class="stock-chart">
        <div class="chart-toolbar">
            <n-button-group size="small">
                <n-button
                    v-for="item in periodOptions"
                    :key="item.value"
                    :type="period === item.value ? 'primary' : 'default'"
                    :ghost="period !== item.value"
                    @click="period = item.value"
                >
                    {{ item.label }}
                </n-button>
            </n-button-group>
        </div>
        <div ref="chartRef" class="chart-container"></div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, computed } from 'vue'
import * as echarts from 'echarts'
import { NButton, NButtonGroup } from 'naive-ui'
import { useThemeStore } from '../stores/theme'
import {
    getChartData,
    type ChartPeriod,
    type IntradayPoint,
    type KLinePoint,
    type MAPoint,
} from '../data/stockDetailMock'
import type { StockKey } from '../types'

const props = defineProps<{
    stockKey: StockKey
}>()

const themeStore = useThemeStore()
const chartRef = ref<HTMLElement | null>(null)
const period = ref<ChartPeriod>('daily')
let chart: echarts.ECharts | null = null

const periodOptions: { label: string; value: ChartPeriod }[] = [
    { label: '分时', value: 'intraday' },
    { label: '日K', value: 'daily' },
    { label: '月K', value: 'monthly' },
]

const chartData = computed(() => getChartData(props.stockKey, period.value))

const colors = computed(() =>
    themeStore.isDark
        ? {
              text: '#9198a3',
              muted: '#636d83',
              border: 'rgba(255,255,255,0.08)',
              up: '#ef4444',
              down: '#22c55e',
              dif: '#d4a843',
              dea: '#61afef',
              k: '#d4a843',
              d: '#61afef',
              j: '#c678dd',
              area: 'rgba(212, 168, 67, 0.15)',
              ma5: '#e6a23c',
              ma10: '#409eff',
              ma20: '#f56c6c',
              ma30: '#67c23a',
              ma60: '#e6db74',
              ma150: '#b6a0d9',
          }
        : {
              text: '#4b5563',
              muted: '#9ca3af',
              border: 'rgba(0,0,0,0.06)',
              up: '#ef4444',
              down: '#22c55e',
              dif: '#b8922e',
              dea: '#3b82f6',
              k: '#b8922e',
              d: '#3b82f6',
              j: '#8b5cf6',
              area: 'rgba(184, 146, 46, 0.12)',
              ma5: '#e6a23c',
              ma10: '#409eff',
              ma20: '#f56c6c',
              ma30: '#67c23a',
              ma60: '#c4a747',
              ma150: '#9b59b6',
          }
)

function buildOption() {
    const c = colors.value
    const { intraday, klines, macd, kdj, mas } = chartData.value
    const times = klines.map((k) => k.time)
    const isIntraday = period.value === 'intraday'

    const mainSeries = isIntraday
        ? buildIntradaySeries(intraday!, c.up, c.down, c.area)
        : buildCandlestickSeries(klines, mas!, c)

    return {
        animation: false,
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'cross' },
            backgroundColor: themeStore.isDark ? '#353b45' : '#fff',
            borderColor: c.border,
            textStyle: { color: c.text, fontSize: 12 },
        },
        legend: isIntraday ? undefined : {
            data: ['MA5', 'MA10', 'MA20', 'MA30', 'MA60', 'MA150'],
            top: 0,
            right: 16,
            itemWidth: 14,
            itemHeight: 2,
            textStyle: { color: c.muted, fontSize: 10 },
            inactiveColor: c.border,
        },
        axisPointer: { link: [{ xAxisIndex: 'all' }] },
        grid: [
            { left: 56, right: 16, top: isIntraday ? 16 : 28, height: isIntraday ? '42%' : '40%' },
            { left: 56, right: 16, top: '58%', height: '18%' },
            { left: 56, right: 16, top: '80%', height: '16%' },
        ],
        graphic: [
            {
                type: 'text',
                left: 16,
                top: '57%',
                style: { text: 'MACD', fill: c.muted, fontSize: 11, fontWeight: 600 },
            },
            {
                type: 'text',
                left: 16,
                top: '79%',
                style: { text: 'KDJ', fill: c.muted, fontSize: 11, fontWeight: 600 },
            },
        ],
        xAxis: [
            {
                type: 'category',
                data: times,
                gridIndex: 0,
                axisLine: { lineStyle: { color: c.border } },
                axisLabel: { color: c.muted, fontSize: 10 },
                splitLine: { show: false },
            },
            {
                type: 'category',
                data: times,
                gridIndex: 1,
                axisLine: { lineStyle: { color: c.border } },
                axisLabel: { show: false },
                splitLine: { show: false },
            },
            {
                type: 'category',
                data: times,
                gridIndex: 2,
                axisLine: { lineStyle: { color: c.border } },
                axisLabel: { color: c.muted, fontSize: 10 },
                splitLine: { show: false },
            },
        ],
        yAxis: [
            {
                scale: true,
                gridIndex: 0,
                axisLine: { show: false },
                axisLabel: { color: c.muted, fontSize: 10 },
                splitLine: { lineStyle: { color: c.border, type: 'dashed' } },
            },
            {
                scale: true,
                gridIndex: 1,
                axisLine: { show: false },
                axisLabel: { show: false },
                splitLine: { lineStyle: { color: c.border, type: 'dashed' } },
            },
            {
                scale: true,
                gridIndex: 2,
                min: 0,
                max: 100,
                axisLine: { show: false },
                axisLabel: { show: false },
                splitLine: { lineStyle: { color: c.border, type: 'dashed' } },
            },
        ],
        dataZoom: [
            {
                type: 'inside',
                xAxisIndex: [0, 1, 2],
                start: isIntraday ? 0 : 60,
                end: 100,
            },
        ],
        series: [
            ...mainSeries,
            {
                name: 'DIF',
                type: 'line',
                xAxisIndex: 1,
                yAxisIndex: 1,
                data: macd.map((m) => m.dif),
                showSymbol: false,
                lineStyle: { width: 1, color: c.dif },
            },
            {
                name: 'DEA',
                type: 'line',
                xAxisIndex: 1,
                yAxisIndex: 1,
                data: macd.map((m) => m.dea),
                showSymbol: false,
                lineStyle: { width: 1, color: c.dea },
            },
            {
                name: 'MACD',
                type: 'bar',
                xAxisIndex: 1,
                yAxisIndex: 1,
                data: macd.map((m) => ({
                    value: m.macd,
                    itemStyle: { color: m.macd >= 0 ? c.up : c.down },
                })),
            },
            {
                name: 'K',
                type: 'line',
                xAxisIndex: 2,
                yAxisIndex: 2,
                data: kdj.map((k) => k.k),
                showSymbol: false,
                lineStyle: { width: 1, color: c.k },
            },
            {
                name: 'D',
                type: 'line',
                xAxisIndex: 2,
                yAxisIndex: 2,
                data: kdj.map((k) => k.d),
                showSymbol: false,
                lineStyle: { width: 1, color: c.d },
            },
            {
                name: 'J',
                type: 'line',
                xAxisIndex: 2,
                yAxisIndex: 2,
                data: kdj.map((k) => k.j),
                showSymbol: false,
                lineStyle: { width: 1, color: c.j },
            },
        ],
    }
}

function buildIntradaySeries(
    intraday: IntradayPoint[],
    upColor: string,
    downColor: string,
    areaColor: string
) {
    const basePrice = intraday[0]?.price ?? 0
    const prices = intraday.map((p) => p.price)
    const lineColor = prices[prices.length - 1] >= basePrice ? upColor : downColor
    return [
        {
            name: '价格',
            type: 'line',
            xAxisIndex: 0,
            yAxisIndex: 0,
            data: prices,
            showSymbol: false,
            lineStyle: { width: 1.5, color: lineColor },
            areaStyle: { color: areaColor },
        },
    ]
}

interface ChartColors {
    text: string
    muted: string
    border: string
    up: string
    down: string
    dif: string
    dea: string
    k: string
    d: string
    j: string
    area: string
    ma5: string
    ma10: string
    ma20: string
    ma30: string
    ma60: string
    ma150: string
}

function buildCandlestickSeries(klines: KLinePoint[], mas: MAPoint[], c: ChartColors) {
    const maConfig: { key: keyof MAPoint; label: string; color: string }[] = [
        { key: 'ma5', label: 'MA5', color: c.ma5 },
        { key: 'ma10', label: 'MA10', color: c.ma10 },
        { key: 'ma20', label: 'MA20', color: c.ma20 },
        { key: 'ma30', label: 'MA30', color: c.ma30 },
        { key: 'ma60', label: 'MA60', color: c.ma60 },
        { key: 'ma150', label: 'MA150', color: c.ma150 },
    ]
    return [
        {
            name: 'K线',
            type: 'candlestick',
            xAxisIndex: 0,
            yAxisIndex: 0,
            data: klines.map((k) => [k.open, k.close, k.low, k.high]),
            itemStyle: {
                color: c.up,
                color0: c.down,
                borderColor: c.up,
                borderColor0: c.down,
            },
        },
        ...maConfig.map(({ key, label, color }) => ({
            name: label,
            type: 'line',
            xAxisIndex: 0,
            yAxisIndex: 0,
            data: mas.map((m) => m[key]),
            showSymbol: false,
            lineStyle: { width: 1, color },
            connectNulls: false,
        })),
    ]
}

function renderChart() {
    if (!chartRef.value) return
    if (!chart) {
        chart = echarts.init(chartRef.value)
    }
    chart.setOption(buildOption(), true)
}

function handleResize() {
    chart?.resize()
}

watch([() => props.stockKey, period, () => themeStore.isDark], () => {
    renderChart()
})

onMounted(() => {
    renderChart()
    window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    chart?.dispose()
    chart = null
})
</script>

<style scoped>
.stock-chart {
    width: 100%;
}

.chart-toolbar {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 8px;
}

.chart-container {
    width: 100%;
    height: 480px;
}

@media (max-width: 768px) {
    .chart-container {
        height: 400px;
    }
}
</style>
