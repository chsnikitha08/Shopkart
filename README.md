# ShopKart (Labs 01 to 06)

A full MERN e-commerce app: auth, product catalogue, wishlist, cart, checkout with Razorpay (Test Mode) and order history.

```
shopkart/
├── backend/    Node + Express + MongoDB (MVC)
└── frontend/   React (Vite) + React Router + Context API
```

## Prerequisites

- Node.js 18 or newer and npm
- MongoDB running locally, or a MongoDB Atlas connection string
- Razorpay test-mode keys for testing checkout payments (optional)

Install dependencies separately in `backend/` and `frontend/` as shown below.

## 1. Run the backend

```bash
cd backend
npm install
cp .env.example .env     # edit .env with your local settings
npm run dev              # http://localhost:5001 with the sample .env
```

The backend does not currently include a seed script. Add products through the database before browsing the catalogue.

`.env` values:

| Key | Meaning |
|---|---|
| `MONGO_URI` | Mongo connection string |
| `JWT_SECRET` | any long random string |
| `CLIENT_URL` | frontend origin, used for CORS (default `http://localhost:5173`) |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | **Test Mode** keys from the Razorpay dashboard |

Without Razorpay keys everything works except `POST /orders/create-payment-order`, which returns 503.

## 2. Run the frontend

```bash
cd frontend
npm install
cp .env.example .env     # VITE_API_URL=http://localhost:5001
npm run dev              # http://localhost:5173
```

The sample backend configuration sets `PORT=5001`; keep `VITE_API_URL` in the frontend configuration pointed at the same port. If you change the backend port, update both `.env` files accordingly.

Flow: Register → Login → Products (search / filter / sort) → Wishlist → Cart → Checkout → Razorpay test payment → Order success → My Orders.

## 3. Razorpay Test Mode

1. Razorpay Dashboard → switch to **Test Mode** → Account & Settings → API Keys → Generate.
2. Put Key ID and Key Secret in `backend/.env`, restart the backend.
3. At checkout, use the test card / UPI details listed in Razorpay's Test Mode documentation. No real money moves.

The secret stays on the server. The server computes the amount in paise, creates the Razorpay order, and verifies the HMAC-SHA256 signature using the order id stored in its own database before marking the order PAID and clearing the cart.

## API summary

| Method | Endpoint | Auth |
|---|---|:---:|
| POST | `/customers/register`, `/customers/login` | |
| GET | `/customers/me` | ✅ |
| POST | `/customers/logout` | ✅ |
| PATCH | `/customers/change-password` (bonus) | ✅ |
| POST / GET | `/products`, `/products?search=&category=&sort=` | |
| GET | `/products/:id` | |
| GET | `/wishlist` | ✅ |
| POST / DELETE | `/wishlist/:productId` | ✅ |
| PATCH | `/wishlist/:productId/toggle` (bonus) | ✅ |
| GET | `/cart` | ✅ |
| POST / PATCH / DELETE | `/cart/:productId` | ✅ |
| POST | `/orders/create-payment-order`, `/orders/verify-payment`, `/orders/payment-failed` | ✅ |
| GET | `/orders`, `/orders/:id` | ✅ |

## Decisions where the lab documents disagreed

- **One user model.** Lab 01 names it `Customer`; Labs 04 and 05 say "User". The app uses `Customer` everywhere and adds `wishlist` and `cart` to it.
- **Cookie auth throughout.** Lab 04's `Authorization: Bearer` example is accepted as a fallback only (handy for API tools); the browser uses the HttpOnly cookie.
- **Endpoint name.** Lab 06's diagrams say `POST /orders`; the real endpoint used is `/orders/create-payment-order`.
- **Context API** is used for auth and cart state (Redux Toolkit is the alternative the lab allows).
- **Extras beyond the spec:** product stock is decremented after a verified payment; `GET /orders` lists only paid orders (abandoned checkouts stay hidden); `POST /orders/payment-failed` marks a pending order FAILED.
- Bonuses included: change password, product sorting, wishlist toggle.
