<template>
    <div class="profile-page">
        <div class="profile-header surface-card surface-card--flat">
            <div class="profile-avatar-area">
                <n-avatar
                    v-if="authStore.user?.avatar_url"
                    :src="authStore.user.avatar_url"
                    :size="80"
                    round
                />
                <n-avatar
                    v-else
                    :size="80"
                    round
                    class="profile-avatar-default"
                >
                    {{
                        authStore.user?.nickname?.charAt(0)?.toUpperCase() ||
                        'U'
                    }}
                </n-avatar>
            </div>
            <div class="profile-info">
                <h2 class="profile-name">
                    {{ authStore.user?.nickname || '用户' }}
                </h2>
                <span class="profile-email">{{ authStore.user?.email }}</span>
                <span class="profile-github" v-if="authStore.user?.github_id">
                    <n-icon size="14"><LogoGithub /></n-icon>
                    已绑定 GitHub
                </span>
            </div>
        </div>

        <div class="profile-grid">
            <!-- 积分卡片（暂时隐藏） -->
            <div
                v-if="showCreditsSection"
                class="profile-card credits-card surface-card surface-card--flat"
            >
                <div class="card-header">
                    <n-icon size="20" color="var(--gold-primary)"
                        ><DiamondOutline
                    /></n-icon>
                    <span class="card-title">我的积分</span>
                </div>
                <div class="credits-display">
                    <span class="credits-value">{{
                        authStore.user?.credits ?? 0
                    }}</span>
                    <span class="credits-unit">积分</span>
                </div>
                <div class="recharge-section">
                    <p class="recharge-label">选择充值金额</p>
                    <div class="recharge-options">
                        <div
                            v-for="opt in rechargeOptions"
                            :key="opt.amount"
                            class="recharge-option"
                            :class="{ active: selectedAmount === opt.amount }"
                            @click="selectedAmount = opt.amount"
                        >
                            <span class="recharge-amount">{{
                                opt.amount
                            }}</span>
                            <span class="recharge-bonus" v-if="opt.bonus"
                                >+{{ opt.bonus }}</span
                            >
                        </div>
                    </div>
                    <n-button
                        type="primary"
                        block
                        :loading="rechargeLoading"
                        :disabled="!selectedAmount"
                        @click="handleRecharge"
                        class="recharge-btn"
                    >
                        立即充值
                    </n-button>
                </div>
            </div>

            <!-- 修改昵称 -->
            <div class="profile-card surface-card surface-card--flat">
                <div class="card-header">
                    <n-icon size="20" color="var(--gold-primary)"
                        ><CreateOutline
                    /></n-icon>
                    <span class="card-title">修改昵称</span>
                </div>
                <div class="card-body">
                    <n-input
                        v-model:value="nicknameForm.nickname"
                        placeholder="输入新昵称"
                        size="large"
                        :maxlength="20"
                    />
                    <n-button
                        type="primary"
                        block
                        size="large"
                        :loading="nicknameLoading"
                        :disabled="!nicknameForm.nickname.trim()"
                        @click="handleUpdateNickname"
                    >
                        保存昵称
                    </n-button>
                </div>
            </div>

            <!-- 修改密码 -->
            <div class="profile-card surface-card surface-card--flat">
                <div class="card-header">
                    <n-icon size="20" color="var(--gold-primary)"
                        ><LockClosedOutline
                    /></n-icon>
                    <span class="card-title">修改密码</span>
                </div>
                <div class="card-body">
                    <n-input
                        v-model:value="passwordForm.oldPassword"
                        type="password"
                        show-password-on="click"
                        placeholder="旧密码（GitHub用户可留空）"
                        size="large"
                    />
                    <n-input
                        v-model:value="passwordForm.newPassword"
                        type="password"
                        show-password-on="click"
                        placeholder="新密码（至少6位）"
                        size="large"
                    />
                    <n-input
                        v-model:value="passwordForm.confirmPassword"
                        type="password"
                        show-password-on="click"
                        placeholder="确认新密码"
                        size="large"
                    />
                    <n-button
                        type="primary"
                        block
                        size="large"
                        :loading="passwordLoading"
                        :disabled="
                            !passwordForm.newPassword ||
                            passwordForm.newPassword !==
                                passwordForm.confirmPassword
                        "
                        @click="handleUpdatePassword"
                    >
                        修改密码
                    </n-button>
                </div>
            </div>

            <!-- 账户信息 -->
            <div class="profile-card surface-card surface-card--flat">
                <div class="card-header">
                    <n-icon size="20" color="var(--gold-primary)"
                        ><InformationCircleOutline
                    /></n-icon>
                    <span class="card-title">账户信息</span>
                </div>
                <div class="card-body info-list">
                    <div class="info-row">
                        <span class="info-label">用户ID</span>
                        <span class="info-value num-mono"
                            >{{ authStore.user?.id?.slice(0, 8) }}...</span
                        >
                    </div>
                    <div class="info-row">
                        <span class="info-label">注册邮箱</span>
                        <span class="info-value">{{
                            authStore.user?.email
                        }}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">GitHub</span>
                        <span class="info-value">{{
                            authStore.user?.github_id ? '已绑定' : '未绑定'
                        }}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { NAvatar, NIcon, NInput, NButton, useMessage } from 'naive-ui'
import {
    DiamondOutline,
    CreateOutline,
    LockClosedOutline,
    InformationCircleOutline,
    LogoGithub,
} from '@vicons/ionicons5'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const message = useMessage()

const showCreditsSection = false

// ── 积分充值 ──
const rechargeOptions = [
    { amount: 100, bonus: 0 },
    { amount: 500, bonus: 50 },
    { amount: 1000, bonus: 150 },
    { amount: 2000, bonus: 400 },
]
const selectedAmount = ref<number | null>(null)
const rechargeLoading = ref(false)

async function handleRecharge() {
    if (!selectedAmount.value) return
    rechargeLoading.value = true
    const result = await authStore.rechargeCredits(selectedAmount.value)
    rechargeLoading.value = false
    if (result.success) {
        message.success(result.message)
        selectedAmount.value = null
    } else {
        message.error(result.message)
    }
}

// ── 修改昵称 ──
const nicknameForm = reactive({ nickname: '' })
const nicknameLoading = ref(false)

onMounted(() => {
    if (authStore.user?.nickname) {
        nicknameForm.nickname = authStore.user.nickname
    }
})

async function handleUpdateNickname() {
    if (!nicknameForm.nickname.trim()) return
    nicknameLoading.value = true
    const result = await authStore.updateNickname(nicknameForm.nickname.trim())
    nicknameLoading.value = false
    if (result.success) {
        message.success('昵称修改成功')
    } else {
        message.error(result.message)
    }
}

// ── 修改密码 ──
const passwordForm = reactive({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
})
const passwordLoading = ref(false)

async function handleUpdatePassword() {
    if (passwordForm.newPassword.length < 6) {
        message.error('新密码至少6位')
        return
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        message.error('两次密码不一致')
        return
    }
    passwordLoading.value = true
    const result = await authStore.updatePassword(
        passwordForm.oldPassword,
        passwordForm.newPassword
    )
    passwordLoading.value = false
    if (result.success) {
        message.success('密码修改成功')
        passwordForm.oldPassword = ''
        passwordForm.newPassword = ''
        passwordForm.confirmPassword = ''
    } else {
        message.error(result.message)
    }
}
</script>

<style scoped>
.profile-page {
    max-width: 100%;
    width: 100%;
    min-width: 0;
    margin: 0 auto;
}

.profile-header {
    display: flex;
    align-items: center;
    gap: 24px;
    padding: 28px 32px;
    margin-bottom: 20px;
}

.profile-avatar-default {
    background: linear-gradient(
        135deg,
        var(--gold-primary),
        var(--gold-dark)
    ) !important;
    color: #0a0e1a !important;
    font-size: 32px !important;
    font-weight: 700;
}

.profile-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.profile-name {
    font-size: 20px;
    font-weight: 600;
    color: var(--text-primary);
    letter-spacing: -0.02em;
    margin: 0;
}

.profile-email {
    font-size: 13px;
    color: var(--text-muted);
}

.profile-github {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: var(--text-secondary);
    margin-top: 2px;
}

.profile-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
}

.profile-card {
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
}

.card-body {
    display: flex;
    flex-direction: column;
    gap: 14px;
}

/* 积分卡片 */
.credits-card {
    grid-row: span 2;
}

.credits-display {
    display: flex;
    align-items: baseline;
    gap: 8px;
    margin-bottom: 24px;
}

.credits-value {
    font-size: 44px;
    font-weight: 600;
    font-family: 'JetBrains Mono', monospace;
    color: var(--gold-primary);
    line-height: 1;
    letter-spacing: -0.03em;
}

.credits-unit {
    font-size: 14px;
    color: var(--text-muted);
}

.recharge-section {
    border-top: 1px solid var(--border-subtle);
    padding-top: 16px;
}

.recharge-label {
    font-size: 13px;
    color: var(--text-secondary);
    margin-bottom: 12px;
}

.recharge-options {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    margin-bottom: 16px;
}

.recharge-option {
    background: var(--surface-muted);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    padding: 14px 12px;
    text-align: center;
    cursor: pointer;
    transition: border-color var(--transition-fast),
        background var(--transition-fast);
    position: relative;
}

.recharge-option:hover {
    border-color: var(--border-accent);
    background: var(--bg-card-hover);
}

.recharge-option.active {
    border-color: var(--gold-primary);
    background: rgba(212, 168, 67, 0.08);
}

.recharge-amount {
    font-size: 20px;
    font-weight: 700;
    font-family: 'JetBrains Mono', monospace;
    color: var(--text-primary);
    display: block;
}

.recharge-bonus {
    font-size: 11px;
    color: var(--gold-primary);
    background: rgba(212, 168, 67, 0.12);
    padding: 1px 6px;
    border-radius: 4px;
    position: absolute;
    top: 6px;
    right: 6px;
}

.recharge-btn {
    height: 42px;
    font-weight: 600;
    border-radius: var(--radius-md) !important;
}

/* 信息列表 */
.info-list {
    gap: 0;
}

.info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid var(--border-subtle);
}

.info-row:last-child {
    border-bottom: none;
}

.info-label {
    font-size: 13px;
    color: var(--text-muted);
}

.info-value {
    font-size: 13px;
    color: var(--text-primary);
}

.num-mono {
    font-family: 'JetBrains Mono', monospace;
}

/* 响应式 */
@media (max-width: 768px) {
    .profile-grid {
        grid-template-columns: 1fr;
    }
    .credits-card {
        grid-row: auto;
    }
    .profile-header {
        flex-direction: column;
        text-align: center;
        padding: 20px 16px;
    }
    .profile-card {
        padding: 18px;
    }
}

@media (max-width: 480px) {
    .recharge-options {
        grid-template-columns: 1fr 1fr;
        gap: 8px;
    }

    .credits-value {
        font-size: 36px;
    }

    .profile-name {
        font-size: 18px;
    }
}
</style>
