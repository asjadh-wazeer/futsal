# Lanka Futsal Hub — Booking & Management System

A full-stack sports court booking platform for Sri Lanka, built for futsal, cricket, and badminton centers with multi-branch support.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| State | Redux Toolkit |
| Styling | TailwindCSS v3 |
| Backend | NestJS 10 + TypeScript |
| Database | PostgreSQL 16 |
| ORM | Prisma 5 |
| Auth | JWT (Passport.js) |
| Charts | Recharts |
| Container | Docker + Docker Compose |

---

## Quick Start

### 1. Clone & Setup
```bash
cd "Futsal booking"
cp .env.example .env
```

### 2. Start with Docker Compose
```bash
docker-compose up --build
```

### 3. Run Database Migrations & Seed
```bash
# In a new terminal, after containers are up:
docker exec -it futsal_backend npx prisma migrate dev --name init
docker exec -it futsal_backend npm run db:seed
```

### 4. Access the App
| Service | URL |
|---------|-----|
| Customer Website | http://localhost:5173 |
| Admin Dashboard | http://localhost:5173/admin |
| API | http://localhost:3001/api |
| Swagger Docs | http://localhost:3001/api/docs |
| Database | localhost:5432 |

### Default Admin Credentials
```
Email:    admin@lankafutsal.lk
Password: admin123
```

---

## Local Development (without Docker)

### Backend
```bash
cd backend
npm install
# Create .env with DATABASE_URL pointing to your local Postgres
npx prisma migrate dev
npm run db:seed
npm run start:dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## Project Structure

```
futsal-booking/
├── docker-compose.yml
├── .env.example
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # Full database schema
│   │   └── seed.ts            # Demo data seeder
│   └── src/
│       ├── main.ts
│       ├── app.module.ts
│       ├── prisma/            # Prisma service
│       └── modules/
│           ├── auth/          # JWT authentication
│           ├── business/      # Business settings
│           ├── branch/        # Branch CRUD + sports by branch
│           ├── sport/         # Sport types
│           ├── court/         # Courts + availability engine
│           ├── booking/       # Booking creation + management
│           ├── customer/      # Customer management
│           ├── analytics/     # Dashboard + charts data
│           └── payment/       # PayHere integration
└── frontend/
    └── src/
        ├── App.tsx
        ├── store/             # Redux store + slices
        ├── services/api.ts    # Axios API client
        ├── types/             # TypeScript interfaces
        ├── layouts/           # Public + Admin layouts
        ├── components/
        │   ├── public/        # Navbar, Footer, BookingSteps
        │   ├── admin/         # Sidebar, Topbar
        │   └── ui/            # StatCard, Modal, StatusBadge, Spinner
        └── pages/
            ├── public/        # Home, Branch, Court, Slot, Details, Confirm
            └── admin/         # Login, Dashboard, Bookings, Courts,
                               # Branches, Customers, Analytics, Settings
```

---

## Public Booking Flow

```
/ (Home)  →  /booking/branch  →  /booking/court  →  /booking/slot  →  /booking/details  →  /booking/confirm/:ref
```

1. **Home** — Hero, sports showcase, how-it-works, branch map
2. **Branch Select** — Pick a branch location
3. **Court Select** — Filter by sport, choose court
4. **Slot Select** — Date picker (14-day range) + live time slot grid
5. **Customer Details** — Name, phone, email, notes
6. **Confirmation** — Booking ref, details, payment instructions

---

## Admin Dashboard

- **Dashboard** — KPI cards, revenue chart, recent bookings, court utilization
- **Bookings** — Full table with search/filter, status updates, view detail
- **Courts** — CRUD for courts with sport/branch assignment
- **Branches** — CRUD for locations with hours and slot duration
- **Customers** — Search, profiles, booking history, spending
- **Analytics** — Revenue trends, peak hours, by-sport pie, branch comparison
- **Settings** — Business info, contact, brand colors

---

## API Endpoints (Key)

### Public
```
GET  /api/branches                          List branches
GET  /api/branches/:id/sports               Sports at branch
GET  /api/courts?branchId=&sportId=         Courts list
GET  /api/courts/:id/availability?date=     Available time slots
POST /api/bookings                          Create booking
GET  /api/bookings/ref/:ref                 Booking by reference
```

### Admin (Bearer JWT)
```
POST /api/auth/login
GET  /api/analytics/dashboard
GET  /api/analytics/revenue?period=week|month|year
GET  /api/bookings?search=&status=&page=
PATCH /api/bookings/:id/status
CRUD /api/courts
CRUD /api/branches
GET  /api/customers
```

---

## Payment

MVP uses **cash/card at venue**. PayHere (Sri Lanka) integration is wired up:

1. Set `PAYHERE_MERCHANT_ID` and `PAYHERE_MERCHANT_SECRET` in `.env`
2. Set `PAYHERE_MODE=sandbox` for testing, `live` for production
3. Notify URL: `POST /api/payment/notify` (PayHere webhook)

---

## SaaS Scalability Notes

The schema is multi-tenant ready:
- Every `Branch` belongs to a `Business`
- Every `Admin` belongs to a `Business`
- Add new clients by creating a new `Business` record and seeding their data
- Future: add `tenantId` to JWT and filter all queries accordingly

---

## Environment Variables

```env
POSTGRES_USER=futsal_user
POSTGRES_PASSWORD=futsal_pass
POSTGRES_DB=futsal_db
JWT_SECRET=change_this_long_secret
FRONTEND_URL=http://localhost:5173
VITE_API_URL=http://localhost:3001/api
PAYHERE_MERCHANT_ID=
PAYHERE_MERCHANT_SECRET=
PAYHERE_MODE=sandbox
```
