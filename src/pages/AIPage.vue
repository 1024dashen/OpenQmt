<template>
  <div class="ai-page">
    <div class="chat-container surface-card surface-card--flat">
      <div class="chat-messages" ref="messagesRef">
        <div v-if="messages.length === 0" class="welcome-area">
          <div class="welcome-icon-wrap">✨</div>
          <h3 class="welcome-title">AI 分析助手</h3>
          <p class="welcome-desc">
            输入您感兴趣的领域，AI 将为您推荐相关的投资标的
          </p>
          <p class="welcome-provider">
            当前模型：{{ currentProviderLabel }} ·
            {{ selectedModel }}
          </p>
          <div class="quick-questions">
            <div
              v-for="q in quickQuestions"
              :key="q"
              class="quick-item"
              @click="sendQuickQuestion(q)"
            >
              {{ q }}
            </div>
          </div>
        </div>

        <div
          v-for="msg in messages"
          :key="msg.id"
          :class="[
            'chat-bubble',
            msg.role === 'user' ? 'bubble-user' : 'bubble-ai',
          ]"
        >
          <div class="bubble-avatar">
            {{ msg.role === "user" ? "👤" : "🤖" }}
          </div>
          <div class="bubble-body">
            <div class="bubble-text" v-html="formatContent(msg.content)"></div>
            <div class="bubble-time">
              {{ formatTime(msg.timestamp) }}
            </div>
          </div>
        </div>

        <div
          v-if="
            isLoading &&
            messages.length > 0 &&
            messages[messages.length - 1].content === ''
          "
          class="chat-bubble bubble-ai"
        >
          <div class="bubble-avatar">🤖</div>
          <div class="bubble-body">
            <div class="bubble-loading">
              <span class="dot"></span><span class="dot"></span
              ><span class="dot"></span>
            </div>
          </div>
        </div>
      </div>

      <div class="chat-input">
        <div class="input-wrap">
          <input
            v-model="inputText"
            type="text"
            class="input-field"
            placeholder="输入问题，如：推荐新能源基金..."
            @keydown.enter.exact="handleSend"
          />
          <button
            class="send-btn"
            @click="handleSend"
            :disabled="!inputText.trim() || isLoading"
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from "vue";
import { useMessage } from "naive-ui";
import { httpFetch } from "../utils/http";
import type { AiMessage } from "../types";
import { useSettingsStore } from "../stores/settings";
import { useAiStore } from "../stores/ai";
import { useAiModelSelection } from "../composables/useAiModelSelection";

const settingsStore = useSettingsStore();
const aiStore = useAiStore();
const message = useMessage();
const { selectedProvider, selectedModel, currentProviderLabel } =
  useAiModelSelection();

const messages = computed(() => aiStore.currentConversation?.messages || []);
const inputText = ref("");
const isLoading = ref(false);
const messagesRef = ref<HTMLElement | null>(null);

const quickQuestions = [
  "推荐新能源相关的基金",
  "黄金现在值得投资吗",
  "科技股有哪些值得关注",
  "适合定投的基金有哪些",
];

function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatContent(content: string): string {
  return content
    .replace(/\n/g, "<br>")
    .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")
    .replace(/`(.*?)`/g, "<code>$1</code>");
}

function scrollToBottom(): void {
  nextTick(() => {
    if (messagesRef.value)
      messagesRef.value.scrollTop = messagesRef.value.scrollHeight;
  });
}

/** 确保有当前对话，如果没有则创建 */
function ensureConversation(): void {
  if (!aiStore.currentConversationId) {
    aiStore.createConversation(selectedProvider.value, selectedModel.value);
  }
}

async function sendQuickQuestion(question: string): Promise<void> {
  inputText.value = question;
  await handleSend();
}

async function handleSend(): Promise<void> {
  const text = inputText.value.trim();
  if (!text || isLoading.value) return;

  // 检查 API Key
  const config = settingsStore.model.providers[selectedProvider.value];
  if (!config || !config.apiKey) {
    message.error("请先在系统设置中配置 API Key");
    return;
  }

  // 确保有当前对话
  ensureConversation();

  const userMessage: AiMessage = {
    id: genId(),
    role: "user",
    content: text,
    timestamp: Date.now(),
  };
  aiStore.addMessage(userMessage);
  inputText.value = "";
  scrollToBottom();

  isLoading.value = true;

  // 创建一个空的 AI 消息用于流式更新
  const aiMessageId = genId();
  aiStore.addMessage({
    id: aiMessageId,
    role: "assistant",
    content: "",
    timestamp: Date.now(),
  });

  try {
    await callAIStream(text, aiMessageId);
  } catch (error: any) {
    message.error(error.message || "请求失败");
    aiStore.updateMessage(
      aiMessageId,
      `❌ 请求失败: ${error.message || "未知错误"}`,
    );
  } finally {
    isLoading.value = false;
    scrollToBottom();
  }
}

async function callAIStream(
  userMessage: string,
  messageId: string,
): Promise<void> {
  const config = settingsStore.model.providers[selectedProvider.value];
  if (!config) throw new Error("模型配置不存在");

  const baseUrl = config.baseUrl;
  const apiKey = config.apiKey;
  const model = selectedModel.value;

  // 构建请求 URL
  const url = `${baseUrl}/chat/completions`;

  // 构建请求体，启用流式输出
  const requestBody = {
    model: model,
    messages: [
      {
        role: "system",
        content: settingsStore.model.systemPrompt,
      },
      {
        role: "user",
        content: userMessage,
      },
    ],
    temperature: 0.7,
    max_tokens: 2000,
    stream: true, // 启用流式输出
  };

  try {
    const response = await httpFetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    // 处理流式响应
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("无法读取响应流");
    }

    const decoder = new TextDecoder();
    let buffer = "";
    let fullContent = "";

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      // 解码数据块
      buffer += decoder.decode(value, { stream: true });

      // 解析 SSE 数据
      const lines = buffer.split("\n");
      buffer = lines.pop() || ""; // 保留最后一个不完整的行

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine || trimmedLine.startsWith(":")) {
          continue; // 跳过空行和注释
        }

        if (trimmedLine.startsWith("data: ")) {
          const dataStr = trimmedLine.slice(6);

          if (dataStr === "[DONE]") {
            return; // 流结束
          }

          try {
            const data = JSON.parse(dataStr);
            const delta = data.choices?.[0]?.delta?.content;

            if (delta) {
              fullContent += delta;

              // 更新消息内容
              aiStore.updateMessage(messageId, fullContent);
              scrollToBottom();
            }
          } catch (e) {
            console.warn("Failed to parse SSE data:", e);
          }
        }
      }
    }
  } catch (error: any) {
    if (error.message) {
      throw error;
    }
    throw new Error("网络请求失败");
  }
}
</script>

<style scoped>
.ai-page {
  padding: var(--content-padding);
  max-width: 100%;
  width: 100%;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.chat-container {
  display: flex;
  flex-direction: column;
  flex: 1 1 0;
  min-height: 0;
  overflow: hidden;
}

.chat-messages {
  flex: 1 1 0;
  overflow-y: auto;
  padding: 24px;
  min-height: 0;
}

.welcome-area {
  text-align: center;
  padding: 48px 20px 28px;
}

.welcome-icon-wrap {
  font-size: 40px;
  margin-bottom: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  background: var(--surface-muted);
  border-radius: var(--radius-lg);
}

.welcome-title {
  color: var(--text-primary);
  font-size: 18px;
  font-weight: 600;
  letter-spacing: -0.02em;
  margin-bottom: 6px;
}

.welcome-desc {
  color: var(--text-muted);
  font-size: 14px;
  margin-bottom: 8px;
  line-height: 1.5;
}

.welcome-provider {
  color: var(--text-muted);
  font-size: 12px;
  margin-bottom: 24px;
}

.quick-questions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
}

.quick-item {
  cursor: pointer;
  color: var(--text-secondary);
  background: var(--surface-muted);
  border: 1px solid var(--border-subtle);
  padding: 8px 14px;
  border-radius: 100px;
  font-size: 13px;
  font-weight: 500;
  transition:
    background var(--transition-fast),
    color var(--transition-fast),
    border-color var(--transition-fast);
}

.quick-item:hover {
  background: var(--bg-card-hover);
  color: var(--text-primary);
  border-color: var(--border-accent);
}

.chat-bubble {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
  align-items: flex-start;
}

.bubble-user {
  flex-direction: row-reverse;
}

.bubble-avatar {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  flex-shrink: 0;
  background: var(--surface-muted);
}

.bubble-user .bubble-avatar {
  background: rgba(212, 168, 67, 0.12);
}

.bubble-body {
  max-width: 72%;
  min-width: 0;
}

.bubble-user .bubble-body {
  background: rgba(212, 168, 67, 0.1);
  border: 1px solid rgba(212, 168, 67, 0.15);
  border-radius: var(--radius-lg) var(--radius-sm) var(--radius-lg)
    var(--radius-lg);
  padding: 12px 16px;
}

.bubble-ai .bubble-body {
  background: var(--surface-muted);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm) var(--radius-lg) var(--radius-lg)
    var(--radius-lg);
  padding: 12px 16px;
}

.bubble-text {
  color: var(--text-secondary);
  line-height: 1.65;
  font-size: 14px;
}

.bubble-text :deep(b) {
  color: var(--text-primary);
  font-weight: 600;
}

.bubble-text :deep(code) {
  background: var(--bg-card);
  padding: 2px 6px;
  border-radius: 4px;

  font-size: 13px;
}

.bubble-time {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 6px;
  text-align: right;
}

.bubble-loading {
  display: flex;
  gap: 5px;
  padding: 4px 0;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--gold-primary);
  animation: pulse 1.4s infinite;
}

.dot:nth-child(2) {
  animation-delay: 0.2s;
}
.dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes pulse {
  0%,
  80%,
  100% {
    opacity: 0.3;
    transform: scale(0.8);
  }
  40% {
    opacity: 1;
    transform: scale(1);
  }
}

.chat-input {
  flex-shrink: 0;
  padding: 14px 16px;
  border-top: 1px solid var(--border-subtle);
  background: var(--surface-muted);
}

.input-wrap {
  display: flex;
  gap: 10px;
  align-items: center;
}

.input-field {
  flex: 1;
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 11px 16px;
  color: var(--text-primary);
  font-size: 14px;
  outline: none;
  transition:
    border-color var(--transition-fast),
    box-shadow var(--transition-fast);
}

.input-field:focus {
  border-color: var(--border-accent);
  box-shadow: 0 0 0 3px rgba(212, 168, 67, 0.08);
}

.input-field::placeholder {
  color: var(--text-muted);
}

.send-btn {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  background: var(--gold-primary);
  color: #fff;
  border: none;
  font-size: 16px;
  cursor: pointer;
  transition:
    opacity var(--transition-fast),
    transform var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.send-btn:hover:not(:disabled) {
  opacity: 0.9;
}

.send-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .chat-messages {
    padding: 16px;
  }

  .bubble-body {
    max-width: 85%;
  }

  .welcome-area {
    padding: 32px 12px 20px;
  }

  .quick-item {
    font-size: 12px;
    padding: 6px 12px;
  }

  .chat-input {
    padding: 10px 12px;
  }
}
</style>
