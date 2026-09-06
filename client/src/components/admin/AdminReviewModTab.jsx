import { Pagination } from "../ui/Pagination";
import {
  approveReviewRequest,
  rejectReviewRequest,
} from "../../api/admin.api";

export function AdminReviewModTab({
  pendingReviewsList,
  loadingPendingReviews,
  pendingReviewsPagination,
  pendingReviewsPage,
  setPendingReviewsPage,
  loadPendingReviews,
  notify,
  confirm,
}) {
  const handleApproveReview = async (id) => {
    try {
      await approveReviewRequest(id);
      notify("Review approved and published!");
      loadPendingReviews(pendingReviewsPage).catch(() => {});
    } catch (err) {
      notify(err.message || "Failed to approve review.");
    }
  };

  const handleRejectReview = async (id) => {
    if (!(await confirm("Are you sure you want to REJECT and delete this review?"))) return;
    try {
      await rejectReviewRequest(id);
      notify("Review rejected and deleted.");
      loadPendingReviews(pendingReviewsPage).catch(() => {});
    } catch (err) {
      notify(err.message || "Failed to reject review.");
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 stack">
      <h2 className="text-lg font-bold text-gray-900 mb-1">🛡️ Review Moderation Queue</h2>
      <p className="text-xs text-gray-500 mb-4">
        Approve or reject customer product reviews before they are published to the storefront.
      </p>

      {loadingPendingReviews ? (
        <p className="text-sm text-gray-500 py-6 text-center animate-pulse">Loading pending reviews...</p>
      ) : pendingReviewsList.length > 0 ? (
        <div className="table-card bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto mt-4">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b-2 border-gray-200">
                <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider text-left">
                  Product
                </th>
                <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider text-left">
                  Customer
                </th>
                <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider text-left">
                  Rating
                </th>
                <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider text-left">
                  Review
                </th>
                <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {pendingReviewsList.map((rev) => (
                <tr
                  key={rev.id}
                  className="hover:bg-amber-50/20 transition-colors border-b border-gray-100 last:border-0"
                >
                  <td className="!py-3 !px-4 text-xs font-semibold text-gray-900 whitespace-nowrap">
                    <span className="mr-1">{rev.product?.emoji || "📦"}</span>
                    {rev.product?.name || "Unknown Product"}
                  </td>
                  <td className="!py-3 !px-4 text-xs text-gray-750 whitespace-nowrap">
                    {rev.name} ({rev.user?.email || "No email"})
                  </td>
                  <td className="!py-3 !px-4 text-amber-500 font-bold whitespace-nowrap">
                    {"★".repeat(rev.rating)}
                  </td>
                  <td className="!py-3 !px-4 text-xs text-gray-600 max-w-[250px] break-words">
                    <strong className="block text-gray-800 font-bold mb-0.5">{rev.title}</strong>
                    {rev.body}
                  </td>
                  <td className="!py-3 !px-4 text-right whitespace-nowrap">
                    <div className="flex justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleApproveReview(rev.id)}
                        className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer border-0"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRejectReview(rev.id)}
                        className="px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer border-0"
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination
            currentPage={pendingReviewsPagination.currentPage}
            totalPages={pendingReviewsPagination.totalPages}
            onPageChange={(p) => setPendingReviewsPage(p)}
          />
        </div>
      ) : (
        <p className="text-sm text-gray-500 py-10 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
          🎉 All customer reviews are fully moderated!
        </p>
      )}
    </div>
  );
}
