import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getErrorMessage, productApi } from "../services/api";

const EMPTY_FORM = {
  name: "",
  description: "",
  price: "",
  category: "",
  image: "",
  stock: "",
};

export default function ProductCreate() {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (Object.values(form).some((value) => !value.trim())) {
      setError("Please fill in every field.");
      return;
    }
    if (!Number.isFinite(Number(form.price)) || Number(form.price) <= 0) {
      setError("Price must be greater than zero.");
      return;
    }
    if (!Number.isInteger(Number(form.stock)) || Number(form.stock) < 0) {
      setError("Stock must be a whole number, zero or more.");
      return;
    }

    setSaving(true);
    try {
      await productApi.create({ ...form, price: Number(form.price), stock: Number(form.stock) });
      navigate("/products", { replace: true, state: { productCreated: true } });
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to add this product. Please try again."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <section>
      <Link to="/products" className="back-link">← Back to products</Link>
      <div className="page-head">
        <h1>Add a product</h1>
        <p className="muted">New products are added to the shared ShopKart catalogue.</p>
      </div>

      <form className="card product-form" onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="name">Product name</label>
          <input className="input" id="name" name="name" value={form.name} onChange={handleChange} required />
        </div>
        <div className="field">
          <label htmlFor="description">Description</label>
          <textarea className="input" id="description" name="description" rows="4" value={form.description} onChange={handleChange} required />
        </div>
        <div className="product-form-row">
          <div className="field">
            <label htmlFor="price">Price (₹)</label>
            <input className="input" id="price" name="price" type="number" min="0.01" step="0.01" value={form.price} onChange={handleChange} required />
          </div>
          <div className="field">
            <label htmlFor="stock">Stock</label>
            <input className="input" id="stock" name="stock" type="number" min="0" step="1" value={form.stock} onChange={handleChange} required />
          </div>
        </div>
        <div className="field">
          <label htmlFor="category">Category</label>
          <input className="input" id="category" name="category" value={form.category} onChange={handleChange} placeholder="For example, Electronics" required />
        </div>
        <div className="field">
          <label htmlFor="image">Image URL</label>
          <input className="input" id="image" name="image" type="url" value={form.image} onChange={handleChange} placeholder="https://example.com/product.jpg" required />
        </div>

        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="btn btn-primary" disabled={saving}>
          {saving ? "Adding product..." : "Add product"}
        </button>
      </form>
    </section>
  );
}
