import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CartItem } from "../components/cart/CartItem";
import { PromoCode } from "../components/cart/PromoCode";
import { CartSummary } from "../components/cart/CartSummary";
import { useAppContext } from "../hooks/useAppContext";

export function CartPage() {
  const navigate = useNavigate();
  const { cart, notify } = useAppContext();
  const [promo, setPromo] = useState({ code: "", discount: 0 });

  return (
    <section className="min-h-screen bg-gray-50 py-4 md:py-8">
      <div className="max-w-6xl mx-auto px-3 md:px-6">

        {/* Page Title */}
        <h1 className="text-xl md:text-2xl font-bold text-[#2c1a0e] mb-5 flex items-center gap-2">
          <span>🛒</span>
          <span>My Cart</span>
          <span className="text-[0.85rem] font-normal text-gray-500 ml-1">
            ({cart.summary.itemCount} {cart.summary.itemCount === 1 ? "item" : "items"})
          </span>
        </h1>

        {cart.items.length === 0 ? (
          /* ── Empty State ─────────────────────────────────── */
          <div className="bg-white rounded-2xl border border-gray-200 py-20 flex flex-col
                          items-center justify-center text-center px-6">
            <div className="text-7xl mb-5">🛒</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 text-sm mb-6">
              Looks like you haven't added anything yet.
            </p>
            <button
              onClick={() => navigate("/shop")}
              className="bg-[#c4622d] hover:bg-[#e07a4a] text-white font-bold
                         px-8 py-3 rounded-lg text-sm transition-colors shadow-sm"
            >
              Start Shopping →
            </button>
          </div>
        ) : (
          /* ── Two-Column Layout ──────────────────────────── */
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5 items-start">

            {/* Left — Cart Items */}
            <div className="space-y-3">
              {/* Select all row */}
              <div className="bg-white rounded-xl border border-gray-200 px-5 py-3
                              flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">
                  {cart.summary.itemCount} item{cart.summary.itemCount !== 1 ? "s" : ""} in your cart
                </span>
                <button
                  onClick={() => {
                    cart.items.forEach(item => cart.removeFromCart(item.id));
                    notify("Cart cleared.");
                  }}
                  className="text-[0.78rem] text-red-500 hover:text-red-700 font-semibold
                             hover:underline transition-colors"
                >
                  Clear Cart
                </button>
              </div>

              {/* Items */}
              {cart.items.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onQuantityChange={cart.updateQuantity}
                  onRemove={(id) => {
                    cart.removeFromCart(id);
                    notify("Item removed from cart.");
                  }}
                />
              ))}

              {/* Promo Code */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <PromoCode
                  subtotal={cart.summary.subtotal}
                  onApply={(nextPromo) => {
                    setPromo(nextPromo);
                    notify(nextPromo.message);
                  }}
                />
              </div>

              {/* Continue shopping */}
              <button
                onClick={() => navigate("/shop")}
                className="text-[#c4622d] text-sm font-semibold hover:underline flex items-center gap-1"
              >
                ← Continue Shopping
              </button>
            </div>

            {/* Right — Order Summary (sticky) */}
            <CartSummary
              summary={cart.summary}
              discount={promo.discount}
              code={promo.code}
              onCheckout={() => navigate("/checkout", { state: promo })}
            />
          </div>
        )}
      </div>
    </section>
  );
}
