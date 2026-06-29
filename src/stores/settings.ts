import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
    ModelProvider,
    ModelSettings,
    ModelOption,
    ProviderConfig,
    MenuItemConfig,
} from '../types'
import * as storage from '../utils/storage'

const SETTINGS_KEY = 'openqmt_model_settings'
const MENU_SETTINGS_KEY = 'openqmt_menu_settings'
const FUND_COLUMNS_KEY = 'openqmt_fund_columns'

export const DEFAULT_MENU_ITEMS: MenuItemConfig[] = [
    { key: 'gold', label: '黄金行情', visible: true, order: 0 },
    { key: 'stock', label: '股市行情', visible: true, order: 1 },
    { key: 'fund', label: '基金排行', visible: true, order: 2 },
    { key: 'learn', label: '认知学习', visible: true, order: 3 },
    { key: 'ai', label: 'AI 分析', visible: true, order: 4 },
]

/** 基金列表可控制的收益率列 */
export const FUND_YIELD_COLUMNS: Array<{ key: string; label: string }> = [
    { key: 'dayChange', label: '日涨跌' },
    { key: 'weekChange', label: '近一周' },
    { key: 'monthChange', label: '近一月' },
    { key: 'threeMonthChange', label: '近三月' },
    { key: 'sixMonthChange', label: '近六月' },
    { key: 'thisYearChange', label: '今年来' },
    { key: 'yearChange', label: '近一年' },
    { key: 'twoYearChange', label: '近两年' },
    { key: 'threeYearChange', label: '近三年' },
    { key: 'incepChange', label: '成立来' },
]

/** 默认仅展示：日涨跌、近一周、近一月、近三月、近六月 */
const DEFAULT_FUND_COLUMNS: Record<string, boolean> = {
    dayChange: true,
    weekChange: true,
    monthChange: true,
    threeMonthChange: true,
    sixMonthChange: true,
    thisYearChange: false,
    yearChange: false,
    twoYearChange: false,
    threeYearChange: false,
    incepChange: false,
}

export const PROVIDER_LABELS: Record<ModelProvider, string> = {
    openai: 'OpenAI',
    anthropic: 'Anthropic',
    google: 'Google Gemini',
    deepseek: 'DeepSeek',
    qwen: '通义千问',
    ollama: 'Ollama（本地）',
    custom: '自定义',
}

export const PROVIDER_DEFAULTS: Record<
    ModelProvider,
    Pick<ProviderConfig, 'baseUrl' | 'models'>
> = {
    openai: {
        baseUrl: 'https://api.openai.com/v1',
        models: [
            { id: 'gpt-4o', name: 'GPT-4o', enabled: true },
            { id: 'gpt-4o-mini', name: 'GPT-4o Mini', enabled: true },
            { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', enabled: false },
            { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', enabled: false },
        ],
    },
    anthropic: {
        baseUrl: 'https://api.anthropic.com',
        models: [
            {
                id: 'claude-3-5-sonnet-latest',
                name: 'Claude 3.5 Sonnet',
                enabled: true,
            },
            {
                id: 'claude-3-5-haiku-latest',
                name: 'Claude 3.5 Haiku',
                enabled: true,
            },
            {
                id: 'claude-3-opus-latest',
                name: 'Claude 3 Opus',
                enabled: false,
            },
        ],
    },
    google: {
        baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
        models: [
            { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', enabled: true },
            { id: 'gemini-2.0-pro', name: 'Gemini 2.0 Pro', enabled: false },
            { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', enabled: false },
        ],
    },
    deepseek: {
        baseUrl: 'https://api.deepseek.com',
        models: [
            { id: 'deepseek-chat', name: 'DeepSeek Chat', enabled: true },
            {
                id: 'deepseek-reasoner',
                name: 'DeepSeek Reasoner',
                enabled: false,
            },
        ],
    },
    qwen: {
        baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
        models: [
            { id: 'qwen-max', name: 'Qwen Max', enabled: true },
            { id: 'qwen-plus', name: 'Qwen Plus', enabled: true },
            { id: 'qwen-turbo', name: 'Qwen Turbo', enabled: false },
            { id: 'qwen-long', name: 'Qwen Long', enabled: false },
        ],
    },
    ollama: {
        baseUrl: 'http://localhost:11434/v1',
        models: [
            { id: 'llama3.2', name: 'Llama 3.2', enabled: true },
            { id: 'qwen2.5', name: 'Qwen 2.5', enabled: false },
            { id: 'deepseek-r1', name: 'DeepSeek R1', enabled: false },
        ],
    },
    custom: {
        baseUrl: '',
        models: [],
    },
}

const DEFAULT_SYSTEM_PROMPT = `你是一个专业的金融分析助手。请基于提供的市场数据和分析需求,提供专业、客观的分析建议。

回答要求:
1. 基于数据分析,避免主观臆断
2. 提示投资风险,不保证收益
3. 使用简洁清晰的语言
4. 必要时使用表格或列表组织信息`

function createDefaultProviderConfig(provider: ModelProvider): ProviderConfig {
    const defaults = PROVIDER_DEFAULTS[provider]
    const enabledModels = defaults.models.filter((m) => m.enabled)
    return {
        provider,
        apiKey: '',
        baseUrl: defaults.baseUrl,
        models: [...defaults.models],
        activeModel: enabledModels[0]?.id || defaults.models[0]?.id || '',
    }
}

const DEFAULT_SETTINGS: ModelSettings = {
    provider: 'openai',
    apiKey: '',
    baseUrl: PROVIDER_DEFAULTS.openai.baseUrl,
    model: 'gpt-4o-mini',
    systemPrompt: DEFAULT_SYSTEM_PROMPT,
    providers: {
        openai: createDefaultProviderConfig('openai'),
        anthropic: createDefaultProviderConfig('anthropic'),
        google: createDefaultProviderConfig('google'),
        deepseek: createDefaultProviderConfig('deepseek'),
        qwen: createDefaultProviderConfig('qwen'),
        ollama: createDefaultProviderConfig('ollama'),
        custom: createDefaultProviderConfig('custom'),
    },
    customProviders: [],
}

function loadSettings(): ModelSettings {
    try {
        const parsed = storage.getSync<Partial<ModelSettings>>(SETTINGS_KEY)
        if (!parsed)
            return {
                ...DEFAULT_SETTINGS,
                providers: { ...DEFAULT_SETTINGS.providers },
            }

        // 合并默认设置,确保新增字段有默认值
        const settings: ModelSettings = {
            provider: parsed.provider ?? DEFAULT_SETTINGS.provider,
            apiKey: parsed.apiKey ?? '',
            baseUrl: parsed.baseUrl ?? DEFAULT_SETTINGS.baseUrl,
            model: parsed.model ?? DEFAULT_SETTINGS.model,
            systemPrompt: parsed.systemPrompt ?? DEFAULT_SYSTEM_PROMPT,
            providers: {
                ...DEFAULT_SETTINGS.providers,
                ...(parsed.providers as any),
            },
            customProviders: parsed.customProviders ?? [],
        }

        // 确保每个提供商都有配置
        ;(Object.keys(PROVIDER_LABELS) as ModelProvider[]).forEach(
            (provider) => {
                if (!settings.providers[provider]) {
                    settings.providers[provider] =
                        createDefaultProviderConfig(provider)
                }
            },
        )

        return settings
    } catch {
        return {
            ...DEFAULT_SETTINGS,
            providers: { ...DEFAULT_SETTINGS.providers },
        }
    }
}

export const useSettingsStore = defineStore('settings', () => {
    const model = ref<ModelSettings>(loadSettings())

    const providerLabel = computed(() => PROVIDER_LABELS[model.value.provider])

    const providerOptions = computed(() =>
        (Object.keys(PROVIDER_LABELS) as ModelProvider[]).map((key) => ({
            label: PROVIDER_LABELS[key],
            value: key,
        })),
    )

    // 获取当前启用的模型列表
    const availableModels = computed(() => {
        const provider = model.value.provider
        const config = model.value.providers[provider]
        if (!config) return []
        return config.models.filter((m) => m.enabled)
    })

    function setProvider(provider: ModelProvider) {
        const config = model.value.providers[provider]
        if (config) {
            model.value.provider = provider
            model.value.apiKey = config.apiKey
            model.value.baseUrl = config.baseUrl
            model.value.model = config.activeModel
        }
    }

    function updateProviderConfig(
        provider: ModelProvider,
        updates: Partial<ProviderConfig>,
    ) {
        const config = model.value.providers[provider]
        if (config) {
            Object.assign(config, updates)
            // 如果更新的是当前使用的提供商,同步更新主配置
            if (provider === model.value.provider) {
                if (updates.apiKey !== undefined)
                    model.value.apiKey = updates.apiKey
                if (updates.baseUrl !== undefined)
                    model.value.baseUrl = updates.baseUrl
                if (updates.activeModel !== undefined)
                    model.value.model = updates.activeModel
            }
        }
    }

    function toggleModel(provider: ModelProvider, modelId: string) {
        const config = model.value.providers[provider]
        if (!config) return
        const modelOption = config.models.find((m) => m.id === modelId)
        if (modelOption) {
            modelOption.enabled = !modelOption.enabled
        }
    }

    function addCustomModel(provider: ModelProvider, newModel: ModelOption) {
        const config = model.value.providers[provider]
        if (config) {
            config.models.push(newModel)
        }
    }

    function addCustomProvider(provider: {
        id: string
        name: string
        baseUrl: string
        apiKey: string
        models: ModelOption[]
        activeModel: string
    }) {
        model.value.customProviders.push(provider)
    }

    function removeCustomProvider(id: string) {
        model.value.customProviders = model.value.customProviders.filter(
            (p) => p.id !== id,
        )
    }

    function save(settings: ModelSettings) {
        model.value = { ...settings }
        storage.set(SETTINGS_KEY, model.value)
    }

    function saveCurrentConfig() {
        // 保存当前提供商的配置
        const provider = model.value.provider
        const config = model.value.providers[provider]
        if (config) {
            config.apiKey = model.value.apiKey
            config.baseUrl = model.value.baseUrl
            config.activeModel = model.value.model
        }
        storage.set(SETTINGS_KEY, model.value)
    }

    function reset() {
        model.value = {
            ...DEFAULT_SETTINGS,
            providers: { ...DEFAULT_SETTINGS.providers },
        }
        storage.set(SETTINGS_KEY, model.value)
    }

    // ── 菜单配置 ──
    function loadMenuConfig(): MenuItemConfig[] {
        try {
            const saved = storage.getSync<MenuItemConfig[]>(MENU_SETTINGS_KEY)
            if (!saved) return DEFAULT_MENU_ITEMS.map((m) => ({ ...m }))
            // Merge: add new items, remove obsolete items
            const savedKeys = new Set(saved.map((m) => m.key))
            const result: MenuItemConfig[] = saved.map((m) => ({ ...m }))
            for (const def of DEFAULT_MENU_ITEMS) {
                if (!savedKeys.has(def.key)) {
                    result.push({ ...def, order: result.length })
                }
            }
            return result.filter((m) =>
                DEFAULT_MENU_ITEMS.some((d) => d.key === m.key),
            )
        } catch {
            return DEFAULT_MENU_ITEMS.map((m) => ({ ...m }))
        }
    }

    const menuConfig = ref<MenuItemConfig[]>(loadMenuConfig())

    const sortedMenuItems = computed(() =>
        [...menuConfig.value].sort((a, b) => a.order - b.order),
    )

    function toggleMenuItem(key: string) {
        const item = menuConfig.value.find((m) => m.key === key)
        if (item) item.visible = !item.visible
        saveMenuConfig()
    }

    function moveMenuItem(key: string, direction: 'up' | 'down') {
        const sorted = sortedMenuItems.value
        const idx = sorted.findIndex((m) => m.key === key)
        if (idx < 0) return
        const swapIdx = direction === 'up' ? idx - 1 : idx + 1
        if (swapIdx < 0 || swapIdx >= sorted.length) return
        // Swap order values
        const a = menuConfig.value.find((m) => m.key === sorted[idx].key)!
        const b = menuConfig.value.find((m) => m.key === sorted[swapIdx].key)!
        const tmpOrder = a.order
        a.order = b.order
        b.order = tmpOrder
        saveMenuConfig()
    }

    function saveMenuConfig() {
        storage.set(MENU_SETTINGS_KEY, menuConfig.value)
    }

    function resetMenuConfig() {
        menuConfig.value = DEFAULT_MENU_ITEMS.map((m) => ({ ...m }))
        saveMenuConfig()
    }

    // ── 基金收益率列配置 ──
    function loadFundColumns(): Record<string, boolean> {
        try {
            const saved =
                storage.getSync<Record<string, boolean>>(FUND_COLUMNS_KEY)
            if (saved && typeof saved === 'object') {
                // 合并默认值，确保新增字段使用 DEFAULT_FUND_COLUMNS 中的默认值
                const result: Record<string, boolean> = {}
                for (const col of FUND_YIELD_COLUMNS) {
                    result[col.key] =
                        saved[col.key] ?? DEFAULT_FUND_COLUMNS[col.key] ?? false
                }
                return result
            }
        } catch {}
        return { ...DEFAULT_FUND_COLUMNS }
    }

    const fundColumns = ref<Record<string, boolean>>(loadFundColumns())

    function toggleFundColumn(key: string) {
        fundColumns.value[key] = !fundColumns.value[key]
        saveFundColumns()
    }

    function resetFundColumns() {
        fundColumns.value = { ...DEFAULT_FUND_COLUMNS }
        saveFundColumns()
    }

    function saveFundColumns() {
        storage.set(FUND_COLUMNS_KEY, fundColumns.value)
    }

    return {
        model,
        providerLabel,
        providerOptions,
        availableModels,
        setProvider,
        updateProviderConfig,
        toggleModel,
        addCustomModel,
        addCustomProvider,
        removeCustomProvider,
        save,
        saveCurrentConfig,
        reset,
        menuConfig,
        sortedMenuItems,
        toggleMenuItem,
        moveMenuItem,
        resetMenuConfig,
        fundColumns,
        toggleFundColumn,
        resetFundColumns,
    }
})
