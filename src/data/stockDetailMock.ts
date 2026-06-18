import type { StockKey } from '../types'

export type ChartPeriod = 'intraday' | 'daily' | 'monthly'
export type SectorTab = 'hot' | 'industry' | 'concept' | 'main'

export interface IntradayPoint {
    time: string
    price: number
    volume: number
}

export interface KLinePoint {
    time: string
    open: number
    close: number
    high: number
    low: number
    volume: number
}

export interface MacdPoint {
    time: string
    dif: number
    dea: number
    macd: number
}

export interface KdjPoint {
    time: string
    k: number
    d: number
    j: number
}

export interface MAPoint {
    time: string
    ma5: number | null
    ma10: number | null
    ma20: number | null
    ma30: number | null
    ma60: number | null
    ma150: number | null
}

export interface SectorItem {
    rank: number
    name: string
    changePercent: number
    leadStock: string
    leadChange: number
    amount: number
}

export interface StockDetailInfo {
    key: StockKey
    name: string
    icon: string
    code: string
    market: string
    current: number
    open: number
    high: number
    low: number
    change: number
    changePercent: number
    volume: number
    amount: number
    pe: number
    pb: number
    turnover: number
    amplitude: number
}

const BASE_PRICES: Record<StockKey, number> = {
    sh: 3380,
    cy: 2150,
    hk: 19800,
    us: 18200,
}

const STOCK_META: Record<
    StockKey,
    { name: string; icon: string; code: string; market: string }
> = {
    sh: { name: '上证指数', icon: '📊', code: '000001', market: 'A股' },
    cy: { name: '创业板指', icon: '🚀', code: '399006', market: 'A股' },
    hk: { name: '恒生指数', icon: '🌃', code: 'HSI', market: '港股' },
    us: { name: '纳斯达克', icon: '💻', code: 'IXIC', market: '美股' },
}

function seededRandom(seed: number): () => number {
    let s = seed
    return () => {
        s = (s * 16807 + 0) % 2147483647
        return (s - 1) / 2147483646
    }
}

function hashKey(key: StockKey): number {
    const map: Record<StockKey, number> = { sh: 42, cy: 77, hk: 13, us: 99 }
    return map[key]
}

function generateIntraday(key: StockKey): IntradayPoint[] {
    const rand = seededRandom(hashKey(key) * 1000)
    const base = BASE_PRICES[key]
    const points: IntradayPoint[] = []
    let price = base * (1 + (rand() - 0.5) * 0.008)
    const times = [
        '09:30', '09:45', '10:00', '10:15', '10:30', '10:45',
        '11:00', '11:15', '11:30', '13:00', '13:15', '13:30',
        '13:45', '14:00', '14:15', '14:30', '14:45', '15:00',
    ]
    for (const time of times) {
        price += (rand() - 0.48) * base * 0.002
        points.push({
            time,
            price: Number(price.toFixed(2)),
            volume: Math.floor(rand() * 800000000 + 200000000),
        })
    }
    return points
}

function generateKLine(key: StockKey, count: number, isMonthly: boolean): KLinePoint[] {
    const rand = seededRandom(hashKey(key) * (isMonthly ? 3000 : 2000))
    const base = BASE_PRICES[key]
    const points: KLinePoint[] = []
    let close = base * (1 + (rand() - 0.5) * 0.05)
    const now = new Date()

    for (let i = count - 1; i >= 0; i--) {
        const d = new Date(now)
        if (isMonthly) {
            d.setMonth(d.getMonth() - i)
            const time = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
            const open = close
            const change = (rand() - 0.48) * base * 0.04
            close = open + change
            const high = Math.max(open, close) + rand() * base * 0.015
            const low = Math.min(open, close) - rand() * base * 0.015
            points.push({
                time,
                open: Number(open.toFixed(2)),
                close: Number(close.toFixed(2)),
                high: Number(high.toFixed(2)),
                low: Number(low.toFixed(2)),
                volume: Math.floor(rand() * 50000000000 + 10000000000),
            })
        } else {
            d.setDate(d.getDate() - i)
            const time = `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
            const open = close
            const change = (rand() - 0.48) * base * 0.012
            close = open + change
            const high = Math.max(open, close) + rand() * base * 0.006
            const low = Math.min(open, close) - rand() * base * 0.006
            points.push({
                time,
                open: Number(open.toFixed(2)),
                close: Number(close.toFixed(2)),
                high: Number(high.toFixed(2)),
                low: Number(low.toFixed(2)),
                volume: Math.floor(rand() * 3000000000 + 500000000),
            })
        }
    }
    return points
}

function calcMacd(klines: KLinePoint[]): MacdPoint[] {
    const closes = klines.map((k) => k.close)
    const ema = (data: number[], period: number): number[] => {
        const k = 2 / (period + 1)
        const result: number[] = [data[0]]
        for (let i = 1; i < data.length; i++) {
            result.push(data[i] * k + result[i - 1] * (1 - k))
        }
        return result
    }
    const ema12 = ema(closes, 12)
    const ema26 = ema(closes, 26)
    const difArr = ema12.map((v, i) => v - ema26[i])
    const deaArr = ema(difArr, 9)
    return klines.map((k, i) => ({
        time: k.time,
        dif: Number(difArr[i].toFixed(2)),
        dea: Number(deaArr[i].toFixed(2)),
        macd: Number(((difArr[i] - deaArr[i]) * 2).toFixed(2)),
    }))
}

function calcKdj(klines: KLinePoint[]): KdjPoint[] {
    const result: KdjPoint[] = []
    let k = 50
    let d = 50
    for (let i = 0; i < klines.length; i++) {
        const start = Math.max(0, i - 8)
        const slice = klines.slice(start, i + 1)
        const high = Math.max(...slice.map((s) => s.high))
        const low = Math.min(...slice.map((s) => s.low))
        const close = klines[i].close
        const rsv = high === low ? 50 : ((close - low) / (high - low)) * 100
        k = (2 / 3) * k + (1 / 3) * rsv
        d = (2 / 3) * d + (1 / 3) * k
        const j = 3 * k - 2 * d
        result.push({
            time: klines[i].time,
            k: Number(k.toFixed(2)),
            d: Number(d.toFixed(2)),
            j: Number(j.toFixed(2)),
        })
    }
    return result
}

function calcMAs(klines: KLinePoint[]): MAPoint[] {
    const closes = klines.map((k) => k.close)
    const periods = [5, 10, 20, 30, 60, 150] as const
    const maData: Record<string, (number | null)[]> = {}
    for (const p of periods) {
        const key = `ma${p}`
        maData[key] = closes.map((_, i) => {
            if (i < p - 1) return null
            let sum = 0
            for (let j = i - p + 1; j <= i; j++) sum += closes[j]
            return Number((sum / p).toFixed(2))
        })
    }
    return klines.map((k, i) => ({
        time: k.time,
        ma5: maData.ma5[i],
        ma10: maData.ma10[i],
        ma20: maData.ma20[i],
        ma30: maData.ma30[i],
        ma60: maData.ma60[i],
        ma150: maData.ma150[i],
    }))
}

function intradayToKLine(intraday: IntradayPoint[]): KLinePoint[] {
    return intraday.map((p) => ({
        time: p.time,
        open: p.price,
        close: p.price,
        high: p.price,
        low: p.price,
        volume: p.volume,
    }))
}

const SECTOR_NAMES: Record<SectorTab, string[]> = {
    hot: ['人工智能', '低空经济', '固态电池', '人形机器人', 'CPO概念', '华为概念', '算力租赁', '量子科技'],
    industry: ['半导体', '医药生物', '银行', '食品饮料', '电力设备', '汽车', '计算机', '国防军工'],
    concept: ['ChatGPT', '数字经济', '一带一路', '碳中和', '元宇宙', '国产替代', '信创', '跨境电商'],
    main: ['白酒', '新能源', '光伏', '锂电池', '芯片', '5G通信', '消费电子', '军工'],
}

function generateSectors(tab: SectorTab, key: StockKey): SectorItem[] {
    const rand = seededRandom(hashKey(key) * 500 + tab.length * 17)
    const names = SECTOR_NAMES[tab]
    return names.map((name, i) => {
        const change = (rand() - 0.42) * 6
        const leadChange = change + (rand() - 0.5) * 4
        return {
            rank: i + 1,
            name,
            changePercent: Number(change.toFixed(2)),
            leadStock: `${name.slice(0, 2)}${['科技', '股份', '集团', '电子', '新材'][i % 5]}`,
            leadChange: Number(leadChange.toFixed(2)),
            amount: Math.floor(rand() * 80000000000 + 5000000000),
        }
    }).sort((a, b) => b.changePercent - a.changePercent)
        .map((item, i) => ({ ...item, rank: i + 1 }))
}

export function getStockDetailInfo(key: StockKey): StockDetailInfo {
    const meta = STOCK_META[key]
    const base = BASE_PRICES[key]
    const rand = seededRandom(hashKey(key))
    const change = (rand() - 0.45) * base * 0.015
    const current = base + change
    const open = base + (rand() - 0.5) * base * 0.008
    const high = Math.max(current, open) + rand() * base * 0.005
    const low = Math.min(current, open) - rand() * base * 0.005

    return {
        key,
        ...meta,
        current: Number(current.toFixed(2)),
        open: Number(open.toFixed(2)),
        high: Number(high.toFixed(2)),
        low: Number(low.toFixed(2)),
        change: Number(change.toFixed(2)),
        changePercent: Number(((change / base) * 100).toFixed(2)),
        volume: Math.floor(rand() * 400000000000 + 80000000000),
        amount: Math.floor(rand() * 6000000000000 + 1000000000000),
        pe: Number((rand() * 20 + 10).toFixed(2)),
        pb: Number((rand() * 3 + 1).toFixed(2)),
        turnover: Number((rand() * 2 + 0.5).toFixed(2)),
        amplitude: Number((((high - low) / base) * 100).toFixed(2)),
    }
}

export function getChartData(key: StockKey, period: ChartPeriod) {
    if (period === 'intraday') {
        const intraday = generateIntraday(key)
        const klines = intradayToKLine(intraday)
        return {
            intraday,
            klines,
            macd: calcMacd(klines),
            kdj: calcKdj(klines),
        }
    }
    const klines = generateKLine(key, period === 'daily' ? 250 : 200, period === 'monthly')
    return {
        intraday: null,
        klines,
        macd: calcMacd(klines),
        kdj: calcKdj(klines),
        mas: calcMAs(klines),
    }
}

export function getSectorData(key: StockKey, tab: SectorTab): SectorItem[] {
    return generateSectors(tab, key)
}

export function isValidStockKey(key: string): key is StockKey {
    return ['sh', 'cy', 'hk', 'us'].includes(key)
}
