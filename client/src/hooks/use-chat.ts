import { useState, useEffect, useCallback } from "react";
import { getChatHistory, sendChatMessage, clearChatHistory } from "../lib/vector-store";
import { nanoid } from "nanoid";
import { Message } from "@shared/schema";

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Load chat history
  useEffect(() => {
    async function loadChatHistory() {
      try {
        setIsLoading(true);
        const history = await getChatHistory();
        
        if (history.length === 0) {
          // Add welcome message if history is empty
          setMessages([{
            id: nanoid(),
            content: "Hi there! I'm your AI assistant. How can I help you today?",
            role: "assistant",
            timestamp: new Date()
          }]);
        } else {
          setMessages(history);
        }
      } catch (err) {
        setError("Failed to load chat history. Please try refreshing the page.");
        console.error("Error loading chat history:", err);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadChatHistory();
  }, []);

  // Send a message
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    try {
      // Optimistically add user message to UI
      const userMessage: Message = {
        id: nanoid(),
        content,
        role: "user",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, userMessage]);
      setIsTyping(true);
      setError(null);
      
      // Send message to backend
      const response = await sendChatMessage(content);
      
      // Add AI response to UI
      setMessages(prev => [...prev, response.message]);
    } catch (err) {
      setError("Failed to send message. Please try again.");
      console.error("Error sending message:", err);
    } finally {
      setIsTyping(false);
    }
  }, []);

  // Clear chat
  const resetChat = useCallback(async () => {
    try {
      await clearChatHistory();
      setMessages([{
        id: nanoid(),
        content: "Hi there! I'm your AI assistant. How can I help you today?",
        role: "assistant",
        timestamp: new Date()
      }]);
      setError(null);
    } catch (err) {
      setError("Failed to clear chat history.");
      console.error("Error clearing chat:", err);
    }
  }, []);

  // Clear error state
  const clearError = () => {
    setError(null);
    setErrorMessage("");
  };

  return {
    messages,
    isLoading,
    isTyping,
    error,
    errorMessage,
    sendMessage,
    resetChat,
    clearError
  };
}
