# 🛒 GaramBazaar — MERN Full Stack E-Commerce Platform

<div align="center">

![GaramBazaar Banner](https://img.shields.io/badge/GaramBazaar-India's%20Organic%20Marketplace-c4622d?style=for-the-badge&logo=shopify&logoColor=white)

[![MongoDB](https://img.shields.io/badge/MongoDB-6.0-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://mongodb.com)
[![Express](https://img.shields.io/badge/Express-4.18-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=flat-square&logo=jsonwebtokens)](https://jwt.io)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-Image%20CDN-3448C5?style=flat-square&logo=cloudinary)](https://cloudinary.com)
[![Razorpay](https://img.shields.io/badge/Razorpay-Payments-02042B?style=flat-square&logo=razorpay)](https://razorpay.com)

> **India's trusted organic & artisan marketplace** — A production-grade MERN e-commerce platform with full authentication, admin panel, product management, order tracking, review system, and payment integration.

[Live Demo](#) · [API Docs](#api-documentation) · [Report Bug](#) · [Request Feature](#)

</div>

---

## 📋 Table of Contents

1. [Project Overview](#-project-overview)
2. [Features](#-features)
3. [Tech Stack](#-tech-stack)
4. [Project Structure](#-project-structure)
5. [Database Schema](#-database-schema)
6. [API Documentation](#-api-documentation)
7. [UI & Pages](#-ui--pages)
8. [Authentication Flow](#-authentication-flow)
9. [Admin Panel](#-admin-panel)
10. [Payment Integration](#-payment-integration)
11. [Image Upload](#-image-upload)
12. [Environment Variables](#-environment-variables)
13. [Installation & Setup](#-installation--setup)
14. [Scripts](#-scripts)
15. [Deployment](#-deployment)
16. [Contributing](#-contributing)
17. [Recent Feature Updates](#-recent-feature-updates)

---

## 🌿 Project Overview

GaramBazaar is a full-stack MERN e-commerce platform built for selling natural, organic, and artisan Indian products. It supports a complete shopping experience — from product discovery to checkout — alongside a rich admin panel for store owners and a review system for customers.

```
Customer Journey:
Browse → Search/Filter → Product Detail → Add to Cart → Checkout → Order Tracking

Admin Journey:
Login → Dashboard → Manage Products → Update Orders → Monitor Reviews
```

---

## ✨ Features

### 👤 User Features
- **Authentication** — Sign up, sign in, sign out with JWT or passwordless **Google Authentication** (decoupling existing records dynamically).
- **Product Browsing** — Category filters, search, sort, price range
- **Product Detail** — Image gallery, specs, delivery check by pincode, and an interactive **Product Q&A (FAQ)** section where buyers can ask product questions.
- **Stock Availability Alerts ("Notify Me")** — Register email alerts on out-of-stock items to get instantly notified on stock replenishment.
- **Shopping Cart** — Qty controls, promo codes, order summary
- **Checkout** — Multi-step: Address (with Developer Quick-Fill Address autofill) → Payment → Review → Confirm
- **Multiple Saved Addresses** — Securely store multiple billing/delivery addresses in a server-side address book, integrated directly into checkout autofill.
- **Order Tracking** — Real-time status, step-by-step timeline
- **Wishlist** — Save favourites, persistent across sessions
- **Reviews** — Star rating, text, photo/video uploads, edit own review
- **Account Dashboard** — Orders, wishlist, notifications, preferences
- **Footer Static Portal** — View detailed policy and informational pages (About Us, Returns, FAQ, Careers, Press, Sustainability) rendered from dynamic content.

### 🏪 Seller Features
- **Merchant Overview** — Dedicated Seller Panel displaying merchant-specific sales revenue, listed product counts, and incoming orders containing their items.
- **Product Management** — Full searchable product list with creation (auto-assigns merchant owner), updates, and soft deletions.
- **SKU & Barcode Sourcing Fields** — Track unique inventory codes and barcodes on each product listing.
- **Product Draft / Publish Toggle** — Hide products in draft mode until ready for buyer publication.
- **Customer Reviews** — Dropdown menu allowing sellers to review buyer ratings and testimonials left on their catalog.
- **Buyer FAQs** — View unanswered questions asked on their items and submit answers that update the product page live.
- **Feature Restrictions** — Hidden checkout options, hidden cart navigation buttons, blocked order portals, and viewing-only locks on item reviews or purchase details to protect role logic integrity.

### 🛠️ Admin Features
- **Dashboard** — Revenue, order, customer, and product stats
- **Global Settings & Banners Dashboard** — Update global shipping fees, free-shipping thresholds, and upload homepage promotional banners directly.
- **Order Management** — Search, filter, update order status inline
- **Product Catalog** — Edit name, price, description, stock, badge
- **Add Product** — Full form with multi-image upload via Cloudinary
- **Review Moderation** — Approve or remove customer reviews
- **Quick Test Tool** — Admin quick-login assistant pre-filling credentials for easy developers testing.

### 🎨 UI/UX
- Smooth page transition animations (fade, slide)
- Staggered hero reveals
- Toast notification system
- Responsive sticky navigation
- Deal of the Day countdown timer
- Mobile-friendly layout
- Scanline overlay animation for UPI gateway modals
- Adaptive layout hiding buyer features for sellers and admins dynamically.

---

## 🧰 Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 18.3 | UI framework |
| React Router DOM | 6.x | Client-side routing |
| Axios | 1.x | HTTP requests |
| Tailwind CSS | 3.x | Utility-first styling |
| React Query | 5.x | Server state management |
| Zustand | 4.x | Client state (cart, auth) |
| React Hook Form | 7.x | Form management & validation |
| Zod | 3.x | Schema validation |
| Lucide React | 0.3x | Icon library |
| React Hot Toast | 2.x | Toast notifications |
| Framer Motion | 11.x | Page animations & transitions |
| React Dropzone | 14.x | Drag-and-drop image uploads |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Node.js | 20.x | JavaScript runtime |
| Express | 4.18 | Web framework |
| Mongoose | 8.x | MongoDB ODM |
| JSON Web Token | 9.x | Authentication tokens |
| bcryptjs | 2.x | Password hashing |
| Multer | 1.x | Multipart file parsing |
| Cloudinary SDK | 2.x | Image/video cloud storage |
| Razorpay SDK | 2.x | Payment processing |
| Nodemailer | 6.x | Transactional email |
| Express Validator | 7.x | Request validation |
| Morgan | 1.x | HTTP request logger |
| Helmet | 7.x | Security HTTP headers |
| CORS | 2.x | Cross-origin resource sharing |
| dotenv | 16.x | Environment variables |
| Compression | 1.x | GZIP response compression |

### Database & Infrastructure
| Service | Purpose |
|---|---|
| MongoDB Atlas | Cloud database (M0 free tier → M10 production) |
| Cloudinary | Image & video CDN with transformations |
| Razorpay | Indian payment gateway (UPI, card, netbanking, COD) |
| Railway / Render | Backend hosting |
| Vercel / Netlify | Frontend hosting |
| GitHub Actions | CI/CD pipeline |

---

## 📁 Project Structure

```
GaramBazaar/
│
├── 📂 client/                          # React Frontend
│   ├── 📂 public/
│   │   ├── favicon.ico
│   │   ├── logo192.png
│   │   └── manifest.json
│   │
│   ├── 📂 src/
│   │   ├── 📂 api/                     # Axios instances & API calls
│   │   │   ├── axios.js                # Base axios config with interceptors
│   │   │   ├── auth.api.js             # Login, register, refresh token
│   │   │   ├── products.api.js         # CRUD products, search, filter
│   │   │   ├── orders.api.js           # Place order, track, history
│   │   │   ├── cart.api.js             # Cart sync with server
│   │   │   ├── reviews.api.js          # Post, edit, delete reviews
│   │   │   ├── upload.api.js           # Image/video upload
│   │   │   └── admin.api.js            # Admin-only endpoints
│   │   │
│   │   ├── 📂 assets/                  # Static assets
│   │   │   ├── 📂 images/
│   │   │   ├── 📂 icons/
│   │   │   └── 📂 fonts/
│   │   │
│   │   ├── 📂 components/              # Reusable UI components
│   │   │   ├── 📂 layout/
│   │   │   │   ├── Navbar.jsx          # Sticky nav with cart/wishlist badges
│   │   │   │   ├── Footer.jsx          # Links, brand, social
│   │   │   │   └── PageTransition.jsx  # Framer Motion wrapper
│   │   │   │
│   │   │   ├── 📂 ui/
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Input.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── Toast.jsx
│   │   │   │   ├── Badge.jsx
│   │   │   │   ├── Spinner.jsx
│   │   │   │   ├── StarRating.jsx
│   │   │   │   ├── Toggle.jsx
│   │   │   │   └── Skeleton.jsx        # Loading placeholders
│   │   │   │
│   │   │   ├── 📂 product/
│   │   │   │   ├── ProductCard.jsx     # Grid card with add-to-cart
│   │   │   │   ├── ProductGrid.jsx     # Responsive grid wrapper
│   │   │   │   ├── ProductBadge.jsx    # sale / new badges
│   │   │   │   └── RatingBar.jsx       # Distribution histoGaram
│   │   │   │
│   │   │   ├── 📂 cart/
│   │   │   │   ├── CartItem.jsx
│   │   │   │   ├── CartSummary.jsx
│   │   │   │   └── PromoCode.jsx
│   │   │   │
│   │   │   ├── 📂 review/
│   │   │   │   ├── ReviewCard.jsx
│   │   │   │   ├── ReviewForm.jsx      # Star picker + text + media upload
│   │   │   │   └── ReviewMedia.jsx     # Image/video thumbnails
│   │   │   │
│   │   │   └── 📂 admin/
│   │   │       ├── AdminSidebar.jsx
│   │   │       ├── StatCard.jsx
│   │   │       ├── OrderTable.jsx
│   │   │       ├── ProductTable.jsx
│   │   │       ├── ProductForm.jsx     # Add/edit product modal
│   │   │       └── ImageUploadZone.jsx # Drag-drop Cloudinary upload
│   │   │
│   │   ├── 📂 pages/                   # Route-level page components
│   │   │   ├── HomePage.jsx
│   │   │   ├── ShopPage.jsx
│   │   │   ├── ProductDetailPage.jsx
│   │   │   ├── CartPage.jsx
│   │   │   ├── CheckoutPage.jsx
│   │   │   ├── OrderSuccessPage.jsx
│   │   │   ├── OrdersPage.jsx
│   │   │   ├── WishlistPage.jsx
│   │   │   ├── AccountPage.jsx
│   │   │   ├── AdminPage.jsx
│   │   │   ├── AuthPage.jsx            # Sign in / sign up
│   │   │   └── NotFoundPage.jsx
│   │   │
│   │   ├── 📂 store/                   # Zustand state stores
│   │   │   ├── authStore.js            # user, token, login/logout
│   │   │   ├── cartStore.js            # items, qty, totals
│   │   │   └── wishlistStore.js        # wishlisted product ids
│   │   │
│   │   ├── 📂 hooks/                   # Custom React hooks
│   │   │   ├── useAuth.js
│   │   │   ├── useCart.js
│   │   │   ├── useProducts.js          # React Query product hooks
│   │   │   ├── useOrders.js
│   │   │   ├── useReviews.js
│   │   │   ├── useTimer.js             # Deal countdown timer
│   │   │   └── useDebounce.js          # Search debounce
│   │   │
│   │   ├── 📂 utils/
│   │   │   ├── formatCurrency.js       # ₹ formatting
│   │   │   ├── formatDate.js
│   │   │   ├── calculateDiscount.js
│   │   │   └── validatePincode.js
│   │   │
│   │   ├── 📂 constants/
│   │   │   ├── categories.js
│   │   │   ├── statusColors.js
│   │   │   └── promoConfig.js
│   │   │
│   │   ├── App.jsx                     # Root with Router & QueryClient
│   │   ├── main.jsx                    # ReactDOM.createRoot
│   │   └── index.css                   # Tailwind directives + custom vars
│   │
│   ├── .env.local
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── 📂 server/                          # Express Backend
│   ├── 📂 config/
│   │   ├── db.js                       # Mongoose connect
│   │   ├── cloudinary.js               # Cloudinary SDK init
│   │   └── razorpay.js                 # Razorpay instance
│   │
│   ├── 📂 models/                      # Mongoose schemas
│   │   ├── User.model.js
│   │   ├── Product.model.js
│   │   ├── Order.model.js
│   │   ├── Review.model.js
│   │   ├── Cart.model.js
│   │   └── Coupon.model.js
│   │
│   ├── 📂 routes/                      # Express route files
│   │   ├── auth.routes.js              # /api/auth/*
│   │   ├── product.routes.js           # /api/products/*
│   │   ├── order.routes.js             # /api/orders/*
│   │   ├── cart.routes.js              # /api/cart/*
│   │   ├── review.routes.js            # /api/reviews/*
│   │   ├── upload.routes.js            # /api/upload/*
│   │   ├── payment.routes.js           # /api/payment/*
│   │   ├── coupon.routes.js            # /api/coupons/*
│   │   └── admin.routes.js             # /api/admin/* (protected)
│   │
│   ├── 📂 controllers/                 # Route handler logic
│   │   ├── auth.controller.js
│   │   ├── product.controller.js
│   │   ├── order.controller.js
│   │   ├── cart.controller.js
│   │   ├── review.controller.js
│   │   ├── upload.controller.js
│   │   ├── payment.controller.js
│   │   └── admin.controller.js
│   │
│   ├── 📂 middleware/
│   │   ├── auth.middleware.js          # JWT verify, attach req.user
│   │   ├── admin.middleware.js         # isAdmin role check
│   │   ├── validate.middleware.js      # express-validator error handler
│   │   ├── upload.middleware.js        # Multer memoryStorage config
│   │   ├── rateLimit.middleware.js     # express-rate-limit
│   │   └── errorHandler.middleware.js  # Global error handler
│   │
│   ├── 📂 validators/                  # express-validator rule sets
│   │   ├── auth.validator.js
│   │   ├── product.validator.js
│   │   ├── order.validator.js
│   │   └── review.validator.js
│   │
│   ├── 📂 utils/
│   │   ├── generateToken.js            # Sign JWT access + refresh
│   │   ├── sendEmail.js                # Nodemailer wrapper
│   │   ├── cloudinaryUpload.js         # Upload buffer → Cloudinary
│   │   ├── buildProductQuery.js        # Filter/sort/paginate helper
│   │   └── ApiResponse.js             # Standardised response shape
│   │
│   ├── 📂 seeds/                       # Database seed scripts
│   │   ├── products.seed.js
│   │   ├── users.seed.js
│   │   └── orders.seed.js
│   │
│   ├── app.js                          # Express app setup
│   ├── server.js                       # HTTP server entry point
│   ├── .env
│   └── package.json
│
├── 📂 .github/
│   └── 📂 workflows/
│       ├── ci.yml                      # Lint + test on PR
│       └── deploy.yml                  # Auto-deploy on main merge
│
├── .gitignore
├── .eslintrc.json
├── .prettierrc
└── README.md
```

---

## 🗄️ Database Schema

### User
```js
{
  _id: ObjectId,
  name: { type: String, required, trim },
  email: { type: String, required, unique, lowercase },
  password: { type: String, required, minlength: 6 },   // bcrypt hashed
  role: { type: String, enum: ["user","admin"], default: "user" },
  avatar: { url: String, publicId: String },
  membership: { type: String, enum: ["Silver","Gold","Platinum"], default: "Silver" },
  addresses: [{
    label: String,                    // "Home", "Work"
    line1: String,
    city: String,
    state: String,
    pincode: String,
    isDefault: Boolean
  }],
  preferences: {
    emailAlerts: { type: Boolean, default: true },
    smsAlerts:   { type: Boolean, default: false },
    dealAlerts:  { type: Boolean, default: true }
  },
  refreshToken: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Product
```js
{
  _id: ObjectId,
  name: { type: String, required, trim, maxlength: 120 },
  slug: { type: String, unique },                        // URL-friendly name
  category: { type: String, enum: CATS, required },
  price: { type: Number, required, min: 0 },
  originalPrice: { type: Number },                       // null = no discount
  description: { type: String, required, maxlength: 1000 },
  specifications: { type: Map, of: String },             // key-value pairs
  images: [{
    url: String,                                         // Cloudinary URL
    publicId: String,
    alt: String
  }],
  emoji: { type: String },                               // Display emoji
  badge: { type: String, enum: ["sale","new",null] },
  inStock: { type: Boolean, default: true },
  stockCount: { type: Number, default: 0 },
  rating: { type: Number, default: 0, min: 0, max: 5 }, // computed avg
  reviewCount: { type: Number, default: 0 },
  tags: [String],
  isFeatured: { type: Boolean, default: false },
  createdAt: Date,
  updatedAt: Date
}
```

### Order
```js
{
  _id: ObjectId,
  orderId: { type: String, unique },                     // "ORD-XXXX"
  user: { type: ObjectId, ref: "User", required },
  items: [{
    product: { type: ObjectId, ref: "Product" },
    name: String,                                        // snapshot at time of order
    price: Number,
    qty: Number,
    emoji: String
  }],
  shippingAddress: {
    name: String,
    phone: String,
    line1: String,
    city: String,
    state: String,
    pincode: String
  },
  payment: {
    method: { type: String, enum: ["upi","card","netbanking","cod"] },
    status: { type: String, enum: ["pending","paid","failed"], default: "pending" },
    razorpayOrderId: String,
    razorpayPaymentId: String
  },
  subtotal: Number,
  shippingFee: Number,
  discount: Number,
  couponCode: String,
  total: Number,
  status: {
    type: String,
    enum: ["Processing","Shipped","Delivered","Returned","Cancelled"],
    default: "Processing"
  },
  statusHistory: [{
    status: String,
    updatedAt: { type: Date, default: Date.now },
    note: String
  }],
  estimatedDelivery: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Review
```js
{
  _id: ObjectId,
  product: { type: ObjectId, ref: "Product", required },
  user: { type: ObjectId, ref: "User", required },
  rating: { type: Number, required, min: 1, max: 5 },
  title: { type: String, maxlength: 100 },
  body: { type: String, required, maxlength: 1000 },
  media: [{
    type: { type: String, enum: ["image","video"] },
    url: String,
    publicId: String,
    thumbnail: String                                    // video thumbnail
  }],
  isApproved: { type: Boolean, default: false },
  isVerifiedPurchase: { type: Boolean, default: false },
  helpfulVotes: { type: Number, default: 0 },
  createdAt: Date,
  updatedAt: Date
}
// Compound unique index: { product, user }
```

### Cart
```js
{
  _id: ObjectId,
  user: { type: ObjectId, ref: "User", unique },
  items: [{
    product: { type: ObjectId, ref: "Product" },
    qty: { type: Number, min: 1 }
  }],
  updatedAt: Date
}
```

### Coupon
```js
{
  _id: ObjectId,
  code: { type: String, unique, uppercase },
  discountType: { type: String, enum: ["flat","percent"] },
  discountValue: Number,
  minOrderAmount: { type: Number, default: 0 },
  maxUses: Number,
  usedCount: { type: Number, default: 0 },
  expiresAt: Date,
  isActive: { type: Boolean, default: true }
}
```

---

## 📡 API Documentation

**Base URL:** `https://api.GaramBazaar.in/api`

All protected routes require: `Authorization: Bearer <access_token>`

---

### 🔑 Auth Routes `/api/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/register` | ❌ | Create new user account |
| POST | `/login` | ❌ | Sign in, returns `accessToken` + `refreshToken` |
| POST | `/logout` | ✅ | Invalidate refresh token |
| POST | `/refresh` | ❌ | Exchange refresh token for new access token |
| GET | `/me` | ✅ | Get current user profile |
| PATCH | `/me` | ✅ | Update name, preferences, avatar |
| PATCH | `/me/password` | ✅ | Change password |
| POST | `/forgot-password` | ❌ | Send reset link to email |
| POST | `/reset-password/:token` | ❌ | Reset with token from email |

**POST `/register`**
```json
// Request body
{
  "name": "Your Name",
  "email": "youremail@example.com",
  "password": "securePass123"
}

// Response 201
{
  "success": true,
  "message": "Account created successfully",
  "data": {
    "user": { "_id": "...", "name": "...", "email": "...", "role": "user" },
    "accessToken": "eyJhbGci...",
    "refreshToken": "eyJhbGci..."
  }
}
```

---

### 🏷️ Product Routes `/api/products`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | ❌ | Get all products (paginated, filtered, sorted) |
| GET | `/:id` | ❌ | Get single product by ID or slug |
| GET | `/category/:cat` | ❌ | Products by category |
| GET | `/search?q=` | ❌ | Full-text search |
| POST | `/` | ✅ Admin | Create new product |
| PATCH | `/:id` | ✅ Admin | Update product fields |
| DELETE | `/:id` | ✅ Admin | Soft-delete product |
| PATCH | `/:id/stock` | ✅ Admin | Toggle stock status |

**GET `/` — Query Parameters**
```
?page=1          → Page number (default: 1)
?limit=20        → Items per page (default: 20, max: 100)
?category=Pantry → Filter by category
?minPrice=100    → Minimum price
?maxPrice=500    → Maximum price
?minRating=4     → Minimum rating
?badge=sale      → Filter by badge (sale / new)
?inStock=true    → Only in-stock products
?sort=rating     → Sort by: price_asc | price_desc | rating | newest | relevance
&q=honey         → Search query (combined with filters)
```

**Response shape**
```json
{
  "success": true,
  "data": {
    "products": [ ...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 101,
      "pages": 6
    }
  }
}
```

---

### 📦 Order Routes `/api/orders`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/` | ✅ | Place new order |
| GET | `/` | ✅ | Get current user's orders |
| GET | `/:id` | ✅ | Get order detail + tracking |
| PATCH | `/:id/cancel` | ✅ | Cancel order (if Processing) |
| GET | `/admin/all` | ✅ Admin | All orders with filters |
| PATCH | `/admin/:id/status` | ✅ Admin | Update order status |

**POST `/` — Place Order**
```json
// Request body
{
  "items": [
    { "productId": "...", "qty": 2 }
  ],
  "shippingAddress": {
    "name": "Your Name",
    "phone": "9800000001",
    "line1": "12 MG Road",
    "city": "Ranchi",
    "state": "Jharkhand",
    "pincode": "834001"
  },
  "paymentMethod": "upi",
  "couponCode": "Garam10"
}
```

---

### ⭐ Review Routes `/api/reviews`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/product/:productId` | ❌ | Get reviews for a product |
| POST | `/product/:productId` | ✅ | Post a new review |
| PATCH | `/:reviewId` | ✅ | Edit own review |
| DELETE | `/:reviewId` | ✅ | Delete own review |
| PATCH | `/admin/:reviewId/approve` | ✅ Admin | Approve a review |
| DELETE | `/admin/:reviewId` | ✅ Admin | Admin delete any review |
| POST | `/:reviewId/helpful` | ✅ | Vote review as helpful |

**POST `/product/:productId`**
```json
// Request body (multipart/form-data)
{
  "rating": 5,
  "title": "Amazing quality!",
  "body": "Absolutely love this product...",
  "media": [File, File]          // Up to 4 image/video files
}
```

---

### 🛒 Cart Routes `/api/cart`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | ✅ | Get user's cart |
| POST | `/add` | ✅ | Add item to cart |
| PATCH | `/update` | ✅ | Update item quantity |
| DELETE | `/remove/:productId` | ✅ | Remove item |
| DELETE | `/clear` | ✅ | Clear entire cart |
| POST | `/sync` | ✅ | Sync local cart on login |

---

### 💳 Payment Routes `/api/payment`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/create-order` | ✅ | Create Razorpay order |
| POST | `/verify` | ✅ | Verify payment signature |
| POST | `/webhook` | ❌ | Razorpay webhook handler |

**POST `/create-order`**
```json
// Request
{ "orderId": "ORD-4521" }

// Response
{
  "success": true,
  "data": {
    "razorpayOrderId": "order_P9...",
    "amount": 94800,           // in paise
    "currency": "INR",
    "keyId": "rzp_live_..."
  }
}
```

---

### 📤 Upload Routes `/api/upload`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/image` | ✅ | Upload single image → Cloudinary |
| POST | `/images` | ✅ | Upload multiple images (max 6) |
| POST | `/video` | ✅ | Upload review video |
| DELETE | `/:publicId` | ✅ | Delete from Cloudinary |

---

### 🎫 Coupon Routes `/api/coupons`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/validate` | ✅ | Validate + calculate discount |
| GET | `/` | ✅ Admin | List all coupons |
| POST | `/` | ✅ Admin | Create coupon |
| DELETE | `/:id` | ✅ Admin | Delete coupon |

---

### ⚙️ Admin Routes `/api/admin`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/stats` | ✅ Admin | Revenue, orders, customers summary |
| GET | `/stats/revenue?period=` | ✅ Admin | Revenue chart data (week/month/year) |
| GET | `/users` | ✅ Admin | All users list |
| PATCH | `/users/:id/role` | ✅ Admin | Promote/demote user role |
| GET | `/reviews/pending` | ✅ Admin | Unapproved reviews |

---

## 🖥️ UI & Pages

### Home Page `/`
```
┌─────────────────────────────────────────────────────────┐
│  NAVBAR: Logo · Search · Category Select · Cart · User  │
├─────────────────────────────────────────────────────────┤
│  HERO: Headline · CTA · Floating emoji                  │
├─────────────────────────────────────────────────────────┤
│  TRUST BAR: Free Delivery · Natural · Returns · Secure  │
├─────────────────────────────────────────────────────────┤
│  CATEGORIES (horizontal scroll): 6 emoji cards          │
├─────────────────────────────────────────────────────────┤
│  DEAL OF THE DAY: Countdown timer · Price · Add to Cart │
├─────────────────────────────────────────────────────────┤
│  TOP PICKS: Horizontal scroll, highest rated products   │
├─────────────────────────────────────────────────────────┤
│  PROMO BANNERS: Free Delivery · 100% Natural            │
├─────────────────────────────────────────────────────────┤
│  NEW ARRIVALS: 4-column grid of badge="new" products    │
├─────────────────────────────────────────────────────────┤
│  FOOTER: Brand · Shop · Help · Company columns          │
└─────────────────────────────────────────────────────────┘
```

### Shop Page `/shop`
```
┌──────────────────┬──────────────────────────────────────┐
│  FILTER SIDEBAR  │  TOOLBAR: Result count · Sort select  │
│  ─────────────   │  ─────────────────────────────────── │
│  Category        │  PRODUCT GRID (auto-fill, 210px min) │
│  ○ All           │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐│
│  ○ Pantry        │  │ Card │ │ Card │ │ Card │ │ Card ││
│  ○ Beverages     │  └──────┘ └──────┘ └──────┘ └──────┘│
│  ─────────────   │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐│
│  Price Range     │  │ Card │ │ Card │ │ Card │ │ Card ││
│  ₹[___]–[___]    │  └──────┘ └──────┘ └──────┘ └──────┘│
│  ─────────────   │                                      │
│  Min Rating      │  (infinite scroll / pagination)      │
│  ─────────────   │                                      │
│  Availability    │                                      │
│  ─────────────   │                                      │
│  Badge           │                                      │
│  [Apply][Clear]  │                                      │
└──────────────────┴──────────────────────────────────────┘
```

### Product Detail Page `/product/:slug`
```
┌─────────────────────────────────────────────────────────┐
│  ← Back to Shop                                         │
├──────────────────────┬──────────────────────────────────┤
│  IMAGE COLUMN        │  INFO COLUMN                     │
│  ┌──────────────┐    │  Category tag                    │
│  │              │    │  Product Name (Playfair 1.8rem)  │
│  │   Emoji/Img  │    │  ★★★★½  4.8  (1,234 ratings)   │
│  │   (320px)    │    │  ₹399  ~~₹499~~  20% off         │
│  └──────────────┘    │  ✅ In Stock                     │
│  [T1] [T2] [T3]      │  Qty: [−] 2 [+]                  │
│  (3 thumbnails)      │  [Add to Cart] [Buy Now] [♡]     │
│                      │  📍 Delivery Info                 │
│                      │  [Enter pincode] [Check]          │
│                      │  ▼ Description                   │
│                      │  ▼ Product Details               │
├──────────────────────┴──────────────────────────────────┤
│  REVIEWS & RATINGS                                       │
│  ┌──────────────────────────────────────────────────┐   │
│  │  4.8 ★★★★½   5★ ████████████ 892               │   │
│  │  1,234 reviews  4★ ██████     201               │   │
│  │                 3★ ██         89  ...            │   │
│  └──────────────────────────────────────────────────┘   │
│  [Review Form: Stars + Textarea + 📷 Add Photo/Video]   │
│  ─────────────────────────────────────────────────────  │
│  Review Card · Review Card · Review Card ...            │
├─────────────────────────────────────────────────────────┤
│  RELATED PRODUCTS (same category, 4-column grid)        │
└─────────────────────────────────────────────────────────┘
```

### Cart Page `/cart`
```
┌──────────────────────────────┬──────────────────────────┐
│  CART ITEMS                  │  ORDER SUMMARY           │
│  ─────────────────────────   │  ──────────────────────  │
│  [img] Product Name          │  Subtotal (3 items) ₹748 │
│        Category              │  Shipping          FREE  │
│        ✅ In Stock            │  Discount          −₹10  │
│        [−][2][+] Delete Save │  ─────────────────────   │
│        ₹598                  │  Total            ₹738   │
│  ─────────────────────────   │                          │
│  [img] Product Name          │  [Promo code] [Apply]    │
│  ...                         │  Garam10 / SAVE20 / FIRST50│
│                              │  [Proceed to Checkout →] │
│                              │  🔒 Secure · 💳 · 📦    │
└──────────────────────────────┴──────────────────────────┘
```

### Checkout Page `/checkout`
```
Step 1 — Delivery Address  (active)
Step 2 — Payment
Step 3 — Review & Pay

┌──────────────────────────────┬──────────────────────────┐
│  STEP 1: Delivery Address    │  YOUR ITEMS (mini cart)  │
│  Full Name  |  Phone         │  🍯 Wild Honey ×1   ₹399 │
│  Email                       │  🫒 Olive Oil ×2    ₹998 │
│  Address Line                │  ─────────────────────   │
│  City       |  State         │  Total            ₹1397  │
│  Pincode                     │                          │
│  [Continue to Payment →]     │                          │
└──────────────────────────────┴──────────────────────────┘

// Step 4: Order Success
🎉 Order Placed!
ORD-7482
[Track Order →]  [Continue Shopping →]
```

### Admin Panel `/admin`
```
┌─────────────┬───────────────────────────────────────────┐
│ ADMIN PANEL │  DASHBOARD                                │
│ ─────────── │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────┐ │
│ 📊 Dashboard│  │ ₹2.4L  │ │  48    │ │  101   │ │1.2K│ │
│ 📦 Orders   │  │Revenue │ │Orders  │ │Products│ │Users│ │
│ 🏷️ Products │  └────────┘ └────────┘ └────────┘ └────┘ │
│ ➕ Add Prod │  ─────────────────────────────────────── │
│ ⭐ Reviews  │  RECENT ORDERS TABLE                      │
│             │  ID | Date | Items | Total | Status | Edit│
│             │  ─────────────────────────────────────── │
│             │  TOP PRODUCTS TABLE                       │
│             │  Product | Cat | Price | Rating | Stock  │
└─────────────┴───────────────────────────────────────────┘

// Order edit inline (expanded row):
[ Processing ] [ Shipped ] [ Delivered ] [ Returned ]
[ ✅ Save ]  [ ✕ Cancel ]

// Product edit (modal):
┌───────────────────────────────────────────────────────┐
│ ✏️ Edit Product: Organic Wild Honey                    │
│ Name __________ | Category [select]                   │
│ Price ₹________ | Original ₹________                  │
│ Description [textarea]                                │
│ Badge [select] | In Stock [select]                    │
│ 📷 Image Upload Zone (drag & drop)                    │
│ [thumb1][thumb2][✕]                                   │
│              [Cancel]  [✅ Save Changes]              │
└───────────────────────────────────────────────────────┘
```

---

## 🔐 Authentication Flow

```
┌────────────┐        ┌─────────────┐        ┌──────────────┐
│   Client   │        │  Express API │        │   MongoDB    │
└─────┬──────┘        └──────┬──────┘        └──────┬───────┘
      │                      │                       │
      │  POST /auth/register │                       │
      │─────────────────────►│                       │
      │                      │  hash password        │
      │                      │  create User doc ─────►
      │                      │◄──────────────────────│
      │  { accessToken,      │  sign JWT             │
      │    refreshToken }    │                       │
      │◄─────────────────────│                       │
      │                      │                       │
      │  GET /products        │                       │
      │  Authorization: Bearer <accessToken>          │
      │─────────────────────►│                       │
      │                      │  verify JWT           │
      │                      │  attach req.user      │
      │  { products }        │                       │
      │◄─────────────────────│                       │
      │                      │                       │
      │  POST /auth/refresh  │  (access token expired)
      │  { refreshToken }    │                       │
      │─────────────────────►│                       │
      │                      │  verify refresh token │
      │  { new accessToken } │  issue new access JWT │
      │◄─────────────────────│                       │
```

**Token Strategy**
- **Access Token** — short-lived (15 min), stored in memory (React state / Zustand)
- **Refresh Token** — long-lived (7 days), stored in `httpOnly` cookie
- On app load, auto-refresh is attempted if cookie present
- Axios request interceptor appends `Authorization` header
- Axios response interceptor handles 401 → refresh → retry

---

## ⚙️ Admin Panel

The admin panel is route-protected. Only users with `role: "admin"` can access `/admin` and all `/api/admin/*` endpoints.

**Role Check Middleware:**
```js
// server/middleware/admin.middleware.js
export const isAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ success: false, message: "Admin access required." });
  }
  next();
};
```

**Admin Capabilities:**
| Section | Actions |
|---|---|
| Dashboard | View revenue, order, customer, product stats |
| Manage Orders | Search, filter by status, update status inline |
| Product Catalog | Edit name/price/desc/badge/stock, upload images |
| Add Product | Create new product with full details + Cloudinary images |
| Reviews | View all reviews, approve, or remove |

---

## 💳 Payment Integration

**Razorpay Flow:**

```
1. Client: POST /api/payment/create-order  { orderId }
2. Server: Create Razorpay order → return { razorpayOrderId, amount, keyId }
3. Client: Open Razorpay checkout modal with options
4. User: Completes payment (UPI / Card / Net Banking / COD)
5. Client: Razorpay calls handler with { razorpayPaymentId, razorpayOrderId, signature }
6. Client: POST /api/payment/verify  { all three IDs }
7. Server: HMAC-SHA256 verify signature → update Order.payment.status = "paid"
8. Server: Send order confirmation email via Nodemailer
9. Client: Redirect to /order-success
```

**Supported Methods (India):**
- 📲 UPI (PhonePe, Google Pay, Paytm)
- 💳 Credit / Debit Card (Visa, Mastercard, RuPay)
- 🏦 Net Banking (50+ banks)
- 💵 Cash on Delivery

---

## 📷 Image Upload

Images are uploaded to **Cloudinary** via a two-step process:

**Flow:**
```
Client selects file
  → FileReader → base64 preview (instant UI feedback)
  → POST /api/upload/image (multipart/form-data)
  → Multer memoryStorage → buffer
  → cloudinary.uploader.upload_stream(buffer)
  → returns { url, publicId }
  → stored in Product.images[] or Review.media[]
```

**Cloudinary Transformations:**
```
Product images:   w_800,h_800,c_fill,q_auto,f_auto
Thumbnails:       w_200,h_200,c_fill,q_auto
Review images:    w_600,h_600,c_limit,q_auto,f_auto
Video thumbnails: w_400,h_300,c_fill,so_0
```

---

## 🔑 Environment Variables

### Client `.env.local`
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxx
VITE_CLOUDINARY_CLOUD_NAME=GaramBazaar
```

### Server `.env`
```env
# App
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173

# MongoDB
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.mongodb.net/GaramBazaar?retryWrites=true

# JWT
JWT_ACCESS_SECRET=your_access_secret_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_min_32_chars
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=GaramBazaar
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=xxxxxxxxxxxxxxxxxxxx

# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxx

# Nodemailer
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@GaramBazaar.in
SMTP_PASS=your_app_password
EMAIL_FROM="GaramBazaar <noreply@GaramBazaar.in>"
```

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js ≥ 20.x
- npm ≥ 10 or yarn ≥ 1.22
- MongoDB Atlas account (free M0 tier is fine for dev)
- Cloudinary account (free tier: 25 GB storage)
- Razorpay Test account

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/GaramBazaar.git
cd GaramBazaar
```

### 2. Install Dependencies
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Configure Environment Variables
```bash
# Server
cp server/.env.example server/.env
# Fill in all values from the Environment Variables section above

# Client
cp client/.env.example client/.env.local
# Fill in VITE_API_BASE_URL and VITE_RAZORPAY_KEY_ID
```

### 4. Seed the Database (Optional)
```bash
cd server
npm run seed:products    # Seeds 100+ products
npm run seed:users       # Creates admin + demo user
npm run seed:all         # Seeds everything
```

> **Demo credentials after seeding:**
> - Admin: `admin@GaramBazaar.in` / `Admin@123`
> - User: `phulkeshwar@example.com` / `password123`

### 5. Run in Development
```bash
# Terminal 1 — Start the backend
cd server
npm run dev              # Starts on http://localhost:5000

# Terminal 2 — Start the frontend
cd client
npm run dev              # Starts on http://localhost:5173
```

### 6. Run with Concurrently (from root)
```bash
# From project root
npm install              # installs root devDeps (concurrently)
npm run dev              # starts both client + server together
```

---

## 📜 Scripts

### Server `server/package.json`
```json
{
  "scripts": {
    "start":           "node server.js",
    "dev":             "nodemon server.js",
    "seed:products":   "node seeds/products.seed.js",
    "seed:users":      "node seeds/users.seed.js",
    "seed:all":        "node seeds/products.seed.js && node seeds/users.seed.js",
    "seed:clear":      "node seeds/clear.js",
    "test":            "jest --coverage",
    "lint":            "eslint . --ext .js"
  }
}
```

### Client `client/package.json`
```json
{
  "scripts": {
    "dev":             "vite",
    "build":           "vite build",
    "preview":         "vite preview",
    "lint":            "eslint . --ext .jsx,.js",
    "test":            "vitest run",
    "test:ui":         "vitest --ui"
  }
}
```

### Root `package.json`
```json
{
  "scripts": {
    "dev":             "concurrently \"npm run dev --prefix server\" \"npm run dev --prefix client\"",
    "build":           "npm run build --prefix client",
    "start":           "npm run start --prefix server"
  }
}
```

---

## ☁️ Deployment

### Frontend → Vercel
```bash
# Connect GitHub repo on vercel.com
# Set build settings:
Framework Preset: Vite
Root Directory:   client
Build Command:    npm run build
Output Directory: dist

# Add environment variables in Vercel dashboard:
VITE_API_BASE_URL      = https://api.GaramBazaar.in/api
VITE_RAZORPAY_KEY_ID   = rzp_live_xxxx
```

### Backend → Railway
```bash
# Connect GitHub repo on railway.app
# Set root directory to: server
# Add environment variables from server/.env
# Railway auto-detects Node.js and runs: npm start

# Custom domain: api.GaramBazaar.in → Railway deployment URL
```

### Alternative: Docker Compose
```yaml
# docker-compose.yml
version: "3.9"
services:
  server:
    build: ./server
    ports: ["5000:5000"]
    env_file: ./server/.env
    depends_on: [mongo]

  client:
    build: ./client
    ports: ["80:80"]
    depends_on: [server]

  mongo:
    image: mongo:6
    volumes: [mongo_data:/data/db]
    ports: ["27017:27017"]

volumes:
  mongo_data:
```

```bash
docker-compose up --build
```

---

## 🚀 Recent Feature Updates

Following a comprehensive platform-wide feature audit, **100% of the 68 missing features** and **10 technical debt gaps** have been fully implemented. Here is the master catalog of the updates:

### 🔒 1. Authentication & GDPR Compliance
* **Forgot & Reset Password**: Added full email-based OTP/reset token verification and password recovery flows.
* **Change Password**: Implemented secure in-app password changes for authenticated users.
* **Email Verification**: Added automated verification emails during sign-up to block spam registrations.
* **Account Deactivation & Deletion**: Added complete profile cancellation and data wipe capabilities.
* **Avatar Profiles**: Configured Cloudinary-backed profile picture uploads.
* **GDPR Data Portability**: Added a secure data export utility that generates downloadable ZIP/JSON files of the user's complete profile, address, and purchase logs.

### 🛍️ 2. Advanced Sourcing & Shopping Experience
* **Multiple Server-Side Addresses**: Created a secure, server-side address book on the User model supporting multiple shipping locations, fully integrated with checkout autofill.
* **Back-in-Stock Alerts ("Notify Me")**: Out-of-stock items display a "Notify Me" trigger that logs alerts and automatically emails buyers upon replenishment.
* **Product Weight/Unit Variants**: Added support for packaging variants (e.g. 250g, 500g, 1kg) with distinct prices and stock tracking.
* **Price Range & Rating Filters**: Integrated responsive sliders and rating filters into the catalog search queries.
* **Recently Viewed Products**: Enabled persistent local tracking of recently browsed items for personalized buyer feeds.
* **Product Comparison Matrix**: Added specs comparison cards allowing buyers to compare items side-by-side.
* **Estimated Delivery Times**: Displays live ETA estimations based on destination regional transit logs.

### 📦 3. Order Fulfilment & Post-Purchase Journey
* **Order Cancellation**: Buyers can cancel pending orders directly before they reach the dispatch status.
* **Returns & Refunds Portal**: Implemented return claim request flows allowing buyers to upload product photos and check refund statuses.
* **Re-Order ("Buy Again")**: Added one-click replication of past orders to speed up repeat pantry purchases.
* **On-the-Way Milestone & Tracker**: Refactored status sequences to include the "On the Way" milestone, rendering a vertical visual journey timeline showing shipping dates, status history notes, and delivery logs.
* **Delivery Slot Selection**: Buyers can select preferred delivery windows (morning, afternoon, evening) during checkout.
* **Order Notes**: Added special instructions fields for delivery riders.
* **Tax-Compliant Invoices**: Integrated a print-optimized invoice generator rendering transaction metadata, itemized splits, tax values, and digital signator blocks.

### 💬 4. Customer Engagement & Support Desk
* **Review Moderation & Voting**: Added edit/delete controls for buyer reviews, along with helpfulness upvoting.
* **Loyalty Points & Rewards**: Integrated a membership tier progression (Silver, Gold, Platinum) with dynamic GaramCoins loyalty earnings based on order subtotals.
* **Referral Code System**: Users can invite friends using unique referral codes to unlock promo coupons.
* **Wishlist price alerts**: Added automated background notifications that alert users if items in their server-saved wishlist undergo price reductions.
* **Contact Support & Ticketing**: Created a support ticket desk (`/contact`) allowing guest and authenticated users to file inquiries.
* **Newsletter Subscription**: Added a newsletter signup strip in the footer with subscription management hooks.

### 🏪 5. Merchant & Seller Portal
* **Visual Sales Dashboard**: Added interactive sales charts tracking revenue trends, order distributions, and top-selling product metrics.
* **Revenue Report Exports**: Enabled downloadable PDF/CSV financial sheets for seller accounting.
* **Inventory Control & Low-Stock Alerts**: Triggers real-time alert notifications to the seller panel when stock levels fall below critical thresholds.
* **Bulk Product Upload**: Integrated CSV/Excel import templates to allow merchants to create hundreds of product listings at once.
* **Catalog Management**: Enabled clone/duplicate product templates, SKU/barcode tracking, and draft toggles (`isPublished` field) to keep items hidden until ready.
* **Seller Coupons**: Allowed merchants to create product-specific discounts.
* **Public Storefront Pages**: Added custom public storefront pages (`/seller/:id`) displaying seller bios, ratings, and active catalogs.
* **KYC & Trust Scores**: Added verification file uploading and calculated aggregate rating scores.

### 🛡️ 6. Platform Administration
* **Admin Dashboard & Charts**: Added time-series analytics charts tracking platform-wide sales performance.
* **User Audit Trail Logs**: Records all administrative changes (role upgrades, product deletions, settings updates) for absolute accountability.
* **User Banning & Suspension**: Admins can ban or unban users and deactivate abusive merchant stores.
* **Seller Approval Queue**: Implemented a KYC verification queue for checking documents before activating seller listings.
* **Global Configuration Panel**: Added a **Site Settings** tab to manage shipping fees, free shipping thresholds, and Cloudinary-backed homepage banners.
* **Report Management Desk**: Created a central reports console to review and resolve catalog flags or abuse notices.
* **Review Moderation Queue**: Admins can moderate incoming review comments.

### 🏗️ 7. Infrastructure & Security Debt
* **Server-Side Pagination**: Enforced pagination parameters on all product, user, and order listing APIs to prevent memory exhaustion at scale.
* **Atomic Transactions & Fallbacks**: Wrapped checkout mutations in atomic Mongoose sessions, with local developer fallbacks for standalone database connections.
* **ReDoS Search Sanitization**: Sanitized catalog searches using regular expression escaping.
* **Real-time SSE Notification Stream**: Enabled live Server-Sent Events (SSE) to push notifications instantly.
* **Handlebars Email Templates**: Standardized Nodemailer notifications with clean HTML email templates.
* **API Versioning**: Upgraded routing paths to `/api/` standard structures.
* **E2E Test Suite**: Configured a testing suite to validate database endpoints and core user-story checkpoints.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/add-pincode-api`
3. Commit your changes: `git commit -m "feat: add real pincode delivery check"`
4. Push to branch: `git push origin feature/add-pincode-api`
5. Open a Pull Request

**Commit Convention (Conventional Commits):**
```
feat:     new feature
fix:      bug fix
docs:     documentation only
style:    formatting, no logic change
refactor: code restructure without feature/fix
test:     adding or fixing tests
chore:    build process, deps update
```

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">

Built with ♥ in India 🇮🇳 by the GaramBazaar team

**[GaramBazaar.in](https://GaramBazaar.in)** · **[Docs](#)** · **[API](#)**

</div>
