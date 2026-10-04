import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { verifyEmailRequest } from "../api/auth.api";
import { Spinner } from "../components/ui/Spinner";
import { useDocumentMetadata } from "../hooks/useDocumentMetadata";
import { useAppContext } from "../hooks/useAppContext";

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshUser, isAuthenticated } = useAppContext();
  const token = searchParams.get("token");
  const [status, setStatus] = useState("loading"); // loading, success, error
  const [message, setMessage] = useState("");

  useDocumentMetadata({
    title: "Email Verification",
    description: "Verify your email address to secure your GaramBazaar account.",
    noindex: true
  });

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Verification token is missing.");
      return;
    }

    verifyEmailRequest({ token })
      .then(async (res) => {
        if (res.success) {
          setStatus("success");
          setMessage(res.message || "Your email has been verified successfully!");
          await refreshUser?.();
        } else {
          setStatus("error");
          setMessage(res.message || "Failed to verify email. Token may be expired.");
        }
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err.message || "An error occurred during verification.");
      });
  }, [token]);

  return (
    <section className="page-content py-20 bg-gradient-to-b from-[#fdfbf7] to-[#f5f0e8] min-h-[70vh] flex items-center justify-center">
      <div className="max-w-md w-full mx-auto bg-white/80 backdrop-blur-md border border-[#c4622d]/10 rounded-3xl p-8 shadow-xl text-center relative overflow-hidden">
        {/* Decorative ambient glows */}
        <div className="absolute -top-12 -right-12 w-24 h-24 bg-[#c4622d]/5 rounded-full blur-2xl pointer-events-none" />

        {status === "loading" && (
          <div className="py-6 space-y-4">
            <Spinner size="lg" />
            <h2 className="text-xl font-extrabold text-gray-800">Verifying Your Email</h2>
            <p className="text-xs text-gray-500">Checking credentials. Please hold on a moment...</p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-6">
            <span className="text-5xl block animate-bounce">🎉</span>
            <h2 className="text-2xl font-black text-gray-950">Verification Successful</h2>
            <p className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 font-bold">
              {message}
            </p>
            <p className="text-xs text-gray-500">
              Your account is now fully active. You can browse, review, buy, and list natural products.
            </p>
            <button
              onClick={() => navigate(isAuthenticated ? "/account" : "/auth")}
              className="w-full bg-[#c4622d] hover:bg-[#a95223] text-white font-bold py-3 px-6 rounded-xl hover:shadow-md transition-all border-0 cursor-pointer text-sm"
            >
              {isAuthenticated ? "Go to My Account" : "Log In to My Account"}
            </button>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-6">
            <span className="text-5xl block">⚠️</span>
            <h2 className="text-2xl font-black text-red-950">Verification Failed</h2>
            <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 font-bold">
              {message}
            </p>
            <p className="text-xs text-gray-500">
              The link might have expired or has already been used. Please try requesting a new verification link from your profile dashboard.
            </p>
            <button
              onClick={() => navigate("/auth")}
              className="w-full bg-[#c4622d] hover:bg-[#a95223] text-white font-bold py-3 px-6 rounded-xl hover:shadow-md transition-all border-0 cursor-pointer text-sm"
            >
              Go to Account Portal
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
