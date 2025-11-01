# Project Tree

```
claude-openai-wrapper/
│
├── 📄 Core Application Files
│   ├── server.js                 # Main server implementation (Express + Redis + Puter.ai)
│   ├── package.json              # Node.js project configuration & dependencies
│   └── package-lock.json         # Locked dependency versions
│
├── 🐳 Docker & Deployment
│   ├── Dockerfile                # Container definition
│   ├── docker-compose.yml        # Multi-container setup (API + Redis)
│   └── .dockerignore             # Docker build exclusions
│
├── ⚙️ Configuration
│   ├── .env                      # Environment variables (generated, git-ignored)
│   └── .env.example              # Template for environment setup
│
├── 📚 Documentation
│   ├── README.md                 # Main project documentation
│   ├── QUICKSTART.md             # 5-minute setup guide
│   ├── API.md                    # Complete API reference
│   ├── CONTRIBUTING.md           # Developer contribution guide
│   └── BUILD_SUMMARY.md          # This build's summary
│
├── 🧪 Testing & Setup
│   ├── test.js                   # API test suite
│   ├── setup.sh                  # Linux/Mac setup script
│   └── setup.bat                 # Windows setup script
│
├── 🔧 Version Control
│   └── .gitignore                # Git exclusions
│
└── 📦 Dependencies
    └── node_modules/             # Installed packages (82 total)
        ├── express               # Web framework
        ├── cors                  # Cross-origin resource sharing
        ├── body-parser           # Request parsing
        ├── ioredis               # Redis client
        └── ... 78 more packages
```

---

## File Purposes

### 🎯 Essential Files (Must configure)
- `server.js` - The heart of the application
- `.env` - Your configuration (set MASTER_KEY, REDIS_URL)
- `package.json` - Project dependencies

### 🚀 Quick Start Files
- `QUICKSTART.md` - Follow this first
- `setup.sh` / `setup.bat` - One-command setup
- `.env.example` - Copy to `.env`

### 📖 Reference Documentation
- `README.md` - Full feature documentation
- `API.md` - API endpoint details
- `CONTRIBUTING.md` - For contributors

### 🧪 Testing
- `test.js` - Run to verify all endpoints work

### 🐳 Docker Deployment
- `Dockerfile` - Single container
- `docker-compose.yml` - API + Redis together

---

## Workflow

```
1. Setup
   └── Run setup.sh or setup.bat
       └── Installs dependencies
       └── Creates .env from .env.example

2. Configure
   └── Edit .env with your settings
       ├── Set MASTER_KEY
       ├── Set REDIS_URL (if needed)
       └── Set PORT (if needed)

3. Deploy
   └── Option A: Docker
       └── docker-compose up
   └── Option B: Local
       ├── Start Redis
       └── npm start

4. Generate API Key
   └── curl /v1/admin/generate_key
       └── Returns your API key

5. Test
   └── node test.js YOUR_API_KEY
       └── Verifies all endpoints

6. Use
   └── Integrate with OpenAI SDK
       └── Point to http://localhost:3000/v1
```

---

## Dependencies (82 packages)

### Direct Dependencies
```json
{
  "express": "^4.18.2",       // Web server framework
  "cors": "^2.8.5",           // CORS middleware
  "body-parser": "^1.20.2",   // Parse request bodies
  "ioredis": "^5.3.2"         // Redis client
}
```

### Why These Packages?
- **express**: Industry-standard web framework, minimal and flexible
- **cors**: Enable cross-origin requests for web clients
- **body-parser**: Parse JSON request bodies
- **ioredis**: Fast, feature-rich Redis client with promises

### Transitive Dependencies
78 additional packages are installed as dependencies of the above packages.

---

## API Endpoints Tree

```
http://localhost:3000/
└── v1/
    ├── chat/
    │   └── completions      [POST] Chat with conversation history
    ├── edits                [POST] Text editing
    ├── embeddings           [POST] Vector embeddings
    └── admin/
        └── generate_key     [POST] Create API keys (master key required)
```

---

## Data Flow

```
Client Request
    │
    ↓
API Key Middleware (validates API key)
    │
    ↓
Route Handler (chat, edits, embeddings)
    │
    ↓
Redis (fetch conversation history)
    │
    ↓
Puter.ai (send to Claude)
    │
    ↓
Response (stream or JSON)
    │
    ↓
Redis (save conversation history)
    │
    ↓
Client Response
```

---

## Key Technologies

- **Node.js 20+**: JavaScript runtime
- **Express.js**: Web framework
- **Redis**: In-memory data store for conversations
- **Puter.ai**: Claude AI integration
- **Docker**: Containerization
- **ESM Modules**: Modern JavaScript imports

---

## Security Layers

```
External Request
    │
    ↓
[1] CORS Middleware - Cross-origin policy
    │
    ↓
[2] Body Size Limit - Max 5MB
    │
    ↓
[3] API Key Validation - Redis check
    │
    ↓
[4] Master Key Check - Admin endpoints only
    │
    ↓
Handler Logic
```

---

Ready to use! 🚀
