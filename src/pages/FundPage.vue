<template>
  <div class="fund-page">
    <div class="page-toolbar">
      <n-space align="center" :size="12">
        <n-button size="small" round @click="refreshData" :loading="store.loading">
          <template #icon><span style="font-size:14px">↻</span></template>
          刷新
        </n-button>
        <n-select
          v-model:value="fundType"
          :options="typeOptions"
          size="small"
          style="width: 140px"
          @update:value="onTypeChange"
        />
      </n-space>
      <span class="update-time num-mono" v-if="store.lastUpdate">{{ store.lastUpdate }}</span>
    </div>

    <n-spin :show="store.loading">
      <div class="table-scroll-wrap">
        <n-data-table
          :columns="columns"
          :data="store.data"
          :bordered="false"
          size="small"
          :scroll-x="860"
          :row-class-name="rowClassName"
          :pagination="pagination"
          class="fund-table"
        />
      </div>
    </n-spin>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, h } from "vue";
import { NTag, type DataTableColumns } from "naive-ui";
import { useFundStore } from "../stores/fund";
import type { FundRankItem } from "../types";

const store = useFundStore();
const fundType = ref("all");

const typeOptions = [
  { label: "全部", value: "all" },
  { label: "股票型", value: "gp" },
  { label: "混合型", value: "hh" },
  { label: "债券型", value: "zq" },
  { label: "指数型", value: "zs" },
  { label: "QDII", value: "qdii" },
];

const pagination = { pageSize: 15 };

const columns: DataTableColumns<FundRankItem> = [
  {
    title: "排名",
    key: "rank",
    width: 56,
    align: "center",
    render(row) {
      const isTop3 = row.rank <= 3;
      return h("span", {
        class: "num-mono",
        style: {
          color: isTop3 ? "var(--gold-primary)" : "var(--text-muted)",
          fontWeight: isTop3 ? "700" : "400",
          fontSize: isTop3 ? "15px" : "13px",
        },
      }, row.rank);
    },
  },
  {
    title: "代码",
    key: "code",
    width: 82,
    render(row) {
      return h("span", { class: "num-mono", style: { color: "rgba(212,168,67,0.7)", fontSize: "12px" } }, row.code);
    },
  },
  {
    title: "基金名称",
    key: "name",
    ellipsis: { tooltip: true },
    render(row) {
      return h("span", { style: { color: "var(--text-primary)", fontWeight: "500", fontSize: "13px" } }, row.name);
    },
  },
  {
    title: "类型",
    key: "type",
    width: 96,
    render(row) {
      return h(NTag, { size: "tiny", bordered: false, type: getTypeColor(row.type), round: true }, { default: () => row.type });
    },
  },
  {
    title: "净值",
    key: "nav",
    width: 82,
    align: "right",
    render(row) {
      return h("span", { class: "num-mono", style: { color: "var(--text-secondary)", fontSize: "13px" } }, row.nav.toFixed(4));
    },
  },
  {
    title: "日涨跌",
    key: "dayChange",
    width: 78,
    align: "right",
    render(row) { return changeCell(row.dayChange); },
  },
  {
    title: "近一周",
    key: "weekChange",
    width: 78,
    align: "right",
    render(row) { return changeCell(row.weekChange); },
  },
  {
    title: "近一月",
    key: "monthChange",
    width: 78,
    align: "right",
    render(row) { return changeCell(row.monthChange); },
  },
  {
    title: "近三月",
    key: "threeMonthChange",
    width: 78,
    align: "right",
    render(row) { return changeCell(row.threeMonthChange); },
  },
  {
    title: "近一年",
    key: "yearChange",
    width: 78,
    align: "right",
    render(row) { return changeCell(row.yearChange); },
  },
];

function changeCell(val: number) {
  const sign = val > 0 ? "+" : "";
  const color = val > 0 ? "var(--color-up)" : val < 0 ? "var(--color-down)" : "var(--color-flat)";
  const bg = val > 0 ? "var(--color-up-bg)" : val < 0 ? "var(--color-down-bg)" : "transparent";
  return h("span", {
    class: "num-mono",
    style: {
      color,
      background: bg,
      padding: "2px 8px",
      borderRadius: "5px",
      fontSize: "12px",
      fontWeight: "600",
      display: "inline-block",
    },
  }, `${sign}${val.toFixed(2)}%`);
}

function getTypeColor(type: string): "error" | "warning" | "success" | "info" | "default" {
  if (type.includes("股票")) return "error";
  if (type.includes("混合")) return "warning";
  if (type.includes("债券")) return "success";
  if (type.includes("指数")) return "info";
  return "default";
}

function rowClassName(): string { return "fund-row"; }
function refreshData(): void { store.loadData(); }
function onTypeChange(): void { refreshData(); }

onMounted(() => { refreshData(); });
</script>

<style scoped>
.fund-page {
  max-width: 1400px;
  width: 100%;
  min-width: 0;
}

.fund-table {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-subtle);
  box-shadow: var(--shadow-card);
  overflow: hidden;
}

:deep(.fund-row td) {
  background: transparent !important;
}

:deep(.n-data-table .n-data-table-th) {
  background: var(--surface-muted) !important;
  color: var(--text-muted) !important;
  font-weight: 600;
  font-size: 11px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  border-bottom: 1px solid var(--border-subtle) !important;
}

:deep(.n-data-table .n-data-table-td) {
  border-bottom: 1px solid var(--border-subtle) !important;
  padding: 12px 14px !important;
}

:deep(.n-data-table .n-data-table-tr:hover td) {
  background: var(--surface-muted) !important;
}

:deep(.n-pagination) {
  margin-top: 14px;
}

:deep(.n-pagination .n-pagination-item) {
  background: var(--bg-card);
  border-radius: 8px;
  border: 1px solid var(--border-subtle);
}

:deep(.n-pagination .n-pagination-item--active) {
  background: rgba(212,168,67,0.12);
  border-color: var(--gold-primary);
}
</style>