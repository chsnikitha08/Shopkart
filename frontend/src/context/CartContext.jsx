import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { cartApi, getErrorMessage } from "../services/api";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState({});

  const refreshCart = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await cartApi.get();
      setItems(data.cart);
    } catch (err) {
      setError(getErrorMessage(err, "Unable to load your cart."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      refreshCart();
    } else {
      setItems([]);
      setError("");
    }
  }, [user, refreshCart]);

  const mutate = async (productId, request) => {
    setPending((p) => ({ ...p, [productId]: true }));
    try {
      const { data } = await request();
      setItems(data.cart);
    } finally {
      setPending((p) => {
        const next = { ...p };
        delete next[productId];
        return next;
      });
    }
  };

  const addToCart = (id) => mutate(id, () => cartApi.add(id));
  const updateQuantity = (id, quantity) => mutate(id, () => cartApi.update(id, quantity));
  const removeFromCart = (id) => mutate(id, () => cartApi.remove(id));
  const clearCartState = () => setItems([]);

  const totalUnits = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);
  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
    [items]
  );

  const value = {
    items,
    loading,
    error,
    pending,
    totalUnits,
    subtotal,
    refreshCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCartState,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
