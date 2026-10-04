import { useState, useEffect, useCallback } from "react";
import { Pagination } from "../ui/Pagination";
import {
  getSupportTicketsRequest,
  resolveSupportTicketRequest,
} from "../../api/support.api";

export function AdminSupportTab({ notify, confirm }) {
  const [ticketsList, setTicketsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 10,
  });

  const [resolvingTicket, setResolvingTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [resolvingLoading, setResolvingLoading] = useState(false);

  const loadTickets = useCallback(
    async (p = 1) => {
      setLoading(true);
      try {
        const data = await getSupportTicketsRequest(p, 10);
        setTicketsList(data.tickets || []);
        if (data.pagination) {
          setPagination(data.pagination);
        }
      } catch (err) {
        notify(err.message || "Failed to load support tickets.");
      } finally {
        setLoading(false);
      }
    },
    [notify]
  );

  useEffect(() => {
    loadTickets(page).catch(() => {});
  }, [page, loadTickets]);

  const handleOpenResolve = (ticket) => {
    setResolvingTicket(ticket);
    setReplyMessage("");
  };

  const handleConfirmResolve = async () => {
    if (!resolvingTicket) return;
    setResolvingLoading(true);
    try {
      await resolveSupportTicketRequest(resolvingTicket.id, replyMessage);
      notify("Support ticket resolved & notification dispatched to customer!");
      setResolvingTicket(null);
      setReplyMessage("");
      loadTickets(page).catch(() => {});
    } catch (err) {
      notify(err.message || "Failed to resolve support ticket.");
    } finally {
      setResolvingLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 stack">
      <h2 className="text-lg font-bold text-gray-900 mb-1">🎟️ Customer Support Tickets</h2>
      <p className="text-xs text-gray-500 mb-4">
        View and resolve support tickets and inquiries submitted by store customers.
      </p>

      {loading ? (
        <p className="text-sm text-gray-500 py-6 text-center animate-pulse">Loading tickets...</p>
      ) : ticketsList.length > 0 ? (
        <div className="table-card bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto mt-4">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b-2 border-gray-200">
                <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider text-left">
                  Customer
                </th>
                <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider text-left">
                  Subject
                </th>
                <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider text-left">
                  Message
                </th>
                <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider text-left">
                  Status
                </th>
                <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider text-left">
                  Date
                </th>
                <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {ticketsList.map((t) => (
                <tr
                  key={t.id}
                  className="hover:bg-amber-50/20 transition-colors border-b border-gray-100 last:border-0"
                >
                  <td className="!py-3 !px-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-900 text-sm">{t.name}</span>
                      <span className="text-xs text-gray-500">{t.email}</span>
                    </div>
                  </td>
                  <td className="!py-3 !px-4 text-xs font-semibold text-gray-800">{t.subject}</td>
                  <td className="!py-3 !px-4 text-xs text-gray-600 max-w-xs break-words">
                    <p>{t.message}</p>
                    {t.adminReply && (
                      <div className="mt-1.5 p-2 bg-emerald-50 rounded-lg border border-emerald-100 text-[11px] text-emerald-800">
                        <strong>Reply sent:</strong> {t.adminReply}
                      </div>
                    )}
                  </td>
                  <td className="!py-3 !px-4 whitespace-nowrap">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                        t.status === "open"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-green-50 text-green-700 border-green-200"
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td className="!py-3 !px-4 text-gray-500 text-xs whitespace-nowrap">
                    {new Date(t.createdAt).toLocaleDateString()}
                  </td>
                  <td className="!py-3 !px-4 text-right whitespace-nowrap">
                    {t.status === "open" ? (
                      <button
                        type="button"
                        onClick={() => handleOpenResolve(t)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer border-0 shadow-sm hover:scale-105 active:scale-95"
                      >
                        Resolve & Reply
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400 italic">Resolved</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      ) : (
        <p className="text-sm text-gray-500 py-10 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
          🎉 No support tickets in the queue!
        </p>
      )}

      {/* Resolution & Email Modal */}
      {resolvingTicket && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              Resolve Support Ticket
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Ticket ID: <span className="font-mono font-bold text-amber-600">#TKT-{resolvingTicket.id.slice(-6).toUpperCase()}</span> for <strong>{resolvingTicket.name}</strong> ({resolvingTicket.email})
            </p>

            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 mb-4 text-xs text-gray-700">
              <p className="font-semibold text-gray-800 mb-1">Subject: {resolvingTicket.subject}</p>
              <p className="text-gray-600 whitespace-pre-wrap">{resolvingTicket.message}</p>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                Resolution Response Message (Emailed to Customer)
              </label>
              <textarea
                rows="4"
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Write a message explaining the resolution or next steps..."
                className="w-full text-xs p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setResolvingTicket(null)}
                disabled={resolvingLoading}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmResolve}
                disabled={resolvingLoading}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow transition-all cursor-pointer flex items-center gap-1.5"
              >
                {resolvingLoading ? "Resolving & Emailing..." : "Confirm & Send Resolution Email"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
