import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { statusColors } from "../constants/statusColors";
import { useAppContext } from "../hooks/useAppContext";
import { formatCurrency } from "../utils/formatCurrency";
import { formatDate } from "../utils/formatDate";
import { useDocumentMetadata } from "../hooks/useDocumentMetadata";
import { ReportModal } from "../components/ui/ReportModal";
import { InvoiceModal } from "../components/ui/InvoiceModal";
import { Pagination } from "../components/ui/Pagination";
import { Modal } from "../components/ui/Modal";
import { createReturnRequest } from "../api/return.api";
import { OrderChatDrawer } from "../components/ui/OrderChatDrawer";
import { scrollToTop } from "../utils/scrollToTop";

export function OrdersPage() {
  const navigate = useNavigate();
  const { orders, user, notify, cart, confirm } = useAppContext();
  const [trackingId, setTrackingId] = useState(null);
  const [chatOrder, setChatOrder] = useState(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState({ type: "seller", id: "", name: "" });
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [invoiceOrder, setInvoiceOrder] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [returnOrder, setReturnOrder] = useState(null);
  const [returnReason, setReturnReason] = useState("");
  const [returnItems, setReturnItems] = useState({});
  const [submittingReturn, setSubmittingReturn] = useState(false);
  const [returnModalOpen, setReturnModalOpen] = useState(false);

  useEffect(() => {
    orders.reload(currentPage, 5);
    scrollToTop({ behavior: "smooth" });
  }, [currentPage, orders.reload]);

  const handleOpenReturnModal = (order) => {
    setReturnOrder(order);
    const initialItems = {};
    order.items.forEach((item) => {
      const key = `${item.productId}-${item.variantName || ""}`;
      initialItems[key] = {
        productId: item.productId,
        name: item.name,
        quantity: item.quantity,
        variantName: item.variantName,
        selected: true,
      };
    });
    setReturnItems(initialItems);
    setReturnReason("");
    setReturnModalOpen(true);
  };

  useDocumentMetadata({
    title: "My Orders",
    description: "Track your orders, view shipping status, and browse purchase history on GaramBazaar."
  });

  if (user?.role === "seller") {
    return (
      <section className="page-content text-center py-20 bg-gray-50 min-h-screen">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 border border-amber-100">
          <span className="text-5xl">🏪</span>
          <h2 className="text-2xl font-black text-gray-900 mt-4 mb-2">Merchant Viewing Mode</h2>
          <p className="text-gray-500 text-sm mb-6">
            Sellers are restricted from purchasing products and viewing buyer order pages.
          </p>
          <button
            onClick={() => navigate("/seller")}
            className="w-full bg-[#c4622d] text-white font-bold py-3.5 px-6 rounded-xl hover:shadow-md transition-all text-sm"
          >
            Go to Seller Dashboard
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="page-content">
      <div className="orders-page">
        <h2>📦 My Orders</h2>
        {!orders.orders.length ? (
          <div className="empty-state">
            <p>📦</p>
            <h3>No orders yet</h3>
            <small>Your orders will appear here.</small>
          </div>
        ) : null}
        {orders.orders.map((order) => (
          <div className="order-card" key={order.id}>
            <div className="order-card-head">
              <div>
                <div className="order-meta">
                  Order ID: <strong>{order.id}</strong>
                </div>
                <div className="order-meta">Placed on {formatDate(order.createdAt)}</div>
              </div>
              <span className={`order-status ${statusColors[order.status] || ""}`}>{order.status}</span>
            </div>
            <div className="order-card-body">
              <div className="order-items">
                {order.items
                  .map((item) => `${item.name}${item.variantName ? ` (${item.variantName})` : ""}`)
                  .join(" · ")}
              </div>
              <div className="order-footer">
                <span className="order-total">{formatCurrency(order.total)}</span>
                <div className="flex gap-2 items-center flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      const itemsToRestore = order.items.map((item) => ({
                        id: item.productId,
                        name: item.name,
                        price: item.price,
                        variantName: item.variantName,
                        quantity: item.quantity,
                        emoji: item.emoji || "📦",
                      }));
                      cart.bulkAddToCart(itemsToRestore);
                      notify("Items added to your cart!");
                      navigate("/cart");
                    }}
                    className="px-3 py-1.5 bg-[#c4622d] text-white rounded-lg text-xs font-bold hover:bg-[#e07a4a] transition-all cursor-pointer"
                  >
                    🔁 Buy Again
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setInvoiceOrder(order);
                      setInvoiceModalOpen(true);
                    }}
                    className="px-3 py-1.5 border border-[#c4622d]/30 text-[#c4622d] rounded-lg text-xs font-semibold hover:bg-amber-50/10 transition-all cursor-pointer bg-white"
                  >
                    📄 Invoice
                  </button>
                  {order.status === "Delivered" && (
                    <button
                      type="button"
                      onClick={() => handleOpenReturnModal(order)}
                      className="px-3 py-1.5 border border-purple-200 text-purple-600 rounded-lg text-xs font-semibold hover:bg-purple-50 transition-all cursor-pointer bg-white"
                    >
                      ↩️ Request Return
                    </button>
                  )}
                  {order.status === "Processing" && (
                    <button
                      type="button"
                      onClick={async () => {
                        if (await confirm("Are you sure you want to cancel this order?")) {
                          try {
                            await orders.cancelOrder(order.id);
                            notify("Order cancelled successfully.");
                          } catch (err) {
                            notify(err.message || "Failed to cancel order.");
                          }
                        }
                      }}
                      className="px-3 py-1.5 border border-red-200 text-red-500 rounded-lg text-xs font-semibold hover:text-red-700 hover:bg-red-50 transition-all cursor-pointer bg-white"
                    >
                      ❌ Cancel Order
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setReportTarget({ type: "seller", id: order.id, name: `Order #${order.id}` });
                      setReportModalOpen(true);
                    }}
                    className="px-3 py-1.5 border border-gray-200 text-gray-500 rounded-lg text-xs font-semibold hover:text-red-650 hover:border-red-200 hover:bg-red-50/10 transition-all cursor-pointer bg-white"
                  >
                    ⚠️ Report Issue
                  </button>
                  <button
                    type="button"
                    onClick={() => setChatOrder(order)}
                    className="px-3 py-1.5 border border-[#c4622d]/30 text-[#c4622d] rounded-lg text-xs font-semibold hover:bg-amber-50/10 transition-all cursor-pointer bg-white"
                  >
                    💬 Message Seller
                  </button>
                  <button
                    className="track-btn"
                    onClick={() => setTrackingId((current) => (current === order.id ? null : order.id))}
                  >
                    {trackingId === order.id ? "Hide Tracking ▲" : "Track Order ▼"}
                  </button>
                </div>
              </div>
            </div>
            {trackingId === order.id ? (
              <div className="track-panel mt-4 border-t border-gray-150 bg-warm/30 p-6 rounded-xl">
                {/* Visual Progress Bar Header */}
                <div className="mb-5 flex justify-between items-center gap-2">
                  <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Order Milestones</h4>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${statusColors[order.status] || "bg-gray-100 text-gray-700"}`}>
                    {order.status}
                  </span>
                </div>

                {/* Visual Progress Bar (Horizontal) */}
                <div className="relative mb-8 mt-2 px-6">
                  {/* Background track line */}
                  <div className="absolute top-3 left-6 right-6 h-[3px] bg-gray-200 -translate-y-1/2 rounded-full" />
                  {/* Fill track line based on percentage */}
                  <div 
                    className="absolute top-3 left-6 h-[3px] bg-[#c4622d] -translate-y-1/2 rounded-full transition-all duration-500 ease-out" 
                    style={{ width: `${getProgressPercentage(order)}%` }}
                  />
                  
                  {/* Milestones nodes */}
                  <div className="relative flex justify-between items-center">
                    {getMilestonesForOrder(order).map((m, idx) => {
                      const completed = order.statusHistory.some((h) => h.status === m.status);
                      const isCurrent = order.status === m.status;
                      return (
                        <div key={m.status} className="flex flex-col items-center relative z-10">
                          <div 
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border-2 transition-all duration-300 ${
                              completed
                                ? "bg-[#c4622d] border-[#c4622d] text-white shadow-sm"
                                : isCurrent
                                ? "bg-amber-50 border-[#c4622d] text-[#c4622d] scale-110"
                                : "bg-white border-gray-200 text-gray-400"
                            }`}
                          >
                            {completed ? "✓" : idx + 1}
                          </div>
                          <span className={`text-[9px] font-extrabold mt-2 tracking-wide uppercase ${
                            isCurrent ? "text-[#c4622d]" : completed ? "text-gray-700" : "text-gray-400"
                          }`}>
                            {m.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Detailed Status Logs */}
                <div className="border-t border-gray-200/50 pt-5 mt-6">
                  <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-gray-405 mb-5">Journey Timeline</h4>
                  <div className="relative border-l border-dashed border-gray-300 ml-4 space-y-6">
                    {order.statusHistory && order.statusHistory.length > 0 ? (
                      [...order.statusHistory].reverse().map((history, idx) => {
                        const config = getStatusTimelineConfig(history.status);
                        return (
                          <div key={idx} className="relative pl-7 transition-all duration-300 hover:translate-x-0.5">
                            {/* Marker Icon Dot */}
                            <div 
                              className={`absolute left-0 top-1 -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-sm border bg-white ${config.borderColor}`}
                            >
                              {config.icon}
                            </div>
                            {/* Milestone Content Box */}
                            <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-gray-150 shadow-sm transition-all duration-300 hover:shadow-md hover:border-amber-200">
                              <div className="flex justify-between items-center mb-1.5 flex-wrap gap-2">
                                <span className={`text-[9px] font-black tracking-wider uppercase px-2.5 py-0.5 rounded-full ${config.badgeClass}`}>
                                  {history.status}
                                </span>
                                <span className="text-[10px] text-gray-400 font-bold">
                                  {new Date(history.updatedAt).toLocaleString(undefined, {
                                    dateStyle: "medium",
                                    timeStyle: "short",
                                  })}
                                </span>
                              </div>
                              <p className="text-xs text-gray-700 leading-relaxed font-bold">
                                {history.note || `Your order status changed to ${history.status}.`}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="pl-6 text-xs text-gray-400 italic">No activity logs recorded yet.</div>
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        ))}
      </div>
        {orders.pagination && (
          <Pagination
            currentPage={orders.pagination.currentPage}
            totalPages={orders.pagination.totalPages}
            onPageChange={(p) => setCurrentPage(p)}
          />
        )}
      {/* Report Modal */}
      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        reportType={reportTarget.type}
        targetId={reportTarget.id}
        targetName={reportTarget.name}
      />
      {/* Invoice Modal */}
      <InvoiceModal
        isOpen={invoiceModalOpen}
        onClose={() => setInvoiceModalOpen(false)}
        order={invoiceOrder}
      />

      {/* Return Request Modal */}
      {returnModalOpen && returnOrder && (
        <Modal title={`Return Request - Order #${returnOrder.orderNumber || returnOrder.id}`} onClose={() => setReturnModalOpen(false)}>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const itemsToReturn = Object.values(returnItems)
                .filter((i) => i.selected)
                .map((i) => ({
                  productId: i.productId,
                  name: i.name,
                  quantity: i.quantity,
                  variantName: i.variantName,
                }));

              if (itemsToReturn.length === 0) {
                notify("Please select at least one item to return.");
                return;
              }

              if (!returnReason.trim()) {
                notify("Please provide a reason for the return.");
                return;
              }

              setSubmittingReturn(true);
              try {
                await createReturnRequest({
                  orderNumber: returnOrder.orderNumber || returnOrder.id,
                  items: itemsToReturn,
                  reason: returnReason.trim(),
                });
                notify("Return request submitted successfully. We will notify you once it's reviewed!");
                setReturnModalOpen(false);
                orders.reload(currentPage, 5);
              } catch (err) {
                notify(err.message || "Failed to submit return request.");
              } finally {
                setSubmittingReturn(false);
              }
            }}
            className="p-5 space-y-4 text-left max-w-md"
          >
            <p className="text-xs text-gray-500">
              Select items and quantities you wish to return, and provide a clear reason.
            </p>

            <div className="space-y-2.5 max-h-40 overflow-y-auto pr-1">
              {Object.keys(returnItems).map((key) => {
                const item = returnItems[key];
                return (
                  <div key={key} className="flex items-center justify-between border-b border-gray-100 pb-2 text-xs">
                    <label className="flex items-center gap-2 font-semibold text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={item.selected}
                        onChange={(e) =>
                          setReturnItems((c) => ({
                            ...c,
                            [key]: { ...c[key], selected: e.target.checked },
                          }))
                        }
                      />
                      <span>
                        {item.name} {item.variantName ? `(${item.variantName})` : ""}
                      </span>
                    </label>

                    {item.selected && (
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-gray-400">Qty:</span>
                        <input
                          type="number"
                          min="1"
                          max={
                            returnOrder.items.find(
                              (oi) =>
                                oi.productId === item.productId &&
                                (oi.variantName || "") === (item.variantName || "")
                            )?.quantity || 1
                          }
                          value={item.quantity}
                          onChange={(e) =>
                            setReturnItems((c) => ({
                              ...c,
                              [key]: { ...c[key], quantity: Math.max(1, Number(e.target.value)) },
                            }))
                          }
                          className="w-12 border border-gray-300 rounded px-1.5 py-0.5 text-center font-bold text-gray-800 bg-white"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="field block">
              <span className="field-label text-xs font-bold text-gray-650 block mb-1">Reason for Return</span>
              <textarea
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                placeholder="e.g. Items received damaged, wrong item shipped, or quality issues"
                className="input textarea text-xs h-20"
                required
              />
            </div>

            <div className="modal-actions pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setReturnModalOpen(false)}
                className="px-4 py-2 border border-gray-200 text-gray-500 rounded-xl text-xs font-semibold hover:bg-gray-50 transition-all cursor-pointer bg-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingReturn}
                className="px-4 py-2 bg-[#c4622d] text-white rounded-xl text-xs font-bold hover:bg-[#e07a4a] transition-all cursor-pointer disabled:opacity-50"
              >
                {submittingReturn ? "Submitting..." : "Submit Return"}
              </button>
            </div>
          </form>
        </Modal>
      )}
      {chatOrder && (
        <OrderChatDrawer
          orderId={chatOrder.id}
          orderNumber={chatOrder.orderNumber || chatOrder.id}
          recipientId={null}
          onClose={() => setChatOrder(null)}
        />
      )}
    </section>
  );
}

// Timeline Helper Functions
function getProgressPercentage(order) {
  const status = order.status;
  if (status === "Cancelled" || status === "Returned") return 100;
  
  const historyStatuses = order.statusHistory.map(h => h.status);
  let completedCount = 0;
  const milestones = ["Processing", "On the Way", "Delivered"];
  milestones.forEach((m) => {
    if (historyStatuses.includes(m)) completedCount++;
  });
  
  if (completedCount <= 1) return 0;
  return ((completedCount - 1) / (milestones.length - 1)) * 100;
}

function getMilestonesForOrder(order) {
  if (order.status === "Cancelled") {
    return [
      { status: "Processing", label: "Processing" },
      { status: "Cancelled", label: "Cancelled" },
    ];
  }
  if (order.status === "Returned") {
    return [
      { status: "Processing", label: "Processing" },
      { status: "Delivered", label: "Delivered" },
      { status: "Returned", label: "Returned" },
    ];
  }
  return [
    { status: "Processing", label: "Processing" },
    { status: "On the Way", label: "On the Way" },
    { status: "Delivered", label: "Delivered" },
  ];
}

function getStatusTimelineConfig(status) {
  switch (status) {
    case "Processing":
      return {
        icon: "📦",
        borderColor: "border-blue-200 text-blue-600",
        badgeClass: "bg-blue-50 text-blue-700 border border-blue-150",
      };
    case "On the Way":
      return {
        icon: "🚚",
        borderColor: "border-amber-200 text-amber-600",
        badgeClass: "bg-amber-50 text-amber-700 border border-amber-150",
      };
    case "Delivered":
      return {
        icon: "🥳",
        borderColor: "border-green-200 text-green-600",
        badgeClass: "bg-green-50 text-green-700 border border-green-150",
      };
    case "Cancelled":
      return {
        icon: "❌",
        borderColor: "border-red-200 text-red-600",
        badgeClass: "bg-red-50 text-red-700 border border-red-150",
      };
    case "Returned":
      return {
        icon: "↩️",
        borderColor: "border-purple-200 text-purple-600",
        badgeClass: "bg-purple-50 text-purple-700 border border-purple-150",
      };
    default:
      return {
        icon: "📌",
        borderColor: "border-gray-200 text-gray-600",
        badgeClass: "bg-gray-50 text-gray-700 border border-gray-150",
      };
  }
}
