export function ProductAiSummary({
  reviewsCount = 0,
  loadingSummary,
  summaryError,
  summaryData,
  onRetry,
}) {
  if (reviewsCount < 5) return null;

  return (
    <div className="mb-6 p-6 rounded-2xl bg-gradient-to-br from-amber-50/50 to-orange-50/30 border border-amber-200/60 shadow-sm backdrop-blur-md relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">✨</span>
        <h3 className="text-sm font-black text-[#2c1a0e] tracking-tight uppercase">AI Review Summary</h3>
        <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full ml-auto">
          Powered by Gemini
        </span>
      </div>

      {loadingSummary ? (
        <div className="py-6 flex flex-col items-center justify-center gap-2 text-xs font-bold text-gray-500">
          <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          Analyzing {reviewsCount} reviews...
        </div>
      ) : summaryError ? (
        <div className="text-xs text-red-600 font-semibold flex items-center gap-2 py-2">
          <span>⚠️</span> {summaryError}
          <button
            type="button"
            onClick={onRetry}
            className="underline text-amber-700 hover:text-amber-800 ml-auto cursor-pointer border-0 bg-transparent font-bold"
          >
            Retry
          </button>
        </div>
      ) : summaryData ? (
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {summaryData.pros?.length > 0 && (
              <div>
                <h4 className="font-bold text-emerald-800 flex items-center gap-1.5 mb-2">
                  👍 Pros
                </h4>
                <ul className="list-disc pl-4 space-y-1 text-gray-700 font-medium">
                  {summaryData.pros.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </div>
            )}
            {summaryData.cons?.length > 0 && (
              <div>
                <h4 className="font-bold text-rose-800 flex items-center gap-1.5 mb-2">
                  👎 Cons
                </h4>
                <ul className="list-disc pl-4 space-y-1 text-gray-700 font-medium">
                  {summaryData.cons.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          {summaryData.verdict && (
            <div className="pt-3 border-t border-amber-200/50">
              <h4 className="font-bold text-[#2c1a0e] mb-1">📢 AI Verdict</h4>
              <p className="text-gray-700 italic font-semibold leading-relaxed">
                "{summaryData.verdict}"
              </p>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
