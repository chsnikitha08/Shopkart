import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { orderApi } from "../services/api";
import { ErrorState, Loading } from "../components/States";
import { formatPrice } from "../utils/format";
import "./OrderSuccess.css";

export default function OrderSuccess() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    orderApi
      .get(id)
      .then((res) => setOrder(res.data.order))
      .catch(() => setError(true));
  }, [id]);

  if (error) return <ErrorState title="We couldn't load this order." />;
  if (!order) return <Loading text="Confirming your order..." />;

  return (
    <section className="order-success-page">
      <div className="order-success-card">
        <div className="order-success-icon" aria-hidden="true">
          <svg viewBox="0 0 48 48" fill="none">
            <path d="m13 24 7 7 15-16" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="order-success-eyebrow">PAYMENT CONFIRMED</p>
        <h1>Order placed <span>successfully!</span></h1>
        <p className="order-success-copy">Thanks for shopping with ShopKart. Your order is confirmed and saved.</p>

        <div className="order-receipt">
          <div className="receipt-row receipt-reference">
            <span>Order reference</span>
            <strong className="mono">{order._id}</strong>
          </div>
          <div className="receipt-row">
            <span>Total paid</span>
            <strong>{formatPrice(order.totalAmount)}</strong>
          </div>
          <div className="receipt-row">
            <span>Order status</span>
            <span className={`status status-${order.status.toLowerCase()}`}>{order.status}</span>
          </div>
        </div>

        <div className="order-success-actions">
          <Link className="btn btn-primary" to="/orders">
            View My Orders <span aria-hidden="true">→</span>
          </Link>
          <Link className="btn btn-outline" to="/products">
            Continue Shopping
          </Link>
        </div>
      </div>
    </section>
  );
}
