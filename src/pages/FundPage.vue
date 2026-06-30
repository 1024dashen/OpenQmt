<template>
  <div class="fund-page">
    <n-spin :show="store.loading" class="fund-spin">
      <div class="table-scroll-wrap">
        <n-data-table
          ref="tableRef"
          :columns="columns"
          :data="store.data"
          :bordered="false"
          size="small"
          flex-height
          style="height: 100%"
          :row-class-name="rowClassName"
          :row-props="rowProps"
          :pagination="false"
          class="fund-table"
          @scroll="onTableScroll"
        />
      </div>
      <div
        v-if="store.loadingMore || (!store.hasMore && store.data.length)"
        class="load-more-sentinel"
      >
        <n-spin v-if="store.loadingMore" size="small" />
        <span v-else class="load-more-end">已加载全部</span>
      </div>
    </n-spin>
  </div>
</template>

<script setup lang="ts">
import { computed, h, nextTick, onActivated, onDeactivated, ref } from "vue";
import { useRouter } from "vue-router";
import { NDataTable, NTag, type DataTableColumns } from "naive-ui";
import { useFundStore } from "../stores/fund";
import { useSettingsStore } from "../stores/settings";
import type { FundRankItem } from "../types";

defineOptions({ name: "FundPage" });

const router = useRouter();
const store = useFundStore();
const settingsStore = useSettingsStore();
const tableRef = ref<InstanceType<typeof NDataTable> | null>(null);

/** 滚动位置保持 */
let savedScrollTop = 0;
let scrollEl: HTMLElement | null = null;

onDeactivated(() => {
  if (scrollEl) savedScrollTop = scrollEl.scrollTop;
});

onActivated(() => {
  nextTick(() => {
    if (scrollEl && savedScrollTop > 0) {
      scrollEl.scrollTop = savedScrollTop;
    }
  });
});

/** 当前排序状态：从 orderField 解析出字段前缀和方向 */
const sortInfo = computed(() => {
  const parts = store.orderField.split("_");
  // orderField 格式: '5_1_-1' → prefix='5_1', dir='-1'|'1'
  const dir = parts[parts.length - 1];
  const prefix = parts.slice(0, -1).join("_");
  return { prefix, dir };
});

/** 列字段前缀与 orderField 前缀的映射 */
const SORT_FIELD_MAP: Record<string, string> = {
  dayChange: "5_1",
  weekChange: "5_2",
  monthChange: "5_3",
  threeMonthChange: "5_4",
  sixMonthChange: "5_5",
  thisYearChange: "5_10",
  yearChange: "5_6",
  twoYearChange: "5_7",
  threeYearChange: "5_8",
  incepChange: "5_11",
};

/** 渲染可排序列表头：标题 + 排序箭头 */
function renderSortHeader(title: string, colKey: string) {
  const fieldPrefix = SORT_FIELD_MAP[colKey];
  const active = sortInfo.value.prefix === fieldPrefix;
  const asc = active && sortInfo.value.dir === "-1";
  const desc = active && sortInfo.value.dir === "1";
  return h(
    "span",
    {
      class: "sort-header",
      onClick: (e: Event) => {
        e.stopPropagation();
        store.setSort(fieldPrefix);
      },
    },
    [
      h("span", { class: "sort-header-title" }, title),
      h("span", { class: ["sort-arrows", { active }] }, [
        h("span", { class: ["sort-arrow-up", { active: asc }] }, "▲"),
        h("span", { class: ["sort-arrow-down", { active: desc }] }, "▼"),
      ]),
    ],
  );
}

function onTableScroll(e: Event): void {
  const el = e.target as HTMLElement;
  scrollEl = el;
  const { scrollHeight, scrollTop, clientHeight } = el;
  if (scrollHeight - scrollTop - clientHeight < 200) {
    store.loadMore();
  }
}

function getScrollContainer(): HTMLElement | null {
  const root = tableRef.value?.$el as HTMLElement | undefined;
  return root?.querySelector(".n-scrollbar-container") ?? null;
}

/** 内容未撑满表格时无法触发 scroll，需自动补载 */
function checkAndLoadMore(): void {
  nextTick(() => {
    if (!store.hasMore || store.loading || store.loadingMore) return;
    const el = getScrollContainer();
    if (!el) return;
    if (el.scrollHeight <= el.clientHeight + 100) {
      store.loadMore();
    }
  });
}

// watch(
//     () => [store.data.length, store.loading, store.loadingMore] as const,
//     ([, loading, loadingMore]) => {
//         if (!loading && !loadingMore) checkAndLoadMore()
//     },
// )

const baseColumns: DataTableColumns<FundRankItem> = [
  {
    title: "排名",
    key: "rank",
    width: 30,
    align: "center",
    render(row) {
      const isTop3 = row.rank <= 3;
      return h(
        "span",
        {
          class: "num-mono",
          style: {
            color: isTop3 ? "var(--gold-primary)" : "var(--text-muted)",
            fontWeight: isTop3 ? "700" : "400",
            fontSize: isTop3 ? "15px" : "13px",
          },
        },
        row.rank,
      );
    },
  },
  {
    title: "代码",
    key: "code",
    width: 50,
    align: "center",
    render(row) {
      return h(
        "span",
        {
          class: "num-mono",
          style: {
            color: "rgba(212,168,67)",
            fontWeight: "700",
            fontSize: "12px",
          },
        },
        row.code,
      );
    },
  },
  {
    title: "基金名称",
    key: "name",
    width: 120,
    ellipsis: { tooltip: true },
    render(row) {
      return h(
        "span",
        {
          style: {
            fontWeight: "500",
            fontSize: "13px",
          },
        },
        row.name,
      );
    },
  },
  {
    title: "类型",
    key: "type",
    width: 30,
    align: "center",
    render(row) {
      return h(
        NTag,
        {
          size: "tiny",
          bordered: false,
          type: getTypeColor(row.type),
          round: true,
        },
        { default: () => row.type },
      );
    },
  },
  {
    title: "净值",
    key: "nav",
    width: 80,
    align: "center",
    render(row) {
      const dateStr = row.jzrq
        ? (() => {
            const d = new Date(row.jzrq);
            return `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
          })()
        : "";
      return h(
        "span",
        {
          style: {
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: "4px",
          },
        },
        [
          h(
            "span",
            {
              class: "num-mono",
              style: {
                color: "var(--text-secondary)",
                fontSize: "13px",
              },
            },
            row.nav.toFixed(4),
          ),
          dateStr
            ? h(
                "span",
                {
                  class: "num-mono",
                  style: {
                    color: "var(--text-muted)",
                    fontSize: "10px",
                  },
                },
                dateStr,
              )
            : null,
        ],
      );
    },
  },
  {
    title: () => renderSortHeader("日涨跌", "dayChange"),
    key: "dayChange",
    width: 50,
    align: "center",
    className: "fund-change-col fund-sort-col",
    render(row) {
      return changeCell(row.dayChange);
    },
  },
  {
    title: () => renderSortHeader("近一周", "weekChange"),
    key: "weekChange",
    width: 50,
    align: "center",
    className: "fund-change-col fund-sort-col",
    render(row) {
      return changeCell(row.weekChange);
    },
  },
  {
    title: () => renderSortHeader("近一月", "monthChange"),
    key: "monthChange",
    width: 50,
    align: "center",
    className: "fund-change-col fund-sort-col",
    render(row) {
      return changeCell(row.monthChange);
    },
  },
  {
    title: () => renderSortHeader("近三月", "threeMonthChange"),
    key: "threeMonthChange",
    width: 50,
    align: "center",
    className: "fund-change-col fund-sort-col",
    render(row) {
      return changeCell(row.threeMonthChange);
    },
  },
  {
    title: () => renderSortHeader("近六月", "sixMonthChange"),
    key: "sixMonthChange",
    width: 50,
    align: "center",
    className: "fund-change-col fund-sort-col",
    render(row) {
      return changeCell(row.sixMonthChange);
    },
  },
  {
    title: () => renderSortHeader("今年来", "thisYearChange"),
    key: "thisYearChange",
    width: 50,
    align: "center",
    className: "fund-change-col fund-sort-col",
    render(row) {
      return changeCell(row.thisYearChange);
    },
  },
  {
    title: () => renderSortHeader("近一年", "yearChange"),
    key: "yearChange",
    width: 50,
    align: "center",
    className: "fund-change-col fund-sort-col",
    render(row) {
      return changeCell(row.yearChange);
    },
  },
  {
    title: () => renderSortHeader("近两年", "twoYearChange"),
    key: "twoYearChange",
    width: 50,
    align: "center",
    className: "fund-change-col fund-sort-col",
    render(row) {
      return changeCell(row.twoYearChange);
    },
  },
  {
    title: () => renderSortHeader("近三年", "threeYearChange"),
    key: "threeYearChange",
    width: 50,
    align: "center",
    className: "fund-change-col fund-sort-col",
    render(row) {
      return changeCell(row.threeYearChange);
    },
  },
  {
    title: () => renderSortHeader("成立来", "incepChange"),
    key: "incepChange",
    width: 50,
    align: "center",
    className: "fund-change-col fund-sort-col",
    render(row) {
      return changeCell(row.incepChange);
    },
  },
];

const columns = computed<DataTableColumns<FundRankItem>>(() =>
  baseColumns.filter((col) => {
    const key = (col as { key?: string }).key;
    if (key && key in settingsStore.fundColumns) {
      return settingsStore.fundColumns[key];
    }
    return true;
  }),
);

function changeCell(val: number) {
  const sign = val > 0 ? "+" : "";
  const color =
    val > 0
      ? "var(--color-up)"
      : val < 0
        ? "var(--color-down)"
        : "var(--color-flat)";
  const bg =
    val > 0
      ? "var(--color-up-bg)"
      : val < 0
        ? "var(--color-down-bg)"
        : "transparent";
  return h(
    "span",
    {
      class: "num-mono fund-change-cell",
      style: {
        color,
        background: bg,
        padding: "2px 6px",
        borderRadius: "5px",
        fontSize: "12px",
        fontWeight: "600",
        display: "inline-block",
        whiteSpace: "nowrap",
      },
    },
    `${sign}${val.toFixed(2)}%`,
  );
}

function getTypeColor(
  type: string,
): "error" | "warning" | "success" | "info" | "default" {
  if (type.includes("股票")) return "error";
  if (type.includes("混合")) return "warning";
  if (type.includes("债券")) return "success";
  if (type.includes("指数")) return "info";
  return "default";
}

function rowClassName(): string {
  return "fund-row";
}

function rowProps(row: FundRankItem) {
  return {
    style: "cursor: pointer",
    onClick: () => {
      router.push({
        name: "FundDetail",
        params: { code: row.code },
        query: { name: row.name },
      });
    },
  };
}
</script>

<style scoped>
.fund-page {
  padding: var(--content-padding);
  max-width: 100%;
  width: 100%;
  height: 100%;
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.fund-spin {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.fund-spin :deep(.n-spin-content) {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.table-scroll-wrap {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.fund-table {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-subtle);
  box-shadow: var(--shadow-card);
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

:deep(.fund-change-col) {
  white-space: nowrap;
}

:deep(.fund-change-cell) {
  white-space: nowrap;
}

.load-more-sentinel {
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 8px 0 0;
}

.load-more-end {
  color: var(--text-muted);
  font-size: 12px;
}

/* ── 可排序列表头 ── */
:deep(.fund-sort-col .n-data-table-th__title) {
  width: 100%;
}

:deep(.sort-header) {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  cursor: pointer;
  user-select: none;
}

:deep(.sort-header-title) {
  font-size: 11px;
}

:deep(.sort-arrows) {
  display: inline-flex;
  flex-direction: column;
  line-height: 1;
  gap: 0;
}

:deep(.sort-arrow-up),
:deep(.sort-arrow-down) {
  font-size: 7px;
  line-height: 1;
  color: var(--text-muted);
  opacity: 0.35;
  transition:
    opacity 0.15s,
    color 0.15s;
}

:deep(.sort-arrow-up.active),
:deep(.sort-arrow-down.active) {
  opacity: 1;
  color: var(--gold-primary);
}
</style>
