import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthField from "../components/AuthField";
import { getErrorMessage } from "../services/api";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/home" replace />;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(form);
      navigate("/home", { replace: true });
    } catch (err) {
      if (err.authStage === "session") {
        setError("Your password was accepted, but we couldn't confirm your session. Please reload and try again.");
      } else if (err.response?.status === 401) {
        setError("Invalid Credentials");
      } else {
        setError(getErrorMessage(err, "Unable to log in right now. Please try again."));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1 className="auth-title">Welcome Back :)</h1>
      <p className="auth-sub">
        To keep connected with us please log in with your email address and password.
      </p>

      {location.state?.registered && <p className="auth-notice">Account created. Please log in.</p>}

      <AuthField
        id="email"
        name="email"
        label="Email"
        type="email"
        icon="mail"
        value={form.email}
        onChange={handleChange}
        autoComplete="email"
        valid={EMAIL_RE.test(form.email.trim())}
        required
      />
      <AuthField
        id="password"
        name="password"
        label="Password"
        type="password"
        icon="lock"
        value={form.password}
        onChange={handleChange}
        autoComplete="current-password"
        required
      />

      {error && <p className="form-error">{error}</p>}

      <div className="auth-actions">
        <button className="auth-btn auth-btn-primary" disabled={submitting}>
          {submitting ? "Logging in..." : "Login"}
        </button>
        <Link to="/register" className="auth-btn auth-btn-secondary">
          Join
        </Link>
      </div>
    </form>
  );
}
