import { ChatSettings } from "@shared/schema";

// Get the display name of the AI provider for UI display
export function getAIProviderDisplayName(settings: ChatSettings): string {
  if (settings.apiProvider === "openai") {
    return settings.modelName || "OpenAI GPT-4o";
  } else {
    return settings.modelName || "Google Gemini";
  }
}

// Get the AI provider information for configuration
export const AI_PROVIDERS = [
  {
    id: "openai",
    name: "OpenAI (GPT-4/GPT-4o)",
    defaultModel: "gpt-4o",
    models: [
      { id: "gpt-4o", name: "GPT-4o (Recommended)" },
      { id: "gpt-4", name: "GPT-4" },
      { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo" }
    ]
  },
  {
    id: "gemini",
    name: "Google Gemini",
    defaultModel: "gemini-pro",
    models: [
      { id: "gemini-pro", name: "Gemini Pro" },
      { id: "gemini-1.0-pro", name: "Gemini 1.0 Pro" }
    ]
  }
];

// Helper to validate API key format (basic validation)
export function validateAPIKey(apiProvider: string, apiKey: string): boolean {
  if (!apiKey || apiKey.trim() === "") {
    return false;
  }
  
  if (apiProvider === "openai") {
    // OpenAI API keys start with "sk-" and are typically 51 characters
    return apiKey.startsWith("sk-") && apiKey.length > 20;
  } else if (apiProvider === "gemini") {
    // Gemini API keys have varying formats but should be sufficiently long
    return apiKey.length > 10;
  }
  
  return false;
}

// Helper to get a default API key from environment (for development)
export function getDefaultAPIKey(provider: string): string {
  if (provider === "openai") {
    return import.meta.env.VITE_OPENAI_API_KEY || "";
  } else {
    return import.meta.env.VITE_GEMINI_API_KEY || "";
  }
}
