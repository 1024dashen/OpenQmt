<template>
    <div class="settings-page">
        <div class="settings-header">
            <h2 class="page-title">系统设置</h2>
            <p class="page-subtitle">配置 AI 分析使用的模型和提示词</p>
        </div>

        <div class="settings-container">
            <!-- 系统提示词配置 -->
            <div class="settings-card surface-card surface-card--flat">
                <div class="card-header">
                    <n-icon size="20" color="var(--gold-primary)">
                        <ChatbubbleEllipsesOutline />
                    </n-icon>
                    <span class="card-title">系统提示词</span>
                </div>
                <div class="card-body">
                    <n-input
                        v-model:value="systemPrompt"
                        type="textarea"
                        placeholder="输入系统提示词..."
                        :rows="8"
                        :autosize="{ minRows: 8, maxRows: 20 }"
                    />
                    <p class="help-text">
                        系统提示词用于定义 AI 助手的行为和回答风格
                    </p>
                </div>
            </div>

            <!-- 模型提供商配置 -->
            <div class="settings-card surface-card surface-card--flat">
                <div class="card-header">
                    <n-icon size="20" color="var(--gold-primary)">
                        <LayersOutline />
                    </n-icon>
                    <span class="card-title">模型提供商</span>
                </div>
                <div class="card-body">
                    <n-tabs v-model:value="activeProvider" type="line" animated>
                        <n-tab-pane
                            v-for="provider in providerTabs"
                            :key="provider.key"
                            :name="provider.key"
                            :tab="provider.label"
                        >
                            <div class="provider-config">
                                <n-form
                                    label-placement="top"
                                    :show-feedback="false"
                                >
                                    <n-form-item label="API Key">
                                        <n-input
                                            v-model:value="providerForm.apiKey"
                                            type="password"
                                            show-password-on="click"
                                            placeholder="请输入 API Key"
                                        />
                                    </n-form-item>

                                    <n-form-item label="API 地址">
                                        <n-input
                                            v-model:value="providerForm.baseUrl"
                                            placeholder="https://api.example.com/v1"
                                        />
                                    </n-form-item>
                                </n-form>

                                <div class="models-section">
                                    <div class="models-header">
                                        <span class="models-label">可用模型</span>
                                        <n-button
                                            text
                                            size="small"
                                            @click="showAddModel = true"
                                        >
                                            <template #icon>
                                                <n-icon><AddOutline /></n-icon>
                                            </template>
                                            添加模型
                                        </n-button>
                                    </div>
                                    <div class="models-list">
                                        <div
                                            v-for="model in currentModels"
                                            :key="model.id"
                                            class="model-item"
                                            :class="{
                                                active:
                                                    model.id === activeModel,
                                            }"
                                        >
                                            <div
                                                class="model-info"
                                                @click="selectModel(model.id)"
                                            >
                                                <span class="model-name">{{
                                                    model.name
                                                }}</span>
                                                <span class="model-id">{{
                                                    model.id
                                                }}</span>
                                            </div>
                                            <n-switch
                                                v-model:value="model.enabled"
                                                @update:value="
                                                    toggleModelStatus(
                                                        activeProvider,
                                                        model.id
                                                    )
                                                "
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </n-tab-pane>
                    </n-tabs>
                </div>
            </div>

            <!-- 自定义提供商 -->
            <div class="settings-card surface-card surface-card--flat">
                <div class="card-header">
                    <n-icon size="20" color="var(--gold-primary)">
                        <AddCircleOutline />
                    </n-icon>
                    <span class="card-title">自定义提供商</span>
                    <n-button
                        text
                        size="small"
                        @click="showAddProvider = true"
                    >
                        <template #icon>
                            <n-icon><AddOutline /></n-icon>
                        </template>
                        添加
                    </n-button>
                </div>
                <div class="card-body" v-if="customProviders.length > 0">
                    <div class="custom-providers-list">
                        <div
                            v-for="provider in customProviders"
                            :key="provider.id"
                            class="custom-provider-item"
                        >
                            <div class="provider-info">
                                <span class="provider-name">{{
                                    provider.name
                                }}</span>
                                <span class="provider-url">{{
                                    provider.baseUrl
                                }}</span>
                            </div>
                            <n-button
                                quaternary
                                circle
                                size="small"
                                @click="removeCustomProvider(provider.id)"
                            >
                                <template #icon>
                                    <n-icon><TrashOutline /></n-icon>
                                </template>
                            </n-button>
                        </div>
                    </div>
                </div>
                <div class="card-body empty-state" v-else>
                    <p>暂无自定义提供商</p>
                </div>
            </div>

            <!-- 操作按钮 -->
            <div class="settings-actions">
                <n-button quaternary @click="handleReset">恢复默认</n-button>
                <n-button type="primary" @click="handleSave">保存设置</n-button>
            </div>
        </div>

        <!-- 添加模型对话框 -->
        <n-modal v-model:show="showAddModel" preset="dialog" title="添加模型">
            <n-form label-placement="top" :show-feedback="false">
                <n-form-item label="模型 ID">
                    <n-input
                        v-model:value="newModelForm.id"
                        placeholder="例如: gpt-4"
                    />
                </n-form-item>
                <n-form-item label="模型名称">
                    <n-input
                        v-model:value="newModelForm.name"
                        placeholder="例如: GPT-4"
                    />
                </n-form-item>
            </n-form>
            <template #action>
                <n-button @click="showAddModel = false">取消</n-button>
                <n-button
                    type="primary"
                    :disabled="!newModelForm.id || !newModelForm.name"
                    @click="handleAddModel"
                >
                    添加
                </n-button>
            </template>
        </n-modal>

        <!-- 添加自定义提供商对话框 -->
        <n-modal
            v-model:show="showAddProvider"
            preset="dialog"
            title="添加自定义提供商"
        >
            <n-form label-placement="top" :show-feedback="false">
                <n-form-item label="提供商名称">
                    <n-input
                        v-model:value="newProviderForm.name"
                        placeholder="例如: 我的 API"
                    />
                </n-form-item>
                <n-form-item label="API 地址">
                    <n-input
                        v-model:value="newProviderForm.baseUrl"
                        placeholder="https://api.example.com/v1"
                    />
                </n-form-item>
                <n-form-item label="API Key">
                    <n-input
                        v-model:value="newProviderForm.apiKey"
                        type="password"
                        show-password-on="click"
                        placeholder="请输入 API Key"
                    />
                </n-form-item>
            </n-form>
            <template #action>
                <n-button @click="showAddProvider = false">取消</n-button>
                <n-button
                    type="primary"
                    :disabled="!newProviderForm.name || !newProviderForm.baseUrl"
                    @click="handleAddProvider"
                >
                    添加
                </n-button>
            </template>
        </n-modal>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import {
    NForm,
    NFormItem,
    NInput,
    NButton,
    NSwitch,
    NTabs,
    NTabPane,
    NIcon,
    NModal,
    useMessage,
} from 'naive-ui'
import {
    ChatbubbleEllipsesOutline,
    LayersOutline,
    AddCircleOutline,
    AddOutline,
    TrashOutline,
} from '@vicons/ionicons5'
import { useSettingsStore } from '../stores/settings'
import type { ModelProvider, ModelOption } from '../types'

const settingsStore = useSettingsStore()
const message = useMessage()

const activeProvider = ref<ModelProvider>(settingsStore.model.provider)
const systemPrompt = ref(settingsStore.model.systemPrompt)

// 提供商标签页
const providerTabs = computed(() =>
    settingsStore.providerOptions.map(opt => ({
        key: opt.value as ModelProvider,
        label: opt.label,
    }))
)

// 当前提供商配置
const currentConfig = computed(
    () => settingsStore.model.providers[activeProvider.value]
)

const currentModels = computed(() => currentConfig.value?.models || [])
const activeModel = computed(() => currentConfig.value?.activeModel || '')

// 表单数据
const providerForm = reactive({
    apiKey: currentConfig.value?.apiKey || '',
    baseUrl: currentConfig.value?.baseUrl || '',
})

watch(
    activeProvider,
    (newProvider) => {
        const config = settingsStore.model.providers[newProvider]
        if (config) {
            providerForm.apiKey = config.apiKey
            providerForm.baseUrl = config.baseUrl
        }
    },
    { immediate: true }
)

// 自定义提供商列表
const customProviders = computed(() => settingsStore.model.customProviders)

// 添加模型
const showAddModel = ref(false)
const newModelForm = reactive({ id: '', name: '' })

function handleAddModel() {
    if (!newModelForm.id || !newModelForm.name) return

    const newModel: ModelOption = {
        id: newModelForm.id,
        name: newModelForm.name,
        enabled: true,
    }

    settingsStore.addCustomModel(activeProvider.value, newModel)
    showAddModel.value = false
    newModelForm.id = ''
    newModelForm.name = ''
    message.success('模型已添加')
}

function toggleModelStatus(provider: ModelProvider, modelId: string) {
    settingsStore.toggleModel(provider, modelId)
}

function selectModel(modelId: string) {
    settingsStore.updateProviderConfig(activeProvider.value, {
        activeModel: modelId,
    })
}

// 添加自定义提供商
const showAddProvider = ref(false)
const newProviderForm = reactive({
    name: '',
    baseUrl: '',
    apiKey: '',
})

function handleAddProvider() {
    if (!newProviderForm.name || !newProviderForm.baseUrl) return

    const id = `custom_${Date.now()}`
    settingsStore.addCustomProvider({
        id,
        name: newProviderForm.name,
        baseUrl: newProviderForm.baseUrl,
        apiKey: newProviderForm.apiKey,
        models: [],
        activeModel: '',
    })

    showAddProvider.value = false
    newProviderForm.name = ''
    newProviderForm.baseUrl = ''
    newProviderForm.apiKey = ''
    message.success('自定义提供商已添加')
}

function removeCustomProvider(id: string) {
    settingsStore.removeCustomProvider(id)
    message.success('自定义提供商已删除')
}

// 保存和重置
function handleSave() {
    // 更新当前提供商配置
    settingsStore.updateProviderConfig(activeProvider.value, {
        apiKey: providerForm.apiKey,
        baseUrl: providerForm.baseUrl,
    })

    // 更新系统提示词
    settingsStore.save({
        ...settingsStore.model,
        systemPrompt: systemPrompt.value,
    })

    message.success('设置已保存')
}

function handleReset() {
    settingsStore.reset()
    systemPrompt.value = settingsStore.model.systemPrompt
    activeProvider.value = settingsStore.model.provider
    message.info('已恢复默认设置')
}
</script>

<style scoped>
.settings-page {
    max-width: 100%;
    width: 100%;
    min-width: 0;
}

.settings-header {
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

.settings-container {
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

.help-text {
    font-size: 12px;
    color: var(--text-muted);
    margin: 0;
}

/* 提供商配置 */
.provider-config {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.models-section {
    margin-top: 8px;
}

.models-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
}

.models-label {
    font-size: 13px;
    font-weight: 500;
    color: var(--text-secondary);
}

.models-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.model-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 14px;
    background: var(--surface-muted);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: all var(--transition-fast);
}

.model-item:hover {
    border-color: var(--border-accent);
}

.model-item.active {
    border-color: var(--gold-primary);
    background: rgba(212, 168, 67, 0.08);
}

.model-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex: 1;
}

.model-name {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-primary);
}

.model-id {
    font-size: 12px;
    color: var(--text-muted);
    font-family: 'JetBrains Mono', monospace;
}

/* 自定义提供商 */
.custom-providers-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.custom-provider-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 14px;
    background: var(--surface-muted);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
}

.provider-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex: 1;
}

.provider-name {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-primary);
}

.provider-url {
    font-size: 12px;
    color: var(--text-muted);
    font-family: 'JetBrains Mono', monospace;
}

.empty-state {
    align-items: center;
    justify-content: center;
    padding: 32px;
    color: var(--text-muted);
    font-size: 13px;
}

/* 操作按钮 */
.settings-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding: 20px 0;
}

@media (max-width: 768px) {
    .settings-container {
        max-width: 100%;
    }

    .settings-card {
        padding: 18px;
    }
}
</style>
