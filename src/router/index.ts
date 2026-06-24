import { createRouter, createWebHashHistory, type RouteRecordRaw } from "vue-router";
import { useAuthStore } from "../stores/auth";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: "/gold",
  },
  {
    path: "/gold",
    name: "Gold",
    component: () => import("../pages/GoldPage.vue"),
    meta: { title: "黄金行情" },
  },
  {
    path: "/stock",
    name: "Stock",
    component: () => import("../pages/StockPage.vue"),
    meta: { title: "股票行情" },
  },
  {
    path: "/stock/:key",
    name: "StockDetail",
    component: () => import("../pages/StockDetailPage.vue"),
    meta: { title: "大盘详情" },
  },
  {
    path: "/fund",
    name: "Fund",
    component: () => import("../pages/FundPage.vue"),
    meta: { title: "基金排行" },
  },
  {
    path: "/fund/:code",
    name: "FundDetail",
    component: () => import("../pages/FundDetailPage.vue"),
    meta: { title: "基金详情" },
  },
  {
    path: "/learn",
    name: "Learn",
    component: () => import("../pages/LearnPage.vue"),
    meta: { title: "认知学习", requiresAuth: true },
  },
  {
    path: "/ai",
    name: "AI",
    component: () => import("../pages/AIPage.vue"),
    meta: { title: "AI分析", requiresAuth: true },
  },
  {
    path: "/ai/:id",
    name: "AIConversation",
    component: () => import("../pages/AIPage.vue"),
    meta: { title: "AI分析", requiresAuth: true },
  },
  {
    path: "/profile",
    name: "Profile",
    component: () => import("../pages/ProfilePage.vue"),
    meta: { title: "个人中心", requiresAuth: true },
  },
  {
    path: "/settings",
    name: "Settings",
    component: () => import("../pages/SettingsPage.vue"),
    meta: { title: "系统设置", requiresAuth: true },
  },
  {
    path: "/notifications",
    name: "Notifications",
    component: () => import("../pages/NotificationsPage.vue"),
    meta: { title: "推送通知", requiresAuth: true },
  },
  {
    path: "/feature-control",
    name: "FeatureControl",
    component: () => import("../pages/FeatureControlPage.vue"),
    meta: { title: "功能控制", requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

// 全局路由守卫
router.beforeEach((to, _from, next) => {
  if (to.meta.requiresAuth) {
    const authStore = useAuthStore();
    if (!authStore.isAuthenticated) {
      authStore.pendingAuthRoute = to.fullPath;
      next({ path: "/gold", query: { auth: "required" } });
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;