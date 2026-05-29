# GramBazaar Production Readiness

GramBazaar has been moved from a mock Express prototype toward a production backend. The API now uses MongoDB/Mongoose models, bcrypt password hashing, signed JWT access tokens, server-side order totals, inventory checks, Cloudinary upload plumbing, Razorpay payment verification, SMTP email support, rate limiting, Helmet, and structured request logging.

## Applied Stack

| Area | Technology |
| --- | --- |
| Frontend | React 19, Vite, React Router, Tailwind CSS |
| API | Node.js, Express |
| Database | MongoDB Atlas/local MongoDB with Mongoose |
| Auth | bcryptjs password hashing, jsonwebtoken signed access tokens |
| Payments | Razorpay Orders + HMAC signature verification |
| Uploads | Multer memory upload + Cloudinary SDK |
| Email | Nodemailer SMTP |
| Security | Helmet, CORS allowlist, express-rate-limit |
| Logging | pino-http |
| Validation | Route validators with stricter server checks |

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
MONGODB_URI=mongodb://127.0.0.1:27017/grambazaar
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
CLOUDINARY_API_SECRET=replace_me
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=replace_me
SMTP_PASS=replace_me
MAIL_FROM="GramBazaar <orders@your-domain.com>"
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

## Remaining Production Tasks

- Add refresh-token rotation or httpOnly cookie sessions for long-lived auth.
- Add Razorpay webhook handling for delayed payment reconciliation.
- Add API and UI tests for auth, cart, checkout, payment verification, uploads, admin authorization, and inventory.
- Add CI checks for client lint/build and server syntax/tests.
- Review `npm audit` results before launch; the install currently reports 4 moderate vulnerabilities.
- Replace seed demo users before using a production database.

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
