import { formatCurrency } from "../../utils/formatCurrency";

export function ProductTable({ products, onEdit }) {
  return (
    <div className="table-card overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 border-b-2 border-gray-200">
            <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">Product</th>
            <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">Category</th>
            <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">Price</th>
            <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">Stock</th>
            <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">Seller</th>
            <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">Action</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => {
            const hasImage = product.images?.[0]?.url;
            return (
              <tr key={product.id} className="hover:bg-amber-50/40 transition-colors">
                <td className="!py-3 !px-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    {hasImage ? (
                      <img
                        src={product.images[0].url}
                        alt={product.name}
                        className="w-10 h-10 object-cover rounded-lg border border-gray-200 shadow-sm shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center shadow-sm shrink-0">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                    )}
                    <span className="truncate max-w-[200px] font-semibold text-gray-900">{product.name}</span>
                  </div>
                </td>
                <td className="!py-3 !px-4 text-gray-600 whitespace-nowrap">{product.category}</td>
                <td className="!py-3 !px-4 font-bold text-gray-800 whitespace-nowrap">{formatCurrency(product.price)}</td>
                <td className="!py-3 !px-4 whitespace-nowrap">
                  {product.stockCount > 0 ? (
                    <span className="text-green-600 font-bold">{product.stockCount}</span>
                  ) : (
                    <span className="text-red-500 font-bold">0</span>
                  )}
                </td>
                <td className="!py-3 !px-4 text-xs text-gray-600 font-semibold whitespace-nowrap">{product.seller?.name || "Admin"}</td>
                <td className="!py-3 !px-4">
                  <button className="link-button font-bold text-amber-700 hover:text-amber-900 whitespace-nowrap" onClick={() => onEdit(product)}>
                    Edit
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
