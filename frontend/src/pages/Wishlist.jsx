import { useCallback, useEffect, useState } from "react";
import { wishlistApi, getErrorMessage } from "../services/api";
import WishlistCard from "../components/WishlistCard";
import { EmptyState, ErrorState, Loading } from "../components/States";

export default function Wishlist() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [removeError, setRemoveError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const { data } = await wishlistApi.list();
      setProducts(data.wishlist);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleRemove = async (productId) => {
    setRemoveError("");
    try {
      await wishlistApi.remove(productId);
      setProducts((list) => list.filter((p) => p._id !== productId));
      return true;
    } catch (err) {
      setRemoveError(getErrorMessage(err, "Unable to remove this product."));
      return false;
    }
  };

  if (loading) return <Loading text="Loading your wishlist..." />;
  if (error)
    return (
      <ErrorState
        title="Something went wrong."
        message="We couldn't load your wishlist."
        onRetry={load}
      />
    );

  return (
    <section>
      <div className="page-head">
        <h1>My Wishlist</h1>
        {products.length > 0 && (
          <p className="muted">
            {products.length} {products.length === 1 ? "product" : "products"} saved
          </p>
        )}
      </div>

      {removeError && <p className="form-error">{removeError}</p>}

      {products.length === 0 ? (
        <EmptyState
          icon="❤️"
          title="Your wishlist is empty"
          text="Save products you love and find them here later."
          to="/products"
          cta="Browse Products"
        />
      ) : (
        <div className="grid">
          {products.map((p) => (
            <WishlistCard key={p._id} product={p} onRemove={handleRemove} />
          ))}
        </div>
      )}
    </section>
  );
}
