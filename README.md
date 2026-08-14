# BlueAgle — E-Commerce Platform

A full-stack grocery delivery e-commerce platform built with **React 19 + Vite** (frontend) and **Node.js + Express + MySQL** (backend), using Firebase for customer authentication and a custom JWT-based RBAC system for admin.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, Tailwind CSS |
| Backend | Node.js, Express 5 |
| Database | MySQL (via Sequelize ORM) |
| Auth (Customer) | Firebase Authentication |
| Auth (Admin) | Custom JWT + RBAC |
| Image CDN | ImageKit |
| Payments | Razorpay |
| Email | Nodemailer (SMTP) |

---

## Project Structure

```
Project_One/
├── client/          # React frontend (Vite)
│   ├── src/
│   │   ├── components/   # Shared UI components
│   │   ├── context/      # React Context providers (Auth, Cart, SEO, etc.)
│   │   ├── hooks/        # Custom React hooks
│   │   ├── layouts/      # Page layout wrappers (MainLayout, AdminLayout)
│   │   ├── pages/        # Route-level page components
│   │   │   └── admin/    # Admin panel pages
│   │   ├── services/     # Axios API clients (api.js, adminApi.js)
│   │   └── utils/        # Utility helpers (GA4 tracker, etc.)
│   └── .env              # Client environment variables (see below)
│
└── server/          # Express backend
    ├── config/       # Database config
    ├── controllers/  # Route handler logic
    ├── middleware/   # Auth, upload, rate-limiting middleware
    ├── models/       # Sequelize data models
    ├── routes/       # Express route definitions
    ├── seeds/        # Database seeders
    └── .env          # Server environment variables (see below)
```

---

## Prerequisites

- Node.js >= 18.x
- MySQL >= 8.x
- A Firebase project with Authentication enabled
- An ImageKit account
- (Optional) A Razorpay account for payments

---

## Setup

### 1. Clone & Install

```bash
git clone <repo-url>
cd Project_One

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### 2. Configure Environment Variables

**Server** — copy and fill in:
```bash
cd server
cp .env.example .env
# Edit .env with your values
```

**Client** — create `client/.env`:
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=...
VITE_API_URL=http://localhost:5000/api
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

See [`server/.env.example`](./server/.env.example) for a full list of server variables with descriptions.

### 3. Database Setup

Create the MySQL database:
```sql
CREATE DATABASE blueeagle;
```

The server runs `sequelize.sync()` on startup, which auto-creates tables. Then seed initial data:

```bash
cd server

# Seed super admin user
node seed.js

# Seed RBAC roles, modules, and permissions
node seeds/invoiceBuilderSeed.js
```

### 4. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com) → your project
2. Enable **Phone Authentication** and **Google Sign-In** under Authentication → Sign-in method
3. Go to **Project Settings → Service Accounts** → Generate New Private Key
4. For production: set the JSON content as `FIREBASE_SERVICE_ACCOUNT` environment variable

### 5. Run Locally

```bash
# Terminal 1 — Start backend
cd server && npm start

# Terminal 2 — Start frontend
cd client && npm run dev
```

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`
- Admin panel: `http://localhost:5173/admin`

---

## Available Scripts

### Server (`/server`)
| Script | Description |
|--------|-------------|
| `npm start` | Start with nodemon (auto-reload) |
| `node seed.js` | Seed initial admin user and sample data |
| `node seeds/invoiceBuilderSeed.js` | Seed RBAC modules and invoice templates |
| `node seeds/policySeed.js` | Seed policy documents |
| `node seeds/productDemoSeed.js` | Seed demo product catalog |

### Client (`/client`)
| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview production build locally |

---

## Admin Panel

The admin panel is accessible at `/admin`. It uses a completely separate authentication system from customers (JWT-based RBAC, not Firebase).

**Default super-admin credentials (from seeder):**
- Email: `superadmin@blueeagle.com`
- Password: `Admin@123` ← **Change immediately after first login**

### Admin Roles & Permissions
Roles are managed at `/admin/rbac/roles`. The system supports granular permissions per module (Products, Orders, Users, SEO, Reports, etc.).

---

## Deployment

### Environment Variables for Production
All secrets must be rotated before deployment:
1. Generate new `JWT_SECRET` and `ADMIN_JWT_SECRET` (64-byte hex)
2. Set `NODE_ENV=production`
3. Set `ALLOWED_ORIGINS` to your production domain(s)
4. Set `FIREBASE_SERVICE_ACCOUNT` as a JSON string (not a file)
5. Update `VITE_API_URL` in client env to your production API URL

### Build Frontend
```bash
cd client && npm run build
# Output in client/dist/
```

### Recommended Hosting
- **Backend**: Railway, Render, or any Node.js host
- **Frontend**: Vercel or Netlify (point to `client/dist`)
- **Database**: PlanetScale or managed MySQL

---

## Known Limitations

- `sequelize.sync()` is used instead of Sequelize migrations — schema changes should be managed carefully in production
- Cart state is stored client-side in localStorage (not synced across devices)
- File uploads (images/videos) go through memory storage before being sent to ImageKit

---

## Security

- Customer auth: Firebase ID tokens verified server-side via Firebase Admin SDK
- Admin auth: JWT (15-min access token + 7-day refresh token with rotation)
- CORS restricted to `ALLOWED_ORIGINS`
- Security headers set via Helmet
- Rate limiting: 5 req/15min on auth endpoints, 200 req/min general
- File uploads: images capped at 10MB, media at 50MB

---

## License

Private — All rights reserved.
