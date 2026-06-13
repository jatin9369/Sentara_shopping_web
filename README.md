RUN THIS# 🛒 SENTARA — Full-Stack E-Commerce Platform

Welcome to **SENTARA**, a responsive, modern, and feature-rich full-stack e-commerce application. The platform offers a seamless shopping experience complete with OTP-based authentication, product browsing, dynamic filtering, a persistent shopping cart, coupon code application, and order tracking.

This project is structured as a monorepo featuring a **Node.js/Express backend** (using JSON files as a mock database) and a **React + Vite + Tailwind CSS frontend**.

---

## 🏗️ Architecture & Project Structure

The project is split into two primary components: the backend API server and the frontend client.

```
SENTARA/
├── client/                 # React SPA (Vite + Tailwind CSS + Framer Motion)
│   ├── src/                # React components, routing, and styles
│   ├── vite.config.js      # Vite configuration (configured to build into root's public folder)
│   └── package.json        # Frontend dependencies & scripts
├── server/                 # Node.js + Express API Backend
│   ├── data/               # Mock Database (.json files)
│   ├── middleware/         # Custom authentication middlewares (JWT verification)
│   ├── routes/             # API Router endpoints (Auth, Products, Cart, Orders, Coupons, User)
│   └── server.js           # Server startup script
├── public/                 # Static asset server directory (overwritten when client builds)
├── package.json            # Backend dependencies & server start scripts
└── README.md               # Main project documentation
```

### Key Technical Stack
* **Frontend**: React (v19), Vite, React Router DOM, Tailwind CSS, Framer Motion (micro-animations), Lucide React (icons).
* **Backend**: Node.js, Express, JSON-file-based databases (via simple synchronous filesystem reads/writes).
* **Security & Auth**: JWT (JSON Web Tokens), `bcryptjs`, custom authentication middleware, in-memory OTP generator.

---

## ⚡ Quick Start Guide

Follow these steps to set up and run SENTARA on your local machine.

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) (v16+ recommended) and `npm` installed.

---

### Step 1: Install Dependencies

You must install dependencies for both the root (backend) and the client (frontend).

1. **Install Root/Backend dependencies:**
   ```bash
   npm install
   ```

2. **Install Client/Frontend dependencies:**
   ```bash
   cd client
   npm install
   cd ..
   ```

---

### Step 2: Running in Development Mode

For the best developer experience (with hot reloading enabled for both frontend and backend), run both servers concurrently in separate terminals:

#### Terminal 1: Start the Backend Server (Express)
Runs on **http://localhost:3000** with hot reloading via `nodemon`.
```bash
npm run dev
```

#### Terminal 2: Start the Frontend App (Vite React)
Runs on **http://localhost:5173** (or the next available port) with Vite Hot Module Replacement (HMR).
```bash
cd client
npm run dev
```

> [!TIP]
> The React dev server is pre-configured in [vite.config.js](file:///c:/Users/Nitin%20Singh/OneDrive/Desktop/SENTARA/client/vite.config.js) to proxy all `/api` requests automatically to the backend on port 3000.

---

### Step 3: Running in Production/Served Mode (Single Port)

If you want the Express backend to build and serve the React app directly from the single port `3000`, follow these instructions:

1. **Build the React frontend:**
   This command compiles your React app and outputs the production bundle directly into the root's `public/` directory:
   ```bash
   cd client
   npm run build
   cd ..
   ```

2. **Start the backend server:**
   ```bash
   npm start
   ```
3. Open your browser and navigate to **http://localhost:3000**. The server will serve the compiled React SPA as the frontend and handle API requests.

---

## 🗄️ Mock Database (`server/data/`)

SENTARA uses local, persistent JSON files located in `server/data/` as a lightweight mock database. This bypasses the need for a MongoDB or PostgreSQL setup. 

* **[products.json](file:///c:/Users/Nitin%20Singh/OneDrive/Desktop/SENTARA/server/data/products.json)**: Catalog of products with details, categories, descriptions, images, reviews, and ratings.
* **[users.json](file:///c:/Users/Nitin%20Singh/OneDrive/Desktop/SENTARA/server/data/users.json)**: User accounts, hashed passwords, stored delivery addresses, and persistent cart objects.
* **[orders.json](file:///c:/Users/Nitin%20Singh/OneDrive/Desktop/SENTARA/server/data/orders.json)**: List of orders placed through the checkout flow.
* **[coupons.json](file:///c:/Users/Nitin%20Singh/OneDrive/Desktop/SENTARA/server/data/coupons.json)**: Valid promotional codes (e.g., `SAVE10`, `SENTARA20`) with discount percentages and validity checks.

---

## 📡 API Reference & Endpoints

The backend Express app exposes the following `/api` REST endpoints. Most write operations require passing a Bearer JWT Token in the `Authorization` header (`Authorization: Bearer <token>`).

### 🔑 Authentication (`/api/auth`)
* `POST /api/auth/send-otp`: Sends a mock 6-digit OTP code to a 10-digit mobile number.
  > [!NOTE]
  > For testing simplicity, the generated OTP is **returned in the JSON response payload**. Look at the terminal output or network tab response to grab it!
* `POST /api/auth/verify-otp`: Validates the OTP. On success, registers a new account (if mobile is unseen) or logs in, returning user details and a signed JWT Token.
* `GET /api/auth/me`: Retrieves current logged-in user details. *(Requires Auth)*

### 📦 Products (`/api/products`)
* `GET /api/products`: Lists products with rich filtering query parameters:
  * `search`: Search product title/description.
  * `category`: Filter by product categories (e.g., Electronics, Fashion).
  * `minPrice` / `maxPrice`: Filter by price range.
  * `sort`: Sort products (`price_asc`, `price_desc`, `rating`, `newest`).
  * `page` / `limit`: Pagination arguments.
* `GET /api/products/:id`: Fetches detailed information for a single product.

### 🛒 Shopping Cart (`/api/cart`) *(All Require Auth)*
* `GET /api/cart`: Gets the authenticated user's current shopping cart.
* `POST /api/cart`: Adds a product or updates its quantity in the cart.
* `DELETE /api/cart/:productId`: Removes a product from the cart.
* `POST /api/cart/clear`: Clears the shopping cart.

### 🏷️ Coupon Codes (`/api/coupons`)
* `POST /api/coupons/validate`: Verifies if a coupon code (e.g. `SAVE10`) is valid and returns the eligible discount percentage.

### 💳 Orders & Checkout (`/api/orders`) *(All Require Auth)*
* `POST /api/orders`: Submits a checkout order. Expects payment details, delivery address, cart items, and applied coupon code.
* `GET /api/orders`: Retrieves order history for the logged-in user.
* `GET /api/orders/:id`: Fetches status and information for a specific order.

---

## 💡 Troubleshooting & Notes

* **Port Conflicts**: If port `3000` is already in use by another process on your machine, edit the `PORT` variable in [server.js](file:///c:/Users/Nitin%20Singh/OneDrive/Desktop/SENTARA/server/server.js#L13) to a free port.
* **OTP Code Verification**: When testing the checkout or sign-in flow locally, enter a 10-digit number. After requesting the OTP, inspect the server console logs or the HTTP Response in your browser developer tools to find the generated 6-digit verification code.
* **SPA Routing**: The backend server is configured with a wildcard route `app.get('*', ...)` to serve `index.html` for any client routes (e.g., `/cart`, `/profile`) to support client-side React Router navigation.
