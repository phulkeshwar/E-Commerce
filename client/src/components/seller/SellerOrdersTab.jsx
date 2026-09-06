import { OrderTable } from "../admin/OrderTable";
import { Pagination } from "../ui/Pagination";

export function SellerOrdersTab({
  loadingOrders,
  ordersList,
  ordersPagination,
  setOrdersPage,
  onChatOrder,
  onUpdateOrderStatus,
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 stack">
      <h2 className="text-lg font-bold text-gray-900 mb-1">🛒 Order History</h2>
      <p className="text-xs text-gray-500 mb-4">View and update statuses for orders containing your products.</p>

      {loadingOrders ? (
        <p className="text-sm text-gray-500 py-6 text-center animate-pulse">Loading orders list...</p>
      ) : ordersList.length > 0 ? (
        <div className="stack gap-4">
          <OrderTable
            orders={ordersList}
            onChat={onChatOrder}
            onUpdateStatus={onUpdateOrderStatus}
          />
          <Pagination
            currentPage={ordersPagination.currentPage}
            totalPages={ordersPagination.totalPages}
            onPageChange={(p) => setOrdersPage(p)}
          />
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center text-gray-500 text-sm">
          No orders placed for your products yet. Keep building! 🚀
        </div>
      )}
    </div>
  );
}
