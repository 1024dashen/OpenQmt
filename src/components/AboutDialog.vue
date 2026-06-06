<template>
  <n-modal
    :show="show"
    :mask-closable="true"
    :close-on-esc="true"
    @update:show="$emit('update:show', $event)"
  >
    <div class="about-dialog">
      <div class="about-logo">
        <span class="about-logo-letter">Q</span>
      </div>
      <h2 class="about-title">OpenQmt</h2>
      <p class="about-version">版本 0.1.0</p>
      <p class="about-desc">
        OpenQmt 是一款开源金融信息桌面应用，提供黄金、股票、基金行情，以及 AI 辅助投资分析能力。
      </p>
      <div class="about-info">
        <div class="info-row">
          <span class="info-label">技术栈</span>
          <span class="info-value">Vue 3 · Tauri 2 · Naive UI</span>
        </div>
        <div class="info-row">
          <span class="info-label">行情数据</span>
          <span class="info-value">东方财富公开接口</span>
        </div>
      </div>
      <p class="about-note">投资有风险，AI 分析仅供参考，不构成投资建议。</p>
      <n-button block type="primary" @click="emit('update:show', false)">
        知道了
      </n-button>
    </div>
  </n-modal>
</template>

<script setup lang="ts">
import { NModal, NButton } from "naive-ui";

defineProps<{ show: boolean }>();
const emit = defineEmits<{ "update:show": [value: boolean] }>();
</script>

<style scoped>
.about-dialog {
  width: 400px;
  max-width: calc(100vw - 32px);
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  padding: 32px 28px 24px;
  box-shadow: var(--shadow-card);
  border: 1px solid var(--border-subtle);
  text-align: center;
}

.about-logo {
  width: 52px;
  height: 52px;
  border-radius: var(--radius-md);
  background: var(--gold-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 14px;
}

.about-logo-letter {
  font-size: 26px;
  font-weight: 700;
  color: #fff;
}

.about-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.about-version {
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: 16px;
}

.about-desc {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 20px;
  text-align: left;
}

.about-info {
  background: var(--surface-muted);
  border-radius: var(--radius-md);
  padding: 12px 14px;
  margin-bottom: 16px;
  text-align: left;
}

.info-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 6px 0;
  font-size: 13px;
}

.info-row + .info-row {
  border-top: 1px solid var(--border-subtle);
}

.info-label {
  color: var(--text-muted);
  flex-shrink: 0;
}

.info-value {
  color: var(--text-primary);
  text-align: right;
}

.about-note {
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: 16px;
  line-height: 1.5;
}
</style>
