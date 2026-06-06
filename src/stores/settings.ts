import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { ModelProvider, ModelSettings } from "../types";

const SETTINGS_KEY = "openqmt_model_settings";

export const PROVIDER_LABELS: Record<ModelProvider, string> = {
  openai: "OpenAI",
  anthropic: "Anthropic",
  google: "Google Gemini",
  deepseek: "DeepSeek",
  ollama: "Ollama（本地）",
  custom: "自定义",
};

export const PROVIDER_DEFAULTS: Record<
  ModelProvider,
  Pick<ModelSettings, "baseUrl" | "model">
> = {
  openai: {
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-4o-mini",
  },
  anthropic: {
    baseUrl: "https://api.anthropic.com",
    model: "claude-3-5-sonnet-latest",
  },
  google: {
    baseUrl: "https://generativelanguage.googleapis.com/v1beta",
    model: "gemini-2.0-flash",
  },
  deepseek: {
    baseUrl: "https://api.deepseek.com",
    model: "deepseek-chat",
  },
  ollama: {
    baseUrl: "http://localhost:11434/v1",
    model: "llama3.2",
  },
  custom: {
    baseUrl: "",
    model: "",
  },
};

const DEFAULT_SETTINGS: ModelSettings = {
  provider: "openai",
  apiKey: "",
  baseUrl: PROVIDER_DEFAULTS.openai.baseUrl,
  model: PROVIDER_DEFAULTS.openai.model,
};

function loadSettings(): ModelSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw) as Partial<ModelSettings>;
    const provider = parsed.provider ?? DEFAULT_SETTINGS.provider;
    const defaults = PROVIDER_DEFAULTS[provider];
    return {
      provider,
      apiKey: parsed.apiKey ?? "",
      baseUrl: parsed.baseUrl ?? defaults.baseUrl,
      model: parsed.model ?? defaults.model,
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export const useSettingsStore = defineStore("settings", () => {
  const model = ref<ModelSettings>(loadSettings());

  const providerLabel = computed(() => PROVIDER_LABELS[model.value.provider]);

  const providerOptions = computed(() =>
    (Object.keys(PROVIDER_LABELS) as ModelProvider[]).map((key) => ({
      label: PROVIDER_LABELS[key],
      value: key,
    }))
  );

  function setProvider(provider: ModelProvider) {
    const defaults = PROVIDER_DEFAULTS[provider];
    model.value.provider = provider;
    if (provider !== "custom") {
      model.value.baseUrl = defaults.baseUrl;
      model.value.model = defaults.model;
    }
  }

  function save(settings: ModelSettings) {
    model.value = { ...settings };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(model.value));
  }

  function reset() {
    model.value = { ...DEFAULT_SETTINGS };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(model.value));
  }

  return {
    model,
    providerLabel,
    providerOptions,
    setProvider,
    save,
    reset,
  };
});
