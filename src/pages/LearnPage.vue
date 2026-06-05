<template>
  <div class="learn-page">
    <div class="page-intro">
      <h2 class="intro-title">技术指标学习</h2>
      <p class="intro-desc">掌握核心技术分析工具，提升投资决策能力</p>
    </div>
    <n-grid :cols="gridCols" :x-gap="14" :y-gap="14">
      <n-gi v-for="topic in topics" :key="topic.id">
        <div class="learn-card" :class="`level-${topic.level}`" @click="selectTopic(topic)">
          <div class="learn-card-inner">
            <div class="learn-card-header">
              <span class="topic-icon">{{ topic.icon }}</span>
              <span class="topic-title">{{ topic.title }}</span>
              <span class="topic-level" :class="`badge-${topic.level}`">{{ topic.level }}</span>
            </div>
            <p class="topic-desc">{{ topic.desc }}</p>
          </div>
        </div>
      </n-gi>
    </n-grid>

    <n-modal
      v-model:show="showModal"
      preset="card"
      :title="currentTopic?.title"
      class="learn-modal"
      :style="{ width: modalWidth, maxHeight: '80vh' }"
      :bordered="false"
    >
      <div class="modal-content" v-if="currentTopic">
        <span class="modal-level" :class="`badge-${currentTopic.level}`">{{ currentTopic.level }}</span>
        <div class="topic-detail" v-html="currentTopic.detail"></div>
      </div>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import type { LearnTopic } from "../types";
import { useBreakpoint } from "../composables/useBreakpoint";

const { isMobile } = useBreakpoint();
const gridCols = computed(() => (isMobile.value ? 1 : 2));
const modalWidth = computed(() => (isMobile.value ? "calc(100vw - 32px)" : "700px"));
const showModal = ref(false);
const currentTopic = ref<LearnTopic | null>(null);

function selectTopic(topic: LearnTopic): void {
  currentTopic.value = topic;
  showModal.value = true;
}

const topics: LearnTopic[] = [
  { id: 1, icon: "📈", title: "K线基础", level: "初级", desc: "学习K线图的构成，阳线阴线的含义，以及各种K线形态的市场信号。",
    detail: `<h3>什么是K线？</h3><p>K线（Candlestick Chart）是最基础的技术分析工具。</p><h4>阳线（红色）</h4><p>收盘价 > 开盘价，表示上涨。实体越长，买方力量越强。</p><ul><li><b>大阳线</b>：强烈看涨信号</li><li><b>小阳线</b>：多空力量接近</li><li><b>上影阳线</b>：上方有卖压</li></ul><h4>阴线（绿色）</h4><p>收盘价 < 开盘价，表示下跌。</p><h4>十字星</h4><p>多空势均力敌，可能是反转信号。</p>` },
  { id: 2, icon: "📊", title: "均线（MA）", level: "初级", desc: "移动平均线是最常用的趋势指标，帮助判断方向和支撑阻力。",
    detail: `<h3>移动平均线</h3><h4>常用周期</h4><ul><li><b>MA5</b>：短期趋势</li><li><b>MA20</b>：中期趋势</li><li><b>MA60</b>：中长期趋势</li><li><b>MA250</b>：牛熊分界线</li></ul><h4>金叉与死叉</h4><p><b>金叉</b>：买入信号。<b>死叉</b>：卖出信号。</p>` },
  { id: 3, icon: "🔺", title: "MACD指标", level: "中级", desc: "趋势跟踪指标，通过快慢均线判断买卖时机。",
    detail: `<h3>MACD</h3><h4>组成要素</h4><ul><li><b>DIF线</b>：12日EMA - 26日EMA</li><li><b>DEA线</b>：DIF的9日EMA</li><li><b>MACD柱</b>：(DIF - DEA) × 2</li></ul><h4>买卖信号</h4><p>金叉买入；死叉卖出。顶背离看跌，底背离看涨。</p>` },
  { id: 4, icon: "⚡", title: "KDJ指标", level: "中级", desc: "超买超卖指标，判断市场超买超卖状态。",
    detail: `<h3>KDJ随机指标</h3><ul><li>K > 80：超买，可能回调</li><li>K < 20：超卖，可能反弹</li><li>J > 100：极度超买</li></ul><p>KDJ在强势趋势中容易钝化。</p>` },
  { id: 5, icon: "🌊", title: "RSI指标", level: "中级", desc: "衡量多空力量对比，判断超买超卖。",
    detail: `<h3>RSI</h3><ul><li>RSI > 80：超买</li><li>RSI < 20：超卖</li></ul><h4>背离</h4><p>顶背离看跌，底背离看涨。</p>` },
  { id: 6, icon: "🎯", title: "布林带（BOLL）", level: "中级", desc: "通过标准差判断价格波动区间。",
    detail: `<h3>布林带</h3><ul><li>触及上轨：可能回调</li><li>触及下轨：可能反弹</li><li>缩口：即将变盘</li></ul>` },
  { id: 7, icon: "📉", title: "成交量分析", level: "初级", desc: "量价配合是技术分析的核心原则。",
    detail: `<h3>成交量分析</h3><ul><li><b>量增价升</b>：健康上涨</li><li><b>量缩价升</b>：动力不足</li><li><b>天量天价</b>：常见顶部</li></ul>` },
  { id: 8, icon: "🏗️", title: "支撑与阻力", level: "初级", desc: "判断买入和卖出时机的基础概念。",
    detail: `<h3>支撑与阻力</h3><ul><li>前期高低点</li><li>整数关口</li><li>均线位置</li></ul><p>突破后角色互换。</p>` },
  { id: 9, icon: "📋", title: "筹码分布", level: "高级", desc: "了解持仓成本结构，判断主力行为。",
    detail: `<h3>筹码分布</h3><ul><li>筹码密集：支撑/阻力</li><li>单峰密集：方向选择</li></ul><h4>主力行为</h4><ul><li>吸筹：低位集中</li><li>派发：高位密集</li></ul>` },
  { id: 10, icon: "🔄", title: "波浪理论", level: "高级", desc: "5浪上涨3浪回调的市场运行规律。",
    detail: `<h3>波浪理论</h3><ul><li>推动浪：1、3、5浪</li><li>调整浪：2、4浪</li><li>回调：A、B、C浪</li></ul><p>实践中争议较大，建议结合其他指标。</p>` },
];
</script>

<style scoped>
.learn-page {
  max-width: 1200px;
  width: 100%;
  min-width: 0;
}

@media (max-width: 480px) {
  .learn-card-header {
    flex-wrap: wrap;
  }

  .topic-title {
    min-width: 0;
  }
}

.page-intro {
  margin-bottom: 22px;
}

.intro-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.intro-desc {
  color: var(--text-muted);
  font-size: 14px;
}

.learn-card {
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.learn-card:hover {
  transform: translateY(-2px);
  background: var(--bg-card-hover);
}

.learn-card.level-初级:hover {
  border-color: rgba(34, 197, 94, 0.25);
  box-shadow: 0 8px 20px rgba(34, 197, 94, 0.08);
}

.learn-card.level-中级:hover {
  border-color: rgba(212, 168, 67, 0.25);
  box-shadow: 0 8px 20px rgba(212, 168, 67, 0.08);
}

.learn-card.level-高级:hover {
  border-color: rgba(239, 68, 68, 0.25);
  box-shadow: 0 8px 20px rgba(239, 68, 68, 0.08);
}

.learn-card-inner {
  padding: 16px 18px;
}

.learn-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.topic-icon {
  font-size: 20px;
}

.topic-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  flex: 1;
}

.topic-level {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 5px;
}

.badge-初级 {
  color: var(--color-down);
  background: var(--color-down-bg);
}

.badge-中级 {
  color: var(--gold-primary);
  background: rgba(212,168,67,0.12);
}

.badge-高级 {
  color: var(--color-up);
  background: var(--color-up-bg);
}

.topic-desc {
  color: var(--text-muted);
  font-size: 13px;
  line-height: 1.5;
  margin: 0;
}

.modal-content {
  color: var(--text-secondary);
  line-height: 1.8;
}

.modal-level {
  display: inline-block;
  margin-bottom: 12px;
}

.modal-content :deep(h3) {
  color: var(--gold-primary);
  margin: 14px 0 6px;
  font-size: 15px;
}

.modal-content :deep(h4) {
  color: var(--gold-light);
  margin: 10px 0 4px;
  font-size: 13px;
}

.modal-content :deep(ul) {
  padding-left: 18px;
  margin: 6px 0;
}

.modal-content :deep(li) {
  margin: 3px 0;
  color: var(--text-secondary);
}

.modal-content :deep(b) {
  color: var(--text-primary);
}
</style>