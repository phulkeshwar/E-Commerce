import { useState } from "react";
import { Link } from "react-router-dom";
import { useAppContext } from "../hooks/useAppContext";
import { Input } from "../components/ui/Input";
import { useDocumentMetadata } from "../hooks/useDocumentMetadata";
import { changePasswordRequest, sendVerificationRequest, deleteAccountRequest } from "../api/auth.api";
import { apiRequest } from "../api/axios";
import { getStoredSession } from "../store/authStore";

export function AccountPage() {
  const { user, logout, orders, updateProfile, notify, confirm } = useAppContext();
  const [profileOpen, setProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Loyalty Progression Calculations
  const points = user?.loyaltyPoints || 0;
  let currentTier = "Silver";
  let nextTier = "Gold";
  let pointsToNext = Math.max(501 - points, 0);
  let percentage = Math.min((points / 500) * 100, 100);

  if (points > 1500) {
    currentTier = "Platinum";
    nextTier = "Max Tier";
    pointsToNext = 0;
    percentage = 100;
  } else if (points > 500) {
    currentTier = "Gold";
    nextTier = "Platinum";
    pointsToNext = Math.max(1501 - points, 0);
    percentage = Math.min(((points - 500) / 1000) * 100, 100);
  }

  useDocumentMetadata({
    title: "My Account Profile",
    description: "Manage your personal profile, addresses, delivery settings, and account information on GaramBazaar."
  });

  // Edit profile states
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
  });
  const [saving, setSaving] = useState(false);

  // Phase 2 States
  const [verifying, setVerifying] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "" });
  const [changingPassword, setChangingPassword] = useState(false);
  const [deactivating, setDeactivating] = useState(false);

  // Phase 3 States
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    setUploadingAvatar(true);
    try {
      const result = await apiRequest("/auth/avatar", {
        method: "POST",
        body: formData,
      });
      if (result?.user) {
        notify("Profile picture updated successfully!");
        window.location.reload();
      }
    } catch (err) {
      notify(err.message || "Failed to upload avatar.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleExportData = async () => {
    setExporting(true);
    try {
      const session = getStoredSession();
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:5001";
      const response = await fetch(`${backendUrl}/api/auth/me/export`, {
        headers: {
          Authorization: `Bearer ${session?.token}`
        }
      });
      if (!response.ok) throw new Error("Failed to export data");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `GaramBazaar_${user.name.replace(/\s+/g, "_")}_data.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      notify("GDPR Profile data exported successfully!");
    } catch (err) {
      notify(err.message || "Failed to export data.");
    } finally {
      setExporting(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    notify("Referral link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editForm.name.trim()) return;
    setSaving(true);
    try {
      await updateProfile({
        name: editForm.name.trim(),
        phone: editForm.phone.trim(),
      });
      notify("Profile updated successfully.");
      setIsEditing(false);
    } catch (err) {
      notify(err.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword) return;
    setChangingPassword(true);
    try {
      await changePasswordRequest(passwordForm);
      notify("Password changed successfully.");
      setPasswordForm({ currentPassword: "", newPassword: "" });
      setShowPasswordForm(false);
    } catch (err) {
      notify(err.message || "Failed to change password.");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSendVerification = async () => {
    setVerifying(true);
    try {
      await sendVerificationRequest();
      notify("Verification link sent to your email address!");
    } catch (err) {
      notify(err.message || "Failed to send verification email.");
    } finally {
      setVerifying(false);
    }
  };

  const handleDeactivate = async () => {
    if (await confirm("Are you sure you want to deactivate your account? This action is permanent and you will be logged out.")) {
      setDeactivating(true);
      try {
        await deleteAccountRequest();
        notify("Your account has been deactivated. Logging out...");
        setTimeout(() => {
          logout();
        }, 2000);
      } catch (err) {
        notify(err.message || "Failed to deactivate account.");
        setDeactivating(false);
      }
    }
  };

  if (!user) {
    return (
      <section className="page-content">
        <div className="guest-account">
          <div className="guest-emoji">👤</div>
          <h2>Welcome to GaramBazaar</h2>
          <p>Sign in to access your orders, wishlist, and account settings.</p>
          <Link className="hero-cta guest-btn" to="/auth">
            Sign In →
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="page-content">
      <div className="account-page">
        <h2 className="account-title">👤 My Account</h2>

        {/* Verification Alert Banner (Admins are verified by credentials) */}
        {!user.isVerified && user.role !== "admin" && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="text-2xl shrink-0">📧</span>
              <div className="text-left">
                <h4 className="text-sm font-bold text-amber-800">Verify your email address</h4>
                <p className="text-[11px] text-amber-700 mt-0.5">Please verify your email to unlock all features, reviews, and secure storefront listings.</p>
              </div>
            </div>
            <button
              onClick={handleSendVerification}
              disabled={verifying}
              className="bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold text-xs py-2 px-4 rounded-xl shadow-sm transition-all border-0 cursor-pointer whitespace-nowrap disabled:opacity-50"
            >
              {verifying ? "Sending..." : "Send Verification Link"}
            </button>
          </div>
        )}

        <div className="account-grid">
          <div className={`mobile-collapsible ${profileOpen ? "is-open" : ""}`}>
            <button
              aria-expanded={profileOpen}
              className="mobile-toggle"
              onClick={() => setProfileOpen((current) => !current)}
              type="button"
            >
              <span>Account Details</span>
              <span>{profileOpen ? "Hide" : "Show"}</span>
            </button>
            <div className="profile-card mobile-collapsible-content">
              <div className="relative group w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-[#ea580c] flex items-center justify-center bg-gray-700/50 mb-3 shadow-md">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl font-bold text-gray-200">
                    {user.name
                      .split(" ")
                      .map((part) => part[0])
                      .join("")
                      .slice(0, 2)}
                  </span>
                )}
                <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[9px] font-bold transition-opacity cursor-pointer">
                  <span>📷 Upload</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} disabled={uploadingAvatar} />
                </label>
                {uploadingAvatar && (
                  <div className="absolute inset-0 bg-black/75 flex items-center justify-center text-white text-[9px] font-bold">
                    <span>Uploading...</span>
                  </div>
                )}
              </div>
              {isEditing ? (
                <form onSubmit={handleEditSubmit} className="flex flex-col gap-3.5 mt-2">
                  <Input
                    label="Full Name"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    required
                  />
                  <div className="flex flex-col gap-1">
                    <Input
                      label="Phone Number"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      placeholder="e.g. +91 98765 43210"
                    />
                    <span className="text-[10px] text-gray-400 italic block mt-0.5 leading-tight">
                      Optional here, but mandatory at checkout.
                    </span>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      disabled={saving || !editForm.name.trim()}
                      className="flex-1 bg-[#c4622d] text-white text-xs font-bold py-2 rounded-xl border-0 hover:bg-[#a95223] transition-colors cursor-pointer disabled:opacity-60"
                    >
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditForm({ name: user.name, phone: user.phone || "" });
                        setIsEditing(false);
                      }}
                      className="flex-1 bg-gray-100 text-gray-700 text-xs font-bold py-2 rounded-xl border border-gray-200 hover:bg-gray-200 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="profile-name">{user.name}</div>
                  <div className="profile-email">{user.email}</div>
                  {user.phone && <div className="text-xs text-gray-400 font-semibold mb-3">📞 {user.phone}</div>}
                  <div className="profile-badge inline-block bg-[#ea580c]/15 text-[#ea580c] border border-[#ea580c]/30 rounded-full px-3 py-1 font-bold text-xs">⭐ {user.membership} Member</div>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="w-full mt-3 bg-amber-400 hover:bg-amber-500 text-gray-900 text-xs font-bold py-2 px-4 rounded-xl transition-all duration-150 cursor-pointer border-0 shadow-sm"
                  >
                    ✏️ Edit Profile
                  </button>
                </>
              )}

              {/* Loyalty Progression */}
              <div className="mt-5 p-3 rounded-2xl bg-white/5 border border-white/10 text-left">
                <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold mb-1">
                  <span>Loyalty Tier: {currentTier}</span>
                  <span>{points} pts</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden mb-1">
                  <div className="bg-[#ea580c] h-full rounded-full transition-all duration-300" style={{ width: `${percentage}%` }}></div>
                </div>
                {pointsToNext > 0 ? (
                  <span className="text-[9px] text-gray-400 block mt-0.5 leading-tight">
                    📈 {pointsToNext} pts to {nextTier} (unlock {nextTier === "Gold" ? "5%" : "10%"} checkout discount!)
                  </span>
                ) : (
                  <span className="text-[9px] text-[#ea580c] font-bold block mt-0.5 leading-tight">
                    👑 You have unlocked maximum tier discounts (10% off)!
                  </span>
                )}
              </div>

              <div className="account-stat-grid mt-4">
                {user?.role !== "seller" && (
                  <div className="account-stat">
                    <strong>{orders.orders.length}</strong>
                    <span>Orders</span>
                  </div>
                )}
                <div className="account-stat">
                  <strong>{user.role}</strong>
                  <span>Access</span>
                </div>
              </div>
            </div>
          </div>
          <div className={`mobile-collapsible ${settingsOpen ? "is-open" : ""}`}>
            <button
              aria-expanded={settingsOpen}
              className="mobile-toggle"
              onClick={() => setSettingsOpen((current) => !current)}
              type="button"
            >
              <span>User Settings</span>
              <span>{settingsOpen ? "Hide" : "Show"}</span>
            </button>
            <div className="account-links mobile-collapsible-content">
              {user?.role !== "seller" && (
                <Link className="acct-link" to="/orders">
                  <span className="al-icon">📦</span>My Orders<span className="al-arrow">›</span>
                </Link>
              )}
              <Link className="acct-link" to="/wishlist">
                <span className="al-icon">❤️</span>My Wishlist<span className="al-arrow">›</span>
              </Link>
              <Link className="acct-link" to="/saved-addresses">
                <span className="al-icon">📍</span>Saved Addresses<span className="al-arrow">›</span>
              </Link>
              <button className="acct-link signout-link border-0 w-full text-left bg-transparent cursor-pointer" onClick={logout}>
                <span className="al-icon">🚪</span>Sign Out<span className="al-arrow">›</span>
              </button>

              {/* Password Change and Deactivation section */}
              <div className="border-t border-gray-200/50 mt-4 pt-4 space-y-4">
                <button
                  onClick={() => setShowPasswordForm(!showPasswordForm)}
                  className="w-full text-left acct-link !border-0 bg-transparent flex items-center justify-between cursor-pointer py-1.5"
                >
                  <span className="flex items-center gap-2"><span className="al-icon">🔐</span> Change Password</span>
                  <span className="text-xs text-gray-400 font-bold">{showPasswordForm ? "Hide ▲" : "Show ▼"}</span>
                </button>
                {showPasswordForm && (
                  <form onSubmit={handlePasswordSubmit} className="bg-gray-50/50 border border-gray-150 rounded-2xl p-4 space-y-3 mt-2 text-left">
                    <Input
                      type="password"
                      label="Current Password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      required
                    />
                    <Input
                      type="password"
                      label="New Password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      required
                    />
                    <button
                      type="submit"
                      disabled={changingPassword || !passwordForm.currentPassword || !passwordForm.newPassword}
                      className="w-full bg-[#c4622d] hover:bg-[#a95223] text-white font-bold py-2 rounded-xl text-xs shadow-sm cursor-pointer border-0 disabled:opacity-50 mt-2"
                    >
                      {changingPassword ? "Updating Password..." : "Change Password"}
                    </button>
                  </form>
                )}
                
                <button
                  onClick={handleDeactivate}
                  disabled={deactivating}
                  className="w-full text-left acct-link !border-0 bg-transparent flex items-center gap-2 cursor-pointer py-1.5 text-red-650 hover:text-red-750 font-bold"
                >
                  <span className="al-icon">🗑️</span> {deactivating ? "Deactivating..." : "Deactivate Account"}
                </button>
              </div>

              {/* Referrals & Welcome Bonus Code */}
              {user.referralCode && (
                <div className="border-t border-gray-200/50 mt-4 pt-4 text-left">
                  <h4 className="text-xs font-bold text-gray-300 flex items-center gap-1.5 mb-2">
                    <span>🎁 Referral ProGaram</span>
                  </h4>
                  <p className="text-[10px] text-gray-400 mb-2">
                    Invite friends! When they place their first order, both of you receive a 15% discount coupon!
                  </p>
                  <div className="flex gap-2 flex-col sm:flex-row">
                    <div className="flex-1 bg-gray-900 border border-gray-800 rounded-xl px-3 py-1.5 text-xs text-[#ea580c] font-mono select-all flex items-center justify-between overflow-hidden">
                      <span>{user.referralCode}</span>
                      <span className="text-[9px] text-gray-500 font-sans font-bold">Code</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(`${window.location.origin}/auth?ref=${user.referralCode}`)}
                      className="bg-[#c4622d]/25 border border-[#c4622d]/40 hover:bg-[#c4622d]/45 text-[#ea580c] font-bold text-xs px-3 py-1.5 rounded-xl cursor-pointer transition-colors border-0"
                    >
                      {copied ? "Copied!" : "📋 Copy Link"}
                    </button>
                  </div>
                </div>
              )}

              {/* GDPR Data Portability */}
              <div className="border-t border-gray-200/50 mt-4 pt-4 text-left">
                <button
                  type="button"
                  onClick={handleExportData}
                  disabled={exporting}
                  className="w-full text-left acct-link !border-0 bg-transparent flex items-center justify-between cursor-pointer py-1.5 text-gray-300 hover:text-white border-0"
                >
                  <span className="flex items-center gap-2">
                    <span className="al-icon">📥</span> Export My Data (GDPR)
                  </span>
                  <span className="text-xs text-gray-500 font-bold">{exporting ? "Downloading..." : "JSON"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
