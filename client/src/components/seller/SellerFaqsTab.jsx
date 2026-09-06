export function SellerFaqsTab({
  faqs,
  dashboard,
  answerDrafts,
  setAnswerDrafts,
  handleAnswerSubmit,
  submittingAnswers,
  handleAIDraftAnswer,
  loadingAIDraft,
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 stack">
      <h2 className="text-lg font-bold text-gray-900 mb-2">❓ Buyer Product Questions (Q&A)</h2>
      <p className="text-xs text-gray-500 mb-6">
        Buyers submit questions about your items. Provide concise and accurate answers to boost your conversions!
      </p>

      {faqs.length > 0 ? (
        <div className="space-y-6">
          {faqs.map((faq) => {
            const product = dashboard?.products?.find((p) => p.id === faq.productId);
            return (
              <div
                key={faq.id}
                className="p-5 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-all text-left"
              >
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="text-xs bg-[#c4622d]/10 text-[#c4622d] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                    Product
                  </span>
                  <span className="text-xs font-semibold text-gray-600">
                    {product ? `${product.emoji} ${product.name}` : "Unknown Product"}
                  </span>
                </div>

                <div className="space-y-4 pl-1">
                  {/* Question */}
                  <div className="flex gap-3">
                    <span className="text-emerald-600 font-black text-sm shrink-0">Q:</span>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm leading-relaxed">{faq.question}</p>
                      <p className="text-[0.68rem] text-gray-400 font-medium mt-0.5">
                        Asked by {faq.buyerName} on {new Date(faq.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Answer */}
                  <div className="flex gap-3 pt-2 border-t border-gray-100">
                    <span className="text-purple-600 font-black text-sm shrink-0">A:</span>
                    <div className="flex-1">
                      {faq.isAnswered ? (
                        <div>
                          <p className="text-gray-700 text-sm leading-relaxed">{faq.answer}</p>
                          <p className="text-[0.68rem] text-gray-400 font-medium mt-0.5">
                            Answered by you on {new Date(faq.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <textarea
                            placeholder="Write your detailed answer here..."
                            value={answerDrafts[faq.id] || ""}
                            onChange={(e) =>
                              setAnswerDrafts((prev) => ({ ...prev, [faq.id]: e.target.value }))
                            }
                            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#c4622d] transition-all bg-white min-h-[70px] resize-y"
                          />
                          <div className="flex gap-2 items-center">
                            <button
                              onClick={() => handleAnswerSubmit(faq.id)}
                              disabled={submittingAnswers[faq.id] || !answerDrafts[faq.id]?.trim()}
                              className="bg-[#c4622d] hover:bg-[#a95223] disabled:opacity-50 text-white font-bold py-2 px-4 rounded-xl text-xs transition-all shadow-sm border-0 cursor-pointer"
                            >
                              {submittingAnswers[faq.id] ? "Submitting..." : "Submit Answer"}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAIDraftAnswer(faq.id, faq.question, faq.productId)}
                              disabled={loadingAIDraft[faq.id]}
                              className="border border-purple-300 hover:bg-purple-50 text-purple-700 font-bold py-2 px-4 rounded-xl text-xs transition-all shadow-sm bg-white cursor-pointer"
                            >
                              {loadingAIDraft[faq.id] ? "⏳ Drafting..." : "✨ Draft with AI"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-gray-500 py-12 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
          No buyer questions received for your products.
        </p>
      )}
    </div>
  );
}
