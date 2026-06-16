<template>
    <div class="notifications-page">
        <div class="notifications-header">
            <h2 class="page-title">推送通知</h2>
            <p class="page-subtitle">管理您的通知偏好和推送设置</p>
        </div>

        <div class="notifications-container">
            <!-- 推送渠道配置 -->
            <div class="settings-card surface-card surface-card--flat">
                <div class="card-header">
                    <n-icon size="20" color="var(--gold-primary)">
                        <SendOutline />
                    </n-icon>
                    <span class="card-title">推送渠道</span>
                    <n-button text size="small" @click="showAddChannel = true">
                        <template #icon>
                            <n-icon><AddOutline /></n-icon>
                        </template>
                        添加渠道
                    </n-button>
                </div>
                <div class="card-body" v-if="channels.length > 0">
                    <div class="channels-list">
                        <div
                            v-for="channel in channels"
                            :key="channel.id"
                            class="channel-item"
                        >
                            <div class="channel-info">
                                <span class="channel-icon">{{
                                    channelIcons[channel.type]
                                }}</span>
                                <div class="channel-details">
                                    <span class="channel-name">{{
                                        channel.name
                                    }}</span>
                                    <span class="channel-type">{{
                                        channelLabels[channel.type]
                                    }}</span>
                                </div>
                            </div>
                            <div class="channel-actions">
                                <n-button
                                    quaternary
                                    circle
                                    size="small"
                                    @click="editChannel(channel)"
                                >
                                    <template #icon>
                                        <n-icon><CreateOutline /></n-icon>
                                    </template>
                                </n-button>
                                <n-button
                                    quaternary
                                    circle
                                    size="small"
                                    @click="removeChannel(channel.id)"
                                >
                                    <template #icon>
                                        <n-icon><TrashOutline /></n-icon>
                                    </template>
                                </n-button>
                                <n-switch
                                    v-model:value="channel.enabled"
                                    @update:value="
                                        notificationStore.toggleChannel(
                                            channel.id
                                        )
                                    "
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div class="card-body empty-state" v-else>
                    <p>暂无推送渠道,请先添加</p>
                </div>
            </div>

            <!-- 通知类型配置 -->
            <div class="settings-card surface-card surface-card--flat">
                <div class="card-header">
                    <n-icon size="20" color="var(--gold-primary)">
                        <NotificationsOutline />
                    </n-icon>
                    <span class="card-title">通知类型</span>
                </div>
                <div class="card-body">
                    <div class="notifications-list">
                        <div
                            v-for="notification in notificationTypes"
                            :key="notification.type"
                            class="notification-item"
                        >
                            <div class="notification-header">
                                <div class="notification-info">
                                    <span class="notification-name">{{
                                        notification.name
                                    }}</span>
                                    <span class="notification-desc">{{
                                        notification.description
                                    }}</span>
                                </div>
                                <n-switch
                                    v-model:value="notification.enabled"
                                    @update:value="
                                        notificationStore.toggleNotification(
                                            notification.type
                                        )
                                    "
                                />
                            </div>
                            <div
                                class="notification-channels"
                                v-if="notification.enabled"
                            >
                                <span class="channels-label">推送到:</span>
                                <div class="channels-options">
                                    <n-checkbox
                                        v-for="channel in enabledChannels"
                                        :key="channel.id"
                                        :checked="
                                            notification.channels.includes(
                                                channel.id
                                            )
                                        "
                                        @update:checked="
                                            toggleNotificationChannel(
                                                notification.type,
                                                channel.id
                                            )
                                        "
                                    >
                                        {{ channelIcons[channel.type] }}
                                        {{ channel.name }}
                                    </n-checkbox>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 操作按钮 -->
            <div class="settings-actions">
                <n-button quaternary @click="handleReset">恢复默认</n-button>
                <n-button type="primary" @click="handleSave">保存设置</n-button>
            </div>
        </div>

        <!-- 添加/编辑渠道对话框 -->
        <n-modal
            v-model:show="showAddChannel"
            preset="dialog"
            :title="editingChannel ? '编辑推送渠道' : '添加推送渠道'"
        >
            <n-form
                ref="channelFormRef"
                :model="channelForm"
                label-placement="top"
                :show-feedback="false"
            >
                <n-form-item label="渠道类型" path="type">
                    <n-select
                        v-model:value="channelForm.type"
                        :options="channelOptions"
                        :disabled="!!editingChannel"
                    />
                </n-form-item>
                <n-form-item label="渠道名称" path="name">
                    <n-input
                        v-model:value="channelForm.name"
                        placeholder="例如: 工作群通知"
                    />
                </n-form-item>
                <n-form-item label="Webhook 地址" path="webhook">
                    <n-input
                        v-model:value="channelForm.webhook"
                        placeholder="https://..."
                    />
                </n-form-item>
                <n-form-item
                    v-if="channelForm.type === 'wxpusher'"
                    label="APP Token"
                    path="token"
                >
                    <n-input
                        v-model:value="channelForm.token"
                        placeholder="WxPusher APP Token"
                    />
                </n-form-item>
                <n-form-item
                    v-if="channelForm.type === 'wecom'"
                    label="Corp ID"
                    path="corpId"
                >
                    <n-input
                        v-model:value="channelForm.corpId"
                        placeholder="企业ID"
                    />
                </n-form-item>
                <n-form-item
                    v-if="channelForm.type === 'wecom'"
                    label="Agent ID"
                    path="agentId"
                >
                    <n-input
                        v-model:value="channelForm.agentId"
                        placeholder="应用Agent ID"
                    />
                </n-form-item>
            </n-form>
            <template #action>
                <n-button @click="closeChannelDialog">取消</n-button>
                <n-button
                    type="primary"
                    :disabled="!channelForm.name || !channelForm.webhook"
                    @click="handleSaveChannel"
                >
                    {{ editingChannel ? '保存' : '添加' }}
                </n-button>
            </template>
        </n-modal>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import {
    NForm,
    NFormItem,
    NInput,
    NSelect,
    NButton,
    NSwitch,
    NCheckbox,
    NIcon,
    NModal,
    useMessage,
} from 'naive-ui'
import {
    SendOutline,
    NotificationsOutline,
    AddOutline,
    CreateOutline,
    TrashOutline,
} from '@vicons/ionicons5'
import {
    useNotificationStore,
    CHANNEL_LABELS,
    CHANNEL_ICONS,
} from '../stores/notifications'
import type {
    PushChannel,
    PushChannelConfig,
    NotificationType,
} from '../types'

const notificationStore = useNotificationStore()
const message = useMessage()

const channels = computed(() => notificationStore.settings.channels)
const enabledChannels = computed(() => notificationStore.enabledChannels)
const notificationTypes = computed(
    () => notificationStore.settings.notifications
)
const channelLabels = CHANNEL_LABELS
const channelIcons = CHANNEL_ICONS

const channelOptions = notificationStore.channelOptions

// 添加/编辑渠道
const showAddChannel = ref(false)
const editingChannel = ref<PushChannelConfig | null>(null)
const channelFormRef = ref()

const defaultChannelForm = {
    type: 'feishu' as PushChannel,
    name: '',
    webhook: '',
    token: '',
    secret: '',
    corpId: '',
    agentId: '',
}

const channelForm = reactive({ ...defaultChannelForm })

function editChannel(channel: PushChannelConfig) {
    editingChannel.value = channel
    channelForm.type = channel.type
    channelForm.name = channel.name
    channelForm.webhook = channel.webhook
    channelForm.token = channel.token || ''
    channelForm.secret = channel.secret || ''
    channelForm.corpId = channel.corpId || ''
    channelForm.agentId = channel.agentId || ''
    showAddChannel.value = true
}

function closeChannelDialog() {
    showAddChannel.value = false
    editingChannel.value = null
    Object.assign(channelForm, defaultChannelForm)
}

function handleSaveChannel() {
    if (!channelForm.name || !channelForm.webhook) return

    const channelData = {
        type: channelForm.type,
        name: channelForm.name,
        webhook: channelForm.webhook,
        enabled: true,
        token: channelForm.token || undefined,
        secret: channelForm.secret || undefined,
        corpId: channelForm.corpId || undefined,
        agentId: channelForm.agentId || undefined,
    }

    if (editingChannel.value) {
        notificationStore.updateChannel(editingChannel.value.id, channelData)
        message.success('渠道已更新')
    } else {
        notificationStore.addChannel(channelData)
        message.success('渠道已添加')
    }

    closeChannelDialog()
}

function removeChannel(id: string) {
    notificationStore.removeChannel(id)
    message.success('渠道已删除')
}

function toggleNotificationChannel(
    notificationType: NotificationType,
    channelId: string
) {
    notificationStore.toggleNotificationChannel(notificationType, channelId as PushChannel)
}

// 保存和重置
function handleSave() {
    notificationStore.save()
    message.success('通知设置已保存')
}

function handleReset() {
    notificationStore.reset()
    message.info('已恢复默认设置')
}
</script>

<style scoped>
.notifications-page {
    max-width: 100%;
    width: 100%;
    min-width: 0;
}

.notifications-header {
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

.notifications-container {
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

.empty-state {
    align-items: center;
    justify-content: center;
    padding: 32px;
    color: var(--text-muted);
    font-size: 13px;
}

/* 渠道列表 */
.channels-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.channel-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 16px;
    background: var(--surface-muted);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
}

.channel-info {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
}

.channel-icon {
    font-size: 24px;
}

.channel-details {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.channel-name {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-primary);
}

.channel-type {
    font-size: 12px;
    color: var(--text-muted);
}

.channel-actions {
    display: flex;
    align-items: center;
    gap: 8px;
}

/* 通知列表 */
.notifications-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.notification-item {
    padding: 16px;
    background: var(--surface-muted);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
}

.notification-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
    margin-bottom: 12px;
}

.notification-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1;
}

.notification-name {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-primary);
}

.notification-desc {
    font-size: 12px;
    color: var(--text-muted);
}

.notification-channels {
    padding-top: 12px;
    border-top: 1px solid var(--border-subtle);
}

.channels-label {
    display: block;
    font-size: 12px;
    color: var(--text-secondary);
    margin-bottom: 8px;
    font-weight: 500;
}

.channels-options {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
}

/* 操作按钮 */
.settings-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding: 20px 0;
}

@media (max-width: 768px) {
    .notifications-container {
        max-width: 100%;
    }

    .settings-card {
        padding: 18px;
    }

    .channels-options {
        flex-direction: column;
        gap: 8px;
    }
}
</style>
