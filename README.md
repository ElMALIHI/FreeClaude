# Claude OpenAI-Compatible API Wrapper

A production-ready API server that provides an OpenAI-compatible interface for Claude AI models. Features include multi-turn conversations, function calling, streaming responses, and secure API key management.

## Features

- ✅ **OpenAI-Compatible Endpoints**: Drop-in replacement for OpenAI SDK
- 💬 **Multi-Turn Conversations**: Persistent chat history with Redis
- 🔄 **Streaming Support**: Real-time response streaming
- 🔧 **Function Calling**: JSON-based function call support
- 🔐 **API Key Authentication**: Secure key generation and validation
- 📝 **Text Edits**: Instruction-based text editing
- 🧮 **Embeddings**: Vector embedding generation
- 🐳 **Docker Ready**: Containerized deployment

## Quick Start

### Prerequisites

- Node.js 20+
- Redis server (local or remote)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Start the server:
```bash
npm start
```

The server will start at `http://localhost:3000`

## Usage

### 1. Generate an API Key

```bash
curl -X POST http://localhost:3000/v1/admin/generate_key \
  -H "x-master-key: your_master_key"
```

Response:
```json
{
  "api_key": "your_generated_api_key"
}
```

### 2. Chat Completions

```bash
curl -X POST http://localhost:3000/v1/chat/completions \
  -H "Authorization: Bearer your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "claude-sonnet-4",
    "conversation_id": "user123",
    "messages": [
      {"role": "user", "content": "Hello!"}
    ]
  }'
```

### 3. Streaming Responses

```bash
curl -X POST http://localhost:3000/v1/chat/completions \
  -H "Authorization: Bearer your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "claude-sonnet-4",
    "conversation_id": "user123",
    "messages": [{"role": "user", "content": "Tell me a story"}],
    "stream": true
  }'
```

### 4. Using with OpenAI SDK

```javascript
import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "http://localhost:3000/v1",
  apiKey: "your_api_key"
});

const response = await client.chat.completions.create({
  model: "claude-sonnet-4",
  conversation_id: "user123",
  messages: [
    { role: "user", content: "Hello, Claude!" }
  ]
});

console.log(response.choices[0].message.content);
```

### 5. Text Edits

```bash
curl -X POST http://localhost:3000/v1/edits \
  -H "Authorization: Bearer your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "input": "I loves programming",
    "instruction": "Fix grammar errors",
    "model": "claude-sonnet-4"
  }'
```

### 6. Embeddings

```bash
curl -X POST http://localhost:3000/v1/embeddings \
  -H "Authorization: Bearer your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "input": "Hello world",
    "model": "claude-3-7-sonnet"
  }'
```

## Docker Deployment

### Build the image:
```bash
docker build -t claude-openai-wrapper .
```

### Run the container:
```bash
docker run -p 3000:3000 \
  -e MASTER_KEY=your_master_key \
  -e REDIS_URL=redis://your-redis-host:6379 \
  claude-openai-wrapper
```

### Using Docker Compose:

Create `docker-compose.yml`:
```yaml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - MASTER_KEY=your_master_key
      - REDIS_URL=redis://redis:6379
    depends_on:
      - redis
  
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
```

Run with:
```bash
docker-compose up
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/v1/chat/completions` | POST | Chat completions with conversation history |
| `/v1/edits` | POST | Text editing based on instructions |
| `/v1/embeddings` | POST | Generate text embeddings |
| `/v1/admin/generate_key` | POST | Generate new API keys (requires master key) |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port |
| `REDIS_URL` | `redis://localhost:6379` | Redis connection URL |
| `MASTER_KEY` | `master_key_here` | Master key for API key generation |

## Security

- API keys are required for all endpoints except admin
- Master key required for generating new API keys
- API keys stored securely in Redis
- Conversation history expires after 24 hours

## Development

Run in development mode with auto-reload:
```bash
npm run dev
```

## License

MIT
