# 🏝️ Holiday Mirage — Full Stack Development (FSD) Demonstration

**Holiday Mirage** is a clean, modern, and simple demonstration of a **3-Tier Full Stack MERN Architecture** built for academic evaluation and demonstration.

---

## 🏗️ Architecture Overview

The application follows the classic **3-Tier Architecture**:

```
┌─────────────────────────────────────────────────────────┐
│              1. Presentation Layer (Frontend)           │
│  React 18 • Vite • Tailwind CSS • React Router • Context│
└────────────────────────────┬────────────────────────────┘
                             │  HTTP / REST (JSON)
                             │  Axios + JWT Bearer Auth
┌────────────────────────────▼────────────────────────────┐
│               2. Application Layer (Backend)            │
│  Node.js • Express.js • JWT Middleware • REST API Routes │
└────────────────────────────┬────────────────────────────┘
                             │  Mongoose ODM
                             │  MongoDB Driver
┌────────────────────────────▼────────────────────────────┐
│                 3. Data Layer (Database)                │
│  MongoDB (Collections: Users, Destinations, Bookings)   │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** (v18 or higher recommended)
- **MongoDB** running locally (`mongodb://127.0.0.1:27017`)

### 2. Install Dependencies (First time only)
From the root directory:
```bash
npm run install:all
```

### 3. Seed Sample Database
Populate destinations and create the demo user:
```bash
npm run seed
```

### 4. Run the Full Application (Single Command!)
Start both the Backend (Port 5000) and Frontend (Port 5173) simultaneously:
```bash
npm run dev
```
- **Frontend URL:** [http://localhost:5173](http://localhost:5173)
- **Backend API URL:** [http://localhost:5000](http://localhost:5000)

---

## 🔑 Demo Login Credentials

You can use the **"Fill Demo Credentials"** button on the Login page or enter manually:

- **Email:** `alex@example.com`
- **Password:** `userpassword123`

*(You can also register any new account on the Register page).*

---

## 📋 Full Stack Capabilities Demonstrated

| Feature | Technology | Description |
| :--- | :--- | :--- |
| **Authentication** | `JWT` & `bcryptjs` | Password hashing and secure stateless token-based auth |
| **Protected Routes** | `React Router` | Prevents unauthenticated access to the user dashboard |
| **API Proxy** | `Vite` | Transparent `/api` forwarding to Express backend on port 5000 |
| **Request Interceptor** | `Axios` | Automatic synchronous attachment of Bearer tokens |
| **Auto-Session Cleanup** | `Axios Response Interceptor` | Handles 401s cleanly and purges expired sessions |
| **Database Modeling** | `Mongoose` | Schemas with validations, references, and relationships |
| **Responsive UI** | `Tailwind CSS` | Mobile-first modern dark glassmorphism design |
| **CRUD Operations** | `REST API` | Create bookings, Read destinations, Read/Delete reservations |

---

## 📁 Project Directory Structure

```text
holiday-mirage/
├── package.json              # Root project runner (runs both servers concurrently)
├── README.md                 # Project documentation & presentation guide
├── backend/
│   ├── config/               # Database connection configuration (MongoDB)
│   ├── controllers/          # Business logic (auth, destinations, bookings)
│   ├── middleware/           # JWT auth verification middleware
│   ├── models/               # Mongoose Schemas (User, Destination, Booking)
│   ├── routes/               # Express API route endpoints
│   ├── seed.js               # Database population script
│   ├── server.js             # Express server entry point
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/       # Reusable components (Navbar, Modal, Cards, etc.)
    │   ├── context/          # React Context API for global auth state
    │   ├── pages/            # Application pages (Home, Destinations, Dashboard, Auth)
    │   ├── App.jsx           # Application routing setup
    │   └── main.jsx          # React DOM entry point
    ├── vite.config.js        # Vite config with API proxy
    └── package.json
```
