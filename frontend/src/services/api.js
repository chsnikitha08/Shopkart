import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  withCredentials: true,
});

export const getErrorMessage = (err, fallback = "Something went wrong.") =>
  err?.response?.data?.message || fallback;

export const authApi = {
  register: (data) => api.post("/customers/register", data),
  login: (data) => api.post("/customers/login", data),
  me: () => api.get("/customers/me"),
  logout: () => api.post("/customers/logout"),
};

export const productApi = {
  list: (params) => api.get("/products", { params }),
  get: (id) => api.get(`/products/${id}`),
  create: (data) => api.post("/products", data),
};

export const wishlistApi = {
  list: () => api.get("/wishlist"),
  add: (id) => api.post(`/wishlist/${id}`),
  remove: (id) => api.delete(`/wishlist/${id}`),
};

export const cartApi = {
  get: () => api.get("/cart"),
  add: (id) => api.post(`/cart/${id}`),
  update: (id, quantity) => api.patch(`/cart/${id}`, { quantity }),
  remove: (id) => api.delete(`/cart/${id}`),
};

export const orderApi = {
  createPaymentOrder: (shippingAddress) =>
    api.post("/orders/create-payment-order", { shippingAddress }),
  verifyPayment: (payload) => api.post("/orders/verify-payment", payload),
  paymentFailed: (shopKartOrderId) => api.post("/orders/payment-failed", { shopKartOrderId }),
  list: () => api.get("/orders"),
  get: (id) => api.get(`/orders/${id}`),
};

export default api;
