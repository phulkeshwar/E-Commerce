import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppContext } from "../hooks/useAppContext";
import { useDocumentMetadata } from "../hooks/useDocumentMetadata";
import {
  getAddressesRequest,
  addAddressRequest,
  updateAddressRequest,
  deleteAddressRequest,
} from "../api/auth.api";
import { validatePincode, lookupPincode } from "../utils/validatePincode";
import { Modal } from "../components/ui/Modal";
import { Input } from "../components/ui/Input";

const LABEL_OPTIONS = [
  { label: "Home", icon: "🏠" },
  { label: "Work", icon: "🏢" },
  { label: "Other", icon: "📍" },
];

export function SavedAddressesPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, notify, confirm } = useAppContext();

  useDocumentMetadata({
    title: "Saved Addresses | GaramBazaar",
    description: "Manage your delivery addresses for quick and hassle-free checkout on GaramBazaar.",
  });

  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    label: "Home",
    name: "",
    phone: "",
    line1: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [formError, setFormError] = useState("");

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const res = await getAddressesRequest();
      const list = res?.savedAddresses || (Array.isArray(res) ? res : []);
      setAddresses(
        list.map((a) => ({
          id: a._id || a.id,
          label: a.label || "Home",
          name: a.name || "",
          phone: a.phone || "",
          line1: a.line1 || "",
          city: a.city || "",
          state: a.state || "",
          pincode: a.pincode || "",
        }))
      );
    } catch (err) {
      console.error("Failed to load saved addresses:", err);
      notify(err.message || "Failed to load saved addresses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAddresses();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const handleOpenAdd = () => {
    setEditingAddressId(null);
    setForm({
      label: "Home",
      name: user?.name || "",
      phone: user?.phone || "",
      line1: "",
      city: "",
      state: "",
      pincode: "",
    });
    setFormError("");
    setModalOpen(true);
  };

  const handleOpenEdit = (addr) => {
    setEditingAddressId(addr.id);
    setForm({
      label: addr.label || "Home",
      name: addr.name || "",
      phone: addr.phone || "",
      line1: addr.line1 || "",
      city: addr.city || "",
      state: addr.state || "",
      pincode: addr.pincode || "",
    });
    setFormError("");
    setModalOpen(true);
  };

  const handlePincodeChange = (val) => {
    const cleaned = val.replace(/\D/g, "").slice(0, 6);
    setForm((prev) => {
      const next = { ...prev, pincode: cleaned };
      if (cleaned.length === 6 && validatePincode(cleaned)) {
        const info = lookupPincode(cleaned);
        if (info.valid && !prev.state) {
          next.state = info.state;
        }
      }
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!form.name.trim()) {
      setFormError("Full name is required.");
      return;
    }
    if (!form.phone.trim() || form.phone.trim().length < 10) {
      setFormError("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (!form.line1.trim()) {
      setFormError("Address line is required.");
      return;
    }
    if (!form.pincode.trim() || !validatePincode(form.pincode.trim())) {
      setFormError("Please enter a valid 6-digit Indian PIN code.");
      return;
    }
    if (!form.city.trim()) {
      setFormError("City is required.");
      return;
    }
    if (!form.state.trim()) {
      setFormError("State is required.");
      return;
    }

    setSubmitting(true);
    try {
      if (editingAddressId) {
        await updateAddressRequest(editingAddressId, {
          label: form.label,
          name: form.name.trim(),
          phone: form.phone.trim(),
          line1: form.line1.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          pincode: form.pincode.trim(),
        });
        notify("Address updated successfully! ✨");
      } else {
        await addAddressRequest({
          label: form.label,
          name: form.name.trim(),
          phone: form.phone.trim(),
          line1: form.line1.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          pincode: form.pincode.trim(),
        });
        notify("New address saved successfully! 🎉");
      }
      setModalOpen(false);
      await fetchAddresses();
    } catch (err) {
      setFormError(err.message || "Failed to save address. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (addr) => {
    const shouldDelete = await confirm(
      `Are you sure you want to delete "${addr.label} - ${addr.line1}"?`
    );
    if (!shouldDelete) return;

    try {
      await deleteAddressRequest(addr.id);
      notify("Address deleted successfully.");
      setAddresses((prev) => prev.filter((a) => a.id !== addr.id));
    } catch (err) {
      notify(err.message || "Failed to delete address.");
    }
  };

  const handleUseAtCheckout = (addr) => {
    navigate("/checkout", {
      state: {
        selectedAddress: {
          name: addr.name,
          phone: addr.phone,
          line1: addr.line1,
          city: addr.city,
          state: addr.state,
          pincode: addr.pincode,
          label: addr.label,
        },
      },
    });
  };

  if (!isAuthenticated && !loading) {
    return (
      <section className="page-content text-center py-16 px-4">
        <div className="max-w-md mx-auto bg-white rounded-3xl shadow-xl p-8 border border-amber-100">
          <span className="text-5xl block mb-4">📍</span>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Saved Addresses</h2>
          <p className="text-gray-500 text-sm mb-6">
            Sign in to your GaramBazaar account to view, add, and manage your delivery addresses.
          </p>
          <button
            onClick={() => navigate("/auth?mode=login&redirect=/saved-addresses")}
            className="w-full bg-[#c4622d] hover:bg-[#a95223] text-white font-bold py-3.5 px-6 rounded-2xl shadow-md transition-all text-sm cursor-pointer border-0"
          >
            Sign In to Continue
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="page-content py-8 px-4 sm:px-6 max-w-5xl mx-auto">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 mb-6">
        <Link to="/" className="hover:text-[#c4622d] transition-colors">
          Home
        </Link>
        <span>›</span>
        <Link to="/account" className="hover:text-[#c4622d] transition-colors">
          Account
        </Link>
        <span>›</span>
        <span className="text-gray-700 font-bold">Saved Addresses</span>
      </div>

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-gray-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#2c1a0e] tracking-tight flex items-center gap-2.5">
            <span>📍</span> Saved Addresses
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Manage your delivery destinations for lightning-fast checkout.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 bg-[#c4622d] hover:bg-[#a95223] text-white font-bold text-xs sm:text-sm py-3 px-5 rounded-2xl shadow-md hover:shadow-lg transition-all cursor-pointer border-0 active:scale-[0.98]"
        >
          <span>➕</span> Add New Address
        </button>
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[1, 2].map((n) => (
            <div
              key={n}
              className="bg-white rounded-2xl p-6 border border-gray-150 animate-pulse space-y-3"
            >
              <div className="h-5 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-100 rounded w-1/2"></div>
              <div className="h-4 bg-gray-100 rounded w-3/4"></div>
              <div className="h-8 bg-gray-100 rounded mt-4"></div>
            </div>
          ))}
        </div>
      ) : addresses.length === 0 ? (
        /* Empty State */
        <div className="bg-gradient-to-b from-[#fdfbf7] to-white border border-[#ebdcc7] rounded-3xl p-10 text-center shadow-sm max-w-lg mx-auto my-6">
          <div className="w-16 h-16 bg-[#faead6] rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-inner">
            📍
          </div>
          <h3 className="text-lg font-bold text-[#2c1a0e] mb-1">No Saved Addresses Found</h3>
          <p className="text-xs text-gray-500 mb-6 max-w-sm mx-auto">
            You haven't saved any delivery addresses yet. Add your home or office address to make
            ordering your favorite items seamless!
          </p>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="bg-[#c4622d] hover:bg-[#a95223] text-white font-bold text-xs py-3 px-6 rounded-xl shadow-md transition-all cursor-pointer border-0"
          >
            ➕ Add Your First Address
          </button>
        </div>
      ) : (
        /* Addresses Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {addresses.map((addr) => {
            const labelMeta = LABEL_OPTIONS.find(
              (o) => o.label.toLowerCase() === addr.label.toLowerCase()
            ) || { icon: "📍" };

            return (
              <div
                key={addr.id}
                className="bg-white rounded-2xl border border-gray-200 hover:border-[#c4622d]/60 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between relative group"
              >
                <div>
                  {/* Top Badge & Label */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#fdf2e9] text-[#c4622d] border border-[#fbd0b4]">
                      <span>{labelMeta.icon}</span>
                      <span>{addr.label}</span>
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(addr)}
                        className="p-1.5 text-gray-500 hover:text-[#c4622d] hover:bg-amber-50 rounded-lg text-xs font-semibold transition-colors cursor-pointer border-0"
                        title="Edit address"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(addr)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg text-xs font-semibold transition-colors cursor-pointer border-0"
                        title="Delete address"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>

                  {/* Recipient info */}
                  <div className="mb-3">
                    <h3 className="text-base font-bold text-gray-900 leading-snug">
                      {addr.name}
                    </h3>
                    <p className="text-xs text-gray-500 font-medium flex items-center gap-1.5 mt-0.5">
                      <span>📞</span> {addr.phone}
                    </p>
                  </div>

                  {/* Address lines */}
                  <div className="text-xs text-gray-600 bg-gray-50/70 rounded-xl p-3 border border-gray-100 leading-relaxed">
                    <p className="font-medium text-gray-800">{addr.line1}</p>
                    <p className="mt-0.5">
                      {addr.city}, {addr.state} -{" "}
                      <span className="font-bold text-gray-900">{addr.pincode}</span>
                    </p>
                  </div>
                </div>

                {/* Card Action */}
                <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => handleUseAtCheckout(addr)}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-[#fdfbf7] hover:bg-[#c4622d] text-[#c4622d] hover:text-white border border-[#ebdcc7] hover:border-[#c4622d] rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
                  >
                    <span>🛍️ Deliver to this Address</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Address Modal */}
      {modalOpen && (
        <Modal
          title={editingAddressId ? "✏️ Edit Saved Address" : "➕ Add New Saved Address"}
          onClose={() => setModalOpen(false)}
        >
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-semibold">
                ⚠️ {formError}
              </div>
            )}

            {/* Label Selector */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Address Type / Label
              </label>
              <div className="flex gap-2">
                {LABEL_OPTIONS.map((opt) => {
                  const isSelected = form.label.toLowerCase() === opt.label.toLowerCase();
                  return (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, label: opt.label }))}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        isSelected
                          ? "bg-[#c4622d] text-white border-[#c4622d] shadow-sm"
                          : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <span>{opt.icon}</span>
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Recipient Full Name */}
            <Input
              label="Recipient Name"
              placeholder="e.g. Rahul Sharma"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              required
            />

            {/* Phone Number */}
            <Input
              label="Phone Number"
              type="tel"
              placeholder="10-digit mobile number"
              value={form.phone}
              maxLength={15}
              onChange={(e) => {
                const val = e.target.value.replace(/[^\d+\s-]/g, "").slice(0, 15);
                setForm((prev) => ({ ...prev, phone: val }));
              }}
              required
            />

            {/* Pincode & Auto State Lookup */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Pincode (6 digits)"
                placeholder="e.g. 110001"
                value={form.pincode}
                maxLength={6}
                onChange={(e) => handlePincodeChange(e.target.value)}
                required
              />
              <Input
                label="State"
                placeholder="e.g. Delhi, Maharashtra"
                value={form.state}
                onChange={(e) => setForm((prev) => ({ ...prev, state: e.target.value }))}
                required
              />
            </div>

            {/* Address Line 1 */}
            <Input
              label="Flat / House No. / Street / Area"
              placeholder="e.g. Flat 402, Sunshine Apartments, MG Road"
              value={form.line1}
              onChange={(e) => setForm((prev) => ({ ...prev, line1: e.target.value }))}
              required
            />

            {/* City */}
            <Input
              label="City / Town"
              placeholder="e.g. Mumbai, New Delhi, Bengaluru"
              value={form.city}
              onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))}
              required
            />

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-150">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="py-2.5 px-4 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer border-0"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="py-2.5 px-5 bg-[#c4622d] hover:bg-[#a95223] text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer border-0 disabled:opacity-50 flex items-center gap-1.5"
              >
                {submitting ? "Saving..." : editingAddressId ? "Update Address" : "Save Address"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </section>
  );
}
