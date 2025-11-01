# API Documentation

Complete API reference for Claude OpenAI-Compatible Wrapper.

## Base URL
```
http://localhost:3000/v1
```

## Authentication

All endpoints (except `/v1/admin/*`) require API key authentication:

```
Authorization: Bearer YOUR_API_KEY
```

---

## Endpoints

### 1. Chat Completions

Create a chat completion with conversation history.

**Endpoint:** `POST /v1/chat/completions`

**Headers:**
```
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json
```

**Request Body:**
```json
{
  "model": "claude-sonnet-4",
  "conversation_id": "unique-conversation-id",
  "messages": [
    {
      "role": "user",
      "content": "Hello, how are you?"
    }
  ],
  "stream": false,
  "functions": []
}
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `model` | string | No | Model to use (default: "claude-sonnet-4") |
| `conversation_id` | string | Yes | Unique ID for conversation persistence |
| `messages` | array | Yes | Array of message objects |
| `stream` | boolean | No | Enable streaming (default: false) |
| `functions` | array | No | Function definitions for function calling |

**Message Object:**
```json
{
  "role": "user|assistant|system",
  "content": "Message content"
}
```

**Response (Non-streaming):**
```json
{
  "id": "chatcmpl-abc123",
  "object": "chat.completion",
  "created": 1699999999,
  "model": "claude-sonnet-4",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "I'm doing well, thank you!"
      },
      "finish_reason": "stop"
    }
  ]
}
```

**Response (Streaming):**
Server-sent events stream:
```
data: {"id":"chatcmpl-abc123","object":"chat.completion.chunk","choices":[{"delta":{"content":"I'm"},"index":0,"finish_reason":null}]}

data: {"id":"chatcmpl-abc123","object":"chat.completion.chunk","choices":[{"delta":{"content":" doing"},"index":0,"finish_reason":null}]}

data: {"id":"chatcmpl-abc123","object":"chat.completion.chunk","choices":[{"delta":{},"index":0,"finish_reason":"stop"}]}
```

**Example:**
```bash
curl -X POST http://localhost:3000/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "claude-sonnet-4",
    "conversation_id": "user-123-session-1",
    "messages": [
      {"role": "user", "content": "What is the capital of France?"}
    ]
  }'
```

---

### 2. Text Edits

Edit text based on instructions.

**Endpoint:** `POST /v1/edits`

**Headers:**
```
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json
```

**Request Body:**
```json
{
  "input": "I loves programming",
  "instruction": "Fix grammar errors",
  "model": "claude-sonnet-4"
}
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `input` | string | Yes | Text to edit |
| `instruction` | string | Yes | Editing instruction |
| `model` | string | No | Model to use (default: "claude-sonnet-4") |

**Response:**
```json
{
  "object": "edit",
  "created": 1699999999,
  "choices": [
    {
      "text": "I love programming",
      "index": 0
    }
  ]
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/v1/edits \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "input": "The quick brown fox jump over the lazy dog",
    "instruction": "Fix the verb tense",
    "model": "claude-sonnet-4"
  }'
```

---

### 3. Embeddings

Generate vector embeddings for text.

**Endpoint:** `POST /v1/embeddings`

**Headers:**
```
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json
```

**Request Body:**
```json
{
  "input": "Hello world",
  "model": "claude-3-7-sonnet"
}
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `input` | string | Yes | Text to embed |
| `model` | string | No | Model to use (default: "claude-3-7-sonnet") |

**Response:**
```json
{
  "object": "embedding",
  "data": [
    {
      "embedding": [0.1, 0.2, 0.3, ...],
      "index": 0
    }
  ],
  "model": "claude-3-7-sonnet"
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/v1/embeddings \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "input": "Machine learning is fascinating",
    "model": "claude-3-7-sonnet"
  }'
```

---

### 4. Generate API Key (Admin)

Generate a new API key.

**Endpoint:** `POST /v1/admin/generate_key`

**Headers:**
```
x-master-key: YOUR_MASTER_KEY
```

**Request Body:** None

**Response:**
```json
{
  "api_key": "a1b2c3d4e5f6..."
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/v1/admin/generate_key \
  -H "x-master-key: your_master_key"
```

---

## Function Calling

To use function calling, include a `functions` array in your chat completion request:

```json
{
  "model": "claude-sonnet-4",
  "conversation_id": "user-123",
  "messages": [
    {"role": "user", "content": "What's the weather in New York?"}
  ],
  "functions": [
    {
      "name": "get_weather",
      "description": "Get weather for a location",
      "parameters": {
        "type": "object",
        "properties": {
          "location": {
            "type": "string",
            "description": "City name"
          }
        },
        "required": ["location"]
      }
    }
  ]
}
```

The model will respond with a JSON object matching the function schema.

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message description"
}
```

**HTTP Status Codes:**

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad Request (missing required fields) |
| 401 | Unauthorized (missing API key) |
| 403 | Forbidden (invalid API key or master key) |
| 500 | Internal Server Error |

---

## Rate Limits

Currently no rate limits are enforced. Consider implementing rate limiting for production use.

---

## Conversation Persistence

Conversations are stored in Redis with a 24-hour expiration. To continue a conversation, use the same `conversation_id` across requests.

**Example Multi-turn Conversation:**

```javascript
// First message
await client.chat.completions.create({
  model: "claude-sonnet-4",
  conversation_id: "user-123",
  messages: [
    { role: "user", content: "My name is Alice" }
  ]
});

// Second message (remembers context)
await client.chat.completions.create({
  model: "claude-sonnet-4",
  conversation_id: "user-123",
  messages: [
    { role: "user", content: "What's my name?" }
  ]
});
// Response: "Your name is Alice"
```

---

## Best Practices

1. **Unique Conversation IDs**: Use unique, user-specific conversation IDs
2. **Error Handling**: Always implement try-catch for API calls
3. **Streaming**: Use streaming for long responses to improve UX
4. **API Keys**: Keep API keys secure, never commit to version control
5. **Master Key**: Store master key as environment variable only

---

## SDK Examples

### OpenAI SDK (JavaScript)
```javascript
import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "http://localhost:3000/v1",
  apiKey: process.env.API_KEY
});

const response = await client.chat.completions.create({
  model: "claude-sonnet-4",
  conversation_id: "user-123",
  messages: [{ role: "user", content: "Hello!" }]
});
```

### OpenAI SDK (Python)
```python
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:3000/v1",
    api_key=os.getenv("API_KEY")
)

response = client.chat.completions.create(
    model="claude-sonnet-4",
    extra_body={"conversation_id": "user-123"},
    messages=[{"role": "user", "content": "Hello!"}]
)
```

---

## Support

For issues or questions, please open an issue on GitHub.
