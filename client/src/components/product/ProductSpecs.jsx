export function ProductSpecs({ specifications = {}, specsOpen, setSpecsOpen }) {
  const specEntries = Object.entries(specifications || {});
  if (specEntries.length === 0) return null;

  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden bg-white">
      <button
        onClick={() => setSpecsOpen(!specsOpen)}
        className="w-full flex items-center justify-between px-4 py-3 font-bold text-gray-800 text-sm hover:bg-gray-50 transition-colors cursor-pointer border-0 bg-transparent"
      >
        <span>📋 Product Specifications</span>
        <svg
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`w-4 h-4 transition-transform ${specsOpen ? "rotate-180" : ""}`}
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      {specsOpen && (
        <div className="border-t border-gray-100">
          <table className="w-full text-sm">
            <tbody>
              {specEntries.map(([key, val], idx) => (
                <tr key={key} className={idx % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                  <td className="px-4 py-2.5 font-semibold text-gray-600 w-2/5 border-b border-gray-100">{key}</td>
                  <td className="px-4 py-2.5 text-gray-800 border-b border-gray-100">{val}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
