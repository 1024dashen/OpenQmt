<template>
    <div class="page-toolbar header-toolbar">
        <n-space
            v-if="pageType !== 'learn' && pageType !== 'ai'"
            align="center"
            :size="10"
            class="toolbar-actions"
        >
            <n-tag
                v-if="goldStore.isWeekend"
                size="small"
                :bordered="false"
                type="warning"
                class="weekend-tag"
            >
                周末休市
            </n-tag>
            <n-select
                v-if="pageType === 'fund'"
                v-model:value="fundStore.fundType"
                :options="fundTypeOptions"
                size="small"
                class="fund-type-select"
                @update:value="onFundTypeChange"
            />
        </n-space>

        <n-select
            v-if="pageType === 'learn'"
            v-model:value="learnStore.category"
            :options="learnCategoryOptions"
            size="small"
            class="learn-category-select"
        />

        <n-space
            v-if="pageType === 'ai'"
            align="center"
            :size="8"
            class="toolbar-actions ai-model-toolbar"
        >
            <n-select
                v-model:value="selectedProvider"
                :options="providerOptions"
                size="small"
                class="ai-provider-select"
                @update:value="onProviderChange"
            />
            <n-select
                v-model:value="selectedModel"
                :options="modelOptions"
                size="small"
                class="ai-model-select"
                @update:value="onModelChange"
            />
        </n-space>
    </div>
</template>

<script setup lang="ts">
import { computed, watch, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { NSpace, NSelect, NTag } from 'naive-ui'
import { useGoldStore } from '../stores/gold'
import { useStockStore } from '../stores/stock'
import { useFundStore } from '../stores/fund'
import { useLearnStore } from '../stores/learn'
import { useAiModelSelection } from '../composables/useAiModelSelection'

const route = useRoute()
const goldStore = useGoldStore()
const stockStore = useStockStore()
const fundStore = useFundStore()
const learnStore = useLearnStore()
const {
    selectedProvider,
    selectedModel,
    providerOptions,
    modelOptions,
    onProviderChange,
    onModelChange,
} = useAiModelSelection()

const pageType = computed(() => {
    if (route.path.startsWith('/ai')) return 'ai'
    const key = route.path.replace('/', '') || 'gold'
    if (key === 'gold' || key === 'stock' || key === 'fund' || key === 'learn')
        return key
    return null
})

let timer: ReturnType<typeof setInterval> | null = null

const fundTypeOptions = [
    { label: '全部', value: 'all' },
    { label: '股票型', value: 'gp' },
    { label: '混合型', value: 'hh' },
    { label: '债券型', value: 'zq' },
    { label: '指数型', value: 'zs' },
    { label: 'QDII', value: 'qdii' },
]

const learnCategoryOptions = [
    { label: '全部知识', value: 'all' },
    { label: '基础概念', value: 'basic' },
    { label: '投资策略', value: 'strategy' },
]

function refresh() {
    if (pageType.value === 'gold') goldStore.loadData()
    else if (pageType.value === 'stock') stockStore.loadData()
    else if (pageType.value === 'fund') fundStore.loadData()
}

function onFundTypeChange(type: string) {
    fundStore.setFundType(type)
}

function clearTimer() {
    if (timer) {
        clearInterval(timer)
        timer = null
    }
}

function startAutoRefresh() {
    clearTimer()
    if (pageType.value === 'fund') return
    // 周末休市，不再自动刷新
    if (pageType.value === 'gold' && goldStore.isWeekend) return
    if (pageType.value === 'stock' && stockStore.isWeekend) return
    timer = setInterval(refresh, 10000)
}

watch(
    () => goldStore.isWeekend,
    (isWeekend) => {
        if (isWeekend && pageType.value === 'gold') {
            clearTimer()
        }
    },
)

watch(
    () => stockStore.isWeekend,
    (isWeekend) => {
        if (isWeekend && pageType.value === 'stock') {
            clearTimer()
        }
    },
)

watch(
    pageType,
    (type) => {
        if (!type || type === 'learn' || type === 'ai') {
            clearTimer()
            return
        }
        // 基金列表已有数据时不重新加载（keep-alive 保持状态）
        if (type === 'fund' && fundStore.data.length > 0) {
            return
        }
        refresh()
        startAutoRefresh()
    },
    { immediate: true },
)

onUnmounted(clearTimer)
</script>
