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
                    :scroll-x="900"
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
                v-if="
                    store.loadingMore || (!store.hasMore && store.data.length)
                "
                class="load-more-sentinel"
            >
                <n-spin v-if="store.loadingMore" size="small" />
                <span v-else class="load-more-end">已加载全部</span>
            </div>
        </n-spin>
    </div>
</template>

<script setup lang="ts">
import { h, nextTick, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { NDataTable, NTag, type DataTableColumns } from 'naive-ui'
import { useFundStore } from '../stores/fund'
import type { FundRankItem } from '../types'

const router = useRouter()
const store = useFundStore()
const tableRef = ref<InstanceType<typeof NDataTable> | null>(null)

function onTableScroll(e: Event): void {
    const el = e.target as HTMLElement
    const { scrollHeight, scrollTop, clientHeight } = el
    if (scrollHeight - scrollTop - clientHeight < 200) {
        store.loadMore()
    }
}

function getScrollContainer(): HTMLElement | null {
    const root = tableRef.value?.$el as HTMLElement | undefined
    return root?.querySelector('.n-scrollbar-container') ?? null
}

/** 内容未撑满表格时无法触发 scroll，需自动补载 */
function checkAndLoadMore(): void {
    nextTick(() => {
        if (!store.hasMore || store.loading || store.loadingMore) return
        const el = getScrollContainer()
        if (!el) return
        if (el.scrollHeight <= el.clientHeight + 100) {
            store.loadMore()
        }
    })
}

watch(
    () => [store.data.length, store.loading, store.loadingMore] as const,
    ([, loading, loadingMore]) => {
        if (!loading && !loadingMore) checkAndLoadMore()
    },
)

const columns: DataTableColumns<FundRankItem> = [
    {
        title: '排名',
        key: 'rank',
        width: 56,
        align: 'center',
        render(row) {
            const isTop3 = row.rank <= 3
            return h(
                'span',
                {
                    class: 'num-mono',
                    style: {
                        color: isTop3
                            ? 'var(--gold-primary)'
                            : 'var(--text-muted)',
                        fontWeight: isTop3 ? '700' : '400',
                        fontSize: isTop3 ? '15px' : '13px',
                    },
                },
                row.rank,
            )
        },
    },
    {
        title: '代码',
        key: 'code',
        width: 82,
        render(row) {
            return h(
                'span',
                {
                    class: 'num-mono',
                    style: { color: 'rgba(212,168,67,0.7)', fontSize: '12px' },
                },
                row.code,
            )
        },
    },
    {
        title: '基金名称',
        key: 'name',
        ellipsis: { tooltip: true },
        render(row) {
            return h(
                'span',
                {
                    style: {
                        fontWeight: '500',
                        fontSize: '13px',
                    },
                },
                row.name,
            )
        },
    },
    {
        title: '类型',
        key: 'type',
        width: 96,
        render(row) {
            return h(
                NTag,
                {
                    size: 'tiny',
                    bordered: false,
                    type: getTypeColor(row.type),
                    round: true,
                },
                { default: () => row.type },
            )
        },
    },
    {
        title: '净值',
        key: 'nav',
        width: 110,
        align: 'right',
        render(row) {
            const dateStr = row.jzrq
                ? (() => {
                      const d = new Date(row.jzrq)
                      return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
                  })()
                : ''
            return h(
                'span',
                {
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        gap: '4px',
                    },
                },
                [
                    h(
                        'span',
                        {
                            class: 'num-mono',
                            style: {
                                color: 'var(--text-secondary)',
                                fontSize: '13px',
                            },
                        },
                        row.nav.toFixed(4),
                    ),
                    dateStr
                        ? h(
                              'span',
                              {
                                  class: 'num-mono',
                                  style: {
                                      color: 'var(--text-muted)',
                                      fontSize: '10px',
                                  },
                              },
                              dateStr,
                          )
                        : null,
                ],
            )
        },
    },
    {
        title: '日涨跌',
        key: 'dayChange',
        width: 84,
        align: 'right',
        className: 'fund-change-col',
        render(row) {
            return changeCell(row.dayChange)
        },
    },
    {
        title: '近一周',
        key: 'weekChange',
        width: 84,
        align: 'right',
        className: 'fund-change-col',
        render(row) {
            return changeCell(row.weekChange)
        },
    },
    {
        title: '近一月',
        key: 'monthChange',
        width: 84,
        align: 'right',
        className: 'fund-change-col',
        render(row) {
            return changeCell(row.monthChange)
        },
    },
    {
        title: '近三月',
        key: 'threeMonthChange',
        width: 84,
        align: 'right',
        className: 'fund-change-col',
        render(row) {
            return changeCell(row.threeMonthChange)
        },
    },
    {
        title: '近一年',
        key: 'yearChange',
        width: 84,
        align: 'right',
        className: 'fund-change-col',
        render(row) {
            return changeCell(row.yearChange)
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
    const bg =
        val > 0
            ? 'var(--color-up-bg)'
            : val < 0
              ? 'var(--color-down-bg)'
              : 'transparent'
    return h(
        'span',
        {
            class: 'num-mono fund-change-cell',
            style: {
                color,
                background: bg,
                padding: '2px 6px',
                borderRadius: '5px',
                fontSize: '12px',
                fontWeight: '600',
                display: 'inline-block',
                whiteSpace: 'nowrap',
            },
        },
        `${sign}${val.toFixed(2)}%`,
    )
}

function getTypeColor(
    type: string,
): 'error' | 'warning' | 'success' | 'info' | 'default' {
    if (type.includes('股票')) return 'error'
    if (type.includes('混合')) return 'warning'
    if (type.includes('债券')) return 'success'
    if (type.includes('指数')) return 'info'
    return 'default'
}

function rowClassName(): string {
    return 'fund-row'
}

function rowProps(row: FundRankItem) {
    return {
        style: 'cursor: pointer',
        onClick: () => {
            router.push({
                name: 'FundDetail',
                params: { code: row.code },
                query: { name: row.name },
            })
        },
    }
}
</script>

<style scoped>
.fund-page {
    height: calc(100vh - var(--header-height) - 2 * var(--content-padding-y));
    max-width: 100%;
    width: 100%;
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
</style>
