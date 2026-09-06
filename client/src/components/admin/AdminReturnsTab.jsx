import { Pagination } from "../ui/Pagination";
import { updateReturnRequestStatus } from "../../api/return.api";

export function AdminReturnsTab({
  returnsList,
  loadingReturns,
  returnsPagination,
  returnsPage,
  setReturnsPage,
  loadReturns,
  notify,
  confirm,
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 stack">
      <h2 className="text-lg font-bold text-gray-900 mb-1">🔄 Customer Returns Management</h2>
      <p className="text-xs text-gray-500 mb-4">
        Review, approve, or reject customer return requests. Approvals will restore stock and trigger refunds.
      </p>

      {loadingReturns ? (
        <p className="text-sm text-gray-500 py-6 text-center animate-pulse">Loading return requests...</p>
      ) : returnsList.length > 0 ? (
        <div className="table-card bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto mt-4">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b-2 border-gray-200">
                <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">Buyer</th>
                <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">Order Number</th>
                <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">Items</th>
                <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">Reason</th>
                <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">Status</th>
                <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody>
              {returnsList.map((ret) => (
                <tr key={ret.id} className="hover:bg-amber-50/40 transition-colors">
                  <td className="!py-3 !px-4 text-sm font-semibold text-gray-900 whitespace-nowrap">
                    {ret.userId?.name || "Customer"} ({ret.userId?.email || ""})
                  </td>
                  <td className="!py-3 !px-4 font-bold text-xs text-gray-650 whitespace-nowrap">
                    #{ret.orderNumber}
                  </td>
                  <td className="!py-3 !px-4 text-xs text-gray-800">
                    {ret.items
                      .map((it) => `${it.name} ${it.variantName ? `(${it.variantName})` : ""} ×${it.quantity}`)
                      .join(" · ")}
                  </td>
                  <td className="!py-3 !px-4 text-xs text-gray-600">{ret.reason}</td>
                  <td className="!py-3 !px-4 whitespace-nowrap">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                        ret.status === "pending"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : ret.status === "approved"
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-red-50 text-red-700 border-red-200"
                      }`}
                    >
                      {ret.status}
                    </span>
                  </td>
                  <td className="!py-3 !px-4">
                    <div className="flex gap-2">
                      {ret.status === "pending" ? (
                        <>
                          <button
                            type="button"
                            className="button text-[10px] px-2.5 py-1.5 font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg border-0 cursor-pointer"
                            onClick={async () => {
                              if (
                                await confirm(
                                  "Are you sure you want to APPROVE this return request? Stock will be restored and refund initiated."
                                )
                              ) {
                                try {
                                  await updateReturnRequestStatus(ret.id, "approved");
                                  notify("Return request approved.");
                                  loadReturns(returnsPage).catch(() => {});
                                } catch (err) {
                                  notify(err.message || "Failed to approve return.");
                                }
                              }
                            }}
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            className="button text-[10px] px-2.5 py-1.5 font-bold bg-red-600 hover:bg-red-700 text-white rounded-lg border-0 cursor-pointer"
                            onClick={async () => {
                              if (await confirm("Are you sure you want to REJECT this return request?")) {
                                try {
                                  await updateReturnRequestStatus(ret.id, "rejected");
                                  notify("Return request rejected.");
                                  loadReturns(returnsPage).catch(() => {});
                                } catch (err) {
                                  notify(err.message || "Failed to reject return.");
                                }
                              }
                            }}
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <span className="text-gray-400 text-xs italic">Handled</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination
            currentPage={returnsPagination.currentPage}
            totalPages={returnsPagination.totalPages}
            onPageChange={(p) => setReturnsPage(p)}
          />
        </div>
      ) : (
        <p className="text-sm text-gray-500 py-10 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
          No return requests recorded yet.
        </p>
      )}
    </div>
  );
}
