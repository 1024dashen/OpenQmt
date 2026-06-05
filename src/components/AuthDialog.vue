<template>
  <n-modal
    :show="show"
    :mask-closable="true"
    :close-on-esc="true"
    @update:show="$emit('update:show', $event)"
  >
    <div class="auth-dialog">
      <div class="auth-header">
        <div class="auth-logo">
          <span class="auth-logo-letter">Q</span>
        </div>
        <h2 class="auth-title">OpenQmt</h2>
        <p class="auth-subtitle">登录以解锁全部功能</p>
      </div>

      <n-tabs v-model:value="activeTab" type="segment" animated class="auth-tabs">
        <!-- 邮箱登录 -->
        <n-tab-pane name="login" tab="邮箱登录">
          <n-form ref="loginFormRef" :model="loginForm" :rules="loginRules" class="auth-form">
            <n-form-item path="email" label="邮箱">
              <n-input
                v-model:value="loginForm.email"
                placeholder="请输入邮箱"
                size="large"
                :input-props="{ autocomplete: 'email' }"
              >
                <template #prefix>
                  <n-icon :component="MailOutline" />
                </template>
              </n-input>
            </n-form-item>
            <n-form-item path="password" label="密码">
              <n-input
                v-model:value="loginForm.password"
                type="password"
                show-password-on="click"
                placeholder="请输入密码"
                size="large"
                :input-props="{ autocomplete: 'current-password' }"
              >
                <template #prefix>
                  <n-icon :component="LockClosedOutline" />
                </template>
              </n-input>
            </n-form-item>
            <n-button
              type="primary"
              block
              size="large"
              :loading="authStore.loading"
              @click="handleLogin"
              class="auth-submit-btn"
            >
              登录
            </n-button>
          </n-form>
        </n-tab-pane>

        <!-- 邮箱注册 -->
        <n-tab-pane name="register" tab="邮箱注册">
          <n-form ref="registerFormRef" :model="registerForm" :rules="registerRules" class="auth-form">
            <n-form-item path="email" label="邮箱">
              <n-input
                v-model:value="registerForm.email"
                placeholder="请输入邮箱"
                size="large"
                :input-props="{ autocomplete: 'email' }"
              >
                <template #prefix>
                  <n-icon :component="MailOutline" />
                </template>
              </n-input>
            </n-form-item>
            <n-form-item path="password" label="密码">
              <n-input
                v-model:value="registerForm.password"
                type="password"
                show-password-on="click"
                placeholder="至少6位密码"
                size="large"
                :input-props="{ autocomplete: 'new-password' }"
              >
                <template #prefix>
                  <n-icon :component="LockClosedOutline" />
                </template>
              </n-input>
            </n-form-item>
            <n-form-item path="confirmPassword" label="确认密码">
              <n-input
                v-model:value="registerForm.confirmPassword"
                type="password"
                show-password-on="click"
                placeholder="再次输入密码"
                size="large"
                :input-props="{ autocomplete: 'new-password' }"
              >
                <template #prefix>
                  <n-icon :component="LockClosedOutline" />
                </template>
              </n-input>
            </n-form-item>
            <n-button
              type="primary"
              block
              size="large"
              :loading="authStore.loading"
              @click="handleRegister"
              class="auth-submit-btn"
            >
              注册
            </n-button>
          </n-form>
        </n-tab-pane>

        <!-- GitHub 登录 -->
        <n-tab-pane name="github" tab="GitHub">
          <div class="github-flow">
            <div class="github-icon-area">
              <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor" class="github-svg">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </div>
            <p class="github-desc">使用 GitHub 账号快速登录 OpenQmt</p>
            <p class="github-hint">模拟 GitHub 授权，将自动创建账号并登录</p>
            <n-button
              type="primary"
              block
              size="large"
              :loading="authStore.loading"
              @click="handleGithubLogin"
              class="auth-submit-btn github-btn"
            >
              <template #icon>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </template>
              GitHub 登录
            </n-button>
          </div>
        </n-tab-pane>
      </n-tabs>

      <div class="auth-footer">
        <span>未登录也可浏览行情数据</span>
      </div>
    </div>
  </n-modal>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import {
  NModal, NTabs, NTabPane, NForm, NFormItem, NInput, NButton, NIcon,
  useMessage,
} from "naive-ui";
import { MailOutline, LockClosedOutline } from "@vicons/ionicons5";
import { useAuthStore } from "../stores/auth";
import type { FormInst, FormRules } from "naive-ui";

const props = defineProps<{ show: boolean }>();
const emit = defineEmits<{ "update:show": [value: boolean] }>();

const authStore = useAuthStore();
const message = useMessage();

const activeTab = ref("login");

// ── Login Form ──
const loginFormRef = ref<FormInst | null>(null);
const loginForm = reactive({ email: "", password: "" });
const loginRules: FormRules = {
  email: [
    { required: true, message: "请输入邮箱", trigger: "blur" },
    { type: "email", message: "邮箱格式不正确", trigger: "blur" },
  ],
  password: [{ required: true, message: "请输入密码", trigger: "blur" }],
};

async function handleLogin() {
  try {
    await loginFormRef.value?.validate();
  } catch {
    return;
  }
  const result = await authStore.login(loginForm.email, loginForm.password);
  if (result.success) {
    message.success("登录成功");
    emit("update:show", false);
    resetForms();
  } else {
    message.error(result.message);
  }
}

// ── Register Form ──
const registerFormRef = ref<FormInst | null>(null);
const registerForm = reactive({ email: "", password: "", confirmPassword: "" });
const registerRules: FormRules = {
  email: [
    { required: true, message: "请输入邮箱", trigger: "blur" },
    { type: "email", message: "邮箱格式不正确", trigger: "blur" },
  ],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { min: 6, message: "密码至少6位", trigger: "blur" },
  ],
  confirmPassword: [
    { required: true, message: "请确认密码", trigger: "blur" },
    {
      validator: (_rule, value) => value === registerForm.password,
      message: "两次密码不一致",
      trigger: "blur",
    },
  ],
};

async function handleRegister() {
  try {
    await registerFormRef.value?.validate();
  } catch {
    return;
  }
  const result = await authStore.register(registerForm.email, registerForm.password);
  if (result.success) {
    message.success("注册成功");
    emit("update:show", false);
    resetForms();
  } else {
    message.error(result.message);
  }
}

// ── GitHub Login (mock) ──
async function handleGithubLogin() {
  const result = await authStore.githubLogin();
  if (result.success) {
    message.success("GitHub 登录成功");
    emit("update:show", false);
    resetForms();
  } else {
    message.error(result.message);
  }
}

// ── Helpers ──
function resetForms() {
  loginForm.email = "";
  loginForm.password = "";
  registerForm.email = "";
  registerForm.password = "";
  registerForm.confirmPassword = "";
  activeTab.value = "login";
}
</script>

<style scoped>
.auth-dialog {
  width: 400px;
  max-width: calc(100vw - 32px);
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  padding: 32px 32px 24px;
  box-shadow: var(--shadow-card-hover);
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
  background: var(--gold-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
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

.auth-tabs {
  margin-bottom: 8px;
}

.auth-form {
  padding: 16px 0 0;
}

.auth-submit-btn {
  margin-top: 8px;
  height: 44px;
  font-size: 15px;
  font-weight: 600;
  border-radius: var(--radius-md) !important;
}

.auth-submit-btn:hover {
  opacity: 0.9;
}

.github-btn {
  background: #24292e !important;
}

.github-btn:hover {
  background: #2f363d !important;
}

.github-flow {
  padding: 24px 0;
  text-align: center;
}

.github-icon-area {
  margin-bottom: 16px;
  color: var(--text-primary);
}

.github-desc {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.github-hint {
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: 20px;
}

.auth-footer {
  text-align: center;
  padding-top: 12px;
  border-top: 1px solid var(--border-subtle);
  font-size: 12px;
  color: var(--text-muted);
}
</style>