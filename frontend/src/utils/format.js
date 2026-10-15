export const formatPrice = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

export const stockLabel = (stock) => {
  if (stock <= 0) return { text: "Out of stock", tone: "out" };
  if (stock <= 5) return { text: `Only ${stock} left`, tone: "low" };
  return { text: `${stock} units left`, tone: "ok" };
};

export const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

export const shortId = (id) => String(id).slice(-8).toUpperCase();
