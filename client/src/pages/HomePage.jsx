import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ProductGrid } from "../components/product/ProductGrid";
import { Spinner } from "../components/ui/Spinner";
import { useAppContext } from "../hooks/useAppContext";
import { useProducts } from "../hooks/useProducts";
import { useTimer } from "../hooks/useTimer";
import { getBrandsRequest } from "../api/brand.api";
import { getSettingsRequest } from "../api/settings.api";
import { useDocumentMetadata } from "../hooks/useDocumentMetadata";

const brandAds = [
  {
    brand: "Pahadi Roots",
    title: "Mountain Pantry Festival",
    copy: "Stone-ground flours, wild honey, and Himalayan salts for slow weekend cooking.",
    offer: "Up to 25% off",
    accent: "#2f5f4b",
    image: "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&w=900&q=80",
  },
  {
    brand: "Brew Yard",
    title: "Café-style Mornings",
    copy: "Single-origin coffee, cocoa mixes, and breakfast blends delivered fresh.",
    offer: "Buy 2, Save 15%",
    accent: "#6f3f22",
    image: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=900&q=80",
  },
  {
    brand: "Leaf & Loom",
    title: "Clean Home Essentials",
    copy: "Plant-powered cleaners, soft linens, and fragrance-light care for everyday spaces.",
    offer: "Flat 20% off",
    accent: "#365e7d",
    image: "https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?auto=format&fit=crop&w=900&q=80",
  },
  {
    brand: "Ayur Glow",
    title: "Ritual-ready Self Care",
    copy: "Herbal oils, body butters, and calming teas made for your evening reset.",
    offer: "Combo deals live",
    accent: "#914d42",
    image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=900&q=80",
  },
];

// Deleted static categoryData

const trustItems = [
  { icon: "🚚", title: "Free Delivery", sub: "On orders above ₹500" },
  { icon: "🌿", title: "100% Natural",  sub: "No harmful additives" },
  { icon: "↩️", title: "7-Day Returns", sub: "Hassle-free returns" },
  { icon: "🔒", title: "Secure Checkout", sub: "256-bit SSL encrypted" },
  { icon: "⭐", title: "50K+ Customers", sub: "Trusted across India" },
];

const promoCards = [
  {
    title: "Free Delivery",
    sub: "On orders above ₹500. No minimum on select items.",
    icon: "🚚",
    gradient: "from-[#2c1a0e] to-[#5a3a1a]",
  },
  {
    title: "100% Natural",
    sub: "All products verified. No harmful additives.",
    icon: "🌿",
    gradient: "from-[#4e6b55] to-[#7a8c6e]",
  },
  {
    title: "Earn Rewards",
    sub: "Shop and earn GaramCoins on every order.",
    icon: "🪙",
    gradient: "from-[#7a4a1a] to-[#c4622d]",
  },
  {
    title: "Refer & Save",
    sub: "Get ₹100 off when a friend shops for the first time.",
    icon: "🎁",
    gradient: "from-[#365e7d] to-[#5a8faa]",
  },
];

export function HomePage() {
  const navigate = useNavigate();
  const { products, featured, loading } = useProducts({});
  const timer = useTimer();
  const { categories } = useAppContext();

  const getCategoryStyles = (name, index) => {
    const presets = {
      pantry: { color: "bg-orange-50 border-orange-200", text: "text-orange-700" },
      beverages: { color: "bg-brown-50 border-[#c4622d]/20", text: "text-[#c4622d]" },
      home: { color: "bg-blue-50 border-blue-200", text: "text-blue-700" },
      "personal care": { color: "bg-pink-50 border-pink-200", text: "text-pink-700" },
      health: { color: "bg-green-50 border-green-200", text: "text-green-700" },
      software: { color: "bg-indigo-50 border-indigo-200", text: "text-indigo-700" },
      gadgets: { color: "bg-amber-50 border-amber-300", text: "text-amber-800" },
    };
    const key = name.toLowerCase().trim();
    if (presets[key]) return presets[key];

    const colors = [
      { color: "bg-amber-50 border-amber-200", text: "text-amber-700" },
      { color: "bg-orange-50 border-orange-200", text: "text-orange-700" },
      { color: "bg-emerald-50 border-emerald-200", text: "text-emerald-700" },
    ];
    return colors[index % colors.length];
  };

  const displayCategories = useMemo(() => {
    return [
      { name: "All", emoji: "🛒", color: "bg-amber-50 border-amber-200", text: "text-amber-700" },
      ...categories.map((c, idx) => {
        const styles = getCategoryStyles(c.name, idx);
        return {
          name: c.name,
          emoji: c.emoji || "📦",
          ...styles
        };
      })
    ];
  }, [categories]);

  useDocumentMetadata({
    title: "India's Finest Everyday Essentials",
    description: "Shop organic and natural products direct from Indian local farmers and self-help groups. Fresh pantry items, beverages, organic care, and home essentials.",
    schema: {
      "@context": "https://schema.org",
      "@type": "Store",
      "name": "GaramBazaar",
      "description": "India's Finest Everyday Essentials. 100% natural, organic products sourced directly from local farmers.",
      "url": window.location.origin,
      "logo": `${window.location.origin}/favicon.png`,
    }
  });
  const [activeAd, setActiveAd] = useState(0);
  const [brands, setBrands] = useState([]);
  const [loadingBrands, setLoadingBrands] = useState(true);
  const [banners, setBanners] = useState([]);
  const [activeBanner, setActiveBanner] = useState(0);

  useEffect(() => {
    getSettingsRequest()
      .then((res) => {
        if (res && res.homepageBanners && res.homepageBanners.length > 0) {
          setBanners(res.homepageBanners);
        }
      })
      .catch((err) => {
        console.error("Failed to load settings/banners:", err);
      });
  }, []);

  useEffect(() => {
    if (!banners.length) return;
    const interval = window.setInterval(() => {
      setActiveBanner((current) => (current + 1) % banners.length);
    }, 5000);
    return () => window.clearInterval(interval);
  }, [banners.length]);

  const deal = [...products]
    .filter((p) => p.originalPrice)
    .sort((a, b) =>
      (b.originalPrice - b.price) / b.originalPrice -
      (a.originalPrice - a.price) / a.originalPrice
    )[0];

  const homeProducts = products.length ? products : featured;
  const topProducts = [...homeProducts]
    .sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0))
    .slice(0, 8);
  const newArrivals = homeProducts
    .filter((p) => String(p.badge || "").toLowerCase() === "new")
    .slice(0, 8);
  const newestProducts = [...homeProducts]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 8);

  useEffect(() => {
    getBrandsRequest()
      .then((res) => {
        if (res && res.brands && res.brands.length > 0) {
          setBrands(res.brands);
        } else {
          setBrands(brandAds);
        }
      })
      .catch((err) => {
        console.error("Error loading brands:", err);
        setBrands(brandAds);
      })
      .finally(() => setLoadingBrands(false));
  }, []);

  useEffect(() => {
    if (!brands.length) return;
    const id = window.setInterval(() => setActiveAd((c) => (c + 1) % brands.length), 3500);
    return () => window.clearInterval(id);
  }, [brands.length]);

  return (
    <div className="min-h-screen bg-[#f5f0e8]">

      {/* ══════════════════════════════════
          HERO SECTION (SETTINGS BANNER OR DEFAULT HERO)
      ══════════════════════════════════ */}
      {banners.length > 0 ? (
        <section className="relative h-[320px] md:h-[450px] overflow-hidden bg-gray-950">
          <div className="absolute inset-0 flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${activeBanner * 100}%)` }}>
            {banners.map((banner, idx) => (
              <div
                key={idx}
                className="min-w-full h-full relative flex items-center justify-center text-center px-4"
              >
                {/* Background Image */}
                <img
                  src={banner.imageUrl}
                  alt={banner.title || "Promotional Banner"}
                  className="absolute inset-0 w-full h-full object-cover opacity-60"
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-gray-950/40 to-transparent" />
                
                {/* Text Overlay */}
                <div className="relative z-10 max-w-2xl text-white">
                  <h2 className="text-xl md:text-3xl font-extrabold mb-4 drop-shadow-md text-white">
                    {banner.title}
                  </h2>
                  <Link
                    to={banner.linkUrl || "/shop"}
                    className="inline-block bg-amber-400 hover:bg-amber-500 text-gray-950 font-bold px-6 py-2.5 rounded-xl text-xs transition-all hover:scale-105 shadow-md cursor-pointer"
                  >
                    Shop Offer →
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Dots Indicator */}
          {banners.length > 1 && (
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
              {banners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveBanner(idx)}
                  className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                    idx === activeBanner ? "w-6 bg-[#c4622d]" : "bg-white/50 hover:bg-white/80"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </section>
      ) : (
        <section className="relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #2c1a0e 0%, #5a3a1a 55%, #7a3e1c 100%)" }}>
          {/* decorative blob */}
          <div className="absolute -right-24 -top-24 w-[500px] h-[500px] rounded-full opacity-20"
            style={{ background: "radial-gradient(circle, #c4622d, transparent 70%)" }} />

          <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-16
                          flex flex-col md:flex-row items-center gap-8 md:gap-12 relative z-10">
            {/* Text */}
            <div className="flex-1 text-center md:text-left">
              <span className="inline-block bg-[#c4622d] text-white text-[0.68rem] font-bold
                               uppercase tracking-widest px-3 py-1.5 rounded mb-4">
                🌿 100% Natural & Organic
              </span>
              <h1 className="font-extrabold leading-[1.12] text-white mb-4"
                style={{ fontSize: "clamp(1.8rem, 4.5vw, 3.4rem)" }}>
                India's Finest<br />
                <em className="not-italic text-amber-400">Everyday Essentials</em>
              </h1>
              <p className="text-white/65 text-[0.9rem] leading-[1.7] mb-6 max-w-[500px] mx-auto md:mx-0">
                From Himalayan kitchens to your doorstep. Artisan products, pure ingredients,
                honest prices — and a calmer shopping experience built for everyday life.
              </p>
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                <Link
                  to="/shop"
                  className="bg-amber-400 hover:bg-amber-500 text-gray-900 font-bold
                             px-6 py-3 rounded-lg text-sm transition-all hover:-translate-y-0.5 shadow-md"
                >
                  Shop Now →
                </Link>
                <Link
                  to="/shop?badge=new"
                  className="border-2 border-white/40 text-white hover:bg-white/10 font-semibold
                             px-6 py-3 rounded-lg text-sm transition-all hover:-translate-y-0.5"
                >
                  New Arrivals
                </Link>
              </div>
            </div>
            {/* Hero visual */}
            <div className="text-[clamp(4rem,10vw,9rem)] filter drop-shadow-2xl select-none flex-shrink-0">
              🛍️
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════
          TRUST BAR
      ══════════════════════════════════ */}
      <div className="bg-white border-b border-gray-200 overflow-x-auto">
        <div className="flex items-stretch divide-x divide-gray-100 min-w-max md:min-w-0">
          {trustItems.map(({ icon, title, sub }) => (
            <div key={title}
              className="flex items-center gap-3 px-5 py-3.5 flex-1 min-w-[180px]">
              <span className="text-2xl flex-shrink-0">{icon}</span>
              <div>
                <p className="text-[0.78rem] font-bold text-gray-800">{title}</p>
                <p className="text-[0.68rem] text-gray-500">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════
          CATEGORY CIRCLES
      ══════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="flex items-end justify-between mb-4">
          <div>
            <p className="text-[0.68rem] font-bold uppercase tracking-widest text-[#9b6b3a] mb-0.5">Browse By</p>
            <h2 className="text-xl md:text-2xl font-bold text-[#2c1a0e]">Categories</h2>
          </div>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {displayCategories.map(({ name, emoji, color, text }) => (
            <Link
              key={name}
              to={name === "All" ? "/shop" : `/shop?category=${encodeURIComponent(name)}`}
              className={`flex flex-col items-center gap-2 flex-shrink-0 w-[90px] md:w-[110px]
                          rounded-2xl border-2 ${color} px-3 py-4 text-center
                          hover:-translate-y-1 hover:shadow-md transition-all duration-200`}
            >
              <span className="text-3xl md:text-4xl">{emoji}</span>
              <span className={`text-[0.72rem] font-bold ${text} leading-tight`}>{name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════
          BRAND AD CAROUSEL
      ══════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 pb-8">
        <div className="flex items-end justify-between mb-4">
          <div>
            <p className="text-[0.68rem] font-bold uppercase tracking-widest text-[#9b6b3a] mb-0.5">Brand Spotlight</p>
            <h2 className="text-xl md:text-2xl font-bold text-[#2c1a0e]">Featured Brands</h2>
          </div>
          <Link to="/shop" className="text-[0.82rem] font-semibold text-[#c4622d] hover:underline">
            Explore all →
          </Link>
        </div>

        <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-200">
          {/* Track */}
          <div className="relative overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${activeAd * 100}%)` }}
            >
              {brands.map((ad) => (
                <article
                  key={ad.id || ad.brand}
                  className="min-w-full grid grid-cols-1 md:grid-cols-[1fr_280px] overflow-hidden"
                  style={{ background: `linear-gradient(135deg, ${ad.accent}, #2c1a0e)` }}
                >
                  <div className="p-6 md:p-10 flex flex-col justify-center gap-3">
                    <span className="w-fit rounded-full bg-white/15 px-3 py-1
                                     text-[0.7rem] font-extrabold uppercase tracking-widest text-white">
                      {ad.brand}
                    </span>
                    <h3 className="text-white font-bold leading-tight"
                      style={{ fontSize: "clamp(1.2rem, 3vw, 2rem)" }}>
                      {ad.title}
                    </h3>
                    <p className="text-white/70 text-sm leading-relaxed max-w-[400px]">{ad.copy}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="bg-amber-400 text-gray-900 font-extrabold text-sm px-4 py-2 rounded-lg">
                        {ad.offer}
                      </span>
                      <button
                        onClick={() => navigate("/shop")}
                        className="text-white/80 hover:text-white text-sm font-semibold
                                   underline underline-offset-2 transition-colors"
                      >
                        Shop now →
                      </button>
                    </div>
                  </div>
                  <img
                    src={ad.image}
                    alt={ad.brand}
                    className="hidden md:block h-[220px] w-full object-cover"
                  />
                </article>
              ))}
            </div>
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-2 py-3 bg-white border-t border-gray-100">
            {brands.map((ad, i) => (
              <button
                key={ad.id || ad.brand}
                onClick={() => setActiveAd(i)}
                aria-label={`Show ${ad.brand}`}
                className={`rounded-full transition-all duration-200
                  ${i === activeAd
                    ? "w-6 h-2.5 bg-[#c4622d]"
                    : "w-2.5 h-2.5 bg-gray-300 hover:bg-gray-400"}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          DEAL OF THE DAY
      ══════════════════════════════════ */}
      {deal && (
        <section className="max-w-7xl mx-auto px-4 md:px-8 pb-8">
          <div
            className="rounded-2xl overflow-hidden shadow-lg p-6 md:p-10
                       flex flex-col md:flex-row gap-8 items-start md:items-center"
            style={{ background: "linear-gradient(135deg, #2c1a0e, #5a3a1a)" }}
          >
            <div className="flex-1">
              <p className="text-amber-400 text-[0.72rem] font-bold uppercase tracking-widest mb-2">
                ⚡ Deal of the Day
              </p>
              <h2 className="text-white font-bold text-2xl md:text-3xl mb-2 font-serif">{deal.name}</h2>
              <p className="text-white/60 text-sm leading-relaxed mb-4 max-w-[400px]">{deal.description}</p>

              {/* Price */}
              <div className="flex items-center gap-3 mb-5">
                <span className="text-white font-bold text-2xl md:text-3xl">₹{deal.price}</span>
                <span className="text-white/40 line-through text-base">₹{deal.originalPrice}</span>
                <span className="bg-[#c4622d] text-white font-bold text-xs px-3 py-1 rounded-full">
                  {Math.round(((deal.originalPrice - deal.price) / deal.originalPrice) * 100)}% OFF
                </span>
              </div>

              {/* Timer */}
              <div className="flex gap-3 mb-6">
                {[
                  [timer.days, "Days"],
                  [timer.hours, "Hrs"],
                  [timer.minutes, "Min"],
                  [timer.seconds ?? "00", "Sec"],
                ].map(([val, label]) => (
                  <div key={label}
                    className="bg-white/10 rounded-xl px-3 py-2.5 text-center min-w-[56px]">
                    <strong className="block text-white text-2xl font-bold leading-none">
                      {String(val).padStart(2, "0")}
                    </strong>
                    <span className="text-[0.62rem] text-white/50 uppercase tracking-widest">{label}</span>
                  </div>
                ))}
              </div>

              <Link
                to={`/products/${deal.slug}`}
                className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-500
                           text-gray-900 font-bold px-6 py-3 rounded-lg text-sm
                           transition-all hover:-translate-y-0.5 shadow-md"
              >
                Shop Deal →
              </Link>
            </div>

            <div className="text-[clamp(5rem,10vw,8rem)] filter drop-shadow-2xl select-none flex-shrink-0">
              {deal.emoji || "🍯"}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════
          TOP PICKS
      ══════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 pb-8">
        <div className="flex items-end justify-between mb-4">
          <div>
            <p className="text-[0.68rem] font-bold uppercase tracking-widest text-[#9b6b3a] mb-0.5">Highest Rated</p>
            <h2 className="text-xl md:text-2xl font-bold text-[#2c1a0e]">Top Picks</h2>
          </div>
          <Link to="/shop?sort=rating" className="text-[0.82rem] font-semibold text-[#c4622d] hover:underline">
            See all →
          </Link>
        </div>
        {loading ? <Spinner /> : <ProductGrid products={topProducts} scrollable={true} />}
      </section>

      {/* ══════════════════════════════════
          PROMO CARDS
      ══════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {promoCards.map(({ title, sub, icon, gradient }) => (
            <div
              key={title}
              className={`bg-gradient-to-br ${gradient} rounded-2xl p-5 text-white
                          flex items-start gap-4 hover:-translate-y-1 hover:shadow-lg
                          transition-all duration-200 cursor-default`}
            >
              <span className="text-4xl flex-shrink-0">{icon}</span>
              <div>
                <h3 className="font-bold text-[0.95rem] mb-1">{title}</h3>
                <p className="text-white/70 text-[0.78rem] leading-snug">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════
          NEW ARRIVALS
      ══════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 pb-10">
        <div className="flex items-end justify-between mb-4">
          <div>
            <p className="text-[0.68rem] font-bold uppercase tracking-widest text-[#9b6b3a] mb-0.5">Just In</p>
            <h2 className="text-xl md:text-2xl font-bold text-[#2c1a0e]">New Arrivals</h2>
          </div>
          <Link to="/shop?badge=new&sort=newest" className="text-[0.82rem] font-semibold text-[#c4622d] hover:underline">
            See all →
          </Link>
        </div>
        {loading ? <Spinner /> : <ProductGrid products={newArrivals.length ? newArrivals : newestProducts} scrollable={true} />}
      </section>
    </div>
  );
}
