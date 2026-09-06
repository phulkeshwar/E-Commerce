export function SellerReviewsTab({
  dashboard,
  selectedReviewProductId,
  setSelectedReviewProductId,
  loadingReviews,
  productReviews,
  handleAIDraftReview,
  loadingReviewDraft,
  reviewDrafts,
  notify,
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 stack">
      <h2 className="text-lg font-bold text-gray-900 mb-4">⭐ Customer Ratings & Reviews</h2>

      <div className="mb-6">
        <label className="text-xs font-bold text-gray-500 block mb-1.5 uppercase tracking-wider">
          Select Product to View Reviews
        </label>
        <select
          value={selectedReviewProductId}
          onChange={(e) => setSelectedReviewProductId(e.target.value)}
          className="w-full max-w-md border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#c4622d] transition-all bg-white"
        >
          {dashboard?.products?.map((prod) => (
            <option key={prod.id} value={prod.id}>
              {prod.emoji} {prod.name} ({prod.reviewCount || 0} reviews)
            </option>
          ))}
          {dashboard?.products?.length === 0 && (
            <option value="">No products available</option>
          )}
        </select>
      </div>

      {loadingReviews ? (
        <p className="text-sm text-gray-500 py-6 text-center animate-pulse">Loading reviews...</p>
      ) : productReviews.length > 0 ? (
        <div className="space-y-4">
          {productReviews.map((rev) => (
            <article
              key={rev.id}
              className="p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-gray-100/50 transition-colors"
            >
              <div className="flex justify-between items-start gap-4 mb-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-yellow-500 text-sm">
                      {"★".repeat(rev.rating)}
                      {"☆".repeat(5 - rev.rating)}
                    </span>
                    <span className="font-bold text-gray-900 text-sm">{rev.title}</span>
                  </div>
                  <p className="text-[0.7rem] text-gray-400 font-semibold mt-0.5">
                    By {rev.name} on {new Date(rev.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed mt-1">{rev.body}</p>

              <div className="mt-3 flex flex-col gap-2 pt-2.5 border-t border-gray-200/50">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleAIDraftReview(rev.id, rev.rating, rev.body)}
                    disabled={loadingReviewDraft[rev.id]}
                    className="bg-transparent border border-[#c4622d] hover:bg-[#c4622d]/5 text-[#c4622d] hover:text-[#a95223] font-bold py-1 px-3 rounded-lg text-[10px] transition-colors cursor-pointer flex items-center gap-1"
                  >
                    {loadingReviewDraft[rev.id] ? "⏳ Generating..." : "✨ Draft Reply with AI"}
                  </button>
                </div>
                {reviewDrafts[rev.id] && (
                  <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-3 text-xs leading-relaxed text-gray-700 flex flex-col gap-2 relative">
                    <span className="font-bold text-[#c4622d] text-[10px] uppercase tracking-wider text-left">
                      AI Suggested Reply:
                    </span>
                    <p className="m-0 italic">"{reviewDrafts[rev.id]}"</p>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(reviewDrafts[rev.id]);
                        notify("📋 Copied to clipboard!");
                      }}
                      className="self-end px-2.5 py-1 bg-[#c4622d] hover:bg-[#a95223] text-white rounded-lg text-[10px] font-bold border-0 cursor-pointer shadow-sm transition-colors"
                    >
                      📋 Copy Reply
                    </button>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 py-10 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
          No customer reviews received for this product yet.
        </p>
      )}
    </div>
  );
}
