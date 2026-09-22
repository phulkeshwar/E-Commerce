import { Product } from "../models/Product.model.js";
import { Order } from "../models/Order.model.js";
import { ChatSession } from "../models/ChatSession.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { getFormattedRAGContext, learnKnowledgePair } from "../services/ragService.js";
import { getCache, setCache } from "../utils/cache.js";

// Helper to search products in Mongoose with live rating, reviews, stock, and price
const searchProductsTool = async (query) => {
  try {
    if (!query || typeof query !== "string") {
      return [];
    }

    const cleanQuery = query.trim();
    const isRatingQuery = /top|best|high|rating|rated|popular|review/i.test(cleanQuery);

    let products = [];

    // If looking for top/best rated, prioritize rating sort
    if (isRatingQuery) {
      products = await Product.find({ isPublished: true })
        .sort({ rating: -1, reviewsCount: -1 })
        .limit(5)
        .lean();
    }

    // Try text index search
    if (products.length === 0) {
      products = await Product.find(
        { $text: { $search: cleanQuery }, isPublished: true },
        { score: { $meta: "textScore" } }
      )
        .sort({ score: { $meta: "textScore" } })
        .limit(5)
        .lean();
    }

    // Fallback to regex search across name, category, and description
    if (products.length === 0) {
      products = await Product.find({
        $or: [
          { name: { $regex: cleanQuery, $options: "i" } },
          { category: { $regex: cleanQuery, $options: "i" } },
          { description: { $regex: cleanQuery, $options: "i" } }
        ],
        isPublished: true
      })
        .sort({ rating: -1 })
        .limit(5)
        .lean();
    }

    return products.map((p) => {
      const discount =
        p.originalPrice && p.originalPrice > p.price
          ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
          : 0;

      return {
        id: p._id.toString(),
        name: p.name,
        price: p.price,
        originalPrice: p.originalPrice || null,
        discountPercent: discount > 0 ? `${discount}% OFF` : null,
        rating: p.rating ? Number(p.rating.toFixed(1)) : 0,
        reviewsCount: p.reviewsCount || 0,
        emoji: p.emoji || "📦",
        category: p.category,
        inStock: p.inStock,
        stockCount: p.stockCount,
        link: `/products/${p._id.toString()}`,
        variants: (p.variants || []).map((v) => ({
          name: v.name,
          price: v.price,
          stockCount: v.stockCount
        }))
      };
    });
  } catch (err) {
    console.error("searchProductsTool error:", err);
    return [];
  }
};

// Helper to look up an order status
const trackOrderTool = async (userId, orderNumber) => {
  try {
    const query = {};
    if (orderNumber) {
      query.orderNumber = orderNumber.trim().toUpperCase();
    } else if (userId) {
      query.userId = userId;
    } else {
      return { error: "Please provide an order number (e.g. ORD-XXXXXX-XXX) or log in to view your orders." };
    }

    const order = await Order.findOne(query).sort({ createdAt: -1 }).lean();
    if (!order) {
      return { found: false, message: `No order found matching "${orderNumber || "recent account history"}".` };
    }

    return {
      found: true,
      orderNumber: order.orderNumber,
      status: order.status,
      total: order.total,
      itemCount: order.items?.length || 0,
      items: (order.items || []).map((item) => `${item.name} (x${item.quantity})`).join(", "),
      createdAt: order.createdAt,
      shippingCity: order.shippingAddress?.city,
      latestNote: order.statusHistory?.[order.statusHistory.length - 1]?.note || "In transit"
    };
  } catch (err) {
    console.error("trackOrderTool error:", err);
    return { error: err.message };
  }
};

// Helper to create order directly
const createDirectOrderTool = async (userId, args) => {
  try {
    const {
      productId,
      quantity,
      variantName,
      shippingName,
      shippingPhone,
      shippingLine1,
      shippingCity,
      shippingState,
      shippingPincode
    } = args;

    const product = await Product.findById(productId);
    if (!product) {
      return { error: "Product not found." };
    }

    if (!product.inStock || product.stockCount < quantity) {
      return { error: `Product "${product.name}" is out of stock or does not have enough inventory.` };
    }

    // Resolve price
    let price = product.price;
    if (variantName) {
      const variant = product.variants.find((v) => v.name === variantName);
      if (!variant || variant.stockCount < quantity) {
        return { error: `Variant "${variantName}" is out of stock or unavailable.` };
      }
      price = variant.price;
    }

    const subtotal = price * quantity;
    const shippingFee = subtotal >= 500 ? 0 : 49;
    const total = subtotal + shippingFee;

    const orderNumber = `ORD-${Math.floor(100000 + Math.random() * 900000)}-${Math.floor(100 + Math.random() * 900)}`;

    const order = await Order.create({
      orderNumber,
      userId,
      items: [
        {
          productId: product._id,
          name: product.name,
          price,
          quantity,
          emoji: product.emoji || "📦",
          image: product.images?.[0]?.url || "",
          variantName,
          fulfillmentStatus: "Processing"
        }
      ],
      shippingAddress: {
        name: shippingName,
        phone: shippingPhone,
        line1: shippingLine1,
        city: shippingCity,
        state: shippingState,
        pincode: shippingPincode
      },
      payment: {
        method: "card",
        status: "pending"
      },
      subtotal,
      shippingFee,
      total,
      status: "Processing",
      statusHistory: [{ status: "Processing", note: "Order placed via GaramAssistant conversational checkout." }]
    });

    return {
      success: true,
      orderNumber: order.orderNumber,
      orderId: order._id.toString(),
      total: order.total
    };
  } catch (err) {
    console.error("createDirectOrderTool error:", err);
    return { error: err.message };
  }
};

/**
 * Handle incoming chat message with Vector RAG, tool calling, session persistence, and dynamic learning.
 */
export const handleChat = async (req, res) => {
  const { message, history = [], sessionId: clientSessionId } = req.body;

  if (!message || typeof message !== "string") {
    return res.status(400).json(new ApiResponse(false, "Message is required."));
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json(new ApiResponse(false, "Gemini API is not configured on the server."));
  }

  const cleanMessage = message.trim();
  const normalizedKey = cleanMessage.toLowerCase().replace(/[^\w\s]/gi, "").slice(0, 100);

  // 1. Session management & persistence in MongoDB
  let chatSession = null;
  const activeSessionId = clientSessionId || req.headers["x-session-id"] || `guest_${Date.now()}`;
  try {
    if (req.user) {
      chatSession = await ChatSession.findOne({ userId: req.user._id }).sort({ updatedAt: -1 });
    } else if (activeSessionId) {
      chatSession = await ChatSession.findOne({ sessionId: activeSessionId });
    }

    if (!chatSession) {
      chatSession = new ChatSession({
        userId: req.user ? req.user._id : null,
        sessionId: activeSessionId,
        messages: []
      });
    }

    chatSession.addMessage("user", cleanMessage);
    await chatSession.save().catch(() => {});
  } catch (sessionErr) {
    console.warn("[Chat] Session storage error:", sessionErr.message);
  }

  // 2. High-Concurrency Redis/Memory Cache Check
  const isGeneralQuery =
    history.length === 0 &&
    !/buy|order|purchase|checkout|my address|pin|phone/i.test(cleanMessage);

  const cacheKey = `chat:rag:${normalizedKey}`;
  if (isGeneralQuery) {
    try {
      const cached = await getCache(cacheKey);
      if (cached) {
        res.setHeader("X-Cache", "HIT");
        if (chatSession) {
          chatSession.addMessage("bot", cached.message, null);
          chatSession.save().catch(() => {});
        }
        return res.json(
          new ApiResponse(true, "Chat response (cached).", {
            message: cached.message,
            action: null,
            sessionId: chatSession?.sessionId || activeSessionId
          })
        );
      }
    } catch {
      // Ignore cache errors
    }
  }

  // 3. Perform RAG retrieval over store knowledge base (Static + Learned)
  let ragContext = "";
  try {
    ragContext = await getFormattedRAGContext(cleanMessage);
  } catch (ragErr) {
    console.warn("[RAG] Context retrieval error:", ragErr.message);
  }

  // 4. Convert client history to Gemini format
  const contents = [];
  history.forEach((msg) => {
    contents.push({
      role: msg.sender === "user" ? "user" : "model",
      parts: [{ text: msg.text }]
    });
  });

  // Append user's current message
  contents.push({
    role: "user",
    parts: [{ text: cleanMessage }]
  });

  // 5. Enhanced System instruction for GaramAssistant
  const systemInstruction = {
    parts: [
      {
        text: `You are GaramAssistant, the premium, intelligent AI shopping assistant and store concierge for GaramBazaar (an authentic Indian organic e-grocer and rural artisan bazaar).

Your goal is to answer shoppers' questions with precision, guide them to store pages, answer delivery and customer support questions, search products with real-time ratings, and help place direct orders.

STORE KNOWLEDGE BASE CONTEXT (RAG):
${ragContext || "No specific policy document matched. Rely on general GaramBazaar knowledge (₹49 standard shipping, FREE delivery on orders over ₹500, 7-day hassle-free returns for food/crafts, customer helpline garamsoftwares@gmail.com, Contact desk at /contact)."}

KEY BEHAVIOR & GUIDELINES:
1. DELIVERY & SHIPPING:
   - Timelines: Local Jharkhand/Ranchi 1–2 days; Metros 3–5 days; Rest of India 5–7 days.
   - Standard shipping is ₹49; **FREE Delivery** on orders of ₹500 or more!
   - Eco-friendly packaging: glass jars, paper boxes, plastic-free cushioning.

2. HELPLINE & CUSTOMER SERVICE:
   - Helpline Email: garamsoftwares@gmail.com
   - Support Desk Page: [Contact Support](/contact)
   - Working hours: Mon–Sat 9:00 AM – 7:00 PM IST.
   - Always encourage users to submit a ticket at [Contact Us](/contact) if they have complaints or damaged items.

3. RETURNS & REFUNDS:
   - 7-day return policy via [My Orders](/orders).
   - Perishable/food damage does NOT require sending the food back—just submit photo proof.
   - UPI refunds in 24 hours; Cards/Net Banking in 3–5 banking days.

4. PRODUCT SEARCH & RATINGS:
   - When a user asks about products, ALWAYS search using the 'search_products' tool to get live database details.
   - When presenting products, ALWAYS mention their **star rating** and **reviews count** (e.g. "⭐ 4.8/5 (24 reviews)"), current price, discount, and direct link in format: '[Product Name](/products/productId)'.
   - If they ask for "top rated" or "best", use 'search_products' with query 'top rated'.

5. ORDER TRACKING:
   - If a user provides an order number or asks about their order status, invoke the 'track_order' tool.

6. PLACING A DIRECT ORDER:
   - If a user explicitly wants to buy an item directly from chat:
     a. Confirm the product and variant choice.
     b. If the user is NOT logged in: '[Log in here](/auth)'.
     c. If logged in, gather: Full Name, Phone Number, Street Address Line 1, City, State, and 6-digit Pincode.
     d. Once you have all details, call 'create_direct_order'.

NAVIGATION LINKS FORMAT:
Always format links with clear markdown:
- Store Shop: [Shop Now](/shop)
- Cart: [View Cart](/cart)
- Checkout: [Checkout](/checkout)
- Orders: [My Orders](/orders)
- Customer Care Desk: [Contact Helpline](/contact)

Be warm, polite, crisp, and never invent fake product IDs or contradict official store policies.`
      }
    ]
  };

  // 6. Define tools for function calling
  const tools = [
    {
      functionDeclarations: [
        {
          name: "search_products",
          description: "Searches the live GaramBazaar product catalogue for matching items, including real-time ratings, reviews count, prices, discounts, and inventory stock.",
          parameters: {
            type: "OBJECT",
            properties: {
              query: {
                type: "STRING",
                description: "The product name, category, or search phrase (e.g. 'pure ghee', 'top rated honey', 'mustard oil')"
              }
            },
            required: ["query"]
          }
        },
        {
          name: "track_order",
          description: "Checks the live status and details of a customer's order.",
          parameters: {
            type: "OBJECT",
            properties: {
              orderNumber: {
                type: "STRING",
                description: "The order number (e.g. 'ORD-123456-789')"
              }
            }
          }
        },
        {
          name: "create_direct_order",
          description: "Registers an unpaid order in the database for direct checkout through the chat assistant.",
          parameters: {
            type: "OBJECT",
            properties: {
              productId: { type: "STRING", description: "The database ID of the product" },
              quantity: { type: "NUMBER", description: "Quantity of the item (minimum 1)" },
              variantName: { type: "STRING", description: "Optional variant name (e.g. '500g', '1L')" },
              shippingName: { type: "STRING", description: "Recipient's full name" },
              shippingPhone: { type: "STRING", description: "10-digit mobile number" },
              shippingLine1: { type: "STRING", description: "Street address and house details" },
              shippingCity: { type: "STRING", description: "City" },
              shippingState: { type: "STRING", description: "State" },
              shippingPincode: { type: "STRING", description: "6-digit postal code" }
            },
            required: [
              "productId",
              "quantity",
              "shippingName",
              "shippingPhone",
              "shippingLine1",
              "shippingCity",
              "shippingState",
              "shippingPincode"
            ]
          }
        }
      ]
    }
  ];

  let lastAction = null;
  let iterations = 0;

  try {
    while (iterations < 5) {
      let geminiResponse = null;
      for (let retryAttempt = 0; retryAttempt < 3; retryAttempt++) {
        geminiResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents, systemInstruction, tools })
          }
        );

        if (geminiResponse.status === 429) {
          const waitMs = Math.min(1000 * Math.pow(2, retryAttempt), 8000);
          console.warn(`Chat Gemini 429 rate limit (attempt ${retryAttempt + 1}/3), retrying in ${waitMs}ms...`);
          await new Promise((r) => setTimeout(r, waitMs));
          continue;
        }
        break;
      }

      const response = geminiResponse;

      if (!response || !response.ok) {
        const errorText = response ? await response.text() : "No response after retries";
        console.error("Gemini API error:", errorText);
        return res
          .status(502)
          .json(new ApiResponse(false, "Error communicating with AI service. Please try again in a moment."));
      }

      const responseData = await response.json();
      const candidate = responseData.candidates?.[0];
      const botMessage = candidate?.content;

      if (!botMessage) {
        return res.status(500).json(new ApiResponse(false, "Unable to generate response."));
      }

      contents.push(botMessage);

      // Check if Model called a function
      const firstPart = botMessage.parts?.[0];
      if (firstPart && firstPart.functionCall) {
        const { name, args } = firstPart.functionCall;
        let toolResult;

        if (name === "search_products") {
          toolResult = await searchProductsTool(args.query);
        } else if (name === "track_order") {
          toolResult = await trackOrderTool(req.user?._id, args.orderNumber);
        } else if (name === "create_direct_order") {
          if (!req.user) {
            toolResult = { error: "User is not authenticated. Please log in first." };
          } else {
            const orderResult = await createDirectOrderTool(req.user._id, args);
            toolResult = orderResult;
            if (orderResult && orderResult.success) {
              lastAction = {
                type: "checkout_direct",
                payload: {
                  orderId: orderResult.orderId,
                  orderNumber: orderResult.orderNumber,
                  total: orderResult.total
                }
              };
            }
          }
        } else {
          toolResult = { error: "Unknown tool mapping." };
        }

        contents.push({
          role: "function",
          parts: [
            {
              functionResponse: {
                name,
                response: { result: toolResult }
              }
            }
          ]
        });

        iterations++;
      } else {
        const text = firstPart?.text || "Let me know how I can help you.";

        // Cache general non-order answers for 1 hour
        if (isGeneralQuery && !lastAction) {
          setCache(cacheKey, { message: text }, 3600).catch(() => {});
        }

        // Save bot answer into persistent session
        if (chatSession) {
          chatSession.addMessage("bot", text, lastAction);
          chatSession.save().catch(() => {});
        }

        // Dynamic Learning: If this is an informative answer to a novel customer question, store it in dynamic RAG knowledge!
        if (isGeneralQuery && text.length > 50 && !text.includes("error") && !text.includes("429")) {
          learnKnowledgePair(cleanMessage, text, "customer_interaction").catch(() => {});
        }

        return res.json(
          new ApiResponse(true, "Chat updated.", {
            message: text,
            action: lastAction,
            sessionId: chatSession?.sessionId || activeSessionId
          })
        );
      }
    }

    return res.status(500).json(new ApiResponse(false, "Conversation execution loop timeout."));
  } catch (chatError) {
    console.error("handleChat controller error:", chatError);
    return res.status(500).json(new ApiResponse(false, "Internal server error during chat."));
  }
};

/**
 * Retrieve past chat history for the user or active session.
 */
export const getChatHistory = async (req, res) => {
  const sessionId = req.query.sessionId || req.headers["x-session-id"];
  let session = null;

  try {
    if (req.user) {
      session = await ChatSession.findOne({ userId: req.user._id }).sort({ updatedAt: -1 }).lean();
    } else if (sessionId) {
      session = await ChatSession.findOne({ sessionId }).lean();
    }

    return res.json(
      new ApiResponse(true, "Chat history retrieved.", {
        sessionId: session?.sessionId || sessionId || null,
        messages: session?.messages || []
      })
    );
  } catch (err) {
    return res.status(500).json(new ApiResponse(false, err.message));
  }
};

/**
 * Clear chat history for user or active session.
 */
export const clearChatHistory = async (req, res) => {
  const sessionId = req.body.sessionId || req.query.sessionId || req.headers["x-session-id"];
  try {
    if (req.user) {
      await ChatSession.deleteMany({ userId: req.user._id });
    } else if (sessionId) {
      await ChatSession.deleteOne({ sessionId });
    }
    return res.json(new ApiResponse(true, "Chat history cleared."));
  } catch (err) {
    return res.status(500).json(new ApiResponse(false, err.message));
  }
};
