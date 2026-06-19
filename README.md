# MekongPOS

A modern, full-stack Point of Sale (POS) system built with React (Vite) and Node.js/Express, powered by a MySQL database.

## Prerequisites

Before you begin, ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [MySQL Server](https://dev.mysql.com/downloads/mysql/) (v8.0 or higher)

## 1. Database Setup

1. Open your MySQL command line or a GUI tool like MySQL Workbench.
2. Create an empty database for the project:
   ```sql
   CREATE DATABASE pos_system;
   ```

## 2. Backend Setup (Server)

1. Open a terminal and navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Install the backend dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file inside the `server` directory and add your database credentials. For example:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=pos_system
   JWT_SECRET=super_secret_key_change_this_in_production
   ```
4. Run the database migrations and seed data. This will create all necessary tables and insert sample products, categories, and users:
   ```bash
   npm run seed
   ```
5. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The server should now be running on `http://localhost:5000`.*

## 3. Frontend Setup (Client)

1. Open a **new** terminal window and navigate to the `client` directory:
   ```bash
   cd client
   ```
2. Install the frontend dependencies:
   ```bash
   npm install
   ```
3. Start the frontend development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:5173`.

## Default Login Credentials

The seed script automatically creates two users for you to test the system:

**Admin User:**
- **Username:** `admin`
- **Password:** `admin123`

**Cashier User:**
- **Username:** `cashier`
- **Password:** `cashier123`

---

### Additional Notes
- The frontend is configured to proxy API requests and uploaded images to `http://localhost:5000` automatically.
- Uploaded images for products will be stored locally inside the `server/uploads/products/` directory.
