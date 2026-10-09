import { useState, useEffect, useCallback } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAppContext } from "../../hooks/useAppContext";
import { Modal } from "../ui/Modal";
import {
  getNotificationsRequest,
  markNotificationReadRequest,
  markAllNotificationsReadRequest,
} from "../../api/notification.api";

// ── SVG Icons ────────────────────────────────────────────────────────────────
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
    className="w-5 h-5">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    className="w-6 h-6">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const HeartIcon = ({ filled }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    className="w-6 h-6">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const CartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    className="w-6 h-6">
    <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);

const AdminIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    className="w-6 h-6">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"
    className="w-6 h-6">
    <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"
    className="w-6 h-6">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const BellIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    className="w-6 h-6">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const OrdersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    className="w-6 h-6">
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    className="w-3.5 h-3.5">
    <path d="M6 9l6 6 6-6" />
  </svg>
);

// ── NavIconButton ─────────────────────────────────────────────────────────────
function NavIconBtn({ icon, label, badge, onClick }) {
  return (
    <button
      onClick={onClick}
      className="relative flex flex-col items-center gap-0.5 px-2 py-1.5 rounded
                 text-white hover:text-amber-400 hover:bg-white/10
                 transition-all duration-150 min-w-[56px] group"
    >
      <span className="relative">
        {icon}
        {badge > 0 && (
          <span className="absolute -top-2 -right-2.5 flex items-center justify-center
                           min-w-[18px] h-[18px] px-1 rounded-full
                           bg-amber-400 text-[10px] font-bold text-gray-900 leading-none">
            {badge}
          </span>
        )}
      </span>
      <span className="hidden md:block text-[0.7rem] font-medium leading-none whitespace-nowrap">
        {label}
      </span>
    </button>
  );
}

// ── Main Navbar ───────────────────────────────────────────────────────────────
export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, wishlistIds, user, categories } = useAppContext();
  const allCatList = categories.map((c) => c.name);
  const generalCats = allCatList.filter((c) => c.toLowerCase() !== "software");
  const primaryCategories = generalCats.slice(0, 6);
  const moreCategories = generalCats.slice(6);
  const categoryNames = ["All", ...allCatList];
  const [showMoreCategories, setShowMoreCategories] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Notifications State
  const [notifications, setNotifications] = useState([]);
  const [showNotifModal, setShowNotifModal] = useState(false);

  const loadNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const res = await getNotificationsRequest();
      if (res && res.notifications) {
        setNotifications(res.notifications);
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }
    loadNotifications().catch(() => {});
    const interval = setInterval(() => {
      loadNotifications().catch(() => {});
    }, 20000);
    return () => clearInterval(interval);
  }, [user, loadNotifications]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkRead = async (id) => {
    try {
      await markNotificationReadRequest(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error("Error marking notification read:", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsReadRequest();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Error marking all notifications read:", err);
    }
  };

  const params = new URLSearchParams(location.search);
  const searchValue = params.get("search") || "";
  const categoryValue = params.get("category") || "All";

  const handleSearch = (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const search = String(form.get("search") || "");
    const category = String(form.get("category") || "All");
    const nextParams = new URLSearchParams();
    if (search) nextParams.set("search", search);
    if (category !== "All") nextParams.set("category", category);
    navigate(`/shop?${nextParams.toString()}`);
    setShowMobileSearch(false);
    setShowMobileMenu(false);
  };

  return (
    <header className="sticky top-0 z-[200] shadow-[0_2px_8px_rgba(0,0,0,0.35)]">

      {/* ── Top Bar ─────────────────────────────────────────────────────── */}
      <div className="bg-[#131921] flex items-center gap-3 px-3 md:px-6 py-2 md:py-0 md:min-h-[64px]">

        {/* Logo */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-1.5 shrink-0 px-2 py-1.5 rounded
                     border border-transparent hover:border-white/40
                     transition-colors duration-150 group"
          aria-label="GaramBazaar Home"
        >
          {/* Cart icon in logo */}
          <span className="text-amber-400 text-2xl md:text-[1.7rem] leading-none">🛒</span>
          <span className="font-extrabold text-white text-lg md:text-[1.45rem] leading-none tracking-tight">
            Garam<span className="text-amber-400">Bazaar</span>
          </span>
        </button>

        {/* Search Bar — desktop */}
        <form
          onSubmit={handleSearch}
          className="hidden md:flex flex-1 max-w-[720px] mx-auto h-[42px] rounded-md overflow-hidden
                     border-2 border-amber-400 focus-within:border-amber-500 transition-colors"
        >
          <select
            name="category"
            defaultValue={categoryValue}
            aria-label="Product category"
            className="bg-[#f3f3f3] text-gray-700 text-sm px-3 border-r border-gray-300
                       outline-none cursor-pointer hover:bg-[#e9e9e9] transition-colors
                       min-w-[130px] max-w-[160px]"
          >
            {categoryNames.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <input
            name="search"
            defaultValue={searchValue}
            placeholder="Search products, brands and more..."
            aria-label="Search products"
            className="flex-1 px-4 text-[0.95rem] text-gray-800 bg-white outline-none placeholder-gray-400"
          />
          <button
            type="submit"
            aria-label="Search"
            className="bg-amber-400 hover:bg-amber-500 active:bg-amber-600
                       text-gray-900 px-4 transition-colors flex items-center justify-center"
          >
            <SearchIcon />
          </button>
        </form>

        {/* Right Icons */}
        <div className="flex items-center gap-0.5 md:gap-1 ml-auto md:ml-0">

          {/* Mobile search toggle */}
          <button
            onClick={() => setShowMobileSearch(!showMobileSearch)}
            aria-label="Toggle search"
            className="md:hidden flex items-center justify-center w-10 h-10 rounded
                       text-white hover:bg-white/10 transition-colors"
          >
            <SearchIcon />
          </button>

          {/* Account / Sign In */}
          {user ? (
            <>
              <NavIconBtn
                icon={<UserIcon />}
                label="Account"
                onClick={() => navigate("/account")}
              />
              {user.role === "admin" && (
                <NavIconBtn
                  icon={<AdminIcon />}
                  label="Admin"
                  onClick={() => navigate("/admin")}
                />
              )}
              {user.role === "seller" && (
                <NavIconBtn
                  icon={<AdminIcon />}
                  label="Seller"
                  onClick={() => navigate("/seller")}
                />
              )}
            </>
          ) : (
            <NavIconBtn
              icon={<UserIcon />}
              label="Sign In"
              onClick={() => navigate("/auth")}
            />
          )}

          {user && (
            <NavIconBtn
              icon={<BellIcon />}
              label="Notifications"
              badge={unreadCount}
              onClick={() => setShowNotifModal(true)}
            />
          )}

          {/* Orders */}
          {user?.role !== "seller" && (
            <NavIconBtn
              icon={<OrdersIcon />}
              label="Orders"
              onClick={() => navigate(user ? "/orders" : "/auth")}
            />
          )}

          {/* Wishlist */}
          <NavIconBtn
            icon={<HeartIcon filled={wishlistIds.length > 0} />}
            label="Wishlist"
            badge={wishlistIds.length}
            onClick={() => navigate("/wishlist")}
          />

          {/* Cart */}
          {user?.role !== "seller" && (
            <NavIconBtn
              icon={<CartIcon />}
              label="Cart"
              badge={cart.summary.itemCount}
              onClick={() => navigate("/cart")}
            />
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            aria-label="Toggle menu"
            className="md:hidden flex items-center justify-center w-10 h-10 rounded
                       text-white hover:bg-white/10 transition-colors"
          >
            {showMobileMenu ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {/* ── Mobile Search Bar ────────────────────────────────────────────── */}
      {showMobileSearch && (
        <form
          onSubmit={handleSearch}
          className="md:hidden flex h-11 border-t border-white/10 bg-[#131921]"
        >
          <select
            name="category"
            defaultValue={categoryValue}
            aria-label="Product category"
            className="bg-[#f3f3f3] text-gray-700 text-sm px-2 border-r border-gray-300
                       outline-none min-w-[110px]"
          >
            {categoryNames.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <input
            name="search"
            defaultValue={searchValue}
            placeholder="Search..."
            autoFocus
            aria-label="Search products"
            className="flex-1 px-3 text-sm text-gray-800 bg-white outline-none"
          />
          <button
            type="submit"
            aria-label="Search"
            className="bg-amber-400 hover:bg-amber-500 text-gray-900 px-4 flex items-center"
          >
            <SearchIcon />
          </button>
        </form>
      )}

      {/* ── Categories Nav Bar ───────────────────────────────────────────── */}
      <nav className="bg-[#232f3e] relative z-[150]">
        {/* Desktop */}
        <div className="hidden md:flex items-center gap-1 px-4 min-h-[40px]">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `px-3 py-1.5 text-[0.82rem] font-semibold whitespace-nowrap rounded
               transition-colors ${isActive
                ? "text-amber-400 bg-white/10"
                : "text-white/85 hover:text-white hover:bg-white/10"}`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/shop"
            className={({ isActive }) =>
              `px-3 py-1.5 text-[0.82rem] font-semibold whitespace-nowrap rounded
               transition-colors ${isActive
                ? "text-amber-400 bg-white/10"
                : "text-white/85 hover:text-white hover:bg-white/10"}`
            }
          >
            Shop All
          </NavLink>
          <NavLink
            to="/shop?category=Software"
            className={({ isActive }) =>
              `px-3 py-1.5 text-[0.82rem] font-bold whitespace-nowrap rounded flex items-center gap-1.5
               transition-colors ${location.search.includes("category=Software")
                ? "text-amber-300 bg-amber-500/20 shadow-sm border border-amber-400/30"
                : "text-amber-400 hover:text-amber-300 hover:bg-white/10"}`
            }
          >
            <span>⚡</span> Software & Apps
          </NavLink>
          <div className="w-px h-4 bg-white/20 mx-1" />

          {/* Primary categories */}
          {primaryCategories.map((cat) => (
            <NavLink
              key={cat}
              to={`/shop?category=${encodeURIComponent(cat)}`}
              className={({ isActive }) =>
                `px-3 py-1.5 text-[0.82rem] font-medium whitespace-nowrap rounded
                 transition-colors ${isActive
                  ? "text-amber-400 bg-white/10 font-bold"
                  : "text-white/80 hover:text-white hover:bg-white/10"}`
              }
            >
              {cat}
            </NavLink>
          ))}

          {/* More Categories Dropdown */}
          {moreCategories.length > 0 && (
            <div
              className="relative"
              onMouseEnter={() => setShowMoreCategories(true)}
              onMouseLeave={() => setShowMoreCategories(false)}
            >
              <button
                type="button"
                onClick={() => setShowMoreCategories(!showMoreCategories)}
                className={`flex items-center gap-1 px-3 py-1.5 text-[0.82rem] font-medium rounded transition-colors ${
                  showMoreCategories
                    ? "text-amber-400 bg-white/10"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                }`}
              >
                <span>More Categories</span>
                <ChevronDownIcon />
              </button>

              {showMoreCategories && (
                <div className="absolute top-full left-0 mt-0.5 w-56 bg-[#232f3e] border border-white/15 rounded-lg shadow-2xl py-2 z-[300] grid grid-cols-1 divide-y divide-white/5">
                  {moreCategories.map((cat) => (
                    <NavLink
                      key={cat}
                      to={`/shop?category=${encodeURIComponent(cat)}`}
                      onClick={() => setShowMoreCategories(false)}
                      className={({ isActive }) =>
                        `px-4 py-2 text-xs transition-colors ${
                          isActive
                            ? "text-amber-400 bg-white/10 font-bold"
                            : "text-white/80 hover:text-amber-400 hover:bg-white/10 font-medium"
                        }`
                      }
                    >
                      {cat}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Right-aligned My Orders */}
          <div className="ml-auto flex items-center gap-2">
            {user?.role !== "seller" && (
              <NavLink
                to="/orders"
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-1 text-[0.82rem] font-bold whitespace-nowrap rounded-md
                   transition-all duration-150 ${isActive
                    ? "text-amber-400 bg-amber-400/20 border border-amber-400/50 shadow-sm"
                    : "text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-400/50"}`
                }
              >
                <span>📦</span>
                <span>My Orders</span>
              </NavLink>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden flex flex-col border-t border-white/10">
            {[
              { label: "Home", to: "/" },
              { label: "Shop All", to: "/shop" },
              { label: "⚡ Software & Apps", to: "/shop?category=Software" },
              ...(user?.role !== "seller" ? [{ label: "My Orders", to: "/orders" }] : []),
              { label: "Wishlist", to: "/wishlist" },
              { label: user ? "Account" : "Sign In", to: user ? "/account" : "/auth" },
              ...(user && user.role === "admin" ? [{ label: "Admin Panel", to: "/admin" }] : []),
              ...(user && user.role === "seller" ? [{ label: "Seller Panel", to: "/seller" }] : []),
            ].map(({ label, to }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setShowMobileMenu(false)}
                className={({ isActive }) =>
                  `px-5 py-3 text-[0.9rem] font-medium border-b border-white/5
                   transition-colors ${isActive
                    ? "text-amber-400 bg-white/5"
                    : "text-white/85 hover:text-white hover:bg-white/10"}`
                }
              >
                {label}
              </NavLink>
            ))}
          </div>
        )}
      </nav>

      {showNotifModal && (
        <Modal title="🔔 Notifications Center" onClose={() => setShowNotifModal(false)}>
          <div className="flex flex-col max-h-[400px] overflow-y-auto pr-1 text-sm">
            {notifications.length > 0 && unreadCount > 0 && (
              <div className="flex justify-end mb-3">
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-[#c4622d] font-bold hover:underline"
                >
                  ✓ Mark all as read
                </button>
              </div>
            )}
            <div className="space-y-3">
              {notifications.length > 0 ? (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-3.5 rounded-xl border transition-all duration-200 ${
                      notif.isRead
                        ? "bg-gray-50 border-gray-150 text-gray-600"
                        : "bg-amber-50/40 border-amber-200 text-gray-900 shadow-sm"
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <h4 className="font-bold text-sm">{notif.title}</h4>
                      {!notif.isRead && (
                        <button
                          onClick={() => handleMarkRead(notif.id)}
                          className="text-[10px] text-amber-700 bg-amber-100 hover:bg-amber-200 px-2 py-0.5 rounded font-bold transition-colors"
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                    <p className="text-xs leading-relaxed break-words whitespace-pre-line">{notif.message}</p>
                    <span className="text-[10px] text-gray-400 block mt-2 font-medium">
                      {new Date(notif.createdAt).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <span className="text-4xl block mb-2">🔔</span>
                  <p className="text-xs">No notifications yet.</p>
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
    </header>
  );
}
