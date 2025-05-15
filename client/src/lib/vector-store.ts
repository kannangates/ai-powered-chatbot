import { apiRequest } from "./queryClient";
import { ChatSettings } from "@shared/schema";

// Initiate the crawling of a website to populate the vector store
export async function crawlWebsite(url: string): Promise<void> {
  await apiRequest("POST", "/api/crawl", { url });
}

// Get statistics about the vector store
export async function getVectorStoreStats(): Promise<{ count: number }> {
  const response = await apiRequest("GET", "/api/vectors/stats");
  const data = await response.json();
  return data;
}

// Update chat settings in the backend
export async function updateChatSettings(settings: ChatSettings): Promise<void> {
  await apiRequest("POST", "/api/settings", settings);
}

// Get current chat settings
export async function getChatSettings(): Promise<ChatSettings> {
  const response = await apiRequest("GET", "/api/settings");
  const data = await response.json();
  return data;
}

// Clear chat history
export async function clearChatHistory(): Promise<void> {
  await apiRequest("POST", "/api/chat/clear");
}

// Get chat history
export async function getChatHistory(): Promise<any[]> {
  const response = await apiRequest("GET", "/api/chat/history");
  const data = await response.json();
  return data;
}

// Send a message to the chatbot
export async function sendChatMessage(content: string, role: "user" | "system" = "user"): Promise<any> {
  const response = await apiRequest("POST", "/api/chat", { content, role });
  const data = await response.json();
  return data;
}
