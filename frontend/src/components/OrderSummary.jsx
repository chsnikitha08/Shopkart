import { formatPrice } from "../utils/format";

export default function OrderSummary({ items, totalUnits, subtotal, children }) {
  return (
    <aside className="card summary">
      <h2>Order Summary</h2>
      <ul className="summary-lines">
        {items.map(({ product, quantity }) => (
          <li key={product._id}>
            <span>
              {product.name} × {quantity}
            </span>
            <span>{formatPrice(product.price * quantity)}</span>
          </li>
        ))}
      </ul>
      <div className="summary-row">
        <span>Items</span>
        <span>{totalUnits}</span>
      </div>
      <div className="summary-row summary-total">
        <span>Total</span>
        <span>{formatPrice(subtotal)}</span>
      </div>
      {children}
    </aside>
  );
}
