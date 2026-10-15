import { Link } from "react-router-dom";
import { formatDate, formatPrice, shortId } from "../utils/format";

export default function OrderCard({ order }) {
  return (
    <article className="card order-card">
      <div className="order-head">
        <div>
          <h3>Order #{shortId(order._id)}</h3>
          <p className="muted small">{formatDate(order.createdAt)}</p>
        </div>
        <span className={`status status-${order.status.toLowerCase()}`}>{order.status}</span>
      </div>

      <ul className="order-items">
        {order.items.map((i) => (
          <li key={i.product}>
            {i.name} × {i.quantity}
          </li>
        ))}
      </ul>

      <div className="order-foot">
        <strong>Total: {formatPrice(order.totalAmount)}</strong>
        <Link className="btn btn-outline" to={`/orders/${order._id}`}>
          View Details
        </Link>
      </div>
    </article>
  );
}
