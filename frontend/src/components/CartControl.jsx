import { useState } from "react";
import { useCart } from "../context/CartContext";
import { getErrorMessage } from "../services/api";
import "./CartControl.css";

export default function CartControl({ product, compact = false }) {
  const { items, pending, addToCart, updateQuantity, removeFromCart } = useCart();
  const [error, setError] = useState("");

  const id = product._id;
  const qty = items.find((i) => i.product._id === id)?.quantity || 0;
  const busy = Boolean(pending[id]);
  const atMax = qty >= product.stock;
  const wrapperClass = `cart-control${compact ? " compact" : ""}`;

  const run = async (action) => {
    setError("");
    try {
      await action();
    } catch (err) {
      setError(getErrorMessage(err, "Unable to update your cart."));
    }
  };

  if (product.stock <= 0) {
    return (
      <div className={wrapperClass}>
        <button className="btn btn-primary" disabled>
          Out of stock
        </button>
      </div>
    );
  }

  return (
    <div className={wrapperClass}>
      {qty === 0 ? (
        <button className="btn btn-primary" onClick={() => run(() => addToCart(id))} disabled={busy}>
          {busy ? "Adding..." : "Add to Cart"}
        </button>
      ) : (
        <div className="cart-stepper" role="group" aria-label="Cart quantity">
          <button
            className="step"
            onClick={() =>
              run(() => (qty === 1 ? removeFromCart(id) : updateQuantity(id, qty - 1)))
            }
            disabled={busy}
            aria-label={qty === 1 ? "Remove from cart" : "Decrease quantity"}
            title={qty === 1 ? "Remove from cart" : "Decrease quantity"}
          >
            −
          </button>
          <span className="count" aria-live="polite">
            {qty}
          </span>
          <button
            className="step"
            onClick={() => run(() => updateQuantity(id, qty + 1))}
            disabled={busy || atMax}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      )}

      {qty > 0 && atMax && <p className="hint">Maximum available is in your cart</p>}
      {error && <p className="form-error">{error}</p>}
    </div>
  );
}
