/**
 * OpenQmt 行情数据 API 模块
 * 黄金/股票行情：使用 Yun API 获取实时数据
 * 基金排行：使用天天基金条件选基 API
 */

import yunApi from '../api/yun'
import type {
    QuoteData,
    SymbolConfig,
    GoldKey,
    StockKey,
    GoldDataMap,
    StockDataMap,
    FundRankItem,
    GoldApiResponse,
    GoldPriceItem,
    GoldFetchResult,
    StockApiResponse,
    StockPriceItem,
    StockFetchResult,
    PassionItem,
} from '../types'

/** 黄金品种配置 */
export const GOLD_CONFIG: Record<GoldKey, SymbolConfig> = {
    shj: {
        name: '沪金',
        unit: '元/克',
        icon: '🪙',
        decimals: 2,
    },
    jdj: {
        name: '积存金',
        unit: '元/克',
        icon: '🏦',
        decimals: 2,
    },
    llj: {
        name: '伦敦金',
        icon: '🌍',
        decimals: 2,
    },
    lly: {
        name: '伦敦银',
        icon: '🌐',
        decimals: 3,
    },
}

/** 股票指数配置 */
export const STOCK_CONFIG: Record<StockKey, SymbolConfig> = {
    sh: {
        name: '上证指数',
        icon: '📊',
        decimals: 2,
    },
    cy: {
        name: '创业板指',
        icon: '🚀',
        decimals: 2,
    },
    hk: {
        name: '恒生指数',
        icon: '🌃',
        decimals: 2,
    },
    us: {
        name: '纳斯达克',
        icon: '💻',
        decimals: 2,
    },
}

// ============ 模拟数据 ============

const MOCK_GOLD: GoldDataMap = {
    shj: {
        name: '沪金',
        current: 940.0,
        open: 941.0,
        high: 945.8,
        low: 937.0,
        change: 0.2,
        changePercent: 0.02,
        volume: 0,
        amount: 0,
    },
    jdj: {
        name: '积存金',
        current: 939.83,
        open: 940.78,
        high: 942.5,
        low: 938.5,
        change: 0.0,
        changePercent: 0.0,
        volume: 0,
        amount: 0,
    },
    llj: {
        name: '伦敦金',
        current: 4328.31,
        open: 4335.07,
        high: 4349.41,
        low: 4317.41,
        change: -6.77,
        changePercent: -0.16,
        volume: 0,
        amount: 0,
    },
    lly: {
        name: '伦敦银',
        current: 70.276,
        open: 70.026,
        high: 70.49,
        low: 69.72,
        change: 0.247,
        changePercent: 0.35,
        volume: 0,
        amount: 0,
    },
}

const MOCK_STOCK: StockDataMap = {
    sh: {
        name: '上证指数',
        current: 4108.08,
        open: 4074.29,
        high: 4109.96,
        low: 4073.73,
        change: 33.79,
        changePercent: 0.83,
        volume: 608077440,
        amount: 1403146000000,
    },
    cy: {
        name: '创业板指',
        current: 4167.05,
        open: 4061.3,
        high: 4168.16,
        low: 4058.61,
        change: 105.75,
        changePercent: 2.6,
        volume: 228496370,
        amount: 821543500000,
    },
    hk: {
        name: '恒生指数',
        current: 24300.38,
        open: 24495.85,
        high: 24560.19,
        low: 24254.07,
        change: -195.47,
        changePercent: -0.8,
        volume: 11808846000,
        amount: 237101040000,
    },
    us: {
        name: '纳斯达克',
        current: 26376.34,
        open: 26649.97,
        high: 26788.62,
        low: 26369.39,
        change: -273.63,
        changePercent: -1.03,
        volume: 10405919700,
        amount: 0,
    },
}


// ============ 工具函数 ============

/** 将 yun API 单项数据转为 QuoteData */
function parseGoldPriceItem(item: GoldPriceItem): QuoteData {
    const price =
        typeof item.price === 'string' ? parseFloat(item.price) : item.price
    const open =
        typeof item.open === 'string' ? parseFloat(item.open) : item.open
    const closeVal =
        typeof item.close === 'string' ? parseFloat(item.close) : item.close
    const high =
        typeof item.high === 'string' ? parseFloat(item.high) : item.high
    const low = typeof item.low === 'string' ? parseFloat(item.low) : item.low
    const change = price - closeVal
    const changePercent = closeVal !== 0 ? (change / closeVal) * 100 : 0
    return {
        name: item.name,
        current: price,
        open,
        high,
        low,
        change,
        changePercent,
        volume: 0,
        amount: 0,
    }
}

/** 将 yun API 股票单项数据转为 QuoteData */
function parseStockPriceItem(item: StockPriceItem): QuoteData {
    const price = item.price
    const open = item.open
    const closeVal = item.close
    const high = item.high
    const low = item.low
    const change = price - closeVal
    const changePercent = closeVal !== 0 ? (change / closeVal) * 100 : 0
    return {
        name: item.name,
        current: price,
        open,
        high,
        low,
        change,
        changePercent,
        volume: item.hands ?? 0,
        amount: item.quota ?? 0,
    }
}

// ============ 对外接口 ============

/** 获取黄金行情数据 */
export async function fetchGoldData(): Promise<GoldFetchResult> {
    try {
        const resp = await yunApi.getLLGold()
        const raw: GoldApiResponse = resp.data

        const results: GoldDataMap = {}
        const keyMap: Record<string, GoldKey> = {
            shjPrice: 'shj',
            jdjPrice: 'jdj',
            lljPrice: 'llj',
            llyPrice: 'lly',
        }

        for (const [apiKey, goldKey] of Object.entries(keyMap)) {
            const item = raw[apiKey as keyof GoldApiResponse]
            if (item && typeof item === 'object' && 'price' in item) {
                results[goldKey] = parseGoldPriceItem(item as GoldPriceItem)
            }
        }

        // 如果完全没有获取到真实数据，使用模拟数据
        if (Object.keys(results).length === 0) {
            return { data: { ...MOCK_GOLD }, isWeekend: false }
        }

        return { data: results, isWeekend: raw.isWeekend ?? false }
    } catch (e) {
        console.warn('获取黄金行情失败:', e)
        return { data: { ...MOCK_GOLD }, isWeekend: false }
    }
}

/** 获取股票指数行情数据 */
export async function fetchStockData(): Promise<StockFetchResult> {
    try {
        const resp = await yunApi.getQuotes()
        const raw: StockApiResponse = resp.data

        const results: StockDataMap = {}
        const keyMap: Record<string, StockKey> = {
            shIndex: 'sh',
            cyIndex: 'cy',
            hkIndex: 'hk',
            usIndex: 'us',
        }

        for (const [apiKey, stockKey] of Object.entries(keyMap)) {
            const item = raw[apiKey as keyof StockApiResponse]
            if (item && typeof item === 'object' && 'price' in item) {
                results[stockKey] = parseStockPriceItem(item as StockPriceItem)
            }
        }

        if (Object.keys(results).length === 0) {
            return { data: { ...MOCK_STOCK }, isWeekend: false }
        }

        return { data: results, isWeekend: raw.isWeekend ?? false }
    } catch (e) {
        console.warn('获取股票行情失败:', e)
        return { data: { ...MOCK_STOCK }, isWeekend: false }
    }
}

/** 获取股票情绪数据 */
export async function fetchStockPassion(): Promise<PassionItem[]> {
    try {
        const resp = await yunApi.getPassion()
        return resp.data as PassionItem[]
    } catch (e) {
        console.warn('获取股票情绪失败:', e)
        return []
    }
}
