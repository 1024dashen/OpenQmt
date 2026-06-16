import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { getCurrentWindow } from "@tauri-apps/api/window";

export type ThemeMode = "dark" | "light";

const THEME_KEY = "openqmt_theme";

export const useThemeStore = defineStore("theme", () => {
  const mode = ref<ThemeMode>((localStorage.getItem(THEME_KEY) as ThemeMode) || "dark");

  const isDark = computed(() => mode.value === "dark");

  async function toggle() {
    mode.value = mode.value === "dark" ? "light" : "dark";
    localStorage.setItem(THEME_KEY, mode.value);
    applyTheme();
    await setTauriTheme();
  }

  function applyTheme() {
    const root = document.documentElement;
    root.setAttribute("data-theme", mode.value);
  }

  async function setTauriTheme() {
    try {
      const window = getCurrentWindow();
      // Tauri 的主题值: "Light", "Dark", 或 "Auto"
      const tauriTheme = mode.value === "dark" ? "Dark" : "Light";
      await window.setTheme(tauriTheme as any);
    } catch (error) {
      console.warn("Failed to set Tauri theme:", error);
    }
  }

  function init() {
    applyTheme();
    setTauriTheme();
  }

  return { mode, isDark, toggle, init };
});