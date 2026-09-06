import { Pagination } from "../ui/Pagination";
import { formatCurrency } from "../../utils/formatCurrency";

export function SellerProductsTab({
  searchQuery,
  setSearchQuery,
  onAddNewProduct,
  loadingProducts,
  filteredProducts,
  productsPagination,
  setProductsPage,
  onEditProduct,
  onDeleteProduct,
}) {
  return (
    <>
      <div className="section-head flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search my products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#c4622d] transition-all bg-white"
          />
        </div>
        <button
          className="button button-primary bg-[#c4622d] hover:bg-[#a95223] text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm flex items-center gap-1.5 border-0 cursor-pointer"
          onClick={onAddNewProduct}
        >
          ➕ Add New Product
        </button>
      </div>

      {loadingProducts ? (
        <p className="text-sm text-gray-500 py-6 text-center animate-pulse">Loading products list...</p>
      ) : filteredProducts.length > 0 ? (
        <div className="table-card bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-4">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => {
                const hasImage = product.images?.[0]?.url;
                const hasLowStockVariant = product.variants && product.variants.some((v) => v.stockCount < 5);
                const isLowStock = product.stockCount < 5 || hasLowStockVariant;
                return (
                  <tr key={product.id}>
                    <td className="font-semibold text-gray-900">
                      <div className="flex items-center gap-3">
                        {hasImage ? (
                          <img
                            src={product.images[0].url}
                            alt={product.name}
                            className="w-10 h-10 object-cover rounded-lg border border-gray-200 shadow-sm shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center text-xl shadow-sm shrink-0 select-none">
                            {product.emoji || "📦"}
                          </div>
                        )}
                        <span className="truncate max-w-[200px]">{product.name}</span>
                      </div>
                    </td>
                    <td>
                      <span className="bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-full font-medium">
                        {product.category}
                      </span>
                    </td>
                    <td className="font-bold text-gray-800">{formatCurrency(product.price)}</td>
                    <td className="text-gray-600">
                      <div className="flex flex-col gap-1">
                        {product.stockCount > 0 ? (
                          <span className="text-green-600 font-bold">{product.stockCount} in stock</span>
                        ) : (
                          <span className="text-red-500 font-bold">Out of stock</span>
                        )}
                        {isLowStock && (
                          <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 text-[10px] px-2 py-0.5 rounded-full font-bold w-fit animate-pulse">
                            ⚠️ Low Stock
                          </span>
                        )}
                        {product.variants && product.variants.length > 0 && (
                          <div className="text-[10px] text-gray-400 mt-1">
                            {product.variants.map((v) => (
                              <div key={v.name} className={v.stockCount < 5 ? "text-red-500 font-semibold" : ""}>
                                {v.name}: {v.stockCount} left
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="text-right">
                      <div className="inline-flex gap-2">
                        <button
                          className="bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold py-1.5 px-3 rounded-lg text-xs transition-colors border-0 cursor-pointer"
                          onClick={() => onEditProduct(product)}
                        >
                          Edit
                        </button>
                        <button
                          className="bg-red-50 hover:bg-red-100 text-red-600 font-bold py-1.5 px-3 rounded-lg text-xs transition-colors border-0 cursor-pointer"
                          onClick={() => onDeleteProduct(product.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <Pagination
            currentPage={productsPagination.currentPage}
            totalPages={productsPagination.totalPages}
            onPageChange={(p) => setProductsPage(p)}
          />
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center text-gray-500 text-sm mt-4">
          {searchQuery ? "No products match your search query." : "You haven't listed any products yet. Click Add Product to begin!"}
        </div>
      )}
    </>
  );
}
