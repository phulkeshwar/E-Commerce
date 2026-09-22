import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import { STORE_KNOWLEDGE_CHUNKS } from "../knowledge/storeKnowledge.data.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, "..", "data");
const CACHE_FILE = path.join(DATA_DIR, "knowledge_embeddings.json");

let aiClient = null;
let embeddedChunks = [];
let isInitialized = false;

// Compute cosine similarity between two vectors
function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Fallback keyword relevance score when offline or rate-limited
function keywordRelevanceScore(query, chunk) {
  const queryTokens = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);
  if (queryTokens.length === 0) return 0;

  let score = 0;
  const chunkText = `${chunk.title} ${chunk.category} ${(chunk.tags || []).join(" ")} ${chunk.content}`.toLowerCase();

  for (const token of queryTokens) {
    if (chunk.title.toLowerCase().includes(token)) score += 3;
    if ((chunk.tags || []).some(t => t.toLowerCase().includes(token))) score += 2;
    if (chunkText.includes(token)) score += 1;
  }

  return score;
}

// Get or create Google GenAI client
function getAiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      aiClient = new GoogleGenAI({ apiKey });
    }
  }
  return aiClient;
}

/**
 * Initialize knowledge base vectors.
 * Checks local cache file first; if missing, calls Google GenAI to embed.
 */
export async function initializeRagKnowledge() {
  if (isInitialized && embeddedChunks.length > 0) {
    return embeddedChunks;
  }

  // Ensure data directory exists
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  // 1. Try loading precomputed embeddings from cache
  if (fs.existsSync(CACHE_FILE)) {
    try {
      const cached = JSON.parse(fs.readFileSync(CACHE_FILE, "utf-8"));
      if (Array.isArray(cached) && cached.length === STORE_KNOWLEDGE_CHUNKS.length) {
        embeddedChunks = cached;
        isInitialized = true;
        console.log(`[RAG] Loaded ${embeddedChunks.length} store knowledge embeddings from cache.`);
        return embeddedChunks;
      }
    } catch (err) {
      console.warn("[RAG] Cache read error, will recompute embeddings:", err.message);
    }
  }

  // 2. Generate embeddings using Google GenAI
  const client = getAiClient();
  if (!client) {
    console.warn("[RAG] GEMINI_API_KEY not set. Using keyword fallback for knowledge retrieval.");
    embeddedChunks = STORE_KNOWLEDGE_CHUNKS.map(chunk => ({ ...chunk, vector: null }));
    isInitialized = true;
    return embeddedChunks;
  }

  console.log(`[RAG] Embedding ${STORE_KNOWLEDGE_CHUNKS.length} store knowledge chunks via gemini-embedding-001...`);
  const computed = [];

  for (const chunk of STORE_KNOWLEDGE_CHUNKS) {
    const textToEmbed = `${chunk.title}\nCategory: ${chunk.category}\n${chunk.content}`;
    try {
      const res = await client.models.embedContent({
        model: "gemini-embedding-001",
        contents: textToEmbed
      });

      const vector = res.embeddings?.[0]?.values || null;
      computed.push({
        ...chunk,
        vector
      });
    } catch (err) {
      console.error(`[RAG] Failed to embed chunk ${chunk.id}:`, err.message);
      computed.push({ ...chunk, vector: null });
    }
  }

  embeddedChunks = computed;
  isInitialized = true;

  // 3. Persist to cache file so subsequent startups are instant (₹0 extra calls)
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(embeddedChunks, null, 2), "utf-8");
    console.log(`[RAG] Saved ${embeddedChunks.length} embeddings to ${CACHE_FILE}`);
  } catch (writeErr) {
    console.warn("[RAG] Failed to cache embeddings to disk:", writeErr.message);
  }

  return embeddedChunks;
}

/**
 * Perform semantic vector search over store knowledge chunks.
 * @param {string} query - The user's query
 * @param {number} topK - Number of top chunks to return (default 2)
 * @returns {Promise<Array>} Array of top matching knowledge chunks with scores
 */
export async function searchStoreKnowledge(query, topK = 2) {
  if (!query || typeof query !== "string" || !query.trim()) {
    return [];
  }

  // Ensure knowledge chunks are loaded
  if (!isInitialized || embeddedChunks.length === 0) {
    await initializeRagKnowledge();
  }

  const client = getAiClient();
  let queryVector = null;

  if (client) {
    try {
      const res = await client.models.embedContent({
        model: "gemini-embedding-001",
        contents: query.trim()
      });
      queryVector = res.embeddings?.[0]?.values || null;
    } catch (err) {
      console.warn("[RAG] Query embedding error, falling back to keyword search:", err.message);
    }
  }

  // Vector cosine similarity ranking
  if (queryVector) {
    const scored = embeddedChunks.map(chunk => {
      const score = chunk.vector ? cosineSimilarity(queryVector, chunk.vector) : 0;
      return {
        id: chunk.id,
        category: chunk.category,
        title: chunk.title,
        content: chunk.content,
        score
      };
    });

    scored.sort((a, b) => b.score - a.score);
    // Only return relevant chunks (similarity > 0.35)
    return scored.filter(c => c.score > 0.35).slice(0, topK);
  }

  // Keyword scoring fallback
  const scored = embeddedChunks.map(chunk => ({
    id: chunk.id,
    category: chunk.category,
    title: chunk.title,
    content: chunk.content,
    score: keywordRelevanceScore(query, chunk)
  }));

  scored.sort((a, b) => b.score - a.score);
  return scored.filter(c => c.score > 0).slice(0, topK);
}

/**
 * Helper to build prompt context from retrieved knowledge chunks.
 * @param {string} query - The user's query
 * @returns {Promise<string>} Formatted RAG context string
 */
export async function getFormattedRAGContext(query) {
  const matches = await searchStoreKnowledge(query, 2);
  if (!matches || matches.length === 0) {
    return "";
  }

  const chunksText = matches
    .map(
      (m, idx) =>
        `[Document ${idx + 1}: ${m.title} (Category: ${m.category})]\n${m.content}`
    )
    .join("\n\n");

  return `\n--- RETRIEVED STORE KNOWLEDGE BASE (OFFICIAL GARAMBAZAAR DOCS) ---\n${chunksText}\n---------------------------------------------------------------\nUse the official knowledge above to answer customer inquiries accurately.\n`;
}
