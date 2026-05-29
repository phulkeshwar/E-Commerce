import { useMemo, useState } from "react";
import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom";
import { Footer } from "./components/layout/Footer";
import { Navbar } from "./components/layout/Navbar";
import { PageTransition } from "./components/layout/PageTransition";
import { Toast } from "./components/ui/Toast";
import { AppContext } from "./context/AppContext";
import { useAuth } from "./hooks/useAuth";
import { useCart } from "./hooks/useCart";
import { useOrders } from "./hooks/useOrders";
import { getStoredWishlist, setStoredWishlist } from "./store/wishlistStore";
import { AccountPage } from "./pages/AccountPage";
import { AdminPage } from "./pages/AdminPage";
import { AuthPage } from "./pages/AuthPage";
import { CartPage } from "./pages/CartPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { HomePage } from "./pages/HomePage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { OrdersPage } from "./pages/OrdersPage";
import { OrderSuccessPage } from "./pages/OrderSuccessPage";
import { ProductDetailPage } from "./pages/ProductDetailPage";
import { ShopPage } from "./pages/ShopPage";
import { WishlistPage } from "./pages/WishlistPage";

export default function App() {
  const auth = useAuth();
  const cart = useCart(auth.token);
  const orders = useOrders(auth.token);
  const [wishlistIds, setWishlistIds] = useState(() => getStoredWishlist());
  const [toastMessage, setToastMessage] = useState("");

  const toggleWishlist = (id) => {
    setWishlistIds((current) => {
      const next = current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id];
      setStoredWishlist(next);
      return next;
    });
  };

  const contextValue = useMemo(
    () => ({
      ...auth,
      cart,
      orders,
      wishlistIds,
      toggleWishlist,
      notify: setToastMessage,
    }),
    [auth, cart, orders, wishlistIds],
  );

  return (
    <AppContext.Provider value={contextValue}>
      <BrowserRouter>
        <div className="app-shell">
          <Navbar />
          <main className="main-shell">
            <PageTransition>
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
                <Route path="/auth" element={<AuthPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </PageTransition>
          </main>
          <Footer />
          <Toast message={toastMessage} onClose={() => setToastMessage("")} />
        </div>
      </BrowserRouter>
    </AppContext.Provider>
  );
}
