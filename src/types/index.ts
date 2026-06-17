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
    secid?: string
    unit?: string
    icon: string
    decimals?: number
}

/** 黄金品种 key */
export type GoldKey =
    | 'shj'
    | 'jdj'
    | 'llj'
    | 'lly'

/** 黄金行情单项（yun API 响应字段） */
export interface GoldPriceItem {
    name: string
    price: string | number
    open: string | number
    close: string | number
    high: string | number
    low: string | number
    time: string
}

/** 黄金行情 API 响应 */
export interface GoldApiResponse {
    lljPrice: GoldPriceItem
    llyPrice: GoldPriceItem
    shjPrice: GoldPriceItem
    shyPrice: GoldPriceItem
    jdjPrice: GoldPriceItem
    isWeekend: boolean
}

/** 股票指数 key */
export type StockKey = 'sh000001' | 'sz399006' | 'hsi' | 'ndx'

/** 黄金行情数据映射 */
export type GoldDataMap = Partial<Record<GoldKey, QuoteData>>

/** 黄金行情获取结果 */
export interface GoldFetchResult {
    data: GoldDataMap
    isWeekend: boolean
}

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

/** 学习难度 */
export type LearnLevel = '初级' | '中级' | '高级'

/** 学习分类 */
export type LearnCategory = 'basic' | 'strategy'

/** 学习内容类型 */
export type LearnContentType = 'article' | 'video'

/** 学习帖子公共字段 */
export interface LearnPostBase {
    id: number
    type: LearnContentType
    title: string
    cover: string
    coverHeight: number
    author: string
    likes: number
    level: LearnLevel
    category: LearnCategory
}

/** 图文帖子 */
export interface LearnArticle extends LearnPostBase {
    type: 'article'
    /** 富文本正文，可包含文字、图片、视频、音频等 HTML 元素 */
    content: string
}

/** 视频帖子 */
export interface LearnVideo extends LearnPostBase {
    type: 'video'
    videoUrl: string
    duration: string
    description?: string
}

/** 学习帖子 */
export type LearnPost = LearnArticle | LearnVideo

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

/** AI 对话记录 */
export interface AiConversation {
    id: string
    title: string
    messages: AiMessage[]
    provider: ModelProvider
    model: string
    createdAt: number
    updatedAt: number
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

/** 推送渠道类型 */
export type PushChannel =
    | 'feishu'
    | 'wecom'
    | 'dingtalk'
    | 'wxpusher'
    | 'custom'

/** 推送渠道配置 */
export interface PushChannelConfig {
    id: string
    type: PushChannel
    name: string
    enabled: boolean
    webhook: string
    token?: string
    secret?: string
    corpId?: string
    agentId?: string
}

/** 通知类型 */
export type NotificationType =
    | 'gold_price'
    | 'stock_alert'
    | 'fund_update'
    | 'ai_report'
    | 'learn_progress'
    | 'system_update'
    | 'credits_change'

/** 通知类型配置 */
export interface NotificationTypeConfig {
    type: NotificationType
    name: string
    description: string
    enabled: boolean
    channels: string[]
}

/** 推送通知设置 */
export interface PushNotificationSettings {
    channels: PushChannelConfig[]
    notifications: NotificationTypeConfig[]
}
