/**
 * Chatbot Configuration
 * 
 * This file contains all customizable settings for the chatbot.
 * Edit these values to change the appearance and behavior of the chatbot.
 */

export interface ChatbotConfig {
  // Display settings
  ui: {
    // Main bot icon settings
    icon: {
      type: 'builtin' | 'custom'; // Use 'builtin' for included icons or 'custom' for an external image
      name: string; // For builtin: 'bot', 'message', 'question', etc.
      // If using a custom icon, specify the URL here
      customUrl?: string;
    };
    // Color settings
    colors: {
      primary: string; // Primary color for buttons, highlights (HEX format)
      botMessage: string; // Bot message bubble color (HEX format)
      userMessage: string; // User message bubble color (HEX format)
      sendButton: string; // Send button color (HEX format)
    };
    // Text settings
    text: {
      botName: string; // Name displayed in the chat header
      welcomeMessage: string; // Initial message shown to the user
      inputPlaceholder: string; // Placeholder text in the input field
    };
  };
  
  // Function settings
  features: {
    // WhatsApp support settings
    whatsapp: {
      enabled: boolean;
      phoneNumber: string; // Format: international number without '+' (e.g. 919513734374)
      initialMessage: string; // Initial WhatsApp message (e.g. 'Hi')
    };
    // Website crawling settings
    webCrawling: {
      enabled: boolean;
      maxPages: number; // Maximum number of pages to crawl
      refreshInterval: number; // Refresh interval in hours (0 = manual only)
    };
  };
  
  // API settings (these are applied as defaults but can be overridden via environment variables)
  api: {
    defaultProvider: 'openai' | 'gemini';
    openai: {
      defaultModel: string; // Default model to use (e.g., 'gpt-4o', 'gpt-3.5-turbo')
    };
    gemini: {
      defaultModel: string; // Default model to use (e.g., 'gemini-pro')
    };
  };
}

// The main configuration object
const chatbotConfig: ChatbotConfig = {
  ui: {
    icon: {
      type: 'builtin',
      name: 'message-circle', // This refers to a Lucide icon name
    },
    colors: {
      primary: '#2563eb', // Blue
      botMessage: '#f3f4f6', // Light gray
      userMessage: '#3b82f6', // Blue
      sendButton: '#2563eb', // Blue
    },
    text: {
      botName: 'AI Assistant',
      welcomeMessage: "Hi there! I'm your AI assistant. How can I help you today?",
      inputPlaceholder: 'Type your message here...',
    },
  },
  features: {
    whatsapp: {
      enabled: true,
      phoneNumber: '919513734374',
      initialMessage: 'Hi',
    },
    webCrawling: {
      enabled: true,
      maxPages: 20,
      refreshInterval: 24, // 24 hours
    },
  },
  api: {
    defaultProvider: 'openai',
    openai: {
      defaultModel: 'gpt-4o',
    },
    gemini: {
      defaultModel: 'gemini-pro',
    },
  },
};

export default chatbotConfig;