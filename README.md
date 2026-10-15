# ShopKart

ShopKart is a full-stack e-commerce application for browsing products and managing an online shopping experience. Customers can create an account, search and sort the catalogue, save items to a wishlist, manage a cart, check out with Razorpay test payments, and view their orders.

## Features

- Customer registration, login, logout, and password changes
- Product browsing, search, category filtering, and price sorting
- Wishlist and shopping cart
- Checkout and payment verification with Razorpay Test Mode
- Order history and order details
- MongoDB persistence

## Technology

- **Frontend:** React, Vite, React Router, Context API, Axios
- **Backend:** Node.js, Express, Mongoose
- **Database:** MongoDB
- **Payments:** Razorpay (test mode)

## Requirements

- Node.js 18 or newer and npm
- MongoDB running locally or a MongoDB Atlas connection string
- Razorpay test API keys to exercise checkout (optional for browsing the app)

## Local setup

Clone the repository and open two terminal windows, one for the backend and one for the frontend.

```bash
git clone https://github.com/chsnikitha08/Shopkart.git
cd Shopkart
```

### 1. Configure and start the backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env` and set `MONGO_URI` to your MongoDB connection string and `JWT_SECRET` to a long random value. The sample file uses port `5001` and a local MongoDB URI.

Start the API:

```bash
npm run dev
```

For a non-watch process, use `npm start`. The API listens on `http://localhost:5001` with the sample configuration. Check that the server is ready at [`http://localhost:5001/health`](http://localhost:5001/health).

### 2. Configure and start the frontend

In a second terminal, from the repository root:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open [`http://localhost:5173`](http://localhost:5173). The sample `VITE_API_URL` points to the backend at `http://localhost:5001`. If you change the backend port, update `VITE_API_URL` in `frontend/.env` and `CLIENT_URL` in `backend/.env` as needed.

### Environment variables

| Variable | Used by | Purpose |
| --- | --- | --- |
| `PORT` | Backend | API port (sample: `5001`) |
| `NODE_ENV` | Backend | Runtime environment |
| `MONGO_URI` | Backend | MongoDB connection string |
| `JWT_SECRET` | Backend | Secret used to sign authentication tokens; replace the sample value |
| `JWT_EXPIRES_IN` | Backend | Token lifetime (sample: `7d`) |
| `CLIENT_URL` | Backend | Frontend origin allowed by CORS (sample: `http://localhost:5173`) |
| `RAZORPAY_KEY_ID` | Backend | Razorpay Test Mode key ID |
| `RAZORPAY_KEY_SECRET` | Backend | Razorpay Test Mode secret |
| `VITE_API_URL` | Frontend | Backend API base URL |

The `.env` files contain local configuration and must not be committed. The repository ignores them; `.env.example` files contain safe sample values for setup.

## Products and payments

The catalogue starts empty until products are added to MongoDB. To add a product, sign in with an admin account and send a `POST /products` request with `name`, `description`, `price`, `category`, `image`, and `stock` fields. New accounts are regular customers by default. To grant admin access to an account, first register it, then set `isAdmin` to `true` on its document in the `customers` collection using MongoDB Atlas or MongoDB Compass.

Razorpay credentials are only needed to test checkout. Add your Razorpay **Test Mode** credentials to `backend/.env` and restart the backend. Use Razorpay's test payment details; test transactions do not move real money.

## Main API routes

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/customers/register` | Create an account |
| `POST` | `/customers/login` | Sign in |
| `GET` | `/customers/me` | Get the signed-in customer |
| `POST` | `/products` | Add a product (admin only) |
| `GET` | `/products` | List products; supports `search`, `category`, and `sort` query parameters |
| `GET` | `/products/:id` | Get product details |
| `GET`, `POST`, `DELETE` | `/wishlist` and `/wishlist/:productId` | View and update wishlist |
| `GET`, `POST`, `PATCH`, `DELETE` | `/cart` and `/cart/:productId` | View and update cart |
| `POST` | `/orders/create-payment-order` | Create a payment order |
| `POST` | `/orders/verify-payment` | Verify payment |
| `GET` | `/orders` and `/orders/:id` | View orders |
| `GET` | `/health` | Check API availability |

Authentication uses an HTTP-only cookie in the browser. Authenticated routes require the customer to be signed in.
