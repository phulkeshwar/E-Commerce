import { useState } from "react";
import { ImageUploadZone } from "./ImageUploadZone";
import {
  createAdminBrandRequest,
  deleteAdminBrandRequest,
} from "../../api/admin.api";
import { apiRequest } from "../../api/axios";

export function AdminBrandsTab({
  brandsList,
  loadingBrands,
  loadBrands,
  notify,
  confirm,
  setPromptConfig,
}) {
  const [newBrand, setNewBrand] = useState({
    brand: "",
    title: "",
    copy: "",
    offer: "",
    accent: "#2f5f4b",
    image: "",
  });
  const [loadingSpotlightAI, setLoadingSpotlightAI] = useState(false);

  const handleAIDraftSpotlight = () => {
    if (!newBrand.brand.trim()) {
      notify("Please enter the Brand Name first.");
      return;
    }
    setPromptConfig({
      title: `Draft Spotlight for ${newBrand.brand}`,
      description: `Enter campaign highlights or products to focus on for ${newBrand.brand} (e.g. 'organic skincare, 20% off all spices').`,
      placeholder: "e.g. organic skincare, 20% off all spices",
      onSubmit: async (highlight) => {
        if (!highlight || !highlight.trim()) return;
        setLoadingSpotlightAI(true);
        try {
          const data = await apiRequest("/ai/draft-spotlight", {
            method: "POST",
            body: { brandName: newBrand.brand.trim(), highlight: highlight.trim() },
          });
          if (data) {
            setNewBrand((current) => ({
              ...current,
              title: data.title || "",
              copy: data.copy || "",
              offer: data.offer || "",
              accent: data.accent || "#c4622d",
            }));
            notify("✨ Spotlight banner suggestions drafted with AI!");
          }
        } catch (err) {
          console.error(err);
          notify(err.message || "Failed to draft spotlight banner.");
        } finally {
          setLoadingSpotlightAI(false);
        }
      },
    });
  };

  const handleCreateBrand = async (e) => {
    e.preventDefault();
    if (
      !newBrand.brand ||
      !newBrand.title ||
      !newBrand.copy ||
      !newBrand.offer ||
      !newBrand.image
    ) {
      notify("All fields are required.");
      return;
    }
    try {
      await createAdminBrandRequest(newBrand);
      notify("Brand spotlight created successfully.");
      setNewBrand({
        brand: "",
        title: "",
        copy: "",
        offer: "",
        accent: "#2f5f4b",
        image: "",
      });
      loadBrands().catch(() => {});
    } catch (err) {
      notify(err.message || "Failed to create brand spotlight.");
    }
  };

  const handleDeleteBrand = async (id) => {
    if (!(await confirm("Are you sure you want to delete this brand spotlight?"))) return;
    try {
      await deleteAdminBrandRequest(id);
      notify("Brand spotlight deleted successfully.");
      loadBrands().catch(() => {});
    } catch (err) {
      notify(err.message || "Failed to delete brand spotlight.");
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 stack">
      <div className="section-head mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">📢 Brand Spotlight Management</h2>
          <p className="text-xs text-gray-500">
            Create and manage the brand spotlights featured on the store homepage.
          </p>
        </div>
      </div>

      {/* Add Brand Form */}
      <form
        onSubmit={handleCreateBrand}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-5 rounded-xl border border-gray-150 mb-6 text-sm"
      >
        <div className="field">
          <div className="flex justify-between items-center w-full">
            <label className="label text-xs font-semibold text-gray-700 m-0">Brand Name</label>
            {newBrand.brand.trim() && (
              <button
                type="button"
                onClick={handleAIDraftSpotlight}
                disabled={loadingSpotlightAI}
                className="text-xs text-amber-600 hover:text-amber-700 font-bold flex items-center gap-1 cursor-pointer bg-transparent border-0 p-0 mb-1"
              >
                {loadingSpotlightAI ? "⏳ Drafting..." : "✨ Generate Spotlight with AI"}
              </button>
            )}
          </div>
          <input
            type="text"
            className="input py-2"
            required
            placeholder="e.g. Pahadi Roots"
            value={newBrand.brand}
            onChange={(e) => setNewBrand({ ...newBrand, brand: e.target.value })}
          />
        </div>
        <div className="field">
          <label className="label text-xs font-semibold text-gray-700">Campaign Title</label>
          <input
            type="text"
            className="input py-2"
            required
            placeholder="e.g. Mountain Pantry Festival"
            value={newBrand.title}
            onChange={(e) => setNewBrand({ ...newBrand, title: e.target.value })}
          />
        </div>
        <div className="field col-span-2">
          <label className="label text-xs font-semibold text-gray-700">
            Marketing Description / Copy
          </label>
          <textarea
            className="input min-h-[60px] py-2"
            required
            placeholder="e.g. Stone-ground flours, wild honey, and Himalayan salts..."
            value={newBrand.copy}
            onChange={(e) => setNewBrand({ ...newBrand, copy: e.target.value })}
          />
        </div>
        <div className="field">
          <label className="label text-xs font-semibold text-gray-700">Offer Text</label>
          <input
            type="text"
            className="input py-2"
            required
            placeholder="e.g. Up to 25% off"
            value={newBrand.offer}
            onChange={(e) => setNewBrand({ ...newBrand, offer: e.target.value })}
          />
        </div>
        <div className="field">
          <label className="label text-xs font-semibold text-gray-700">Accent Color (HEX)</label>
          <div className="flex gap-2">
            <input
              type="color"
              className="w-10 h-10 border border-gray-300 rounded-lg cursor-pointer bg-white"
              value={newBrand.accent}
              onChange={(e) => setNewBrand({ ...newBrand, accent: e.target.value })}
            />
            <input
              type="text"
              className="input py-2 flex-grow"
              required
              placeholder="#2f5f4b"
              value={newBrand.accent}
              onChange={(e) => setNewBrand({ ...newBrand, accent: e.target.value })}
            />
          </div>
        </div>
        <div className="field col-span-2">
          <ImageUploadZone
            label="Campaign Image"
            value={newBrand.image}
            onChange={(url) => setNewBrand({ ...newBrand, image: url })}
          />
        </div>
        <div className="col-span-2 flex justify-end">
          <button type="submit" className="button button-primary py-2 font-semibold">
            Create Brand Spotlight
          </button>
        </div>
      </form>

      {/* Brands List Table */}
      {loadingBrands ? (
        <p className="text-sm text-gray-500 py-6 text-center animate-pulse">Loading brands list...</p>
      ) : brandsList.length > 0 ? (
        <div className="table-card bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b-2 border-gray-200">
                <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider text-left">
                  Brand
                </th>
                <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider text-left">
                  Title
                </th>
                <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider text-left">
                  Offer
                </th>
                <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider text-left">
                  Color
                </th>
                <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider text-left">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {brandsList.map((bd) => (
                <tr key={bd.id} className="hover:bg-amber-50/40 transition-colors">
                  <td className="!py-3 !px-4 font-semibold text-gray-900 text-sm">{bd.brand}</td>
                  <td className="!py-3 !px-4 text-gray-700 text-xs">{bd.title}</td>
                  <td className="!py-3 !px-4 text-gray-700 text-xs font-bold">{bd.offer}</td>
                  <td className="!py-3 !px-4 text-xs">
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-white font-bold text-[10px]"
                      style={{ backgroundColor: bd.accent }}
                    >
                      {bd.accent}
                    </span>
                  </td>
                  <td className="!py-3 !px-4">
                    <button
                      type="button"
                      className="text-red-500 hover:text-red-700 font-semibold text-xs transition-colors"
                      onClick={() => handleDeleteBrand(bd.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-gray-500 py-10 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
          No brand spotlights created yet. Fill in the form above to add one.
        </p>
      )}
    </div>
  );
}
