# GaramBazaar Production Readiness

GaramBazaar has been moved from a mock Express prototype toward a production backend. The API now uses MongoDB/Mongoose models, bcrypt password hashing, signed JWT access tokens, server-side order totals, inventory checks, Cloudinary upload plumbing, Razorpay payment verification, SMTP email support, rate limiting, Helmet, and structured request logging.

## 🛠️ Applied Stack & Architectural Rationale ("Why Used")

Every tool and technology in GaramBazaar's architecture was chosen to optimize performance, enhance security, ensure scalability under Render/Vercel free tier constraints, and provide a premium shopper experience.

### 🌐 Frontend Technologies

* **React (v18/19)**: 
  * *Why*: Declarative component-based architecture enables building a dynamic, highly responsive user interface. Component updates render efficiently using virtual DOM reconciliation.
* **React Router DOM (v6)**: 
  * *Why*: Handles fast, single-page application (SPA) client-side routing, preserving application state and ensuring instantaneous page switches without page reloads.
* **React `lazy()` & `Suspense` (Route-Level Code-Splitting)**: 
  * *Why*: Splits large JavaScript bundles into small, demand-loaded page chunks. This reduced the initial bundle weight by **42%** (from 435KB to 251KB), ensuring the homepage loads instantly for anonymous visitors while deferring heavy admin/seller dashboards.
* **Tailwind CSS (v3)**: 
  * *Why*: Utility-first styling engine allows rapid UI iteration and responsive design layout coding without writing repetitive CSS rules. Keeps final production styles lightweight and clean.
* **Framer Motion**: 
  * *Why*: Orchestrates fluid page transitions, staggered layout reveals, and micro-interactions, making the shopping experience feel polished and premium.
* **Zustand & localStorage State Caching**: 
  * *Why*: Fast, hook-based client state management for Auth and Cart. Eliminates React context re-render thrashing and keeps state persistent across browser reloads.
* **Vite**: 
  * *Why*: Next-generation frontend build tool that provides sub-second Hot Module Replacement (HMR) during development and highly optimized Rollup assets for production.
* **Cloudinary Dynamic Sizing**: 
  * *Why*: Injects real-time transformation parameters (`f_auto`, `q_auto`, `w_400`, `w_800`) directly into image source links. This optimizes raw image payloads down by up to 90%, preserving bandwidth on mobile connections.
* **React `createPortal`**: 
  * *Why*: Renders modals outside the main DOM transition trees (directly into `document.body`), resolving viewport cropping bugs and scroll alignment issues.

### ⚙️ Backend & API Technologies

* **Node.js & Express**: 
  * *Why*: Asynchronous, event-driven JavaScript runtime paired with a minimal routing framework. Ideal for building high-concurrency, fast-response REST APIs.
* **MongoDB Atlas & Mongoose ODM**: 
  * *Why*: Documents are stored as flexible, JSON-like objects that map cleanly to JavaScript code structures. Mongoose schemas enforce data structure validations, model relationships, and index configurations (e.g. compound index on reviewed products).
* **Compression (Gzip)**: 
  * *Why*: Automatically compresses all JSON response payloads sent from the backend, reducing transmission overhead and loading product grids faster.
* **JSON Web Tokens (JWT)**: 
  * *Why*: Secure, stateless client-side session management. Stores authenticated user claims securely, eliminating database lookup queries for every incoming request.
* **bcryptjs**: 
  * *Why*: Hashes user passwords using a slow-cryptography algorithm with `12 salt rounds`, protecting sensitive credentials from database leak exposures.
* **Multer & Cloudinary SDK**: 
  * *Why*: Multer parses incoming multipart upload files directly into memory buffers, which the Cloudinary SDK streams directly to the cloud. This avoids using local server disk storage, saving resources.
* **Razorpay SDK**: 
  * *Why*: Standard payment gateway integration for the Indian market. Security-hardened in controllers with HMAC-SHA256 signature checks to prevent payment validation bypass.
* **Nodemailer SMTP**: 
  * *Why*: Provides automated transactional email dispatches for order placements, invoice receipt copies, and security alerts.
* **Helmet & CORS**: 
  * *Why*: Helmet configures secure HTTP response headers (XSS protection, MIME sniffing blocks, clickjacking protection), while CORS restricts api access to authorized client domains.
* **express-rate-limit**: 
  * *Why*: Mitigates brute-force attacks and resource exhaustion (DDoS) by capping IP request hits per window. Capped loosely in development to facilitate fast local developer testing.
* **Pino & pino-http logging**: 
  * *Why*: High-speed, structured JSON request logging. Negligible execution overhead, making it easy to pipe backend logs to analysis aggregators.

## Required Environment

Client:

```env
VITE_API_BASE_URL=/api
VITE_BACKEND_URL=http://localhost:5001
```

Server:

```env
NODE_ENV=development
PORT=5001
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27017/GaramBazaar
JWT_ACCESS_SECRET=replace_with_32_plus_character_access_secret
JWT_REFRESH_SECRET=replace_with_32_plus_character_refresh_secret
JWT_ACCESS_EXPIRES=15m
BCRYPT_SALT_ROUNDS=12
SEED_USER_PASSWORD=replace_with_demo_user_password
SEED_ADMIN_PASSWORD=replace_with_demo_admin_password
RAZORPAY_KEY_ID=rzp_test_replace_me
RAZORPAY_KEY_SECRET=replace_me
CLOUDINARY_CLOUD_NAME=replace_me
CLOUDINARY_API_KEY=replace_me
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=garamsoftwares@gmail.com
SMTP_PASS=your_16_character_app_password
MAIL_FROM="SupportMail <garamsoftwares@gmail.com>"
```

## What Changed

- Replaced mock users/products/orders/reviews with Mongoose models.
- Added durable cart, coupon, order, product, review, and user collections.
- Replaced base64 mock tokens with signed JWTs.
- Replaced plain-text password checks with bcrypt hashing.
- Reworked order creation so prices, discounts, shipping, totals, and inventory are calculated on the server.
- Added stock decrement on order creation.
- Added real Razorpay order creation and payment signature verification.
- Added real Cloudinary upload pipeline through Multer.
- Added SMTP-backed transactional email support.
- Added Helmet, rate limiting, cookie parsing, and request logging.
- Updated seed scripts to seed MongoDB products, users, and coupons.
- Removed demo credential hints from the admin UI.
- Added purchase alerts for sellers and custom status transition notifications for buyers.
- Replaced hardcoded tracking dots with a dynamic milestones bar and journey timeline displaying statusHistory notes.
- Implemented an inline payment status select dropdown for COD orders in merchant and admin tables.
- Added a tax-compliant, printable single-page PDF Invoice modal.
- Integrated React `createPortal` centered modals with 6px glassmorphic blur overlays.
- Built a premium SEO optimization framework with JSON-LD Product/WebSite markup schemas, static robots.txt, and sitemap.xml.
- Implemented multiple server-side saved addresses (address book CRUD API and checkout quick-fill UI).
- Implemented stock availability alerts ("Notify Me" subscription and automated restock email automation).
- Exposed SKU and Barcode catalog fields for product listings.
- Added catalog Draft/Publish status toggles to hide products from customers until ready.
- Integrated site-wide settings panel to configure shipping parameters and Cloudinary-backed homepage banners.
- Created static dynamic page routes for Shipping Policy, Easy Returns, FAQs, About Us, Careers, Press, and Sustainability.
- Added a secure Razorpay payment webhook endpoint (`POST /api/payment/webhook`) to handle payment captured and order paid notifications.

## Remaining Production Tasks

- Add refresh-token rotation or httpOnly cookie sessions for long-lived auth.
- Add API and UI tests for auth, cart, checkout, payment verification, uploads, admin authorization, and inventory.
- Add CI checks for client lint/build and server syntax/tests.
- Review `npm audit` results before launch.
- Replace seed demo credentials with unique passwords before deployment.

## Local Run Order

1. Create `server/.env` from `server/.env.example`.
2. Create `client/.env` from `client/.env.example`.
3. Start MongoDB locally or set `MONGODB_URI` to MongoDB Atlas.
4. Run `npm run seed:all --prefix server`.
5. Run `npm run dev` from the repo root.

## Deployment Notes

- Use a managed MongoDB provider such as MongoDB Atlas.
- Store all server env vars in the hosting provider, never in git.
- Use separate Razorpay test/live keys for staging and production.
- Restrict `CLIENT_URL` to the real deployed frontend URL.
- Configure Cloudinary upload limits and folder names per environment.
