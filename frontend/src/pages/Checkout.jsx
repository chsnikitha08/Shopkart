import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { orderApi, getErrorMessage } from "../services/api";
import { loadRazorpayScript } from "../services/razorpay";
import OrderSummary from "../components/OrderSummary";
import { EmptyState, Loading } from "../components/States";

const FIELDS = [
  ["fullName", "Full name", "name"],
  ["phone", "Phone number", "tel"],
  ["addressLine1", "Address", "street-address"],
  ["city", "City", "address-level2"],
  ["state", "State", "address-level1"],
  ["pincode", "Pincode", "postal-code"],
];

const validate = (f) => {
  const e = {};
  FIELDS.forEach(([key, label]) => {
    if (!f[key].trim()) e[key] = `${label} is required.`;
  });
  if (!e.phone && !/^\+?\d{10,13}$/.test(f.phone.replace(/[\s-]/g, ""))) {
    e.phone = "Enter a valid phone number (10 to 13 digits).";
  }
  if (!e.pincode && !/^\d{6}$/.test(f.pincode.trim())) {
    e.pincode = "Pincode must contain 6 digits.";
  }
  return e;
};

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, loading, totalUnits, subtotal, clearCartState } = useCart();
  const paidRef = useRef(false);

  const [form, setForm] = useState({
    fullName: user?.fullName || "",
    phone: user?.phone || "",
    addressLine1: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [paying, setPaying] = useState(false);

  if (loading && items.length === 0) return <Loading text="Loading your cart..." />;

  if (items.length === 0 && !paidRef.current) {
    return (
      <EmptyState
        icon="🛒"
        title="Your cart is empty"
        text="Add something to your cart before checking out."
        to="/products"
        cta="Browse Products"
      />
    );
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handlePay = async (e) => {
    e.preventDefault();
    setServerError("");

    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length) return;

    setPaying(true);

    let data;
    try {
      const res = await orderApi.createPaymentOrder(form);
      data = res.data;
    } catch (err) {
      setServerError(getErrorMessage(err, "Unable to start payment. Please try again."));
      setPaying(false);
      return;
    }

    const loaded = await loadRazorpayScript();
    if (!loaded || !window.Razorpay) {
      setServerError("Unable to load Razorpay. Check your connection and try again.");
      setPaying(false);
      return;
    }

    const rzp = new window.Razorpay({
      key: data.key,
      amount: data.amount,
      currency: data.currency,
      name: "ShopKart",
      description: "ShopKart Order",
      order_id: data.razorpayOrderId,

      handler: async (response) => {
        try {
          const res = await orderApi.verifyPayment({
            shopKartOrderId: data.shopKartOrderId,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
          paidRef.current = true;
          clearCartState();
          navigate(`/order-success/${res.data.order._id}`, { replace: true });
        } catch (err) {
          setServerError(
            `${getErrorMessage(err, "Payment could not be verified.")} Your cart has not been cleared.`
          );
          setPaying(false);
        }
      },

      prefill: { name: form.fullName, contact: form.phone },
      theme: { color: "#e8541f" },

      modal: {
        ondismiss: () => {
          if (paidRef.current) return;
          setPaying(false);
          setServerError("Payment was cancelled. Your cart has not been cleared.");
        },
      },
    });

    rzp.on("payment.failed", () => {
      orderApi.paymentFailed(data.shopKartOrderId).catch(() => {});
      setServerError("Payment failed. Your cart has not been cleared. Please try again.");
      setPaying(false);
    });

    rzp.open();
  };

  return (
    <section>
      <div className="page-head">
        <h1>Checkout</h1>
      </div>

      <div className="two-col">
        <form className="card" onSubmit={handlePay} noValidate>
          <h2>Shipping Details</h2>

          {FIELDS.map(([key, label, autoComplete]) => (
            <div className="field" key={key}>
              <label htmlFor={key}>{label}</label>
              <input
                id={key}
                name={key}
                className={`input ${errors[key] ? "input-error" : ""}`}
                value={form[key]}
                onChange={handleChange}
                autoComplete={autoComplete}
                disabled={paying}
              />
              {errors[key] && <p className="form-error">{errors[key]}</p>}
            </div>
          ))}

          {serverError && <p className="form-error">{serverError}</p>}

          <button className="btn btn-primary btn-block" disabled={paying}>
            {paying ? "Processing..." : "Place Order"}
          </button>
          <p className="muted small center">
            Payments run in Razorpay Test Mode. No real money is charged.
          </p>
        </form>

        <OrderSummary items={items} totalUnits={totalUnits} subtotal={subtotal} />
      </div>
    </section>
  );
}
