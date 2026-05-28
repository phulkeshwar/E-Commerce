import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { categories } from "../../constants/categories";
import { useAppContext } from "../../hooks/useAppContext";

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, wishlistIds, user } = useAppContext();

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
  };

  return (
    <header className="nav">
      <div className="nav-top">
        <button className="nav-logo" onClick={() => navigate("/")}>
          🛒 Gram<span>Bazaar</span>
        </button>
         <div className="nav-icons">
          {user ? (
            <>
              <button className="nav-icon-btn" onClick={() => navigate("/account")}>
                <span className="icon">👤</span>
                <span className="lbl">{user.name.split(" ")[0]}</span>
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
              <span className="icon">❤️</span>
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
        </div>
      </div>
        <form className="nav-search" onSubmit={handleSearch}>
          <select name="category" defaultValue={categoryValue}>
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
          />
          <button className="nav-search-btn" type="submit">
            🔍
          </button>
        </form>
       
      <div className="nav-bottom">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/shop">Shop All</NavLink>
        <NavLink to="/orders">My Orders</NavLink>
        <NavLink to="/wishlist">Wishlist</NavLink>
        <NavLink to={user ? "/account" : "/auth"}>Account</NavLink>
      </div>
    </header>
  );
}
