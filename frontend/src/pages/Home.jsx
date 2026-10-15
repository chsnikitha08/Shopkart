import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Home.css";

function BagIcon() {
  return (
    <svg viewBox="0 0 120 120" fill="none" aria-hidden="true">
      <path d="M25 43h70l-6 62H31l-6-62Z" fill="#f47b20" />
      <path d="M43 47V34a17 17 0 0 1 34 0v13" stroke="#a83e28" strokeWidth="7" strokeLinecap="round" />
      <path d="m42 69 12 12 25-26" stroke="white" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Home() {
  const { user } = useAuth();
  const firstName = user?.fullName?.trim().split(/\s+/)[0];

  return (
    <section className="welcome-page">
      <div className="welcome-card">
        <div className="welcome-copy">
          <span className="welcome-eyebrow">YOUR EVERYDAY FINDS, ALL IN ONE PLACE</span>
          <h1>
            Online shopping,
            <br />
            <span>made joyful.</span>
          </h1>
          <p className="welcome-description">
            Discover things you’ll love, find something new, and make your next order feel easy.
          </p>
          {firstName && <p className="welcome-greeting">Welcome back, {firstName}.</p>}
          <div className="welcome-actions">
            <Link className="welcome-button welcome-button-primary" to="/products">
              Start shopping <span aria-hidden="true">→</span>
            </Link>
            <Link className="welcome-button welcome-button-secondary" to="/orders">
              View my orders
            </Link>
          </div>
          <div className="welcome-note">
            <span className="welcome-note-dot" />
            A little something for every day
          </div>
        </div>

        <div className="welcome-art" aria-label="ShopKart shopping illustration">
          <div className="welcome-orbit welcome-orbit-one" />
          <div className="welcome-orbit welcome-orbit-two" />
          <div className="welcome-float-card welcome-float-top">
            <span className="welcome-float-icon">✦</span>
            <span><strong>Good finds</strong><small>picked for you</small></span>
          </div>
          <div className="welcome-storefront">
            <div className="welcome-store-header">
              <span className="welcome-store-logo">Shop<span>Kart</span></span>
              <span className="welcome-store-bag" aria-hidden="true">⌑</span>
            </div>
            <div className="welcome-store-banner">
              <span>YOUR NEXT<br />FAVORITE THING</span>
              <span className="welcome-sun" />
            </div>
            <div className="welcome-store-products" aria-hidden="true">
              <div className="welcome-product-tile"><span className="welcome-product-shape shape-one" /></div>
              <div className="welcome-product-tile"><span className="welcome-product-shape shape-two" /></div>
              <div className="welcome-product-tile"><span className="welcome-product-shape shape-three" /></div>
            </div>
            <div className="welcome-store-footer">
              <span /> <span /> <span />
              <i><BagIcon /></i>
            </div>
          </div>
          <div className="welcome-float-card welcome-float-bottom">
            <span className="welcome-basket-icon" aria-hidden="true">▱</span>
            <span><strong>Happy shopping</strong><small>starts right here</small></span>
          </div>
          <span className="welcome-spark spark-one" aria-hidden="true">✦</span>
          <span className="welcome-spark spark-two" aria-hidden="true">✧</span>
        </div>
      </div>

      <section className="home-customer" aria-labelledby="home-customer-title">
        <div className="home-customer-heading">
          <span className="home-customer-avatar" aria-hidden="true">
            {user?.fullName?.trim()?.charAt(0)?.toUpperCase() || "S"}
          </span>
          <div>
            <p className="home-customer-eyebrow">YOUR SHOPKART ACCOUNT</p>
            <h2 id="home-customer-title">Your details</h2>
          </div>
        </div>
        <dl className="home-customer-details">
          <div>
            <dt>Full name</dt>
            <dd>{user?.fullName || "—"}</dd>
          </div>
          <div>
            <dt>Email address</dt>
            <dd>{user?.email || "—"}</dd>
          </div>
          <div>
            <dt>Phone number</dt>
            <dd>{user?.phone || "—"}</dd>
          </div>
        </dl>
      </section>
    </section>
  );
}
