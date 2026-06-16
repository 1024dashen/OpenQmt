/** 行情数据通用接口 */
export interface QuoteData {
    name: string
    current: number
    open: number
    high: number
    low: number
    change: number
    changePercent: number
    volume: number
    amount: number
}

/** 品种配置 */
export interface SymbolConfig {
    name: string
    secid: string
    unit?: string
    icon: string
}

/** 黄金品种 key */
export type GoldKey =
    | 'shanghai_gold'
    | 'jcb_gold'
    | 'london_gold'
    | 'london_silver'

/** 股票指数 key */
export type StockKey = 'sh000001' | 'sz399006' | 'hsi' | 'ndx'

/** 黄金行情数据映射 */
export type GoldDataMap = Partial<Record<GoldKey, QuoteData>>

/** 股票行情数据映射 */
export type StockDataMap = Partial<Record<StockKey, QuoteData>>

/** 基金排行条目 */
export interface FundRankItem {
    rank: number
    code: string
    name: string
    type: string
    nav: number
    accNav: number
    dayChange: number
    weekChange: number
    monthChange: number
    threeMonthChange: number
    sixMonthChange: number
    yearChange: number
}

/** 学习主题 */
export interface LearnTopic {
    id: number
    icon: string
    title: string
    level: '初级' | '中级' | '高级'
    desc: string
    detail: string
}

/** 模型提供商 */
export type ModelProvider =
    | 'openai'
    | 'anthropic'
    | 'google'
    | 'deepseek'
    | 'qwen'
    | 'ollama'
    | 'custom'

/** 单个模型配置 */
export interface ModelOption {
    id: string
    name: string
    enabled: boolean
}

/** 模型提供商配置 */
export interface ProviderConfig {
    provider: ModelProvider
    apiKey: string
    baseUrl: string
    models: ModelOption[]
    activeModel: string
}

/** 模型配置 */
export interface ModelSettings {
    provider: ModelProvider
    apiKey: string
    baseUrl: string
    model: string
    systemPrompt: string
    providers: Record<ModelProvider, ProviderConfig>
    customProviders: Array<{
        id: string
        name: string
        baseUrl: string
        apiKey: string
        models: ModelOption[]
        activeModel: string
    }>
}

/** AI 聊天消息 */
export interface AiMessage {
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: number
}

/** 东方财富 Push2 API 返回字段 */
export interface EastMoneyQuoteFields {
    f43: number // 最新价
    f44: number // 最高价
    f45: number // 最低价
    f46: number // 开盘价
    f47: number // 成交量
    f48: number // 成交额
    f57: string // 代码
    f58: string // 名称
    f169: number // 涨跌额
    f170: number // 涨跌幅
    f171: number // 涨跌幅（动态）
}

/** 东方财富 API 响应 */
export interface EastMoneyResponse {
    rc: number
    rt: number
    svr: number
    lt: number
    full: number
    data: EastMoneyQuoteFields | null
}

/** 用户信息 */
export interface UserInfo {
    id: string
    email: string
    nickname: string
    avatar_url: string | null
    github_id: string | null
    credits: number
}

/** 认证结果 */
export interface AuthResult {
    success: boolean
    message: string
    user: UserInfo | null
    token: string | null
}
