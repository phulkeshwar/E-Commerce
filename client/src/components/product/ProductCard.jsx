import { useState } from "react";
import { Link } from "react-router-dom";
import { useAppContext } from "../../hooks/useAppContext";
import { calculateDiscount } from "../../utils/calculateDiscount";
import { formatCurrency } from "../../utils/formatCurrency";
import { TrackHistoryModal } from "./TrackHistoryModal";
import { trackAffiliateClickRequest } from "../../api/affiliate.api";

// Filled star SVG
function StarFilled() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-amber-400">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

function StarEmpty() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5 text-gray-300">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

function HeartIcon({ filled }) {
  return (
    <svg viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"}
      stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

import { optimizeCloudinaryUrl } from "../../utils/optimizeImage";
import { getAmazonProductUrl } from "../../utils/amazonLinks";

export function ProductCard({ product }) {
  const [imageError, setImageError] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { cart, wishlistIds, toggleWishlist, notify, user } = useAppContext();
  const discount = calculateDiscount(product.price, product.originalPrice);
  const isWishlisted = wishlistIds.includes(product.id);
  const imageUrl = product.images?.[0]?.url;
  const showImage = imageUrl && !imageError;
  const savings = product.originalPrice ? product.originalPrice - product.price : 0;

  return (
    <article className="pcard group relative flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white
                        shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5">

      {/* ── Image Area ── */}
      <Link to={`/products/${product.slug}`} className="block relative overflow-hidden"
        style={{ background: product.bg || "#f5f0e8" }}>
        <div className="h-[120px] md:h-[150px] flex items-center justify-center overflow-hidden">
          {showImage ? (
            <img
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              src={optimizeCloudinaryUrl(imageUrl, { width: 400 })}
              alt={product.name}
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 text-gray-400 p-2 text-center">
              <svg className="w-10 h-10 mb-1 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{product.category || "Product"}</span>
            </div>
          )}
        </div>

        {/* Badges */}
        {(product.badge || product.source === "amazon") && (
          <span className={`absolute top-2 left-2 px-2 py-0.5 rounded text-[0.6rem] font-bold uppercase tracking-wide
            ${product.badge?.toLowerCase() === "sale" ? "bg-[#c4622d] text-white" :
              product.badge?.toLowerCase() === "new" ? "bg-emerald-600 text-white" :
              product.source === "amazon" ? "bg-[#232f3e] text-amber-400 border border-amber-400/30" :
              "bg-gray-700 text-white"}`}>
            {product.badge || "Amazon"}
          </span>
        )}

        {/* Out of stock overlay */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="text-[0.72rem] font-bold uppercase tracking-wide text-gray-500
                             border border-gray-300 px-3 py-1 rounded-full bg-white">
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      {/* ── Wishlist Button ── */}
      <button
        onClick={() => toggleWishlist(product.id)}
        className={`absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full
                    border shadow-sm transition-all duration-150
                    ${isWishlisted
                      ? "bg-[#c4622d] border-[#c4622d] text-white"
                      : "bg-white border-gray-200 text-gray-400 hover:text-[#c4622d] hover:border-[#c4622d]"}`}
        aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
      >
        <HeartIcon filled={isWishlisted} />
      </button>

      {/* ── Card Body ── */}
      <div className="flex flex-col flex-1 p-3">
        <p className="text-[0.68rem] font-semibold uppercase tracking-wider text-[#9b6b3a] mb-0.5">
          {product.category}
        </p>

        <Link
          to={`/products/${product.slug}`}
          className="text-[0.85rem] font-semibold text-gray-800 leading-snug mb-2 line-clamp-2
                     hover:text-[#c4622d] transition-colors"
        >
          {product.name}
        </Link>

        {/* Star Rating */}
        <div className="flex items-center gap-1 mb-2">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }, (_, i) =>
              i < Math.round(product.rating)
                ? <StarFilled key={i} />
                : <StarEmpty key={i} />
            )}
          </div>
          <span className="text-[0.72rem] text-gray-500">
            {product.rating.toFixed(1)} ({product.reviewCount})
          </span>
        </div>

        {/* Price Row */}
        <div className="flex items-baseline gap-2 flex-wrap mb-1">
          <span className="text-[1rem] font-bold text-gray-900">{formatCurrency(product.price)}</span>
          {product.originalPrice && (
            <span className="text-[0.78rem] text-gray-400 line-through">{formatCurrency(product.originalPrice)}</span>
          )}
          {discount > 0 && (
            <span className="text-[0.72rem] font-bold text-emerald-600">{discount}% off</span>
          )}
        </div>

        {/* Savings + Free Delivery badges */}
        <div className="flex flex-wrap gap-1.5 mb-3 min-h-[18px]">
          {savings > 0 && (
            <span className="text-[0.62rem] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
              Save {formatCurrency(savings)}
            </span>
          )}
          <span className="text-[0.62rem] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded">
            Free Delivery
          </span>
        </div>

        <div className="mt-auto">
          {user?.role === "seller" ? (
            <Link
              to={`/products/${product.slug}`}
              className="w-full block py-2 rounded text-sm font-semibold text-center transition-all duration-150
                          border-2 border-gray-400 text-gray-500 hover:bg-gray-100 hover:text-gray-700 active:scale-[0.98]"
            >
              View Details
            </Link>
          ) : product.source === "amazon" ? (
            <div className="flex flex-col gap-1.5">
              <button
                disabled={!product.inStock}
                aria-label={product.inStock ? `Add ${product.name} to cart` : `${product.name} is out of stock`}
                onClick={() => {
                  cart.addToCart(product);
                  notify(`${product.name} added to cart.`);
                }}
                className={`w-full py-1.5 rounded text-xs font-bold transition-all duration-150 border-2 cursor-pointer
                  ${product.inStock
                    ? "border-[#c4622d] text-[#c4622d] hover:bg-[#c4622d] hover:text-white active:scale-[0.98]"
                    : "opacity-40 cursor-not-allowed text-gray-400 border-gray-300"}`}
              >
                {product.inStock ? "Add to Cart" : "Out of Stock"}
              </button>
              <button
                disabled={!product.inStock}
                onClick={async () => {
                  if (!product.inStock) return;
                  const triggerAction = async (email = null, phone = null) => {
                    try {
                      if (user) {
                        await trackAffiliateClickRequest(product.id);
                      } else if (email) {
                        await trackAffiliateClickRequest(product.id, email, phone);
                      }
                      const targetUrl = getAmazonProductUrl(product);
                      window.open(targetUrl, "_blank", "noopener,noreferrer");
                    } catch (err) {
                      console.error("Action tracking failed:", err);
                      notify(err.message || "Failed to process order.");
                    }
                  };
                  if (user) {
                    await triggerAction();
                    return;
                  }
                  const guestEmail = localStorage.getItem("guestEmail");
                  const guestPhone = localStorage.getItem("guestPhone") || "";
                  if (guestEmail) {
                    await triggerAction(guestEmail, guestPhone);
                    return;
                  }
                  setIsModalOpen(true);
                }}
                className={`w-full py-1.5 rounded text-xs font-bold transition-all duration-150 border cursor-pointer flex items-center justify-center gap-1
                  ${!product.inStock
                    ? "opacity-40 cursor-not-allowed text-gray-400 border-gray-300"
                    : "border-amber-400 bg-amber-400/10 text-amber-900 hover:bg-amber-400 hover:text-gray-950 active:scale-[0.98]"
                  }`}
              >
                <span>Buy on Amazon</span>
                <span className="text-[10px]">↗</span>
              </button>
            </div>
          ) : product.productType === "affiliate" ? (
            <button
              disabled={!product.inStock}
              onClick={async () => {
                if (!product.inStock) return;

                const triggerAction = async (email = null, phone = null) => {
                  try {
                    if (user) {
                      await trackAffiliateClickRequest(product.id);
                    } else if (email) {
                      await trackAffiliateClickRequest(product.id, email, phone);
                    }
                    const targetUrl = getAmazonProductUrl(product);
                    window.open(targetUrl, "_blank", "noopener,noreferrer");
                  } catch (err) {
                    console.error("Action tracking failed:", err);
                    notify(err.message || "Failed to process order.");
                  }
                };

                if (user) {
                  await triggerAction();
                  return;
                }

                const guestEmail = localStorage.getItem("guestEmail");
                const guestPhone = localStorage.getItem("guestPhone") || "";
                if (guestEmail) {
                  await triggerAction(guestEmail, guestPhone);
                  return;
                }

                setIsModalOpen(true);
              }}
              className={`w-full py-2 rounded text-sm font-semibold transition-all duration-150 border-2 cursor-pointer
                          ${!product.inStock
                            ? "opacity-40 cursor-not-allowed text-gray-400 border-gray-300"
                            : "border-indigo-600 bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.98]"
                          }`}
            >
              {!product.inStock
                ? "Out of Stock"
                : product.source === "chrome-extension"
                ? "Install Extension"
                : product.source === "web-app"
                ? "Try Web App"
                : product.source === "play-store"
                ? "Get on Play Store"
                : "Visit Product"}
            </button>
          ) : (
            <button
              disabled={!product.inStock}
              aria-label={product.inStock ? `Add ${product.name} to cart` : `${product.name} is out of stock`}
              onClick={() => {
                cart.addToCart(product);
                notify(`${product.name} added to cart.`);
              }}
              className={`w-full py-2 rounded text-sm font-semibold transition-all duration-150 border-2 cursor-pointer
                          ${product.inStock
                            ? "border-[#c4622d] text-[#c4622d] hover:bg-[#c4622d] hover:text-white active:scale-[0.98]"
                            : "opacity-40 cursor-not-allowed text-gray-400 border-gray-300"}`}
            >
              {product.inStock ? "Add to Cart" : "Out of Stock"}
            </button>
          )}
        </div>
      </div>
      {isModalOpen && (
        <TrackHistoryModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={async ({ email, phone }) => {
            localStorage.setItem("guestEmail", email);
            if (phone) {
              localStorage.setItem("guestPhone", phone);
            }
            setIsModalOpen(false);

            try {
              await trackAffiliateClickRequest(product.id, email, phone);
              if (product.productType === "affiliate") {
                const targetUrl = getAmazonProductUrl(product);
                window.open(targetUrl, "_blank", "noopener,noreferrer");
              } else {
                notify(`🎉 Order processed! Added to your order history.`);
              }
            } catch (err) {
              console.error("Action tracking failed:", err);
              notify(err.message || "Failed to process order.");
            }
          }}
          product={product}
        />
      )}
    </article>
  );
}
