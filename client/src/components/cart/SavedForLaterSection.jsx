import { Link } from "react-router-dom";
import { formatCurrency } from "../../utils/formatCurrency";

export function SavedForLaterSection({
  items = [],
  onMoveToCart,
  onRemove,
  onClearAll,
  onAddToWishlist,
}) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <section className="bg-white rounded-2xl border border-gray-200 p-4 md:p-6 shadow-xs mt-6 transition-all">
      {/* ── Section Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200 pb-3 mb-4">
        <div>
          <h2 className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
            <span>Saved for later</span>
            <span className="text-sm font-normal text-gray-500">
              ({items.length} {items.length === 1 ? "item" : "items"})
            </span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Items saved from your cart to purchase at a later time.
          </p>
        </div>

        {items.length > 1 && onClearAll && (
          <button
            type="button"
            onClick={onClearAll}
            className="text-xs font-semibold text-gray-400 hover:text-red-600 transition-colors cursor-pointer self-start sm:self-auto"
          >
            Clear all saved items
          </button>
        )}
      </div>

      {/* ── Items List ── */}
      <div className="divide-y divide-gray-150">
        {items.map((item) => {
          const productLink = item.slug ? `/product/${item.slug}` : `/product/${item.id}`;
          const itemImage = item.images?.[0]?.url || item.imageUrl;

          return (
            <article
              key={`${item.id}-${item.variantName || "default"}`}
              className="py-4 first:pt-1 last:pb-1 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
            >
              {/* Product Info Left */}
              <div className="flex items-start gap-3.5 min-w-0 flex-1">
                {/* Thumbnail */}
                <Link
                  to={productLink}
                  className="w-20 h-20 md:w-24 md:h-24 shrink-0 rounded-lg overflow-hidden border border-gray-200 bg-[#f5f0e8] flex items-center justify-center hover:opacity-90 transition-opacity"
                >
                  {itemImage ? (
                    <img
                      src={itemImage}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <span className="text-2xl">📦</span>
                  )}
                </Link>

                {/* Text details */}
                <div className="min-w-0 flex-1">
                  {item.category && (
                    <span className="text-[0.65rem] font-bold uppercase tracking-wider text-[#9b6b3a] block mb-0.5">
                      {item.category}
                    </span>
                  )}
                  <Link
                    to={productLink}
                    className="text-sm font-semibold text-gray-800 hover:text-[#c4622d] leading-snug line-clamp-2 transition-colors block mb-1"
                  >
                    {item.name}
                  </Link>

                  {item.variantName && (
                    <div className="mb-1.5">
                      <span className="inline-block bg-[#c4622d]/10 text-[#c4622d] border border-[#c4622d]/20 rounded-full px-2 py-0.5 text-[0.65rem] font-bold">
                        Option: {item.variantName}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    <span
                      className={`font-semibold text-[0.72rem] ${
                        item.inStock !== false ? "text-emerald-600" : "text-red-500"
                      }`}
                    >
                      {item.inStock !== false ? "✓ In Stock" : "Temporarily Out of Stock"}
                    </span>
                  </div>

                  {/* Actions Row */}
                  <div className="flex items-center gap-3 mt-3 flex-wrap">
                    <button
                      type="button"
                      onClick={() => onMoveToCart(item.id, item.variantName)}
                      className="bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-bold text-xs py-1.5 px-3.5 rounded-lg shadow-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                    >
                      <span>🛒</span>
                      <span>Move to cart</span>
                    </button>

                    <span className="text-gray-300">|</span>

                    <button
                      type="button"
                      onClick={() => onRemove(item.id, item.variantName)}
                      className="text-xs font-semibold text-red-500 hover:text-red-700 hover:underline transition-colors cursor-pointer"
                    >
                      Delete
                    </button>

                    {onAddToWishlist && (
                      <>
                        <span className="text-gray-300">|</span>
                        <button
                          type="button"
                          onClick={() => onAddToWishlist(item.id)}
                          className="text-xs font-semibold text-[#007185] hover:text-[#c4622d] hover:underline transition-colors cursor-pointer"
                        >
                          Add to Wishlist
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Price Right */}
              <div className="sm:text-right shrink-0 self-start sm:self-center pl-2">
                <span className="text-base md:text-lg font-bold text-gray-900 block">
                  {formatCurrency(item.price)}
                </span>
                {item.originalPrice && item.originalPrice > item.price && (
                  <div className="text-[0.72rem] text-gray-400">
                    <span className="line-through">{formatCurrency(item.originalPrice)}</span>
                    <span className="text-emerald-600 font-semibold ml-1">
                      {Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% off
                    </span>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
