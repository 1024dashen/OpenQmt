<template>
  <div class="ai-page">
    <div class="chat-container">
      <div class="chat-messages" ref="messagesRef">
        <div v-if="messages.length === 0" class="welcome-area">
          <div class="welcome-icon-wrap">✨</div>
          <h3 class="welcome-title">AI 分析助手</h3>
          <p class="welcome-desc">输入您感兴趣的领域，AI 将为您推荐相关的投资标的</p>
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
          :class="['chat-bubble', msg.role === 'user' ? 'bubble-user' : 'bubble-ai']"
        >
          <div class="bubble-avatar">{{ msg.role === 'user' ? '👤' : '🤖' }}</div>
          <div class="bubble-body">
            <div class="bubble-text" v-html="formatContent(msg.content)"></div>
            <div class="bubble-time">{{ formatTime(msg.timestamp) }}</div>
          </div>
        </div>

        <div v-if="isLoading" class="chat-bubble bubble-ai">
          <div class="bubble-avatar">🤖</div>
          <div class="bubble-body">
            <div class="bubble-loading">
              <span class="dot"></span><span class="dot"></span><span class="dot"></span>
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
          <button class="send-btn" @click="handleSend" :disabled="!inputText.trim() || isLoading">
            ➤
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from "vue";
import type { AiMessage } from "../types";

const messages = ref<AiMessage[]>([]);
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
  return new Date(ts).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
}

function formatContent(content: string): string {
  return content.replace(/\n/g, "<br>").replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");
}

function scrollToBottom(): void {
  nextTick(() => {
    if (messagesRef.value) messagesRef.value.scrollTop = messagesRef.value.scrollHeight;
  });
}

async function sendQuickQuestion(question: string): Promise<void> {
  inputText.value = question;
  await handleSend();
}

async function handleSend(): Promise<void> {
  const text = inputText.value.trim();
  if (!text || isLoading.value) return;

  messages.value.push({ id: genId(), role: "user", content: text, timestamp: Date.now() });
  inputText.value = "";
  scrollToBottom();

  isLoading.value = true;
  await new Promise((resolve) => setTimeout(resolve, 600 + Math.random() * 1000));

  messages.value.push({ id: genId(), role: "assistant", content: generateAIResponse(text), timestamp: Date.now() });
  isLoading.value = false;
  scrollToBottom();
}

function generateAIResponse(question: string): string {
  const q = question.toLowerCase();
  if (q.includes("黄金") || q.includes("金") || q.includes("xau")) {
    return `**黄金投资分析**\n\n当前黄金板块值得关注的标的：\n\n📈 **相关ETF**\n- 黄金ETF（518880）：跟踪国内金价\n- 黄金基金ETF（518800）：优质黄金投资工具\n\n🏦 **积存金**\n- 适合长期定投，1克起投\n- 当前金价高位区间，建议分批建仓\n\n⚠️ 关注美联储加息节奏与地缘政治`;
  }
  if (q.includes("新能源") || q.includes("光伏")) {
    return `**新能源板块分析**\n\n📊 **推荐基金**\n- 中欧中证机器人指数A（019770）\n- 国泰新能源汽车ETF（159770）\n- 华夏能源革新A（003834）\n\n💡 储能、充电桩、钠电池值得关注\n\n⚠️ 波动较大，建议定投为主`;
  }
  if (q.includes("科技") || q.includes("芯片") || q.includes("半导体") || q.includes("ai")) {
    return `**科技板块分析**\n\n🚀 **AI与算力**\n- AI芯片需求持续增长\n- 算力基础设施投资加速\n\n💻 **推荐关注**\n- 国泰CES芯片ETF联接A（001838）\n- 诺安成长混合（320007）\n\n⚠️ 波动较大，逢低布局`;
  }
  if (q.includes("定投") || q.includes("长期") || q.includes("稳健")) {
    return `**定投基金推荐**\n\n🏦 **宽基指数**\n- 沪深300ETF\n- 中证500ETF\n- 纳斯达克100ETF\n\n💰 **定投策略**\n- 月投收入的10-20%\n- 熊市多投，牛市少投\n- 坚持3年以上\n- 收益30%部分止盈`;
  }
  if (q.includes("基金") || q.includes("排行")) {
    return `**基金推荐**\n\n🔥 **进取型**\n- 中欧中证机器人指数A - 近一年45.60%\n- 国泰新能源汽车ETF - 近一年42.30%\n\n⚖️ **稳健型**\n- 交银新成长混合 - 近一年38.60%\n\n🛡️ **保守型**\n- 鹏华中债国开债A - 近一年3.05%`;
  }
  if (q.includes("股票") || q.includes("a股") || q.includes("指数")) {
    return `**A股市场分析**\n\n📊 上证指数估值合理偏低\n🚀 创业板关注科技成长\n\n💡 建议关注高股息蓝筹+科技成长\n⚠️ 关注宏观经济与外资流向`;
  }
  return `关于"${question}"的建议：\n\n1. 关注市场趋势，不盲目追涨杀跌\n2. 分散投资，降低单一标的风险\n3. 长期投资优于短期投机\n\n⚠️ 以上仅供参考，投资需谨慎`;
}
</script>

<style scoped>
.ai-page {
  max-width: 900px;
  width: 100%;
  min-width: 0;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg-card);
  border-radius: 14px;
  border: 1px solid var(--border-subtle);
  overflow: hidden;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  min-height: 0;
}

@media (max-width: 768px) {
  .chat-messages {
    padding: 16px;
  }
}

.welcome-area {
  text-align: center;
  padding: 50px 20px 30px;
}

.welcome-icon-wrap {
  font-size: 52px;
  margin-bottom: 14px;
  display: inline-block;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}

.welcome-title {
  color: var(--gold-primary);
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 6px;
}

.welcome-desc {
  color: var(--text-muted);
  font-size: 14px;
  margin-bottom: 22px;
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
  background: rgba(212,168,67,0.08);
  border: 1px solid rgba(212,168,67,0.15);
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s;
}

.quick-item:hover {
  background: rgba(212,168,67,0.18);
  color: var(--gold-primary);
  border-color: rgba(212,168,67,0.3);
}

.chat-bubble {
  display: flex;
  gap: 10px;
  margin-bottom: 18px;
  align-items: flex-start;
}

.bubble-user {
  flex-direction: row-reverse;
}

.bubble-avatar {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
  background: rgba(255,255,255,0.06);
}

.bubble-user .bubble-avatar {
  background: rgba(212,168,67,0.15);
}

.bubble-body {
  max-width: 68%;
  min-width: 0;
}

@media (max-width: 768px) {
  .bubble-body {
    max-width: 82%;
  }

  .welcome-area {
    padding: 30px 12px 20px;
  }

  .welcome-title {
    font-size: 18px;
  }

  .quick-item {
    font-size: 12px;
    padding: 5px 10px;
  }

  .chat-input {
    padding: 10px 12px;
  }
}

.bubble-user .bubble-body {
  background: rgba(212,168,67,0.12);
  border: 1px solid rgba(212,168,67,0.2);
  border-radius: 12px 4px 12px 12px;
  padding: 12px 16px;
}

.bubble-ai .bubble-body {
  background: rgba(255,255,255,0.04);
  border: 1px solid var(--border-subtle);
  border-radius: 4px 12px 12px 12px;
  padding: 12px 16px;
}

.bubble-text {
  color: var(--text-secondary);
  line-height: 1.6;
  font-size: 14px;
}

.bubble-text :deep(b) {
  color: var(--gold-primary);
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
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--gold-primary);
  animation: pulse 1.4s infinite;
}

.dot:nth-child(2) { animation-delay: 0.2s; }
.dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes pulse {
  0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
  40% { opacity: 1; transform: scale(1); }
}

.chat-input {
  padding: 14px 20px;
  border-top: 1px solid var(--border-subtle);
  background: var(--bg-secondary);
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
  border-radius: 10px;
  padding: 10px 16px;
  color: var(--text-primary);
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.input-field:focus {
  border-color: rgba(212,168,67,0.3);
}

.input-field::placeholder {
  color: var(--text-muted);
}

.send-btn {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--gold-primary), var(--gold-dark));
  color: #fff;
  border: none;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.send-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, var(--gold-light), var(--gold-primary));
  box-shadow: 0 2px 12px rgba(212,168,67,0.3);
}

.send-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>