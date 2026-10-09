import { createPortal } from "react-dom";
import { formatCurrency } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/formatDate";

export function InvoiceModal({ isOpen, onClose, order }) {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const getPaymentMethodLabel = (method) => {
    switch (method) {
      case "cod":
        return "Cash on Delivery (COD)";
      case "upi":
        return "UPI (PhonePe, GPay, Paytm)";
      case "card":
        return "Credit / Debit Card";
      case "netbanking":
        return "Net Banking";
      default:
        return String(method || "cod").toUpperCase();
    }
  };

  const modalContent = (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="modal-card !max-w-[760px] !p-0 overflow-hidden flex flex-col"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Modal Controls (Hidden during print) */}
        <div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-b border-gray-200 print:hidden">
          <h3 className="font-extrabold text-sm text-[#2c1a0e] flex items-center gap-1.5">
            <span>📄</span> Order Invoice
          </h3>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="bg-[#c4622d] hover:bg-[#e07a4a] text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors shadow-sm flex items-center gap-1 cursor-pointer border-0"
            >
              🖨️ Print / Save PDF
            </button>
            <button 
              className="text-gray-400 hover:text-gray-600 font-black text-xl bg-transparent border-0 cursor-pointer"
              onClick={onClose}
            >
              ×
            </button>
          </div>
        </div>

        {/* Printable Invoice Container */}
        <div 
          id="invoice-print-area" 
          className="p-6 md:p-10 bg-white text-gray-800 text-xs overflow-y-auto leading-relaxed stack"
        >
          {/* Invoice Header */}
          <div className="flex justify-between items-start gap-4 border-b-2 border-gray-200 pb-5">
            <div>
              <div className="flex items-center gap-1 mb-1.5">
                <span className="text-[#c4622d] text-2xl">🛒</span>
                <span className="text-lg font-black text-gray-900 tracking-tight">
                  Garam<span className="text-[#c4622d]">Bazaar</span>
                </span>
              </div>
              <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">India's Finest Everyday Essentials</p>
              <p className="text-gray-400 mt-1">Sourced direct from local farmers & self-help groups</p>
            </div>
            <div className="text-right">
              <h2 className="text-lg font-extrabold text-gray-900 uppercase tracking-widest mb-1.5">Tax Invoice</h2>
              <p className="text-gray-600">Invoice No: <strong className="text-gray-950 font-bold">INV-{order.orderNumber}</strong></p>
              <p className="text-gray-400">Date: {formatDate(order.createdAt)}</p>
            </div>
          </div>

          {/* Billing and Payment metadata grids */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-5 border-b border-gray-100 text-[11px]">
            {/* Shipping Address */}
            <div className="space-y-1">
              <h4 className="font-extrabold text-gray-900 uppercase tracking-wider text-[10px] text-[#c4622d] mb-1.5">Shipping & Billing Address</h4>
              <p className="font-bold text-gray-950 text-xs">{order.shippingAddress.name}</p>
              <p className="text-gray-600">{order.shippingAddress.line1}</p>
              <p className="text-gray-600">
                {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
              </p>
              <p className="text-gray-500 font-medium mt-1">📞 {order.shippingAddress.phone}</p>
            </div>

            {/* Payment Details */}
            <div className="space-y-1">
              <h4 className="font-extrabold text-gray-900 uppercase tracking-wider text-[10px] text-[#c4622d] mb-1.5">Transaction & Payment Details</h4>
              <p className="text-gray-600">Order Ref: <strong className="text-gray-900">{order.orderNumber}</strong></p>
              <p className="text-gray-600">Payment Type: <strong className="text-gray-900">{getPaymentMethodLabel(order.payment.method)}</strong></p>
              <p className="text-gray-600">
                Payment Status:{" "}
                <span className={`font-bold capitalize ${order.payment.status === "paid" ? "text-emerald-600" : "text-amber-600"}`}>
                  {order.payment.status}
                </span>
              </p>
              {order.payment.razorpayPaymentId && (
                <p className="text-gray-600">Transaction ID: <code className="bg-gray-50 border border-gray-200 px-1 py-0.5 rounded font-mono text-[10px] text-gray-800">{order.payment.razorpayPaymentId}</code></p>
              )}
              <p className="text-gray-600 mt-2 pt-1 border-t border-gray-100/50">
                Live Tracking: <a href={`${window.location.origin}/order-success/${order.orderNumber}`} className="text-[#c4622d] font-bold hover:underline" target="_blank" rel="noreferrer">{`${window.location.origin}/order-success/${order.orderNumber}`}</a>
              </p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="py-5">
            <table className="w-full text-left border-collapse text-[11px]">
              <thead>
                <tr className="border-b border-gray-300 text-gray-950 font-bold bg-gray-50/50">
                  <th className="py-2 px-3 text-center w-12">#</th>
                  <th className="py-2 px-3">Item Description</th>
                  <th className="py-2 px-3 text-center w-16">Qty</th>
                  <th className="py-2 px-3 text-right w-24">Unit Price</th>
                  <th className="py-2 px-3 text-right w-28">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, index) => (
                  <tr key={index} className="border-b border-gray-150 text-gray-700">
                    <td className="py-2.5 px-3 text-center font-medium text-gray-400">{index + 1}</td>
                    <td className="py-2.5 px-3 font-semibold text-gray-900">
                      {item.name}
                    </td>
                    <td className="py-2.5 px-3 text-center">{item.quantity}</td>
                    <td className="py-2.5 px-3 text-right">{formatCurrency(item.price)}</td>
                    <td className="py-2.5 px-3 text-right font-semibold text-gray-950">
                      {formatCurrency(item.price * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Total calculations */}
          <div className="flex justify-end pt-3">
            <div className="w-64 space-y-2 border-t-2 border-gray-200 pt-3 text-[11px]">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Discount {order.couponCode ? `(${order.couponCode})` : ""}:</span>
                  <span>-{formatCurrency(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Delivery Charge:</span>
                <span>{formatCurrency(order.shippingFee)}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-gray-950 pt-1.5 border-t border-dashed border-gray-200">
                <span>Grand Total:</span>
                <span className="text-[#c4622d]">{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Invoice Disclaimer / Signature */}
          <div className="border-t border-gray-200 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-gray-400">
            <div>
              <p>💻 This is a computer generated invoice and requires no physical signature.</p>
              <p className="mt-0.5">Thank you for supporting sustainable farming with GaramBazaar!</p>
            </div>
            <div className="text-center md:text-right border border-dashed border-gray-200 rounded-lg p-2 bg-gray-50/30">
              <p className="font-bold text-gray-500 tracking-wide uppercase text-[8px]">Authorized Signatory</p>
              <div className="h-6 w-24 mx-auto md:ml-auto my-1 flex items-center justify-center font-serif text-[#c4622d] font-bold opacity-60">
                GaramBazaar
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
