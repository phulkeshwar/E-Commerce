# GramBazaar UI Enhancement Plan
## Amazon/Flipkart-inspired redesign, GramBazaar theme

All changes use **Tailwind inline classes directly in JSX** (no separate CSS).  
Theme colors: `#131921` (dark nav), `#232f3e` (nav bar), `amber-400` (accent), `[#2c1a0e]` (brand dark), `[#f5f0e8]` (cream bg).

---

## Open Questions

> [!IMPORTANT]
> Please confirm before I start:
> 1. Should I keep the **existing CSS classes** for non-navbar parts as a fallback, or fully migrate everything to Tailwind-only?
> 2. Do you want a **price range slider** filter on the ShopPage sidebar?
> 3. Should the Hero section have a **full-width image banner** (like Amazon) or keep the current text+emoji style?

---

## Proposed Changes

### 1. `ProductCard.jsx` — Amazon-style cards

#### [MODIFY] [ProductCard.jsx](file:///d:/WebDev/Projects/general%20store/client/src/components/product/ProductCard.jsx)
- Larger image area (220px tall on desktop)
- "Add to Cart" button slides up on hover (Amazon/Flipkart hover reveal)
- Star rating shown as filled gold stars (SVG)
- Savings badge in green ("Save ₹X")
- "Prime"-style delivery badge ("Free Delivery")
- Wishlist heart button as proper SVG icon

---

### 2. `HomePage.jsx` — Richer landing page

#### [MODIFY] [HomePage.jsx](file:///d:/WebDev/Projects/general%20store/client/src/pages/HomePage.jsx)
- **Hero banner**: Full-width gradient with a real background image overlay + CTA buttons
- **Trust bar**: Redesigned with icons instead of emojis
- **Category strip**: Circular icon cards (like Amazon's row)
- **Deal of the Day**: Redesigned with a live countdown clock that shows seconds too
- **"Shop by Brand" carousel**: Auto-rotating, with prev/next arrows
- **Newsletter signup strip** (new): Email input + subscribe CTA
- Promo cards: Bigger, side-by-side grid with hover lift

---

### 3. `ShopPage.jsx` — Better filter sidebar + toolbar

#### [MODIFY] [ShopPage.jsx](file:///d:/WebDev/Projects/general%20store/client/src/pages/ShopPage.jsx)
- Sidebar redesigned: sticky, with collapsible accordion sections
- **Price range filter** (min/max inputs)
- **In-Stock toggle filter**
- Active filter pills/chips row below toolbar
- Toolbar: result count + sort select + grid/list view toggle
- Empty state: illustrated, better styled

---

### 4. `ProductDetailPage.jsx` — Flipkart-style detail page

#### [MODIFY] [ProductDetailPage.jsx](file:///d:/WebDev/Projects/general%20store/client/src/pages/ProductDetailPage.jsx)
- Sticky right panel with price + Add to Cart + Buy Now
- Image gallery with thumbnail selector (highlight selected)
- Offers section (coupon codes, bank offers styled like Flipkart)
- Rating breakdown bars (1★–5★ with fill)
- Specifications table with alternating rows
- "Similar Products" carousel below

---

### 5. `CartPage.jsx` — Amazon-style cart

#### [MODIFY] [CartPage.jsx](file:///d:/WebDev/Projects/general%20store/client/src/pages/CartPage.jsx)
- Two-column layout (cart items left, order summary right — sticky)
- "Proceed to Checkout" prominently styled
- Free delivery progress bar ("Add ₹X more for free delivery")

---

### 6. `Footer.jsx` — Flipkart-style rich footer

#### [MODIFY] [Footer.jsx](file:///d:/WebDev/Projects/general%20store/client/src/components/layout/Footer.jsx)
- Dark background (`#131921`)
- 4-column grid: Brand info, Shop, Help, Company
- Payment icons row (Visa, Mastercard, UPI, Razorpay)
- Social links row
- Bottom bar with copyright

---

## Verification Plan

### Automated
- `npm run dev` (already running on port 5175) — visual check
- `npm run build` — no TypeScript/build errors

### Manual Verification
- Check all pages render correctly on desktop and mobile widths
- Verify hover states, badges, and sticky elements work
