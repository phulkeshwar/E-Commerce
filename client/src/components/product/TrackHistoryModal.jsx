import { createPortal } from "react-dom";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export function TrackHistoryModal({ isOpen, onClose, onSubmit, product }) {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setError("");
      setEmail("");
      setPhone("");
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !product) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Email is required.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await onSubmit({ email: email.trim(), phone: phone.trim() });
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getActionName = () => {
    if (product.source === "chrome-extension") return "Install Extension";
    return "Try Web App";
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#2c1a0e]/40 backdrop-blur-md transition-opacity duration-300 ease-out animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative transform overflow-hidden rounded-3xl bg-white p-6 md:p-8 text-left shadow-2xl border border-gray-100 transition-all sm:my-8 sm:w-full sm:max-w-md animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center border border-gray-200 shrink-0">
              {product.images?.[0]?.url || product.imageUrl ? (
                <img src={product.images?.[0]?.url || product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 leading-snug">
                Track Your Installation
              </h3>
              <p className="text-xs text-gray-500 font-medium">
                {product.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-50"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Intro */}
        <p className="text-xs text-gray-500 font-semibold leading-relaxed mb-5">
          Enter your email/phone to automatically track this installation in your digital purchase history. No password required. We'll link your history automatically if you register later!
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs font-bold rounded-xl border border-red-100">
              ⚠️ {error}
            </div>
          )}

          <div>
            <label htmlFor="track-email" className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="track-email"
              placeholder="e.g. you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#c4622d] focus:bg-white transition-all font-semibold"
              disabled={loading}
              required
            />
          </div>

          <div>
            <label htmlFor="track-phone" className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
              Phone Number (Optional)
            </label>
            <input
              type="tel"
              id="track-phone"
              placeholder="e.g. +91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#c4622d] focus:bg-white transition-all font-semibold"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-[#c4622d] hover:bg-[#a34f21] text-white font-bold py-3 px-6 rounded-xl text-sm shadow-md transition-all hover:shadow-lg disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              `Continue & ${getActionName()} →`
            )}
          </button>
        </form>

        {/* Footer info/Login option */}
        <div className="mt-6 pt-4 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400 font-semibold">
            Already have an account?{" "}
            <Link
              to="/login"
              onClick={onClose}
              className="text-[#c4622d] hover:underline font-bold"
            >
              Sign In / Log In
            </Link>
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
}
