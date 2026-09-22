import { useState, useMemo } from "react";
import {
  sendNewsletterRequest,
  toggleSubscriberStatusRequest,
  deleteSubscriberRequest,
  adminAddSubscriberRequest,
} from "../../api/newsletter.api";
import { apiRequest } from "../../api/axios";

export function AdminNewsletterTab({
  subscribersList = [],
  loadingSubscribers = false,
  notify,
  loadSubscribers,
}) {
  const [newsletterTheme, setNewsletterTheme] = useState("");
  const [newsletterSubject, setNewsletterSubject] = useState("");
  const [newsletterBody, setNewsletterBody] = useState("");
  const [loadingNewsletterAI, setLoadingNewsletterAI] = useState(false);
  const [sendingNewsletter, setSendingNewsletter] = useState(false);

  // Admin filter and search states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'active' | 'unsubscribed'
  const [newEmailInput, setNewEmailInput] = useState("");
  const [addingSubscriber, setAddingSubscriber] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = subscribersList.length;
    const activeCount = subscribersList.filter((s) => s.active).length;
    const unsubscribedCount = total - activeCount;
    const optInRate = total > 0 ? Math.round((activeCount / total) * 100) : 0;
    return { total, activeCount, unsubscribedCount, optInRate };
  }, [subscribersList]);

  // Filtered subscribers list
  const filteredSubscribers = useMemo(() => {
    return subscribersList.filter((sub) => {
      const matchesSearch = sub.email.toLowerCase().includes(searchQuery.trim().toLowerCase());
      if (!matchesSearch) return false;
      if (statusFilter === "active") return sub.active;
      if (statusFilter === "unsubscribed") return !sub.active;
      return true;
    });
  }, [subscribersList, searchQuery, statusFilter]);

  const handleAIDraftNewsletter = async () => {
    if (!newsletterTheme.trim()) {
      notify("Please enter a promotion/newsletter theme first.");
      return;
    }
    setLoadingNewsletterAI(true);
    try {
      const data = await apiRequest("/ai/draft-newsletter", {
        method: "POST",
        body: { theme: newsletterTheme.trim() },
      });
      if (data) {
        setNewsletterSubject(data.subject || "");
        setNewsletterBody(data.body || "");
        notify("✨ Newsletter draft generated with AI!");
      }
    } catch (err) {
      console.error(err);
      notify(err.message || "Failed to draft newsletter.");
    } finally {
      setLoadingNewsletterAI(false);
    }
  };

  const handleSendNewsletter = async (e) => {
    e.preventDefault();
    if (!newsletterSubject.trim() || !newsletterBody.trim()) {
      notify("Subject and email body are required.");
      return;
    }

    if (stats.activeCount === 0) {
      notify("Cannot send: No active subscribers found.");
      return;
    }

    if (!window.confirm(`Are you sure you want to send this newsletter to ${stats.activeCount} active subscribers?`)) {
      return;
    }

    setSendingNewsletter(true);
    try {
      const res = await sendNewsletterRequest({
        subject: newsletterSubject.trim(),
        html: newsletterBody.trim(),
      });
      notify(res?.message || "📧 Newsletter successfully sent to subscribers!");
      setNewsletterTheme("");
      setNewsletterSubject("");
      setNewsletterBody("");
    } catch (err) {
      console.error(err);
      notify(err.message || "Failed to send newsletter.");
    } finally {
      setSendingNewsletter(false);
    }
  };

  const handleToggleStatus = async (subscriber) => {
    setActionLoadingId(subscriber._id);
    try {
      const res = await toggleSubscriberStatusRequest(subscriber._id);
      notify(res?.message || "Subscriber status updated.");
      if (loadSubscribers) await loadSubscribers();
    } catch (err) {
      notify(err.message || "Failed to update subscriber status.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteSubscriber = async (subscriber) => {
    if (!window.confirm(`Permanently remove ${subscriber.email} from newsletter subscribers?`)) {
      return;
    }
    setActionLoadingId(subscriber._id);
    try {
      const res = await deleteSubscriberRequest(subscriber._id);
      notify(res?.message || "Subscriber permanently deleted.");
      if (loadSubscribers) await loadSubscribers();
    } catch (err) {
      notify(err.message || "Failed to delete subscriber.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleAddSubscriber = async (e) => {
    e.preventDefault();
    const cleanEmail = newEmailInput.trim().toLowerCase();
    if (!cleanEmail) {
      notify("Please enter an email address.");
      return;
    }

    setAddingSubscriber(true);
    try {
      const res = await adminAddSubscriberRequest(cleanEmail);
      notify(res?.message || `Subscriber ${cleanEmail} added.`);
      setNewEmailInput("");
      setShowAddForm(false);
      if (loadSubscribers) await loadSubscribers();
    } catch (err) {
      notify(err.message || "Failed to add subscriber.");
    } finally {
      setAddingSubscriber(false);
    }
  };

  const handleExportCSV = () => {
    if (subscribersList.length === 0) {
      notify("No subscribers to export.");
      return;
    }

    const headers = ["Email", "Status", "Joined Date", "Unsubscribed Date", "Source"];
    const rows = subscribersList.map((sub) => [
      sub.email,
      sub.active ? "Active" : "Unsubscribed",
      sub.createdAt ? new Date(sub.createdAt).toISOString() : "",
      sub.unsubscribedAt ? new Date(sub.unsubscribedAt).toISOString() : "",
      sub.source || "footer",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.map((val) => `"${val}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `garambazaar_subscribers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    notify("Subscriber list exported as CSV.");
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 stack gap-6">
      {/* ── Section Head ───────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span>📧</span> Newsletter & Campaigns
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Manage subscriber registrations, deliver AI-crafted email campaigns, and enforce CAN-SPAM / GDPR unsubscribe compliance.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowAddForm((prev) => !prev)}
            className="border border-[#c4622d] text-[#c4622d] hover:bg-[#c4622d]/5 font-bold py-2 px-3.5 rounded-xl text-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <span>➕</span> {showAddForm ? "Close Form" : "Add Subscriber"}
          </button>
          <button
            type="button"
            onClick={handleExportCSV}
            className="border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold py-2 px-3.5 rounded-xl text-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <span>📥</span> Export CSV
          </button>
        </div>
      </div>

      {/* ── Quick Add Subscriber Form (Conditional) ────────────────── */}
      {showAddForm && (
        <form onSubmit={handleAddSubscriber} className="bg-amber-50/50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1 w-full">
            <label className="text-xs font-bold text-amber-900 block mb-1">
              Add Email to Newsletter
            </label>
            <input
              type="email"
              required
              placeholder="customer@example.com"
              value={newEmailInput}
              onChange={(e) => setNewEmailInput(e.target.value)}
              className="input py-2 text-xs w-full bg-white"
            />
          </div>
          <button
            type="submit"
            disabled={addingSubscriber || !newEmailInput.trim()}
            className="button button-primary py-2 px-5 text-xs font-bold whitespace-nowrap cursor-pointer disabled:opacity-50"
          >
            {addingSubscriber ? "Adding..." : "Save Subscriber"}
          </button>
        </form>
      )}

      {/* ── Stats Metric Cards ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-gray-50 border border-gray-150 rounded-2xl">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Total Registered</p>
          <p className="text-2xl font-black text-gray-900 mt-1">{stats.total}</p>
        </div>
        <div className="p-4 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl">
          <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Active Subscribers</p>
          <p className="text-2xl font-black text-emerald-700 mt-1">{stats.activeCount}</p>
        </div>
        <div className="p-4 bg-red-50/60 border border-red-200/80 rounded-2xl">
          <p className="text-[11px] font-bold text-red-700 uppercase tracking-wider">Unsubscribed</p>
          <p className="text-2xl font-black text-red-700 mt-1">{stats.unsubscribedCount}</p>
        </div>
        <div className="p-4 bg-amber-50/60 border border-amber-200/80 rounded-2xl">
          <p className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Opt-In Retention</p>
          <p className="text-2xl font-black text-amber-800 mt-1">{stats.optInRate}%</p>
        </div>
      </div>

      {/* ── Compose & Send Newsletter Form ─────────────────────────── */}
      <form onSubmit={handleSendNewsletter} className="bg-gray-50 rounded-2xl border border-gray-150 p-5 stack text-sm">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">✍️</span>
          <div>
            <h3 className="text-sm font-bold text-gray-900 m-0">Draft & Broadcast Newsletter</h3>
            <p className="text-[11px] text-gray-500 m-0">
              Each email sent will automatically include a personal, secure 1-click unsubscribe link for the recipient.
            </p>
          </div>
        </div>

        <div className="field">
          <label className="label text-xs font-bold text-gray-700">
            1. Campaign Theme / Angle (For Gemini AI Generation)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              className="input py-2 flex-grow bg-white text-xs"
              placeholder="e.g. Organic Wild Honey harvest release + 15% weekend flash discount"
              value={newsletterTheme}
              onChange={(e) => setNewsletterTheme(e.target.value)}
            />
            <button
              type="button"
              onClick={handleAIDraftNewsletter}
              disabled={loadingNewsletterAI || !newsletterTheme.trim()}
              className="border border-[#c4622d] hover:bg-[#c4622d]/5 text-[#c4622d] font-bold py-2 px-4 rounded-xl text-xs transition-colors cursor-pointer bg-white whitespace-nowrap"
            >
              {loadingNewsletterAI ? "⏳ Drafting..." : "✨ Draft with AI"}
            </button>
          </div>
        </div>

        <div className="field">
          <label className="label text-xs font-bold text-gray-700">2. Subject Line</label>
          <input
            type="text"
            className="input py-2 bg-white text-xs"
            required
            placeholder="Catchy headline that catches attention..."
            value={newsletterSubject}
            onChange={(e) => setNewsletterSubject(e.target.value)}
          />
        </div>

        <div className="field">
          <label className="label text-xs font-bold text-gray-700">3. Email HTML Body</label>
          <textarea
            className="input min-h-[150px] py-2 font-mono text-xs bg-white"
            required
            placeholder="Write HTML or plain text body..."
            value={newsletterBody}
            onChange={(e) => setNewsletterBody(e.target.value)}
          />
          <span className="text-[11px] text-gray-400 mt-1 block">
            Supports HTML tags (&lt;h2&gt;, &lt;p&gt;, &lt;a&gt;, inline styles). Unsubscribe footer is automatically appended.
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <span className="text-xs text-gray-500 font-medium">
            Recipient Audience: <strong className="text-emerald-700">{stats.activeCount} active subscribers</strong>
          </span>
          <button
            type="submit"
            className="button button-primary py-2.5 px-6 font-bold text-xs cursor-pointer disabled:opacity-50"
            disabled={sendingNewsletter || !newsletterSubject.trim() || !newsletterBody.trim() || stats.activeCount === 0}
          >
            {sendingNewsletter ? "📧 Sending Campaign..." : `✉️ Send Blast (${stats.activeCount})`}
          </button>
        </div>
      </form>

      {/* ── Subscribers List & Filtering ───────────────────────────── */}
      <div className="stack gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl w-fit">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === "all" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-800"
              }`}
            >
              All ({stats.total})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("active")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === "active" ? "bg-white text-emerald-700 shadow-sm" : "text-gray-500 hover:text-gray-800"
              }`}
            >
              Active ({stats.activeCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("unsubscribed")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === "unsubscribed" ? "bg-white text-red-700 shadow-sm" : "text-gray-500 hover:text-gray-800"
              }`}
            >
              Unsubscribed ({stats.unsubscribedCount})
            </button>
          </div>

          <div className="w-full sm:w-64">
            <input
              type="text"
              placeholder="Search by email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input py-1.5 text-xs w-full bg-gray-50"
            />
          </div>
        </div>

        {loadingSubscribers ? (
          <p className="text-sm text-gray-500 py-8 text-center animate-pulse">Loading subscribers...</p>
        ) : filteredSubscribers.length > 0 ? (
          <div className="table-card bg-white rounded-2xl shadow-sm border border-gray-150 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b-2 border-gray-200">
                  <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Email Address
                  </th>
                  <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Source
                  </th>
                  <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Joined Date
                  </th>
                  <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredSubscribers.map((sub) => {
                  const isLoading = actionLoadingId === sub._id;
                  return (
                    <tr
                      key={sub._id || sub.email}
                      className="hover:bg-amber-50/20 transition-colors border-b border-gray-100 last:border-0"
                    >
                      <td className="!py-3 !px-4 font-semibold text-gray-900 text-xs sm:text-sm">
                        {sub.email}
                      </td>
                      <td className="!py-3 !px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                            sub.active
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-red-50 text-red-700 border-red-200"
                          }`}
                        >
                          {sub.active ? "Active" : "Unsubscribed"}
                        </span>
                      </td>
                      <td className="!py-3 !px-4 text-gray-500 text-xs capitalize">
                        {sub.source || "footer"}
                      </td>
                      <td className="!py-3 !px-4 text-gray-500 text-xs">
                        {new Date(sub.createdAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="!py-3 !px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(sub)}
                            disabled={isLoading}
                            title={sub.active ? "Mark as Unsubscribed" : "Mark as Active"}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
                              sub.active
                                ? "border-gray-200 text-gray-600 hover:bg-gray-100"
                                : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                            }`}
                          >
                            {isLoading ? "..." : sub.active ? "Opt Out" : "Reactivate"}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteSubscriber(sub)}
                            disabled={isLoading}
                            title="Delete subscriber"
                            className="text-gray-400 hover:text-red-600 p-1 rounded transition-colors cursor-pointer"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <p className="text-xs text-gray-500">
              {searchQuery ? "No subscribers match your search filter." : "No subscribers found in this view."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
