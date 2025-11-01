import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import Redis from "ioredis";
import crypto from "crypto";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: "5mb" }));

const redis = new Redis(process.env.REDIS_URL || "redis://redis:6379");
const MASTER_KEY = process.env.MASTER_KEY || "master_key_here";

// Puter configuration - can use public puter.com or self-hosted instance
const PUTER_API_ORIGIN = process.env.PUTER_API_ORIGIN || "https://api.puter.com";
const PUTER_AUTH_TOKEN = process.env.PUTER_AUTH_TOKEN || ""; // Optional: for authenticated requests

// Helper: Call Puter Driver API
async function callPuterDriver({ interface: iface, service, method, args }) {
  const response = await fetch(`${PUTER_API_ORIGIN}/drivers/call`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(PUTER_AUTH_TOKEN ? { "Authorization": `Bearer ${PUTER_AUTH_TOKEN}` } : {})
    },
    body: JSON.stringify({
      interface: iface,
      service,
      method,
      args
    })
  });

  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error?.message || "Puter driver call failed");
  }
  
  return data.result;
}

// API Key Middleware
app.use(async (req, res, next) => {
  if (req.path.startsWith('/v1/admin')) return next();
  const apiKey = req.headers["authorization"]?.replace("Bearer ", "");
  if (!apiKey) return res.status(401).json({ error: "Missing API key" });
  const valid = await redis.sismember("api_keys", apiKey);
  if (!valid) return res.status(403).json({ error: "Invalid API key" });
  next();
});

// Helper: format completion
const formatCompletion = (text, model) => ({
  id: "chatcmpl-" + Math.random().toString(36).slice(2),
  object: "chat.completion",
  created: Date.now(),
  model,
  choices: [{ index: 0, message: { role: "assistant", content: text }, finish_reason: "stop" }]
});

// Map model names to Puter services
const mapModelToService = (model) => {
  const serviceMap = {
    "claude-sonnet-4": "claude",
    "claude-opus-4": "claude",
    "claude-3-7-sonnet": "claude",
    "gpt-4": "openai-gpt",
    "gpt-5": "openai-gpt",
    "gpt-3.5-turbo": "openai-gpt"
  };
  return serviceMap[model] || "claude";
};

// Chat completions
app.post("/v1/chat/completions", async (req, res) => {
  const { messages = [], model = "claude-sonnet-4", stream = false, conversation_id } = req.body;
  if (!conversation_id) return res.status(400).json({ error: "conversation_id required" });

  const historyJson = await redis.get(conversation_id);
  const history = historyJson ? JSON.parse(historyJson) : [];
  const fullMessages = [...history, ...messages];

  try {
    const service = mapModelToService(model);
    const driverArgs = {
      messages: fullMessages,
      model: model,
      temperature: req.body.temperature || 1.0
    };

    if (stream) {
      // Note: Streaming via HTTP fetch is more complex and may not work directly
      // You might need to implement SSE handling differently
      res.status(501).json({ 
        error: "Streaming not yet implemented for Puter driver API. Use stream: false" 
      });
    } else {
      const result = await callPuterDriver({
        interface: "puter-chat-completion",
        service: service,
        method: "complete",
        args: driverArgs
      });

      const assistantMessage = result.message?.content || result.text || "";
      const newHistory = fullMessages.concat([{ role: "assistant", content: assistantMessage }]);
      await redis.set(conversation_id, JSON.stringify(newHistory), "EX", 60 * 60 * 24);

      res.json(formatCompletion(assistantMessage, model));
    }
  } catch (err) {
    console.error("Puter API Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Edits endpoint
app.post("/v1/edits", async (req, res) => {
  const { input = "", instruction = "", model = "claude-sonnet-4" } = req.body;
  
  try {
    const service = mapModelToService(model);
    const result = await callPuterDriver({
      interface: "puter-chat-completion",
      service: service,
      method: "complete",
      args: {
        messages: [{
          role: "user",
          content: `Edit the following text based on the instruction:\n\nText: ${input}\n\nInstruction: ${instruction}`
        }],
        model: model
      }
    });

    const editedText = result.message?.content || result.text || "";
    res.json({
      object: "edit",
      created: Date.now(),
      choices: [{ text: editedText, index: 0 }]
    });
  } catch (err) {
    console.error("Puter API Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Embeddings endpoint  
app.post("/v1/embeddings", async (req, res) => {
  res.status(501).json({
    error: "Embeddings are not directly supported via Puter driver API"
  });
});

// Admin API key generation
app.post("/v1/admin/generate_key", async (req, res) => {
  const master = req.headers["x-master-key"];
  if (master !== MASTER_KEY) return res.status(403).json({ error: "Invalid master key" });
  const newKey = crypto.randomBytes(32).toString("hex");
  await redis.sadd("api_keys", newKey);
  res.json({ api_key: newKey });
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "healthy", puter_api: PUTER_API_ORIGIN });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Claude OpenAI wrapper running at http://localhost:${PORT}`);
  console.log(`📡 Using Puter API at: ${PUTER_API_ORIGIN}`);
});
