import { useState } from "react";
import { apiRequest } from "../../api/axios";

export function AdminNewsletterTab({
  subscribersList,
  loadingSubscribers,
  notify,
}) {
  const [newsletterTheme, setNewsletterTheme] = useState("");
  const [newsletterSubject, setNewsletterSubject] = useState("");
  const [newsletterBody, setNewsletterBody] = useState("");
  const [loadingNewsletterAI, setLoadingNewsletterAI] = useState(false);
  const [sendingNewsletter, setSendingNewsletter] = useState(false);

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
    setSendingNewsletter(true);
    try {
      const data = await apiRequest("/newsletter/send", {
        method: "POST",
        body: { subject: newsletterSubject.trim(), html: newsletterBody.trim() },
      });
      if (data) {
        notify("📧 Newsletter successfully sent to all subscribers!");
        setNewsletterTheme("");
        setNewsletterSubject("");
        setNewsletterBody("");
      }
    } catch (err) {
      console.error(err);
      notify(err.message || "Failed to send newsletter.");
    } finally {
      setSendingNewsletter(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 stack">
      <div className="section-head mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">📧 Newsletter Subscribers</h2>
          <p className="text-xs text-gray-500">
            View and manage email list registrations for newsletters and product promotions.
          </p>
        </div>
      </div>

      {/* Compose & Send Newsletter Form */}
      <form onSubmit={handleSendNewsletter} className="bg-gray-50 rounded-xl border border-gray-150 p-5 stack text-sm mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">📧</span>
          <div>
            <h3 className="text-sm font-bold text-gray-900 m-0">Compose Email Newsletter</h3>
            <p className="text-[11px] text-gray-500 m-0">
              Write or draft a newsletter campaign using AI and send it to all active subscribers.
            </p>
          </div>
        </div>

        <div className="field">
          <label className="label text-xs font-bold text-gray-700">
            1. Newsletter Theme / Goal (for AI Suggestion)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              className="input py-2 flex-grow"
              placeholder="e.g. Monsoon Organic Spices Sale 15% off"
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
            className="input py-2"
            required
            placeholder="Catchy subject line..."
            value={newsletterSubject}
            onChange={(e) => setNewsletterSubject(e.target.value)}
          />
        </div>

        <div className="field">
          <label className="label text-xs font-bold text-gray-700">3. Email HTML Body</label>
          <textarea
            className="input min-h-[160px] py-2 font-mono text-xs"
            required
            placeholder="HTML template body..."
            value={newsletterBody}
            onChange={(e) => setNewsletterBody(e.target.value)}
          />
          <span className="text-[10px] text-gray-400 mt-1 block">
            Supports HTML styling (e.g. &lt;h2&gt;, &lt;p&gt;, &lt;a&gt;, inline css).
          </span>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="button button-primary py-2 font-semibold"
            disabled={sendingNewsletter || !newsletterSubject.trim() || !newsletterBody.trim()}
          >
            {sendingNewsletter ? "📧 Sending..." : "✉️ Send Newsletter to Subscribers"}
          </button>
        </div>
      </form>

      {loadingSubscribers ? (
        <p className="text-sm text-gray-500 py-6 text-center animate-pulse">Loading subscribers...</p>
      ) : subscribersList.length > 0 ? (
        <div className="table-card bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b-2 border-gray-200">
                <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider text-left">
                  Email Address
                </th>
                <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider text-left">
                  Status
                </th>
                <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider text-left">
                  Joined Date
                </th>
              </tr>
            </thead>
            <tbody>
              {subscribersList.map((sub) => (
                <tr
                  key={sub._id || sub.email}
                  className="hover:bg-amber-50/20 transition-colors border-b border-gray-100 last:border-0"
                >
                  <td className="!py-3 !px-4 font-semibold text-gray-900 text-sm">{sub.email}</td>
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
                  <td className="!py-3 !px-4 text-gray-500 text-xs">
                    {new Date(sub.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-gray-500 py-10 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
          No newsletter subscribers found.
        </p>
      )}
    </div>
  );
}
