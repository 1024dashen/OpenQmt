import { isTauri } from '@tauri-apps/api/core'
import { httpFetch } from '../utils/http'
import type { FundRankItem } from '../types'

/** 基金类型筛选：0全部 1指数 2股票 3混合 4债券 5货币 6海外 */
export type FundRsfType = 0 | 1 | 2 | 3 | 4 | 5 | 6

interface TiantianFundItem {
    fundCode: string
    fundName: string
    ftype: string
    perNav: string
    accPerNav: string
    daySyl: string
    weekSyl: string
    monthSyl: string
    quarterReturn: string
    hySyl: string
    yearSyl: string
    jzrq: string
}

interface FundSelectResponse {
    Data: TiantianFundItem[]
    Message: string | null
    ErrCode: number
    Succeed: boolean
}

export interface FundRankingResult {
    items: FundRankItem[]
    hasMore: boolean
}

const FUND_SELECT_BASE = import.meta.env.VITE_FUND_RANK
const FUND_STOCK_BASE = import.meta.env.VITE_FUND_STOCK
const FUND_SELECT_PATH = '/condition/conditionFund/fundSelect'
const FUND_SELECT_URL = `${FUND_SELECT_BASE}${FUND_SELECT_PATH}`

function getFundSelectUrl(): string {
    if (isTauri()) return FUND_SELECT_URL
    return `/api/fund${FUND_SELECT_PATH}`
}

function parseNum(val: string | undefined): number {
    if (!val) return 0
    const n = parseFloat(val)
    return Number.isFinite(n) ? n : 0
}

function toFundRankItem(item: TiantianFundItem, rank: number): FundRankItem {
    return {
        rank,
        code: item.fundCode,
        name: item.fundName,
        type: item.ftype,
        nav: parseNum(item.perNav),
        accNav: parseNum(item.accPerNav),
        jzrq: parseNum(item.jzrq),
        dayChange: parseNum(item.daySyl),
        weekChange: parseNum(item.weekSyl),
        monthChange: parseNum(item.monthSyl),
        threeMonthChange: parseNum(item.quarterReturn),
        sixMonthChange: parseNum(item.hySyl),
        yearChange: parseNum(item.yearSyl),
    }
}

export function fundTypeToRsfType(type: string): FundRsfType {
    const map: Record<string, FundRsfType> = {
        all: 0,
        zs: 1,
        gp: 2,
        hh: 3,
        zq: 4,
        qdii: 6,
    }
    return map[type] ?? 0
}

export async function fetchFundRanking(
    pageIndex = 1,
    pageNum = 30,
    rsfType: FundRsfType = 0,
): Promise<FundRankingResult> {
    const body = new URLSearchParams({
        orderField: '5_1_-1',
        pageIndex: String(pageIndex),
        pageNum: String(pageNum),
        pageType: '5',
        deviceid: 'Wap',
        plat: 'Wap',
        product: 'EFund',
        version: '2.0.0',
        abnormal: '3',
        rankSy: '1',
        rsfType: String(rsfType),
    })

    const response = await httpFetch(getFundSelectUrl(), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            Priority: 'u=3, i',
        },
        body,
    })

    if (!response.ok) {
        throw new Error(`基金排行请求失败: ${response.status}`)
    }

    const json: FundSelectResponse = await response.json()
    console.log('FundSelectResponse:', json)
    if (!json.Succeed || json.ErrCode !== 0) {
        throw new Error(json.Message || '基金排行数据获取失败')
    }

    const startRank = (pageIndex - 1) * pageNum + 1
    const list = json.Data ?? []
    return {
        items: list.map((item, i) => toFundRankItem(item, startRank + i)),
        hasMore: list.length >= pageNum,
    }
}

const FUND_DETAIL_BASE = import.meta.env.VITE_FUND_DETAIL
// const FUND_DETAIL_URL =
function generateDeviceId(): string {
    const chars = '0123456789abcdef'
    let id = ''
    for (let i = 0; i < 32; i++) {
        id += chars[Math.floor(Math.random() * 16)]
    }
    return id
}

const FUND_DEVICE_ID = generateDeviceId()

function fundUrl(path: string): string {
    return isTauri() ? `${FUND_DETAIL_BASE}${path}` : `/api/fund-detail${path}`
}

export interface FundStockHolding {
    code: string
    name: string
    weight: number
    changeType: string
    changePct: number
    industry: string
    holdQuarters: number
    price: number | null
    changePercent: number | null
}

export interface FundSectorItem {
    name: string
    weight: number
    marketValue: string
    reportDate: string
}

export interface FundTopicItem {
    topic: string
    weight: number
    reportDate: string
}

export interface FundRelateThemeItem {
    name: string
}

export interface FundAssetItem {
    reportDate: string
    stockPct: number
    cashPct: number
    bondPct: number
    otherPct: number
}

export interface FundScaleItem {
    reportDate: string
    netNav: number
    changePct: number | null
}

export interface FundBonusItem {
    exDate: string
    payDate: string
    amount: string
}

export interface FundDetail {
    code: string
    reportDate: string
    aiSummary: string | null
    holdings: FundStockHolding[]
    sectors: FundSectorItem[]
    topics: FundTopicItem[]
    assetAllocation: FundAssetItem | null
    scales: FundScaleItem[]
    bonuses: FundBonusItem[]
    cashManagementPct: number | null
    profile: FundProfile | null
}

export interface FundPeriodItem {
    title: string
    syl: string
    avg: string
    hs300: string
    rank: string
}

export interface FundManagerBrief {
    mgrid: string
    name: string
    days: number
    penavGrowth: number
    maxRetra: number
    photo: string
    investmentIdea: string
}

export interface FundHolderStructure {
    fsrq: string
    grbl: string
    jgbl: string
    nbbl: string
    employehold: string
}

export interface FundRiskMetrics {
    stddev1: number | null
    sharp1: number | null
    maxRetra1: number | null
    stddev1Rank: number | null
    sharp1Rank: number | null
    maxRetra1Rank: number | null
    stddev1Fsc: number | null
    sharp1Fsc: number | null
    maxRetra1Fsc: number | null
}

export interface FundProfile {
    shortName: string
    fullName: string
    fundType: string
    industryType: string
    riskLevel: string
    companyName: string
    estabDate: string
    issbDate: string
    navDate: string
    nav: number
    accNav: number
    dayChange: number
    totalNav: number
    sgzt: string
    minRg: number
    purchaseRate: string
    benchmark: string
    periods: FundPeriodItem[]
    managers: FundManagerBrief[]
    holderStructure: FundHolderStructure | null
    riskMetrics: FundRiskMetrics | null
    relatedThemes: FundRelateThemeItem[]
}

interface FundDetailStockRaw {
    NEWTEXCH: string
    GPDM: string
    GPJC: string
    JZBL: string
    PCTNVCHGTYPE: string
    PCTNVCHG: string
    INDEXNAME: string
    HOLDCOUNT: string
}

interface FundDetailResponse {
    data?: {
        expansion?: string
        fundInverstPosition?: {
            fundStocks?: FundDetailStockRaw[] | null
        }
        fundHoldAiReportInfo?: {
            data?: Array<{ text_summary?: string }> | null
        }
        fundSectorAllocationByDate?: Record<
            string,
            Array<{
                HYMC: string
                ZJZBL: string
                SZ: string
                FSRQ: string
            }>
        >
        fundStockInvestDistriTop?: Record<
            string,
            Array<{
                TOPICCODE: string
                PCTNV: string
                REPORTDATE: string
            }>
        >
        fundAssetAllocationByDate?: Record<
            string,
            Array<{
                GP: string
                HB: string
                ZQ: string
                QT: string
                FSRQ: string
            }>
        >
        fundAssetsList?: Array<{
            FSRQ: string
            NETNAV: string
            CHANGE: string
        }>
        fundBonusDetail?: {
            FHINFO?: Array<{
                DJR: string
                FFR: string
                FHFCZ: string
            }>
        }
        fundInvestMoneyManagement?: {
            FundAsset?: {
                MPCTNV?: string
            }
        }
    }
    success?: boolean
    errorCode?: number
}

function parseOptionalNum(val: string | undefined): number | null {
    if (!val) return null
    const n = parseFloat(val)
    return Number.isFinite(n) ? n : null
}

function getLatestDateKey(
    map: Record<string, unknown> | null | undefined,
): string | null {
    if (!map) return null
    const keys = Object.keys(map).sort()
    return keys.length ? keys[keys.length - 1]! : null
}

function mapFundDetail(
    code: string,
    raw: FundDetailResponse['data'],
): FundDetail {
    const reportDate = raw?.expansion ?? ''
    const stocks = raw?.fundInverstPosition?.fundStocks ?? []
    const sectorDate =
        reportDate || getLatestDateKey(raw?.fundSectorAllocationByDate)
    const sectorList = sectorDate
        ? (raw?.fundSectorAllocationByDate?.[sectorDate] ?? [])
        : []
    const topicDate =
        reportDate || getLatestDateKey(raw?.fundStockInvestDistriTop)
    const topicList = topicDate
        ? (raw?.fundStockInvestDistriTop?.[topicDate] ?? [])
        : []
    const assetDate =
        reportDate || getLatestDateKey(raw?.fundAssetAllocationByDate)
    const assetRaw = assetDate
        ? raw?.fundAssetAllocationByDate?.[assetDate]?.[0]
        : undefined

    return {
        code,
        reportDate,
        aiSummary: raw?.fundHoldAiReportInfo?.data?.[0]?.text_summary ?? null,
        holdings: stocks.map((item) => ({
            code: item.GPDM,
            name: item.GPJC,
            weight: parseNum(item.JZBL),
            changeType: item.PCTNVCHGTYPE,
            changePct: parseNum(item.PCTNVCHG),
            industry: item.INDEXNAME,
            holdQuarters: parseNum(item.HOLDCOUNT),
            price: null,
            changePercent: null,
        })),
        sectors: sectorList
            .filter((item) => item.HYMC !== '合计' && item.ZJZBL)
            .map((item) => ({
                name: item.HYMC,
                weight: parseNum(item.ZJZBL),
                marketValue: item.SZ,
                reportDate: item.FSRQ,
            }))
            .sort((a, b) => b.weight - a.weight),
        topics: topicList
            .map((item) => ({
                topic: item.TOPICCODE,
                weight: parseNum(item.PCTNV),
                reportDate: item.REPORTDATE,
            }))
            .sort((a, b) => b.weight - a.weight),
        assetAllocation: assetRaw
            ? {
                  reportDate: assetRaw.FSRQ,
                  stockPct: parseNum(assetRaw.GP),
                  cashPct: parseNum(assetRaw.HB),
                  bondPct: parseNum(assetRaw.ZQ),
                  otherPct: parseNum(assetRaw.QT),
              }
            : null,
        scales: (raw?.fundAssetsList ?? []).map((item) => ({
            reportDate: item.FSRQ,
            netNav: parseNum(item.NETNAV),
            changePct: parseOptionalNum(item.CHANGE),
        })),
        bonuses: (raw?.fundBonusDetail?.FHINFO ?? []).map((item) => ({
            exDate: item.DJR,
            payDate: item.FFR,
            amount: item.FHFCZ,
        })),
        cashManagementPct: parseOptionalNum(
            raw?.fundInvestMoneyManagement?.FundAsset?.MPCTNV,
        ),
        profile: null,
    }
}

export async function fetchFundDetail(fcode: string): Promise<FundDetail> {
    const body = new URLSearchParams({
        deviceid: FUND_DEVICE_ID,
        version: '9.9.9',
        appVersion: '6.5.5',
        product: 'EFund',
        plat: 'Web',
        uid: '',
        fcode,
    })

    const response = await httpFetch(fundUrl('/merge/m/api/jjxqy2'), {
        method: 'POST',
        headers: {
            Accept: 'application/json, text/plain, */*',
            'Content-Type': 'application/x-www-form-urlencoded',
            Origin: 'https://h5.1234567.com.cn',
            Referer: 'https://h5.1234567.com.cn/',
            Validmark: FUND_DEVICE_ID,
        },
        body,
    })

    if (!response.ok) {
        throw new Error(`基金详情请求失败: ${response.status}`)
    }

    const json: FundDetailResponse = await response.json()

    if (!json.success || json.errorCode !== 0 || !json.data) {
        throw new Error('基金详情数据获取失败')
    }

    const detail = mapFundDetail(fcode, json.data)

    const stocks = json.data.fundInverstPosition?.fundStocks ?? []
    if (stocks.length) {
        const secids = stocks.map((s) => `${s.NEWTEXCH}.${s.GPDM}`).join(',')
        console.log('secids', secids)
        try {
            const res = await fetchFundStock(secids)
            const quoteMap = new Map(
                (res.data?.diff ?? []).map((d) => [d.f12, d]),
            )
            for (const h of detail.holdings) {
                const q = quoteMap.get(h.code)
                if (q) {
                    const p = Number(q.f2)
                    h.price = Number.isFinite(p) ? p : null
                    const c = Number(q.f3)
                    h.changePercent = Number.isFinite(c) ? c : null
                }
            }
        } catch (error) {
            console.log('基金持仓涨跌幅获取失败', error)
        }
    }

    return detail
}

function toProfileNum(v: unknown): number | null {
    if (v == null || v === '' || v === '--') return null
    const n = Number(v)
    return Number.isFinite(n) ? n : null
}

function mapFundProfile(raw: any): FundProfile {
    const b = raw?.baseInfo?.[0] ?? {}
    const u = raw?.uniqueInfo?.[0]
    const h = raw?.fundHolderStructure?.[0]
    return {
        shortName: b.SHORTNAME ?? '',
        fullName: raw?.FundACRateInfoV2Expansion?.FullName ?? b.SHORTNAME ?? '',
        fundType: b.FTYPE ?? '',
        industryType: b.TTYPENAME ?? '',
        riskLevel: b.RISKLEVEL ?? '',
        companyName: b.JJGS ?? '',
        estabDate: b.ESTABDATE ?? '',
        issbDate: b.ISSBDATE ?? '',
        navDate: b.FSRQ ?? '',
        nav: b.DWJZ ?? 0,
        accNav: b.LJJZ ?? 0,
        dayChange: b.RZDF ?? 0,
        totalNav: b.ENDNAV ?? 0,
        sgzt: raw?.rateInfo?.SGZT ?? '',
        minRg: b.MINRG ?? 0,
        purchaseRate: b.SOURCERATE ?? '',
        benchmark: b.BENCH ?? '',
        periods: (raw?.FundPeriodIncrease ?? []).map((p: any) => ({
            title: p.title,
            syl: p.syl,
            avg: p.avg,
            hs300: p.hs300,
            rank: p.rank,
        })),
        managers: (raw?.FundManagerInformation?.currentManagerInfos ?? []).map(
            (m: any) => ({
                mgrid: m.SINFO?.MGRID ?? m.MGRID,
                name: m.SINFO?.MGRNAME ?? '',
                days: m.SINFO?.TOTALDAYS ?? 0,
                penavGrowth: m.SINFO?.PENAVGROWTH ?? 0,
                maxRetra: m.SINFO?.MAXRETRA ?? 0,
                photo: m.PINFO?.[0]?.NEWPHOTOURL ?? '',
                investmentIdea: m.PINFO?.[0]?.INVESTMENTIDEAR ?? '',
            }),
        ),
        holderStructure: h
            ? {
                  fsrq: h.FSRQ,
                  grbl: h.GRBL,
                  jgbl: h.JGBL,
                  nbbl: h.NBBL,
                  employehold: h.EMPLOYEHOLD,
              }
            : null,
        riskMetrics: u
            ? {
                  stddev1: toProfileNum(u.STDDEV1),
                  sharp1: toProfileNum(u.SHARP1),
                  maxRetra1: toProfileNum(u.MAXRETRA1),
                  stddev1Rank: toProfileNum(u.STDDEV_1NRANK),
                  sharp1Rank: toProfileNum(u.SHARP_1NRANK),
                  maxRetra1Rank: toProfileNum(u.MAXRETRA_1NRANK),
                  stddev1Fsc: toProfileNum(u.STDDEV_1NFSC),
                  sharp1Fsc: toProfileNum(u.SHARP_1NFSC),
                  maxRetra1Fsc: toProfileNum(u.MAXRETRA_1NFSC),
              }
            : null,
        relatedThemes: (raw?.fundRelateTheme ?? [])
            .map((t: any) => ({ name: t.SEC_NAME ?? '' }))
            .filter((t: { name: string }) => t.name),
    }
}

// 基金档案
export async function fetchFundProfile(fcode: string): Promise<FundProfile> {
    const body = new URLSearchParams({
        deviceid: FUND_DEVICE_ID,
        version: '9.9.9',
        appVersion: '6.5.5',
        product: 'EFund',
        plat: 'Web',
        uid: '',
        fcode,
        indexfields:
            '_id,INDEXCODE,BKID,INDEXNAME,INDEXVALUA,NEWINDEXTEXCH,PEP100',
        fields: 'BENCH,ESTDIFF,INDEXNAME,LINKZSB,INDEXCODE,NEWTEXCH,FTYPE,FCODE,BAGTYPE,RISKLEVEL,TTYPENAME,PTDT_FY,PTDT_TRY,PTDT_TWY,PTDT_Y,DWDT_FY,DWDT_TRY,DWDT_TWY,DWDT_Y,MBDT_FY,MBDT_TRY,MBDT_TWY,MBDT_Y,YDDT_FY,YDDT_TRY,YDDT_TWY,YDDT_Y,BFUNDTYPE,YMATCHCODEA,RLEVEL_SZ,RLEVEL_CX,ESTABDATE,JJGS,JJGSID,ENDNAV,FEGMRQ,SHORTNAME,TTYPE,TJDIN,FUNDEXCHG,LISTTEXCHMARK,FSRQ,ISSBDATE,ISSEDATE,FEATURE,DWJZ,LJJZ,MINRG,RZDF,PERIODNAME,SYL_1N,SYL_LN,SYL_Z,SOURCERATE,RATE,TSRQ,BTYPE,BUY,BENCHCODE,BENCH_CORR,TRKERROR,BENCHRATIO,NEWINDEXTEXCH,BESTDT_STRATEGY,BESTDT_Y,BESTDT_TWY,BESTDT_TRY,BESTDT_FY',
        fundUniqueInfo_fIELDS:
            'FCODE,STDDEV1,STDDEV_1NRANK,STDDEV_1NFSC,STDDEV3,STDDEV_3NRANK,STDDEV_3NFSC,STDDEV5,STDDEV_5NRANK,STDDEV_5NFSC,SHARP1,SHARP_1NRANK,SHARP_1NFSC,SHARP3,SHARP_3NRANK,SHARP_3NFSC,SHARP5,SHARP_5NRANK,SHARP_5NFSC,MAXRETRA1,MAXRETRA_1NRANK,MAXRETRA_1NFSC,MAXRETRA3,MAXRETRA_3NRANK,MAXRETRA_3NFSC,MAXRETRA5,MAXRETRA_5NRANK,MAXRETRA_5NFSC,TRKERROR1,TRKERROR_1NRANK,TRKERROR_1NFSC,TRKERROR3,TRKERROR_3NRANK,TRKERROR_3NFSC,TRKERROR5,TRKERROR_5NRANK,TRKERROR_5NFSC',
        fundUniqueInfo_fLFIELDS:
            'FCODE,BUSINESSTYPE,BUSINESSTEXT,BUSINESSCODE,BUSINESSSUBTYPE,MARK',
        cfhFundFInfo_fields: 'INVESTMENTIDEAR,INVESTMENTIDEARIMG',
        ISRG: '0',
        relateThemeFields: 'FCODE,SEC_CODE,SEC_NAME,CORR_1Y,OL2TOP',
    })
    const response = await httpFetch(fundUrl('/merge/m/api/jjxqy1_2'), {
        method: 'POST',
        headers: {
            Accept: 'application/json, text/plain, */*',
            'Content-Type': 'application/x-www-form-urlencoded',
            Origin: 'https://h5.1234567.com.cn',
            Referer: 'https://h5.1234567.com.cn/',
            Validmark: FUND_DEVICE_ID,
        },
        body,
    })
    if (!response.ok) throw new Error(`基金档案请求失败: ${response.status}`)
    const json = await response.json()
    if (!json.success || json.errorCode !== 0 || !json.data)
        throw new Error('基金档案数据获取失败')
    return mapFundProfile(json.data)
}

// 持仓股涨跌幅
interface FundStockQuoteDiff {
    f2: number
    f3: number
    f12: string
}

interface FundStockQuoteResponse {
    data?: {
        diff?: FundStockQuoteDiff[]
    }
}

export async function fetchFundStock(
    secids: string,
): Promise<FundStockQuoteResponse> {
    const body = new URLSearchParams({
        deviceid: FUND_DEVICE_ID,
        version: '9.9.9',
        appVersion: '6.5.5',
        product: 'EFund',
        plat: 'Web',
        secids,
        wbp2u: '',
        fields: 'f1,f2,f3,f4,f12,f13,f14,f29,f292',
        fltt: '2',
        invt: '2',
    })
    const response = await httpFetch(`${FUND_STOCK_BASE}/api/qt/ulist.np/get`, {
        method: 'POST',
        headers: {
            Accept: 'application/json, text/plain, */*',
            'Content-Type': 'application/x-www-form-urlencoded',
            Origin: 'https://h5.1234567.com.cn',
            Referer: 'https://h5.1234567.com.cn/',
            Validmark: FUND_DEVICE_ID,
        },
        body,
    })
    if (!response.ok) throw new Error(`基金持仓请求失败: ${response.status}`)
    const json = await response.json()
    console.log('基金持仓涨跌幅', json)
    return json
}

export default {
    fetchFundRanking,
    fetchFundDetail,
    fundTypeToRsfType,
}
