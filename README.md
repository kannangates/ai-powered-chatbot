# AI-Powered Chatbot with Website Content Search

A smart AI-powered chatbot for Next.js websites that leverages OpenAI/Gemini APIs, website content scraping, and in-memory vector embeddings to provide contextual responses based on your website content.

## Features

- **Dual AI Provider Support**: Seamlessly integrates with both OpenAI and Google's Gemini models
- **Automatic Fallback**: Gracefully switches between AI providers if one fails
- **Website Content Search**: Crawls and indexes your website content to provide context-aware responses
- **WhatsApp Integration**: Fallback to human support via WhatsApp when AI can't provide satisfactory answers
- **Customizable UI**: Easy configuration for chat bubble colors, bot name, welcome messages, and more
- **No Database Required**: Uses in-memory storage for vector embeddings and chat history
- **Mobile-Friendly Design**: Responsive interface works on all device sizes

## Getting Started

### Prerequisites

- Node.js 14 or higher
- API keys for OpenAI and/or Google Gemini (at least one is required)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/ai-powered-chatbot.git
cd ai-powered-chatbot
```

2. Install dependencies
```bash
npm install
```

3. Set up your environment variables in a `.env` file
```
OPENAI_API_KEY=your_openai_api_key
GEMINI_API_KEY=your_gemini_api_key
```

4. Start the development server
```bash
npm run dev
```

## Configuration

All chatbot settings can be customized in `server/config/chatbot.config.ts`:

### UI Configuration
```typescript
ui: {
  // Bot icon settings
  icon: {
    type: 'builtin',         // 'builtin' or 'custom'
    name: 'message-circle',  // Lucide icon name
    customUrl: '',           // URL for custom icon
  },
  // Color settings
  colors: {
    primary: '#2563eb',      // Primary color
    botMessage: '#f3f4f6',   // Bot message bubble color
    userMessage: '#3b82f6',  // User message bubble color
    sendButton: '#2563eb',   // Send button color
  },
  // Text settings
  text: {
    botName: 'AI Assistant',
    welcomeMessage: "Hi there! I'm your AI assistant. How can I help you today?",
    inputPlaceholder: 'Type your message here...',
  },
},
```

### WhatsApp Support Configuration
```typescript
features: {
  whatsapp: {
    enabled: true,
    phoneNumber: '919513734374',  // International format without '+'
    initialMessage: 'Hi',         // Initial WhatsApp message
  },
}
```

### Website Crawling Configuration
```typescript
features: {
  webCrawling: {
    enabled: true,
    maxPages: 20,              // Max pages to crawl
    refreshInterval: 24,       // Refresh interval in hours (0 = manual only)
  },
}
```

### AI Provider Configuration
```typescript
api: {
  defaultProvider: 'openai',    // 'openai' or 'gemini'
  openai: {
    defaultModel: 'gpt-4o',     // OpenAI model to use
  },
  gemini: {
    defaultModel: 'gemini-pro', // Gemini model to use
  },
}
```

## Integration Guide

### Adding to an Existing Next.js Project

1. Copy the server and client folders to your project
2. Install the required dependencies
3. Add the chatbot button to your layout:

```tsx
import { useState } from 'react';
import { ChatbotButton } from '@/components/ui/chatbot-button';
import { ChatbotModal } from '@/components/ui/chatbot-modal';

export default function Layout({ children }) {
  const [chatOpen, setChatOpen] = useState(false);
  
  return (
    <>
      {children}
      <ChatbotButton onClick={() => setChatOpen(true)} />
      <ChatbotModal 
        isOpen={chatOpen} 
        onClose={() => setChatOpen(false)} 
      />
    </>
  );
}
```

## How It Works

1. **Website Crawling**: The system crawls your website's pages and extracts content
2. **Vector Embeddings**: Text content is converted into vector embeddings using AI models
3. **User Queries**: When a user asks a question, it's converted to a vector and compared with website content
4. **Contextual Response**: The AI generates responses based on relevant website content
5. **Fallback Mechanism**: If one AI provider fails, it automatically tries the other
6. **Human Support**: For complex queries, users can be directed to WhatsApp support

## Advanced Usage

### Customizing Error Messages

The chatbot provides informative error messages with WhatsApp support links when:
- API rate limits are exceeded
- Connection issues occur
- The AI can't provide a relevant answer

### Website Content Refresh

You can configure automatic refresh of website content or trigger it manually through the API:

```typescript
// Manual website crawl
await crawlWebsite('https://your-website.com');
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenAI for their GPT models
- Google for Gemini AI
- Next.js team for the amazing framework