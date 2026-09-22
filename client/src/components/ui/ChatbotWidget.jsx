import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { sendChatMessageRequest, getChatHistoryRequest, clearChatHistoryRequest } from "../../api/chat.api";
import { createPaymentOrderRequest, verifyPaymentRequest } from "../../api/payment.api";
import { useAppContext } from "../../hooks/useAppContext";
import { formatCurrency } from "../../utils/formatCurrency";

export function ChatbotWidget() {
  const navigate = useNavigate();
  const { cart, isAuthenticated, notify } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState(() => {
    try {
      return localStorage.getItem("garam_chat_session_id") || null;
    } catch {
      return null;
    }
  });

  const defaultWelcome = {
    sender: "bot",
    text: "👋 Namaste! I am GaramAssistant, your AI store concierge and shopping helper.\n\nAsk me about **delivery timelines**, **shipping charges**, **helpline support**, **7-day returns**, or search for **top-rated organic products**!"
  };

  const [messages, setMessages] = useState([defaultWelcome]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [simulatingOrder, setSimulatingOrder] = useState(null);
  const [simulatingPayment, setSimulatingPayment] = useState(false);

  const chatEndRef = useRef(null);

  // Rehydrate past chat session history when opened
  useEffect(() => {
    if (isOpen) {
      getChatHistoryRequest(sessionId)
        .then((res) => {
          if (res && res.messages && res.messages.length > 0) {
            setMessages(res.messages);
            if (res.sessionId) {
              setSessionId(res.sessionId);
              try {
                localStorage.setItem("garam_chat_session_id", res.sessionId);
              } catch {}
            }
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  // Auto-scroll to the bottom of the chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading, simulatingOrder]);

  const handleClearChat = async () => {
    try {
      await clearChatHistoryRequest(sessionId);
      setMessages([
        {
          sender: "bot",
          text: "👋 Chat history cleared! How can I assist you today?"
        }
      ]);
      notify("Chat history cleared.");
    } catch (err) {
      notify("Failed to clear chat history.");
    }
  };

  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || input).trim();
    if (!text) return;

    if (!textToSend) setInput("");

    // Append user message
    const newMessages = [...messages, { sender: "user", text }];
    setMessages(newMessages);
    setLoading(true);

    try {
      // Map to backend structure
      const history = messages.map(m => ({
        sender: m.sender,
        text: m.text
      }));

      const res = await sendChatMessageRequest(text, history, sessionId);

      if (res && res.message) {
        setMessages((prev) => [...prev, { sender: "bot", text: res.message }]);
        
        if (res.sessionId) {
          setSessionId(res.sessionId);
          try {
            localStorage.setItem("garam_chat_session_id", res.sessionId);
          } catch {}
        }

        // Handle direct checkout actions
        if (res.action && res.action.type === "checkout_direct") {
          const { orderId, orderNumber, total } = res.action.payload;
          setSimulatingOrder({ id: orderId, orderNumber, total });
        }
      } else {
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: "I received your message, but was unable to process a response. Please try again." }
        ]);
      }
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: `⚠️ ${err.message || "Sorry, I ran into an error connecting to the server. Please check your connection."}` }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulatePayment = async () => {
    if (!simulatingOrder) return;
    setSimulatingPayment(true);
    try {
      await verifyPaymentRequest({
        orderId: simulatingOrder.id,
        razorpayOrderId: "simulated",
        razorpayPaymentId: "simulated",
        signature: "simulated_payment_signature",
      });
      cart.clearCart();
      notify("Payment verified successfully (Simulated via Chatbot)!");
      const targetOrder = simulatingOrder;
      setSimulatingOrder(null);
      setIsOpen(false);
      navigate(`/order-success/${targetOrder.orderNumber}`);
    } catch (err) {
      notify(err.message || "Failed to verify simulated payment.");
    } finally {
      setSimulatingPayment(false);
    }
  };

  // Helper to parse markdown links and bold formatting within chat messages
  const parseMessageText = (text) => {
    if (!text) return "";
    
    // First, split by markdown links [label](url)
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const segments = [];
    let lastIdx = 0;
    let match;

    while ((match = linkRegex.exec(text)) !== null) {
      if (match.index > lastIdx) {
        segments.push({ type: "text", value: text.substring(lastIdx, match.index) });
      }
      segments.push({ type: "link", label: match[1], url: match[2], key: match.index });
      lastIdx = linkRegex.lastIndex;
    }

    if (lastIdx < text.length) {
      segments.push({ type: "text", value: text.substring(lastIdx) });
    }

    // Helper to render bold markdown **text**
    const renderWithBold = (str, baseKey) => {
      const parts = str.split(/(\*\*[^*]+\*\*)/g);
      return parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={`${baseKey}-${i}`} className="font-bold text-gray-900">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      });
    };

    return segments.map((seg, idx) => {
      if (seg.type === "link") {
        if (seg.url.startsWith("/")) {
          return (
            <Link
              key={seg.key || idx}
              to={seg.url}
              onClick={() => setIsOpen(false)}
              className="text-[#c4622d] font-bold underline hover:text-[#ea580c] transition-colors"
            >
              {seg.label}
            </Link>
          );
        }
        return (
          <a
            key={seg.key || idx}
            href={seg.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#c4622d] font-bold underline hover:text-[#ea580c] transition-colors"
          >
            {seg.label}
          </a>
        );
      }
      return <span key={idx}>{renderWithBold(seg.value, idx)}</span>;
    });
  };

  const quickPills = [
    { label: "🚚 Delivery & Timelines", text: "What are your delivery charges and how long does shipping take to Ranchi or Metros?" },
    { label: "📞 Helpline & Support", text: "What is your customer care email and helpline support desk?" },
    { label: "⭐ Top Rated Items", text: "Can you show me your top rated products with their ratings and price?" },
    { label: "↩️ 7-Day Returns", text: "What is your return and refund policy if food or oil arrives damaged?" }
  ];

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-[999] w-14 h-14 bg-gradient-to-tr from-[#c4622d] to-[#ea580c] text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-108 active:scale-95 transition-all duration-300 cursor-pointer group"
        aria-label="Open support chat"
      >
        {isOpen ? (
          <span className="text-xl font-bold">✕</span>
        ) : (
          <div className="relative">
            <span className="text-2xl group-hover:rotate-12 transition-transform duration-300">💬</span>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>
        )}
      </button>

      {/* Chat Window Drawer */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-[999] w-[360px] h-[500px] bg-white/95 backdrop-blur-md rounded-2xl border border-gray-150 shadow-2xl flex flex-col overflow-hidden animate-[slideUp_0.25s_ease-out] font-sans">
          
          {/* Header */}
          <div className="bg-[#2c1a0e] text-white p-4 flex items-center justify-between border-b border-gray-800">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">🤖</span>
              <div className="text-left">
                <h4 className="font-extrabold text-sm m-0 leading-tight">GaramAssistant</h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Online Helper</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleClearChat}
                title="Clear chat history"
                className="text-gray-400 hover:text-amber-400 transition-colors cursor-pointer text-xs p-1.5 rounded-lg hover:bg-white/10"
              >
                🗑️
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white transition-colors cursor-pointer text-lg font-bold p-1 rounded-lg hover:bg-white/10"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Chat Window Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#fdfdfc]/80">
            
            {/* Payment simulator embedded state */}
            {simulatingOrder ? (
              <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 flex flex-col gap-4 text-center my-2 shadow-sm animate-fade-in">
                <div className="flex items-center gap-2 text-left">
                  <span className="text-xl">💳</span>
                  <div>
                    <span className="text-[9px] text-amber-700 font-extrabold uppercase block tracking-wider">Checkout Simulator</span>
                    <strong className="text-xs text-amber-900 block font-bold">Secure Mock Payment Gateway</strong>
                  </div>
                </div>
                
                <div className="bg-white border border-amber-100 rounded-xl p-3 text-xs text-left">
                  <div className="flex justify-between font-bold text-gray-800 mb-1">
                    <span>Order Ref</span>
                    <span className="font-mono">{simulatingOrder.orderNumber}</span>
                  </div>
                  <div className="flex justify-between font-black text-gray-900 border-t border-dashed border-gray-200 pt-1.5 mt-1.5">
                    <span>Amount Due</span>
                    <span className="text-[#c4622d]">{formatCurrency(simulatingOrder.total)}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleSimulatePayment}
                    disabled={simulatingPayment}
                    className="w-full bg-[#c4622d] hover:bg-[#b05221] text-white font-extrabold py-2.5 rounded-xl text-xs transition-colors shadow-sm cursor-pointer disabled:opacity-60"
                  >
                    {simulatingPayment ? "Processing..." : "🚀 Confirm Mock Payment"}
                  </button>
                  <button
                    onClick={() => setSimulatingOrder(null)}
                    className="text-[10px] text-gray-500 hover:text-gray-700 font-bold hover:underline"
                  >
                    Cancel Order Simulation
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Messages list */}
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs shadow-sm leading-relaxed ${
                        msg.sender === "user"
                          ? "bg-[#c4622d] text-white rounded-br-none text-right font-medium"
                          : "bg-gray-100 text-gray-800 rounded-bl-none text-left"
                      }`}
                    >
                      <p className="m-0 whitespace-pre-wrap">{parseMessageText(msg.text)}</p>
                    </div>
                  </div>
                ))}

                {/* Bot Typing Loader */}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-150 rounded-2xl rounded-bl-none px-4 py-3 flex gap-1 items-center shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce"></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce [animation-delay:0.2s]"></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce [animation-delay:0.4s]"></span>
                    </div>
                  </div>
                )}
              </>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Quick prompt pills */}
          {!simulatingOrder && (
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex gap-1.5 overflow-x-auto scrollbar-none-style">
              {quickPills.map((pill, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(pill.text)}
                  className="bg-white hover:bg-amber-50/50 border border-gray-200 hover:border-[#c4622d] text-[10px] font-bold text-gray-600 hover:text-[#c4622d] px-2.5 py-1.5 rounded-full shrink-0 transition-all cursor-pointer shadow-sm active:scale-95"
                >
                  {pill.label}
                </button>
              ))}
            </div>
          )}

          {/* Footer Input Bar */}
          {!simulatingOrder && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-3 bg-white border-t border-gray-150 flex gap-2"
            >
              <input
                type="text"
                placeholder="Ask about products, delivery, helpline..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#c4622d] focus:bg-white transition-all text-gray-800 placeholder-gray-400"
              />
              <button
                type="submit"
                className="bg-[#c4622d] hover:bg-[#b05221] text-white w-8 h-8 rounded-xl flex items-center justify-center transition-colors cursor-pointer shrink-0 shadow-sm"
              >
                ➔
              </button>
            </form>
          )}

        </div>
      )}
    </>
  );
}
