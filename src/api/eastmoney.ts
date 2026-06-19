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

const FUND_SELECT_PATH = '/condition/conditionFund/fundSelect'
const FUND_SELECT_BASE = import.meta.env.VITE_FUND_RANK
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

export interface FundStockHolding {
    code: string
    name: string
    weight: number
    changeType: string
    changePct: number
    industry: string
    holdQuarters: number
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
}

interface FundDetailStockRaw {
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

    const response = await httpFetch(
        `${FUND_DETAIL_BASE}$/merge/m/api/jjxqy2`,
        {
            method: 'POST',
            headers: {
                Accept: 'application/json, text/plain, */*',
                'Content-Type': 'application/x-www-form-urlencoded',
                Origin: 'https://h5.1234567.com.cn',
                Referer: 'https://h5.1234567.com.cn/',
                Validmark: FUND_DEVICE_ID,
            },
            body,
        },
    )

    if (!response.ok) {
        throw new Error(`基金详情请求失败: ${response.status}`)
    }

    const json: FundDetailResponse = await response.json()

    if (!json.success || json.errorCode !== 0 || !json.data) {
        throw new Error('基金详情数据获取失败')
    }

    return mapFundDetail(fcode, json.data)
}

export async function fetchFundProfile(fcode: string): Promise<any> {
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
    const response = await httpFetch(
        `${FUND_DETAIL_BASE}/merge/m/api/jjxqy1_2`,
        {
            method: 'POST',
            headers: {
                Accept: 'application/json, text/plain, */*',
                'Content-Type': 'application/x-www-form-urlencoded',
                Origin: 'https://h5.1234567.com.cn',
                Referer: 'https://h5.1234567.com.cn/',
                Validmark: FUND_DEVICE_ID,
            },
            body,
        },
    )
    if (!response.ok) {
        throw new Error(`基金档案请求失败: ${response.status}`)
    }
    const json = await response.json()
    console.log('Fund Profile JSON:', json)
    return json
}

export default {
    fetchFundRanking,
    fetchFundDetail,
    fundTypeToRsfType,
}
