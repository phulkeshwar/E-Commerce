import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  unsubscribeNewsletterRequest,
  verifyUnsubscribeTokenRequest,
  subscribeNewsletterRequest,
} from "../api/newsletter.api";
import { useAppContext } from "../hooks/useAppContext";

export function UnsubscribePage() {
  const [searchParams] = useSearchParams();
  const { notify } = useAppContext();

  const queryEmail = (searchParams.get("email") || "").trim();
  const queryToken = (searchParams.get("token") || "").trim();

  const [email, setEmail] = useState(queryEmail);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(Boolean(queryEmail));
  const [status, setStatus] = useState("idle"); // 'idle' | 'verified' | 'unsubscribed' | 'resubscribed' | 'error'
  const [statusMessage, setStatusMessage] = useState("");
  const [hasValidToken, setHasValidToken] = useState(false);

  useEffect(() => {
    if (queryEmail) {
      setChecking(true);
      verifyUnsubscribeTokenRequest(queryEmail, queryToken)
        .then((res) => {
          if (res?.isValidToken) {
            setHasValidToken(true);
            if (!res.isSubscribed) {
              setStatus("unsubscribed");
              setStatusMessage("You are already unsubscribed from our newsletter.");
            } else {
              setStatus("verified");
            }
          } else if (res?.exists) {
            setStatus("idle");
          } else {
            setStatus("idle");
            setStatusMessage("Email was not found in our subscriber list.");
          }
        })
        .catch(() => {
          setStatus("idle");
        })
        .finally(() => {
          setChecking(false);
        });
    }
  }, [queryEmail, queryToken]);

  const handleUnsubscribe = async (e) => {
    if (e) e.preventDefault();
    const targetEmail = email.trim();
    if (!targetEmail) {
      notify("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await unsubscribeNewsletterRequest({
        email: targetEmail,
        token: queryEmail === targetEmail ? queryToken : undefined,
      });

      setStatus("unsubscribed");
      setStatusMessage(res?.message || "You have been successfully unsubscribed.");
      localStorage.removeItem("newsletter_subscribed");
      notify("Unsubscribed from GaramBazaar newsletter.");
    } catch (err) {
      setStatus("error");
      setStatusMessage(err.message || "Failed to unsubscribe. Please check the email and try again.");
      notify(err.message || "Unsubscribe failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleResubscribe = async () => {
    const targetEmail = email.trim();
    if (!targetEmail) return;

    setLoading(true);
    try {
      const res = await subscribeNewsletterRequest(targetEmail, "unsubscribe-page-resubscribe");
      setStatus("resubscribed");
      setStatusMessage(res?.message || "Welcome back! You are re-subscribed.");
      localStorage.setItem("newsletter_subscribed", "true");
      notify("Successfully re-subscribed!");
    } catch (err) {
      notify(err.message || "Failed to re-subscribe.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-16 px-4 bg-gradient-to-b from-amber-50/40 via-white to-gray-50">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl border border-gray-150 p-8 sm:p-10 relative overflow-hidden">
        {/* Subtle decorative top bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-500 via-[#c4622d] to-amber-600" />

        <div className="text-center mb-8">
          <span className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-100/60 text-3xl mb-4 shadow-inner">
            {status === "unsubscribed" ? "👋" : status === "resubscribed" ? "🎉" : "📧"}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Newsletter Preferences
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Manage your subscription to GaramBazaar deals, artisan harvests, and updates.
          </p>
        </div>

        {checking ? (
          <div className="py-12 text-center text-gray-500 stack items-center">
            <div className="w-8 h-8 border-3 border-[#c4622d] border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-sm">Verifying your subscription link...</p>
          </div>
        ) : status === "unsubscribed" ? (
          <div className="bg-amber-50/50 border border-amber-200 rounded-2xl p-6 text-center stack gap-4 animate-fade-in">
            <div className="text-emerald-700 font-bold text-base flex items-center justify-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
              {statusMessage || "You have been unsubscribed."}
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              We have stopped sending promotional emails to <strong className="text-gray-900">{email}</strong>. You will still receive essential transactional emails (like order receipts and delivery updates).
            </p>
            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={handleResubscribe}
                disabled={loading}
                className="button bg-white hover:bg-gray-50 text-[#c4622d] border border-[#c4622d]/40 font-bold text-xs py-2.5 px-4 rounded-xl cursor-pointer transition-colors"
              >
                {loading ? "Re-subscribing..." : "Unsubscribed by mistake? Re-subscribe"}
              </button>
              <Link
                to="/shop"
                className="button button-primary font-bold text-xs py-2.5 px-5 rounded-xl text-center"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        ) : status === "resubscribed" ? (
          <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-6 text-center stack gap-4 animate-fade-in">
            <div className="text-emerald-800 font-bold text-base">
              🎉 {statusMessage || "Welcome back to GaramBazaar!"}
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Your subscription is active. You won&apos;t miss out on seasonal organic harvests and exclusive discounts.
            </p>
            <div className="pt-2">
              <Link
                to="/shop"
                className="button button-primary font-bold text-xs py-2.5 px-6 rounded-xl inline-block"
              >
                Start Exploring Products
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleUnsubscribe} className="stack gap-5">
            {hasValidToken && (
              <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3.5 text-xs text-amber-900 flex items-center gap-2.5">
                <span className="text-base">🔒</span>
                <span>Verified 1-click unsubscribe token detected for <strong>{email}</strong>.</span>
              </div>
            )}

            {statusMessage && status === "error" && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 text-xs text-red-700">
                {statusMessage}
              </div>
            )}

            <div className="field">
              <label className="label text-xs font-bold text-gray-700">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="input py-3 text-sm"
              />
              <span className="text-[11px] text-gray-400 mt-1 block">
                Enter the email address where you currently receive newsletters.
              </span>
            </div>

            <div className="pt-2 stack gap-3">
              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl text-sm transition-colors cursor-pointer disabled:opacity-50 shadow-sm"
              >
                {loading ? "Processing..." : "Unsubscribe from Newsletter"}
              </button>
              <div className="text-center pt-2">
                <Link to="/" className="text-xs text-gray-500 hover:text-gray-800 transition-colors">
                  &larr; Return to GaramBazaar Home
                </Link>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
