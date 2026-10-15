import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi, getErrorMessage } from "../services/api";
import AuthField from "../components/AuthField";

const EMPTY = { fullName: "", email: "", phone: "", password: "" };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validate = (f) => {
  const e = {};
  if (!f.fullName.trim()) e.fullName = "Full name is required.";
  if (!f.email.trim()) e.email = "Email is required.";
  else if (!EMAIL_RE.test(f.email.trim())) e.email = "Enter a valid email.";
  if (!f.phone.trim()) e.phone = "Phone number is required.";
  if (!f.password) e.password = "Password is required.";
  else if (f.password.length < 6) e.password = "Password must be at least 6 characters.";
  return e;
};

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length) return;

    setSubmitting(true);
    try {
      await authApi.register(form);
      navigate("/login", { replace: true, state: { registered: true } });
    } catch (err) {
      setServerError(getErrorMessage(err, "Registration failed. Please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <h1 className="auth-title">Join ShopKart :)</h1>
      <p className="auth-sub">
        Create your account to save products, build your cart and check out faster.
      </p>

      <AuthField
        id="fullName"
        name="fullName"
        label="Full name"
        icon="user"
        value={form.fullName}
        onChange={handleChange}
        error={errors.fullName}
        autoComplete="name"
      />
      <AuthField
        id="email"
        name="email"
        label="Email"
        type="email"
        icon="mail"
        value={form.email}
        onChange={handleChange}
        error={errors.email}
        autoComplete="email"
        valid={EMAIL_RE.test(form.email.trim())}
      />
      <AuthField
        id="phone"
        name="phone"
        label="Phone number"
        type="tel"
        icon="phone"
        value={form.phone}
        onChange={handleChange}
        error={errors.phone}
        autoComplete="tel"
      />
      <AuthField
        id="password"
        name="password"
        label="Password"
        type="password"
        icon="lock"
        value={form.password}
        onChange={handleChange}
        error={errors.password}
        autoComplete="new-password"
      />

      {serverError && <p className="form-error">{serverError}</p>}

      <div className="auth-actions">
        <button className="auth-btn auth-btn-primary" disabled={submitting}>
          {submitting ? "Creating..." : "Create Account"}
        </button>
        <Link to="/login" className="auth-btn auth-btn-secondary">
          Login
        </Link>
      </div>
    </form>
  );
}
