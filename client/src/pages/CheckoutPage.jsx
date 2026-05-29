import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { createPaymentOrderRequest, verifyPaymentRequest } from "../api/payment.api";
import { useAppContext } from "../hooks/useAppContext";
import { formatCurrency } from "../utils/formatCurrency";

const paymentOptions = [
  { id: "upi", icon: "📲", name: "UPI", desc: "PhonePe, GPay, Paytm" },
  { id: "card", icon: "💳", name: "Credit / Debit Card", desc: "Visa, Mastercard, RuPay" },
  { id: "netbanking", icon: "🏦", name: "Net Banking", desc: "All major Indian banks" },
  { id: "cod", icon: "💵", name: "Cash on Delivery", desc: "Pay when you receive" },
];

const loadRazorpayScript = () =>
  new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = resolve;
    script.onerror = () => reject(new Error("Unable to load Razorpay checkout."));
    document.body.appendChild(script);
  });

export function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, orders, isAuthenticated, notify } = useAppContext();
  const promo = location.state || { code: "", discount: 0 };
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [placingOrder, setPlacingOrder] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    line1: "",
    city: "",
    state: "",
    pincode: "",
  });

  if (!isAuthenticated) {
    return (
      <section className="page-content">
        <p>Please sign in before checkout.</p>
        <Button onClick={() => navigate("/auth")}>Go to sign in</Button>
      </section>
    );
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setPlacingOrder(true);

    try {
      const order = await orders.placeOrder({
        items: cart.items.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
        shippingAddress: form,
        paymentMethod,
        couponCode: promo.code,
      });

      if (paymentMethod === "cod") {
        cart.clearCart();
        notify(`Order ${order.id} placed.`);
        navigate(`/order-success/${order.id}`);
        return;
      }

      await loadRazorpayScript();
      const paymentOrder = await createPaymentOrderRequest(order.id);
      const checkout = new window.Razorpay({
        key: paymentOrder.keyId,
        amount: paymentOrder.amount,
        currency: paymentOrder.currency || "INR",
        name: "GramBazaar",
        description: `Order ${order.id}`,
        order_id: paymentOrder.razorpayOrderId,
        prefill: {
          name: form.name,
          contact: form.phone,
        },
        handler: async (response) => {
          await verifyPaymentRequest({
            orderId: order.id,
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
          });
          cart.clearCart();
          notify(`Payment received for ${order.id}.`);
          navigate(`/order-success/${order.id}`);
        },
      });
      checkout.open();
    } catch (error) {
      notify(error.message || "Could not place order.");
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <section className="page-content">
      <div className="checkout-layout">
        <div className="steps">
          {["Delivery Address", "Payment", "Review & Pay"].map((label, index) => (
            <div
              key={label}
              className={`step ${step === index + 1 ? "active" : step > index + 1 ? "done" : ""}`}
            >
              {label}
            </div>
          ))}
        </div>

        <form className="form-section" onSubmit={handleSubmit}>
          {step === 1 ? (
            <>
              <h3>📍 Delivery Address</h3>
              <div className="form-row">
                <Input label="Full name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required />
                <Input label="Phone" value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} required />
              </div>
              <div className="form-row full">
                <Input label="Address line" value={form.line1} onChange={(event) => setForm((current) => ({ ...current, line1: event.target.value }))} required />
              </div>
              <div className="form-row">
                <Input label="City" value={form.city} onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))} required />
                <Input label="State" value={form.state} onChange={(event) => setForm((current) => ({ ...current, state: event.target.value }))} required />
              </div>
              <div className="form-row full">
                <Input label="Pincode" value={form.pincode} onChange={(event) => setForm((current) => ({ ...current, pincode: event.target.value }))} required />
              </div>
              <Button className="next-btn" type="button" onClick={() => setStep(2)}>
                Continue to Payment →
              </Button>
            </>
          ) : null}

          {step === 2 ? (
            <>
              <h3>💳 Payment Method</h3>
              <div className="payment-options">
                {paymentOptions.map((option) => (
                  <button
                    key={option.id}
                    className={`pay-option ${paymentMethod === option.id ? "selected" : ""}`}
                    onClick={() => setPaymentMethod(option.id)}
                    type="button"
                  >
                    <span className="pay-icon">{option.icon}</span>
                    <div>
                      <div className="pay-name">{option.name}</div>
                      <div className="pay-desc">{option.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
              <div className="checkout-actions">
                <Button className="next-btn next-btn-secondary" type="button" onClick={() => setStep(1)}>
                  ← Back
                </Button>
                <Button className="next-btn" type="button" onClick={() => setStep(3)}>
                  Review Order →
                </Button>
              </div>
            </>
          ) : null}

          {step === 3 ? (
            <>
              <h3>📋 Review Your Order</h3>
              <div className="review-box">
                <strong>Delivering to:</strong>
                <p>
                  {form.name} · {form.phone}
                  <br />
                  {form.line1}, {form.city}, {form.state} — {form.pincode}
                </p>
              </div>
              <div className="review-box">
                <strong>Payment:</strong>
                <p>{paymentOptions.find((option) => option.id === paymentMethod)?.name}</p>
              </div>
              <div className="review-total">
                <span>Order Total</span>
                <strong>{formatCurrency(Math.max(cart.summary.subtotal - promo.discount, 0))}</strong>
              </div>
              <div className="checkout-actions">
                <Button className="next-btn next-btn-secondary" type="button" onClick={() => setStep(2)}>
                  ← Back
                </Button>
                <Button className="next-btn place-btn" type="submit" disabled={!cart.items.length || placingOrder}>
                  {placingOrder ? "Placing..." : "✅ Place Order"}
                </Button>
              </div>
            </>
          ) : null}
        </form>

        <aside className="mini-cart">
          <h4>Your Items ({cart.summary.itemCount})</h4>
          {cart.items.map((item) => (
            <div key={item.id} className="mini-item">
              <span className="me">{item.emoji || "📦"}</span>
              <span className="mn">
                {item.name} ×{item.quantity}
              </span>
              <span className="mp">{formatCurrency(item.price * item.quantity)}</span>
            </div>
          ))}
          <div className="mini-total">
            <span>Total</span>
            <span>{formatCurrency(Math.max(cart.summary.subtotal - promo.discount, 0))}</span>
          </div>
        </aside>
      </div>
    </section>
  );
}
