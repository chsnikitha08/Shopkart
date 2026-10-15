import { useState } from "react";
import { Link } from "react-router-dom";
import { formatPrice, stockLabel } from "../utils/format";

export default function WishlistCard({ product, onRemove }) {
  const [removing, setRemoving] = useState(false);
  const stock = stockLabel(product.stock);

  const handleRemove = async () => {
    setRemoving(true);
    const ok = await onRemove(product._id);
    if (!ok) setRemoving(false);
  };

  return (
    <article className="card product-card">
      <Link to={`/products/${product._id}`} className="product-image-wrap">
        <img src={product.image} alt={product.name} loading="lazy" />
      </Link>
      <div className="card-body">
        <p className="muted small">{product.category}</p>
        <h3 className="product-name">{product.name}</h3>
        <p className="price">{formatPrice(product.price)}</p>
        <p className={`stock stock-${stock.tone}`}>{stock.text}</p>
        <div className="card-actions">
          <Link className="btn btn-outline" to={`/products/${product._id}`}>
            View Details
          </Link>
          <button className="btn btn-outline is-saved" onClick={handleRemove} disabled={removing}>
            {removing ? "Removing..." : "Remove ♥"}
          </button>
        </div>
      </div>
    </article>
  );
}
