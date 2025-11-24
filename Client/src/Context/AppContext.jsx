// src/context/AppContext.jsx
import {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../lib/apiConfig";
import { io } from "socket.io-client";
import toast from "react-hot-toast";

export const AppContext = createContext();

/* ---------------- SOCKET INITIALIZATION ---------------- */
const socket = io(
  import.meta.env.VITE_SOCKET_URL||
    "http://localhost:3000",
  {
    withCredentials: true,
  }
);

export const AppContextProvider = ({ children }) => {
  const navigate = useNavigate();

  /* ---------------- STATES ---------------- */
  const [notifications, setNotifications] = useState([]);
  const [user, setUser] = useState(null);
  const [isShopkeeper, setIsShopkeeper] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [shopkeepers, setShopkeepers] = useState([]);
  const [shopkeeperProducts, setShopkeeperProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([
    { id: 1, name: "Fruits" },
    { id: 2, name: "Vegetables" },
    { id: 3, name: "Dairy" },
    { id: 4, name: "Drinks" },
  ]);

  const currency = import.meta.env.VITE_CURRENCY || "₹";

  /* ---------------- LOAD USER ON APP START ---------------- */
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedRole = localStorage.getItem("role");

    if (storedUser) setUser(JSON.parse(storedUser));
    if (storedRole) setIsShopkeeper(storedRole === "shopkeeper");

    setInitialized(true);
  }, []);

  /* ---------------- SOCKET NOTIFICATIONS ---------------- */
  useEffect(() => {
    if (!user?._id) return;

    console.log("⚡ Joining room:", user._id);
    socket.emit("join", user._id);

    socket.on("notification", (payload) => {
      console.log("🔔 New Notification:", payload);
      setNotifications((prev) => [payload, ...prev]);
      toast(`${payload.title}: ${payload.message}`);
    });

    return () => socket.off("notification");
  }, [user]);

  /* ---------------- NOTIFICATION FUNCTIONS ---------------- */

  // Get all notifications from server
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await API.get("/notifications");
      if (res.data?.notifications) {
        setNotifications(res.data.notifications);
      }
    } catch (err) {
      console.error("Fetch notifications failed:", err);
    }
  }, []);

  // Mark notification as read
  const markNotificationRead = useCallback(async (id) => {
    try {
      await API.put(`/notifications/${id}/read`);

      setNotifications((prev) =>
        prev.map((n) =>
          n._id === id || n.id === id ? { ...n, isRead: true } : n
        )
      );
    } catch (err) {
      console.error("Mark read failed:", err);
    }
  }, []);

  /* ---------------- AUTH FUNCTIONS ---------------- */
  const login = useCallback(async (email, password) => {
    try {
      const base =
        import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

      const res = await fetch(`${base}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.user.role);

      setUser(data.user);
      setIsShopkeeper(data.user.role === "shopkeeper");

      navigate(data.user.role === "shopkeeper" ? "/shopkeeper" : "/");
    } catch (err) {
      alert(err.message);
    }
  }, []);

  const signup = useCallback(async (username, email, password, role) => {
    try {
      const base =
        import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

      const res = await fetch(`${base}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password, role }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      alert("Signup successful!");
      navigate("/login");
    } catch (err) {
      alert(err.message);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.clear();
    setUser(null);
    setIsShopkeeper(false);
    setCart([]);
    navigate("/login");
  }, []);

  /* ---------------- FETCH PRODUCTS ---------------- */
  const fetchProducts = useCallback(async () => {
    try {
      const base =
        import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

      const res = await fetch(`${base}/products`);
      setProducts(await res.json());
    } catch (err) {
      console.error("Failed to fetch products:", err);
    }
  }, []);

  useEffect(() => {
    if (initialized) fetchProducts();
  }, [initialized, fetchProducts]);

  /* ---------------- CART FUNCTIONS ---------------- */
  const fetchCart = useCallback(async () => {
    try {
      const res = await API.get("/cart");
      setCart(res.data || []);
    } catch (err) {
      console.error("Fetch cart failed:", err);
    }
  }, []);

  useEffect(() => {
    if (localStorage.getItem("token") && user?.role === "user") {
      fetchCart();
    }
  }, [user, fetchCart]);

  const addToCart = useCallback(
    async (product) => {
      try {
        await API.post("/cart/add", {
          productId: product._id,
          quantity: 1,
        });
        fetchCart();
      } catch (err) {
        console.error("Add to cart failed:", err);
      }
    },
    [fetchCart]
  );

  const updateCartQuantity = useCallback(
    async (productId, quantity) => {
      try {
        await API.post("/cart/add", { productId, quantity });
        fetchCart();
      } catch (err) {
        console.error("Update quantity failed:", err);
      }
    },
    [fetchCart]
  );

  const removeFromCart = useCallback(
    async (cartItemId) => {
      try {
        await API.delete(`/cart/${cartItemId}`);
        fetchCart();
      } catch (err) {
        console.error("Remove failed:", err);
      }
    },
    [fetchCart]
  );

  const clearCart = useCallback(async () => {
    try {
      await API.delete("/cart");
      fetchCart();
    } catch (err) {
      console.error("Clear cart failed:", err);
    }
  }, [fetchCart]);


 const fetchNearbyShopkeepers = useCallback(async (lat, lng, radiusKm = 2) => {
  try {
    const res = await API.get(
      `/shopkeepers/near?lat=${lat}&lng=${lng}&radiusKm=${radiusKm}`
    );

    if (res.data?.shopkeepers) {
      setShopkeepers(res.data.shopkeepers);
    }

    return res.data?.shopkeepers || [];
  } catch (err) {
    console.error("Nearby shopkeepers fetch error:", err);
    return [];
  }
}, []);




  /* ---------------- CONTEXT VALUE ---------------- */
  const value = useMemo(
    () => ({
      navigate,
      initialized,
      user,
      setUser,
      isShopkeeper,
      setIsShopkeeper,
      shopkeepers,
      setShopkeepers,

      login,
      signup,
      logout,

      cart,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,

      searchQuery,
      setSearchQuery,

      products,
      fetchProducts,

      categories,
      setCategories,

      currency,
      shopkeeperProducts,
      setShopkeeperProducts,

      // NOTIFICATIONS
      notifications,
      setNotifications,
      fetchNotifications,
      markNotificationRead,

      fetchNearbyShopkeepers,
    }),
    [
      initialized,
      user,
      isShopkeeper,
      shopkeepers,
      cart,
      products,
      searchQuery,
      categories,
      shopkeeperProducts,
      notifications,
    ]
  );

  return (
    <AppContext.Provider value={value}>{children}</AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
