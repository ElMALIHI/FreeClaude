import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import Redis from "ioredis";
import crypto from "crypto";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
require("https://js.puter.com/v2/");

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: "5mb" }));

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");
const MASTER_KEY = process.env.MASTER_KEY || "master_key_here";

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

// Chat completions
app.post("/v1/chat/completions", async (req, res) => {
  const { messages = [], model = "claude-sonnet-4", stream = false, functions = [], conversation_id } = req.body;
  if (!conversation_id) return res.status(400).json({ error: "conversation_id required" });

  const historyJson = await redis.get(conversation_id);
  const history = historyJson ? JSON.parse(historyJson) : [];
  const fullMessages = [...history, ...messages];

  let prompt = fullMessages.map(m => `${m.role}: ${m.content}`).join("\n");
  if (functions.length > 0) {
    prompt += "\n\nInstructions: respond in JSON matching one of these functions: " +
      JSON.stringify(functions.map(f => ({ name: f.name, parameters: f.parameters })));
  }

  try {
    if (stream) {
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.flushHeaders();

      const response = await puter.ai.chat(prompt, { model, stream: true });
      for await (const part of response) {
        const text = part?.text || "";
        if (text) res.write(`data: ${JSON.stringify({ id: "chatcmpl-" + Math.random().toString(36).slice(2), object: "chat.completion.chunk", choices: [{ delta: { content: text }, index: 0, finish_reason: null }] })}\n\n`);
      }
      res.write(`data: ${JSON.stringify({ id: "chatcmpl-" + Math.random().toString(36).slice(2), object: "chat.completion.chunk", choices: [{ delta: {}, index: 0, finish_reason: "stop" }] })}\n\n`);
      res.end();
    } else {
      const response = await puter.ai.chat(prompt, { model });
      const newHistory = fullMessages.concat([{ role: "assistant", content: response.message?.content?.[0]?.text || "" }]);
      await redis.set(conversation_id, JSON.stringify(newHistory), "EX", 60 * 60 * 24);

      let content = response.message?.content?.[0]?.text || "";
      if (functions.length > 0) {
        try { content = JSON.parse(content); } catch {};
      }
      res.json(formatCompletion(content, model));
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Edits endpoint
app.post("/v1/edits", async (req, res) => {
  const { input = "", instruction = "", model = "claude-sonnet-4" } = req.body;
  const prompt = `Edit the following text based on the instruction:\nText: ${input}\nInstruction: ${instruction}`;
  try {
    const response = await puter.ai.chat(prompt, { model });
    res.json({ object: "edit", created: Date.now(), choices: [{ text: response.message?.content?.[0]?.text || "", index: 0 }] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Embeddings endpoint
app.post("/v1/embeddings", async (req, res) => {
  const { input = "", model = "claude-3-7-sonnet" } = req.body;
  try {
    const response = await puter.ai.chat(`Generate a numeric vector embedding for: "${input}"`, { model });
    const embedding = response.message?.content?.[0]?.text.split(",").map(Number) || [];
    res.json({ object: "embedding", data: [{ embedding, index: 0 }], model });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin API key generation
app.post("/v1/admin/generate_key", async (req, res) => {
  const master = req.headers["x-master-key"];
  if (master !== MASTER_KEY) return res.status(403).json({ error: "Invalid master key" });
  const newKey = crypto.randomBytes(32).toString("hex");
  await redis.sadd("api_keys", newKey);
  res.json({ api_key: newKey });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Claude OpenAI wrapper running at http://localhost:${PORT}`));
