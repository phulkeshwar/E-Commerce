import { useEffect, useState } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import { useDocumentMetadata } from "../hooks/useDocumentMetadata";
import { getOrderByIdRequest } from "../api/orders.api";
import { InvoiceModal } from "../components/ui/InvoiceModal";
import { formatCurrency } from "../utils/formatCurrency";
import { formatDate } from "../utils/formatDate";
import { statusColors } from "../constants/statusColors";

// Helper function to dynamically load html2pdf and generate/download invoice PDF
function downloadInvoicePDF(order) {
  return new Promise((resolve, reject) => {
    const scriptUrl = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
    const trackingLink = `${window.location.origin}/order-success/${order.orderNumber}`;

    const run = () => {
      const element = document.createElement("div");
      element.style.padding = "35px";
      element.style.fontFamily = "system-ui, -apple-system, sans-serif";
      element.style.color = "#1f2937";
      element.style.backgroundColor = "#ffffff";
      element.style.fontSize = "11px";
      element.style.lineHeight = "1.5";
      
      const lineItemsHtml = order.items.map((item, idx) => `
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 10px 8px; text-align: center; color: #6b7280;">${idx + 1}</td>
          <td style="padding: 10px 8px; font-weight: 700; color: #111827;">${item.emoji || "📦"} ${item.name} ${item.variantName ? `(${item.variantName})` : ""}</td>
          <td style="padding: 10px 8px; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px 8px; text-align: right;">₹${item.price}</td>
          <td style="padding: 10px 8px; text-align: right; font-weight: 700; color: #111827;">₹${item.price * item.quantity}</td>
        </tr>
      `).join("");

      element.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #e5e7eb; padding-bottom: 20px; margin-bottom: 20px;">
          <div>
            <h1 style="color: #c4622d; margin: 0; font-size: 24px; font-weight: 900; letter-spacing: -0.5px;">GaramBazaar</h1>
            <p style="margin: 4px 0 0 0; font-size: 9px; color: #4b5563; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">India's Finest Everyday Essentials</p>
            <p style="margin: 2px 0 0 0; font-size: 9px; color: #9ca3af;">Sourced direct from local farmers & self-help groups</p>
          </div>
          <div style="text-align: right;">
            <h2 style="margin: 0; font-size: 16px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; color: #111827;">Tax Invoice</h2>
            <p style="margin: 4px 0 0 0; font-size: 11px; color: #374151;">Invoice No: <strong>INV-${order.orderNumber}</strong></p>
            <p style="margin: 2px 0 0 0; font-size: 10px; color: #6b7280;">Date: ${new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td style="width: 50%; vertical-align: top; padding-right: 20px;">
              <h4 style="color: #c4622d; margin: 0 0 6px 0; font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">Shipping & Billing Address</h4>
              <p style="margin: 0; font-weight: 800; font-size: 12px; color: #111827;">${order.shippingAddress.name}</p>
              <p style="margin: 4px 0 0 0; color: #4b5563;">${order.shippingAddress.line1}</p>
              <p style="margin: 2px 0 0 0; color: #4b5563;">${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}</p>
              <p style="margin: 6px 0 0 0; font-weight: 700; color: #1f2937;">📞 ${order.shippingAddress.phone}</p>
            </td>
            <td style="width: 50%; vertical-align: top; text-align: right;">
              <h4 style="color: #c4622d; margin: 0 0 6px 0; font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">Transaction & Payment</h4>
              <p style="margin: 0; color: #4b5563;">Order Ref: <strong style="color: #111827;">${order.orderNumber}</strong></p>
              <p style="margin: 3px 0 0 0; color: #4b5563;">Payment Type: <strong style="color: #111827;">${order.payment.method.toUpperCase()}</strong></p>
              <p style="margin: 3px 0 0 0; color: #4b5563;">Payment Status: <strong style="color: ${order.payment.status === "paid" ? "#10b981" : "#d97706"}; text-transform: uppercase;">${order.payment.status}</strong></p>
            </td>
          </tr>
        </table>

        <table style="width: 100%; border-collapse: collapse; font-size: 10px; margin-bottom: 25px;">
          <thead>
            <tr style="background-color: #f9fafb; border-bottom: 2px solid #e5e7eb; font-weight: 800; color: #374151;">
              <th style="padding: 8px; text-align: center; width: 30px;">#</th>
              <th style="padding: 8px; text-align: left;">Item Description</th>
              <th style="padding: 8px; text-align: center; width: 50px;">Qty</th>
              <th style="padding: 8px; text-align: right; width: 80px;">Unit Price</th>
              <th style="padding: 8px; text-align: right; width: 100px;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${lineItemsHtml}
          </tbody>
        </table>

        <div style="display: flex; justify-content: flex-end; margin-bottom: 35px;">
          <table style="width: 240px; font-size: 11px; line-height: 1.8; border-collapse: collapse;">
            <tr style="color: #4b5563;">
              <td style="padding: 3px 0;">Subtotal:</td>
              <td style="padding: 3px 0; text-align: right;">₹${order.subtotal}</td>
            </tr>
            ${order.discount > 0 ? `
              <tr style="color: #10b981; font-weight: 700;">
                <td style="padding: 3px 0;">Discount (${order.couponCode}):</td>
                <td style="padding: 3px 0; text-align: right;">-₹${order.discount}</td>
              </tr>
            ` : ""}
            <tr style="color: #4b5563;">
              <td style="padding: 3px 0;">Delivery Charge:</td>
              <td style="padding: 3px 0; text-align: right;">₹${order.shippingFee}</td>
            </tr>
            <tr style="font-weight: 900; font-size: 13px; border-top: 1px dashed #d1d5db; color: #111827;">
              <td style="padding: 8px 0 0 0;">Grand Total:</td>
              <td style="padding: 8px 0 0 0; text-align: right; color: #c4622d;">₹${order.total}</td>
            </tr>
          </table>
        </div>

        <div style="border-top: 1px solid #e5e7eb; padding-top: 15px; margin-top: 40px; display: flex; justify-content: space-between; align-items: center; font-size: 9px; color: #9ca3af;">
          <div>
            <p style="margin: 0;">💻 This is a computer generated invoice and requires no physical signature.</p>
            <p style="margin: 2px 0 0 0;">Thank you for supporting sustainable farming with GaramBazaar!</p>
          </div>
          <div style="text-align: right;">
            <p style="margin: 0; font-weight: 800; text-transform: uppercase; color: #4b5563; font-size: 7px; letter-spacing: 0.5px;">Authorized Signatory</p>
            <p style="margin: 4px 0 0 0; color: #c4622d; font-weight: 900; font-size: 13px; font-family: Georgia, serif;">GaramBazaar</p>
          </div>
        </div>

        <div style="border: 1px dashed #fcd34d; background-color: #fffbeb; padding: 12px; border-radius: 12px; margin-top: 25px; text-align: center;">
          <p style="margin: 0; font-weight: 800; color: #b45309; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px;">🔗 Live Delivery Tracking Link</p>
          <p style="margin: 4px 0 0 0; font-family: monospace; font-size: 9px; color: #4b5563; word-break: break-all;"><a href="${trackingLink}" style="color: #c4622d; text-decoration: underline;">${trackingLink}</a></p>
        </div>
      `;

      const opt = {
        margin: 10,
        filename: `GaramBazaar_Invoice_${order.orderNumber}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
      };

      window.html2pdf().from(element).set(opt).save().then(resolve).catch(reject);
    };

    if (window.html2pdf) {
      run();
    } else {
      const script = document.createElement("script");
      script.src = scriptUrl;
      script.onload = run;
      script.onerror = reject;
      document.body.appendChild(script);
    }
  });
}

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

export function OrderSuccessPage() {
  const { orderId } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  // Check if order was just placed in this flow session
  const justPlaced = location.state?.justPlaced || false;
  const guestTokenFromState = location.state?.guestAccessToken;
  const guestToken =
    guestTokenFromState ||
    sessionStorage.getItem(`garambazaar_guest_token_${orderId}`) ||
    localStorage.getItem(`garambazaar_guest_token_${orderId}`);

  useDocumentMetadata({
    title: "Order Success",
    description: "Thank you for shopping at GaramBazaar! Your order is being processed.",
    noindex: true
  });

  useEffect(() => {
    getOrderByIdRequest(orderId, guestToken)
      .then((data) => {
        if (data && data.order) {
          setOrder(data.order);
        }
      })
      .catch((err) => {
        console.error("Failed to load order details:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [orderId, guestToken]);

  useEffect(() => {
    if (order && !downloaded && justPlaced) {
      setDownloaded(true);
      downloadInvoicePDF(order);
    }
  }, [order, downloaded, justPlaced]);

  return (
    <section className="page-content success-card min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl border border-gray-150 overflow-hidden p-6 md:p-10 text-center">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-6 shadow-sm border border-emerald-100 animate-bounce">
          🎉
        </div>
        <p className="eyebrow uppercase tracking-widest text-xs font-black text-[#c4622d] mb-2">Order Confirmed</p>
        <h1 className="text-xl md:text-3xl font-black text-gray-950 mb-3">{orderId}</h1>
        <p className="text-gray-500 text-sm leading-relaxed mb-6">
          Thank you for your purchase! Your invoice has been downloaded automatically as PDF. You can bookmark this page to track your order details and delivery status anytime.
        </p>

        <div className="flex flex-wrap gap-3 justify-center mb-8 border-b border-gray-100 pb-8">
          <Link className="px-5 py-2.5 bg-[#c4622d] hover:bg-[#e07a4a] text-white font-bold rounded-xl text-xs transition-colors shadow-sm cursor-pointer border-0" to="/shop">
            🛍️ Continue Shopping
          </Link>
          {loading ? (
            <span className="text-xs text-gray-400 self-center">Loading Invoice...</span>
          ) : order ? (
            <button
              type="button"
              onClick={() => setInvoiceModalOpen(true)}
              className="px-5 py-2.5 bg-white border border-gray-200 hover:border-[#c4622d] hover:bg-orange-50/20 text-gray-800 font-bold rounded-xl text-xs transition-colors shadow-sm cursor-pointer"
            >
              📄 View Invoice
            </button>
          ) : null}
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-10">
            <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : order ? (
          <div className="text-left bg-gray-50/50 rounded-2xl border border-gray-200 p-5 md:p-8">
            <div className="mb-6 flex justify-between items-center gap-2 flex-wrap">
              <h3 className="m-0 text-sm font-black uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                <span>📍</span> Shipping Status
              </h3>
              <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${statusColors[order.status] || "bg-gray-150 text-gray-805"}`}>
                {order.status}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="relative mb-8 mt-4 px-4">
              <div className="absolute top-3 left-4 right-4 h-[3px] bg-gray-200 -translate-y-1/2 rounded-full" />
              <div 
                className="absolute top-3 left-4 h-[3px] bg-[#c4622d] -translate-y-1/2 rounded-full transition-all duration-500" 
                style={{ width: `${getProgressPercentage(order)}%` }}
              />
              <div className="relative flex justify-between items-center">
                {getMilestonesForOrder(order).map((m, idx) => {
                  const completed = order.statusHistory.some((h) => h.status === m.status);
                  const isCurrent = order.status === m.status;
                  return (
                    <div key={m.status} className="flex flex-col items-center relative z-10">
                      <div 
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border-2 transition-all ${
                          completed
                            ? "bg-[#c4622d] border-[#c4622d] text-white"
                            : isCurrent
                            ? "bg-amber-50 border-[#c4622d] text-[#c4622d] scale-110 shadow-sm"
                            : "bg-white border-gray-200 text-gray-400"
                        }`}
                      >
                        {completed ? "✓" : idx + 1}
                      </div>
                      <span className={`text-[9px] font-bold mt-2 tracking-wide uppercase ${
                        isCurrent ? "text-[#c4622d]" : completed ? "text-gray-700" : "text-gray-400"
                      }`}>
                        {m.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Travel Timeline */}
            <div className="border-t border-gray-200/60 pt-5 mt-6">
              <h4 className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-4">Journey Timeline</h4>
              <div className="relative border-l border-dashed border-gray-300 ml-4 space-y-5">
                {[...order.statusHistory].reverse().map((history, idx) => {
                  const config = getStatusTimelineConfig(history.status);
                  return (
                    <div key={idx} className="relative pl-7">
                      <div className="absolute left-0 top-1.5 -translate-x-1/2 w-4 h-4 bg-white rounded-full flex items-center justify-center border border-gray-200 shadow-sm text-[8px]">
                        {config.icon}
                      </div>
                      <p className="text-xs font-bold text-gray-900 leading-tight m-0">{history.status}</p>
                      <p className="text-[10px] text-gray-500 m-0 leading-normal">{formatDate(history.updatedAt)}</p>
                      {history.note && <p className="text-[10px] text-gray-400 italic mt-0.5 leading-normal">Note: {history.note}</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-red-500 text-sm font-semibold">Failed to fetch order details. Please bookmark this URL for future tracking.</p>
        )}
      </div>

      {order && (
        <InvoiceModal
          isOpen={invoiceModalOpen}
          onClose={() => setInvoiceModalOpen(false)}
          order={order}
        />
      )}
    </section>
  );
}
