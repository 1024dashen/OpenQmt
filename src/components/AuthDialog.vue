<template>
    <n-modal
        :show="show"
        :mask-closable="true"
        :close-on-esc="true"
        @update:show="$emit('update:show', $event)"
    >
        <div class="auth-dialog">
            <!-- Header -->
            <div class="auth-header">
                <div class="auth-logo">
                    <img class="logo-icon" :src="logoImg" alt="logo" />
                </div>
                <h2 class="auth-title">OpenQmt</h2>
            </div>

            <!-- Email form (login + auto-register) -->
            <div class="auth-form">
                <n-input
                    v-model:value="form.email"
                    placeholder="邮箱地址"
                    size="large"
                    :status="emailError ? 'error' : undefined"
                    :input-props="{ autocomplete: 'email' }"
                    @blur="validateEmail"
                >
                    <template #prefix>
                        <n-icon :component="MailOutline" />
                    </template>
                </n-input>
                <p v-if="emailError" class="field-error">{{ emailError }}</p>

                <n-input
                    v-model:value="form.password"
                    type="password"
                    show-password-on="click"
                    placeholder="密码（至少6位）"
                    size="large"
                    :status="passwordError ? 'error' : undefined"
                    :input-props="{ autocomplete: 'current-password' }"
                    @blur="validatePassword"
                    @keydown.enter="handleSubmit"
                >
                    <template #prefix>
                        <n-icon :component="LockClosedOutline" />
                    </template>
                </n-input>
                <p v-if="passwordError" class="field-error">
                    {{ passwordError }}
                </p>

                <n-button
                    type="primary"
                    block
                    size="large"
                    :loading="authStore.loading"
                    @click="handleSubmit"
                    class="auth-submit-btn"
                >
                    登录 / 注册
                </n-button>

                <!-- Divider -->
                <div class="auth-divider">
                    <span class="auth-divider-line" />
                    <p class="auth-hint">账号不存在时将自动注册</p>
                    <span class="auth-divider-line" />
                </div>

                <!-- Third-party login -->
                <div class="auth-third-party">
                    <n-button
                        block
                        size="large"
                        :loading="authStore.loading"
                        @click="handleGithubLogin"
                        class="github-btn"
                    >
                        <template #icon>
                            <svg
                                viewBox="0 0 24 24"
                                width="18"
                                height="18"
                                fill="currentColor"
                            >
                                <path
                                    d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
                                />
                            </svg>
                        </template>
                        GitHub
                    </n-button>
                    <n-button
                        block
                        size="large"
                        :loading="authStore.loading"
                        @click="handleGoogleLogin"
                        class="google-btn"
                    >
                        <template #icon>
                            <svg viewBox="0 0 24 24" width="18" height="18">
                                <path
                                    fill="#4285F4"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="#34A853"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="#FBBC05"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                                />
                                <path
                                    fill="#EA4335"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                            </svg>
                        </template>
                        Google
                    </n-button>
                </div>
            </div>
        </div>
    </n-modal>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { NModal, NInput, NButton, NIcon, useMessage } from 'naive-ui'
import { useAuthStore } from '../stores/auth'
import { LockClosedOutline, MailOutline } from '@vicons/ionicons5'
import logoImg from '@/assets/images/logo.png'

const props = defineProps<{ show: boolean }>()
const emit = defineEmits<{ 'update:show': [value: boolean] }>()

const authStore = useAuthStore()
const message = useMessage()

const form = reactive({ email: '', password: '' })
const emailError = ref('')
const passwordError = ref('')

function validateEmail() {
    if (!form.email) {
        emailError.value = '请输入邮箱'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        emailError.value = '邮箱格式不正确'
    } else {
        emailError.value = ''
    }
}

function validatePassword() {
    if (!form.password) {
        passwordError.value = '请输入密码'
    } else if (form.password.length < 6) {
        passwordError.value = '密码至少6位'
    } else {
        passwordError.value = ''
    }
}

function validateAll(): boolean {
    validateEmail()
    validatePassword()
    return !emailError.value && !passwordError.value
}

async function handleSubmit() {
    if (!validateAll()) return
    const result = await authStore.loginOrRegister(form.email, form.password)
    if (result.success) {
        message.success(result.isNew ? '注册并登录成功' : '登录成功')
        emit('update:show', false)
        resetForm()
    } else {
        message.error(result.message)
    }
}

// ── GitHub Login ──
async function handleGithubLogin() {
    const result = await authStore.githubLogin()
    if (result.success) {
        message.success('GitHub 登录成功')
        emit('update:show', false)
        resetForm()
    } else {
        message.error(result.message)
    }
}

// ── Google Login ──
async function handleGoogleLogin() {
    const result = await authStore.googleLogin()
    if (result.success) {
        message.success('Google 登录成功')
        emit('update:show', false)
        resetForm()
    } else {
        message.error(result.message)
    }
}

function resetForm() {
    form.email = ''
    form.password = ''
    emailError.value = ''
    passwordError.value = ''
}
</script>

<style scoped>
.auth-dialog {
    width: 400px;
    max-width: calc(100vw - 32px);
    background: var(--bg-card);
    border-radius: var(--radius-xl);
    padding: 32px 32px 24px;
    box-shadow: var(--shadow-card);
    border: 1px solid var(--border-subtle);
}

@media (max-width: 480px) {
    .auth-dialog {
        padding: 24px 20px 20px;
        border-radius: 14px;
    }
}

.auth-header {
    text-align: center;
    margin-bottom: 24px;
}

.auth-logo {
    width: 52px;
    height: 52px;
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto;
}

.logo-icon {
    width: 52px;
    height: 52px;
    border-radius: var(--radius-md);
    object-fit: contain;
    flex-shrink: 0;
}

.auth-logo-letter {
    font-size: 28px;
    font-weight: 700;
    color: #0a0e1a;
    font-family: 'Inter', sans-serif;
}

.auth-title {
    font-size: 20px;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 4px;
}

.auth-subtitle {
    font-size: 13px;
    color: var(--text-muted);
}

/* Third-party */
.auth-third-party {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.github-btn {
    background: #24292e !important;
    color: #fff !important;
    border: none !important;
    height: 44px;
    font-size: 14px;
    font-weight: 600;
    border-radius: var(--radius-md) !important;
    transition: background 0.2s;
}

.github-btn:hover {
    background: #2f363d !important;
}

.google-btn {
    background: #fff !important;
    color: #3c4043 !important;
    border: 1px solid #dadce0 !important;
    height: 44px;
    font-size: 14px;
    font-weight: 600;
    border-radius: var(--radius-md) !important;
    transition: background 0.2s;
}

.google-btn:hover {
    background: #f8f9fa !important;
}

/* Divider */
.auth-divider {
    display: flex;
    align-items: center;
    gap: 10px;
}

.auth-divider-line {
    flex: 1;
    height: 1px;
    background: var(--border-subtle);
}

.auth-divider-text {
    font-size: 12px;
    color: var(--text-muted);
    white-space: nowrap;
}

/* Form */
.auth-form {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.field-error {
    font-size: 12px;
    color: #e88080;
    margin: -6px 0 0 2px;
}

.auth-submit-btn {
    margin-top: 4px;
    height: 44px;
    font-size: 15px;
    font-weight: 600;
    border-radius: var(--radius-md) !important;
}

.auth-submit-btn:hover {
    opacity: 0.9;
}

/* Hint */
.auth-hint {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    font-size: 12px;
    color: var(--text-muted);
}

/* Footer */
.auth-footer {
    text-align: center;
    padding-top: 14px;
    margin-top: 16px;
    border-top: 1px solid var(--border-subtle);
    font-size: 12px;
    color: var(--text-muted);
}
</style>
