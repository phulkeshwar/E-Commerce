import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ProductGrid } from "../components/product/ProductGrid";
import { Spinner } from "../components/ui/Spinner";
import { categories } from "../constants/categories";
import { useDebounce } from "../hooks/useDebounce";
import { useProducts } from "../hooks/useProducts";

export function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "All";
  const badge = searchParams.get("badge") || "";
  const sort = searchParams.get("sort") || "relevance";
  const debouncedSearch = useDebounce(search);
  const filters = useMemo(
    () => ({ search: debouncedSearch, category, badge }),
    [badge, category, debouncedSearch],
  );
  const { products, loading, error } = useProducts(filters);
  const sortedProducts = useMemo(() => {
    const nextProducts = [...products];

    if (sort === "price-asc") {
      return nextProducts.sort((left, right) => left.price - right.price);
    }
    if (sort === "price-desc") {
      return nextProducts.sort((left, right) => right.price - left.price);
    }
    if (sort === "rating") {
      return nextProducts.sort((left, right) => right.rating - left.rating);
    }
    if (sort === "newest") {
      return nextProducts.sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt));
    }
    return nextProducts;
  }, [products, sort]);

  return (
    <section className="page-content">
      <div className="shop-layout">
        <aside className={`filter-sidebar mobile-collapsible ${filtersOpen ? "is-open" : ""}`}>
          <button
            aria-expanded={filtersOpen}
            className="mobile-toggle"
            onClick={() => setFiltersOpen((current) => !current)}
            type="button"
          >
            <span>Filters</span>
            <span>{filtersOpen ? "Hide" : "Show"}</span>
          </button>
          <div className="mobile-collapsible-content">
          <h3>🔧 Filters</h3>
          <div className="filter-group">
            <label>Category</label>
            {categories.map((entry) => (
              <div
                key={entry}
                className="filter-option"
                onClick={() => {
                  const next = new URLSearchParams(searchParams);
                  if (entry === "All") {
                    next.delete("category");
                  } else {
                    next.set("category", entry);
                  }
                  setSearchParams(next);
                }}
              >
                <input type="radio" readOnly checked={category === entry} />
                <span>{entry}</span>
              </div>
            ))}
          </div>
          <div className="filter-group">
            <label>Search</label>
            <input
              className="filter-input"
              value={search}
              placeholder="Search products..."
              onChange={(event) => {
                const next = new URLSearchParams(searchParams);
                if (event.target.value) {
                  next.set("search", event.target.value);
                } else {
                  next.delete("search");
                }
                setSearchParams(next);
              }}
            />
          </div>
          <button className="filter-clear" onClick={() => setSearchParams(new URLSearchParams())}>
            Clear All
          </button>
          </div>
        </aside>
        <div className="shop-main">
          <div className="shop-toolbar">
            <span>
              {sortedProducts.length} result{sortedProducts.length !== 1 ? "s" : ""}
              {search ? ` for "${search}"` : ""}
              {badge === "new" ? " in New Arrivals" : ""}
            </span>
            <select
              className="sort-sel"
              value={sort}
              onChange={(event) => {
                const next = new URLSearchParams(searchParams);
                if (event.target.value === "relevance") {
                  next.delete("sort");
                } else {
                  next.set("sort", event.target.value);
                }
                setSearchParams(next);
              }}
            >
              <option value="relevance">Sort: Relevance</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest First</option>
            </select>
          </div>

          {loading ? <Spinner /> : null}
          {error ? <p>{error}</p> : null}
          {!loading && !error && sortedProducts.length === 0 ? (
            <div className="no-results">
              <p>😕</p>
              <span>No products found. Try clearing filters.</span>
            </div>
          ) : null}
          {!loading && !error && sortedProducts.length > 0 ? (
            <ProductGrid products={sortedProducts} />
          ) : null}
        </div>
      </div>
    </section>
  );
}
