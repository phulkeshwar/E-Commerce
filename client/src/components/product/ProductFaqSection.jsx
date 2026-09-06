export function ProductFaqSection({
  faqs = [],
  user,
  isAuthenticated,
  questionDraft,
  setQuestionDraft,
  submittingQuestion,
  handleQuestionSubmit,
  navigate,
}) {
  return (
    <section className="mt-10 bg-white rounded-2xl border border-gray-200 p-5 md:p-8">
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="text-[0.68rem] font-bold uppercase tracking-widest text-[#9b6b3a] mb-0.5">
            Customer Q&A
          </p>
          <h2 className="text-xl font-bold text-[#2c1a0e]">Frequently Asked Questions</h2>
        </div>
      </div>

      {user?.role === "seller" ? (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4 mb-6 text-xs font-semibold leading-relaxed shadow-sm">
          🏪 Merchant Viewing Mode: Answer questions directly from your Seller Portal.
        </div>
      ) : isAuthenticated ? (
        <form onSubmit={handleQuestionSubmit} className="mb-8 bg-gray-50 p-4 rounded-xl border border-gray-100">
          <label className="text-xs font-bold text-gray-600 block mb-1.5">
            Ask a question about this product
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g., Is this product organic/gluten-free?"
              value={questionDraft}
              onChange={(e) => setQuestionDraft(e.target.value)}
              className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#c4622d] transition-all bg-white"
              required
            />
            <button
              type="submit"
              disabled={submittingQuestion || !questionDraft.trim()}
              className="bg-[#c4622d] hover:bg-[#a95223] disabled:opacity-50 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-all shadow-sm cursor-pointer border-0"
            >
              {submittingQuestion ? "Submitting..." : "Ask Question"}
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-6 text-sm text-blue-700">
          <button
            type="button"
            onClick={() => navigate("/auth")}
            className="font-semibold underline cursor-pointer bg-transparent border-0 p-0 text-blue-700"
          >
            Sign in
          </button>{" "}
          to ask a question.
        </div>
      )}

      {/* Questions list */}
      <div className="space-y-6">
        {faqs.map((faq) => (
          <div key={faq.id} className="pb-5 border-b border-gray-100 last:border-0 last:pb-0">
            <div className="flex gap-3 items-start">
              <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded shrink-0">
                Q
              </span>
              <div className="space-y-1">
                <p className="font-bold text-gray-900 text-sm">{faq.question}</p>
                <p className="text-[0.68rem] text-gray-400 font-semibold">
                  Asked by {faq.buyerName} on {new Date(faq.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex gap-3 items-start mt-3 pl-2 border-l-2 border-purple-200 text-left">
              <span className="text-xs font-black text-purple-600 bg-purple-50 px-2 py-0.5 rounded shrink-0">
                A
              </span>
              <div className="space-y-1">
                {faq.isAnswered ? (
                  <>
                    <p className="text-gray-700 text-sm leading-relaxed">{faq.answer}</p>
                    <p className="text-[0.68rem] text-gray-400 font-semibold">
                      Answered by {faq.answeredByName || "Merchant"}
                    </p>
                  </>
                ) : (
                  <p className="text-gray-400 text-xs italic">
                    This question hasn't been answered by the merchant yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}

        {faqs.length === 0 && (
          <p className="text-center text-gray-500 text-sm py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            No questions asked about this product yet. Ask yours above!
          </p>
        )}
      </div>
    </section>
  );
}
