import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CartItem } from "../components/cart/CartItem";
import { PromoCode } from "../components/cart/PromoCode";
import { CartSummary } from "../components/cart/CartSummary";
import { SavedForLaterSection } from "../components/cart/SavedForLaterSection";
import { useAppContext } from "../hooks/useAppContext";
import { useDocumentMetadata } from "../hooks/useDocumentMetadata";

export function CartPage() {
  const navigate = useNavigate();
  const { cart, notify, user, toggleWishlist } = useAppContext();
  const [promo, setPromo] = useState({ code: "", discount: 0 });

  useDocumentMetadata({
    title: "Your Shopping Cart",
    description: "Review your organic essentials, apply coupons, and checkout securely on GaramBazaar."
  });

  if (user?.role === "seller") {
    return (
      <section className="page-content text-center py-20 bg-gray-50 min-h-screen">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 border border-amber-100">
          <span className="text-5xl">🏪</span>
          <h2 className="text-2xl font-black text-gray-900 mt-4 mb-2">Merchant Viewing Mode</h2>
          <p className="text-gray-500 text-sm mb-6">
            Sellers are restricted from purchasing products. Only viewing is enabled.
          </p>
          <button
            onClick={() => navigate("/seller")}
            className="w-full bg-[#c4622d] text-white font-bold py-3.5 px-6 rounded-xl hover:shadow-md transition-all text-sm"
          >
            Go to Seller Dashboard
          </button>
        </div>
      </section>
    );
  }

  const handleSaveForLater = (id, variantName) => {
    const item = cart.items.find(
      (i) => (i.id || i._id) === id && i.variantName === variantName
    );
    cart.saveForLater(id, variantName);
    notify(`${item ? item.name : "Product"} has been saved for later.`);
  };

  const handleMoveToCart = (id, variantName) => {
    const item = (cart.savedForLater || []).find(
      (i) => (i.id || i._id) === id && i.variantName === variantName
    );
    cart.moveToCart(id, variantName);
    notify(`${item ? item.name : "Product"} moved to your cart.`);
  };

  const handleRemoveSaved = (id, variantName) => {
    cart.removeFromSavedForLater(id, variantName);
    notify("Item removed from saved for later.");
  };

  const handleClearSaved = () => {
    cart.clearSavedForLater();
    notify("All saved for later items cleared.");
  };

  const handleAddToWishlist = (id) => {
    if (toggleWishlist) {
      toggleWishlist(id);
      notify("Wishlist updated.");
    }
  };

  const hasActiveItems = cart.items.length > 0;
  const hasSavedItems = (cart.savedForLater || []).length > 0;

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
          {hasSavedItems && (
            <span className="text-xs font-medium text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full ml-2">
              {cart.savedForLater.length} saved for later
            </span>
          )}
        </h1>

        {!hasActiveItems ? (
          /* ── Empty Cart State ─────────────────────────────────── */
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 py-12 flex flex-col
                            items-center justify-center text-center px-6">
              <div className="text-6xl mb-4">🛒</div>
              <h2 className="text-xl font-bold text-gray-800 mb-1">Your cart is empty</h2>
              <p className="text-gray-500 text-sm mb-5">
                {hasSavedItems
                  ? "You have saved items below ready to be moved to your cart whenever you wish."
                  : "Looks like you haven't added anything yet."}
              </p>
              <button
                onClick={() => navigate("/shop")}
                className="bg-[#c4622d] hover:bg-[#e07a4a] text-white font-bold
                           px-8 py-2.5 rounded-xl text-sm transition-colors shadow-sm cursor-pointer"
              >
                Start Shopping →
              </button>
            </div>

            {/* If items are saved for later, show them right here! */}
            {hasSavedItems && (
              <SavedForLaterSection
                items={cart.savedForLater}
                onMoveToCart={handleMoveToCart}
                onRemove={handleRemoveSaved}
                onClearAll={handleClearSaved}
                onAddToWishlist={handleAddToWishlist}
              />
            )}
          </div>
        ) : (
          /* ── Two-Column Layout ──────────────────────────── */
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5 items-start">

            {/* Left — Cart Items & Saved For Later */}
            <div className="space-y-4">
              {/* Select all row */}
              <div className="bg-white rounded-xl border border-gray-200 px-5 py-3
                              flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">
                  {cart.summary.itemCount} item{cart.summary.itemCount !== 1 ? "s" : ""} in your cart
                </span>
                <button
                  onClick={() => {
                    cart.items.forEach(item => cart.removeFromCart(item.id, item.variantName));
                    notify("Cart cleared.");
                  }}
                  className="text-[0.78rem] text-red-500 hover:text-red-700 font-semibold
                             hover:underline transition-colors cursor-pointer"
                >
                  Clear Cart
                </button>
              </div>

              {/* Items */}
              {cart.items.map((item) => (
                <CartItem
                  key={`${item.id}-${item.variantName || "default"}`}
                  item={item}
                  onQuantityChange={cart.updateQuantity}
                  onRemove={(id, variantName) => {
                    cart.removeFromCart(id, variantName);
                    notify("Item removed from cart.");
                  }}
                  onSaveForLater={handleSaveForLater}
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
                className="text-[#c4622d] text-sm font-semibold hover:underline flex items-center gap-1 cursor-pointer"
              >
                ← Continue Shopping
              </button>

              {/* Saved For Later Section */}
              <SavedForLaterSection
                items={cart.savedForLater}
                onMoveToCart={handleMoveToCart}
                onRemove={handleRemoveSaved}
                onClearAll={handleClearSaved}
                onAddToWishlist={handleAddToWishlist}
              />
            </div>

            {/* Right — Order Summary (sticky) */}
            <CartSummary
              items={cart.items}
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
