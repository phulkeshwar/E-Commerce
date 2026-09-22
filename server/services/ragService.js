import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import { STORE_KNOWLEDGE_CHUNKS } from "../knowledge/storeKnowledge.data.js";
import { KnowledgeItem } from "../models/KnowledgeItem.model.js";
import { ProductFAQ } from "../models/ProductFAQ.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, "..", "data");
const CACHE_FILE = path.join(DATA_DIR, "knowledge_embeddings.json");

let aiClient = null;
let staticEmbeddedChunks = [];
let isInitialized = false;

// Compute cosine similarity between two vectors
function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0 || vecA.length !== vecB.length) return 0;
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
function keywordRelevanceScore(query, item) {
  const queryTokens = query.toLowerCase().split(/\s+/).filter((t) => t.length > 2);
  if (queryTokens.length === 0) return 0;

  let score = 0;
  const itemText = `${item.title || item.question || ""} ${item.category || ""} ${(item.tags || []).join(" ")} ${
    item.content || item.answer || ""
  }`.toLowerCase();

  for (const token of queryTokens) {
    if ((item.title || item.question || "").toLowerCase().includes(token)) score += 3;
    if ((item.tags || []).some((t) => t.toLowerCase().includes(token))) score += 2;
    if (itemText.includes(token)) score += 1;
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
  if (isInitialized && staticEmbeddedChunks.length > 0) {
    return staticEmbeddedChunks;
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
        staticEmbeddedChunks = cached;
        isInitialized = true;
        return staticEmbeddedChunks;
      }
    } catch (err) {
      console.warn("[RAG] Cache read error, will recompute embeddings:", err.message);
    }
  }

  // 2. Generate embeddings using Google GenAI
  const client = getAiClient();
  if (!client) {
    console.warn("[RAG] GEMINI_API_KEY not set. Using keyword fallback for knowledge retrieval.");
    staticEmbeddedChunks = STORE_KNOWLEDGE_CHUNKS.map((chunk) => ({ ...chunk, vector: null }));
    isInitialized = true;
    return staticEmbeddedChunks;
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

  staticEmbeddedChunks = computed;
  isInitialized = true;

  // 3. Persist to cache file so subsequent startups are instant (₹0 extra calls)
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(staticEmbeddedChunks, null, 2), "utf-8");
    console.log(`[RAG] Saved ${staticEmbeddedChunks.length} embeddings to ${CACHE_FILE}`);
  } catch (writeErr) {
    console.warn("[RAG] Failed to cache embeddings to disk:", writeErr.message);
  }

  return staticEmbeddedChunks;
}

/**
 * Perform semantic vector search over BOTH static store policies AND dynamically learned knowledge.
 * @param {string} query - The user's query
 * @param {number} topK - Number of top chunks to return (default 2)
 * @returns {Promise<Array>} Array of top matching knowledge chunks with scores
 */
export async function searchStoreKnowledge(query, topK = 2) {
  if (!query || typeof query !== "string" || !query.trim()) {
    return [];
  }

  // Ensure knowledge chunks are loaded
  if (!isInitialized || staticEmbeddedChunks.length === 0) {
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

  // Fetch any dynamically learned knowledge items from MongoDB (limit to 50 active items)
  let dynamicItems = [];
  try {
    dynamicItems = await KnowledgeItem.find().sort({ useCount: -1 }).limit(50).lean();
  } catch {
    // MongoDB might not have initialized or no collection yet
  }

  const candidates = [];

  // 1. Score static chunks
  for (const chunk of staticEmbeddedChunks) {
    const score =
      queryVector && chunk.vector ? cosineSimilarity(queryVector, chunk.vector) : keywordRelevanceScore(query, chunk);

    candidates.push({
      id: chunk.id,
      category: chunk.category,
      title: chunk.title,
      content: chunk.content,
      score,
      source: "official_policy"
    });
  }

  // 2. Score dynamic learned items
  for (const item of dynamicItems) {
    const score =
      queryVector && item.vector && item.vector.length > 0
        ? cosineSimilarity(queryVector, item.vector)
        : keywordRelevanceScore(query, item);

    candidates.push({
      id: item._id.toString(),
      category: item.category || "faq",
      title: item.question,
      content: item.answer,
      score,
      source: "learned_knowledge"
    });
  }

  // Sort descending by relevance score
  candidates.sort((a, b) => b.score - a.score);

  // Return top matches that meet the similarity threshold
  const threshold = queryVector ? 0.35 : 1;
  return candidates.filter((c) => c.score >= threshold).slice(0, topK);
}

/**
 * Learn a new Q&A pair dynamically and store it in MongoDB with its vector embedding.
 * This is how the RAG continuously learns from user queries and support interactions!
 */
export async function learnKnowledgePair(question, answer, category = "customer_interaction", source = "system_learned") {
  try {
    if (!question || !answer || question.trim().length < 5 || answer.trim().length < 5) {
      return null;
    }

    const client = getAiClient();
    let vector = [];

    if (client) {
      const textToEmbed = `Question: ${question.trim()}\nAnswer: ${answer.trim()}`;
      const res = await client.models.embedContent({
        model: "gemini-embedding-001",
        contents: textToEmbed
      });
      vector = res.embeddings?.[0]?.values || [];
    }

    // Check if an identical or very close question already exists
    const existing = await KnowledgeItem.findOne({ question: question.trim() });
    if (existing) {
      existing.answer = answer.trim();
      if (vector.length > 0) existing.vector = vector;
      existing.useCount += 1;
      await existing.save();
      return existing;
    }

    const created = await KnowledgeItem.create({
      question: question.trim(),
      answer: answer.trim(),
      category,
      source,
      vector,
      useCount: 1
    });

    console.log(`[RAG] Successfully learned new knowledge item: "${question.trim().slice(0, 50)}..."`);
    return created;
  } catch (err) {
    console.warn("[RAG] Failed to learn knowledge pair:", err.message);
    return null;
  }
}

/**
 * Ingest answered Product FAQs into the dynamic RAG knowledge base.
 */
export async function syncProductFaqsToRag() {
  try {
    const answeredFaqs = await ProductFAQ.find({ isAnswered: true, answer: { $ne: "" } }).lean();
    console.log(`[RAG] Syncing ${answeredFaqs.length} answered product FAQs into vector store...`);

    for (const faq of answeredFaqs) {
      await learnKnowledgePair(faq.question, faq.answer, "product_faq", "seller_qa");
    }
  } catch (err) {
    console.warn("[RAG] syncProductFaqsToRag warning:", err.message);
  }
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
        `[Knowledge Doc ${idx + 1}: ${m.title} (${m.source === "learned_knowledge" ? "Learned Community FAQ" : "Official Policy"})]\n${m.content}`
    )
    .join("\n\n");

  return `\n--- RETRIEVED STORE KNOWLEDGE BASE (OFFICIAL & LEARNED CONTEXT) ---\n${chunksText}\n--------------------------------------------------------------------\nUse the official knowledge above to answer customer inquiries accurately.\n`;
}
