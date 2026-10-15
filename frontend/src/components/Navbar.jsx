import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { totalUnits } = useCart();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isWelcomePage = pathname === "/home";

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className={`navbar${isWelcomePage ? " navbar-welcome" : ""}`}>
      <div className="navbar-inner">
        <Link to={user ? "/home" : "/login"} className="brand">
          Shop<span>Kart</span>
        </Link>

        {user ? (
          <nav className="nav-links" aria-label="Main">
            <NavLink to="/home">Home</NavLink>
            <NavLink to="/products">Products</NavLink>
            <NavLink to="/products/new">Add Product</NavLink>
            <NavLink to="/wishlist">Wishlist</NavLink>
            <NavLink to="/cart" className="cart-link">
              Cart
              <span className="badge" aria-label={`${totalUnits} items in cart`}>
                {totalUnits}
              </span>
            </NavLink>
            <NavLink to="/orders">Orders</NavLink>
            <button className="btn btn-ghost" onClick={handleLogout}>
              Logout
            </button>
          </nav>
        ) : (
          <nav className="nav-links" aria-label="Main">
            <NavLink to="/login">Login</NavLink>
            <NavLink to="/register">Register</NavLink>
          </nav>
        )}
      </div>
    </header>
  );
}
