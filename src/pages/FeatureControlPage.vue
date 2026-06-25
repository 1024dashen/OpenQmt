<template>
  <div class="feature-control-page">
    <!-- <div class="fc-header">
      <h2 class="page-title">功能控制</h2>
      <p class="page-subtitle">
        控制主页菜单的显示和排序，隐藏的菜单仍可通过设置区域访问
      </p>
    </div> -->

    <div class="fc-container">
      <div class="settings-card surface-card surface-card--flat">
        <div class="card-header">
          <n-icon size="20" color="var(--gold-primary)">
            <GridOutline />
          </n-icon>
          <span class="card-title">主页菜单</span>
        </div>
        <div class="card-body">
          <div class="menu-control-list">
            <div
              v-for="(item, idx) in sortedMenuItems"
              :key="item.key"
              class="menu-control-item"
            >
              <div class="menu-item-left">
                <n-switch
                  :value="item.visible"
                  @update:value="toggleMenuItem(item.key)"
                  size="small"
                />
                <span
                  class="menu-item-label"
                  :class="{ 'menu-item-label--disabled': !item.visible }"
                  >{{ item.label }}</span
                >
              </div>
              <div class="menu-item-right">
                <n-button
                  quaternary
                  circle
                  size="tiny"
                  :disabled="idx === 0"
                  @click="moveMenuItem(item.key, 'up')"
                >
                  <template #icon>
                    <n-icon size="14"><ChevronUpOutline /></n-icon>
                  </template>
                </n-button>
                <n-button
                  quaternary
                  circle
                  size="tiny"
                  :disabled="idx === sortedMenuItems.length - 1"
                  @click="moveMenuItem(item.key, 'down')"
                >
                  <template #icon>
                    <n-icon size="14"><ChevronDownOutline /></n-icon>
                  </template>
                </n-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="fc-actions">
        <n-button quaternary @click="resetMenuConfig">恢复默认</n-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { NIcon, NButton, NSwitch, useMessage } from "naive-ui";
import {
  GridOutline,
  ChevronUpOutline,
  ChevronDownOutline,
} from "@vicons/ionicons5";
import { useSettingsStore } from "../stores/settings";

const settingsStore = useSettingsStore();
const message = useMessage();

const sortedMenuItems = computed(() => settingsStore.sortedMenuItems);

function toggleMenuItem(key: string) {
  settingsStore.toggleMenuItem(key);
}

function moveMenuItem(key: string, direction: "up" | "down") {
  settingsStore.moveMenuItem(key, direction);
}

function resetMenuConfig() {
  settingsStore.resetMenuConfig();
  message.success("已恢复默认菜单配置");
}
</script>

<style scoped>
.feature-control-page {
  max-width: 100%;
  width: 100%;
  min-width: 0;
  padding: var(--content-padding);
}

.fc-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 6px 0;
  letter-spacing: -0.02em;
}

.page-subtitle {
  font-size: 13px;
  color: var(--text-muted);
  margin: 0;
}

.fc-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
}

.settings-card {
  padding: 24px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-subtle);
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  flex: 1;
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.menu-control-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.menu-control-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: var(--surface-muted);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  transition: background var(--transition-fast);
}

.menu-control-item:hover {
  background: var(--user-hover-bg);
}

.menu-item-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.menu-item-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  transition: color var(--transition-fast);
}

.menu-item-label--disabled {
  color: var(--text-muted);
}

.menu-item-right {
  display: flex;
  align-items: center;
  gap: 2px;
}

.fc-actions {
  display: flex;
  justify-content: flex-end;
  padding: 8px 0;
}

@media (max-width: 768px) {
  .settings-card {
    padding: 18px;
  }
}
</style>
