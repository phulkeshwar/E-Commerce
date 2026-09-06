export function SellerBulkUploadTab({
  handleBulkImportSubmit,
  bulkJson,
  setBulkJson,
  handleFileChange,
  importing,
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 stack">
      <h2 className="text-lg font-bold text-gray-900 mb-1">📥 Bulk Product Import</h2>
      <p className="text-xs text-gray-500 mb-4 font-semibold">
        Upload a JSON file containing a list of products or paste a JSON array directly to list them in bulk.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 stack gap-4">
          <form onSubmit={handleBulkImportSubmit} className="stack gap-4 text-sm">
            <div className="field">
              <label className="label text-xs font-semibold text-gray-700">Paste JSON Array</label>
              <textarea
                rows="12"
                className="input font-mono text-xs w-full p-3 bg-gray-50/40 border border-gray-300 rounded-xl"
                placeholder='[{"name": "Organic Rice", "category": "Pantry", "price": 99, "stockCount": 100}]'
                value={bulkJson}
                onChange={(e) => setBulkJson(e.target.value)}
                required
              />
            </div>

            <div className="flex justify-between items-center gap-4">
              <div>
                <label className="button button-secondary text-xs px-4 py-2 rounded-xl border border-gray-300 cursor-pointer hover:bg-gray-50 inline-flex items-center gap-1.5 font-bold">
                  📁 Upload JSON File
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
              <button
                type="submit"
                disabled={importing || !bulkJson.trim()}
                className="button button-primary bg-[#c4622d] hover:bg-[#a95223] text-white font-bold py-2.5 px-6 rounded-xl text-xs transition-all border-0 shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {importing ? "Importing Products..." : "🚀 Import Products"}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-amber-50/40 border border-amber-200/50 rounded-2xl p-5 text-xs text-gray-750 stack gap-2">
          <h4 className="font-bold text-amber-800 text-sm mb-1">📋 Product JSON Schema</h4>
          <p>Each product object in the array should conform to this structure:</p>
          <pre className="bg-[#1e1109] text-amber-200 rounded-xl p-3 font-mono text-[10px] overflow-x-auto leading-relaxed">
{`{
  "name": "Required (String)",
  "category": "Required (String)",
  "price": "Required (Number)",
  "originalPrice": "Optional (Number)",
  "description": "Optional (String)",
  "emoji": "Optional (String, default: 📦)",
  "stockCount": "Optional (Number, default: 0)",
  "inStock": "Optional (Boolean, default: true)",
  "deliveryFee": "Optional (Number, default: 0)"
}`}
          </pre>
          <p className="mt-1 font-semibold text-[10px] text-amber-900/70">
            💡 Hint: Save your catalog from Excel or database as a JSON array and import it here instantly.
          </p>
        </div>
      </div>
    </div>
  );
}
