# 🏝️ Holiday Mirage — Plan Your Perfect Escape
### Beginner-Friendly Full-Stack Web Application with Role-Based Authentication (FSD Practical & Viva Ready)

**Holiday Mirage** is a minimal, clean, and beginner-friendly full-stack web application designed for academic evaluation, practical demonstrations, and viva examinations. It features secure **Role-Based Authentication (Admin & User)** using JWT and bcryptjs.

---

## 📌 Project Overview

- **Frontend:** React JS (Vite) + Tailwind CSS (Native `fetch()` API, `useState`, `useEffect`)
- **Backend:** Node.js + Express.js + JSON Web Tokens (`jsonwebtoken`) + Password Hashing (`bcryptjs`)
- **Database:** MongoDB (Official Node.js Native Driver)
- **Architecture:** Classic 3-Tier Web Application with Role-Based Access Control (RBAC)

---

## 👥 User Roles & Permissions

| Feature / Action | 👑 Admin | 👤 User / Traveler | 🌐 Guest |
| :--- | :---: | :---: | :---: |
| Register as User | ❌ (Setup script only) | ✅ | ✅ |
| Log In / Log Out | ✅ | ✅ | ❌ |
| View Holiday Destinations | ✅ | ✅ | ✅ (Browsing Only) |
| Book a Destination | ❌ (Admin role) | ✅ (Instant Confirmation) | ❌ (Prompted to Sign In) |
| View My Bookings (User Panel) | ❌ | ✅ (Small Cards Grid) | ❌ |
| Cancel Booking | ❌ | ✅ | ❌ |
| Add New Destinations | ✅ | ❌ (403 Forbidden) | ❌ (401 Unauthorized) |
| Toggle Availability | ✅ | ❌ (403 Forbidden) | ❌ (401 Unauthorized) |
| Delete Destinations | ✅ | ❌ (403 Forbidden) | ❌ (401 Unauthorized) |
| Access Admin Interface | ✅ | ❌ | ❌ |

---

## 📁 Project Directory Structure

```text
holiday-mirage/
├── package.json
├── README.md
├── backend/
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   ├── createAdmin.js        # Protected script to create first Admin
│   └── server.js             # Express API with JWT Auth & Middlewares
└── frontend/
    ├── package.json
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    └── src/
        ├── index.css
        ├── main.jsx
        └── App.jsx           # React UI with Auth, Admin & User views
```

---

## 🚀 Quick Setup & Execution (Windows)

### 1. Start MongoDB Locally
Ensure MongoDB Community Server is running on your machine:
```powershell
mongodb://127.0.0.1:27017/holiday_mirage
```

### 2. Configure Environment Variables
Inside `backend/.env`:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/holiday_mirage
JWT_SECRET=holiday_mirage_jwt_secret_dev_key_2026
ADMIN_EMAIL=admin@holidaymirage.com
ADMIN_PASSWORD=Admin@123
```

### 3. Install Dependencies
Run from the root directory:
```powershell
npm run install:all
```
*(Or install in backend: `cd backend; npm install`)*

### 4. Create Initial Administrator Account
Run the secure one-time setup script:
```powershell
npm run create-admin
# Or directly: cd backend; node createAdmin.js
```
*Default admin credentials: `admin@holidaymirage.com` / `Admin@123`*

### 5. Start Backend & Frontend

#### Option A: Run Both Together (Recommended)
From the root directory:
```powershell
npm run dev
```

#### Option B: Run in Separate Terminals
**Terminal 1 (Backend):**
```powershell
cd backend
npm run dev
# Backend runs on http://localhost:5000
```

**Terminal 2 (Frontend):**
```powershell
cd frontend
npm run dev
# Frontend runs on http://localhost:5173
```

---

## 🌐 REST API Endpoints

### Authentication Endpoints
| Method | Endpoint | Access | Request Body | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | `{ name, email, password }` | Registers a standard user (role: 'user') |
| `POST` | `/api/auth/login` | Public | `{ email, password }` | Authenticates Admin or User and returns JWT |
| `POST` | `/api/auth/logout` | Public | None | Client-side logout notification |
| `GET` | `/api/auth/me` | Authenticated | None (Bearer Token) | Returns current authenticated profile |

### Destinations Endpoints
| Method | Endpoint | Access | Request Body | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/destinations` | Public / All | None | Retrieve all holiday destinations |
| `POST` | `/api/destinations` | 👑 Admin Only | `{ name, location, days, budget, isAvailable }` | Add new destination |
| `PATCH`| `/api/destinations/:id`| 👑 Admin Only | `{ isAvailable: boolean }` | Toggle booking availability |
| `DELETE`| `/api/destinations/:id`| 👑 Admin Only | None | Delete destination from database |

### Bookings Endpoints (User Panel)
| Method | Endpoint | Access | Request Body | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/bookings` | 👤 User (Authenticated) | `{ destinationId }` | Book a destination |
| `GET` | `/api/bookings/my` | 👤 User (Authenticated) | None | Retrieve current user's booked destinations |
| `DELETE`| `/api/bookings/:id` | 👤 User (Authenticated) | None | Cancel a booking |

---

## 🎓 Syllabus Mapping & Viva Concepts

- **Unit I (Full Stack & Security):** 3-Tier Architecture, JSON format, RESTful APIs, Stateless JWT Authentication, Password Hashing vs Encryption.
- **Unit II (Frontend):** React components, JSX, conditional rendering for roles, `useState`, `useEffect`, token management in `localStorage`, Fetch API with `Authorization: Bearer <token>`.
- **Unit III (Backend):** Express.js routing, custom middleware (`authenticateToken`, `requireAdmin`), HTTP status codes (200, 201, 400, 401, 403, 404, 500).
- **Unit IV (Database):** MongoDB native driver (`MongoClient`, `collection`), user document schema, indexing, ObjectId manipulation, data integrity.
- **Unit V (Deployment & Version Control):** Environment variables with `dotenv`, CORS headers, separation of production secrets, Git commits and rollbacks.
