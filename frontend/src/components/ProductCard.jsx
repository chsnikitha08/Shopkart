import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { wishlistApi } from "../services/api";
import CartControl from "./CartControl";
import { formatPrice, stockLabel } from "../utils/format";

export default function ProductCard({ product, initiallySaved = false }) {
  const [wish, setWish] = useState(initiallySaved ? "saved" : "idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (initiallySaved) setWish("saved");
  }, [initiallySaved]);

  const stock = stockLabel(product.stock);

  const handleWishlist = async () => {
    if (wish !== "idle") return;
    setWish("saving");
    setMessage("");
    try {
      await wishlistApi.add(product._id);
      setWish("saved");
    } catch (err) {
      if (err.response?.status === 409) {
        setWish("saved");
      } else {
        setWish("idle");
        setMessage("Unable to save product. Please try again.");
      }
    }
  };

  const wishText = { idle: "♡ Add to Wishlist", saving: "⏳ Saving...", saved: "♥ Added to Wishlist" }[wish];

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
          <button
            className={`btn btn-outline ${wish === "saved" ? "is-saved" : ""}`}
            onClick={handleWishlist}
            disabled={wish !== "idle"}
          >
            {wishText}
          </button>
          <CartControl product={product} />
        </div>

        {message && <p className="form-error">{message}</p>}
      </div>
    </article>
  );
}
