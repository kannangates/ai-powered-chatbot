# API Documentation

This document describes the available endpoints for the AI-powered chatbot system.

## Table of Contents
- [Chat API](#chat-api)
- [Settings API](#settings-api)
- [Vector Store API](#vector-store-api)
- [Website Crawling API](#website-crawling-api)

---

## Chat API

### Get Chat History
Retrieves the chat history for the current session.

```
GET /api/chat/history
```

**Response**
```json
[
  {
    "id": "abc123",
    "content": "Hello, how can I help you today?",
    "role": "assistant",
    "timestamp": "2025-05-15T14:30:00Z"
  },
  {
    "id": "def456",
    "content": "I have a question about your product",
    "role": "user",
    "timestamp": "2025-05-15T14:31:00Z"
  }
]
```

### Send Chat Message
Sends a new message to the chat and receives an AI response.

```
POST /api/chat
```

**Request Body**
```json
{
  "content": "What products do you offer?",
  "role": "user"
}
```

**Response**
```json
{
  "id": "ghi789",
  "content": "We offer a variety of software products including...",
  "role": "assistant",
  "timestamp": "2025-05-15T14:32:00Z"
}
```

### Clear Chat History
Clears the chat history for the current session.

```
POST /api/chat/clear
```

**Response**
```json
{
  "success": true,
  "message": "Chat history cleared"
}
```

---

## Settings API

### Get Chat Settings
Retrieves the current chat settings.

```
GET /api/settings
```

**Response**
```json
{
  "apiProvider": "openai",
  "apiKey": "sk-xxx...xxx",
  "websiteUrl": "https://example.com",
  "uiConfig": {
    "colors": {
      "primary": "#2563eb",
      "botMessage": "#f3f4f6",
      "userMessage": "#3b82f6",
      "sendButton": "#2563eb"
    },
    "icon": {
      "type": "builtin",
      "name": "message-circle"
    },
    "text": {
      "botName": "AI Assistant",
      "welcomeMessage": "Hi there! I'm your AI assistant. How can I help you today?",
      "inputPlaceholder": "Type your message here..."
    }
  },
  "whatsapp": {
    "enabled": true,
    "phoneNumber": "919513734374",
    "initialMessage": "Hi"
  }
}
```

### Update Chat Settings
Updates the chat settings for the current session.

```
POST /api/settings
```

**Request Body**
```json
{
  "apiProvider": "gemini",
  "apiKey": "ai-xxx...xxx",
  "websiteUrl": "https://example.com",
  "modelName": "gemini-pro"
}
```

**Response**
```json
{
  "success": true,
  "message": "Settings updated"
}
```

---

## Vector Store API

### Get Vector Store Statistics
Returns statistics about the in-memory vector store.

```
GET /api/vectors/stats
```

**Response**
```json
{
  "count": 42
}
```

### Clear Vector Store
Clears all embeddings from the vector store.

```
POST /api/vectors/clear
```

**Response**
```json
{
  "success": true,
  "message": "Vector store cleared"
}
```

---

## Website Crawling API

### Crawl Website
Initiates crawling of a website to populate the vector store.

```
POST /api/crawl
```

**Request Body**
```json
{
  "url": "https://example.com"
}
```

**Response**
```json
{
  "success": true,
  "message": "Website crawling started",
  "pagesCrawled": 12
}
```

## Error Responses

All API endpoints return standardized error responses:

```json
{
  "error": true,
  "message": "Detailed error message",
  "code": "ERROR_CODE"
}
```

Common error codes:
- `INVALID_REQUEST`: The request body is invalid
- `API_ERROR`: Error with external API (OpenAI/Gemini)
- `INTERNAL_ERROR`: Server-side error
- `NOT_FOUND`: Requested resource not found
- `UNAUTHORIZED`: API key is missing or invalid

## Rate Limiting

API endpoints are rate-limited to prevent abuse. The current limits are:
- `/api/chat`: 60 requests per minute
- `/api/crawl`: 5 requests per minute

## Authentication

Currently, the API uses session-based authentication with no additional authentication required.