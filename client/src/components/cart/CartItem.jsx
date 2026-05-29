import { formatCurrency } from "../../utils/formatCurrency";

export function CartItem({ item, onQuantityChange, onRemove }) {
  const handleDecrement = () => {
    if (item.quantity > 1) onQuantityChange(item.id, item.quantity - 1);
  };

  return (
    <article className="flex gap-4 p-4 bg-white rounded-xl border border-gray-200
                        hover:border-[#c4622d]/30 transition-colors">

      {/* Product Image */}
      <div
        className="w-24 h-24 md:w-28 md:h-28 flex-shrink-0 rounded-lg overflow-hidden
                   flex items-center justify-center text-4xl"
        style={{ background: item.bg || "#f5f0e8" }}
      >
        {item.images?.[0]?.url ? (
          <img className="w-full h-full object-cover" src={item.images[0].url} alt={item.name} />
        ) : (
          item.emoji || "📦"
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <p className="text-[0.68rem] font-semibold uppercase tracking-wider text-[#9b6b3a] mb-0.5">
          {item.category}
        </p>
        <p className="text-sm md:text-[0.95rem] font-semibold text-gray-800 leading-snug mb-1 line-clamp-2">
          {item.name}
        </p>
        <p className={`text-[0.72rem] font-semibold mb-3 ${item.inStock ? "text-emerald-600" : "text-red-500"}`}>
          {item.inStock ? "✓ In Stock" : "Out of Stock"}
        </p>

        {/* Quantity + Remove */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Qty stepper */}
          <div className="flex items-center rounded-lg border border-gray-300 overflow-hidden text-sm">
            <button
              onClick={handleDecrement}
              disabled={item.quantity <= 1}
              className="w-8 h-8 flex items-center justify-center font-bold text-gray-600
                         hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              −
            </button>
            <span className="w-10 text-center font-semibold text-gray-800 text-sm border-x border-gray-300">
              {item.quantity}
            </span>
            <button
              onClick={() => onQuantityChange(item.id, item.quantity + 1)}
              className="w-8 h-8 flex items-center justify-center font-bold text-gray-600
                         hover:bg-gray-100 transition-colors"
            >
              +
            </button>
          </div>

          <span className="text-gray-300 hidden md:block">|</span>

          <button
            onClick={() => onRemove(item.id)}
            className="text-[0.78rem] font-semibold text-red-500 hover:text-red-700
                       hover:underline transition-colors"
          >
            Remove
          </button>
        </div>
      </div>

      {/* Price */}
      <div className="text-right flex flex-col justify-between items-end shrink-0">
        <span className="text-base md:text-lg font-bold text-gray-900">
          {formatCurrency(item.price * item.quantity)}
        </span>
        {item.quantity > 1 && (
          <span className="text-[0.7rem] text-gray-400">
            {formatCurrency(item.price)} each
          </span>
        )}
      </div>
    </article>
  );
}
