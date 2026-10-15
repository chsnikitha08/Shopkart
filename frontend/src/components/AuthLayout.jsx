import { Link, Outlet } from "react-router-dom";
import "./AuthLayout.css";

const IMAGE = "/auth-illustration.jpg";

export default function AuthLayout() {
  return (
    <div className="auth-shell">
      <div className="auth-art">
        <Link to="/login" className="auth-logo">
          Shop<span>Kart</span>
        </Link>
        <img
          className="auth-illustration"
          src={IMAGE}
          alt="A customer shopping online"
        />
      </div>

      <section className="auth-form-side">
        <div className="auth-form-inner">
          <Outlet />
        </div>
        <p className="auth-copy">© 2026 ShopKart</p>
      </section>
    </div>
  );
}
