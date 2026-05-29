import { formatCurrency } from "../../utils/formatCurrency";

const FREE_DELIVERY_THRESHOLD = 500;

export function CartSummary({ summary, discount = 0, onCheckout, code = "" }) {
  const shipping = summary.subtotal >= FREE_DELIVERY_THRESHOLD || summary.subtotal === 0 ? 0 : 49;
  const total = Math.max(summary.subtotal + shipping - discount, 0);
  const toFreeDelivery = Math.max(FREE_DELIVERY_THRESHOLD - summary.subtotal, 0);
  const deliveryProgress = Math.min((summary.subtotal / FREE_DELIVERY_THRESHOLD) * 100, 100);
  const totalSavings = discount + (summary.subtotal > 0 && shipping === 0 ? 49 : 0);

  return (
    <aside className="sticky top-24 bg-white rounded-xl border border-gray-200
                      shadow-sm overflow-hidden h-fit">

      {/* Header */}
      <div className="bg-[#f5f0e8] px-5 py-4 border-b border-gray-200">
        <h3 className="text-[0.95rem] font-bold text-[#2c1a0e] uppercase tracking-wide">
          Order Summary
        </h3>
        <p className="text-[0.75rem] text-gray-500 mt-0.5">{summary.itemCount} item{summary.itemCount !== 1 ? "s" : ""} in cart</p>
      </div>

      <div className="px-5 py-4 space-y-3">
        {/* Free Delivery Progress */}
        {summary.subtotal > 0 && summary.subtotal < FREE_DELIVERY_THRESHOLD && (
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4">
            <p className="text-[0.75rem] text-blue-700 font-semibold mb-2">
              🚚 Add <span className="font-bold">{formatCurrency(toFreeDelivery)}</span> more for FREE delivery!
            </p>
            <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${deliveryProgress}%` }}
              />
            </div>
          </div>
        )}
        {summary.subtotal >= FREE_DELIVERY_THRESHOLD && summary.subtotal > 0 && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-1">
            <p className="text-[0.78rem] text-emerald-700 font-semibold">
              🎉 You've unlocked FREE delivery!
            </p>
          </div>
        )}

        {/* Line Items */}
        <div className="flex justify-between text-sm text-gray-600">
          <span>Subtotal ({summary.itemCount} items)</span>
          <span className="font-medium text-gray-900">{formatCurrency(summary.subtotal)}</span>
        </div>

        <div className="flex justify-between text-sm text-gray-600">
          <span>Delivery Charges</span>
          <span className={`font-medium ${shipping === 0 ? "text-emerald-600" : "text-gray-900"}`}>
            {shipping === 0 ? (summary.subtotal > 0 ? "FREE 🎉" : "—") : formatCurrency(shipping)}
          </span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between text-sm text-emerald-600">
            <span>Promo{code ? ` (${code})` : ""}</span>
            <span className="font-semibold">−{formatCurrency(discount)}</span>
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-dashed border-gray-200 pt-3">
          <div className="flex justify-between">
            <span className="font-bold text-gray-900 text-[0.95rem]">Total</span>
            <span className="font-bold text-gray-900 text-[1.05rem]">{formatCurrency(total)}</span>
          </div>
          {totalSavings > 0 && (
            <p className="text-[0.75rem] text-emerald-600 font-semibold text-right mt-0.5">
              You save {formatCurrency(totalSavings)} 🎉
            </p>
          )}
        </div>

        {/* CTA */}
        <button
          onClick={onCheckout}
          className="w-full bg-[#c4622d] hover:bg-[#e07a4a] active:scale-[0.98]
                     text-white font-bold py-3.5 rounded-lg text-sm transition-all duration-150
                     shadow-sm hover:shadow-md mt-2"
        >
          Proceed to Checkout →
        </button>

        {/* Trust Signals */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100">
          {[["🔒", "Secure"], ["💳", "All Cards"], ["↩️", "Easy Returns"]].map(([icon, label]) => (
            <div key={label} className="flex flex-col items-center gap-1 text-center">
              <span className="text-lg">{icon}</span>
              <span className="text-[0.62rem] text-gray-500 font-medium">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
