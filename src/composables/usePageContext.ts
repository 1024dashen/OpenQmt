import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useGoldStore } from '../stores/gold'
import { useStockStore } from '../stores/stock'
import { useFundStore } from '../stores/fund'
import { useLearnStore } from '../stores/learn'
import type { QuoteData, GoldKey, StockKey, FundRankItem } from '../types'

/** Extract human-readable context from the current page for AI analysis */
export function usePageContext() {
    const route = useRoute()
    const goldStore = useGoldStore()
    const stockStore = useStockStore()
    const fundStore = useFundStore()
    const learnStore = useLearnStore()

    const pageType = computed(() => {
        if (route.path.startsWith('/ai')) return 'ai'
        if (route.path.startsWith('/stock/')) return 'stock-detail'
        if (route.path.startsWith('/fund/')) return 'fund-detail'
        const key = route.path.replace('/', '') || 'gold'
        if (
            [
                'gold',
                'stock',
                'fund',
                'learn',
                'profile',
                'settings',
                'notifications',
                'feature-control',
            ].includes(key)
        ) {
            return key
        }
        return 'unknown'
    })

    const pageTitle = computed(() => {
        const map: Record<string, string> = {
            gold: '黄金行情',
            stock: '股市行情',
            'stock-detail': '大盘详情',
            fund: '基金排行',
            'fund-detail': '基金详情',
            learn: '认知学习',
            ai: 'AI 分析',
            profile: '个人中心',
            settings: '系统设置',
            notifications: '推送通知',
            'feature-control': '功能控制',
        }
        return map[pageType.value] || '页面'
    })

    /** Build a text summary of current page data */
    const pageContextText = computed(() => {
        const type = pageType.value

        if (type === 'gold') {
            return buildGoldContext(goldStore.data, goldStore.isWeekend)
        }
        if (type === 'stock' || type === 'stock-detail') {
            return buildStockContext(
                stockStore.data,
                stockStore.passion,
                stockStore.isWeekend,
            )
        }
        if (type === 'fund' || type === 'fund-detail') {
            return buildFundContext(fundStore.data)
        }
        if (type === 'learn') {
            return `当前页面：认知学习，分类：${learnStore.category === 'all' ? '全部知识' : learnStore.category === 'basic' ? '基础概念' : '投资策略'}`
        }
        if (type === 'ai') {
            return '当前页面：AI 分析对话'
        }
        return `当前页面：${pageTitle.value}`
    })

    return {
        pageType,
        pageTitle,
        pageContextText,
    }
}

function buildGoldContext(
    data: Record<string, QuoteData | undefined>,
    isWeekend: boolean,
): string {
    if (isWeekend) return '当前页面：黄金行情（周末休市，暂无实时数据）'
    const keys: GoldKey[] = ['shj', 'jdj', 'llj', 'lly']
    const nameMap: Record<GoldKey, string> = {
        shj: '上海金',
        jdj: '建行金',
        llj: '伦敦金(美元)',
        lly: '伦敦银(美元)',
    }
    const lines: string[] = ['当前页面：黄金行情']
    for (const key of keys) {
        const item = data[key]
        if (item) {
            const changeDir = item.changePercent >= 0 ? '涨' : '跌'
            lines.push(
                `- ${nameMap[key]}：${item.current} ${changeDir} ${item.changePercent >= 0 ? '+' : ''}${item.changePercent.toFixed(2)}%（${item.change >= 0 ? '+' : ''}${item.change}）开盘${item.open}，最高${item.high}，最低${item.low}`,
            )
        }
    }
    return lines.join('\n')
}

function buildStockContext(
    data: Record<string, QuoteData | undefined>,
    passion: Array<{
        temp: string
        temp_intro: string
        valuation: string
        sentiment: string
        market: string
        updated_at: string
    }>,
    isWeekend: boolean,
): string {
    if (isWeekend) return '当前页面：股市行情（周末休市，暂无实时数据）'
    const keys: StockKey[] = ['sh', 'cy', 'hk', 'us']
    const nameMap: Record<StockKey, string> = {
        sh: '上证指数',
        cy: '创业板指',
        hk: '恒生指数',
        us: '纳斯达克',
    }
    const lines: string[] = ['当前页面：股市行情']
    for (const key of keys) {
        const item = data[key]
        if (item) {
            const changeDir = item.changePercent >= 0 ? '涨' : '跌'
            lines.push(
                `- ${nameMap[key]}：${item.current} ${changeDir} ${item.changePercent >= 0 ? '+' : ''}${item.changePercent.toFixed(2)}%（${item.change >= 0 ? '+' : ''}${item.change}）开盘${item.open}，最高${item.high}，最低${item.low}`,
            )
        }
    }
    if (passion.length > 0) {
        lines.push('\n市场情绪：')
        for (const p of passion) {
            lines.push(
                `- 温度${p.temp}（${p.temp_intro}），估值${p.valuation}，情绪${p.sentiment}，市场${p.market}（更新于${p.updated_at}）`,
            )
        }
    }
    return lines.join('\n')
}

function buildFundContext(data: FundRankItem[]): string {
    const lines: string[] = ['当前页面：基金排行']
    const top = data.slice(0, 10)
    if (top.length === 0) {
        lines.push('暂无基金数据')
    } else {
        lines.push(`共${data.length}只基金，前10名：`)
        for (const item of top) {
            lines.push(
                `- 第${item.rank}名：${item.name}（${item.code}），日涨幅${item.dayChange >= 0 ? '+' : ''}${item.dayChange.toFixed(2)}%，周涨幅${item.weekChange >= 0 ? '+' : ''}${item.weekChange.toFixed(2)}%，月涨幅${item.monthChange >= 0 ? '+' : ''}${item.monthChange.toFixed(2)}%`,
            )
        }
    }
    return lines.join('\n')
}
