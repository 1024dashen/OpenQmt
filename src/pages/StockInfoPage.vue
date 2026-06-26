<template>
  <div class="stock-info-page">
    <!-- 基本信息 -->
    <div class="info-header surface-card">
      <div class="header-row">
        <div class="name-block">
          <h2 class="stock-name">{{ data.info.name }}</h2>
          <span class="stock-code num-mono">{{ data.info.code }}</span>
        </div>
        <div class="price-block">
          <span class="price num-mono" :class="priceClass">{{
            data.info.current.toFixed(2)
          }}</span>
          <span class="change num-mono" :class="priceClass">{{
            changeStr
          }}</span>
        </div>
      </div>
      <div class="info-grid">
        <div class="info-item">
          <span class="lbl">今开</span
          ><span class="val num-mono">{{ data.info.open.toFixed(2) }}</span>
        </div>
        <div class="info-item">
          <span class="lbl">最高</span
          ><span class="val num-mono up">{{ data.info.high.toFixed(2) }}</span>
        </div>
        <div class="info-item">
          <span class="lbl">最低</span
          ><span class="val num-mono down">{{ data.info.low.toFixed(2) }}</span>
        </div>
        <div class="info-item">
          <span class="lbl">成交量</span
          ><span class="val num-mono">{{ fmtVol(data.info.volume) }}</span>
        </div>
        <div class="info-item">
          <span class="lbl">总市值</span
          ><span class="val num-mono">{{
            fmtAmt(data.info.totalMarketCap)
          }}</span>
        </div>
        <div class="info-item">
          <span class="lbl">成交额</span
          ><span class="val num-mono">{{ fmtAmt(data.info.amount) }}</span>
        </div>
        <div class="info-item">
          <span class="lbl">量比</span
          ><span class="val num-mono">{{ data.info.volumeRatio }}</span>
        </div>
        <div class="info-item">
          <span class="lbl">换手率</span
          ><span class="val num-mono">{{ data.info.turnoverRate }}%</span>
        </div>
        <div class="info-item">
          <span class="lbl">市净率</span
          ><span class="val num-mono">{{ data.info.pb }}</span>
        </div>
        <div class="info-item">
          <span class="lbl">市盈率</span
          ><span class="val num-mono">{{ data.info.pe }}</span>
        </div>
        <div class="info-item">
          <span class="lbl">所属板块</span
          ><span class="val">{{ data.info.sector }}</span>
        </div>
        <div class="info-item">
          <span class="lbl">所属行业</span
          ><span class="val">{{ data.info.industry }}</span>
        </div>
      </div>
      <div class="intro-block">
        <p class="intro-text">{{ data.info.intro }}</p>
        <p class="highlight-text">{{ data.info.highlights }}</p>
      </div>
    </div>

    <!-- 综合诊股 -->
    <h3 class="section-title">综合诊股</h3>
    <div class="surface-card diagnosis-card">
      <!-- 评分头部 -->
      <div class="diag-header">
        <div class="score-circle" :class="scoreClass">
          <span class="score-num num-mono">{{
            data.diagnosis.totalScore
          }}</span>
          <span class="score-lbl">综合评分</span>
        </div>
        <div class="diag-meta">
          <n-tag :type="sectorTagType" size="small" round :bordered="false"
            >{{ data.diagnosis.sectorType }}板块
          </n-tag>
          <span class="meta-item"
            >人气排名
            <strong class="num-mono">{{
              data.diagnosis.popularityRank
            }}</strong></span
          >
        </div>
        <div class="action-badge" :class="actionClass">
          {{ data.diagnosis.action }}
        </div>
      </div>

      <!-- 关键价位 -->
      <div class="price-levels">
        <div class="level-item">
          <span class="level-lbl">压力位</span
          ><span class="level-val num-mono up">{{
            data.diagnosis.resistance.toFixed(2)
          }}</span>
        </div>
        <div class="level-item">
          <span class="level-lbl">支撑位</span
          ><span class="level-val num-mono down">{{
            data.diagnosis.support.toFixed(2)
          }}</span>
        </div>
        <div class="level-item">
          <span class="level-lbl">估值价</span
          ><span class="level-val num-mono">{{
            data.diagnosis.fairValue.toFixed(2)
          }}</span>
        </div>
      </div>

      <!-- 趋势 -->
      <div class="trend-row">
        <div class="trend-item">
          <span class="trend-lbl">短期趋势</span
          ><span class="trend-val">{{ data.diagnosis.shortTrend }}</span>
        </div>
        <div class="trend-item">
          <span class="trend-lbl">中期趋势</span
          ><span class="trend-val">{{ data.diagnosis.midTrend }}</span>
        </div>
        <div class="trend-item">
          <span class="trend-lbl">长期趋势</span
          ><span class="trend-val">{{ data.diagnosis.longTrend }}</span>
        </div>
      </div>

      <!-- 五维评分 -->
      <div class="score-list">
        <div v-for="s in scoreItems" :key="s.label" class="score-item">
          <span class="score-label">{{ s.label }}</span>
          <span class="score-val num-mono">{{ s.score }}</span>
          <span class="score-desc">{{ s.desc }}</span>
        </div>
      </div>
    </div>

    <!-- 公司概要 -->
    <h3 class="section-title">公司概要</h3>
    <div class="surface-card profile-card">
      <p class="profile-intro">{{ data.profile.intro }}</p>

      <!-- 关键指标 -->
      <div class="profile-grid">
        <div class="profile-item">
          <span class="lbl">营收环比</span
          ><span
            class="val num-mono"
            :class="changeClass(data.profile.yoyRevenue)"
            >{{ data.profile.yoyRevenue.toFixed(2) }}%</span
          >
        </div>
        <div class="profile-item">
          <span class="lbl">归母净利润</span
          ><span class="val num-mono">{{
            fmtAmt(data.profile.netProfit)
          }}</span>
        </div>
        <div class="profile-item">
          <span class="lbl">净利润环比</span
          ><span
            class="val num-mono"
            :class="changeClass(data.profile.yoyProfit)"
            >{{ data.profile.yoyProfit.toFixed(2) }}%</span
          >
        </div>
        <div class="profile-item">
          <span class="lbl">ROE</span
          ><span class="val num-mono">{{ data.profile.roe }}%</span>
        </div>
        <div class="profile-item">
          <span class="lbl">毛利率</span
          ><span class="val num-mono">{{ data.profile.grossMargin }}%</span>
        </div>
        <div class="profile-item">
          <span class="lbl">资产负债率</span
          ><span class="val num-mono">{{ data.profile.debtRatio }}%</span>
        </div>
        <div class="profile-item">
          <span class="lbl">总股本</span
          ><span class="val num-mono">{{
            fmtVol(data.profile.totalShares)
          }}</span>
        </div>
        <div class="profile-item">
          <span class="lbl">流通股本</span
          ><span class="val num-mono">{{
            fmtVol(data.profile.floatShares)
          }}</span>
        </div>
      </div>

      <!-- 收入构成 -->
      <h4 class="sub-title">收入构成</h4>
      <div class="revenue-tabs">
        <span
          class="revenue-tab"
          :class="{ active: revenueTab === 'product' }"
          @click="revenueTab = 'product'"
          >按产品</span
        >
        <span
          class="revenue-tab"
          :class="{ active: revenueTab === 'industry' }"
          @click="revenueTab = 'industry'"
          >按行业</span
        >
      </div>
      <div ref="revenueChartRef" class="revenue-chart"></div>

      <!-- 利润趋势 -->
      <h4 class="sub-title">利润趋势</h4>
      <div ref="profitChartRef" class="profit-chart"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted, nextTick } from "vue";
import { useRoute } from "vue-router";
import { NTag } from "naive-ui";
import * as echarts from "echarts";
import { useThemeStore } from "../stores/theme";
import type { RevenueItem } from "../data/stockDetailMock";
import {
  getIndividualStock,
  type DiagnosisScoreItem,
} from "../data/stockDetailMock";

const route = useRoute();
const themeStore = useThemeStore();
const code = computed(() => String(route.params.code ?? ""));
const data = computed(() => getIndividualStock(code.value));

// 涨跌颜色
const priceClass = computed(() =>
  data.value.info.changePercent > 0
    ? "up"
    : data.value.info.changePercent < 0
      ? "down"
      : "flat",
);
const changeStr = computed(() => {
  const c = data.value.info.changePercent;
  const sign = c > 0 ? "+" : "";
  return `${sign}${c.toFixed(2)}%`;
});
function changeClass(v: number) {
  return v > 0 ? "up" : v < 0 ? "down" : "";
}

// 评分颜色
const scoreClass = computed(() => {
  const s = data.value.diagnosis.totalScore;
  return s >= 70 ? "good" : s >= 50 ? "mid" : "bad";
});

// 板块标签类型
const sectorTagType = computed(() => {
  const t = data.value.diagnosis.sectorType;
  return t === "主线" ? "success" : t === "支线" ? "warning" : "default";
});

// 操作建议颜色
const actionClass = computed(() => {
  const a = data.value.diagnosis.action;
  if (a === "买入" || a === "增持") return "action-buy";
  if (a === "卖出" || a === "减持") return "action-sell";
  return "action-neutral";
});

// 五维评分列表
const scoreItems = computed<DiagnosisScoreItem[]>(() => {
  const d = data.value.diagnosis;
  return [d.fundamentals, d.technicals, d.capitalFlow, d.news, d.industryView];
});

// 利润趋势 ECharts
const profitChartRef = ref<HTMLElement | null>(null);
let profitChart: echarts.ECharts | null = null;

function buildProfitChartOption() {
  const trend = data.value.profile.profitTrend;
  const isDark = themeStore.isDark;
  return {
    tooltip: {
      trigger: "axis",
      formatter: (params: any) => {
        const p = params[0];
        const g = trend[p.dataIndex].growth;
        const sign = g >= 0 ? "+" : "";
        return `${p.name}<br/>净利润: ${fmtAmt(p.value)}<br/>环比: ${sign}${g.toFixed(2)}%`;
      },
    },
    grid: { left: 50, right: 16, top: 16, bottom: 30 },
    xAxis: {
      type: "category",
      data: trend.map((t) => t.period),
      axisLine: {
        lineStyle: {
          color: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
        },
      },
      axisLabel: { color: isDark ? "#636d83" : "#9ca3af", fontSize: 11 },
    },
    yAxis: {
      type: "value",
      axisLabel: {
        color: isDark ? "#636d83" : "#9ca3af",
        fontSize: 11,
        formatter: (v: number) => fmtAmt(v),
      },
      splitLine: {
        lineStyle: {
          color: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
        },
      },
    },
    series: [
      {
        type: "bar",
        data: trend.map((t) => ({
          value: t.profit,
          itemStyle: { color: t.growth >= 0 ? "#ef4444" : "#22c55e" },
        })),
        barMaxWidth: 32,
        barMinWidth: 12,
      },
    ],
  };
}

function initProfitChart() {
  if (!profitChartRef.value) return;
  if (profitChart) profitChart.dispose();
  profitChart = echarts.init(profitChartRef.value);
  profitChart.setOption(buildProfitChartOption());
}

// 收入构成饼图
const revenueTab = ref<"product" | "industry">("product");
const revenueChartRef = ref<HTMLElement | null>(null);
let revenueChart: echarts.ECharts | null = null;

function buildRevenuePieOption(): echarts.EChartsOption {
  const items: RevenueItem[] =
    revenueTab.value === "product"
      ? data.value.profile.revenueBreakdown
      : data.value.profile.industryBreakdown;
  const isDark = themeStore.isDark;
  return {
    tooltip: { trigger: "item", formatter: "{b}: {d}%" },
    legend: {
      bottom: 0,
      textStyle: { color: isDark ? "#9198a3" : "#4b5563", fontSize: 11 },
    },
    series: [
      {
        type: "pie",
        radius: ["40%", "70%"],
        center: ["50%", "45%"],
        avoidLabelOverlap: true,
        label: {
          color: isDark ? "#9198a3" : "#4b5563",
          fontSize: 11,
          formatter: "{b}\n{d}%",
        },
        data: items.map((r) => ({ name: r.source, value: r.percent })),
      },
    ],
  };
}

function initRevenueChart() {
  if (!revenueChartRef.value) return;
  if (revenueChart) revenueChart.dispose();
  revenueChart = echarts.init(revenueChartRef.value);
  revenueChart.setOption(buildRevenuePieOption());
}

watch(revenueTab, () => {
  revenueChart?.setOption(buildRevenuePieOption());
});

onMounted(() =>
  nextTick(() => {
    initProfitChart();
    initRevenueChart();
  }),
);
onUnmounted(() => {
  profitChart?.dispose();
  profitChart = null;
  revenueChart?.dispose();
  revenueChart = null;
});

// 重新渲染图表当路由或主题变化
watch(
  () => code.value,
  () =>
    nextTick(() => {
      initProfitChart();
      initRevenueChart();
    }),
);
watch(
  () => themeStore.isDark,
  () => {
    profitChart?.setOption(buildProfitChartOption());
    revenueChart?.setOption(buildRevenuePieOption());
  },
);

// 格式化
function fmtVol(v: number): string {
  if (v >= 1e8) return (v / 1e8).toFixed(2) + "亿";
  if (v >= 1e4) return (v / 1e4).toFixed(0) + "万";
  return String(v);
}
function fmtAmt(v: number): string {
  if (v >= 1e12) return (v / 1e12).toFixed(2) + "万亿";
  if (v >= 1e8) return (v / 1e8).toFixed(2) + "亿";
  if (v >= 1e4) return (v / 1e4).toFixed(0) + "万";
  return String(v);
}
</script>

<style scoped>
.stock-info-page {
  max-width: 100%;
  min-width: 0;
  padding: var(--content-padding);
}

/* ── 基本信息头部 ── */
.info-header {
  padding: 20px 22px;
  margin-bottom: 8px;
}
.header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  flex-wrap: wrap;
}
.name-block {
  display: flex;
  flex-direction: column;
  gap: 4px;
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
.price-block {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}
.price {
  font-size: 28px;
  font-weight: 700;
  line-height: 1.1;
}
.change {
  font-size: 15px;
  font-weight: 600;
}
.up {
  color: var(--color-up);
}
.down {
  color: var(--color-down);
}
.flat {
  color: var(--text-primary);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px 16px;
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px solid var(--border-subtle);
}
.info-item {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.lbl {
  font-size: 11px;
  color: var(--text-muted);
  font-weight: 500;
}
.val {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

.intro-block {
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid var(--border-subtle);
}
.intro-text {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.7;
  margin: 0;
}
.highlight-text {
  font-size: 13px;
  color: var(--gold-primary);
  margin-top: 8px;
  font-weight: 500;
}

/* ── 综合诊股 ── */
.diagnosis-card {
  padding: 20px 22px;
  margin-bottom: 8px;
}
.diag-header {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}
.score-circle {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.score-circle.good {
  background: rgba(239, 68, 68, 0.12);
  border: 2px solid var(--color-up);
}
.score-circle.mid {
  background: rgba(212, 168, 67, 0.12);
  border: 2px solid var(--gold-primary);
}
.score-circle.bad {
  background: rgba(34, 197, 94, 0.12);
  border: 2px solid var(--color-down);
}
.score-num {
  font-size: 18px;
  font-weight: 700;
  line-height: 1;
}
.score-lbl {
  font-size: 9px;
  color: var(--text-muted);
  margin-top: 2px;
}
.diag-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  flex-wrap: wrap;
}
.meta-item {
  font-size: 12px;
  color: var(--text-secondary);
}
.meta-item strong {
  color: var(--text-primary);
}
.action-badge {
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 700;
  flex-shrink: 0;
}
.action-buy {
  background: var(--color-up-bg);
  color: var(--color-up);
}
.action-sell {
  background: var(--color-down-bg);
  color: var(--color-down);
}
.action-neutral {
  background: var(--surface-muted);
  color: var(--text-secondary);
}

.price-levels {
  display: flex;
  gap: 24px;
  margin-top: 16px;
  padding: 12px 16px;
  background: var(--surface-muted);
  border-radius: 8px;
}
.level-item {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.level-lbl {
  font-size: 11px;
  color: var(--text-muted);
}
.level-val {
  font-size: 15px;
  font-weight: 600;
}

.trend-row {
  display: flex;
  gap: 16px;
  margin-top: 12px;
  padding: 10px 16px;
  background: var(--surface-muted);
  border-radius: 8px;
}
.trend-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.trend-lbl {
  font-size: 11px;
  color: var(--text-muted);
}
.trend-val {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.score-list {
  margin-top: 16px;
}
.score-item {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}
.score-label {
  font-size: 12px;
  color: var(--text-muted);
  flex-shrink: 0;
  font-weight: 600;
}
.score-val {
  font-size: 16px;
  font-weight: 700;
  color: var(--gold-primary);
  flex-shrink: 0;
}
.score-desc {
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.6;
}

/* ── 公司概要 ── */
.profile-card {
  padding: 20px 22px;
  margin-bottom: 8px;
}
.profile-intro {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.7;
  margin: 0 0 16px;
}
.profile-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px 16px;
  margin-bottom: 20px;
}
.profile-item {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.sub-title {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin: 0 0 12px;
  padding-top: 16px;
  border-top: 1px solid var(--border-subtle);
}

/* 收入构成饼图 */
.revenue-tabs {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
}
.revenue-tab {
  font-size: 12px;
  color: var(--text-muted);
  cursor: pointer;
  padding: 2px 0;
  border-bottom: 2px solid transparent;
  transition:
    color 0.2s,
    border-color 0.2s;
}
.revenue-tab.active {
  color: var(--gold-primary);
  border-bottom-color: var(--gold-primary);
  font-weight: 600;
}
.revenue-chart {
  width: 100%;
  height: 220px;
}

/* 利润趋势 ECharts 容器 */
.profit-chart {
  width: 100%;
  height: 200px;
}

@media (max-width: 768px) {
  .info-grid,
  .profile-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .price-levels,
  .trend-row {
    flex-wrap: wrap;
    gap: 12px;
  }
  .profit-chart {
    height: 140px;
  }
}
</style>
