import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ProductGrid } from "../components/product/ProductGrid";
import { ReviewCard } from "../components/review/ReviewCard";
import { ReviewForm } from "../components/review/ReviewForm";
import { Spinner } from "../components/ui/Spinner";
import { useAppContext } from "../hooks/useAppContext";
import { useProductDetail } from "../hooks/useProducts";
import { useReviews } from "../hooks/useReviews";
import { formatCurrency } from "../utils/formatCurrency";
import { validatePincode, lookupPincode } from "../utils/validatePincode";
import { getProductFAQsRequest, createQuestionRequest } from "../api/faq.api";
import { notifyMeStockRequest } from "../api/products.api";
import { ReportModal } from "../components/ui/ReportModal";
import { useDocumentMetadata } from "../hooks/useDocumentMetadata";
import { optimizeCloudinaryUrl } from "../utils/optimizeImage";
import { TrackHistoryModal } from "../components/product/TrackHistoryModal";
import { trackAffiliateClickRequest } from "../api/affiliate.api";
import { apiRequest } from "../api/axios";
import { ProductOffers } from "../components/product/ProductOffers";
import { ProductSpecs } from "../components/product/ProductSpecs";
import { ProductAiSummary } from "../components/product/ProductAiSummary";
import { ProductFaqSection } from "../components/product/ProductFaqSection";

// Star SVGs
function Star({ filled, half }) {
  return (
    <svg viewBox="0 0 20 20" className="w-4 h-4"
      fill={filled ? "#f59e0b" : "none"} stroke="#f59e0b" strokeWidth="1.5">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

function StarRow({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => <Star key={i} filled={i < Math.round(rating)} />)}
    </div>
  );
}

const offers = [
  { icon: "🏦", title: "Bank Offer", desc: "10% instant discount on HDFC Bank cards, T&C apply" },
  { icon: "🎁", title: "Special Offer", desc: "Buy 2 get 1 free on select items from this category" },
  { icon: "💳", title: "No-Cost EMI",  desc: "Available on orders above ₹999 — 3, 6, 12 months" },
];

export function ProductDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { product, relatedProducts, loading } = useProductDetail(id);
  const { reviews, submitReview } = useReviews(product?.id);
  const { cart, notify, isAuthenticated, user, orders } = useAppContext();
  const [pincode, setPincode] = useState("");
  const [pinMessage, setPinMessage] = useState("");
  const [selectedThumb, setSelectedThumb] = useState(0);
  const [offersExpanded, setOffersExpanded] = useState(false);
  const [specsOpen, setSpecsOpen] = useState(true);

  // AI Review Summary States & Effects
  const [summaryData, setSummaryData] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState("");

  const fetchSummary = async () => {
    if (!reviews || reviews.length < 5) return;
    setLoadingSummary(true);
    setSummaryError("");
    try {
      const data = await apiRequest("/ai/summarize-reviews", {
        method: "POST",
        body: { reviews: reviews.map((r) => ({ rating: r.rating, comment: r.body })) },
      });
      if (data) {
        setSummaryData(data);
      }
    } catch (err) {
      console.error("AI Summary error:", err);
      setSummaryError(err.message || "Failed to generate review summary.");
    } finally {
      setLoadingSummary(false);
    }
  };

  useEffect(() => {
    if (reviews && reviews.length >= 5) {
      fetchSummary();
    } else {
      setSummaryData(null);
    }
  }, [reviews]);

  // Recently Viewed & Comparison States
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [isInCompare, setIsInCompare] = useState(false);
  const [compareList, setCompareList] = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Track recently viewed
  useEffect(() => {
    if (product && product.id) {
      const local = localStorage.getItem("GaramBazaar_recently_viewed");
      let list = local ? JSON.parse(local) : [];
      list = list.filter((p) => p.id !== product.id);
      list.unshift({
        id: product.id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        emoji: product.emoji,
        badge: product.badge,
        category: product.category,
        rating: product.rating,
        inStock: product.inStock,
        bg: product.bg,
        images: product.images,
      });
      localStorage.setItem("GaramBazaar_recently_viewed", JSON.stringify(list.slice(0, 6)));
    }
  }, [product]);

  // Load recently viewed & comparison state
  const loadCompareState = () => {
    const localRV = localStorage.getItem("GaramBazaar_recently_viewed");
    if (localRV && product?.id) {
      const list = JSON.parse(localRV).filter((p) => p.id !== product.id);
      setRecentlyViewed(list);
    }
    const localComp = localStorage.getItem("GaramBazaar_compare_list");
    const listComp = localComp ? JSON.parse(localComp) : [];
    setCompareList(listComp);
    setIsInCompare(listComp.some((p) => p.id === product?.id));
  };

  useEffect(() => {
    loadCompareState();
    const handleCompareUpdate = () => {
      loadCompareState();
    };
    window.addEventListener("compare-list-updated", handleCompareUpdate);
    return () => {
      window.removeEventListener("compare-list-updated", handleCompareUpdate);
    };
  }, [product?.id]);

  const toggleCompare = () => {
    if (!product) return;
    const local = localStorage.getItem("GaramBazaar_compare_list");
    let list = local ? JSON.parse(local) : [];
    const exists = list.some((p) => p.id === product.id);
    if (exists) {
      list = list.filter((p) => p.id !== product.id);
      setIsInCompare(false);
      notify("Removed from comparison list.");
    } else {
      if (list.length >= 3) {
        notify("You can compare up to 3 products at a time.");
        return;
      }
      list.push({
        id: product.id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        emoji: product.emoji,
        category: product.category,
        rating: product.rating,
        inStock: product.inStock,
        bg: product.bg,
        specifications: product.specifications || {},
      });
      setIsInCompare(true);
      notify("Added to comparison list.");
    }
    localStorage.setItem("GaramBazaar_compare_list", JSON.stringify(list));
    window.dispatchEvent(new Event("compare-list-updated"));
  };

  const orderList = orders?.orders || [];
  const hasPurchased = orderList.some(order => 
    order.status !== "Cancelled" && 
    order.items?.some(item => (item.productId === product?.id || item.productId === product?._id))
  );

  // SEO Dynamic Metadata
  useDocumentMetadata({
    title: product ? `${product.name} | GaramBazaar` : "Loading Product...",
    description: product ? `${product.description.slice(0, 150)}... Sourced directly from GaramBazaar, secure payments, fast setup.` : "Loading product details...",
    schema: product ? {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": product.name,
      "image": product.images?.[0]?.url || "",
      "description": product.description,
      "sku": product.id,
      "offers": {
        "@type": "Offer",
        "url": window.location.href,
        "priceCurrency": "INR",
        "price": product.price,
        "itemCondition": "https://schema.org/NewCondition",
        "availability": product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
      },
      ...(product.reviewCount > 0 ? {
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": product.rating,
          "reviewCount": product.reviewCount
        }
      } : {})
    } : null
  });

  // Report States
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState({ type: "product", id: "", name: "" });

  const handleOpenReport = (type, id, name) => {
    setReportTarget({ type, id, name });
    setReportModalOpen(true);
  };

  const handleShareProduct = async () => {
    const shareUrl = window.location.href;
    const shareData = {
      title: product.name,
      text: `Check out ${product.name} on GaramBazaar!`,
      url: shareUrl,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if (err.name !== "AbortError") {
          copyToClipboard(shareUrl);
        }
      }
    } else {
      copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = (url) => {
    navigator.clipboard.writeText(url)
      .then(() => {
        notify("Product link copied to clipboard! 📋");
      })
      .catch(() => {
        notify("Failed to copy link.");
      });
  };

  // FAQ States
  const [faqs, setFaqs] = useState([]);
  const [questionDraft, setQuestionDraft] = useState("");
  const [submittingQuestion, setSubmittingQuestion] = useState(false);

  useEffect(() => {
    if (product?.id) {
      getProductFAQsRequest(product.id)
        .then((data) => {
          setFaqs(data.faqs || []);
        })
        .catch(() => {});
    }
  }, [product?.id]);

  const handleQuestionSubmit = async (e) => {
    e.preventDefault();
    if (!questionDraft.trim()) return;
    setSubmittingQuestion(true);
    try {
      const res = await createQuestionRequest({
        productId: product.id,
        question: questionDraft.trim(),
      });
      notify("Your question was submitted! Merchants/admins will answer it shortly.");
      setFaqs((current) => [res.faq, ...current]);
      setQuestionDraft("");
    } catch (err) {
      notify(err.message || "Failed to submit question.");
    } finally {
      setSubmittingQuestion(false);
    }
  };

  const handleNotifyMe = async () => {
    if (!isAuthenticated) {
      notify("Please sign in to register for stock alerts.");
      navigate("/auth");
      return;
    }
    try {
      await notifyMeStockRequest(product.id, selectedVariant?.name);
      notify("You will be notified when this item is back in stock! 🔔");
    } catch (err) {
      notify(err.message || "Failed to register stock alert.");
    }
  };

  const [selectedVariant, setSelectedVariant] = useState(null);

  useEffect(() => {
    if (product?.variants && product.variants.length > 0) {
      setSelectedVariant(product.variants[0]);
    } else {
      setSelectedVariant(null);
    }
  }, [product]);

  if (loading || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const displayPrice = selectedVariant ? selectedVariant.price : product.price;
  const displayOriginalPrice = selectedVariant ? selectedVariant.originalPrice : product.originalPrice;
  const displayInStock = selectedVariant ? (selectedVariant.stockCount > 0) : product.inStock;
  const displayDiscount = displayOriginalPrice
    ? Math.round(((displayOriginalPrice - displayPrice) / displayOriginalPrice) * 100)
    : 0;

  const ratingCounts = Array.from({ length: 5 }, (_, i) => {
    const star = 5 - i;
    const count = reviews.filter((r) => Math.round(r.rating) === star).length;
    return { star, count };
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-3 md:px-6 py-5">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[0.75rem] text-gray-500 mb-5 flex-wrap">
          <button onClick={() => navigate("/")} className="hover:text-[#c4622d] transition-colors">Home</button>
          <span>›</span>
          <button onClick={() => navigate("/shop")} className="hover:text-[#c4622d] transition-colors">Shop</button>
          <span>›</span>
          <button onClick={() => navigate(`/shop?category=${product.category}`)} className="hover:text-[#c4622d] transition-colors">
            {product.category}
          </button>
          <span>›</span>
          <span className="text-gray-800 font-medium truncate max-w-[200px]">{product.name}</span>
        </nav>

        {/* ── Main Detail Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr] lg:grid-cols-[420px_1fr_280px] gap-5 lg:gap-6 items-start">

          {/* ── Image Column ── */}
          <div className="space-y-3">
            {/* Main image */}
            <div
              className="rounded-2xl overflow-hidden border border-gray-200 bg-white
                         flex items-center justify-center relative"
              style={{ background: product.bg || "#f5f0e8", minHeight: "320px" }}
            >
              {product.images?.[0]?.url ? (
                <img
                  className="w-full h-[320px] md:h-[380px] object-cover"
                  src={optimizeCloudinaryUrl(product.images[selectedThumb]?.url || product.images[0].url, { width: 800 })}
                  alt={product.name}
                />
              ) : (
                <span className="text-[8rem] select-none">{product.emoji || "📦"}</span>
              )}
              {product.badge && (
                <span className={`absolute top-3 left-3 px-2.5 py-1 rounded text-[0.65rem] font-bold uppercase tracking-wide
                  ${product.badge === "sale" ? "bg-[#c4622d] text-white" : "bg-emerald-600 text-white"}`}>
                  {product.badge}
                </span>
              )}
            </div>

            {/* Thumbnails */}
            {product.images && product.images.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedThumb(i)}
                    className={`w-16 h-16 rounded-xl border-2 flex items-center justify-center
                               text-2xl overflow-hidden transition-all shrink-0
                               ${selectedThumb === i
                                 ? "border-[#c4622d] shadow-sm"
                                 : "border-gray-200 hover:border-gray-400"}`}
                    style={{ background: product.bg || "#f5f0e8" }}
                  >
                    <img src={optimizeCloudinaryUrl(img.url, { width: 150 })} alt={`${product.name} thumbnail ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Info Column ── */}
          <div className="space-y-4">
            {/* Category + name + Report */}
            <div className="flex justify-between items-start gap-4">
              <div>
                <p className="text-[0.72rem] font-bold uppercase tracking-widest text-[#9b6b3a] mb-1">
                  {product.category}
                </p>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900 leading-snug">
                  {product.name}
                </h1>
                {product.seller && (
                  <p className="text-xs text-gray-500 mt-1">
                    Sold by:{" "}
                    <button
                      onClick={() => navigate(`/seller/${product.seller._id || product.seller}`)}
                      className="font-bold text-[#c4622d] hover:underline cursor-pointer bg-transparent border-0 p-0 text-xs"
                    >
                      {product.seller.name || "GaramBazaar Partner"}
                    </button>
                    {product.seller.certificationStatus === "Certified" && (
                      <span className="ml-1.5 text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-semibold border border-emerald-100">
                        ✓ Certified
                      </span>
                    )}
                  </p>
                )}
              </div>
              <div className="flex gap-2 items-center flex-wrap">
                <label className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-gray-500 hover:border-[#ea580c] transition-colors cursor-pointer select-none">
                  <input type="checkbox" checked={isInCompare} onChange={toggleCompare} className="cursor-pointer h-3.5 w-3.5 text-[#ea580c] border-gray-300 rounded focus:ring-[#ea580c]" />
                  <span>⚖️ Compare</span>
                </label>
                <button
                  type="button"
                  onClick={handleShareProduct}
                  className="text-gray-400 hover:text-emerald-600 hover:border-emerald-200 transition-colors text-xs font-semibold flex items-center gap-1 border border-gray-200 rounded-lg px-2.5 py-1 bg-white cursor-pointer hover:bg-emerald-50/20"
                >
                  🔗 Share
                </button>
                {isAuthenticated && (
                  <button
                    type="button"
                    onClick={() => handleOpenReport("product", product.id, product.name)}
                    className="text-gray-400 hover:text-red-600 hover:border-red-200 transition-colors text-xs font-semibold flex items-center gap-1 border border-gray-200 rounded-lg px-2.5 py-1 bg-white cursor-pointer hover:bg-red-50/20"
                  >
                    ⚠️ Report
                  </button>
                )}
              </div>
            </div>

            {/* Rating row */}
            <div className="flex items-center gap-3 flex-wrap">
              <StarRow rating={product.rating} />
              <span className="text-amber-500 font-bold text-sm">{product.rating.toFixed(1)}</span>
              <span className="text-gray-400 text-sm">|</span>
              <span className="text-blue-600 text-sm hover:underline cursor-pointer">
                {product.reviewCount} ratings
              </span>
            </div>

            {/* Price */}
            <div className="border-t border-dashed border-gray-200 pt-4 text-left">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-3xl font-bold text-gray-900">{formatCurrency(displayPrice)}</span>
                {displayOriginalPrice && (
                  <span className="text-base text-gray-400 line-through">{formatCurrency(displayOriginalPrice)}</span>
                )}
                {displayDiscount > 0 && (
                  <span className="text-base font-bold text-emerald-600">{displayDiscount}% off</span>
                )}
              </div>
              {displayOriginalPrice && (
                <p className="text-emerald-600 font-semibold text-sm mt-1">
                  You save {formatCurrency(displayOriginalPrice - displayPrice)}
                </p>
              )}

              {/* Quantity discounts chart */}
              {product.quantityDiscounts && product.quantityDiscounts.length > 0 && (
                <div className="bg-gradient-to-br from-emerald-50/50 to-emerald-100/30 border border-emerald-200/60 rounded-2xl p-4 mt-3">
                  <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest mb-2 flex items-center gap-1">
                    <span>🎁 Bulk Quantity Discounts Available</span>
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {product.quantityDiscounts.map((qd, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-white border border-emerald-100 px-3 py-2 rounded-xl shadow-xs">
                        <span className="text-xs font-semibold text-gray-700">Buy {qd.quantity}+ units</span>
                        <span className="text-[#ea580c] font-black text-xs">Get {qd.discountPercent}% OFF!</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Stock */}
            <div className="flex gap-2 items-center flex-wrap">
              <span className={`inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1 rounded-full
                ${displayInStock
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-red-50 text-red-600 border border-red-200"}`}>
                <span className="w-2 h-2 rounded-full inline-block"
                  style={{ background: displayInStock ? "#16a34a" : "#dc2626" }} />
                {displayInStock ? "In Stock" : "Out of Stock"}
              </span>

              {displayInStock && selectedVariant && selectedVariant.stockCount < 5 && (
                <span className="bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-3 py-1 text-xs font-semibold">
                  ⚠️ Low Stock (Only {selectedVariant.stockCount} left!)
                </span>
              )}
              {displayInStock && !selectedVariant && product.stockCount < 5 && (
                <span className="bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-3 py-1 text-xs font-semibold">
                  ⚠️ Low Stock (Only {product.stockCount} left!)
                </span>
              )}
            </div>

            {/* Product Variants Selector */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-2.5">
                <p className="text-[0.78rem] font-bold text-gray-700 uppercase tracking-wider">
                  Select Option:
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => {
                    const isSelected = selectedVariant?.name === v.name;
                    return (
                      <button
                        key={v.name}
                        onClick={() => setSelectedVariant(v)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border-2
                          ${isSelected
                            ? "bg-[#c4622d] border-[#c4622d] text-white shadow-sm"
                            : "bg-white border-gray-200 hover:border-gray-300 text-gray-700"}`}
                      >
                        {v.name} (₹{v.price})
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Description */}
            <p className="text-gray-600 text-[0.88rem] leading-relaxed">{product.description}</p>

            {/* Offers */}
            <ProductOffers
              offers={offers}
              offersExpanded={offersExpanded}
              setOffersExpanded={setOffersExpanded}
            />

            {/* Specifications (accordion) */}
            <ProductSpecs
              specifications={product.specifications}
              specsOpen={specsOpen}
              setSpecsOpen={setSpecsOpen}
            />
          </div>

          {/* ── Sticky Buy Panel ── */}
          <div className="md:col-span-2 lg:col-span-1">
            <div className="sticky top-24 bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
              {/* Price */}
              <div>
                <span className="text-2xl font-bold text-gray-900">{formatCurrency(displayPrice)}</span>
                {displayOriginalPrice && (
                  <span className="text-sm text-gray-400 line-through ml-2">{formatCurrency(displayOriginalPrice)}</span>
                )}
              </div>

              {/* Stock pill */}
              <div className={`text-sm font-semibold ${displayInStock ? "text-emerald-600" : "text-red-500"}`}>
                {displayInStock ? "✓ In Stock" : "✗ Currently Unavailable"}
              </div>

              {/* Delivery info */}
              <div className="bg-gray-50 rounded-xl p-3 space-y-2">
                <p className="text-[0.78rem] font-bold text-gray-700 mb-2">📍 Delivery Info</p>
                {[
                  "📦 Free delivery on orders above ₹500",
                  "↩️ 7-day easy returns",
                  "🔒 Secure & encrypted checkout",
                ].map((line) => (
                  <p key={line} className="text-[0.75rem] text-gray-600">{line}</p>
                ))}
              </div>

              {/* Pincode check or Affiliate Info */}
              {product.productType === "affiliate" ? (
                <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-3 text-xs leading-relaxed text-gray-600">
                  <span className="font-bold text-gray-800 block mb-1">Affiliate Product</span>
                  This item is listed via Amazon Associates. Clicking below will open the Amazon product page in a new window.
                </div>
              ) : (
                <div>
                  <p className="text-[0.75rem] font-semibold text-gray-700 mb-1.5">Check delivery availability</p>
                  <div className="flex gap-2">
                    <input
                      placeholder="Enter pincode"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      maxLength={6}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm
                                 focus:outline-none focus:border-[#c4622d] focus:ring-1 focus:ring-[#c4622d]/30"
                    />
                    <button
                      onClick={() => {
                        const res = lookupPincode(pincode);
                        if (res.valid) {
                          setPinMessage(`✅ ${res.estimatedDeliveryText} (${res.region}, ${res.state}) • ${res.fastestDelivery}`);
                        } else {
                          setPinMessage(`❌ ${res.message}`);
                        }
                      }}
                      className="bg-gray-800 hover:bg-gray-900 text-white text-sm font-semibold
                                 px-4 py-2 rounded-lg transition-colors cursor-pointer"
                    >
                      Check
                    </button>
                  </div>
                  {pinMessage && (
                    <p className="text-[0.75rem] mt-1.5 font-medium text-gray-700">{pinMessage}</p>
                  )}
                </div>
              )}

              {/* CTA Buttons */}
              {user?.role === "seller" ? (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4 text-center text-xs font-semibold leading-relaxed shadow-sm">
                  🏪 Merchant Viewing Mode: <br /> Sellers are restricted from purchasing products.
                </div>
              ) : (
                <div className="space-y-3 pt-1">
                  {!displayInStock ? (
                    <button
                      onClick={handleNotifyMe}
                      className="w-full py-3 bg-[#c4622d] hover:bg-[#e07a4a] text-white rounded-xl font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      🔔 Notify Me when Back in Stock
                    </button>
                  ) : (
                    <>
                      {product.productType === "affiliate" ? (
                        <>
                          <button
                            onClick={async () => {
                              const triggerAction = async (email = null, phone = null) => {
                                try {
                                  if (user) {
                                    await trackAffiliateClickRequest(product.id);
                                  } else if (email) {
                                    await trackAffiliateClickRequest(product.id, email, phone);
                                  }
                                  window.open(product.affiliateLink, "_blank", "noopener,noreferrer");
                                } catch (err) {
                                  console.error("Action tracking failed:", err);
                                  notify(err.message || "Failed to process order.");
                                }
                              };

                              if (user) {
                                await triggerAction();
                                return;
                              }

                              const guestEmail = localStorage.getItem("guestEmail");
                              const guestPhone = localStorage.getItem("guestPhone") || "";
                              if (guestEmail) {
                                await triggerAction(guestEmail, guestPhone);
                                return;
                              }

                              setIsModalOpen(true);
                            }}
                            className="w-full py-3 rounded-xl font-bold text-sm transition-all text-center shadow-sm cursor-pointer border-2 border-amber-500 bg-amber-500 hover:bg-amber-600 text-white"
                          >
                            {product.source === "chrome-extension"
                              ? "Install Extension"
                              : product.source === "web-app"
                              ? "Try Web App"
                              : product.source === "play-store"
                              ? "Get on Play Store"
                              : product.source === "amazon"
                              ? "Buy on Amazon"
                              : "Visit Product"}
                          </button>
                          {product.source === "amazon" && (
                            <p className="text-[10px] text-gray-500 text-center leading-snug italic px-1">
                              *As an Amazon Associate I earn from qualifying purchases.*
                            </p>
                          )}
                        </>
                      ) : (
                        <div className="flex flex-col sm:flex-row gap-3">
                          <button
                            onClick={() => {
                              const itemToCart = {
                                ...product,
                                price: displayPrice,
                                originalPrice: displayOriginalPrice,
                                variantName: selectedVariant ? selectedVariant.name : undefined,
                              };
                              cart.addToCart(itemToCart);
                              notify(`${product.name}${selectedVariant ? ` (${selectedVariant.name})` : ""} added to cart.`);
                            }}
                            className="w-full py-3 rounded-xl font-bold text-sm border-2 transition-all border-[#c4622d] text-[#c4622d] hover:bg-[#c4622d] hover:text-white cursor-pointer bg-transparent"
                          >
                            🛒 Add to Cart
                          </button>
                          <button
                            onClick={() => {
                              const itemToCart = {
                                ...product,
                                price: displayPrice,
                                originalPrice: displayOriginalPrice,
                                variantName: selectedVariant ? selectedVariant.name : undefined,
                              };
                              cart.addToCart(itemToCart);
                              navigate("/cart");
                            }}
                            className="w-full py-3 rounded-xl font-bold text-sm transition-all bg-[#c4622d] hover:bg-[#e07a4a] text-white shadow-sm cursor-pointer border-0"
                          >
                            ⚡ Buy Now
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Trust mini-row */}
              <div className="flex justify-around pt-1 border-t border-gray-100">
                {[["🔒", "Secure"], ["↩️", "Returns"], ["🌿", "Natural"]].map(([icon, lbl]) => (
                  <div key={lbl} className="flex flex-col items-center gap-1 text-center">
                    <span className="text-lg">{icon}</span>
                    <span className="text-[0.62rem] text-gray-500 font-medium">{lbl}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        {isModalOpen && (
          <TrackHistoryModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSubmit={async ({ email, phone }) => {
              localStorage.setItem("guestEmail", email);
              if (phone) {
                localStorage.setItem("guestPhone", phone);
              }
              setIsModalOpen(false);

              try {
                await trackAffiliateClickRequest(product.id, email, phone);
                if (product.productType === "affiliate") {
                  window.open(product.affiliateLink, "_blank", "noopener,noreferrer");
                } else {
                  notify(`🎉 Order processed! Added to your order history.`);
                }
              } catch (err) {
                console.error("Action tracking failed:", err);
                notify(err.message || "Failed to process order.");
              }
            }}
            product={product}
          />
        )}

        {/* ── Reviews Section ── */}
        <section className="mt-10 bg-white rounded-2xl border border-gray-200 p-5 md:p-8">
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="text-[0.68rem] font-bold uppercase tracking-widest text-[#9b6b3a] mb-0.5">
                Customer Feedback
              </p>
              <h2 className="text-xl font-bold text-[#2c1a0e]">Reviews & Ratings</h2>
            </div>
          </div>

          {/* Rating Summary */}
          <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6 mb-8 p-5
                          bg-[#f5f0e8] rounded-xl border border-[#e0d5c5]">
            {/* Big number */}
            <div className="flex flex-col items-center justify-center text-center px-6 border-r border-[#e0d5c5]">
              <strong className="text-5xl font-extrabold text-[#2c1a0e]">{product.rating.toFixed(1)}</strong>
              <StarRow rating={product.rating} />
              <p className="text-[0.72rem] text-gray-500 mt-1">{reviews.length} reviews</p>
            </div>

            {/* Rating bars 5★ → 1★ */}
            <div className="space-y-2 flex-1">
              {ratingCounts.map(({ star, count }) => {
                const pct = reviews.length ? Math.round((count / reviews.length) * 100) : 0;
                return (
                  <div key={star} className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-gray-600 w-4 text-right">{star}★</span>
                    <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 w-8">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Review Form */}
          {user?.role === "seller" ? (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4 mb-6 text-xs font-semibold leading-relaxed shadow-sm">
              🏪 Merchant Viewing Mode: Sellers cannot submit ratings or reviews.
            </div>
          ) : isAuthenticated ? (
            hasPurchased ? (
              <div className="mb-8">
                <h3 className="font-bold text-gray-800 mb-3 text-sm">Write a Review</h3>
                <ReviewForm
                  productId={product.id}
                  onSubmit={async (payload) => {
                    try {
                      await submitReview(payload);
                      notify("Review submitted successfully! Thank you. 🌟");
                    } catch (err) {
                      notify(err.message || "Failed to submit review.");
                    }
                  }}
                />
              </div>
            ) : (
              <div className="bg-amber-50 border border-[#e0d5c5] rounded-2xl p-5 mb-6 text-xs text-amber-805 flex items-start gap-3.5 shadow-sm max-w-2xl">
                <span className="text-xl shrink-0">🔒</span>
                <div>
                  <p className="font-bold text-gray-900 text-sm mb-1">Verified Purchase Required</p>
                  <p className="text-gray-600 leading-relaxed">
                    Only verified buyers who have purchased this product can leave a review. 
                    If you placed an order, please wait for payment confirmation or check its status under 
                    <button onClick={() => navigate("/orders")} className="underline font-semibold text-amber-800 hover:text-amber-900 ml-1">My Orders</button>.
                  </p>
                </div>
              </div>
            )
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-6 text-sm text-blue-700">
              <button onClick={() => navigate("/auth")} className="font-semibold underline">Sign in</button> to leave a review.
            </div>
          )}

          {/* AI Review Summary */}
          <ProductAiSummary
            reviewsCount={reviews.length}
            loadingSummary={loadingSummary}
            summaryError={summaryError}
            summaryData={summaryData}
            onRetry={fetchSummary}
          />

          {/* Review List */}
          <div className="space-y-4">
            {reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                onReport={isAuthenticated ? (rev) => handleOpenReport("review", rev.id, `Review by ${rev.name}`) : null}
              />
            ))}
            {reviews.length === 0 && (
              <p className="text-center text-gray-500 text-sm py-8">No reviews yet. Be the first!</p>
            )}
          </div>
        </section>

        {/* ── FAQ / Q&A Section ── */}
        <ProductFaqSection
          faqs={faqs}
          user={user}
          isAuthenticated={isAuthenticated}
          questionDraft={questionDraft}
          setQuestionDraft={setQuestionDraft}
          submittingQuestion={submittingQuestion}
          handleQuestionSubmit={handleQuestionSubmit}
          navigate={navigate}
        />

        {/* ── Related Products ── */}
        {relatedProducts.length > 0 && (
          <section className="mt-8">
            <div className="flex items-end justify-between mb-4">
              <div>
                <p className="text-[0.68rem] font-bold uppercase tracking-widest text-[#9b6b3a] mb-0.5">
                  You May Also Like
                </p>
                <h2 className="text-xl font-bold text-[#2c1a0e]">Related Products</h2>
              </div>
            </div>
            <ProductGrid products={relatedProducts} />
          </section>
        )}
        {/* Report Modal */}
        <ReportModal
          isOpen={reportModalOpen}
          onClose={() => setReportModalOpen(false)}
          reportType={reportTarget.type}
          targetId={reportTarget.id}
          targetName={reportTarget.name}
        />

        {/* Recently Viewed Products */}
        {recentlyViewed.length > 0 && (
          <section className="mt-10">
            <div className="flex items-end justify-between mb-4">
              <div>
                <p className="text-[0.68rem] font-bold uppercase tracking-widest text-[#9b6b3a] mb-0.5">
                  Based on your activity
                </p>
                <h2 className="text-xl font-bold text-[#2c1a0e]">Recently Viewed Products</h2>
              </div>
            </div>
            <ProductGrid products={recentlyViewed} />
          </section>
        )}

        {/* Floating Compare Bar */}
        {compareList.length > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-gray-950/85 backdrop-blur-md border border-white/10 rounded-2xl px-5 py-3.5 flex items-center gap-5 shadow-2xl animate-fade-in max-w-[90vw] md:max-w-lg">
            <div className="flex items-center gap-2">
              <span className="text-lg">⚖️</span>
              <div className="text-left">
                <p className="text-xs font-bold text-white">Compare Products</p>
                <p className="text-[10px] text-gray-400 font-semibold mt-0.5">{compareList.length} / 3 selected</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowCompareModal(true)}
                disabled={compareList.length < 2}
                className="bg-[#ea580c] hover:bg-[#ea580c]/90 disabled:opacity-50 text-white font-bold text-xs py-1.5 px-3.5 rounded-xl cursor-pointer border-0 shadow-sm transition-colors whitespace-nowrap"
              >
                Compare Now
              </button>
              <button
                type="button"
                onClick={() => {
                  localStorage.setItem("GaramBazaar_compare_list", JSON.stringify([]));
                  window.dispatchEvent(new Event("compare-list-updated"));
                }}
                className="bg-transparent text-gray-400 hover:text-white font-bold text-xs py-1.5 px-2 rounded-xl cursor-pointer border-0 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Compare Modal */}
        {showCompareModal && (
          <Modal title="Side-by-Side Product Comparison" onClose={() => setShowCompareModal(false)}>
            <div className="max-w-4xl mx-auto overflow-x-auto py-2">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-150">
                    <th className="p-3 font-bold text-gray-500 w-1/4">Specification</th>
                    {compareList.map((p) => (
                      <th key={p.id} className="p-3 w-1/4 align-top">
                        <div className="flex flex-col items-center text-center gap-1.5">
                          <span className="text-3xl">{p.emoji || "📦"}</span>
                          <span className="font-bold text-gray-900 line-clamp-1">{p.name}</span>
                          <span className="font-black text-[#ea580c]">{formatCurrency(p.price)}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <td className="p-3 font-bold text-gray-600">Category</td>
                    {compareList.map((p) => (
                      <td key={p.id} className="p-3 text-gray-800 font-semibold">{p.category}</td>
                    ))}
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="p-3 font-bold text-gray-600">Availability</td>
                    {compareList.map((p) => (
                      <td key={p.id} className="p-3 text-gray-800 font-semibold">
                        {p.inStock ? "✓ In Stock" : "✗ Out of Stock"}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <td className="p-3 font-bold text-gray-600">Rating</td>
                    {compareList.map((p) => (
                      <td key={p.id} className="p-3 text-gray-800 font-semibold">
                        ⭐ {p.rating.toFixed(1)}
                      </td>
                    ))}
                  </tr>
                  {/* Collect all specs keys from all items to compare */}
                  {Array.from(
                    new Set(
                      compareList.flatMap((p) => Object.keys(p.specifications || {}))
                    )
                  ).map((specKey, idx) => (
                    <tr key={specKey} className={`border-b border-gray-100 ${idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                      <td className="p-3 font-bold text-gray-600">{specKey}</td>
                      {compareList.map((p) => (
                        <td key={p.id} className="p-3 text-gray-700">
                          {p.specifications?.[specKey] || "—"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
}
