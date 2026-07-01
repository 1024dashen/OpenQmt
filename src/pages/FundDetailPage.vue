<template>
  <div class="fund-detail-page">
    <n-spin :show="store.loading">
      <n-result
        v-if="store.error"
        status="error"
        title="加载失败"
        :description="store.error"
      >
        <template #footer>
          <n-button type="primary" @click="reload">重试</n-button>
        </template>
      </n-result>

      <template v-else-if="detail">
        <div class="detail-header surface-card">
          <div class="header-main">
            <div class="topic-tags">
              <span class="fund-code num-mono"> {{ detail.code }}</span>
              <n-tag
                v-for="item in relatedThemes"
                :key="item.name"
                size="medium"
                :bordered="false"
                type="warning"
                round
              >
                {{ item.name }}
              </n-tag>
              <n-tag
                v-for="item in detail.topics"
                :key="item.topic"
                size="medium"
                :bordered="false"
                type="info"
                round
              >
                {{ item.topic }}({{ item.weight.toFixed(2) }}%)
              </n-tag>
              <n-tag
                v-for="item in sectors"
                :key="item.name"
                size="medium"
                :bordered="false"
                type="success"
                round
              >
                {{ item.name }}({{ item.weight.toFixed(2) }}%)
              </n-tag>
            </div>
            <!-- <h2 v-else class="fund-name">{{ fundName }}</h2> -->
          </div>
          <p v-if="detail.aiSummary" class="ai-summary">
            {{ detail.aiSummary }}
            <span class="report-date num-mono">
              报告期 {{ detail.reportDate }}
            </span>
          </p>
        </div>

        <div v-if="detail.assetAllocation" class="asset-overview">
          <div
            v-for="item in assetItems"
            :key="item.label"
            class="asset-item surface-card"
          >
            <span class="asset-label">{{ item.label }}</span>
            <span class="asset-value num-mono">{{ item.value }}</span>
          </div>
        </div>

        <h3 class="section-title">重仓股票</h3>
        <div class="surface-card table-card">
          <n-data-table
            :columns="holdingColumns"
            :data="detail.holdings"
            :bordered="false"
            size="small"
            :pagination="false"
          />
        </div>

        <h3 class="section-title">规模变化</h3>
        <div class="surface-card table-card">
          <n-data-table
            v-if="detail.scales.length"
            :columns="scaleColumns"
            :data="detail.scales"
            :bordered="false"
            size="small"
            :pagination="false"
          />
          <n-empty v-else description="暂无规模数据" />
        </div>

        <h3 v-if="detail.bonuses.length" class="section-title">分红记录</h3>
        <div v-if="detail.bonuses.length" class="surface-card table-card">
          <n-data-table
            :columns="bonusColumns"
            :data="detail.bonuses"
            :bordered="false"
            size="small"
            :pagination="false"
          />
        </div>

        <!-- 基金档案 -->
        <template v-if="detail.profile">
          <h3 class="section-title">基金档案</h3>
          <div class="surface-card profile-card">
            <div class="profile-section">
              <h4 class="profile-sub-title">基本信息</h4>
              <div class="profile-grid">
                <div class="profile-item">
                  <span class="profile-label">基金全称</span>
                  <span class="profile-value">{{
                    detail.profile.fullName || detail.profile.shortName
                  }}</span>
                </div>
                <div class="profile-item">
                  <span class="profile-label">基金类型</span>
                  <span class="profile-value">{{
                    detail.profile.fundType
                  }}</span>
                </div>
                <div v-if="detail.profile.industryType" class="profile-item">
                  <span class="profile-label">主题行业</span>
                  <span class="profile-value">{{
                    detail.profile.industryType
                  }}</span>
                </div>
                <div class="profile-item">
                  <span class="profile-label">风险等级</span>
                  <span class="profile-value">{{
                    riskLevelLabel(detail.profile.riskLevel)
                  }}</span>
                </div>
                <div class="profile-item">
                  <span class="profile-label">基金公司</span>
                  <span class="profile-value">{{
                    detail.profile.companyName
                  }}</span>
                </div>
                <div class="profile-item">
                  <span class="profile-label">成立日期</span>
                  <span class="profile-value num-mono">{{
                    detail.profile.estabDate
                  }}</span>
                </div>
                <div class="profile-item">
                  <span class="profile-label">净值日期</span>
                  <span class="profile-value num-mono">{{
                    detail.profile.navDate
                  }}</span>
                </div>
                <div class="profile-item">
                  <span class="profile-label">单位净值</span>
                  <span class="profile-value num-mono">{{
                    detail.profile.nav.toFixed(4)
                  }}</span>
                </div>
                <div class="profile-item">
                  <span class="profile-label">累计净值</span>
                  <span class="profile-value num-mono">{{
                    detail.profile.accNav.toFixed(4)
                  }}</span>
                </div>
                <div class="profile-item">
                  <span class="profile-label">日涨跌幅</span>
                  <span
                    class="profile-value num-mono"
                    :style="{
                      color: changeColor(detail.profile.dayChange),
                    }"
                    >{{ formatPct(detail.profile.dayChange) }}</span
                  >
                </div>
                <div class="profile-item">
                  <span class="profile-label">基金规模</span>
                  <span class="profile-value num-mono"
                    >{{ formatNav(detail.profile.totalNav) }} 元</span
                  >
                </div>
                <div class="profile-item">
                  <span class="profile-label">申购状态</span>
                  <span class="profile-value">{{ detail.profile.sgzt }}</span>
                </div>
                <div class="profile-item">
                  <span class="profile-label">起购金额</span>
                  <span class="profile-value num-mono"
                    >{{ detail.profile.minRg }} 元</span
                  >
                </div>
                <div class="profile-item">
                  <span class="profile-label">申购费率</span>
                  <span class="profile-value num-mono">{{
                    detail.profile.purchaseRate
                  }}</span>
                </div>
                <div
                  v-if="detail.profile.benchmark"
                  class="profile-item profile-item-full"
                >
                  <span class="profile-label">业绩基准</span>
                  <span class="profile-value">{{
                    detail.profile.benchmark
                  }}</span>
                </div>
              </div>
            </div>

            <div v-if="detail.profile.periods.length" class="profile-section">
              <h4 class="profile-sub-title">阶段涨幅</h4>
              <n-data-table
                :columns="periodColumns"
                :data="detail.profile.periods"
                :bordered="false"
                size="small"
                :pagination="false"
              />
            </div>

            <div v-if="detail.profile.managers.length" class="profile-section">
              <h4 class="profile-sub-title">现任基金经理</h4>
              <div
                v-for="mgr in detail.profile.managers"
                :key="mgr.mgrid"
                class="manager-card"
              >
                <div class="manager-header">
                  <div class="manager-info">
                    <span class="manager-name">{{ mgr.name }}</span>
                    <div class="manager-stats">
                      <span class="stat-item">
                        <span class="stat-label">在任天数</span>
                        <span class="stat-value num-mono"
                          >{{ mgr.days }} 天</span
                        >
                      </span>
                      <span class="stat-item">
                        <span class="stat-label">任职回报</span>
                        <span
                          class="stat-value num-mono"
                          :style="{
                            color: changeColor(mgr.penavGrowth),
                          }"
                          >{{ formatPct(mgr.penavGrowth) }}</span
                        >
                      </span>
                      <span v-if="mgr.maxRetra" class="stat-item">
                        <span class="stat-label">最大回撤</span>
                        <span class="stat-value num-mono color-down"
                          >{{ (mgr.maxRetra * 100).toFixed(2) }}%</span
                        >
                      </span>
                    </div>
                  </div>
                </div>
                <p v-if="mgr.investmentIdea" class="manager-idea">
                  {{ mgr.investmentIdea }}
                </p>
              </div>
            </div>

            <div v-if="detail.profile.holderStructure" class="profile-section">
              <h4 class="profile-sub-title">
                持有人结构（{{ detail.profile.holderStructure.fsrq }}）
              </h4>
              <div class="profile-grid">
                <div class="profile-item">
                  <span class="profile-label">个人投资者</span
                  ><span class="profile-value num-mono"
                    >{{ detail.profile.holderStructure.grbl }}%</span
                  >
                </div>
                <div class="profile-item">
                  <span class="profile-label">机构投资者</span
                  ><span class="profile-value num-mono"
                    >{{ detail.profile.holderStructure.jgbl || "--" }}%</span
                  >
                </div>
                <div class="profile-item">
                  <span class="profile-label">内部持有</span
                  ><span class="profile-value num-mono"
                    >{{ detail.profile.holderStructure.nbbl }}%</span
                  >
                </div>
                <div class="profile-item">
                  <span class="profile-label">员工持有（万份）</span
                  ><span class="profile-value num-mono">{{
                    detail.profile.holderStructure.employehold
                  }}</span>
                </div>
              </div>
            </div>

            <div v-if="detail.profile.riskMetrics" class="profile-section">
              <h4 class="profile-sub-title">风险指标（近1年）</h4>
              <div class="profile-grid">
                <div class="profile-item">
                  <span class="profile-label">年化波动率</span
                  ><span class="profile-value num-mono">{{
                    detail.profile.riskMetrics.stddev1 != null
                      ? detail.profile.riskMetrics.stddev1.toFixed(2) + "%"
                      : "--"
                  }}</span>
                </div>
                <div class="profile-item">
                  <span class="profile-label">夏普比率</span
                  ><span class="profile-value num-mono">{{
                    detail.profile.riskMetrics.sharp1 != null
                      ? detail.profile.riskMetrics.sharp1.toFixed(4)
                      : "--"
                  }}</span>
                </div>
                <div class="profile-item">
                  <span class="profile-label">最大回撤</span
                  ><span class="profile-value num-mono color-down">{{
                    detail.profile.riskMetrics.maxRetra1 != null
                      ? detail.profile.riskMetrics.maxRetra1.toFixed(2) + "%"
                      : "--"
                  }}</span>
                </div>
                <div
                  v-if="detail.profile.riskMetrics.stddev1Rank != null"
                  class="profile-item"
                >
                  <span class="profile-label"> 波动率排名 </span>
                  <span class="profile-value num-mono"
                    >{{ detail.profile.riskMetrics.stddev1Rank }}
                    /
                    {{ detail.profile.riskMetrics.stddev1Fsc }}</span
                  >
                </div>
                <div
                  v-if="detail.profile.riskMetrics.sharp1Rank != null"
                  class="profile-item"
                >
                  <span class="profile-label">夏普排名 </span>
                  <span class="profile-value num-mono">
                    {{ detail.profile.riskMetrics.sharp1Rank }}
                    /
                    {{ detail.profile.riskMetrics.sharp1Fsc }}
                  </span>
                </div>
                <div
                  v-if="detail.profile.riskMetrics.maxRetra1Rank != null"
                  class="profile-item"
                >
                  <span class="profile-label">回撤排名</span
                  ><span class="profile-value num-mono"
                    >{{ detail.profile.riskMetrics.maxRetra1Rank }}
                    /
                    {{ detail.profile.riskMetrics.maxRetra1Fsc }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </template>
      </template>
    </n-spin>
  </div>
</template>

<script setup lang="ts">
import { computed, h, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  NButton,
  NDataTable,
  NEmpty,
  NResult,
  NSpin,
  NTag,
  type DataTableColumns,
} from "naive-ui";
import { useFundDetailStore } from "../stores/fundDetail";
import type {
  FundBonusItem,
  FundPeriodItem,
  FundScaleItem,
  FundStockHolding,
  FundTopicItem,
} from "../api/eastmoney";

const route = useRoute();
const router = useRouter();
const store = useFundDetailStore();

const fundCode = computed(() => String(route.params.code ?? ""));
const detail = computed(() => store.detail);
const relatedThemes = computed(
  () => detail.value?.profile?.relatedThemes ?? [],
);

const assetItems = computed(() => {
  const asset = detail.value?.assetAllocation;
  if (!asset) return [];
  const items = [
    { label: "股票", value: `${asset.stockPct.toFixed(2)}%` },
    { label: "现金", value: `${asset.cashPct.toFixed(2)}%` },
  ];
  if (asset.bondPct > 0) {
    items.push({ label: "债券", value: `${asset.bondPct.toFixed(2)}%` });
  }
  if (asset.otherPct > 0) {
    items.push({ label: "其他", value: `${asset.otherPct.toFixed(2)}%` });
  }
  if (detail.value?.cashManagementPct != null) {
    items.push({
      label: "货币管理",
      value: `${detail.value.cashManagementPct.toFixed(2)}%`,
    });
  }
  return items;
});

const holdingColumns: DataTableColumns<FundStockHolding> = [
  {
    title: "股票",
    key: "name",
    ellipsis: { tooltip: true },
    render(row) {
      return h(
        "span",
        {
          style: "cursor:pointer;color:var(--gold-primary);font-weight:600",
          onClick: () =>
            router.push({
              name: "StockInfo",
              params: { code: row.code },
            }),
        },
        row.name,
      );
    },
  },
  {
    title: "代码",
    key: "code",
    width: 88,
    align: "center",
    render(row) {
      return h(
        "span",
        {
          class: "num-mono",
          style: "cursor:pointer;color:var(--gold-primary)",
          onClick: () =>
            router.push({
              name: "StockInfo",
              params: { code: row.code },
            }),
        },
        row.code,
      );
    },
  },
  {
    title: "现价",
    key: "price",
    width: 80,
    align: "center",
    render(row) {
      if (row.price == null) return h("span", { class: "num-mono" }, "--");
      return h("span", { class: "num-mono" }, row.price.toFixed(2));
    },
  },
  {
    title: "涨跌幅",
    key: "changePercent",
    width: 88,
    align: "center",
    render(row) {
      return changeCell(row.changePercent);
    },
  },
  {
    title: "行业",
    key: "industry",
    width: 110,
    align: "center",
    ellipsis: { tooltip: true },
  },
  {
    title: "占净值",
    key: "weight",
    width: 88,
    align: "center",
    render(row) {
      return h("span", { class: "num-mono" }, `${row.weight.toFixed(2)}%`);
    },
  },
  {
    title: "变动",
    key: "changeType",
    width: 72,
    align: "center",
    render(row) {
      const type =
        row.changeType === "新增"
          ? "success"
          : row.changeType === "减持"
            ? "warning"
            : "info";
      return h(
        NTag,
        { size: "tiny", bordered: false, type, round: true },
        { default: () => row.changeType },
      );
    },
  },
  {
    title: "季度",
    key: "holdQuarters",
    width: 64,
    align: "center",
    render(row) {
      return h("span", { class: "num-mono" }, String(row.holdQuarters));
    },
  },
];

const sectors = computed(
  () => detail.value?.sectors.filter((s) => s.weight > 0) ?? [],
);

const topicColumns: DataTableColumns<FundTopicItem> = [
  { title: "主题", key: "topic" },
  {
    title: "占比",
    key: "weight",
    width: 96,
    align: "right",
    render(row) {
      return h("span", { class: "num-mono" }, `${row.weight.toFixed(2)}%`);
    },
  },
];

const scaleColumns: DataTableColumns<FundScaleItem> = [
  {
    title: "报告期",
    key: "reportDate",
    width: 120,
    render(row) {
      return h("span", { class: "num-mono" }, row.reportDate);
    },
  },
  {
    title: "净资产（元）",
    key: "netNav",
    align: "right",
    render(row) {
      return h("span", { class: "num-mono" }, formatNav(row.netNav));
    },
  },
  {
    title: "环比变化",
    key: "changePct",
    width: 150,
    align: "right",
    render(row) {
      return changeCell(row.changePct);
    },
  },
];

const bonusColumns: DataTableColumns<FundBonusItem> = [
  { title: "权益登记日", key: "exDate", width: 120 },
  { title: "发放日", key: "payDate", width: 120 },
  {
    title: "每份分红（元）",
    key: "amount",
    align: "right",
    render(row) {
      return h("span", { class: "num-mono" }, row.amount);
    },
  },
];

function formatNav(val: number): string {
  if (!val) return "--";
  return val.toLocaleString("zh-CN", { maximumFractionDigits: 2 });
}

function formatPct(val: number): string {
  const sign = val > 0 ? "+" : "";
  return `${sign}${val.toFixed(2)}%`;
}

function changeColor(val: number): string {
  return val > 0
    ? "var(--color-up)"
    : val < 0
      ? "var(--color-down)"
      : "var(--color-flat)";
}

const RISK_LEVEL_MAP: Record<string, string> = {
  "1": "R1 低风险",
  "2": "R2 中低风险",
  "3": "R3 中风险",
  "4": "R4 中高风险",
  "5": "R5 高风险",
};
function riskLevelLabel(level: string): string {
  return RISK_LEVEL_MAP[level] ?? `R${level}`;
}

const PERIOD_TITLE_MAP: Record<string, string> = {
  Z: "近一周",
  Y: "近一个月",
  "3Y": "近3个月",
  "6Y": "近6个月",
  "1N": "近1年",
  "2N": "近两年",
  "3N": "近3年",
  "5N": "近5年",
  JN: "今年来",
  LN: "成立来",
};

const periodColumns: DataTableColumns<FundPeriodItem> = [
  {
    title: "期间",
    key: "title",
    width: 80,
    render(row) {
      return h("span", {}, PERIOD_TITLE_MAP[row.title] ?? row.title);
    },
  },
  {
    title: "本基金",
    key: "syl",
    align: "right",
    render(row) {
      if (!row.syl) return h("span", { class: "num-mono" }, "--");
      const val = parseFloat(row.syl);
      return h(
        "span",
        {
          class: "num-mono",
          style: { color: changeColor(val), fontWeight: "600" },
        },
        `${val > 0 ? "+" : ""}${val.toFixed(2)}%`,
      );
    },
  },
  {
    title: "同类均值",
    key: "avg",
    align: "right",
    render(row) {
      if (!row.avg) return h("span", { class: "num-mono" }, "--");
      const val = parseFloat(row.avg);
      return h(
        "span",
        { class: "num-mono", style: { color: changeColor(val) } },
        `${val > 0 ? "+" : ""}${val.toFixed(2)}%`,
      );
    },
  },
  {
    title: "沪深300",
    key: "hs300",
    align: "right",
    render(row) {
      if (!row.hs300) return h("span", { class: "num-mono" }, "--");
      const val = parseFloat(row.hs300);
      return h(
        "span",
        { class: "num-mono", style: { color: changeColor(val) } },
        `${val > 0 ? "+" : ""}${val.toFixed(2)}%`,
      );
    },
  },
  {
    title: "同类排名",
    key: "rank",
    align: "right",
    width: 80,
    render(row) {
      return h("span", { class: "num-mono" }, row.rank || "--");
    },
  },
];

function changeCell(val: number | null) {
  if (val == null) return h("span", { class: "num-mono" }, "--");
  const sign = val > 0 ? "+" : "";
  const color =
    val > 0
      ? "var(--color-up)"
      : val < 0
        ? "var(--color-down)"
        : "var(--color-flat)";
  return h(
    "span",
    {
      class: "num-mono",
      style: { color, fontWeight: "600" },
    },
    `${sign}${val.toFixed(2)}%`,
  );
}

function reload(): void {
  store.loadDetail(fundCode.value);
}

watch(
  fundCode,
  (code) => {
    if (code) store.loadDetail(code);
  },
  { immediate: true },
);
</script>

<style scoped>
.fund-detail-page {
  max-width: 100%;
  min-width: 0;
  padding: var(--content-padding);
}

.detail-header {
  padding: 20px 22px;
  margin-bottom: 16px;
}

.header-main {
  display: flex;
  align-items: baseline;
  gap: 12px;
  flex-wrap: wrap;
}

.fund-code {
  color: rgba(212, 168, 67, 0.8);
  font-size: 14px;
  font-weight: 600;
}

.topic-tags {
  display: flex;
  align-items: baseline;
  gap: 8px;
  flex-wrap: wrap;
}

.fund-name {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
}

.header-meta {
  margin-top: 10px;
}

.report-date {
  color: var(--text-muted);
  font-size: 13px;
}

.ai-summary {
  margin: 14px 0 0;
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.7;
}

.asset-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
  margin-bottom: 8px;
}

.asset-item {
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.asset-label {
  color: var(--text-muted);
  font-size: 12px;
}

.asset-value {
  color: var(--text-primary);
  font-size: 18px;
  font-weight: 700;
}

.table-card {
  /* padding: 4px 0; */
  margin-bottom: 8px;
  overflow: hidden;
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
/* 基金档案 */
.profile-card {
  padding: 0;
  overflow: hidden;
  margin-bottom: 8px;
}

.profile-section {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-subtle);
}

.profile-section:last-child {
  border-bottom: none;
}

.profile-sub-title {
  margin: 0 0 12px;
  font-size: 13px;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.profile-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 10px 16px;
}

.profile-item {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.profile-item-full {
  grid-column: 1 / -1;
}

.profile-label {
  font-size: 11px;
  color: var(--text-muted);
}

.profile-value {
  font-size: 13px;
  color: var(--text-primary);
  word-break: break-word;
}

.color-down {
  color: var(--color-down);
}

/* 基金经理 */
.manager-card {
  background: var(--surface-muted);
  border-radius: 8px;
  padding: 14px 16px;
  margin-top: 10px;
}

.manager-header {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}
.manager-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.manager-name {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
}

.manager-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-label {
  font-size: 11px;
  color: var(--text-muted);
}

.stat-value {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

.manager-idea {
  margin: 10px 0 0;
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.6;
}
</style>
