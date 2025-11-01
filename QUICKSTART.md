# Quick Start Guide

Get your Claude OpenAI Wrapper running in 5 minutes!

## Option 1: Local Setup (Recommended for Development)

### Step 1: Prerequisites
- Node.js 20+ installed
- Redis server running

### Step 2: Install
```bash
# Run setup script
bash setup.sh  # Linux/Mac
setup.bat      # Windows

# Or manually
npm install
cp .env.example .env
```

### Step 3: Configure
Edit `.env` file:
```env
PORT=3000
REDIS_URL=redis://localhost:6379
MASTER_KEY=your_secure_master_key
```

### Step 4: Start Server
```bash
npm start
```

### Step 5: Generate API Key
```bash
curl -X POST http://localhost:3000/v1/admin/generate_key \
  -H "x-master-key: your_secure_master_key"
```

### Step 6: Test
```bash
node test.js YOUR_API_KEY
```

---

## Option 2: Docker (Easiest)

### Step 1: Set Master Key
```bash
export MASTER_KEY=your_secure_master_key  # Linux/Mac
set MASTER_KEY=your_secure_master_key     # Windows
```

### Step 2: Start with Docker Compose
```bash
docker-compose up
```

That's it! The server and Redis will start automatically.

### Step 3: Generate API Key
```bash
curl -X POST http://localhost:3000/v1/admin/generate_key \
  -H "x-master-key: your_secure_master_key"
```

---

## Usage Examples

### JavaScript/TypeScript (OpenAI SDK)
```javascript
import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "http://localhost:3000/v1",
  apiKey: "your_api_key"
});

const response = await client.chat.completions.create({
  model: "claude-sonnet-4",
  conversation_id: "user-123",
  messages: [
    { role: "user", content: "Hello!" }
  ]
});

console.log(response.choices[0].message.content);
```

### Python
```python
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:3000/v1",
    api_key="your_api_key"
)

response = client.chat.completions.create(
    model="claude-sonnet-4",
    extra_body={"conversation_id": "user-123"},
    messages=[
        {"role": "user", "content": "Hello!"}
    ]
)

print(response.choices[0].message.content)
```

### cURL
```bash
curl -X POST http://localhost:3000/v1/chat/completions \
  -H "Authorization: Bearer your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "claude-sonnet-4",
    "conversation_id": "user-123",
    "messages": [
      {"role": "user", "content": "Hello!"}
    ]
  }'
```

---

## Troubleshooting

### Server won't start
- Check if Redis is running: `redis-cli ping`
- Check if port 3000 is available
- Check environment variables in `.env`

### API key not working
- Verify the key was generated successfully
- Check Redis connection
- Ensure `Authorization` header format: `Bearer your_api_key`

### Conversation history not persisting
- Verify Redis is running and accessible
- Check `REDIS_URL` in `.env`
- Ensure `conversation_id` is included in requests

---

## Next Steps

1. Read the full [README.md](README.md) for detailed documentation
2. Check [CONTRIBUTING.md](CONTRIBUTING.md) to contribute
3. Explore the API endpoints and features
4. Deploy to production (see README for deployment options)

---

## Support

- Open an issue on GitHub
- Check existing issues for solutions
- Read the documentation

Happy coding! 🚀
