import { Pagination } from "../ui/Pagination";
import { updateUserCertificationRequest } from "../../api/admin.api";

export function AdminSellerVerifyTab({
  sellersList,
  loadingSellers,
  sellersPagination,
  sellersPage,
  setSellersPage,
  loadPendingSellers,
  notify,
}) {
  const handleApproveSeller = async (sellerId) => {
    try {
      await updateUserCertificationRequest(sellerId, "certified");
      notify("Seller verified and certified successfully!");
      loadPendingSellers(sellersPage).catch(() => {});
    } catch (err) {
      notify(err.message || "Failed to verify seller.");
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 stack">
      <h2 className="text-lg font-bold text-gray-900 mb-1">🏪 Seller Verification Queue</h2>
      <p className="text-xs text-gray-500 mb-4">
        Review and approve registration requests from new merchants on GaramBazaar.
      </p>

      {loadingSellers ? (
        <p className="text-sm text-gray-500 py-6 text-center animate-pulse">Loading pending sellers...</p>
      ) : sellersList.length > 0 ? (
        <div className="table-card bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto mt-4">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b-2 border-gray-200">
                <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider text-left">Merchant</th>
                <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider text-left">Email</th>
                <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider text-left">Verification Status</th>
                <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sellersList.map((seller) => (
                <tr key={seller.id} className="hover:bg-amber-50/20 transition-colors border-b border-gray-100 last:border-0">
                  <td className="!py-3 !px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs shrink-0">
                        {seller.name?.[0]?.toUpperCase() || "S"}
                      </div>
                      <span className="font-semibold text-gray-900 text-sm">{seller.name || "Unknown Merchant"}</span>
                    </div>
                  </td>
                  <td className="!py-3 !px-4 text-gray-600 text-xs whitespace-nowrap">{seller.email}</td>
                  <td className="!py-3 !px-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-50 text-amber-700 border border-amber-200">
                      {seller.certificationStatus || "new"}
                    </span>
                  </td>
                  <td className="!py-3 !px-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleApproveSeller(seller.id)}
                      className="px-3.5 py-2 bg-[#c4622d] text-white rounded-lg text-xs font-bold hover:bg-[#e07a4a] transition-all cursor-pointer border-0 shadow-sm"
                    >
                      ✅ Approve & Certify
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination
            currentPage={sellersPagination.currentPage}
            totalPages={sellersPagination.totalPages}
            onPageChange={(p) => setSellersPage(p)}
          />
        </div>
      ) : (
        <p className="text-sm text-gray-500 py-10 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
          🎉 No pending seller verifications in the queue!
        </p>
      )}
    </div>
  );
}
