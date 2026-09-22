import dotenv from "dotenv";
dotenv.config({ override: true });
import { connectDB } from "../config/db.js";
import { getFormattedRAGContext } from "../services/ragService.js";

async function profile() {
  await connectDB();
  const apiKey = process.env.GEMINI_API_KEY;

  const testQueries = [
    "delivery to Ranchi",
    "show top rated products"
  ];

  for (const q of testQueries) {
    console.log(`\n=== Profiling Query: "${q}" ===`);
    
    console.time("1. RAG Context Retrieval");
    const ragContext = await getFormattedRAGContext(q);
    console.timeEnd("1. RAG Context Retrieval");

    console.time("2. First Gemini Call");
    const res1 = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: q }] }],
          systemInstruction: { parts: [{ text: "You are GaramAssistant.\n" + ragContext }] },
          tools: [{
            functionDeclarations: [{
              name: "search_products",
              description: "Searches products",
              parameters: {
                type: "OBJECT",
                properties: { query: { type: "STRING" } },
                required: ["query"]
              }
            }]
          }]
        })
      }
    );
    const data1 = await res1.json();
    console.timeEnd("2. First Gemini Call");

    const call = data1.candidates?.[0]?.content?.parts?.[0]?.functionCall;
    if (call) {
      console.log("-> Model called tool:", call.name, call.args);
      console.time("3. Second Gemini Call (after tool response)");
      const res2 = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              { role: "user", parts: [{ text: q }] },
              data1.candidates[0].content,
              {
                role: "function",
                parts: [{
                  functionResponse: {
                    name: call.name,
                    response: { result: [{ name: "Organic Honey", rating: 4.8, price: 299 }] }
                  }
                }]
              }
            ]
          })
        }
      );
      const data2 = await res2.json();
      console.timeEnd("3. Second Gemini Call (after tool response)");
      console.log("Final text length:", data2.candidates?.[0]?.content?.parts?.[0]?.text?.length);
    } else {
      console.log("No tool called. Direct answer length:", data1.candidates?.[0]?.content?.parts?.[0]?.text?.length);
    }
  }

  process.exit(0);
}

profile().catch(console.error);
