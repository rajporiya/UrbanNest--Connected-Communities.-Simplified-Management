# UrbanNest — Connected Communities, Simplified Management

A full-stack society/community management platform that connects residents, committee members, and security staff on one system — handling flats, residents, complaints, visitors, amenities, payments, and more.

## Tech Stack

### Frontend (`user/UrbanNest`)

| Category | Technology |
|----------|------------|
| **Framework** | React 19 + TypeScript |
| **Build Tool** | Vite |
| **Routing** | React Router v7 |
| **State Management** | Redux Toolkit + Redux Persist |
| **UI Components** | Base UI + custom `ui/` primitives |
| **Styling** | Tailwind CSS v4 |
| **Forms** | React Hook Form + Zod |
| **HTTP Client** | Axios |
| **Icons** | Lucide React |
| **Notifications** | Sonner |
| **Charts** | Recharts |
| **Animation** | Framer Motion |
| **Fonts** | Fontsource (Noto Sans, Playfair Display) |
| **Linting/Formatting** | ESLint + Prettier |

### Backend (`server`)

| Category | Technology |
|----------|------------|
| **Runtime** | Node.js (ESM) |
| **Framework** | Express 5 |
| **Database** | MongoDB + Mongoose |
| **Authentication** | JWT (access + refresh tokens), bcrypt |
| **Validation** | express-validator |
| **File Uploads** | Multer + Cloudinary |
| **Email** | Resend |
| **Payments** | Razorpay |
| **PDF/QR** | pdfkit, qrcode |
| **Scheduling** | node-cron |
| **Security** | Helmet, CORS, express-rate-limit |
| **Logging** | Morgan |

## Project Structure

```
UrbanNest/
├── server/                        # Express + MongoDB API
│   ├── config/                    # DB, auth, roles, cloudinary config
│   ├── controllers/                # Route handlers
│   ├── middleware/                 # Auth, roles, validation, error handling
│   ├── models/                     # Mongoose schemas (User, Flat, Tower, Resident, ...)
│   ├── routes/                     # Express routers (mounted in routes/index.js)
│   ├── services/                   # Business logic layer
│   ├── validators/                 # express-validator request schemas
│   ├── utils/                      # Helpers (JWT, password, response, errors)
│   ├── uploads/                    # Local upload storage
│   ├── app.js                      # Express app setup
│   └── server.js                   # Entry point
│
└── user/UrbanNest/                # React + TypeScript frontend
    ├── src/
    │   ├── app/                    # Redux store, root reducer, browser storage
    │   ├── components/             # Shared UI (common, forms, layout, navigation, table, ui)
    │   ├── config/                 # App, badge, navigation, roles config
    │   ├── constants/               # App/roles/routes constants
    │   ├── features/                # Feature modules (see below)
    │   ├── hooks/                   # Shared hooks (debounce, media query, redux)
    │   ├── layouts/                 # Auth / Dashboard / Public layouts
    │   ├── pages/                   # Error pages (403, 404, 500)
    │   ├── providers/               # App, Redux, Theme providers
    │   ├── routes/                  # App router, protected/public/role routes
    │   ├── services/                # API client, endpoints, storage service
    │   ├── styles/                  # Global CSS (Tailwind)
    │   ├── types/                   # Shared TypeScript types
    │   └── utils/                   # Formatting & permission helpers
    └── public/
```

### Feature Modules (`src/features/`)

`amenities` · `announcements` · `audit-logs` · `auth` · `committee-members` · `complaints` · `dashboard` · `documents` · `emergency` · `events` · `flats` · `global-search` · `maintenance` · `notifications` · `parcels` · `parking` · `payments` · `polls` · `profile` · `reports` · `residents` · `security-guards` · `settings` · `towers` · `visitors`

## User Roles

Defined in `server/config/roles.js`:

- **Committee Head**
- **Committee Member**
- **Resident** *(default role)*
- **Security Guard**

Role-based access is enforced on both the API (`middleware/role.middleware.js`, `authorize.js`) and the frontend (`routes/role-route.tsx`, `utils/permissions.ts`).

## API Routes

Mounted under `/api` (see `server/routes/index.js`):

| Base Path | Purpose |
|-----------|---------|
| `/health` | Health check |
| `/auth` | Login, register, refresh token, email verification, password reset |
| `/users` | User account management |
| `/towers` | Tower/building management |
| `/flats` | Flat/unit management |
| `/residents` | Resident management & assignments |
| `/committee-members` | Committee member management |
| `/security-guards` | Security guard management |

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local instance or Atlas connection string)
- npm (or your preferred package manager)

### 1. Backend Setup

```bash
cd server
npm install

# Copy and configure environment variables
cp .env.example .env
```

Configure `server/.env`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/urban-nest
CLIENT_URL=http://localhost:5173
API_URL=http://localhost:5000/api
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=Society Management System <no-reply@yourdomain.com>
JWT_SECRET=replace_with_a_long_random_access_token_secret
REFRESH_TOKEN_SECRET=replace_with_a_different_long_random_refresh_token_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
ALLOW_MULTIPLE_TENANTS=true
```

```bash
# Start the API server
npm run dev
```

### 2. Frontend Setup

```bash
cd user/UrbanNest
npm install

# Copy and configure environment variables
cp .env.example .env
```

Configure `user/UrbanNest/.env`:

```env
VITE_APP_NAME=UrbanNest
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_ENV=development
```

```bash
# Start the dev server
npm run dev
```

The frontend runs at `http://localhost:5173` and expects the API at `http://localhost:5000/api` by default.

## Scripts Reference

### Backend (`server/package.json`)

| Script | Description |
|--------|-------------|
| `npm run dev` | Start API server with `node server.js` |
| `npm start` | Start API server (production) |

### Frontend (`user/UrbanNest/package.json`)

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | TypeScript check + production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Lint with ESLint |
| `npm run format` | Format `.ts`/`.tsx` files with Prettier |
| `npm run typecheck` | TypeScript type checking only |

## Architecture Notes

- **Auth flow**: JWT access + refresh tokens, `bcrypt` password hashing, email verification and password reset flows (`auth.routes.js`, `email.service.js`).
- **File uploads**: Handled via Multer, stored on Cloudinary (`multer-storage-cloudinary`); used for profile images and resident documents.
- **State management**: Redux Toolkit slices per feature, persisted via `redux-persist`, with typed `useAppDispatch` / `useAppSelector` hooks.
- **Route protection**: `protected-route.tsx`, `public-route.tsx`, and `role-route.tsx` gate access based on auth state and user role.
- **Error handling**: Centralized API error middleware (`error.middleware.js`, `errorHandler.js`) and dedicated frontend error pages for 403/404/500.
- **Import aliases**: Configured via `tsconfig.json` / `vite.config.ts` for clean `@/` imports on the frontend.

## Contributing

1. Create a feature branch from `main`.
2. Follow existing folder conventions (feature-first on the frontend, layered on the backend: routes → controllers → services → models).
3. Run `npm run lint` and `npm run typecheck` (frontend) before committing.
4. Keep `.env.example` files updated when introducing new environment variables.
5. Submit a pull request with a clear description of changes.

## ⚠️ Important — Before Deploying to Production

- **Never commit `.env` files** — only `.env.example` should be tracked in git.
- **Rotate all secrets** (`JWT_SECRET`, `REFRESH_TOKEN_SECRET`, Cloudinary keys, Razorpay keys) before going live; do not reuse development values.
- **Set `ALLOW_MULTIPLE_TENANTS`** deliberately — confirm whether your deployment should support multiple societies/tenants or a single one.
- **Update `CLIENT_URL` / `VITE_API_BASE_URL`** to production domains to avoid CORS and API-connectivity issues.
- **Enable HTTPS** in front of the API (Helmet's protections assume a secure transport).
- **Review rate limits** (`express-rate-limit`) for auth and payment endpoints under real traffic.
- **Back up MongoDB** regularly, especially before schema-changing deployments.

## License

Private - All rights reserved
