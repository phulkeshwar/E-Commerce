import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { createSupportTicketRequest } from "../api/support.api";
import { useDocumentMetadata } from "../hooks/useDocumentMetadata";

export function ContactPage() {
  const navigate = useNavigate();
  const { user } = useContext(AppContext);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [submittedTicket, setSubmittedTicket] = useState(null);

  useDocumentMetadata({
    title: "Contact Us & Support - GaramBazaar",
    description: "Submit support requests and inquiries to the GaramBazaar team."
  });

  // Pre-populate user details if logged in
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const ticket = await createSupportTicketRequest({
        name,
        email,
        subject,
        message,
      });
      setSubmittedTicket(ticket || { name, email, subject, message, id: Date.now().toString() });
      setSuccessMsg("Your message has been sent successfully. A confirmation email has been dispatched to your inbox!");
      setSubject("");
      setMessage("");
    } catch (err) {
      setErrorMsg(err.message || "Failed to submit support ticket. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSubmittedTicket(null);
    setSuccessMsg("");
    setErrorMsg("");
    if (!user) {
      setName("");
      setEmail("");
    }
    setSubject("");
    setMessage("");
  };

  const ticketRef = submittedTicket?.id
    ? `#TKT-${submittedTicket.id.slice(-6).toUpperCase()}`
    : "#TKT-CONFIRMED";

  return (
    <div className="min-h-screen bg-[#2c1a0e] flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-cover bg-center" style={{ backgroundImage: "linear-gradient(rgba(44, 26, 14, 0.9), rgba(44, 26, 14, 0.95))" }}>
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4">
        <button onClick={() => navigate("/")} className="inline-flex items-center gap-2 mb-4 hover:scale-105 transition-transform">
          <span className="text-4xl">🛒</span>
          <span className="text-white font-extrabold text-3xl tracking-tight">
            Garam<span className="text-amber-500">Bazaar</span>
          </span>
        </button>
        <h2 className="text-center text-4xl font-extrabold text-white tracking-tight">
          {submittedTicket ? "Inquiry Received!" : "Get in Touch"}
        </h2>
        <p className="mt-2 text-center text-sm text-amber-200/60">
          {submittedTicket
            ? "Your ticket has been logged and our team has been notified."
            : "Have an issue or inquiry? Drop us a line and we will resolve it for you."}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl px-4">
        <div className="backdrop-blur-md bg-white/10 py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-white/20">
          {submittedTicket ? (
            <div className="space-y-6 text-center">
              <div className="w-16 h-16 bg-emerald-500/20 border-2 border-emerald-500/60 rounded-full flex items-center justify-center mx-auto text-3xl">
                ✅
              </div>

              <div>
                <span className="inline-block px-3 py-1 bg-amber-500/20 border border-amber-400/40 text-amber-300 font-mono text-xs font-bold rounded-full mb-3">
                  {ticketRef}
                </span>
                <h3 className="text-xl font-bold text-white">
                  Message Dispatched Successfully!
                </h3>
                <p className="text-sm text-amber-100/80 mt-2 leading-relaxed">
                  Thank you, <strong className="text-white">{submittedTicket.name}</strong>. A confirmation email has been sent to <strong className="text-amber-300 underline">{submittedTicket.email}</strong>.
                </p>
              </div>

              <div className="bg-[#1e1109]/50 border border-white/10 rounded-2xl p-4 text-left text-xs space-y-2">
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span className="text-amber-200/60">Subject</span>
                  <span className="text-white font-medium">{submittedTicket.subject}</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span className="text-amber-200/60">Status</span>
                  <span className="text-emerald-400 font-bold uppercase">Open / In Review</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-amber-200/60">Response Time</span>
                  <span className="text-amber-200 font-medium">Within 12–24 Hours</span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="w-full py-3.5 px-4 rounded-xl font-bold text-white text-sm bg-gradient-to-r from-amber-600 to-[#c4622d] hover:from-amber-500 hover:to-[#a35225] transition-all duration-150 shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                >
                  Return to Marketplace →
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full py-3 px-4 rounded-xl font-semibold text-amber-200/80 text-xs bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                >
                  Submit Another Inquiry
                </button>
              </div>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-amber-200/80 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#1e1109]/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-amber-200/80 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#1e1109]/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-amber-200/80 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  required
                  placeholder="How can we help you?"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-[#1e1109]/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-amber-200/80 mb-2">
                  Message Description
                </label>
                <textarea
                  rows="4"
                  required
                  placeholder="Please describe your issue in detail..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-[#1e1109]/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all resize-none"
                />
              </div>

              {errorMsg && (
                <div className="bg-red-500/20 border border-red-500/40 text-red-200 px-4 py-3 rounded-xl text-sm font-medium">
                  ❌ {errorMsg}
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-4 px-4 rounded-xl font-bold text-white text-sm bg-gradient-to-r from-amber-600 to-[#c4622d] hover:from-amber-500 hover:to-[#a35225] transition-all duration-150 shadow-lg ${loading ? "opacity-60 cursor-wait" : "hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0"}`}
                >
                  {loading ? "Sending Inquiry & Dispatched Confirmation..." : "Send Message →"}
                </button>
              </div>
            </form>
          )}

          <div className="mt-8 text-center border-t border-white/10 pt-6">
            <button
              onClick={() => navigate("/")}
              className="text-sm font-semibold text-amber-200/60 hover:text-amber-400 transition-colors"
            >
              ← Back to Marketplace
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
