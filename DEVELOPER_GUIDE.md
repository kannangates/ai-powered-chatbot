# Developer Guide

This guide provides information for developers who want to extend, modify, or maintain the AI-powered chatbot.

## Project Structure

```
project-root/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   └── ui/
│   │   │       ├── chatbot-button.tsx     # Chat button component
│   │   │       ├── chatbot-modal.tsx      # Main chat interface
│   │   │       └── typing-indicator.tsx   # Typing animation
│   │   ├── hooks/
│   │   │   ├── use-chat.ts                # Chat logic & state
│   │   │   └── use-mobile.tsx             # Mobile detection
│   │   ├── lib/
│   │   │   ├── ai-providers.ts            # AI provider management
│   │   │   ├── queryClient.ts             # API client setup
│   │   │   ├── utils.ts                   # Utility functions
│   │   │   ├── vector-store.ts            # Vector store API client
│   │   │   └── web-scraper.ts             # Web scraping API client
│   │   ├── pages/
│   │   │   └── home.tsx                   # Home page with chat
│   │   ├── App.tsx                        # Main app component
│   │   └── main.tsx                       # Entry point
│   └── index.html                         # HTML template
├── server/
│   ├── config/
│   │   └── chatbot.config.ts              # Chatbot configuration
│   ├── ai-service.ts                      # AI generation service
│   ├── index.ts                           # Server entry point
│   ├── routes.ts                          # API routes
│   ├── scraper.ts                         # Web crawler implementation
│   ├── storage.ts                         # In-memory data storage
│   ├── vector-store.ts                    # Vector embedding store
│   └── vite.ts                            # Vite configuration
└── shared/
    └── schema.ts                          # Shared type definitions
```

## Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn/UI
- **Backend**: Node.js, Express
- **AI**: OpenAI API, Google Gemini API
- **Storage**: In-memory (non-persistent)
- **Build Tool**: Vite

## Key Concepts

### Vector Store

The vector store is the core of the chatbot's ability to find relevant content. It works by:

1. Converting text into numerical vectors (embeddings) using AI models
2. Storing these vectors in memory with their associated content
3. When a user asks a question, converting it to a vector as well
4. Finding the most similar vectors using cosine similarity
5. Retrieving the associated content to provide context to the AI

The implementation can be found in `server/vector-store.ts`.

### AI Provider Fallback

The system supports both OpenAI and Google Gemini, with automatic fallback:

1. When a user sends a message, it first tries the primary provider (set in config)
2. If that fails (rate limit, API error, etc.), it automatically tries the secondary provider
3. If both providers fail, it offers a WhatsApp support link

The implementation is in `server/ai-service.ts`.

### Website Crawler

The website crawler visits pages on the configured website and extracts content:

1. Starting from a URL, it visits the page and extracts text content
2. It finds links on that page and follows them (up to a configured max depth)
3. It breaks content into chunks of manageable size
4. Each chunk is converted to an embedding and stored in the vector store

The implementation is in `server/scraper.ts`.

## Extending the Chatbot

### Adding a New AI Provider

To add a new AI provider:

1. Add the provider to the `AI_PROVIDERS` array in `client/src/lib/ai-providers.ts`
2. Create a new generation function in `server/ai-service.ts`
3. Update the `generateAIResponse` function to include the new provider
4. Add the provider to the configuration in `server/config/chatbot.config.ts`

### Adding Custom UI Components

The chatbot UI is built with Shadcn/UI components. To customize:

1. Modify the UI components in `client/src/components/ui/`
2. Update the styling in the configuration file
3. The chat bubbles, buttons, and layout can all be customized

### Persisting Data

Currently, the chatbot uses in-memory storage. To add persistence:

1. Create a database schema (PostgreSQL, MongoDB, etc.)
2. Modify the `storage.ts` file to use the database
3. Update the vector store to persist embeddings

## Common Tasks

### Adding a New Route

To add a new API endpoint:

1. Open `server/routes.ts`
2. Add a new route using the Express router
3. Implement the route handler
4. Update relevant client code to use the new endpoint

Example:
```typescript
app.get("/api/new-endpoint", (req, res) => {
  // Route handler code
  res.json({ success: true, data: ... });
});
```

### Modifying the Chat Interface

To update the chat UI:

1. Open `client/src/components/ui/chatbot-modal.tsx`
2. Modify the component as needed
3. Update styles using Tailwind classes

### Changing the Vector Embedding Model

To use a different embedding model:

1. Open `server/vector-store.ts`
2. Modify the `generateOpenAIEmbedding` or `generateGeminiEmbedding` function
3. Update the model parameters as needed

## Testing

### Manual Testing Checklist

1. **Basic Chat Functionality**
   - [ ] Chat button opens the modal
   - [ ] User can send messages
   - [ ] AI responds appropriately
   - [ ] Messages are displayed correctly

2. **Error Handling**
   - [ ] Invalid API key shows appropriate error
   - [ ] Network errors are handled gracefully
   - [ ] Rate limiting errors show WhatsApp support option

3. **Website Crawling**
   - [ ] Website can be crawled successfully
   - [ ] Content is properly stored and searchable
   - [ ] AI responses include relevant website content

## Troubleshooting

### Common Issues

#### API Connection Problems
- Check that API keys are valid
- Verify network connectivity
- Look for rate limiting errors in the logs

#### Poor AI Responses
- Ensure website content is properly crawled
- Check that the vector similarity threshold is appropriate
- Verify that the prompt engineering in `ai-service.ts` is effective

#### UI Issues
- Clear browser cache and reload
- Check console for JavaScript errors
- Verify that all dependencies are installed

## Performance Optimization

- The vector search can be optimized for larger datasets using techniques like LSH (Locality-Sensitive Hashing)
- Website crawling can be made more efficient by implementing priority queues
- Response times can be improved by caching common queries

## Security Considerations

- API keys are stored in memory and should be kept secure
- Input validation should be implemented for all user inputs
- Rate limiting should be applied to prevent abuse
- Consider implementing authentication for production use