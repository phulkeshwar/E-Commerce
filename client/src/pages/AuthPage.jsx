import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../hooks/useAppContext";

const roles = [
  {
    id: "user",
    icon: "🛍️",
    label: "Customer",
    desc: "Shop, track orders & manage your account",
    color: "border-blue-400 bg-blue-50",
    activeText: "text-blue-700",
    activeBg: "bg-blue-600",
  },
  {
    id: "seller",
    icon: "🏪",
    label: "Seller",
    desc: "List products & manage your storefront",
    color: "border-amber-400 bg-amber-50",
    activeText: "text-amber-700",
    activeBg: "bg-amber-500",
  },
  {
    id: "admin",
    icon: "⚙️",
    label: "Admin",
    desc: "Full platform access (sign in only)",
    color: "border-[#c4622d] bg-orange-50",
    activeText: "text-[#c4622d]",
    activeBg: "bg-[#c4622d]",
    signInOnly: true,  // Admin can't self-register
  },
];

export function AuthPage() {
  const navigate = useNavigate();
  const { login, register, notify } = useAppContext();
  const [mode, setMode] = useState("signin");
  const [selectedRole, setSelectedRole] = useState("user");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const activeRole = roles.find((r) => r.id === selectedRole);

  // Admin can't sign up
  const availableRoles = mode === "signup"
    ? roles.filter((r) => !r.signInOnly)
    : roles;

  // Reset to user if admin selected and switching to signup
  const handleModeSwitch = () => {
    const next = mode === "signin" ? "signup" : "signin";
    setMode(next);
    setError("");
    if (next === "signup" && selectedRole === "admin") setSelectedRole("user");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "signin") {
        await login({ email: form.email, password: form.password });
        notify("Welcome back! 👋");
        navigate("/account");
      } else {
        await register({ name: form.name, email: form.email, password: form.password, role: selectedRole });
        notify("Account created successfully! 🎉");
        navigate("/account");
      }
    } catch (err) {
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2c1a0e] via-[#5a3a1a] to-[#7a3e1c]
                    flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-6">
          <button onClick={() => navigate("/")} className="inline-flex items-center gap-2">
            <span className="text-3xl">🛒</span>
            <span className="text-white font-extrabold text-2xl tracking-tight">
              Gram<span className="text-amber-400">Bazaar</span>
            </span>
          </button>
          <p className="text-white/60 text-sm mt-1">India's finest everyday essentials</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">

          {/* Mode Tabs */}
          <div className="grid grid-cols-2 bg-gray-100">
            {["signin", "signup"].map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(""); if (m === "signup" && selectedRole === "admin") setSelectedRole("user"); }}
                className={`py-3.5 text-sm font-bold transition-colors
                  ${mode === m
                    ? "bg-white text-[#2c1a0e] shadow-sm"
                    : "text-gray-500 hover:text-gray-700"}`}
              >
                {m === "signin" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Title */}
            <h1 className="text-xl font-bold text-gray-900 mb-1">
              {mode === "signin" ? "Welcome back!" : "Join GramBazaar"}
            </h1>
            <p className="text-gray-500 text-sm mb-5">
              {mode === "signin"
                ? "Sign in to continue shopping"
                : "Create your account to get started"}
            </p>

            {/* Role Selector */}
            <div className="mb-5">
              <p className="text-[0.72rem] font-bold uppercase tracking-wider text-gray-500 mb-2">
                {mode === "signin" ? "Sign in as" : "I want to join as"}
              </p>
              <div className="grid grid-cols-3 gap-2">
                {availableRoles.map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setSelectedRole(role.id)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2
                                text-center transition-all duration-150
                                ${selectedRole === role.id
                                  ? `${role.color} border-opacity-100`
                                  : "border-gray-200 hover:border-gray-300 bg-gray-50"}`}
                  >
                    <span className="text-xl">{role.icon}</span>
                    <span className={`text-[0.72rem] font-bold leading-tight
                      ${selectedRole === role.id ? role.activeText : "text-gray-600"}`}>
                      {role.label}
                    </span>
                  </button>
                ))}
              </div>
              {/* Role description */}
              <p className="text-[0.72rem] text-gray-500 mt-2 text-center">
                {activeRole?.desc}
                {activeRole?.signInOnly && mode === "signup" && (
                  <span className="text-amber-600 font-semibold ml-1">(Sign in only)</span>
                )}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <div>
                  <label className="text-[0.75rem] font-semibold text-gray-600 block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Phulkeshwar Mahto"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm
                               focus:outline-none focus:border-[#c4622d] focus:ring-2 focus:ring-[#c4622d]/20
                               transition-all"
                  />
                </div>
              )}

              <div>
                <label className="text-[0.75rem] font-semibold text-gray-600 block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm
                             focus:outline-none focus:border-[#c4622d] focus:ring-2 focus:ring-[#c4622d]/20
                             transition-all"
                />
              </div>

              <div>
                <label className="text-[0.75rem] font-semibold text-gray-600 block mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Min. 8 characters"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm pr-12
                               focus:outline-none focus:border-[#c4622d] focus:ring-2 focus:ring-[#c4622d]/20
                               transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400
                               hover:text-gray-700 text-sm font-medium transition-colors"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3
                                text-red-600 text-sm font-medium">
                  ❌ {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3.5 rounded-xl font-bold text-white text-sm
                            transition-all duration-150 shadow-sm
                            ${loading ? "opacity-60 cursor-wait" : "hover:-translate-y-0.5 hover:shadow-md"}
                            ${activeRole?.activeBg || "bg-[#c4622d]"}`}
              >
                {loading
                  ? "Please wait..."
                  : mode === "signin"
                    ? `Sign in as ${activeRole?.label} →`
                    : `Create ${activeRole?.label} Account →`}
              </button>
            </form>

            {/* Switch mode */}
            <div className="text-center mt-5 pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                {mode === "signin" ? "Don't have an account? " : "Already have an account? "}
                <button
                  onClick={handleModeSwitch}
                  className="text-[#c4622d] font-semibold hover:underline"
                >
                  {mode === "signin" ? "Create one" : "Sign in"}
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* Admin note */}
        <p className="text-center text-white/40 text-[0.72rem] mt-4">
          Admin accounts can only be created via the server seed script.
        </p>
      </div>
    </div>
  );
}
