<template>
  <n-modal
    :show="show"
    :mask-closable="true"
    :close-on-esc="true"
    @update:show="$emit('update:show', $event)"
  >
    <div class="settings-dialog">
      <div class="settings-header">
        <h2 class="settings-title">系统设置</h2>
        <p class="settings-subtitle">配置 AI 分析使用的模型提供商</p>
      </div>

      <n-form class="settings-form" label-placement="top" :show-feedback="false">
        <n-form-item label="模型提供商">
          <n-select
            v-model:value="form.provider"
            :options="settingsStore.providerOptions"
            @update:value="onProviderChange"
          />
        </n-form-item>

        <n-form-item label="API Key" v-if="form.provider !== 'ollama'">
          <n-input
            v-model:value="form.apiKey"
            type="password"
            show-password-on="click"
            placeholder="请输入 API Key（仅保存在本地）"
          />
        </n-form-item>

        <n-form-item
          label="API 地址"
          v-if="form.provider === 'custom' || form.provider === 'ollama'"
        >
          <n-input
            v-model:value="form.baseUrl"
            placeholder="https://api.example.com/v1"
          />
        </n-form-item>

        <n-form-item label="模型名称">
          <n-input
            v-model:value="form.model"
            :placeholder="modelPlaceholder"
          />
        </n-form-item>
      </n-form>

      <div class="settings-actions">
        <n-button quaternary @click="handleReset">恢复默认</n-button>
        <n-button type="primary" @click="handleSave">保存设置</n-button>
      </div>
    </div>
  </n-modal>
</template>

<script setup lang="ts">
import { reactive, watch, computed } from "vue";
import { NModal, NForm, NFormItem, NSelect, NInput, NButton, useMessage } from "naive-ui";
import { useSettingsStore, PROVIDER_DEFAULTS } from "../stores/settings";
import type { ModelProvider } from "../types";

defineProps<{ show: boolean }>();
const emit = defineEmits<{ "update:show": [value: boolean] }>();

const settingsStore = useSettingsStore();
const message = useMessage();

const form = reactive({
  provider: settingsStore.model.provider,
  apiKey: settingsStore.model.apiKey,
  baseUrl: settingsStore.model.baseUrl,
  model: settingsStore.model.model,
});

const modelPlaceholder = computed(
  () => PROVIDER_DEFAULTS[form.provider as ModelProvider]?.model || "输入模型名称"
);

watch(
  () => settingsStore.model,
  (val) => {
    form.provider = val.provider;
    form.apiKey = val.apiKey;
    form.baseUrl = val.baseUrl;
    form.model = val.model;
  },
  { deep: true }
);

function onProviderChange(provider: ModelProvider) {
  settingsStore.setProvider(provider);
  form.baseUrl = settingsStore.model.baseUrl;
  form.model = settingsStore.model.model;
}

function handleSave() {
  settingsStore.save({
    provider: form.provider,
    apiKey: form.apiKey.trim(),
    baseUrl: form.baseUrl.trim(),
    model: form.model.trim(),
  });
  message.success("设置已保存");
  emit("update:show", false);
}

function handleReset() {
  settingsStore.reset();
  form.provider = settingsStore.model.provider;
  form.apiKey = settingsStore.model.apiKey;
  form.baseUrl = settingsStore.model.baseUrl;
  form.model = settingsStore.model.model;
  message.info("已恢复默认设置");
}
</script>

<style scoped>
.settings-dialog {
  width: 440px;
  max-width: calc(100vw - 32px);
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  padding: 28px 28px 24px;
  box-shadow: var(--shadow-card);
  border: 1px solid var(--border-subtle);
}

.settings-header {
  margin-bottom: 20px;
}

.settings-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.settings-subtitle {
  font-size: 13px;
  color: var(--text-muted);
}

.settings-form {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.settings-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--border-subtle);
}
</style>
