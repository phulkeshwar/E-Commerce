import dotenv from "dotenv";
dotenv.config({ override: true });
import { connectDB } from "../config/db.js";
import { handleChat } from "../controllers/chat.controller.js";

async function runTest() {
  await connectDB();

  const queries = [
    "What are your delivery charges and how long does shipping take to Ranchi?",
    "What is your customer support helpline email and working hours?",
    "Can you show me your highest rated products with their ratings?",
    "What is your return policy if my food product arrives damaged?"
  ];

  for (const q of queries) {
    console.log(`\n======================================================`);
    console.log(`QUERY: "${q}"`);
    console.log(`======================================================`);

    const req = {
      body: { message: q, history: [] },
      user: null
    };

    let responseResult = null;
    const res = {
      setHeader: (name, val) => console.log(`[Header] ${name}: ${val}`),
      status: (code) => ({
        json: (data) => {
          console.log(`[Status ${code}] Error:`, data);
        }
      }),
      json: (data) => {
        responseResult = data;
      }
    };

    console.time("Query Time");
    await handleChat(req, res);
    console.timeEnd("Query Time");

    if (responseResult && responseResult.data) {
      console.log("\n[GaramAssistant Answer]:");
      console.log(responseResult.data.message);
    }
  }

  // Test caching: repeat the first query
  console.log(`\n======================================================`);
  console.log(`CACHE TEST: Repeating Query 1 (Should be instant cache hit)`);
  console.log(`======================================================`);
  const reqCache = {
    body: { message: queries[0], history: [] },
    user: null
  };
  const resCache = {
    setHeader: (name, val) => console.log(`[Header] ${name}: ${val}`),
    status: (code) => ({ json: (d) => console.log(d) }),
    json: (d) => console.log("\n[Cached Response Received]:", d.data.message.slice(0, 120) + "...")
  };
  console.time("Cache Time");
  await handleChat(reqCache, resCache);
  console.timeEnd("Cache Time");

  process.exit(0);
}

runTest().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
