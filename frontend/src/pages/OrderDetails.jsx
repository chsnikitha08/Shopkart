import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { orderApi } from "../services/api";
import { ErrorState, Loading } from "../components/States";
import { formatDate, formatPrice, shortId } from "../utils/format";

export default function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    orderApi
      .get(id)
      .then((res) => setOrder(res.data.order))
      .catch(() => setError(true));
  }, [id]);

  if (error) return <ErrorState title="Order not found." message="It may not exist or may belong to another account." />;
  if (!order) return <Loading text="Loading order..." />;

  const a = order.shippingAddress;

  return (
    <section>
      <Link to="/orders" className="back-link">
        ← Back to orders
      </Link>

      <div className="page-head">
        <h1>Order #{shortId(order._id)}</h1>
        <p className="muted">
          Placed on {formatDate(order.createdAt)} ·{" "}
          <span className={`status status-${order.status.toLowerCase()}`}>{order.status}</span>
        </p>
      </div>

      <div className="two-col">
        <div className="card">
          <h2>Items</h2>
          <ul className="summary-lines">
            {order.items.map((i) => (
              <li key={i.product}>
                <span className="order-line">
                  {i.image && <img src={i.image} alt="" />}
                  <span>
                    {i.name} × {i.quantity}
                    <span className="muted small block">{formatPrice(i.price)} each</span>
                  </span>
                </span>
                <span>{formatPrice(i.price * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="summary-row summary-total">
            <span>Total</span>
            <span>{formatPrice(order.totalAmount)}</span>
          </div>
        </div>

        <aside className="card">
          <h2>Delivery</h2>
          <p>
            {a.fullName}
            <br />
            {a.addressLine1}
            <br />
            {a.city}, {a.state} {a.pincode}
            <br />
            {a.phone}
          </p>
          <h2>Payment</h2>
          <p>
            {order.paymentStatus}
            {order.razorpayPaymentId && (
              <span className="muted small block mono">{order.razorpayPaymentId}</span>
            )}
          </p>
        </aside>
      </div>
    </section>
  );
}
