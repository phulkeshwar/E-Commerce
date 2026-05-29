import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { categories } from "../../constants/categories";
import { useAppContext } from "../../hooks/useAppContext";

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
  const { cart, wishlistIds, user } = useAppContext();
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

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
          aria-label="GramBazaar Home"
        >
          {/* Cart icon in logo */}
          <span className="text-amber-400 text-2xl md:text-[1.7rem] leading-none">🛒</span>
          <span className="font-extrabold text-white text-lg md:text-[1.45rem] leading-none tracking-tight">
            Gram<span className="text-amber-400">Bazaar</span>
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
            {categories.map((cat) => (
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
              <NavIconBtn
                icon={<AdminIcon />}
                label="Admin"
                onClick={() => navigate("/admin")}
              />
            </>
          ) : (
            <NavIconBtn
              icon={<UserIcon />}
              label="Sign In"
              onClick={() => navigate("/auth")}
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
          <NavIconBtn
            icon={<CartIcon />}
            label="Cart"
            badge={cart.summary.itemCount}
            onClick={() => navigate("/cart")}
          />

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
            {categories.map((cat) => (
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
      <nav className="bg-[#232f3e] overflow-x-auto">
        {/* Desktop */}
        <div className="hidden md:flex items-center gap-1 px-4 min-h-[38px]">
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
          <div className="w-px h-4 bg-white/20 mx-1" />
          {categories.filter(c => c !== "All").map((cat) => (
            <NavLink
              key={cat}
              to={`/shop?category=${encodeURIComponent(cat)}`}
              className={({ isActive }) =>
                `px-3 py-1.5 text-[0.82rem] whitespace-nowrap rounded
                 transition-colors ${isActive
                  ? "text-amber-400 bg-white/10"
                  : "text-white/70 hover:text-white hover:bg-white/10"}`
              }
            >
              {cat}
            </NavLink>
          ))}
          <div className="ml-auto flex items-center gap-1">
            <NavLink
              to="/orders"
              className={({ isActive }) =>
                `px-3 py-1.5 text-[0.82rem] whitespace-nowrap rounded
                 transition-colors ${isActive
                  ? "text-amber-400 bg-white/10"
                  : "text-white/70 hover:text-white hover:bg-white/10"}`
              }
            >
              My Orders
            </NavLink>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden flex flex-col border-t border-white/10">
            {[
              { label: "Home", to: "/" },
              { label: "Shop All", to: "/shop" },
              { label: "My Orders", to: "/orders" },
              { label: "Wishlist", to: "/wishlist" },
              { label: user ? "Account" : "Sign In", to: user ? "/account" : "/auth" },
              ...(user ? [{ label: "Admin Panel", to: "/admin" }] : []),
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
    </header>
  );
}
