export function SellerCouponsTab({
  newCoupon,
  setNewCoupon,
  handleCreateCoupon,
  loadingCoupons,
  couponsList,
  handleDeleteCoupon,
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 stack">
      <div className="section-head mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">🎟️ My Coupon Codes</h2>
          <p className="text-xs text-gray-500 font-semibold">
            Create and manage your merchant-specific discount coupons. These apply only to your store products.
          </p>
        </div>
      </div>

      {/* Create Coupon Form */}
      <form
        onSubmit={handleCreateCoupon}
        className="bg-gray-50 rounded-xl border border-gray-150 p-5 grid grid-cols-1 md:grid-cols-5 gap-4 items-end mb-6 text-sm"
      >
        <div className="field">
          <label className="label text-xs font-semibold text-gray-700">Code (uppercase)</label>
          <input
            type="text"
            className="input py-2"
            required
            placeholder="e.g. MYSTORE20"
            value={newCoupon.code}
            onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase().trim() })}
          />
        </div>
        <div className="field">
          <label className="label text-xs font-semibold text-gray-700">Discount Type</label>
          <select
            className="input py-2"
            value={newCoupon.discountType}
            onChange={(e) => setNewCoupon({ ...newCoupon, discountType: e.target.value })}
          >
            <option value="percent">Percentage (%)</option>
            <option value="flat">Flat Amount (₹)</option>
          </select>
        </div>
        <div className="field">
          <label className="label text-xs font-semibold text-gray-700">
            Value ({newCoupon.discountType === "percent" ? "%" : "₹"})
          </label>
          <input
            type="number"
            min="1"
            className="input py-2"
            required
            placeholder="e.g. 20"
            value={newCoupon.discountValue}
            onChange={(e) => setNewCoupon({ ...newCoupon, discountValue: e.target.value })}
          />
        </div>
        <div className="field">
          <label className="label text-xs font-semibold text-gray-700">Min Order (₹)</label>
          <input
            type="number"
            min="0"
            className="input py-2"
            placeholder="e.g. 300"
            value={newCoupon.minOrderAmount}
            onChange={(e) => setNewCoupon({ ...newCoupon, minOrderAmount: e.target.value })}
          />
        </div>
        <div className="field flex justify-end">
          <button type="submit" className="button button-primary w-full py-2 font-semibold border-0 cursor-pointer">
            Generate
          </button>
        </div>
      </form>

      {/* Coupons List */}
      {loadingCoupons ? (
        <p className="text-sm text-gray-500 py-6 text-center animate-pulse">Loading coupons...</p>
      ) : couponsList.length > 0 ? (
        <div className="table-card bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-150">
                <th className="text-left !py-3 !px-4 text-xs font-bold text-gray-600 uppercase">Code</th>
                <th className="text-left !py-3 !px-4 text-xs font-bold text-gray-600 uppercase">Type</th>
                <th className="text-left !py-3 !px-4 text-xs font-bold text-gray-600 uppercase">Value</th>
                <th className="text-left !py-3 !px-4 text-xs font-bold text-gray-600 uppercase">Min Order</th>
                <th className="text-right !py-3 !px-4 text-xs font-bold text-gray-600 uppercase">Action</th>
              </tr>
            </thead>
            <tbody>
              {couponsList.map((cpn) => (
                <tr
                  key={cpn.id || cpn._id}
                  className="hover:bg-amber-50/20 border-b border-gray-100 last:border-0 font-medium"
                >
                  <td className="font-bold text-[#c4622d] tracking-wider !py-3 !px-4">{cpn.code}</td>
                  <td className="text-xs capitalize text-gray-600 !py-3 !px-4">{cpn.discountType}</td>
                  <td className="font-semibold text-gray-900 !py-3 !px-4">
                    {cpn.discountType === "percent" ? `${cpn.discountValue}%` : `₹${cpn.discountValue}`}
                  </td>
                  <td className="text-gray-600 !py-3 !px-4">₹{cpn.minOrderAmount || 0}</td>
                  <td className="text-right !py-3 !px-4">
                    <button
                      type="button"
                      className="text-red-500 hover:text-red-700 font-semibold text-xs transition-colors border-0 bg-transparent cursor-pointer"
                      onClick={() => handleDeleteCoupon(cpn.id || cpn._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-gray-500 py-10 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
          No merchant coupons generated yet. Create one above!
        </p>
      )}
    </div>
  );
}
