import { useState } from "react";
import {
  broadcastNotificationRequest,
  sendAdminNotificationRequest,
} from "../../api/admin.api";
import { apiRequest } from "../../api/axios";

export function AdminMessagingTab({
  usersList,
  notify,
  setPromptConfig,
}) {
  const [messagingMode, setMessagingMode] = useState("broadcast");

  // Broadcast state
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastBody, setBroadcastBody] = useState("");
  const [broadcastEmail, setBroadcastEmail] = useState(true);
  const [sendingBroadcast, setSendingBroadcast] = useState(false);
  const [loadingBroadcastAI, setLoadingBroadcastAI] = useState(false);

  // Individual state
  const [individualUserId, setIndividualUserId] = useState("");
  const [individualTitle, setIndividualTitle] = useState("");
  const [individualBody, setIndividualBody] = useState("");
  const [individualEmail, setIndividualEmail] = useState(true);
  const [sendingIndividual, setSendingIndividual] = useState(false);
  const [loadingIndividualAI, setLoadingIndividualAI] = useState(false);

  const handleAIDraftBroadcast = () => {
    setPromptConfig({
      title: "Draft Broadcast Announcement",
      description:
        "Enter the theme or topic of the broadcast announcement you want the AI to write (e.g., 'Diwali Special Sale' or 'Free delivery this Sunday').",
      placeholder: "e.g. Diwali Fest Weekend Discount",
      onSubmit: async (theme) => {
        if (!theme || !theme.trim()) return;
        setLoadingBroadcastAI(true);
        try {
          const data = await apiRequest("/ai/draft-broadcast", {
            method: "POST",
            body: { theme: theme.trim() },
          });
          if (data) {
            setBroadcastTitle(data.title || "");
            setBroadcastBody(data.body || "");
            notify("✨ Broadcast announcement drafted with AI!");
          }
        } catch (err) {
          console.error(err);
          notify(err.message || "Failed to generate broadcast draft.");
        } finally {
          setLoadingBroadcastAI(false);
        }
      },
    });
  };

  const handleAIDraftIndividual = () => {
    if (!individualUserId) {
      notify("Please select a target user first.");
      return;
    }
    const selectedUser = usersList.find((u) => u.id === individualUserId);
    setPromptConfig({
      title: `Draft Message for ${selectedUser?.name || "Customer"}`,
      description: `Enter the message context/reason for sending this message to ${
        selectedUser?.name || "this user"
      } (e.g. 'coupon loyalty reward', 'unpaid order nudge').`,
      placeholder: "e.g. coupon loyalty reward",
      onSubmit: async (context) => {
        if (!context || !context.trim()) return;
        setLoadingIndividualAI(true);
        try {
          const data = await apiRequest("/ai/draft-user-message", {
            method: "POST",
            body: { userName: selectedUser?.name || "Customer", context: context.trim() },
          });
          if (data) {
            setIndividualTitle(`Special update regarding ${context.trim()}`);
            setIndividualBody(data.message || "");
            notify("✨ Personal direct message drafted with AI!");
          }
        } catch (err) {
          console.error(err);
          notify(err.message || "Failed to generate message draft.");
        } finally {
          setLoadingIndividualAI(false);
        }
      },
    });
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastBody) return;
    setSendingBroadcast(true);
    try {
      const res = await broadcastNotificationRequest({
        title: broadcastTitle,
        message: broadcastBody,
        sendEmailCheckbox: broadcastEmail,
      });
      notify(
        `📢 Broadcast sent to ${res.notificationCount} user(s). ${
          res.emailsSent ? `${res.emailsSent} email(s) sent.` : ""
        }`
      );
      setBroadcastTitle("");
      setBroadcastBody("");
    } catch (err) {
      notify(err.message || "Failed to send broadcast.");
    } finally {
      setSendingBroadcast(false);
    }
  };

  const handleIndividualMessage = async (e) => {
    e.preventDefault();
    if (!individualUserId || !individualTitle || !individualBody) {
      notify("Please select a user and fill all fields.");
      return;
    }
    setSendingIndividual(true);
    try {
      await sendAdminNotificationRequest({
        userId: individualUserId,
        title: individualTitle,
        message: individualBody,
        sendEmailCheckbox: individualEmail,
      });
      const targetUser = usersList.find((u) => u.id === individualUserId);
      notify(`Message sent to ${targetUser?.name || "user"}.`);
      setIndividualTitle("");
      setIndividualBody("");
      setIndividualUserId("");
    } catch (err) {
      notify(err.message || "Failed to send message.");
    } finally {
      setSendingIndividual(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 stack">
      <div className="section-head mb-2">
        <div>
          <h2 className="text-lg font-bold text-gray-900">💬 Messaging Center</h2>
          <p className="text-xs text-gray-500">
            Send in-app notifications and emails to all users or individual users.
          </p>
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="flex gap-2 mb-6">
        <button
          type="button"
          onClick={() => setMessagingMode("broadcast")}
          className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
            messagingMode === "broadcast"
              ? "bg-[#c4622d] text-white border-[#c4622d] shadow-md"
              : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
          }`}
        >
          📢 Broadcast to All
        </button>
        <button
          type="button"
          onClick={() => setMessagingMode("individual")}
          className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
            messagingMode === "individual"
              ? "bg-[#c4622d] text-white border-[#c4622d] shadow-md"
              : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
          }`}
        >
          ✉️ Message Individual
        </button>
      </div>

      {messagingMode === "broadcast" ? (
        <form onSubmit={handleBroadcast} className="bg-gray-50 rounded-xl border border-gray-150 p-5 stack text-sm">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📢</span>
              <div>
                <h3 className="text-sm font-bold text-gray-900 m-0">Broadcast to All Users</h3>
                <p className="text-[11px] text-gray-500 m-0">
                  This will send a notification to every registered user
                  {usersList.length > 0 ? ` (${usersList.length} users)` : ""}.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleAIDraftBroadcast}
              disabled={loadingBroadcastAI}
              className="border border-[#c4622d] hover:bg-[#c4622d]/5 text-[#c4622d] font-bold py-1.5 px-3 rounded-lg text-xs transition-colors cursor-pointer bg-white shrink-0"
            >
              {loadingBroadcastAI ? "⏳ Drafting..." : "✨ Draft with AI"}
            </button>
          </div>
          <div className="field">
            <label className="label text-xs font-semibold text-gray-700">Subject / Title</label>
            <input
              type="text"
              className="input py-2"
              required
              placeholder="e.g. 🎉 Big Sale Starting Tomorrow!"
              value={broadcastTitle}
              onChange={(e) => setBroadcastTitle(e.target.value)}
            />
          </div>
          <div className="field">
            <label className="label text-xs font-semibold text-gray-700">Message Body</label>
            <textarea
              className="input min-h-[120px] py-2"
              required
              placeholder="Write your broadcast message here..."
              value={broadcastBody}
              onChange={(e) => setBroadcastBody(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 py-2">
            <input
              type="checkbox"
              id="broadcastEmailCheck"
              checked={broadcastEmail}
              onChange={(e) => setBroadcastEmail(e.target.checked)}
              className="cursor-pointer"
            />
            <label
              htmlFor="broadcastEmailCheck"
              className="font-semibold text-gray-700 cursor-pointer select-none text-xs"
            >
              📧 Also send as Email to all users
            </label>
          </div>
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="button button-primary py-2 font-semibold"
              disabled={sendingBroadcast}
            >
              {sendingBroadcast
                ? "Sending to all..."
                : `📢 Send Broadcast${usersList.length > 0 ? ` to ${usersList.length} Users` : ""}`}
            </button>
          </div>
        </form>
      ) : (
        <form
          onSubmit={handleIndividualMessage}
          className="bg-gray-50 rounded-xl border border-gray-150 p-5 stack text-sm"
        >
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">✉️</span>
              <div>
                <h3 className="text-sm font-bold text-gray-900 m-0">Message Individual User</h3>
                <p className="text-[11px] text-gray-500 m-0">
                  Send a personal notification and/or email to a specific user.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleAIDraftIndividual}
              disabled={loadingIndividualAI}
              className="border border-[#c4622d] hover:bg-[#c4622d]/5 text-[#c4622d] font-bold py-1.5 px-3 rounded-lg text-xs transition-colors cursor-pointer bg-white shrink-0"
            >
              {loadingIndividualAI ? "⏳ Drafting..." : "✨ Draft with AI"}
            </button>
          </div>
          <div className="field">
            <label className="label text-xs font-semibold text-gray-700">Select User</label>
            <select
              className="input py-2"
              required
              value={individualUserId}
              onChange={(e) => setIndividualUserId(e.target.value)}
            >
              <option value="">-- Choose a user --</option>
              {usersList.map((usr) => (
                <option key={usr.id} value={usr.id}>
                  {usr.name || "Unknown"} ({usr.email}) — {usr.role}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label className="label text-xs font-semibold text-gray-700">Subject / Title</label>
            <input
              type="text"
              className="input py-2"
              required
              placeholder="e.g. Your order has been shipped!"
              value={individualTitle}
              onChange={(e) => setIndividualTitle(e.target.value)}
            />
          </div>
          <div className="field">
            <label className="label text-xs font-semibold text-gray-700">Message Body</label>
            <textarea
              className="input min-h-[120px] py-2"
              required
              placeholder="Write your personal message here..."
              value={individualBody}
              onChange={(e) => setIndividualBody(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 py-2">
            <input
              type="checkbox"
              id="individualEmailCheck"
              checked={individualEmail}
              onChange={(e) => setIndividualEmail(e.target.checked)}
              className="cursor-pointer"
            />
            <label
              htmlFor="individualEmailCheck"
              className="font-semibold text-gray-700 cursor-pointer select-none text-xs"
            >
              📧 Also send direct Email
            </label>
          </div>
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="button button-primary py-2 font-semibold"
              disabled={sendingIndividual}
            >
              {sendingIndividual ? "Sending..." : "✉️ Send Message"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
