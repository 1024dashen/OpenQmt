<template>
  <n-config-provider :theme="naiveTheme" :theme-overrides="currentThemeOverrides">
    <n-message-provider>
      <n-layout has-sider style="height: 100vh">
        <n-layout-sider
          collapse-mode="width"
          :collapsed-width="64"
          :width="220"
          show-trigger
          :bordered="false"
          class="app-sidebar"
        >
          <div class="logo-area">
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
            :options="menuOptions"
            :indent="20"
            @update:collapsed="collapsed = $event"
          />
        </n-layout-sider>
        <n-layout class="app-main">
          <n-layout-header :bordered="false" class="app-header">
            <div class="header-left">
              <span class="header-title">{{ currentTitle }}</span>
              <span class="header-badge" v-if="store.loading">更新中...</span>
            </div>
            <div class="header-right">
              <span class="header-time">{{ currentTime }}</span>
              <!-- 主题切换 -->
              <n-button quaternary circle size="small" @click="themeStore.toggle" class="theme-toggle-btn">
                <template #icon>
                  <n-icon size="18">
                    <SunnyOutline v-if="themeStore.isDark" />
                    <MoonOutline v-else />
                  </n-icon>
                </template>
              </n-button>
              <!-- 未登录 -->
              <template v-if="!authStore.isAuthenticated">
                <n-button size="small" type="primary" ghost @click="showAuthDialog = true" class="login-btn">
                  <template #icon>
                    <n-icon :component="LogInOutline" />
                  </template>
                  登录
                </n-button>
              </template>
              <!-- 已登录 -->
              <template v-else>
                <n-dropdown :options="userDropdownOptions" @select="handleUserDropdown">
                  <div class="user-area">
                    <n-avatar
                      v-if="authStore.user?.avatar_url"
                      :src="authStore.user.avatar_url"
                      :size="28"
                      round
                    />
                    <n-avatar v-else :size="28" round class="user-avatar-default">
                      {{ authStore.user?.nickname?.charAt(0)?.toUpperCase() || 'U' }}
                    </n-avatar>
                    <span class="user-name">{{ authStore.user?.nickname || authStore.user?.email }}</span>
                    <n-icon size="14" color="var(--text-muted)"><ChevronDownOutline /></n-icon>
                  </div>
                </n-dropdown>
              </template>
            </div>
          </n-layout-header>
          <n-layout-content
            content-style="padding: 24px 28px;"
            class="app-content"
          >
            <router-view />
          </n-layout-content>
        </n-layout>
      </n-layout>

      <!-- 登录/注册对话框 -->
      <AuthDialog v-model:show="showAuthDialog" />
    </n-message-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { ref, computed, h, onMounted, onUnmounted, watch } from "vue";
import { useRoute } from "vue-router";
import { darkTheme, NIcon, type GlobalThemeOverrides } from "naive-ui";
import type { MenuOption, DropdownOption } from "naive-ui";
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
} from "@vicons/ionicons5";
import router from "./router";
import { useGoldStore } from "./stores/gold";
import { useAuthStore } from "./stores/auth";
import { useThemeStore } from "./stores/theme";
import AuthDialog from "./components/AuthDialog.vue";

const route = useRoute();
const goldStore = useGoldStore();
const authStore = useAuthStore();
const themeStore = useThemeStore();
const store = goldStore;
const activeKey = ref<string>("gold");
const collapsed = ref(false);
const currentTime = ref("");
const showAuthDialog = ref(false);
let timer: ReturnType<typeof setInterval> | null = null;

// ── Naive UI 主题 ──
const naiveTheme = computed(() => themeStore.isDark ? darkTheme : null);

const darkThemeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: "#d4a843",
    primaryColorHover: "#e8c46a",
    primaryColorPressed: "#b8922e",
    borderRadius: "10px",
    fontSize: "14px",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  Card: {
    color: "#1a2332",
    borderColor: "rgba(255,255,255,0.06)",
    borderRadius: "12px",
  },
  Menu: {
    itemTextColor: "#a0aec0",
    itemTextColorHover: "#d4a843",
    itemTextColorActive: "#e8c46a",
    itemIconColor: "#636e80",
    itemIconColorHover: "#d4a843",
    itemIconColorActive: "#e8c46a",
    itemColorActive: "rgba(212, 168, 67, 0.08)",
    itemColorActiveHover: "rgba(212, 168, 67, 0.12)",
    itemHeight: "44px",
  },
  Button: { borderRadiusMedium: "8px" },
  Tag: { borderRadius: "6px" },
  DataTable: { borderRadius: "12px" },
};

const lightThemeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: "#b8922e",
    primaryColorHover: "#d4a843",
    primaryColorPressed: "#9a7a20",
    borderRadius: "10px",
    fontSize: "14px",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  Card: {
    color: "#ffffff",
    borderColor: "rgba(0,0,0,0.08)",
    borderRadius: "12px",
  },
  Menu: {
    itemTextColor: "#4a5568",
    itemTextColorHover: "#b8922e",
    itemTextColorActive: "#9a7a20",
    itemIconColor: "#a0aec0",
    itemIconColorHover: "#b8922e",
    itemIconColorActive: "#9a7a20",
    itemColorActive: "rgba(184, 146, 46, 0.08)",
    itemColorActiveHover: "rgba(184, 146, 46, 0.12)",
    itemHeight: "44px",
  },
  Button: { borderRadiusMedium: "8px" },
  Tag: { borderRadius: "6px" },
  DataTable: { borderRadius: "12px" },
};

const currentThemeOverrides = computed(() =>
  themeStore.isDark ? darkThemeOverrides : lightThemeOverrides
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const renderIcon = (icon: any) => () =>
  h(NIcon, { size: 18 }, { default: () => h(icon) });

const renderLabelWithLock = (label: string, requiresAuth: boolean) => {
  if (requiresAuth && !authStore.isAuthenticated) {
    return () =>
      h("div", { style: "display:flex;align-items:center;gap:6px" }, [
        h("span", label),
        h(NIcon, { size: 12, color: "var(--text-muted)" }, { default: () => h(LockClosedOutline) }),
      ]);
  }
  return label;
};

const menuOptions = computed<MenuOption[]>(() => [
  { label: "黄金行情", key: "gold", icon: renderIcon(FlashOutline) },
  { label: "股票行情", key: "stock", icon: renderIcon(TrendingUpOutline) },
  { label: "基金排行", key: "fund", icon: renderIcon(WalletOutline) },
  { label: renderLabelWithLock("认知学习", true), key: "learn", icon: renderIcon(BookOutline) },
  { label: renderLabelWithLock("AI 分析", true), key: "ai", icon: renderIcon(SparklesOutline) },
]);

const userDropdownOptions: DropdownOption[] = [
  { label: "个人中心", key: "profile", icon: renderIcon(PersonOutline) },
  { type: "divider" },
  { label: "退出登录", key: "logout", icon: renderIcon(LogOutOutline) },
];

async function handleUserDropdown(key: string) {
  if (key === "logout") {
    await authStore.logout();
  } else if (key === "profile") {
    router.push("/profile");
  }
}

const titleMap: Record<string, string> = {
  gold: "黄金行情",
  stock: "股票行情",
  fund: "基金排行",
  learn: "认知学习",
  ai: "AI 分析",
  profile: "个人中心",
};

const currentTitle = computed(() => titleMap[activeKey.value] || "个人中心");

const updateTime = () => {
  const now = new Date();
  currentTime.value = now.toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

watch(
  () => route.path,
  (path) => {
    const key = path.replace("/", "") || "gold";
    if (["gold", "stock", "fund", "learn", "ai"].includes(key)) {
      activeKey.value = key;
    }
  },
  { immediate: true }
);

watch(activeKey, (key) => {
  if (route.path !== `/${key}`) {
    router.push(`/${key}`);
  }
});

watch(
  () => route.query.auth,
  (auth) => {
    if (auth === "required") {
      showAuthDialog.value = true;
    }
  },
  { immediate: true }
);

watch(
  () => authStore.isAuthenticated,
  (isAuth) => {
    if (isAuth && authStore.pendingAuthRoute) {
      const target = authStore.pendingAuthRoute;
      authStore.pendingAuthRoute = null;
      router.push(target);
      showAuthDialog.value = false;
    }
  }
);

onMounted(async () => {
  updateTime();
  timer = setInterval(updateTime, 1000);
  themeStore.init();
  await authStore.checkAuth();
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>

<style scoped>
.app-sidebar {
  background: var(--bg-sidebar) !important;
  border-right: 1px solid var(--sidebar-border);
  transition: background 0.3s ease;
}

.logo-area {
  display: flex;
  align-items: center;
  padding: 18px 16px 14px;
  gap: 12px;
  overflow: hidden;
  white-space: nowrap;
}

.logo-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  background: linear-gradient(135deg, #d4a843 0%, #e8c46a 50%, #b8922e 100%);
  border-radius: 10px;
  flex-shrink: 0;
  box-shadow: 0 2px 12px rgba(212, 168, 67, 0.35);
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
  font-size: 17px;
  font-weight: 700;
  color: var(--gold-primary);
  letter-spacing: 0.5px;
}

.logo-sub {
  font-size: 11px;
  color: var(--text-muted);
  letter-spacing: 1px;
}

.sidebar-divider {
  height: 1px;
  margin: 0 16px 8px;
  background: linear-gradient(90deg, var(--gold-primary) 0%, var(--border-subtle) 100%);
  opacity: 0.4;
}

.app-main {
  background: var(--bg-primary);
  transition: background 0.3s ease;
}

.app-header {
  height: 52px;
  padding: 0 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-subtle);
  backdrop-filter: blur(10px);
  transition: background 0.3s ease;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-title {
  font-size: 17px;
  font-weight: 600;
  color: var(--text-primary);
}

.header-badge {
  font-size: 11px;
  color: var(--gold-primary);
  background: rgba(212, 168, 67, 0.12);
  padding: 2px 8px;
  border-radius: 6px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.theme-toggle-btn {
  color: var(--text-muted) !important;
  transition: color 0.2s;
}

.theme-toggle-btn:hover {
  color: var(--gold-primary) !important;
}

.login-btn {
  font-size: 13px;
}

.user-area {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 8px;
  transition: background 0.2s;
}

.user-area:hover {
  background: var(--user-hover-bg);
}

.user-avatar-default {
  background: linear-gradient(135deg, var(--gold-primary), var(--gold-dark)) !important;
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
  font-size: 13px;
  font-family: 'JetBrains Mono', monospace;
  letter-spacing: 0.5px;
}

.app-content {
  height: calc(100vh - 52px);
  background: var(--bg-primary);
  overflow-y: auto;
  transition: background 0.3s ease;
}
</style>