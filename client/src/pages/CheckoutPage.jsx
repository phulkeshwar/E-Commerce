import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { createPaymentOrderRequest, verifyPaymentRequest } from "../api/payment.api";
import { getAddressesRequest, addAddressRequest } from "../api/auth.api";
import { getSettingsRequest } from "../api/settings.api";
import { useAppContext } from "../hooks/useAppContext";
import { formatCurrency } from "../utils/formatCurrency";
import { validatePincode, lookupPincode } from "../utils/validatePincode";
import { useDocumentMetadata } from "../hooks/useDocumentMetadata";

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
  const { cart, orders, isAuthenticated, notify, user } = useAppContext();
  const promo = location.state || { code: "", discount: 0 };

  const dateOptions = useMemo(() => {
    const dates = [];
    const now = new Date();
    const startHour = now.getHours();
    // If ordered before 4 PM (16:00), we can deliver today (evening/night)
    const startOffset = startHour < 16 ? 0 : 1;
    for (let i = startOffset; i < startOffset + 3; i++) {
      const d = new Date();
      d.setDate(now.getDate() + i);
      dates.push(d);
    }
    return dates;
  }, []);

  const [selectedDate, setSelectedDate] = useState(dateOptions[0]);
  const [selectedSlot, setSelectedSlot] = useState("");

  const slotOptions = useMemo(() => {
    const slots = [
      { id: "morning", label: "🌅 Morning", time: "7:00 AM - 11:00 AM", maxHour: 7 },
      { id: "noon", label: "☀️ Noon", time: "11:00 AM - 3:00 PM", maxHour: 11 },
      { id: "evening", label: "🌇 Evening", time: "3:00 PM - 7:00 PM", maxHour: 15 },
      { id: "night", label: "🌙 Night", time: "7:00 PM - 10:00 PM", maxHour: 19 },
    ];
    
    const now = new Date();
    const isToday = selectedDate && selectedDate.toDateString() === now.toDateString();
    if (isToday) {
      const currentHour = now.getHours();
      return slots.filter(s => currentHour < s.maxHour);
    }
    return slots;
  }, [selectedDate]);

  useEffect(() => {
    if (slotOptions.length > 0) {
      setSelectedSlot(slotOptions[0].id);
    } else {
      setSelectedSlot("");
    }
  }, [slotOptions]);

  useDocumentMetadata({
    title: "Secure Checkout",
    description: "Complete your order safely on GaramBazaar. Secure payment options and nationwide delivery."
  });
  const [showGuestPrompt, setShowGuestPrompt] = useState(!isAuthenticated);
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [placingOrder, setPlacingOrder] = useState(false);
  const [simulatingOrder, setSimulatingOrder] = useState(null);
  const [locatingUser, setLocatingUser] = useState(false);
  const [saveAddressForFuture, setSaveAddressForFuture] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    line1: user?.address?.line1 || "",
    city: user?.address?.city || "",
    state: user?.address?.state || "",
    pincode: user?.address?.pincode || "",
  });

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [settings, setSettings] = useState({
    shippingFee: 49,
    shippingFreeThreshold: 500,
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await getSettingsRequest();
        if (res) {
          setSettings({
            shippingFee: res.shippingFee ?? 49,
            shippingFreeThreshold: res.shippingFreeThreshold ?? 500,
          });
        }
      } catch (err) {
        console.error("Failed to fetch settings:", err);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    const loadSavedAddresses = async () => {
      const list = [];
      if (user && user.address?.line1 && user.address?.city) {
        list.push({
          id: "profile-default",
          name: user.name || "",
          phone: user.phone || "",
          line1: user.address.line1,
          city: user.address.city,
          state: user.address.state,
          pincode: user.address.pincode,
          label: "📍 Profile Default"
        });
      }

      try {
        const serverAddrs = await getAddressesRequest();
        if (serverAddrs && Array.isArray(serverAddrs)) {
          serverAddrs.forEach((addr) => {
            list.push({
              id: addr._id || addr.id,
              name: addr.name,
              phone: addr.phone,
              line1: addr.line1,
              city: addr.city,
              state: addr.state,
              pincode: addr.pincode,
              label: addr.label || "🏠 Saved Address"
            });
          });
        }
      } catch (err) {
        console.error("Failed to load server addresses:", err);
      }
      
      setSavedAddresses(list);
    };

    loadSavedAddresses();
  }, [user]);

  const handleSelectSavedAddress = (addr) => {
    if (!addr) return;
    setForm({
      name: addr.name || "",
      phone: addr.phone || "",
      line1: addr.line1 || "",
      city: addr.city || "",
      state: addr.state || "",
      pincode: addr.pincode || "",
    });
    notify(`📍 Loaded: ${addr.label}`);
  };

  const { updateProfile } = useAppContext();

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        name: prev.name || user.name || "",
        email: prev.email || user.email || "",
        phone: prev.phone || user.phone || "",
        line1: prev.line1 || user.address?.line1 || "",
        city: prev.city || user.address?.city || "",
        state: prev.state || user.address?.state || "",
        pincode: prev.pincode || user.address?.pincode || "",
      }));
    }
  }, [user]);

  const handleAutofillFromProfile = () => {
    if (user) {
      setForm({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        line1: user.address?.line1 || "",
        city: user.address?.city || "",
        state: user.address?.state || "",
        pincode: user.address?.pincode || "",
      });
      notify("📋 Autofilled delivery details from your profile!");
    } else {
      notify("No profile details found.");
    }
  };

  const handleContinueToPayment = async () => {
    if (!form.name?.trim()) {
      notify("Full name is required.");
      return;
    }
    if (!form.email?.trim()) {
      notify("Email address is required.");
      return;
    }
    if (!form.phone?.trim()) {
      notify("Phone number is required.");
      return;
    }
    if (!form.line1?.trim()) {
      notify("Address line is required.");
      return;
    }
    if (!form.city?.trim()) {
      notify("City is required.");
      return;
    }
    if (!form.state?.trim()) {
      notify("State is required.");
      return;
    }
    if (!form.pincode?.trim() || !validatePincode(form.pincode.trim())) {
      notify("Please enter a valid 6-digit Indian PIN code.");
      return;
    }

    if (saveAddressForFuture) {
      try {
        await updateProfile({
          name: form.name.trim(),
          phone: form.phone.trim(),
          address: {
            line1: form.line1.trim(),
            city: form.city.trim(),
            state: form.state.trim(),
            pincode: form.pincode.trim(),
          },
        });
        
        await addAddressRequest({
          label: "Saved Address",
          name: form.name.trim(),
          phone: form.phone.trim(),
          line1: form.line1.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          pincode: form.pincode.trim(),
        });
        
        notify("📍 Delivery details saved to your profile and addresses list!");
      } catch (err) {
        console.error("Failed to save address to profile/server:", err);
      }
    }

    setStep(2);
  };

  const handleUseMyLocation = async () => {
    if (!navigator.geolocation) {
      notify("Geolocation is not supported by your browser.");
      return;
    }

    setLocatingUser(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
            { headers: { "Accept-Language": "en" } }
          );
          const data = await response.json();

          if (data?.address) {
            const addr = data.address;
            setForm((prev) => ({
              ...prev,
              line1:
                [addr.road, addr.neighbourhood, addr.suburb]
                  .filter(Boolean)
                  .join(", ") || prev.line1,
              city:
                addr.city ||
                addr.town ||
                addr.village ||
                addr.county ||
                prev.city,
              state: addr.state || prev.state,
              pincode: addr.postcode || prev.pincode,
            }));
            notify("📍 Location detected! Please verify and fill remaining fields.");
          } else {
            notify("Could not determine address from your location.");
          }
        } catch {
          notify("Failed to fetch address from your location.");
        } finally {
          setLocatingUser(false);
        }
      },
      (error) => {
        setLocatingUser(false);
        if (error.code === error.PERMISSION_DENIED) {
          notify("Location access denied. Please allow location in your browser settings.");
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          notify("Location unavailable. Please try again.");
        } else {
          notify("Location request timed out. Please try again.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const calculatedItems = useMemo(() => {
    return cart.items.map((item) => {
      let price = item.price;
      const qDiscounts = item.quantityDiscounts || [];
      let applicableDiscountPercent = 0;
      for (const qd of qDiscounts) {
        if (item.quantity >= qd.quantity && qd.discountPercent > applicableDiscountPercent) {
          applicableDiscountPercent = qd.discountPercent;
        }
      }
      const originalPrice = price;
      if (applicableDiscountPercent > 0) {
        price = Math.round(price * (1 - applicableDiscountPercent / 100));
      }
      return {
        ...item,
        price,
        originalPrice,
        subtotal: price * item.quantity,
        discountPercent: applicableDiscountPercent,
      };
    });
  }, [cart.items]);

  const itemsSubtotal = useMemo(() => {
    return calculatedItems.reduce((sum, item) => sum + item.subtotal, 0);
  }, [calculatedItems]);

  const originalSubtotal = useMemo(() => {
    return cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart.items]);

  const quantityDiscountsTotal = originalSubtotal - itemsSubtotal;

  const loyaltyPoints = user?.loyaltyPoints || 0;
  let loyaltyDiscountPercent = 0;
  if (loyaltyPoints > 1500) {
    loyaltyDiscountPercent = 10;
  } else if (loyaltyPoints > 500) {
    loyaltyDiscountPercent = 5;
  }
  const loyaltyDiscount = Math.round((itemsSubtotal * loyaltyDiscountPercent) / 100);

  const shippingFee = useMemo(() => {
    let fee = cart.items.reduce((sum, item) => sum + (item.deliveryFee || 0) * item.quantity, 0);
    if (fee === 0 && itemsSubtotal < settings.shippingFreeThreshold) {
      fee = settings.shippingFee;
    } else if (itemsSubtotal >= settings.shippingFreeThreshold) {
      fee = 0;
    }
    return fee;
  }, [cart.items, itemsSubtotal, settings]);

  const orderTotal = Math.max(itemsSubtotal + shippingFee - promo.discount - loyaltyDiscount, 0);



  if (user?.role === "seller") {
    return (
      <section className="page-content text-center py-20 min-h-screen">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 border border-amber-100">
          <span className="text-5xl">🏪</span>
          <h2 className="text-2xl font-black text-gray-900 mt-4 mb-2">Merchant Checkout Restricted</h2>
          <p className="text-gray-500 text-sm mb-6">
            Sellers are restricted from placing orders on the store. Only viewing is enabled.
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    setPlacingOrder(true);

    try {
      const order = await orders.placeOrder({
        items: cart.items.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          variantName: item.variantName,
        })),
        shippingAddress: form,
        paymentMethod,
        couponCode: promo.code,
        specialInstructions,
        loyaltyDiscount,
        deliverySlot: selectedSlot ? `${selectedDate.toLocaleDateString(undefined, { month: "short", day: "numeric" })}: ${slotOptions.find(s => s.id === selectedSlot)?.time}` : "",
        estimatedDeliveryDate: selectedDate ? selectedDate.toISOString() : undefined,
      });

      if (paymentMethod === "cod") {
        cart.clearCart();
        notify(`Order ${order.id} placed.`);
        navigate(`/order-success/${order.id}`, {
          state: { justPlaced: true, guestAccessToken: order.guestAccessToken },
        });
        return;
      }

      try {
        await loadRazorpayScript();
        const paymentOrder = await createPaymentOrderRequest(order.id);
        const razorpayOptions = {
          key: paymentOrder.keyId,
          amount: paymentOrder.amount,
          currency: paymentOrder.currency || "INR",
          name: "GaramBazaar",
          description: `Order ${order.id}`,
          order_id: paymentOrder.razorpayOrderId,
          prefill: {
            name: form.name,
            contact: form.phone,
            method: paymentMethod === "upi" ? "upi" : undefined,
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
            navigate(`/order-success/${order.id}`, {
              state: { justPlaced: true, guestAccessToken: order.guestAccessToken },
            });
          },
        };

        if (paymentMethod === "upi") {
          razorpayOptions.config = {
            display: {
              blocks: {
                upiBlock: {
                  name: "Pay via UPI",
                  instruments: [
                    {
                      method: "upi",
                    },
                  ],
                },
              },
              sequence: ["block.upiBlock"],
              preferences: {
                show_default_blocks: false,
              },
            },
          };
        }

        const checkout = new window.Razorpay(razorpayOptions);
        checkout.open();
      } catch (payError) {
        console.warn("Razorpay initialisation failed, falling back to simulator:", payError);
        notify("Razorpay Gateway unavailable. Launching interactive Payment Simulator...");
        setSimulatingOrder(order);
      }
    } catch (error) {
      notify(error.message || "Could not place order.");
    } finally {
      setPlacingOrder(false);
    }
  };

  const handleSimulatePayment = async () => {
    if (!simulatingOrder) return;
    setPlacingOrder(true);
    try {
      await verifyPaymentRequest({
        orderId: simulatingOrder.id || simulatingOrder._id,
        razorpayOrderId: "simulated",
        razorpayPaymentId: "simulated",
        signature: "simulated_payment_signature",
      });
      cart.clearCart();
      notify("Payment verified successfully (Simulated)!");
      const targetOrder = simulatingOrder;
      setSimulatingOrder(null);
      navigate(`/order-success/${targetOrder.orderNumber}`, {
        state: { justPlaced: true, guestAccessToken: targetOrder.guestAccessToken },
      });
    } catch (err) {
      notify(err.message || "Failed to verify simulated payment.");
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
              <div className="flex justify-between items-center mb-5 border-b border-gray-100 pb-3 flex-wrap gap-2">
                <h3 className="m-0 text-lg font-extrabold text-[#2c1a0e]">📍 Delivery Address</h3>
                <div className="flex gap-2">
                  {user && (
                    <button
                      type="button"
                      onClick={handleAutofillFromProfile}
                      className="bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-1 shadow-sm border border-amber-200 cursor-pointer"
                    >
                      📋 Autofill Profile
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleUseMyLocation}
                    disabled={locatingUser}
                    className="bg-amber-400 hover:bg-amber-500 text-gray-900 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-1 shadow-sm border-0 cursor-pointer disabled:opacity-60 disabled:cursor-wait"
                  >
                    {locatingUser ? (
                      <>
                        <span className="inline-block w-3 h-3 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></span>
                        Detecting...
                      </>
                    ) : (
                      "📍 Use My Location"
                    )}
                  </button>
                </div>
              </div>

              {savedAddresses.length > 0 && (
                <div className="mb-6 bg-gradient-to-br from-[#fdfbf7] to-[#f8f1e5] border border-[#ecdcc7] rounded-2xl p-4 shadow-sm">
                  <span className="block text-xs font-black uppercase tracking-wider text-[#9b6b3a] mb-2.5">📋 Quick-Select Saved Address</span>
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none-style">
                    {savedAddresses.map((addr) => (
                      <button
                        key={addr.id}
                        type="button"
                        onClick={() => handleSelectSavedAddress(addr)}
                        className="flex flex-col text-left p-3.5 rounded-xl border border-gray-200 bg-white hover:border-[#c4622d] hover:shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer min-w-[170px] max-w-[220px] shrink-0"
                      >
                        <span className="text-xs font-bold text-gray-900 truncate mb-1">{addr.label}</span>
                        <span className="text-[11px] font-semibold text-gray-700 truncate">{addr.name}</span>
                        <span className="text-[10px] text-gray-500 truncate mb-1.5">{addr.phone}</span>
                        <span className="text-[10px] text-gray-400 truncate mt-auto border-t border-gray-100 pt-1.5 w-full">
                          {addr.line1}, {addr.city}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="form-row">
                <Input label="Full name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required />
                <Input label="Email address" type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} required />
              </div>
              <div className="form-row">
                <Input
                  label="Pincode"
                  value={form.pincode}
                  maxLength={6}
                  placeholder="6-digit PIN"
                  onChange={(event) => {
                    const val = event.target.value.replace(/\D/g, "").slice(0, 6);
                    setForm((current) => {
                      const next = { ...current, pincode: val };
                      if (val.length === 6 && validatePincode(val)) {
                        const info = lookupPincode(val);
                        if (info.valid && !current.state) {
                          next.state = info.state;
                        }
                      }
                      return next;
                    });
                  }}
                  required
                />
                <Input
                  label="Phone number"
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={form.phone}
                  maxLength={15}
                  onChange={(event) => {
                    const val = event.target.value.replace(/[^\d+\s-]/g, "").slice(0, 15);
                    setForm((current) => ({ ...current, phone: val }));
                  }}
                  required
                />
              </div>
              <div className="form-row full">
                <Input label="Address line" value={form.line1} onChange={(event) => setForm((current) => ({ ...current, line1: event.target.value }))} required />
              </div>
              <div className="form-row">
                <Input label="City" value={form.city} onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))} required />
                <Input label="State" value={form.state} onChange={(event) => setForm((current) => ({ ...current, state: event.target.value }))} required />
              </div>
              <div className="flex items-center gap-2 mb-4 mt-3 select-none">
                <input
                  type="checkbox"
                  id="saveAddressCheck"
                  checked={saveAddressForFuture}
                  onChange={(e) => setSaveAddressForFuture(e.target.checked)}
                  className="cursor-pointer h-4 w-4 rounded border-gray-300 text-[#c4622d] focus:ring-[#c4622d]"
                />
                <label htmlFor="saveAddressCheck" className="text-xs font-semibold text-gray-700 cursor-pointer">
                  💾 Save this address and phone number for future use
                </label>
              </div>

              {/* Order Notes & Special Instructions */}
              <div className="mb-5 text-left">
                <label htmlFor="specialInstructionsInput" className="block text-xs font-bold text-[#2c1a0e] mb-1.5">
                  📝 Delivery Notes / Special Instructions (Optional)
                </label>
                <textarea
                  id="specialInstructionsInput"
                  placeholder="e.g. Leave with security guard, knock loudly, deliver after 6 PM, etc."
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl p-3.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#ea580c] transition-all min-h-[80px] resize-y"
                />
              </div>

              <Button className="next-btn" type="button" onClick={handleContinueToPayment}>
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

              {/* Delivery Slot Selection */}
              <div className="review-box bg-gradient-to-br from-[#fdfbf7] to-[#f8f1e5] border border-[#ecdcc7] rounded-2xl p-4 shadow-sm mb-4">
                <strong className="block text-xs font-black uppercase tracking-wider text-[#9b6b3a] mb-3">🚚 Select Delivery Date & Slot</strong>
                
                {/* Date Options */}
                <div className="flex gap-2.5 mb-4 overflow-x-auto pb-1 scrollbar-none-style">
                  {dateOptions.map((date, idx) => {
                    const isSelected = selectedDate && selectedDate.toDateString() === date.toDateString();
                    const isToday = date.toDateString() === new Date().toDateString();
                    const label = isToday ? "Today" : idx === 1 && dateOptions[0].toDateString() === new Date().toDateString() ? "Tomorrow" : date.toLocaleDateString(undefined, { weekday: "short" });
                    const dayNum = date.getDate();
                    const monthLabel = date.toLocaleDateString(undefined, { month: "short" });
                    
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedDate(date)}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all cursor-pointer min-w-[75px] ${
                          isSelected
                            ? "bg-[#c4622d] text-white border-[#c4622d] shadow-sm scale-[1.03]"
                            : "bg-white text-gray-700 border-gray-200 hover:border-amber-300 hover:bg-amber-50/10"
                        }`}
                      >
                        <span className="text-[10px] font-extrabold uppercase tracking-wide opacity-80">{label}</span>
                        <span className="text-lg font-black my-0.5">{dayNum}</span>
                        <span className="text-[9px] font-bold uppercase opacity-80">{monthLabel}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Slot Options */}
                <div>
                  <span className="block text-[10px] font-extrabold uppercase tracking-wider text-gray-500 mb-2">Available Slots</span>
                  {slotOptions.length === 0 ? (
                    <p className="text-xs text-red-500 font-semibold italic">No slots available for today. Please select tomorrow.</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {slotOptions.map((slot) => {
                        const isSelected = selectedSlot === slot.id;
                        return (
                          <button
                            key={slot.id}
                            type="button"
                            onClick={() => setSelectedSlot(slot.id)}
                            className={`flex flex-col text-left p-2.5 rounded-xl border transition-all cursor-pointer ${
                              isSelected
                                ? "bg-white border-[#c4622d] ring-2 ring-[#c4622d]/20 shadow-sm"
                                : "bg-white border-gray-200 hover:border-[#c4622d] hover:bg-amber-50/10"
                            }`}
                          >
                            <span className="text-xs font-bold text-gray-900 flex items-center gap-1">
                              {slot.label}
                            </span>
                            <span className="text-[10px] text-gray-500 font-semibold mt-0.5">{slot.time}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {selectedDate && selectedSlot && slotOptions.find(s => s.id === selectedSlot) && (
                <div className="review-box bg-[#c4622d]/5 border border-[#c4622d]/10 rounded-xl p-3.5 flex items-center justify-between mb-4">
                  <div>
                    <span className="block text-[9px] font-extrabold uppercase tracking-wider text-[#c4622d]">Estimated Delivery Date</span>
                    <strong className="text-xs text-gray-800 font-black mt-0.5 block">
                      {selectedDate.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
                    </strong>
                    <span className="text-[10px] text-gray-500 font-semibold block mt-0.5">
                      During {slotOptions.find(s => s.id === selectedSlot)?.label} ({slotOptions.find(s => s.id === selectedSlot)?.time})
                    </span>
                  </div>
                  <span className="text-3xl">🚚</span>
                </div>
              )}

              {/* Special Instructions */}
              <div className="review-box bg-white border border-gray-150 rounded-2xl p-4 mb-4">
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-gray-500 mb-2">
                  📝 Special Instructions (Optional)
                </label>
                <textarea
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="e.g. Leave at door, ring bell twice, call before delivery..."
                  maxLength={300}
                  rows={2}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-700 placeholder:text-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-[#c4622d]/30 focus:border-[#c4622d] transition-all bg-gray-50/50"
                />
                <span className="block text-right text-[9px] text-gray-400 mt-1">{specialInstructions.length}/300</span>
              </div>

              <div className="space-y-1.5 border-b border-gray-100 pb-3 mb-3 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(originalSubtotal)}</span>
                </div>
                {quantityDiscountsTotal > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Quantity Bulk Discount</span>
                    <span>−{formatCurrency(quantityDiscountsTotal)}</span>
                  </div>
                )}
                {loyaltyDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Loyalty Level Discount ({loyaltyDiscountPercent}%)</span>
                    <span>−{formatCurrency(loyaltyDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Delivery Charges</span>
                  <span className={shippingFee === 0 ? "text-emerald-600 font-semibold" : ""}>
                    {shippingFee === 0 ? "FREE 🎉" : formatCurrency(shippingFee)}
                  </span>
                </div>
                {promo.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount ({promo.code})</span>
                    <span>−{formatCurrency(promo.discount)}</span>
                  </div>
                )}
              </div>

              <div className="review-total flex justify-between items-baseline pt-2">
                <span>Order Total</span>
                <strong className="text-[#c4622d] text-lg font-black">{formatCurrency(orderTotal)}</strong>
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

        <aside className="mini-cart text-left">
          <h4 className="font-black text-sm text-[#2c1a0e] border-b border-gray-150 pb-2 mb-3">Your Items ({cart.summary.itemCount})</h4>
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {calculatedItems.map((item) => (
              <div key={`${item.id}-${item.variantName || ""}`} className="flex items-start justify-between gap-3 text-xs">
                <span className="text-xl shrink-0">{item.emoji || "📦"}</span>
                <div className="flex-1 min-w-0">
                  <span className="block font-bold text-gray-800 truncate leading-tight">
                    {item.name} {item.variantName ? `(${item.variantName})` : ""}
                  </span>
                  <span className="text-[10px] text-gray-500 font-medium">
                    Qty: {item.quantity} @ {formatCurrency(item.price)}
                    {item.discountPercent > 0 && (
                      <span className="text-emerald-650 font-bold ml-1">({item.discountPercent}% off)</span>
                    )}
                  </span>
                </div>
                <div className="text-right shrink-0">
                  {item.discountPercent > 0 && (
                    <span className="block text-[9px] text-gray-400 line-through leading-tight">
                      {formatCurrency(item.originalPrice * item.quantity)}
                    </span>
                  )}
                  <span className="font-black text-gray-800">{formatCurrency(item.subtotal)}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-150 mt-4 pt-3 space-y-1.5 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatCurrency(originalSubtotal)}</span>
            </div>
            {quantityDiscountsTotal > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Bulk Discounts</span>
                <span>−{formatCurrency(quantityDiscountsTotal)}</span>
              </div>
            )}
            {loyaltyDiscount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Loyalty ({loyaltyDiscountPercent}%)</span>
                <span>−{formatCurrency(loyaltyDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Delivery</span>
              <span>{shippingFee === 0 ? "FREE" : formatCurrency(shippingFee)}</span>
            </div>
            {promo.discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Promo ({promo.code})</span>
                <span>−{formatCurrency(promo.discount)}</span>
              </div>
            )}
            <div className="flex justify-between items-baseline pt-2 border-t border-gray-150 text-sm font-black text-[#2c1a0e]">
              <span>Total</span>
              <span className="text-[#ea580c] text-base font-black">{formatCurrency(orderTotal)}</span>
            </div>
          </div>
        </aside>
      </div>

      {simulatingOrder && (
        <Modal title="Interactive Payment Simulator (Sandbox Mode)" onClose={() => setSimulatingOrder(null)}>
          <div className="flex flex-col gap-5 text-center py-2 max-w-sm mx-auto">
            <div className="flex items-center justify-between bg-amber-50 border border-amber-100 rounded-xl p-3 text-left">
              <div>
                <p className="text-[10px] text-amber-700 font-bold uppercase tracking-wider">Gateway Sandbox Mode</p>
                <p className="text-xs text-amber-800 font-semibold mt-0.5 leading-relaxed">
                  Razorpay is currently unconfigured. Use this simulator to safely test and complete payment.
                </p>
              </div>
              <span className="text-2xl">⚡</span>
            </div>

            <div className="bg-gray-50 border border-gray-150 rounded-2xl p-4 flex flex-col items-center gap-3">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Amount Due</span>
              <span className="text-2xl font-black text-gray-900">{formatCurrency(orderTotal)}</span>
              <span className="text-[11px] font-semibold text-gray-500 bg-gray-200/50 px-2.5 py-1 rounded">
                Order Reference: {simulatingOrder.orderNumber}
              </span>
            </div>

            {paymentMethod === "upi" && (
              <div className="flex flex-col items-center gap-4 py-2">
                <div className="relative w-36 h-36 bg-white border-2 border-[#c4622d] rounded-2xl flex items-center justify-center shadow-md p-2 overflow-hidden">
                  {/* Mock QR Representation */}
                  <div className="w-full h-full bg-slate-100 rounded-lg flex flex-col items-center justify-center gap-1 border border-dashed border-gray-300">
                    <span className="text-3xl">📲</span>
                    <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Scan & Pay</span>
                  </div>
                  {/* Laser Scan line animation */}
                  <div className="absolute left-0 right-0 h-[2px] bg-red-500 shadow-[0_0_8px_red] top-0 animate-[bounce_2s_infinite]" />
                </div>

                <div className="flex justify-between items-center w-full max-w-xs border border-gray-100 bg-gray-50/50 rounded-xl p-2.5 text-xs text-left">
                  <div>
                    <span className="text-[10px] text-gray-400 block uppercase font-bold">UPI VPA</span>
                    <span className="font-semibold text-gray-800 font-mono">pay@GaramBazaar</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText("pay@GaramBazaar");
                      notify("UPI Address copied to clipboard!");
                    }}
                    className="text-[#c4622d] font-bold hover:underline"
                  >
                    Copy
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Session expires in:</span>
                  <SimulatorTimer onTimeout={() => setSimulatingOrder(null)} />
                </div>
              </div>
            )}

            {paymentMethod === "card" && (
              <div className="flex flex-col gap-3 py-2 text-left">
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Simulated Card Details</p>
                <div className="bg-gradient-to-r from-gray-800 to-gray-700 text-white rounded-2xl p-4 shadow-md font-mono flex flex-col justify-between h-36">
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-bold tracking-widest">GaramBazaar Card</span>
                    <span className="text-xl">💳</span>
                  </div>
                  <div className="text-base tracking-widest my-2">4111 •••• •••• 1111</div>
                  <div className="flex justify-between text-[10px]">
                    <div>
                      <span className="block text-gray-400 text-[8px] uppercase">Cardholder</span>
                      <span>{form.name || "Pkm Tester"}</span>
                    </div>
                    <div>
                      <span className="block text-gray-400 text-[8px] uppercase">Expires</span>
                      <span>12/30</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === "netbanking" && (
              <div className="flex flex-col gap-3 py-2 text-left">
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Simulated Net Banking Banks</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {["State Bank of India", "HDFC Bank", "ICICI Bank", "Axis Bank"].map((bank) => (
                    <div key={bank} className="border border-gray-200 rounded-xl p-2.5 text-center font-semibold bg-gray-50 hover:bg-gray-100 transition-colors">
                      🏦 {bank}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2 pt-2">
              <Button type="button" className="w-full py-2.5 font-bold" onClick={handleSimulatePayment}>
                🚀 Simulate Successful Payment
              </Button>
              <button
                type="button"
                className="text-xs text-gray-500 hover:text-gray-700 font-bold py-1 hover:underline transition-colors"
                onClick={() => setSimulatingOrder(null)}
              >
                Cancel and Return
              </button>
            </div>
          </div>
        </Modal>
      )}

      {showGuestPrompt && (
        <Modal title="🔐 Save Your History & Earn Rewards!" onClose={() => setShowGuestPrompt(false)}>
          <div className="flex flex-col gap-5 text-center py-2 max-w-sm mx-auto">
            <span className="text-5xl">🎁</span>
            <h3 className="text-lg font-black text-[#2c1a0e] m-0">Sign in to save your history</h3>
            <p className="text-sm text-gray-600 leading-relaxed m-0">
              Create an account or sign in to save your purchase history, earn loyalty credits, and easily track your delivery in real-time.
            </p>
            <div className="flex flex-col gap-2.5 pt-2">
              <Button type="button" className="w-full py-3 font-bold bg-[#c4622d] hover:bg-[#e07a4a] text-white rounded-xl border-0" onClick={() => navigate("/auth")}>
                🔑 Sign In / Create Account
              </Button>
              <button
                type="button"
                className="w-full py-3 text-sm text-[#c4622d] hover:bg-orange-50 font-bold rounded-xl border border-gray-200 bg-white transition-colors cursor-pointer"
                onClick={() => setShowGuestPrompt(false)}
              >
                Proceed as Guest →
              </button>
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
}

function SimulatorTimer({ onTimeout }) {
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeout();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onTimeout]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <span className="font-mono bg-red-50 text-red-600 px-2.5 py-1 rounded text-xs font-bold border border-red-200">
      ⏱️ {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
    </span>
  );
}
