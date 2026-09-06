import { useState } from "react";
import { ProductTable } from "./ProductTable";

export function AdminProductsTab({
  dashboard,
  onAddProduct,
  onEditProduct,
}) {
  const [productSearch, setProductSearch] = useState("");
  const [productCategoryFilter, setProductCategoryFilter] = useState("all");
  const [productSort, setProductSort] = useState("name-asc");

  const filteredProducts = (dashboard?.products || [])
    .filter((prod) => {
      const searchLower = productSearch.toLowerCase();
      const matchesSearch =
        (prod.name || "").toLowerCase().includes(searchLower) ||
        (prod.category || "").toLowerCase().includes(searchLower) ||
        (prod.seller?.name || "admin").toLowerCase().includes(searchLower);

      if (productCategoryFilter === "all") return matchesSearch;
      return matchesSearch && prod.category === productCategoryFilter;
    })
    .sort((a, b) => {
      if (productSort === "name-asc") {
        return (a.name || "").localeCompare(b.name || "");
      }
      if (productSort === "name-desc") {
        return (b.name || "").localeCompare(a.name || "");
      }
      if (productSort === "price-desc") {
        return (b.price ?? 0) - (a.price ?? 0);
      }
      if (productSort === "price-asc") {
        return (a.price ?? 0) - (b.price ?? 0);
      }
      return 0;
    });

  return (
    <>
      <div className="section-head mb-4">
        <h1 className="page-title">Products</h1>
        <button className="button button-primary" onClick={onAddProduct}>
          Add product
        </button>
      </div>

      {/* Search, Filter, and Sort Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 text-sm">
        <div className="flex-grow">
          <input
            type="text"
            placeholder="Search by product name, category, or seller..."
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#c4622d]"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={productCategoryFilter}
            onChange={(e) => setProductCategoryFilter(e.target.value)}
            className="border border-gray-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#c4622d] bg-white cursor-pointer"
          >
            <option value="all">All Categories</option>
            <option value="Pantry">Pantry</option>
            <option value="Beverages">Beverages</option>
            <option value="Home">Home</option>
            <option value="Personal Care">Personal Care</option>
            <option value="Health">Health</option>
          </select>
          <select
            value={productSort}
            onChange={(e) => setProductSort(e.target.value)}
            className="border border-gray-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#c4622d] bg-white cursor-pointer"
          >
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="price-desc">Price (High-Low)</option>
            <option value="price-asc">Price (Low-High)</option>
          </select>
        </div>
      </div>

      <ProductTable products={filteredProducts} onEdit={onEditProduct} />

      {filteredProducts.length === 0 && (
        <p className="text-sm text-gray-500 py-10 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
          No products match your search/filters.
        </p>
      )}
    </>
  );
}
