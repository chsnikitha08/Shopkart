import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { getErrorMessage } from "../services/api";
import { formatPrice } from "../utils/format";

export default function CartItem({ item }) {
  const { pending, updateQuantity, removeFromCart } = useCart();
  const [error, setError] = useState("");
  const { product, quantity } = item;
  const busy = Boolean(pending[product._id]);
  const overStock = quantity > product.stock;

  const run = async (action) => {
    setError("");
    try {
      await action();
    } catch (err) {
      setError(getErrorMessage(err, "Unable to update cart."));
    }
  };

  return (
    <div className="cart-item">
      <Link to={`/products/${product._id}`}>
        <img src={product.image} alt={product.name} />
      </Link>

      <div className="cart-item-info">
        <Link to={`/products/${product._id}`} className="product-name">
          {product.name}
        </Link>
        <p className="muted small">{formatPrice(product.price)} each</p>

        <div className="qty">
          <button
            className="btn btn-outline qty-btn"
            onClick={() => run(() => updateQuantity(product._id, quantity - 1))}
            disabled={busy || quantity <= 1}
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="qty-value">{quantity}</span>
          <button
            className="btn btn-outline qty-btn"
            onClick={() => run(() => updateQuantity(product._id, quantity + 1))}
            disabled={busy || quantity >= product.stock}
            aria-label="Increase quantity"
          >
            +
          </button>
          <button
            className="btn btn-ghost danger"
            onClick={() => run(() => removeFromCart(product._id))}
            disabled={busy}
          >
            {busy ? "Updating..." : "Remove"}
          </button>
        </div>

        {overStock && (
          <p className="form-error">
            Only {product.stock} left in stock. Lower the quantity to check out.
          </p>
        )}
        {error && <p className="form-error">{error}</p>}
      </div>

      <div className="cart-item-total">{formatPrice(product.price * quantity)}</div>
    </div>
  );
}
