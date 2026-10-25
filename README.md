# 🏝️ Holiday Mirage — Plan Your Perfect Escape
### Beginner-Friendly Full-Stack Web Application (FSD Practical & Viva Ready)

**Holiday Mirage** is a minimal, clean, and beginner-friendly full-stack web application designed for academic evaluation, practical demonstrations, and viva examinations.

---

## 📌 Project Overview

- **Frontend:** React JS (Vite) + Tailwind CSS (Native `fetch()` API, `useState`, `useEffect`)
- **Backend:** Node.js + Express.js
- **Database:** MongoDB (Official Node.js MongoDB Driver)
- **Architecture:** Classic 3-Tier Web Application (Presentation, Application, Data)

---

## 📁 Project Directory Structure

```text
holiday-mirage/
├── package.json
├── README.md
├── backend/
│   ├── .env
│   ├── package.json
│   └── server.js
└── frontend/
    ├── package.json
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    └── src/
        ├── index.css
        ├── main.jsx
        └── App.jsx
```

---

## 🚀 Quick Setup & Execution (Windows)

### 1. Start MongoDB Locally
Ensure MongoDB Community Server is running on your machine:
```powershell
# Default MongoDB connection:
mongodb://127.0.0.1:27017/holiday_mirage
```

### 2. Install Dependencies
Run from the root directory:
```powershell
npm run install:all
```
*(Or install individually: `cd backend; npm install; cd ../frontend; npm install`)*

### 3. Start Backend & Frontend

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

| Method | Endpoint | Description | Request Body |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/destinations` | Retrieve all destinations | None |
| `POST` | `/api/destinations` | Add a new holiday destination | `{ name, location, days, budget, isAvailable }` |
| `PATCH`| `/api/destinations/:id`| Update availability status | `{ isAvailable: boolean }` |
| `DELETE`| `/api/destinations/:id`| Delete destination from DB | None |

---

## 🎓 Syllabus Mapping

- **Unit I (Full Stack Basics):** 3-Tier Architecture, JSON format, RESTful APIs, Tech Stacks (MERN without bloated libraries).
- **Unit II (Frontend):** HTML5, Tailwind CSS responsive grid, React functional components, JSX, `useState`, `useEffect`, built-in `fetch()`.
- **Unit III (Backend):** Node.js runtime, Express.js HTTP routing, `express.json()` middleware, package management with npm.
- **Unit IV (Database):** MongoDB database & collection, CRUD operations using official MongoDB driver (`MongoClient`, `find`, `insertOne`, `updateOne`, `deleteOne`, `ObjectId`).
- **Unit V (Deployment & Version Control):** Git version control, environment variables with `dotenv`, local testing & error handling.
