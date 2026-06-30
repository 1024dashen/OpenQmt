import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchGoldData, GOLD_CONFIG } from '../api/market'
import type { GoldDataMap, GoldKey, SymbolConfig } from '../types'

export const useGoldStore = defineStore('gold', () => {
    const data = ref<GoldDataMap>({})
    const loading = ref(false)
    const lastUpdate = ref('')
    const error = ref<string | null>(null)
    const isWeekend = ref(false)

    async function loadData(): Promise<void> {
        loading.value = true
        error.value = null
        try {
            const result = await fetchGoldData()
            data.value = result.data
            isWeekend.value = result.isWeekend
            lastUpdate.value = new Date().toLocaleTimeString('zh-CN')
        } catch (e: unknown) {
            error.value = e instanceof Error ? e.message : String(e)
        } finally {
            loading.value = false
        }
    }

    function getConfig(): Record<GoldKey, SymbolConfig> {
        return GOLD_CONFIG
    }

    return { data, loading, lastUpdate, error, isWeekend, loadData, getConfig }
})
