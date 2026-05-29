import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { categories } from "../../constants/categories";
import { useAppContext } from "../../hooks/useAppContext";

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, wishlistIds, user } = useAppContext();
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const params = new URLSearchParams(location.search);
  const searchValue = params.get("search") || "";
  const categoryValue = params.get("category") || "All";

  const handleSearch = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const search = String(form.get("search") || "");
    const category = String(form.get("category") || "All");
    const nextParams = new URLSearchParams();

    if (search) {
      nextParams.set("search", search);
    }

    if (category !== "All") {
      nextParams.set("category", category);
    }

    navigate(`/shop?${nextParams.toString()}`);
    setShowMobileSearch(false);
  };

  return (
    <header className="nav">
      <div className="nav-top">
        <button className="nav-logo" onClick={() => navigate("/")}>
          🛒 Gram<span>Bazaar</span>
        </button>

        <form className="nav-search" onSubmit={handleSearch}>
          <select name="category" defaultValue={categoryValue} aria-label="Product category">
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <input
            name="search"
            placeholder="Search products, brands..."
            defaultValue={searchValue}
            aria-label="Search products"
          />
          <button className="nav-search-btn" type="submit" aria-label="Search">
            🔍
          </button>
        </form>

        <div className="nav-icons">
          <button
            className="mobile-search-toggle"
            onClick={() => setShowMobileSearch(!showMobileSearch)}
            aria-label="Toggle search"
          >
            🔍
          </button>

          {user ? (
            <>
              <button className="nav-icon-btn" onClick={() => navigate("/account")}>
                <span className="icon">👤</span>
                <span className="lbl">Account</span>
              </button>
              <button className="nav-icon-btn" onClick={() => navigate("/admin")}>
                <span className="icon">⚙️</span>
                <span className="lbl">Admin</span>
              </button>
            </>
          ) : (
            <button className="nav-icon-btn" onClick={() => navigate("/auth")}>
              <span className="icon">👤</span>
              <span className="lbl">Sign In</span>
            </button>
          )}

          <button className="nav-icon-btn" onClick={() => navigate("/wishlist")}>
            <span className="nav-icon-wrap">
              <span className="icon">💗</span>
              {wishlistIds.length > 0 ? <span className="nav-badge">{wishlistIds.length}</span> : null}
            </span>
            <span className="lbl">Wishlist</span>
          </button>

          <button className="nav-icon-btn" onClick={() => navigate("/cart")}>
            <span className="nav-icon-wrap">
              <span className="icon">🛒</span>
              {cart.summary.itemCount > 0 ? (
                <span className="nav-badge">{cart.summary.itemCount}</span>
              ) : null}
            </span>
            <span className="lbl">Cart</span>
          </button>

          <button
            className="mobile-toggle"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            aria-label="Toggle menu"
          >
            ☰
          </button>
        </div>
      </div>

      {showMobileSearch && (
        <form className="nav-search" onSubmit={handleSearch} style={{ display: "flex" }}>
          <select name="category" defaultValue={categoryValue} aria-label="Product category">
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <input
            name="search"
            placeholder="Search products..."
            defaultValue={searchValue}
            aria-label="Search products"
          />
          <button className="nav-search-btn" type="submit" aria-label="Search">
            🔍
          </button>
        </form>
      )}

      <nav className={`nav-bottom ${showMobileMenu ? "mobile-visible" : ""}`}>
        <NavLink to="/" onClick={() => setShowMobileMenu(false)}>Home</NavLink>
        <NavLink to="/shop" onClick={() => setShowMobileMenu(false)}>Shop All</NavLink>
        <NavLink to="/orders" onClick={() => setShowMobileMenu(false)}>My Orders</NavLink>
        <NavLink to="/wishlist" onClick={() => setShowMobileMenu(false)}>Wishlist</NavLink>
        <NavLink to={user ? "/account" : "/auth"} onClick={() => setShowMobileMenu(false)}>Account</NavLink>
      </nav>
    </header>
  );
}
