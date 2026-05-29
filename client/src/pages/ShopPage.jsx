import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ProductGrid } from "../components/product/ProductGrid";
import { Spinner } from "../components/ui/Spinner";
import { categories } from "../constants/categories";
import { useDebounce } from "../hooks/useDebounce";
import { useProducts } from "../hooks/useProducts";

const sortOptions = [
  { value: "relevance",  label: "Relevance" },
  { value: "price-asc",  label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating",     label: "Highest Rated" },
  { value: "newest",     label: "Newest First" },
];

// Small chevron icon
function ChevronIcon({ open }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor"
      className={`w-4 h-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
      <path fillRule="evenodd"
        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
        clipRule="evenodd" />
    </svg>
  );
}

function FilterSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-200 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-3.5 text-sm font-bold
                   text-gray-800 hover:text-[#c4622d] transition-colors"
      >
        {title}
        <ChevronIcon open={open} />
      </button>
      {open && <div className="pb-4">{children}</div>}
    </div>
  );
}

export function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);

  const search   = searchParams.get("search") || "";
  const category = searchParams.get("category") || "All";
  const badge    = searchParams.get("badge") || "";
  const sort     = searchParams.get("sort") || "relevance";

  const debouncedSearch = useDebounce(search);
  const filters = useMemo(
    () => ({ search: debouncedSearch, category, badge }),
    [badge, category, debouncedSearch]
  );
  const { products, loading, error } = useProducts(filters);

  const sortedProducts = useMemo(() => {
    let list = [...products];
    if (inStockOnly) list = list.filter((p) => p.inStock);
    if (priceMin) list = list.filter((p) => p.price >= Number(priceMin));
    if (priceMax) list = list.filter((p) => p.price <= Number(priceMax));
    if (sort === "price-asc")  return list.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") return list.sort((a, b) => b.price - a.price);
    if (sort === "rating")     return list.sort((a, b) => b.rating - a.rating);
    if (sort === "newest")     return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return list;
  }, [products, sort, priceMin, priceMax, inStockOnly]);

  const setParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (!value || value === "All" || value === "relevance") next.delete(key);
    else next.set(key, value);
    setSearchParams(next);
  };

  const clearAll = () => {
    setSearchParams(new URLSearchParams());
    setPriceMin(""); setPriceMax(""); setInStockOnly(false);
  };

  // Active filter chips
  const activeFilters = [
    ...(category !== "All" ? [{ label: `Category: ${category}`, clear: () => setParam("category", "All") }] : []),
    ...(badge ? [{ label: `Badge: ${badge}`, clear: () => setParam("badge", "") }] : []),
    ...(search ? [{ label: `"${search}"`, clear: () => setParam("search", "") }] : []),
    ...(inStockOnly ? [{ label: "In Stock Only", clear: () => setInStockOnly(false) }] : []),
    ...(priceMin ? [{ label: `Min ₹${priceMin}`, clear: () => setPriceMin("") }] : []),
    ...(priceMax ? [{ label: `Max ₹${priceMax}`, clear: () => setPriceMax("") }] : []),
  ];

  const SidebarContent = () => (
    <div className="space-y-0">
      {/* Category */}
      <FilterSection title="Category">
        <div className="space-y-1.5">
          {categories.map((cat) => (
            <label
              key={cat}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <input
                type="radio"
                name="category"
                checked={category === cat}
                readOnly
                onClick={() => setParam("category", cat)}
                className="w-4 h-4 accent-[#c4622d] cursor-pointer"
              />
              <span className={`text-sm transition-colors ${category === cat
                ? "font-semibold text-[#c4622d]"
                : "text-gray-600 group-hover:text-gray-900"}`}>
                {cat}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Price Range */}
      <FilterSection title="Price Range">
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <label className="text-[0.68rem] font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Min ₹</label>
            <input
              type="number"
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
              placeholder="0"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm
                         focus:outline-none focus:border-[#c4622d] focus:ring-1 focus:ring-[#c4622d]/30"
            />
          </div>
          <span className="text-gray-400 mt-5">—</span>
          <div className="flex-1">
            <label className="text-[0.68rem] font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Max ₹</label>
            <input
              type="number"
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
              placeholder="∞"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm
                         focus:outline-none focus:border-[#c4622d] focus:ring-1 focus:ring-[#c4622d]/30"
            />
          </div>
        </div>
      </FilterSection>

      {/* Availability */}
      <FilterSection title="Availability">
        <label className="flex items-center gap-3 cursor-pointer group">
          <div
            onClick={() => setInStockOnly(!inStockOnly)}
            className={`w-10 h-6 rounded-full transition-colors duration-200 relative flex-shrink-0 cursor-pointer
                        ${inStockOnly ? "bg-[#c4622d]" : "bg-gray-200"}`}
          >
            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200
                              ${inStockOnly ? "translate-x-5" : "translate-x-1"}`} />
          </div>
          <span className={`text-sm ${inStockOnly ? "text-[#c4622d] font-semibold" : "text-gray-600"}`}>
            In Stock Only
          </span>
        </label>
      </FilterSection>

      {/* Search */}
      <FilterSection title="Search" defaultOpen={false}>
        <input
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm
                     focus:outline-none focus:border-[#c4622d] focus:ring-1 focus:ring-[#c4622d]/30"
          value={search}
          placeholder="Search products..."
          onChange={(e) => setParam("search", e.target.value)}
        />
      </FilterSection>

      {/* Clear */}
      {activeFilters.length > 0 && (
        <div className="pt-3">
          <button
            onClick={clearAll}
            className="w-full py-2.5 rounded-lg border border-red-200 text-red-500 text-sm font-semibold
                       hover:bg-red-50 transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-3 md:px-6 py-5">

        {/* Page Header */}
        <div className="mb-5">
          <h1 className="text-xl md:text-2xl font-bold text-[#2c1a0e]">
            {category !== "All" ? category : "All Products"}
            {search && <span className="text-base font-normal text-gray-500 ml-2">for "{search}"</span>}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {loading ? "Loading..." : `${sortedProducts.length} result${sortedProducts.length !== 1 ? "s" : ""}`}
          </p>
        </div>

        {/* Active Filter Chips */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {activeFilters.map((f) => (
              <button
                key={f.label}
                onClick={f.clear}
                className="flex items-center gap-1.5 bg-[#c4622d]/10 text-[#c4622d]
                           font-semibold text-[0.75rem] px-3 py-1.5 rounded-full
                           hover:bg-[#c4622d]/20 transition-colors border border-[#c4622d]/20"
              >
                {f.label}
                <span className="font-bold text-[0.9rem] leading-none">×</span>
              </button>
            ))}
            <button
              onClick={clearAll}
              className="text-[0.75rem] text-gray-500 hover:text-red-500 font-semibold underline"
            >
              Clear all
            </button>
          </div>
        )}

        <div className="flex gap-5 items-start">

          {/* ── Sidebar (desktop) ── */}
          <aside className="hidden lg:block w-56 flex-shrink-0 sticky top-24
                            bg-white rounded-xl border border-gray-200 shadow-sm p-4 h-fit">
            <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-3">
              <h2 className="font-bold text-gray-900 text-sm uppercase tracking-wider">🔧 Filters</h2>
            </div>
            <SidebarContent />
          </aside>

          {/* ── Main Content ── */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="bg-white rounded-xl border border-gray-200 px-4 py-3
                            flex items-center gap-3 mb-4 flex-wrap">

              {/* Mobile filter toggle */}
              <button
                onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                className="lg:hidden flex items-center gap-1.5 text-sm font-semibold
                           text-gray-700 border border-gray-300 rounded-lg px-3 py-1.5
                           hover:border-[#c4622d] hover:text-[#c4622d] transition-colors"
              >
                🔧 Filters {activeFilters.length > 0 && (
                  <span className="bg-[#c4622d] text-white text-[0.65rem] rounded-full w-4 h-4
                                   flex items-center justify-center font-bold">
                    {activeFilters.length}
                  </span>
                )}
              </button>

              <span className="text-sm text-gray-500 flex-1">
                {sortedProducts.length} result{sortedProducts.length !== 1 ? "s" : ""}
              </span>

              {/* Sort */}
              <div className="flex items-center gap-2">
                <label className="text-[0.75rem] font-semibold text-gray-500 hidden md:block">Sort by:</label>
                <select
                  value={sort}
                  onChange={(e) => setParam("sort", e.target.value)}
                  className="text-sm border border-gray-300 rounded-lg px-3 py-2
                             focus:outline-none focus:border-[#c4622d] bg-white cursor-pointer"
                >
                  {sortOptions.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Mobile Filters Panel */}
            {mobileFiltersOpen && (
              <div className="lg:hidden bg-white rounded-xl border border-gray-200
                              shadow-sm p-4 mb-4">
                <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-3">
                  <h2 className="font-bold text-gray-900 text-sm uppercase tracking-wider">🔧 Filters</h2>
                  <button
                    onClick={() => setMobileFiltersOpen(false)}
                    className="text-gray-400 hover:text-gray-700 font-bold text-lg leading-none"
                  >
                    ×
                  </button>
                </div>
                <SidebarContent />
              </div>
            )}

            {/* Results */}
            {loading && <Spinner />}
            {error && (
              <div className="text-center py-20 text-red-500 text-sm">{error}</div>
            )}
            {!loading && !error && sortedProducts.length === 0 && (
              <div className="bg-white rounded-xl border border-gray-200 py-20 text-center">
                <div className="text-5xl mb-4">😕</div>
                <h3 className="font-bold text-gray-800 mb-1">No products found</h3>
                <p className="text-sm text-gray-500 mb-4">Try adjusting or clearing your filters.</p>
                <button
                  onClick={clearAll}
                  className="bg-[#c4622d] text-white font-bold text-sm px-5 py-2.5
                             rounded-lg hover:bg-[#e07a4a] transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            )}
            {!loading && !error && sortedProducts.length > 0 && (
              <ProductGrid products={sortedProducts} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
