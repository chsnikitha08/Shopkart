import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { productApi, getErrorMessage } from "../services/api";
import CartControl from "../components/CartControl";
import { ErrorState, Loading } from "../components/States";
import { formatPrice, stockLabel } from "../utils/format";

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError("");
    productApi
      .get(id)
      .then((res) => !ignore && setProduct(res.data.product))
      .catch((err) => !ignore && setError(getErrorMessage(err, "Unable to load this product.")))
      .finally(() => !ignore && setLoading(false));
    return () => {
      ignore = true;
    };
  }, [id, reloadKey]);

  if (loading) return <Loading text="Loading product..." />;
  if (error)
    return <ErrorState title="Product unavailable." message={error} onRetry={() => setReloadKey((k) => k + 1)} />;

  const stock = stockLabel(product.stock);

  return (
    <section>
      <Link to="/products" className="back-link">
        ← Back to products
      </Link>

      <div className="details">
        <img className="details-image" src={product.image} alt={product.name} />
        <div className="details-info">
          <p className="muted">{product.category}</p>
          <h1>{product.name}</h1>
          <p className="price price-lg">{formatPrice(product.price)}</p>
          <p className={`stock stock-${stock.tone}`}>{stock.text}</p>
          <p className="details-desc">{product.description}</p>

          <CartControl product={product} compact />
        </div>
      </div>
    </section>
  );
}
