<template>
    <n-config-provider
        :theme="naiveTheme"
        :theme-overrides="currentThemeOverrides"
    >
        <n-message-provider>
            <n-layout :has-sider="!isMobile" style="height: 100vh">
                <n-layout-sider
                    v-if="!isMobile"
                    v-model:collapsed="collapsed"
                    collapse-mode="width"
                    :collapsed-width="64"
                    :width="220"
                    show-trigger
                    :bordered="false"
                    class="app-sidebar"
                >
                    <div class="logo-area" @click="backToMain">
                        <div class="logo-icon-wrap">
                            <span class="logo-letter">Q</span>
                        </div>
                        <div class="logo-text-wrap" v-show="!collapsed">
                            <span class="logo-text">OpenQmt</span>
                            <span class="logo-sub">金融信息平台</span>
                        </div>
                    </div>
                    <div class="sidebar-divider"></div>
                    <n-menu
                        v-model:value="activeKey"
                        :collapsed="collapsed"
                        :collapsed-width="64"
                        :collapsed-icon-size="20"
                        :options="
                            isInSettingsArea ? settingsMenuOptions : menuOptions
                        "
                        :indent="20"
                    />
                </n-layout-sider>
                <n-layout class="app-main">
                    <n-layout-header :bordered="false" class="app-header">
                        <div class="header-left">
                            <n-button
                                v-if="
                                    !isMobile &&
                                    (isInSettingsArea ||
                                        isFundDetailPage ||
                                        isStockDetailPage)
                                "
                                quaternary
                                circle
                                size="small"
                                class="back-btn"
                                @click="handleBack"
                            >
                                <template #icon>
                                    <n-icon size="18"
                                        ><ArrowBackOutline
                                    /></n-icon>
                                </template>
                            </n-button>
                            <n-button
                                v-if="isMobile"
                                quaternary
                                circle
                                size="small"
                                class="menu-toggle-btn"
                                @click="mobileSidebarOpen = true"
                            >
                                <template #icon>
                                    <n-icon size="20"><MenuOutline /></n-icon>
                                </template>
                            </n-button>
                            <span class="header-title">{{ currentTitle }}</span>
                            <PageToolbar v-if="showPageToolbar" />
                        </div>
                        <div class="header-right">
                            <span
                                class="header-time"
                                :class="{ 'header-time--compact': isMobile }"
                                >{{ currentTime }}</span
                            >
                            <!-- AI 页面助手 -->
                            <n-button
                                quaternary
                                circle
                                size="small"
                                @click="showAiAssistant = true"
                                class="ai-assistant-btn"
                                title="AI 页面助手"
                            >
                                <template #icon>
                                    <n-icon size="18"
                                        ><SparklesOutline
                                    /></n-icon>
                                </template>
                            </n-button>
                            <!-- 主题切换 -->
                            <n-button
                                quaternary
                                circle
                                size="small"
                                @click="themeStore.toggle"
                                class="theme-toggle-btn"
                            >
                                <template #icon>
                                    <n-icon size="18">
                                        <SunnyOutline
                                            v-if="themeStore.isDark"
                                        />
                                        <MoonOutline v-else />
                                    </n-icon>
                                </template>
                            </n-button>
                            <!-- 未登录 -->
                            <template v-if="!authStore.isAuthenticated">
                                <n-button
                                    size="small"
                                    type="primary"
                                    ghost
                                    @click="showAuthDialog = true"
                                    class="login-btn"
                                >
                                    <template #icon>
                                        <n-icon :component="LogInOutline" />
                                    </template>
                                    登录
                                </n-button>
                            </template>
                            <!-- 已登录 -->
                            <template v-else>
                                <n-dropdown
                                    :options="userDropdownOptions"
                                    @select="handleUserDropdown"
                                >
                                    <div class="user-area">
                                        <n-avatar
                                            v-if="authStore.user?.avatar_url"
                                            :src="authStore.user.avatar_url"
                                            :size="28"
                                            round
                                        />
                                        <n-avatar
                                            v-else
                                            :size="28"
                                            round
                                            class="user-avatar-default"
                                        >
                                            {{
                                                authStore.user?.nickname
                                                    ?.charAt(0)
                                                    ?.toUpperCase() || 'U'
                                            }}
                                        </n-avatar>
                                        <span
                                            class="user-name"
                                            v-if="!isMobile"
                                            >{{
                                                authStore.user?.nickname ||
                                                authStore.user?.email
                                            }}</span
                                        >
                                        <n-icon
                                            size="14"
                                            color="var(--text-muted)"
                                            ><ChevronDownOutline
                                        /></n-icon>
                                    </div>
                                </n-dropdown>
                            </template>
                        </div>
                    </n-layout-header>
                    <n-layout-content
                        class="app-content"
                        :class="{ 'app-content--fill': activeKey === 'ai' }"
                    >
                        <router-view />
                    </n-layout-content>
                </n-layout>
            </n-layout>

            <!-- 移动端侧栏抽屉 -->
            <n-drawer
                v-model:show="mobileSidebarOpen"
                :width="260"
                placement="left"
                class="mobile-sidebar-drawer"
            >
                <div class="mobile-drawer-inner">
                    <div class="logo-area" @click="backToMain">
                        <div class="logo-icon-wrap">
                            <span class="logo-letter">Q</span>
                        </div>
                        <div class="logo-text-wrap">
                            <span class="logo-text">OpenQmt</span>
                            <span class="logo-sub">金融信息平台</span>
                        </div>
                    </div>
                    <div class="sidebar-divider"></div>
                    <n-menu
                        v-model:value="activeKey"
                        :options="
                            isInSettingsArea ? settingsMenuOptions : menuOptions
                        "
                        :indent="20"
                    />
                </div>
            </n-drawer>

            <!-- 登录/注册对话框 -->
            <AuthDialog v-model:show="showAuthDialog" />
            <SettingsDialog v-model:show="showSettingsDialog" />
            <AboutDialog v-model:show="showAboutDialog" />
            <AiAssistantOverlay v-model:show="showAiAssistant" />
        </n-message-provider>
    </n-config-provider>
</template>

<script setup lang="ts">
import { ref, computed, h, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { darkTheme, NIcon, type GlobalThemeOverrides } from 'naive-ui'
import type { MenuOption, DropdownOption } from 'naive-ui'
import {
    FlashOutline,
    TrendingUpOutline,
    WalletOutline,
    BookOutline,
    SparklesOutline,
    LogInOutline,
    LogOutOutline,
    PersonOutline,
    LockClosedOutline,
    ChevronDownOutline,
    SunnyOutline,
    MoonOutline,
    MenuOutline,
    SettingsOutline,
    InformationCircleOutline,
    NotificationsOutline,
    ArrowBackOutline,
    AddOutline,
    CloseOutline,
    ChatbubbleOutline,
} from '@vicons/ionicons5'
import router from './router'
import { useBreakpoint } from './composables/useBreakpoint'
import { useGoldStore } from './stores/gold'
import { useStockStore } from './stores/stock'
import { useFundStore } from './stores/fund'
import { useAuthStore } from './stores/auth'
import { useThemeStore } from './stores/theme'
import { useAiStore } from './stores/ai'
import { useSettingsStore } from './stores/settings'
import AuthDialog from './components/AuthDialog.vue'
import SettingsDialog from './components/SettingsDialog.vue'
import AboutDialog from './components/AboutDialog.vue'
import PageToolbar from './components/PageToolbar.vue'
import AiAssistantOverlay from './components/AiAssistantOverlay.vue'

const route = useRoute()
const goldStore = useGoldStore()
const stockStore = useStockStore()
const fundStore = useFundStore()
const authStore = useAuthStore()
const themeStore = useThemeStore()
const aiStore = useAiStore()
const settingsStore = useSettingsStore()
const { isMobile } = useBreakpoint()
const activeKey = ref<string>('')
const collapsed = ref(false)
const mobileSidebarOpen = ref(false)
const currentTime = ref('')
const showAuthDialog = ref(false)
const showSettingsDialog = ref(false)
const showAboutDialog = ref(false)
const showAiAssistant = ref(false)
let timer: ReturnType<typeof setInterval> | null = null

// Compute the first visible menu key from settings store
const firstVisibleKey = computed(() => {
    const visible = settingsStore.sortedMenuItems.find(
        (m: { visible: boolean }) => m.visible,
    )
    return visible?.key ?? 'gold'
})

// 设置区域菜单状态
const isInSettingsArea = computed(() => {
    return ['profile', 'settings', 'notifications', 'feature-control'].includes(
        activeKey.value,
    )
})

const isFundDetailPage = computed(() => route.path.startsWith('/fund/'))
const isStockDetailPage = computed(() => route.path.startsWith('/stock/'))

// ── Naive UI 主题 ──
const naiveTheme = computed(() => (themeStore.isDark ? darkTheme : null))

const darkThemeOverrides: GlobalThemeOverrides = {
    common: {
        primaryColor: '#d4a843',
        primaryColorHover: '#e0b85a',
        primaryColorPressed: '#b8922e',
        borderRadius: '12px',
        fontSize: '14px',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        bodyColor: '#282c34',
        cardColor: '#2c313a',
        modalColor: '#2c313a',
        popoverColor: '#353b45',
        borderColor: 'rgba(255,255,255,0.08)',
        textColor1: '#abb2bf',
        textColor2: '#9198a3',
        textColor3: '#636d83',
    },
    Card: {
        color: '#2c313a',
        borderColor: 'rgba(255,255,255,0.08)',
        borderRadius: '16px',
    },
    Menu: {
        itemTextColor: '#9198a3',
        itemTextColorHover: '#abb2bf',
        itemTextColorActive: '#d4a843',
        itemIconColor: '#636d83',
        itemIconColorHover: '#abb2bf',
        itemIconColorActive: '#d4a843',
        itemColorActive: 'rgba(212, 168, 67, 0.12)',
        itemColorActiveHover: 'rgba(212, 168, 67, 0.16)',
        itemColorHover: 'rgba(255,255,255,0.06)',
        borderRadius: '10px',
        itemHeight: '42px',
    },
    Button: { borderRadiusMedium: '10px', borderRadiusSmall: '8px' },
    Tag: { borderRadius: '6px' },
    DataTable: { borderRadius: '16px' },
    Switch: { railColorActive: '#d4a843' },
}

const lightThemeOverrides: GlobalThemeOverrides = {
    common: {
        primaryColor: '#b8922e',
        primaryColorHover: '#c9a23a',
        primaryColorPressed: '#9a7a20',
        borderRadius: '12px',
        fontSize: '14px',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        cardColor: '#ffffff',
        modalColor: '#ffffff',
        borderColor: 'rgba(0,0,0,0.06)',
    },
    Card: {
        color: '#ffffff',
        borderColor: 'rgba(0,0,0,0.06)',
        borderRadius: '16px',
    },
    Menu: {
        itemTextColor: '#4b5563',
        itemTextColorHover: '#111827',
        itemTextColorActive: '#b8922e',
        itemIconColor: '#9ca3af',
        itemIconColorHover: '#111827',
        itemIconColorActive: '#b8922e',
        itemColorActive: 'rgba(184, 146, 46, 0.08)',
        itemColorActiveHover: 'rgba(184, 146, 46, 0.12)',
        itemColorHover: 'rgba(0,0,0,0.03)',
        borderRadius: '10px',
        itemHeight: '42px',
    },
    Button: { borderRadiusMedium: '10px', borderRadiusSmall: '8px' },
    Tag: { borderRadius: '6px' },
    DataTable: { borderRadius: '16px' },
    Switch: { railColorActive: '#b8922e' },
}

const currentThemeOverrides = computed(() =>
    themeStore.isDark ? darkThemeOverrides : lightThemeOverrides,
)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const renderIcon = (icon: any) => () =>
    h(NIcon, { size: 18 }, { default: () => h(icon) })

const renderLabelWithLock = (label: string, requiresAuth: boolean) => {
    if (requiresAuth && !authStore.isAuthenticated) {
        return () =>
            h('div', { style: 'display:flex;align-items:center;gap:6px' }, [
                h('span', label),
                h(
                    NIcon,
                    { size: 12, color: 'var(--text-muted)' },
                    { default: () => h(LockClosedOutline) },
                ),
            ])
    }
    return label
}

const menuOptions = computed<MenuOption[]>(() => {
    const visibleKeys = new Set(
        settingsStore.sortedMenuItems
            .filter((m: { visible: boolean; key: string }) => m.visible)
            .map((m: { key: string }) => m.key),
    )
    const orderMap = new Map(
        settingsStore.sortedMenuItems.map(
            (m: { key: string; order: number }) =>
                [m.key, m.order] as [string, number],
        ),
    )

    const allItems: MenuOption[] = [
        { label: '黄金行情', key: 'gold', icon: renderIcon(FlashOutline) },
        {
            label: '股票行情',
            key: 'stock',
            icon: renderIcon(TrendingUpOutline),
        },
        { label: '基金排行', key: 'fund', icon: renderIcon(WalletOutline) },
        {
            label: renderLabelWithLock('认知学习', true),
            key: 'learn',
            icon: renderIcon(BookOutline),
        },
        {
            label: renderLabelWithLock('AI 分析', true),
            key: 'ai',
            icon: renderIcon(SparklesOutline),
            children: [
                {
                    label: '新建对话',
                    key: 'ai-new',
                    icon: renderIcon(AddOutline),
                },
                ...aiStore.sortedConversations.map((conv) => ({
                    label: () =>
                        h(
                            'div',
                            {
                                style: 'display:flex;align-items:center;justify-content:space-between;width:100%;gap:4px',
                                onClick: (e: MouseEvent) => {
                                    e.stopPropagation()
                                },
                            },
                            [
                                h(
                                    'span',
                                    {
                                        style: 'overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;min-width:0',
                                        onClick: () => {
                                            aiStore.switchConversation(conv.id)
                                            router.push(`/ai/${conv.id}`)
                                        },
                                    },
                                    conv.title,
                                ),
                                h(
                                    NIcon,
                                    {
                                        size: 14,
                                        color: 'var(--text-muted)',
                                        style: 'flex-shrink:0;cursor:pointer;',
                                        onClick: (e: MouseEvent) => {
                                            e.stopPropagation()
                                            aiStore.deleteConversation(conv.id)
                                        },
                                    },
                                    { default: () => h(CloseOutline) },
                                ),
                            ],
                        ),
                    key: `ai-conv-${conv.id}`,
                    icon: renderIcon(ChatbubbleOutline),
                })),
            ],
        },
    ]

    return allItems
        .filter((item) => visibleKeys.has(item.key as string))
        .sort(
            (a, b) =>
                (orderMap.get(a.key as string) ?? 99) -
                (orderMap.get(b.key as string) ?? 99),
        )
})

// 设置区域菜单
const settingsMenuOptions = computed<MenuOption[]>(() => [
    { label: '个人中心', key: 'profile', icon: renderIcon(PersonOutline) },
    { label: '系统设置', key: 'settings', icon: renderIcon(SettingsOutline) },
    {
        label: '推送通知',
        key: 'notifications',
        icon: renderIcon(NotificationsOutline),
    },
    {
        label: '功能控制',
        key: 'feature-control',
        icon: renderIcon(SettingsOutline),
    },
])

const userDropdownOptions: DropdownOption[] = [
    { label: '个人中心', key: 'profile', icon: renderIcon(PersonOutline) },
    { label: '系统设置', key: 'settings', icon: renderIcon(SettingsOutline) },
    {
        label: '关于我们',
        key: 'about',
        icon: renderIcon(InformationCircleOutline),
    },
    { type: 'divider' },
    { label: '退出登录', key: 'logout', icon: renderIcon(LogOutOutline) },
]

async function handleUserDropdown(key: string) {
    if (key === 'logout') {
        await authStore.logout()
    } else if (key === 'profile') {
        router.push('/profile')
    } else if (key === 'settings') {
        router.push('/settings')
    } else if (key === 'about') {
        showAboutDialog.value = true
    }
}

function backToMain() {
    router.push(`/${firstVisibleKey.value}`)
}

function handleBack() {
    if (isFundDetailPage.value) {
        router.push('/fund')
        return
    }
    if (isStockDetailPage.value) {
        router.push('/stock')
        return
    }
    backToMain()
}

const titleMap: Record<string, string> = {
    gold: '黄金行情',
    stock: '股票行情',
    fund: '基金排行',
    learn: '认知学习',
    ai: 'AI 分析',
    profile: '个人中心',
    'feature-control': '功能控制',
}

const currentTitle = computed(() => {
    if (isFundDetailPage.value) {
        const name = route.query.name
        return typeof name === 'string' && name ? name : '基金详情'
    }
    if (isStockDetailPage.value) {
        const name = route.query.name
        return typeof name === 'string' && name ? name : '大盘详情'
    }
    return titleMap[activeKey.value] || '个人中心'
})

const showPageToolbar = computed(() => {
    if (isFundDetailPage.value || isStockDetailPage.value) return false
    return ['gold', 'stock', 'fund', 'learn', 'ai'].includes(activeKey.value)
})

const pageLoading = computed(() => {
    const key = activeKey.value
    if (key === 'gold') return goldStore.loading
    if (key === 'stock') return stockStore.loading
    if (key === 'fund') return fundStore.loading
    return false
})

const updateTime = () => {
    const now = new Date()
    currentTime.value = now.toLocaleString('zh-CN', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    })
}

watch(
    () => route.path,
    (path) => {
        if (path.startsWith('/ai')) {
            activeKey.value = 'ai'
            return
        }
        if (path.startsWith('/fund/')) {
            activeKey.value = 'fund'
            return
        }
        if (path.startsWith('/stock/')) {
            activeKey.value = 'stock'
            return
        }
        const key = path.replace('/', '') || firstVisibleKey.value
        if (
            [
                'gold',
                'stock',
                'fund',
                'learn',
                'ai',
                'profile',
                'settings',
                'notifications',
                'feature-control',
            ].includes(key)
        ) {
            activeKey.value = key
        } else {
            activeKey.value = firstVisibleKey.value
        }
    },
    { immediate: true },
)

watch(activeKey, (key) => {
    // AI 子菜单的特殊处理
    if (key === 'ai-new') {
        aiStore.currentConversationId = null
        router.push('/ai')
        activeKey.value = 'ai'
        if (isMobile.value) {
            mobileSidebarOpen.value = false
        }
        return
    }
    if (key?.startsWith('ai-conv-')) {
        const convId = key.replace('ai-conv-', '')
        aiStore.switchConversation(convId)
        router.push(`/ai/${convId}`)
        activeKey.value = 'ai'
        if (isMobile.value) {
            mobileSidebarOpen.value = false
        }
        return
    }
    if (route.path !== `/${key}`) {
        router.push(`/${key}`)
    }
    if (isMobile.value) {
        mobileSidebarOpen.value = false
    }
})

watch(
    () => route.query.auth,
    (auth) => {
        if (auth === 'required') {
            showAuthDialog.value = true
        }
    },
    { immediate: true },
)

watch(
    () => authStore.isAuthenticated,
    (isAuth) => {
        if (isAuth && authStore.pendingAuthRoute) {
            const target = authStore.pendingAuthRoute
            authStore.pendingAuthRoute = null
            router.push(target)
            showAuthDialog.value = false
        }
    },
)

onMounted(async () => {
    updateTime()
    timer = setInterval(updateTime, 1000)
    themeStore.init()
    await authStore.checkAuth()
})

onUnmounted(() => {
    if (timer) clearInterval(timer)
})
</script>

<style scoped>
.app-sidebar {
    background: var(--bg-sidebar) !important;
    border-right: 1px solid var(--sidebar-border);
    transition: background 0.3s ease;
}

.app-sidebar :deep(.n-layout-toggle-button) {
    opacity: 0;
    transition: opacity 0.25s ease;
}

.app-sidebar:hover :deep(.n-layout-toggle-button) {
    opacity: 1;
}

.logo-area {
    display: flex;
    align-items: center;
    padding: 18px 16px 14px;
    gap: 12px;
    overflow: hidden;
    white-space: nowrap;
    cursor: pointer;
    transition: background var(--transition-fast);
}

.logo-area:hover {
    background: var(--user-hover-bg);
}

.logo-icon-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    background: var(--gold-primary);
    border-radius: var(--radius-sm);
    flex-shrink: 0;
}

.logo-letter {
    color: #fff;
    font-size: 20px;
    font-weight: 800;
    font-family: 'Inter', sans-serif;
    letter-spacing: -1px;
}

.logo-text-wrap {
    display: flex;
    flex-direction: column;
    gap: 1px;
}

.logo-text {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
    letter-spacing: -0.02em;
}

.logo-sub {
    font-size: 11px;
    color: var(--text-muted);
    letter-spacing: 0.02em;
}

.sidebar-divider {
    height: 1px;
    margin: 0 16px 10px;
    background: var(--border-subtle);
}

.app-main {
    background: var(--bg-primary);
    transition: background 0.3s ease;
    min-width: 0;
    flex: 1 1 0;
}

.app-header {
    height: var(--header-height);
    padding: var(--header-padding);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border-subtle);
    backdrop-filter: blur(16px) saturate(1.2);
    -webkit-backdrop-filter: blur(16px) saturate(1.2);
    transition: background var(--transition-normal);
    min-width: 0;
}

.header-left {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
    flex: 1;
}

.header-left :deep(.header-toolbar) {
    margin-left: 4px;
    flex: 1;
    min-width: 0;
}

.back-btn {
    color: var(--text-muted) !important;
    flex-shrink: 0;
    transition: color 0.2s;
}

.back-btn:hover {
    color: var(--gold-primary) !important;
}

.menu-toggle-btn {
    color: var(--text-muted) !important;
    flex-shrink: 0;
}

.menu-toggle-btn:hover {
    color: var(--gold-primary) !important;
}

.header-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
    letter-spacing: -0.02em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

@media (max-width: 480px) {
    .header-title {
        font-size: 15px;
    }
}

.header-badge {
    font-size: 11px;
    font-weight: 500;
    color: var(--gold-primary);
    background: rgba(212, 168, 67, 0.1);
    padding: 3px 8px;
    border-radius: 100px;
}

.header-right {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
    flex-shrink: 1;
}

@media (max-width: 480px) {
    .header-right {
        gap: 6px;
    }
}

@media (max-width: 420px) {
    .login-btn :deep(.n-button__content) {
        display: none;
    }

    .login-btn {
        padding: 0 !important;
        width: 28px;
    }
}

.theme-toggle-btn {
    color: var(--text-muted) !important;
    transition: color 0.2s;
}

.theme-toggle-btn:hover {
    color: var(--gold-primary) !important;
}

.ai-assistant-btn {
    color: var(--text-muted) !important;
    transition:
        color 0.2s,
        background 0.2s;
}

.ai-assistant-btn:hover {
    color: var(--gold-primary) !important;
    background: rgba(212, 168, 67, 0.08) !important;
}

.login-btn {
    font-size: 13px;
}

.user-area {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    padding: 4px 10px 4px 4px;
    border-radius: 100px;
    border: 1px solid var(--border-subtle);
    transition:
        background var(--transition-fast),
        border-color var(--transition-fast);
}

.user-area:hover {
    background: var(--user-hover-bg);
}

.user-avatar-default {
    background: linear-gradient(
        135deg,
        var(--gold-primary),
        var(--gold-dark)
    ) !important;
    color: #fff !important;
    font-weight: 700;
    font-size: 13px;
}

.user-name {
    font-size: 13px;
    color: var(--text-primary);
    max-width: 100px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.header-time {
    color: var(--text-muted);
    font-size: 12px;

    letter-spacing: 0.02em;
    white-space: nowrap;
    padding: 4px 10px;
}

.header-time--compact {
    font-size: 11px;
    letter-spacing: 0;
}

@media (max-width: 380px) {
    .header-time {
        display: none;
    }
}

.app-content {
    height: calc(100vh - var(--header-height));
    padding: 0;
    background: var(--bg-primary);
    overflow-y: auto;
    overflow-x: hidden;
    transition: background 0.3s ease;
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-width: 100%;
}

.app-content--fill {
    overflow: hidden;
}

.app-content--fill :deep(.n-layout-scroll-container) {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
}

.mobile-drawer-inner {
    background: var(--bg-sidebar);
    min-height: 100%;
    padding-bottom: 24px;
}

:deep(.mobile-sidebar-drawer .n-drawer-body-content-wrapper) {
    padding: 0 !important;
}
</style>
