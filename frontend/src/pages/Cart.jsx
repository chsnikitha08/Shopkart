import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import CartItem from "../components/CartItem";
import OrderSummary from "../components/OrderSummary";
import { EmptyState, ErrorState, Loading } from "../components/States";

export default function Cart() {
  const { items, loading, error, totalUnits, subtotal, refreshCart } = useCart();
  const navigate = useNavigate();

  if (loading && items.length === 0) return <Loading text="Loading your cart..." />;
  if (error)
    return <ErrorState title="Unable to load your cart." onRetry={refreshCart} />;

  if (items.length === 0) {
    return (
      <EmptyState
        icon="🛒"
        title="Your cart is empty"
        text="Looks like you haven't added anything yet."
        to="/products"
        cta="Browse Products"
      />
    );
  }

  const hasStockIssue = items.some((i) => i.quantity > i.product.stock);

  return (
    <section>
      <div className="page-head">
        <h1>My Cart</h1>
      </div>

      <div className="two-col">
        <div className="card cart-list">
          {items.map((item) => (
            <CartItem key={item.product._id} item={item} />
          ))}
        </div>

        <OrderSummary items={items} totalUnits={totalUnits} subtotal={subtotal}>
          <button
            className="btn btn-primary btn-block"
            onClick={() => navigate("/checkout")}
            disabled={hasStockIssue}
          >
            Proceed to Checkout
          </button>
          <Link to="/products" className="muted small center block">
            Continue shopping
          </Link>
        </OrderSummary>
      </div>
    </section>
  );
}
