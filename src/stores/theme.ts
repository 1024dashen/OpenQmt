import { defineStore } from "pinia";
import { ref, computed } from "vue";

export type ThemeMode = "dark" | "light";

const THEME_KEY = "openqmt_theme";

export const useThemeStore = defineStore("theme", () => {
  const mode = ref<ThemeMode>((localStorage.getItem(THEME_KEY) as ThemeMode) || "dark");

  const isDark = computed(() => mode.value === "dark");

  function toggle() {
    mode.value = mode.value === "dark" ? "light" : "dark";
    localStorage.setItem(THEME_KEY, mode.value);
    applyTheme();
  }

  function applyTheme() {
    const root = document.documentElement;
    root.setAttribute("data-theme", mode.value);
  }

  function init() {
    applyTheme();
  }

  return { mode, isDark, toggle, init };
});