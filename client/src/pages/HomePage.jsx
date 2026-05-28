import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ProductGrid } from "../components/product/ProductGrid";
import { Spinner } from "../components/ui/Spinner";
import { categories } from "../constants/categories";
import { useProducts } from "../hooks/useProducts";
import { useTimer } from "../hooks/useTimer";

const brandAds = [
  {
    brand: "Pahadi Roots",
    title: "Mountain pantry festival",
    copy: "Stone-ground flours, wild honey, and Himalayan salts for slow weekend cooking.",
    offer: "Up to 25% off",
    accent: "#2f5f4b",
    image:
      "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&w=900&q=80",
  },
  {
    brand: "Brew Yard",
    title: "Cafe-style mornings",
    copy: "Single-origin coffee, cocoa mixes, and breakfast blends delivered fresh.",
    offer: "Buy 2, save 15%",
    accent: "#6f3f22",
    image:
      "https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=900&q=80",
  },
  {
    brand: "Leaf & Loom",
    title: "Clean home essentials",
    copy: "Plant-powered cleaners, soft linens, and fragrance-light care for everyday spaces.",
    offer: "Flat 20% off",
    accent: "#365e7d",
    image:
      "https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?auto=format&fit=crop&w=900&q=80",
  },
  {
    brand: "Ayur Glow",
    title: "Ritual-ready self care",
    copy: "Herbal oils, body butters, and calming teas made for evening reset routines.",
    offer: "Combo deals live",
    accent: "#914d42",
    image:
      "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=900&q=80",
  },
];

export function HomePage() {
  const { products, featured, loading } = useProducts({});
  const timer = useTimer();
  const [activeAd, setActiveAd] = useState(0);
  const deal = [...products]
    .filter((product) => product.originalPrice)
    .sort(
      (left, right) =>
        (right.originalPrice - right.price) / right.originalPrice -
        (left.originalPrice - left.price) / left.originalPrice,
    )[0];
  const homeProducts = products.length ? products : featured;
  const topProducts = [...homeProducts]
    .sort((left, right) => Number(right.rating || 0) - Number(left.rating || 0))
    .slice(0, 8);
  const newArrivals = homeProducts
    .filter((product) => String(product.badge || "").toLowerCase() === "new")
    .slice(0, 8);
  const newestProducts = [...homeProducts]
    .sort((left, right) => new Date(right.createdAt || 0) - new Date(left.createdAt || 0))
    .slice(0, 8);
  const categoryEmoji = {
    All: "🛒",
    Pantry: "🫙",
    Beverages: "☕",
    Home: "🏠",
    "Personal Care": "💆",
    Health: "💊",
  };

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setActiveAd((current) => (current + 1) % brandAds.length);
    }, 2000);

    return () => window.clearInterval(timerId);
  }, []);

  return (
    <section className="page-content">
      <section className="hero">
        <div className="hero-text fade-up">
          <div className="hero-tag">🌿 100% Natural & Organic</div>
          <h1>
            India's Finest
            <br />
            <em>Everyday Essentials</em>
          </h1>
          <p>
            From Himalayan kitchens to your doorstep. Artisan products, pure ingredients, honest
            prices, and the full app now follows the same design language as `Replica.jsx`.
          </p>
          <Link className="hero-cta" to="/shop">
            Shop Now →
          </Link>
        </div>
        <div className="hero-emoji fade-up stagger-2">🛍️</div>
      </section>

      <div className="trust-bar">
        {[
          ["🚚", "Free Delivery ₹500+"],
          ["🌿", "100% Natural"],
          ["↩️", "7-Day Returns"],
          ["🔒", "Secure Checkout"],
          ["⭐", "50K+ Happy Customers"],
        ].map(([icon, text]) => (
          <div className="trust-item" key={text}>
            <span>{icon}</span>
            <span>{text}</span>
          </div>
        ))}
      </div>

      <section className="brand-ad-section fade-up stagger-1">
        <div className="sec-head">
          <div>
            <div className="sec-label">Brand Spotlight</div>
            <h2>Fresh Ads Every Moment</h2>
          </div>
          <Link to="/shop">Explore brands â†’</Link>
        </div>
        <div className="brand-ad-window" aria-label="Featured brand advertisements">
          <div
            className="brand-ad-track"
            style={{ transform: `translateX(-${activeAd * 100}%)` }}
          >
            {brandAds.map((ad) => (
              <article
                className="brand-ad-card"
                key={ad.brand}
                style={{ "--ad-accent": ad.accent }}
              >
                <div className="brand-ad-copy">
                  <span>{ad.brand}</span>
                  <h3>{ad.title}</h3>
                  <p>{ad.copy}</p>
                  <strong>{ad.offer}</strong>
                </div>
                <img src={ad.image} alt={`${ad.brand} promotion`} />
              </article>
            ))}
          </div>
        </div>
        <div className="brand-ad-dots" aria-label="Choose brand advertisement">
          {brandAds.map((ad, index) => (
            <button
              aria-label={`Show ${ad.brand}`}
              className={`brand-ad-dot${index === activeAd ? " active" : ""}`}
              key={ad.brand}
              onClick={() => setActiveAd(index)}
              type="button"
            />
          ))}
        </div>
      </section>

      <section className="section fade-up stagger-1">
        <div className="sec-head">
          <div>
            <div className="sec-label">Browse By</div>
            <h2>Categories</h2>
          </div>
        </div>
        <div className="hscroll">
          {categories.map((category) => (
            <Link
              key={category}
              className="cat-card"
              to={category === "All" ? "/shop" : `/shop?category=${encodeURIComponent(category)}`}
            >
              <div className="cat-emoji">{categoryEmoji[category]}</div>
              <div className="cat-name">{category}</div>
            </Link>
          ))}
        </div>
      </section>

      {deal ? (
        <div className="deal-section fade-up stagger-2">
          <div className="deal-card">
            <div style={{ flex: 1 }}>
              <div className="deal-label">⚡ Deal of the Day</div>
              <div className="deal-name">{deal.name}</div>
              <div className="deal-desc">{deal.description}</div>
              <div className="deal-price">
                <span className="now">₹{deal.price}</span>
                <span className="was">₹{deal.originalPrice}</span>
                <span className="off">
                  {Math.round(((deal.originalPrice - deal.price) / deal.originalPrice) * 100)}% OFF
                </span>
              </div>
              <div className="deal-timer">
                {[
                  [timer.days, "Days"],
                  [timer.hours, "Hrs"],
                  [timer.minutes, "Min"],
                ].map(([value, label]) => (
                  <div key={label} className="timer-box">
                    <strong>{value}</strong>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
              <Link className="hero-cta" to={`/products/${deal.slug}`}>
                Shop Deal →
              </Link>
            </div>
            <div className="deal-emoji">{deal.emoji || "🍯"}</div>
          </div>
        </div>
      ) : null}

      <div className="section fade-up stagger-3">
        <div className="sec-head">
          <div>
            <div className="sec-label">Highest Rated</div>
            <h2>Top Picks</h2>
          </div>
          <Link to="/shop?sort=rating">See all →</Link>
        </div>
        {loading ? <Spinner /> : <ProductGrid products={topProducts} />}
      </div>

      <div className="promo-strip fade-up stagger-4">
        <div className="promo-card promo-dark">
          <div>
            <h3>Free Delivery</h3>
            <p>On orders above ₹500. No minimum on select items.</p>
          </div>
          <div className="pe">🚚</div>
        </div>
        <div className="promo-card promo-green">
          <div>
            <h3>100% Natural</h3>
            <p>All products verified. No harmful additives.</p>
          </div>
          <div className="pe">🌿</div>
        </div>
      </div>

      <div className="section fade-up">
        <div className="sec-head">
          <div>
            <div className="sec-label">Just In</div>
            <h2>New Arrivals</h2>
          </div>
          <Link to="/shop?badge=new&sort=newest">See all →</Link>
        </div>
        {loading ? <Spinner /> : <ProductGrid products={newArrivals.length ? newArrivals : newestProducts} />}
      </div>
    </section>
  );
}
