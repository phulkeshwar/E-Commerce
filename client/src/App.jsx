import { useEffect, useMemo, useState, lazy, Suspense, useCallback, useRef } from "react";
import {
  BrowserRouter,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { Footer } from "./components/layout/Footer";
import { Navbar } from "./components/layout/Navbar";
import { PageTransition } from "./components/layout/PageTransition";
import { Toast } from "./components/ui/Toast";
import { ConfirmationModal } from "./components/ui/ConfirmationModal";
import { AppContext } from "./context/AppContext";
import { useAuth } from "./hooks/useAuth";
import { useCart } from "./hooks/useCart";
import { useOrders } from "./hooks/useOrders";
import { getStoredWishlist, setStoredWishlist } from "./store/wishlistStore";
import { getWishlistRequest, toggleWishlistRequest } from "./api/wishlist.api";
import { getCategoriesRequest } from "./api/category.api";
import { CookieBanner } from "./components/ui/CookieBanner";
import { ChatbotWidget } from "./components/ui/ChatbotWidget";
import { scrollToTop } from "./utils/scrollToTop";

// Lazy loaded page components for optimal initial bundle sizes and fast page loads
const AccountPage = lazy(() => import("./pages/AccountPage").then(m => ({ default: m.AccountPage })));
const AdminPage = lazy(() => import("./pages/AdminPage").then(m => ({ default: m.AdminPage })));
const SellerPage = lazy(() => import("./pages/SellerPage").then(m => ({ default: m.SellerPage })));
const AuthPage = lazy(() => import("./pages/AuthPage").then(m => ({ default: m.AuthPage })));
const CartPage = lazy(() => import("./pages/CartPage").then(m => ({ default: m.CartPage })));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage").then(m => ({ default: m.CheckoutPage })));
const HomePage = lazy(() => import("./pages/HomePage").then(m => ({ default: m.HomePage })));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage").then(m => ({ default: m.NotFoundPage })));
const OrdersPage = lazy(() => import("./pages/OrdersPage").then(m => ({ default: m.OrdersPage })));
const OrderSuccessPage = lazy(() => import("./pages/OrderSuccessPage").then(m => ({ default: m.OrderSuccessPage })));
const ProductDetailPage = lazy(() => import("./pages/ProductDetailPage").then(m => ({ default: m.ProductDetailPage })));
const ShopPage = lazy(() => import("./pages/ShopPage").then(m => ({ default: m.ShopPage })));
const WishlistPage = lazy(() => import("./pages/WishlistPage").then(m => ({ default: m.WishlistPage })));
const VSCompetitorsPage = lazy(() => import("./pages/VSCompetitorsPage").then(m => ({ default: m.VSCompetitorsPage })));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage").then(m => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage").then(m => ({ default: m.ResetPasswordPage })));
const SellerStorePage = lazy(() => import("./pages/SellerStorePage").then(m => ({ default: m.SellerStorePage })));
const VerifyEmailPage = lazy(() => import("./pages/VerifyEmailPage").then(m => ({ default: m.VerifyEmailPage })));
const ContactPage = lazy(() => import("./pages/ContactPage").then(m => ({ default: m.ContactPage })));
const StaticContentPage = lazy(() => import("./pages/StaticContentPage").then(m => ({ default: m.StaticContentPage })));
const UnsubscribePage = lazy(() => import("./pages/UnsubscribePage").then(m => ({ default: m.UnsubscribePage })));
const SavedAddressesPage = lazy(() => import("./pages/SavedAddressesPage").then(m => ({ default: m.SavedAddressesPage })));

function ScrollToTop() {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    scrollToTop({ behavior: "instant" });
  }, [pathname, search, hash]);

  return null;
}

export default function App() {
  const auth = useAuth();
  const cart = useCart(auth.token);
  const orders = useOrders(auth.token);
  const [wishlistIds, setWishlistIds] = useState(() => getStoredWishlist());
  const [toastMessage, setToastMessage] = useState("");
  const [modalConfig, setModalConfig] = useState(null);

  const showAlert = useCallback((message, options = {}) => {
    return new Promise((resolve) => {
      setModalConfig({
        type: "alert",
        message,
        title: options.title || "Notice",
        isDestructive: options.isDestructive ?? false,
        confirmText: options.confirmText || "OK",
        resolve: (value) => {
          setModalConfig(null);
          resolve(value);
        }
      });
    });
  }, []);

  const showConfirm = useCallback((message, options = {}) => {
    return new Promise((resolve) => {
      setModalConfig({
        type: "confirm",
        message,
        title: options.title || "Confirm Action",
        isDestructive: options.isDestructive ?? /delete|deactivate|ban|reject|cancel/i.test(message),
        confirmText: options.confirmText || "Confirm",
        cancelText: options.cancelText || "Cancel",
        resolve: (value) => {
          setModalConfig(null);
          resolve(value);
        }
      });
    });
  }, []);

  const [categories, setCategories] = useState([
    { id: "1", name: "Pantry", emoji: "🥫", slug: "pantry" },
    { id: "2", name: "Beverages", emoji: "🥤", slug: "beverages" },
    { id: "3", name: "Home", emoji: "🏠", slug: "home" },
    { id: "4", name: "Personal Care", emoji: "🧴", slug: "personal-care" },
    { id: "5", name: "Health", emoji: "🩺", slug: "health" }
  ]);

  const reloadCategories = useCallback(async () => {
    try {
      const res = await getCategoriesRequest();
      const data = res?.data || (Array.isArray(res) ? res : null);
      if (data) {
        setCategories(data);
      }
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  }, []);

  useEffect(() => {
    reloadCategories().catch(() => {});
  }, [reloadCategories]);

  useEffect(() => {
    if (auth.token) {
      getWishlistRequest()
        .then((res) => {
          const data = res?.data || res;
          if (data && data.products) {
            setWishlistIds(data.products.map((p) => p.id));
          }
        })
        .catch(() => {});
    } else {
      setWishlistIds(getStoredWishlist());
    }
  }, [auth.token]);

  const ordersReloadRef = useRef(orders?.reload);
  useEffect(() => {
    ordersReloadRef.current = orders?.reload;
  }, [orders?.reload]);

  useEffect(() => {
    if (!auth.token) return;

    let eventSource = null;
    let reconnectTimeout = null;
    let reconnectDelay = 1000;
    let isMounted = true;

    const connect = () => {
      if (!isMounted || !auth.token) return;

      const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:5001";
      eventSource = new EventSource(`${backendUrl}/api/notifications/stream`, { withCredentials: true });

      eventSource.onopen = () => {
        reconnectDelay = 1000; // Reset delay on successful connection
      };

      eventSource.onmessage = (event) => {
        try {
          if (event.data === ":") return; // Keep-alive comment
          const data = JSON.parse(event.data);
          if (data && data.title) {
            setToastMessage(`🔔 ${data.title}: ${data.message}`);
            if (ordersReloadRef.current && typeof ordersReloadRef.current === "function") {
              ordersReloadRef.current().catch(() => {});
            }
          }
        } catch (err) {
          // Quietly ignore malformed messages
        }
      };

      eventSource.onerror = () => {
        if (eventSource) {
          eventSource.close();
          eventSource = null;
        }
        if (isMounted && auth.token) {
          reconnectTimeout = setTimeout(() => {
            reconnectDelay = Math.min(reconnectDelay * 2, 30000); // Exponential backoff up to 30s
            connect();
          }, reconnectDelay);
        }
      };
    };

    connect();

    return () => {
      isMounted = false;
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [auth.token]);

  const toggleWishlist = async (id) => {
    if (auth.token) {
      try {
        const res = await toggleWishlistRequest(id);
        if (res.success && res.data) {
          setWishlistIds(res.data.products.map((p) => p.id));
          setToastMessage(res.message);
        }
      } catch (err) {
        setToastMessage(err.message || "Failed to update wishlist.");
      }
    } else {
      setWishlistIds((current) => {
        const next = current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id];
        setStoredWishlist(next);
        return next;
      });
      setToastMessage("Wishlist updated.");
    }
  };

  const contextValue = useMemo(
    () => ({
      ...auth,
      cart,
      orders,
      wishlistIds,
      toggleWishlist,
      categories,
      reloadCategories,
      notify: setToastMessage,
      confirm: showConfirm,
      alert: showAlert,
    }),
    [auth, cart, orders, wishlistIds, categories, reloadCategories, showConfirm, showAlert],
  );

  return (
    <AppContext.Provider value={contextValue}>
      <BrowserRouter>
        <ScrollToTop />
        <div className="app-shell">
          <Navbar />
          <main className="main-shell">
            <PageTransition>
              <Suspense fallback={
                <div className="flex items-center justify-center min-h-[50vh]">
                  <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              }>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/shop" element={<ShopPage />} />
                  <Route path="/products/:id" element={<ProductDetailPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/orders" element={<OrdersPage />} />
                  <Route path="/order-success/:orderId" element={<OrderSuccessPage />} />
                  <Route path="/wishlist" element={<WishlistPage />} />
                  <Route path="/account" element={<AccountPage />} />
                  <Route path="/admin" element={<AdminPage />} />
                  <Route path="/seller" element={<SellerPage />} />
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/reset-password" element={<ResetPasswordPage />} />
                  <Route path="/seller/:id" element={<SellerStorePage />} />
                  <Route path="/verify-email" element={<VerifyEmailPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/vs-competitors" element={<VSCompetitorsPage />} />
                  <Route path="/info/:slug" element={<StaticContentPage />} />
                  <Route path="/unsubscribe" element={<UnsubscribePage />} />
                  <Route path="/saved-addresses" element={<SavedAddressesPage />} />
                  <Route path="/addresses" element={<SavedAddressesPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </Suspense>
            </PageTransition>
          </main>
          <Footer />
          <Toast message={toastMessage} onClose={() => setToastMessage("")} />
          <ConfirmationModal config={modalConfig} />
          <CookieBanner />
          <ChatbotWidget />
        </div>
      </BrowserRouter>
    </AppContext.Provider>
  );
}
