import { useState } from "react";
import { ImageUploadZone } from "./ImageUploadZone";
import { updateAdminSettingsRequest } from "../../api/admin.api";
import { apiRequest } from "../../api/axios";

export function AdminSettingsTab({
  siteSettings,
  setSiteSettings,
  loadingSettings,
  savingSettings,
  setSavingSettings,
  loadSiteSettings,
  notify,
  setPromptConfig,
}) {
  const [loadingSettingsAI, setLoadingSettingsAI] = useState(false);
  const [newBanner, setNewBanner] = useState({
    imageUrl: "",
    linkUrl: "/shop",
    title: "",
  });

  const handleAISiteSettings = () => {
    setPromptConfig({
      title: "Draft Banner Suggestions",
      description:
        "Enter a seasonal theme or campaign name to auto-populate the homepage banner title and redirect link with AI suggestions.",
      placeholder: "e.g. Monsoon Deals, Winter Spices",
      onSubmit: async (theme) => {
        if (!theme || !theme.trim()) return;
        setLoadingSettingsAI(true);
        try {
          const data = await apiRequest("/ai/suggest-site-settings", {
            method: "POST",
            body: { season: theme.trim() },
          });
          if (data) {
            setNewBanner((current) => ({
              ...current,
              title: data.heroHeadline || data.announcementBarText || "",
              linkUrl: "/shop",
            }));
            notify("✨ Banner suggestions populated in the Add Banner form!");
          }
        } catch (err) {
          console.error(err);
          notify(err.message || "Failed to generate banner suggestions.");
        } finally {
          setLoadingSettingsAI(false);
        }
      },
    });
  };

  const handleUpdateSettings = async (e) => {
    if (e) e.preventDefault();
    setSavingSettings(true);
    try {
      await updateAdminSettingsRequest({
        shippingFee: Number(siteSettings.shippingFee),
        shippingFreeThreshold: Number(siteSettings.shippingFreeThreshold),
        homepageBanners: siteSettings.homepageBanners,
      });
      notify("Site settings updated successfully! ⚙️");
      await loadSiteSettings();
    } catch (err) {
      notify(err.message || "Failed to update site settings.");
    } finally {
      setSavingSettings(false);
    }
  };

  const handleAddBanner = (e) => {
    e.preventDefault();
    if (!newBanner.imageUrl) {
      notify("Please provide a banner image URL.");
      return;
    }
    setSiteSettings((prev) => ({
      ...prev,
      homepageBanners: [...prev.homepageBanners, newBanner],
    }));
    setNewBanner({ imageUrl: "", linkUrl: "/shop", title: "" });
  };

  const handleRemoveBanner = (indexToRemove) => {
    setSiteSettings((prev) => ({
      ...prev,
      homepageBanners: prev.homepageBanners.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 stack">
      <div className="section-head mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900">⚙️ Site Configuration Settings</h2>
          <p className="text-xs text-gray-500">
            Configure global platform shipping variables and manage homepage promo banners.
          </p>
        </div>
      </div>

      {loadingSettings ? (
        <p className="text-sm text-gray-500 py-10 text-center animate-pulse">Loading settings...</p>
      ) : (
        <div className="space-y-8">
          {/* Shipping variables */}
          <form onSubmit={handleUpdateSettings} className="space-y-6 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="field">
                <label className="label text-xs font-bold text-gray-700">Base Shipping Fee (₹)</label>
                <input
                  type="number"
                  className="input py-2.5"
                  required
                  min="0"
                  value={siteSettings.shippingFee}
                  onChange={(e) =>
                    setSiteSettings({ ...siteSettings, shippingFee: e.target.value })
                  }
                />
                <span className="text-[10px] text-gray-400 mt-1 block">
                  Default fee applied to orders below the free delivery threshold.
                </span>
              </div>
              <div className="field">
                <label className="label text-xs font-bold text-gray-700">
                  Free Delivery Threshold (₹)
                </label>
                <input
                  type="number"
                  className="input py-2.5"
                  required
                  min="0"
                  value={siteSettings.shippingFreeThreshold}
                  onChange={(e) =>
                    setSiteSettings({
                      ...siteSettings,
                      shippingFreeThreshold: e.target.value,
                    })
                  }
                />
                <span className="text-[10px] text-gray-400 mt-1 block">
                  Subtotal threshold above which delivery becomes free.
                </span>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={savingSettings}
                className="px-5 py-2.5 bg-[#c4622d] text-white hover:bg-[#e07a4a] rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer border-0"
              >
                {savingSettings ? "Saving Settings..." : "Save Shipping Configuration"}
              </button>
            </div>
          </form>

          <hr className="border-gray-100" />

          {/* Promo Banners */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-[#9b6b3a] mb-1">
                  🖼️ Homepage Carousel Banners
                </h3>
                <p className="text-xs text-gray-500">
                  Add or remove promotional slider banners displayed on the homepage hero section.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAISiteSettings}
                disabled={loadingSettingsAI}
                className="border border-[#c4622d] hover:bg-[#c4622d]/5 text-[#c4622d] font-bold py-1.5 px-3 rounded-lg text-xs transition-colors cursor-pointer bg-white shrink-0"
              >
                {loadingSettingsAI ? "⏳ Drafting..." : "✨ Draft Banner with AI"}
              </button>
            </div>

            {/* Add Banner Form */}
            <form
              onSubmit={handleAddBanner}
              className="bg-gray-50 rounded-xl border border-gray-150 p-5 space-y-4 text-xs text-left"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="field">
                  <label className="label text-xs font-semibold text-gray-700">
                    Banner Title / Caption
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Up to 30% Off Organic Honey"
                    className="input py-2"
                    value={newBanner.title}
                    onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })}
                  />
                </div>
                <div className="field">
                  <label className="label text-xs font-semibold text-gray-700">
                    Target Redirect Link
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. /shop?category=Pantry"
                    className="input py-2"
                    value={newBanner.linkUrl}
                    onChange={(e) => setNewBanner({ ...newBanner, linkUrl: e.target.value })}
                  />
                </div>
              </div>

              <div className="field text-left">
                <ImageUploadZone
                  label="Banner Image (16:9 recommended)"
                  value={newBanner.imageUrl}
                  onChange={(url) => setNewBanner({ ...newBanner, imageUrl: url })}
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-gray-900 rounded-lg text-xs font-bold transition-all shadow-md cursor-pointer border-0"
                >
                  ➕ Add Banner to Queue
                </button>
              </div>
            </form>

            {/* Banner list */}
            <div className="space-y-3">
              <span className="block text-xs font-bold text-gray-700">
                Current Homepage Banners ({siteSettings.homepageBanners.length})
              </span>
              {siteSettings.homepageBanners.length === 0 ? (
                <p className="text-xs text-gray-400 italic bg-gray-50 rounded-xl border border-dashed border-gray-250 p-6 text-center">
                  No promotional banners configured. Default hero section will be displayed.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {siteSettings.homepageBanners.map((banner, idx) => (
                    <div
                      key={idx}
                      className="relative rounded-xl overflow-hidden border border-gray-200 bg-white flex flex-col group shadow-sm"
                    >
                      <img
                        src={banner.imageUrl}
                        alt={banner.title}
                        className="w-full h-32 object-cover"
                      />
                      <div className="p-3 text-left">
                        <p className="font-bold text-gray-900 text-xs truncate">
                          {banner.title || "(Untitled Banner)"}
                        </p>
                        <p className="text-[10px] text-gray-400 truncate mt-0.5">
                          Link: {banner.linkUrl}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveBanner(idx)}
                        className="absolute top-2 right-2 p-1.5 bg-red-650 hover:bg-red-750 text-white rounded-full transition-colors opacity-90 group-hover:opacity-100 border-0 shadow-sm cursor-pointer"
                        title="Remove banner"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {siteSettings.homepageBanners.length > 0 && (
              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={handleUpdateSettings}
                  disabled={savingSettings}
                  className="px-5 py-2.5 bg-[#c4622d] text-white hover:bg-[#e07a4a] rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer border-0"
                >
                  {savingSettings ? "Saving Settings..." : "Save Banner Changes"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
