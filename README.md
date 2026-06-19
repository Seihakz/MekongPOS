# MekongPOS

A modern, full-featured Point of Sale system built for retail businesses in Cambodia. Features a bilingual interface (English / Khmer), dual-currency support (USD / KHR), real-time inventory tracking, sales analytics, and a clean dark glassmorphism UI.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Default Login Credentials](#default-login-credentials)
- [Usage Guide](#usage-guide)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [Environment Variables](#environment-variables)
- [Troubleshooting](#troubleshooting)

---

## Features

### Admin Panel

| Module | Capabilities |
|---|---|
| **Dashboard** | Today's sales & revenue, total products, low-stock alerts, monthly sales chart, top-selling products, recent sales feed |
| **Products** | Full CRUD with barcode support, image upload, cost/sell pricing, stock tracking, low-stock thresholds, category filtering |
| **Categories** | Create, edit, and organize product categories |
| **Stock Management** | Stock-in, stock-out, and manual adjustments with full movement history |
| **Sales Reports** | Daily and monthly reports with revenue, averages, sales-overview charts, and CSV export |
| **Customers** | Customer directory with loyalty points, contact info, and purchase tracking |
| **Users** | Manage admin and cashier accounts, activate/deactivate users, reset passwords |
| **Settings** | Shop info, tax rate, exchange rate, receipt customization, logo upload |

### Cashier (POS) Interface

- Barcode scanning / product search
- Cart management with quantity and discount controls
- Customer selection
- Payment processing (cash, card, QR, other) with automatic change calculation
- Printable receipts
- Personal sales history

### Cross-cutting

- **Bilingual** — Full English and Khmer (ខ្មែរ) language toggle
- **Dual Currency** — Prices in USD with live KHR conversion
- **Role-based Access** — Admin vs. Cashier permission boundaries enforced on both client and server
- **JWT Authentication** — Secure token-based auth with 24h expiry
- **Responsive Design** — Works on desktop, tablet, and mobile

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite 6, React Router 7, Recharts, React Icons, React Hot Toast |
| **Backend** | Node.js, Express 4 |
| **Database** | MySQL 8 (via mysql2) |
| **Auth** | JSON Web Tokens (JWT), bcryptjs |
| **File Upload** | Multer (product images, shop logo) |
| **Fonts** | Inter (Latin), Kantumruy Pro (Khmer) |

---

## Project Structure

```
PosSystem/
├── client/                     # React frontend (Vite)
│   ├── src/
│   │   ├── components/         # Reusable components (ProtectedRoute, POS components)
│   │   ├── context/            # React contexts (Auth, Cart, Settings, Language)
│   │   ├── layouts/            # AdminLayout, CashierLayout
│   │   ├── pages/
│   │   │   ├── admin/          # Dashboard, Products, Categories, Stock, Reports, Users, Customers, Settings
│   │   │   └── cashier/        # POS, SalesHistory
│   │   ├── services/api.js     # Axios API client with interceptors
│   │   └── index.css           # Global design system
│   ├── index.html
│   └── vite.config.js          # Dev proxy → localhost:5000
│
├── server/                     # Node.js + Express backend
│   ├── config/db.js            # MySQL connection pool
│   ├── controllers/            # Business logic (auth, products, sales, reports, etc.)
│   ├── middleware/             # Auth (JWT), file upload, error handler
│   ├── migrations/             # SQL schema (001_initial_schema.sql)
│   ├── routes/                 # Express route definitions
│   ├── seeds/                  # Seed script + sample SQL data
│   ├── app.js                  # Express app setup, middleware, route mounting
│   └── server.js               # Entry point
│
└── README.md
```

---

## Prerequisites

Before you begin, make sure you have the following installed:

| Requirement | Version | Download |
|---|---|---|
| **Node.js** | 18+ | [nodejs.org](https://nodejs.org) |
| **MySQL** | 8.0+ | [mysql.com](https://dev.mysql.com/downloads/) |
| **npm** | 9+ | Bundled with Node.js |

---

## Installation & Setup

### Step 1 — Clone the Repository

```bash
git clone https://github.com/Seihakz/MekongPOS.git
cd PosSystem
```

### Step 2 — Configure the Backend

1. Navigate to the server directory:

   ```bash
   cd server
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the `server/` directory (or edit the existing one):

   ```env
   PORT=5000

   # Database
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=pos_system

   # JWT
   JWT_SECRET=your_secret_key_here
   JWT_EXPIRES_IN=24h

   # Defaults
   DEFAULT_TAX_RATE=10
   DEFAULT_EXCHANGE_RATE=4100

   # Shop Info
   SHOP_NAME=MekongPOS
   SHOP_ADDRESS=Phnom Penh, Cambodia
   SHOP_PHONE=+855 12 345 678
   ```

4. Initialize the database with schema and seed data:

   ```bash
   npm run seed
   ```

   This will:
   - Create the `pos_system` database
   - Create all tables (users, products, categories, customers, sales, stock movements, settings)
   - Insert default settings, sample categories, 16 sample products, and sample customers
   - Create two default users with hashed passwords

5. Start the backend server:

   ```bash
   # Development (auto-restart on changes)
   npm run dev

   # Production
   npm start
   ```

   You should see:
   ```
   ✅ Database connected successfully
   🏪 MekongPOS Server
   🚀 Running on http://localhost:5000
   ```

### Step 3 — Configure the Frontend

1. Open a new terminal and navigate to the client directory:

   ```bash
   cd client
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open your browser to **http://localhost:5173**

> The Vite dev server proxies all `/api` and `/uploads` requests to the backend at `localhost:5000`, so both servers need to be running simultaneously.

---

## Default Login Credentials

| Role | Username | Password |
|---|---|---|
| **Admin** | `admin` | `admin123` |
| **Cashier** | `cashier` | `cashier123` |

> Change these passwords immediately after setup via **Settings → Users → Reset Password**.

---

## Usage Guide

### As an Admin

1. **Dashboard** — After login you land on the dashboard. Review today's sales, revenue, low-stock alerts, and the monthly sales trend chart.

2. **Manage Products** — Navigate to **Products** to add items. Each product can have a barcode (auto-generatable), name, category, cost/sell price, stock quantity, and minimum stock level. Upload product images for visual identification in the POS.

3. **Organize Categories** — Under **Categories**, create logical groupings (e.g., Beverages, Snacks, Electronics). Products are filtered by category in the POS screen.

4. **Track Inventory** — Use **Stock Management** to record stock received (stock-in), damaged goods (stock-out), or correct discrepancies (adjustment). Every movement is logged with a timestamp and reference note.

5. **Review Reports** — Under **Reports**:
   - **Daily**: View a specific day's sales count, revenue, average sale value, and itemized transaction list. Click the eye icon to drill into any sale's full receipt.
   - **Monthly**: See the month's totals, a day-by-day revenue chart, and a top-products bar chart. Export data as CSV.

6. **Manage Customers** — Add customers with phone, email, address, and loyalty points. Use the search bar to find customers quickly.

7. **Manage Users** — Create cashier/admin accounts, toggle active status, or reset passwords. Deactivated users cannot log in.

8. **Configure Settings** — Set your shop name, address, phone, tax rate, USD→KHR exchange rate, receipt footer message, and upload a shop logo.

### As a Cashier

1. **Point of Sale** — Search products by name or scan a barcode. Click items to add them to the cart. Adjust quantities, apply discounts, and select a customer if applicable.

2. **Checkout** — Click **Pay Now**, choose a payment method, enter the amount received, and the system calculates change automatically.

3. **Print Receipt** — After completing a sale, print the receipt directly from the browser.

4. **Sales History** — View your own past transactions with timestamps and totals.

### Language Switching

Click the language toggle (EN / ខ្មែរ) in the top navigation bar to switch the entire interface between English and Khmer instantly.

---

## API Reference

All endpoints are prefixed with `/api`. Authentication uses `Authorization: Bearer <token>` header.

### Auth

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/login` | Public | Login, returns JWT + user data |
| `GET` | `/auth/me` | Token | Get current user profile |
| `PUT` | `/auth/change-password` | Token | Change own password |

### Products

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/products` | Public | List products (supports `?search=`, `?category_id=`) |
| `GET` | `/products/low-stock` | Public | Get products at/below minimum stock |
| `GET` | `/products/barcode/:barcode` | Public | Find product by barcode |
| `GET` | `/products/:id` | Public | Get single product |
| `POST` | `/products` | Admin | Create product (multipart for image) |
| `PUT` | `/products/:id` | Admin | Update product |
| `DELETE` | `/products/:id` | Admin | Soft-delete product |

### Categories

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/categories` | Public | List all active categories |
| `GET` | `/categories/:id` | Public | Get single category |
| `POST` | `/categories` | Admin | Create category |
| `PUT` | `/categories/:id` | Admin | Update category |
| `DELETE` | `/categories/:id` | Admin | Soft-delete category |

### Sales

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/sales` | Token | Create a sale (items, payment, discounts) |
| `GET` | `/sales` | Token | List sales (cashiers see only their own) |
| `GET` | `/sales/today` | Token | Get today's sales for current user |
| `GET` | `/sales/:id` | Token | Get sale detail with line items |

### Stock

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/stock/in` | Admin | Record stock received |
| `POST` | `/stock/out` | Admin | Record stock removed |
| `POST` | `/stock/adjustment` | Admin | Manual stock correction |
| `GET` | `/stock/movements` | Admin | Movement history log |
| `GET` | `/stock/low-stock` | Admin | Low-stock product list |

### Customers

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/customers` | Token | List customers (supports `?search=`) |
| `GET` | `/customers/:id` | Token | Get single customer |
| `POST` | `/customers` | Token | Create customer |
| `PUT` | `/customers/:id` | Token | Update customer |
| `DELETE` | `/customers/:id` | Token | Soft-delete customer |

### Users (Admin Only)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/users` | List all users |
| `GET` | `/users/:id` | Get single user |
| `POST` | `/users` | Create user |
| `PUT` | `/users/:id` | Update user |
| `PATCH` | `/users/:id/toggle-active` | Activate/deactivate user |
| `PUT` | `/users/:id/reset-password` | Reset user password |

### Reports (Admin Only)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/reports/dashboard` | Dashboard stats (today's sales, revenue, counts) |
| `GET` | `/reports/daily?date=YYYY-MM-DD` | Daily report with summary, top products, hourly breakdown |
| `GET` | `/reports/monthly?month=YYYY-MM` | Monthly report with daily breakdown chart data |
| `GET` | `/reports/top-products?period=30&limit=10` | Top-selling products by quantity/revenue |
| `GET` | `/reports/date-range?start_date=&end_date=` | Custom date range summary |
| `GET` | `/reports/by-payment-method` | Sales grouped by payment method |
| `GET` | `/reports/by-cashier` | Sales grouped by cashier |

### Settings

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/settings` | Token | Get all settings |
| `GET` | `/settings/:key` | Token | Get single setting |
| `PUT` | `/settings` | Admin | Update settings |
| `POST` | `/settings/logo` | Admin | Upload shop logo |

---

## Database Schema

The database `pos_system` contains 8 tables:

| Table | Purpose |
|---|---|
| `settings` | Key-value configuration (tax rate, exchange rate, shop info, receipt text) |
| `users` | System accounts (admin/cashier) with hashed passwords and active status |
| `categories` | Product categories |
| `products` | Product catalog with pricing, stock levels, barcodes, and images |
| `customers` | Customer directory with loyalty points |
| `sales` | Transaction records (subtotal, discounts, tax, total, payment) |
| `sale_items` | Line items for each sale (product, qty, unit price, total) |
| `stock_movements` | Audit log for all inventory changes |

All tables include `is_active` boolean flags for soft deletion and `created_at`/`updated_at` timestamps. The full schema is at `server/migrations/001_initial_schema.sql`.

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `5000` | Backend server port |
| `DB_HOST` | `127.0.0.1` | MySQL host |
| `DB_PORT` | `3306` | MySQL port |
| `DB_USER` | `root` | MySQL username |
| `DB_PASSWORD` | — | MySQL password |
| `DB_NAME` | `pos_system` | Database name |
| `JWT_SECRET` | — | Secret key for signing JWT tokens |
| `JWT_EXPIRES_IN` | `24h` | Token lifetime |
| `DEFAULT_TAX_RATE` | `10` | Default tax percentage |
| `DEFAULT_EXCHANGE_RATE` | `4100` | USD to KHR exchange rate |
| `SHOP_NAME` | `MekongPOS` | Shop display name |
| `SHOP_ADDRESS` | — | Shop address (shown on receipts) |
| `SHOP_PHONE` | — | Shop phone (shown on receipts) |

---

## Troubleshooting

### Backend won't start — database connection failed

- Verify MySQL is running: `mysql -u root -p`
- Check your `.env` credentials match your MySQL setup
- Ensure the database exists (run `npm run seed` to create it)

### Frontend can't reach the API

- Confirm the backend is running on `http://localhost:5000`
- Check the Vite proxy in `client/vite.config.js` targets the correct backend port
- Look for CORS errors in the browser console

### Login returns 401

- Make sure you ran `npm run seed` to create the default users
- Verify credentials: `admin` / `admin123` or `cashier` / `cashier123`

### Khmer font not displaying correctly

- Ensure you have an internet connection (Google Fonts are loaded via CDN)
- The font (Kantumruy Pro) loads in `client/index.html`

### Product images not showing

- Check that `server/uploads/` directory exists and is writable
- The backend serves uploads at `/uploads/*`

---

## License

This project is proprietary software. All rights reserved.
