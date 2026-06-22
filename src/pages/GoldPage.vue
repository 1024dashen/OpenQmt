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

    <h3 class="section-title">投资逻辑</h3>

    <div class="surface-card logic-card">
      <n-tabs v-model:value="logicTab" type="line" animated size="small">
        <n-tab-pane name="macro" tab="宏观视角" />
        <n-tab-pane name="events" tab="重点事件" />
        <n-tab-pane name="reserves" tab="各国储备" />
        <n-tab-pane name="smartMoney" tab="聪明资金" />
      </n-tabs>

      <!-- 宏观视角 -->
      <template v-if="logicTab === 'macro'">
        <div class="logic-content">
          <div class="logic-section">
            <div class="logic-section-header">
              <span class="section-icon">🤖</span>
              <span class="section-title-text">AI宏观分析</span>
            </div>
            <p class="logic-text">{{ macroReview.analysis }}</p>
          </div>
          <div class="logic-section">
            <div class="logic-section-header">
              <span class="section-icon">📊</span>
              <span class="section-title-text">关键影响因素</span>
            </div>
            <div class="factor-list">
              <div
                class="factor-item"
                v-for="(f, i) in macroReview.factors"
                :key="i"
              >
                <n-tag
                  size="small"
                  :bordered="false"
                  :type="
                    f.direction === 'up'
                      ? 'success'
                      : f.direction === 'down'
                        ? 'error'
                        : 'info'
                  "
                >
                  {{ f.name }}
                </n-tag>
                <span class="factor-desc">{{ f.impact }}</span>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- 重点事件 -->
      <template v-if="logicTab === 'events'">
        <div class="event-list">
          <div class="event-item" v-for="item in goldEvents" :key="item.id">
            <div class="event-title">{{ item.title }}</div>
            <!-- <p class="event-summary">{{ item.summary }}</p> -->
            <div class="event-meta">
              <span class="event-source">{{ item.source }}</span>
              <span class="event-time">{{ item.time }}</span>
            </div>
          </div>
        </div>
      </template>

      <!-- 各国储备 -->
      <template v-if="logicTab === 'reserves'">
        <n-data-table
          :columns="reserveColumns"
          :data="goldReserves"
          :bordered="false"
          size="small"
          :pagination="false"
        />
      </template>

      <!-- 聪明资金 -->
      <template v-if="logicTab === 'smartMoney'">
        <n-data-table
          :columns="etfFlowColumns"
          :data="goldEtfFlows"
          :bordered="false"
          size="small"
          :pagination="false"
        />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, h, ref } from "vue";
import {
  NTabs,
  NTabPane,
  NTag,
  NDataTable,
  type DataTableColumns,
} from "naive-ui";
import { useGoldStore } from "../stores/gold";
import PriceCard from "../components/PriceCard.vue";
import type { GoldKey, SymbolConfig } from "../types";

const store = useGoldStore();
const goldConfig = store.getConfig() as Record<GoldKey, SymbolConfig>;

// ── 投资逻辑 ──
type LogicTab = "macro" | "events" | "reserves" | "smartMoney";
const logicTab = ref<LogicTab>("macro");

interface GoldMacroReview {
  analysis: string;
  factors: {
    name: string;
    impact: string;
    direction: "up" | "down" | "neutral";
  }[];
}

interface GoldEventItem {
  id: number;
  title: string;
  source: string;
  time: string;
  summary: string;
}

interface GoldReserveItem {
  rank: number;
  country: string;
  reserves: number;
  share: number;
  change: number;
}

interface GoldEtfFlowItem {
  date: string;
  fundName: string;
  inflow: number;
  cumulative: number;
}

const macroReview = computed<GoldMacroReview>(() => ({
  analysis:
    "当前黄金价格处于历史高位区间，多重宏观因素共振支撑金价上行。国际局势方面，中东地缘冲突持续升级、俄乌局势未见缓和，避险需求为黄金提供底部支撑。美元指数方面，美联储降息预期反复波动，美元指数在104附近震荡，实际利率下行趋势对黄金构成中长期利好。各国央行方面，中国、俄罗斯、印度等新兴市场央行持续增持黄金储备，去美元化进程加速央行购金需求。市场观察方面，全球黄金ETF持仓近期转为净流入，投机性多头头寸增加，但高位获利了结压力也在累积。综合来看，短期金价可能高位震荡，但中长期在降息周期、央行购金和地缘风险三重驱动下，黄金仍具备配置价值。",
  factors: [
    {
      name: "美联储降息预期",
      impact: "市场预期年内降息1-2次，实际利率下行利好黄金",
      direction: "up",
    },
    {
      name: "地缘政治风险",
      impact: "中东冲突升级、俄乌局势紧张，避险需求持续",
      direction: "up",
    },
    {
      name: "央行购金",
      impact: "中国、印度、俄罗斯等央行持续增持，年购金量创新高",
      direction: "up",
    },
    {
      name: "美元指数",
      impact: "美元指数高位震荡，若跌破103支撑则利好金价突破",
      direction: "neutral",
    },
    {
      name: "通胀数据",
      impact: "美国CPI粘性较强，通胀预期支撑黄金抗通胀需求",
      direction: "up",
    },
    {
      name: "技术面压力",
      impact: "金价接近历史高位，获利盘增多，短期回调风险上升",
      direction: "down",
    },
  ],
}));

const goldEvents = computed<GoldEventItem[]>(() => [
  {
    id: 1,
    title: "中国人民银行连续18个月增持黄金储备",
    source: "中国人民银行",
    time: "2025-06-18",
    summary:
      "央行6月增持黄金约5吨，总储备达2264吨，占外汇储备比例升至5.2%。新兴市场央行购金趋势仍在延续。",
  },
  {
    id: 2,
    title: "美联储6月议息会议维持利率不变，点阵图暗示年内降息1次",
    source: "美联储",
    time: "2025-06-15",
    summary:
      "美联储维持基准利率在5.25%-5.50%区间，鲍威尔表态偏鸽，市场降息预期升温推动金价上行。",
  },
  {
    id: 3,
    title: "世界黄金协会发布2025年一季度需求报告",
    source: "世界黄金协会",
    time: "2025-06-12",
    summary:
      "一季度全球黄金需求同比增长3%，其中央行购金达290吨，ETF转为净流入，金饰需求小幅下滑。",
  },
  {
    id: 4,
    title: "中东局势再升级，油价跳涨带动避险资产走高",
    source: "路透社",
    time: "2025-06-10",
    summary:
      "地缘冲突升级推动油价和黄金同步上涨，金价一度突破2400美元/盎司，避险情绪高涨。",
  },
  {
    id: 5,
    title: "全球最大黄金ETF—SPDR持仓量回升至830吨以上",
    source: "Bloomberg",
    time: "2025-06-08",
    summary:
      "SPDR Gold Trust持仓量连续5个交易日增加，北美和欧洲资金回流黄金ETF，显示机构投资者信心增强。",
  },
  {
    id: 6,
    title: "印度央行宣布将黄金储备占比目标提升至10%",
    source: "印度储备银行",
    time: "2025-06-05",
    summary:
      "印度央行计划在未来3年内大幅增持黄金，当前黄金占外汇储备约8%，目标提升至10%，预计年均购金量超100吨。",
  },
]);

const goldReserves = computed<GoldReserveItem[]>(() => [
  { rank: 1, country: "美国", reserves: 8133.5, share: 70.8, change: 0 },
  { rank: 2, country: "德国", reserves: 3352.6, share: 67.4, change: 0 },
  { rank: 3, country: "意大利", reserves: 2451.8, share: 64.3, change: 0 },
  { rank: 4, country: "法国", reserves: 2436.5, share: 66.1, change: 0 },
  { rank: 5, country: "俄罗斯", reserves: 2332.7, share: 26.1, change: 3.1 },
  { rank: 6, country: "中国", reserves: 2264.3, share: 5.2, change: 5.0 },
  { rank: 7, country: "瑞士", reserves: 1040.0, share: 8.2, change: 0 },
  { rank: 8, country: "日本", reserves: 845.9, share: 5.0, change: 0 },
  { rank: 9, country: "印度", reserves: 822.1, share: 8.1, change: 2.8 },
  { rank: 10, country: "荷兰", reserves: 612.5, share: 55.3, change: 0 },
  { rank: 11, country: "土耳其", reserves: 539.5, share: 28.2, change: 14.5 },
  { rank: 12, country: "波兰", reserves: 396.2, share: 21.3, change: 8.2 },
]);

const goldEtfFlows = computed<GoldEtfFlowItem[]>(() => [
  {
    date: "06-19",
    fundName: "华安黄金ETF(518880)",
    inflow: 12500,
    cumulative: 285600,
  },
  {
    date: "06-19",
    fundName: "博时黄金ETF(159937)",
    inflow: 8200,
    cumulative: 156300,
  },
  {
    date: "06-19",
    fundName: "易方达黄金ETF(159934)",
    inflow: 5800,
    cumulative: 98400,
  },
  {
    date: "06-18",
    fundName: "华安黄金ETF(518880)",
    inflow: 9300,
    cumulative: 273100,
  },
  {
    date: "06-18",
    fundName: "博时黄金ETF(159937)",
    inflow: -2100,
    cumulative: 148100,
  },
  {
    date: "06-18",
    fundName: "易方达黄金ETF(159934)",
    inflow: 3400,
    cumulative: 92600,
  },
  {
    date: "06-17",
    fundName: "华安黄金ETF(518880)",
    inflow: 6700,
    cumulative: 263800,
  },
  {
    date: "06-17",
    fundName: "博时黄金ETF(159937)",
    inflow: 4500,
    cumulative: 150200,
  },
  {
    date: "06-17",
    fundName: "易方达黄金ETF(159934)",
    inflow: -1800,
    cumulative: 89200,
  },
  {
    date: "06-16",
    fundName: "华安黄金ETF(518880)",
    inflow: 11200,
    cumulative: 257100,
  },
  {
    date: "06-16",
    fundName: "博时黄金ETF(159937)",
    inflow: 7800,
    cumulative: 145700,
  },
  {
    date: "06-16",
    fundName: "易方达黄金ETF(159934)",
    inflow: 6100,
    cumulative: 91000,
  },
  {
    date: "06-15",
    fundName: "华安黄金ETF(518880)",
    inflow: 15400,
    cumulative: 245900,
  },
  {
    date: "06-15",
    fundName: "博时黄金ETF(159937)",
    inflow: 9200,
    cumulative: 137900,
  },
  {
    date: "06-15",
    fundName: "易方达黄金ETF(159934)",
    inflow: 8300,
    cumulative: 84900,
  },
]);

const reserveColumns: DataTableColumns<GoldReserveItem> = [
  {
    title: "排名",
    key: "rank",
    width: 56,
    align: "center",
    render(row) {
      return h("span", { class: "num-mono" }, String(row.rank));
    },
  },
  { title: "国家", key: "country", width: 80 },
  {
    title: "储备量(吨)",
    key: "reserves",
    width: 110,
    align: "right",
    render(row) {
      return h("span", { class: "num-mono" }, row.reserves.toFixed(1));
    },
  },
  {
    title: "占储备比",
    key: "share",
    width: 100,
    align: "right",
    render(row) {
      return h("span", { class: "num-mono" }, row.share.toFixed(1) + "%");
    },
  },
  {
    title: "近期变动(吨)",
    key: "change",
    align: "right",
    render(row) {
      if (row.change === 0) return h("span", { class: "num-mono" }, "—");
      const sign = row.change > 0 ? "+" : "";
      const color = row.change > 0 ? "var(--color-up)" : "var(--color-down)";
      return h(
        "span",
        { class: "num-mono", style: { color } },
        `${sign}${row.change.toFixed(1)}`,
      );
    },
  },
];

const etfFlowColumns: DataTableColumns<GoldEtfFlowItem> = [
  {
    title: "日期",
    key: "date",
    width: 80,
    align: "center",
    render(row) {
      return h("span", { class: "num-mono" }, row.date);
    },
  },
  { title: "基金名称", key: "fundName", ellipsis: { tooltip: true } },
  {
    title: "净流入(万元)",
    key: "inflow",
    width: 120,
    align: "right",
    render(row) {
      const sign = row.inflow > 0 ? "+" : "";
      const color = row.inflow > 0 ? "var(--color-up)" : "var(--color-down)";
      return h(
        "span",
        { class: "num-mono", style: { color, fontWeight: "600" } },
        `${sign}${row.inflow.toLocaleString()}`,
      );
    },
  },
  {
    title: "累计净流入(万元)",
    key: "cumulative",
    width: 140,
    align: "right",
    render(row) {
      return h("span", { class: "num-mono" }, row.cumulative.toLocaleString());
    },
  },
];
</script>

<style scoped>
.gold-page {
  max-width: 100%;
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

/* ── 投资逻辑 ── */
.logic-card {
  padding: 8px 0 4px;
  overflow: hidden;
}

.logic-card :deep(.n-tabs-nav) {
  padding: 0 16px;
}

.logic-content {
  padding: 0 20px 16px;
}

.logic-section {
  margin-top: 16px;
}

.logic-section-header {
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

.logic-text {
  margin: 0;
  font-size: 13px;
  line-height: 1.7;
  color: var(--text-secondary);
}

/* factor list */
.factor-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.factor-item {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.factor-desc {
  font-size: 13px;
  line-height: 1.6;
  color: var(--text-secondary);
}

/* event list */
.event-list {
  padding: 0px 20px;
  display: flex;
  flex-direction: column;
}

.event-item {
  padding: 12px 0;
  border-bottom: 1px solid var(--border-subtle);
}

.event-item:last-child {
  border-bottom: none;
}

.event-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  line-height: 1.5;
}

.event-summary {
  margin: 4px 0 0;
  font-size: 13px;
  line-height: 1.6;
  color: var(--text-muted);
}

.event-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
}

.event-source {
  font-size: 11px;
  color: var(--text-muted);
}

.event-time {
  font-size: 11px;
  color: var(--text-muted);
}

/* data table */
.logic-card :deep(.n-data-table .n-data-table-th) {
  background: var(--surface-muted) !important;
  color: var(--text-muted) !important;
  font-weight: 600;
  font-size: 11px;
}

.logic-card :deep(.n-data-table .n-data-table-td) {
  border-bottom: 1px solid var(--border-subtle) !important;
}
</style>
