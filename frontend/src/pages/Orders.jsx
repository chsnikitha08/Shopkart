import { useCallback, useEffect, useState } from "react";
import { orderApi } from "../services/api";
import OrderCard from "../components/OrderCard";
import { EmptyState, ErrorState, Loading } from "../components/States";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const { data } = await orderApi.list();
      setOrders(data.orders);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <Loading text="Loading your orders..." />;
  if (error) return <ErrorState title="Unable to load your orders." onRetry={load} />;

  return (
    <section>
      <div className="page-head">
        <h1>My Orders</h1>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          icon="📦"
          title="You have not placed any orders yet."
          to="/products"
          cta="Start Shopping"
        />
      ) : (
        <div className="stack">
          {orders.map((o) => (
            <OrderCard key={o._id} order={o} />
          ))}
        </div>
      )}
    </section>
  );
}
