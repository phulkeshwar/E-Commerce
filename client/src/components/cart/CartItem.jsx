import { formatCurrency } from "../../utils/formatCurrency";

export function CartItem({ item, onQuantityChange, onRemove }) {
  const handleDecrement = () => {
    if (item.quantity > 1) {
      onQuantityChange(item.id, item.quantity - 1);
    }
  };

  return (
    <article className="citem">
      <div className="citem-img" style={{ background: item.bg || "#f5f0e8" }}>
        {item.images?.[0]?.url ? (
          <img className="citem-photo" src={item.images[0].url} alt={item.name} />
        ) : (
          item.emoji || "📦"
        )}
      </div>
      <div>
        <div className="citem-name">{item.name}</div>
        <div className="citem-cat">{item.category}</div>
        <div className="citem-stock">{item.inStock ? "✅ In Stock" : "❌ Out of Stock"}</div>
        <div className="citem-actions">
          <div className="cqty">
            <button onClick={handleDecrement} disabled={item.quantity <= 1}>−</button>
            <span>{item.quantity}</span>
            <button onClick={() => onQuantityChange(item.id, item.quantity + 1)}>+</button>
          </div>
          <button className="rm-btn" onClick={() => onRemove(item.id)}>
            Delete
          </button>
        </div>
      </div>
      <div className="citem-total">{formatCurrency(item.price * item.quantity)}</div>
    </article>
  );
}
