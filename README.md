<div align="center">

# 🏢 UrbanNest

### Connected Communities. Simplified Management.

A modern full-stack Society & Community Management Platform built using the MERN stack.

Manage residents, flats, towers, maintenance, complaints, visitors, payments, security, events, announcements, and society operations from one unified dashboard.

---

![React](https://img.shields.io/badge/React-19-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)
![Node.js](https://img.shields.io/badge/Node.js-Express-green?logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-success?logo=mongodb)
![TailwindCSS](https://img.shields.io/badge/Tailwind-v4-38BDF8?logo=tailwindcss)
![Redux](https://img.shields.io/badge/Redux-Toolkit-764ABC?logo=redux)

</div>

---

# 📖 About UrbanNest

UrbanNest is a complete Society Management System designed to simplify everyday operations of residential communities.

It enables Committee Heads, Committee Members, Residents, and Security Guards to collaborate through one centralized platform.

The platform digitizes society management by handling everything from resident onboarding and visitor approvals to complaints, maintenance payments, announcements, security operations, and reports.

---

# ✨ Core Features

## 👥 Resident Management

* Resident Registration
* Resident Directory
* Resident Profile
* Family Members
* Occupancy Management
* Resident Status
* Resident Documents

---

## 🏢 Tower & Flat Management

* Tower Management
* Flat Management
* Floor Mapping
* Flat Allocation
* Occupancy Status
* Ownership Records

---

## 🛡 Security Management

* Security Guard Management
* Visitor Approval
* Visitor History
* Delivery Entry
* Parcel Management
* Gate Management
* Shift Assignment

---

## 📢 Community Communication

* Announcements
* Events
* Emergency Contacts
* Notifications
* Community Polls
* Notice Board

---

## 💰 Finance

* Maintenance Bills
* Online Payments
* Razorpay Integration
* Payment History
* Receipts
* Financial Reports

---

## 🛠 Maintenance

* Complaint Management
* Complaint Tracking
* Complaint Categories
* Service Requests
* Maintenance Logs

---

## 🚗 Parking

* Parking Allocation
* Vehicle Management
* Visitor Parking
* Parking Reports

---

## 📊 Dashboard

* Society Overview
* Revenue Analytics
* Complaint Analytics
* Resident Statistics
* Visitor Statistics
* Payment Analytics

---

# 👤 User Roles

| Role             | Permissions                |
| ---------------- | -------------------------- |
| Committee Head   | Full System Access         |
| Committee Member | Society Operations         |
| Resident         | Personal Dashboard         |
| Security Guard   | Visitor & Entry Management |

Role-based authorization is enforced on both the frontend and backend.

---

# 🧰 Tech Stack

## Frontend

| Technology      | Usage            |
| --------------- | ---------------- |
| React 19        | UI Framework     |
| TypeScript      | Type Safety      |
| Vite            | Build Tool       |
| React Router v7 | Routing          |
| Redux Toolkit   | State Management |
| Redux Persist   | Persistence      |
| Tailwind CSS v4 | Styling          |
| React Hook Form | Forms            |
| Zod             | Validation       |
| Axios           | API Client       |
| Sonner          | Notifications    |
| Recharts        | Charts           |
| Framer Motion   | Animations       |

---

## Backend

| Technology | Usage            |
| ---------- | ---------------- |
| Node.js    | Runtime          |
| Express 5  | REST API         |
| MongoDB    | Database         |
| Mongoose   | ODM              |
| JWT        | Authentication   |
| bcrypt     | Password Hashing |
| Multer     | Uploads          |
| Cloudinary | Image Storage    |
| Resend     | Email Service    |
| Razorpay   | Payments         |
| PDFKit     | PDF Generation   |
| QRCode     | QR Generation    |
| node-cron  | Scheduling       |
| Helmet     | Security         |
| Morgan     | Logging          |

---

# 📂 Project Structure

```text
UrbanNest
│
├── server
│   ├── config
│   ├── controllers
│   ├── middleware
│   ├── models
│   ├── routes
│   ├── services
│   ├── validators
│   ├── utils
│   ├── uploads
│   ├── app.js
│   └── server.js
│
└── user
    └── UrbanNest
        ├── public
        │   ├── robots.txt
        │   └── sitemap.xml
        │
        └── src
            ├── app
            ├── components
            ├── config
            ├── constants
            ├── features
            ├── hooks
            ├── layouts
            ├── pages
            ├── providers
            ├── routes
            ├── services
            ├── styles
            ├── types
            └── utils
```

---

# 📦 Feature Modules

```text
auth
dashboard
profile
residents
committee-members
security-guards
towers
flats
maintenance
complaints
visitors
parking
payments
events
announcements
notifications
documents
reports
audit-logs
amenities
emergency
polls
settings
global-search
parcels
```

---

# 🔐 Authentication

* JWT Authentication
* Access and Refresh Tokens
* Password Hashing
* Email Verification
* Password Reset
* Protected Routes
* Role-Based Authorization
* Persisted Authentication State

---

# 🌐 REST API

All backend routes are mounted under `/api`.

```text
/api/health

/api/auth

/api/users

/api/towers

/api/flats

/api/residents

/api/committee-members

/api/security-guards
```

---

# ⚡ Installation

## Clone Repository

```bash
git clone https://github.com/yourusername/UrbanNest.git

cd UrbanNest
```

Replace `yourusername` with your actual GitHub username or organization name.

---

## Backend Setup

```bash
cd server

npm install
```

Copy the example environment file:

```bash
cp .env.example .env
```

For Windows Command Prompt:

```bash
copy .env.example .env
```

For Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Start the backend server:

```bash
npm run dev
```

The backend runs at:

```text
http://localhost:5000
```

The API base URL is:

```text
http://localhost:5000/api
```

---

## Frontend Setup

Open another terminal:

```bash
cd user/UrbanNest

npm install
```

Copy the example environment file:

```bash
cp .env.example .env
```

For Windows Command Prompt:

```bash
copy .env.example .env
```

For Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Start the frontend development server:

```bash
npm run dev
```

The frontend runs at:

```text
http://localhost:5173
```

---

# 📄 Environment Variables

## Backend Environment Variables

Create a `.env` file inside the `server` directory:

```env
PORT=5000

MONGO_URI=mongodb://127.0.0.1:27017/urban-nest

CLIENT_URL=http://localhost:5173

API_URL=http://localhost:5000/api

JWT_SECRET=replace_with_a_long_random_access_token_secret

REFRESH_TOKEN_SECRET=replace_with_a_different_long_random_refresh_token_secret

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name

CLOUDINARY_API_KEY=your_cloudinary_api_key

CLOUDINARY_API_SECRET=your_cloudinary_api_secret

RESEND_API_KEY=your_resend_api_key

EMAIL_FROM=Society Management System <no-reply@yourdomain.com>

ALLOW_MULTIPLE_TENANTS=true
```

---

## Frontend Environment Variables

Create a `.env` file inside `user/UrbanNest`:

```env
VITE_APP_NAME=UrbanNest

VITE_API_BASE_URL=http://localhost:5000/api

VITE_APP_ENV=development
```

---

# 🤖 SEO Configuration

UrbanNest includes `robots.txt` and `sitemap.xml` files to help search engines discover public pages while preventing authenticated and private application routes from being indexed.

Both files are stored in the frontend `public` directory.

```text
user/
└── UrbanNest/
    └── public/
        ├── robots.txt
        └── sitemap.xml
```

Files stored in the Vite `public` directory are copied directly to the root of the production build.

After deployment, they will be available at:

```text
https://your-domain.com/robots.txt
https://your-domain.com/sitemap.xml
```

---

## robots.txt

File location:

```text
user/UrbanNest/public/robots.txt
```

Current configuration:

```txt
User-agent: *
Allow: /

# Authenticated Committee Head and Committee Member areas.
Disallow: /dashboard
Disallow: /residents
Disallow: /committee-members
Disallow: /security-guards
Disallow: /towers
Disallow: /flats
Disallow: /reports
Disallow: /audit-logs
Disallow: /complaints/assigned
Disallow: /bookings/assigned
Disallow: /maintenance
Disallow: /payments

# Account-specific and operational pages.
Disallow: /profile
Disallow: /settings
Disallow: /notifications
Disallow: /visitor-passes
Disallow: /visitors
Disallow: /amenities
Disallow: /parcels
Disallow: /emergency

Sitemap: https://urbannest.example/sitemap.xml
```

The configuration:

* Allows search engines to crawl public pages.
* Blocks authenticated dashboard routes.
* Blocks resident and committee management pages.
* Blocks payment and maintenance pages.
* Blocks personal profile and account pages.
* Blocks visitor, parcel, emergency, and operational routes.
* Provides the sitemap URL to search engine crawlers.

Before production deployment, replace:

```text
https://urbannest.example
```

with the real production domain.

Example:

```txt
Sitemap: https://urbannest.com/sitemap.xml
```

---

## sitemap.xml

File location:

```text
user/UrbanNest/public/sitemap.xml
```

Current configuration:

```xml
<?xml version="1.0" encoding="UTF-8"?>

<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://urbannest.example/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>

  <url>
    <loc>https://urbannest.example/login</loc>
    <changefreq>monthly</changefreq>
    <priority>0.4</priority>
  </url>

  <url>
    <loc>https://urbannest.example/register</loc>
    <changefreq>monthly</changefreq>
    <priority>0.4</priority>
  </url>

  <url>
    <loc>https://urbannest.example/forgot-password</loc>
    <changefreq>yearly</changefreq>
    <priority>0.2</priority>
  </url>
</urlset>
```

The sitemap currently includes these public routes:

| Route              | Change Frequency | Priority |
| ------------------ | ---------------: | -------: |
| `/`                |           Weekly |      1.0 |
| `/login`           |          Monthly |      0.4 |
| `/register`        |          Monthly |      0.4 |
| `/forgot-password` |           Yearly |      0.2 |

Before production deployment, replace every occurrence of:

```text
https://urbannest.example
```

with the real production domain.

Example:

```xml
<loc>https://urbannest.com/</loc>
```

---

## Public Routes Only

Only publicly accessible pages should be added to `sitemap.xml`.

Good sitemap routes:

```text
/
/about
/contact
/features
/login
/register
/forgot-password
/privacy-policy
/terms-and-conditions
```

Do not add private or authenticated routes such as:

```text
/dashboard
/profile
/settings
/residents
/committee-members
/security-guards
/payments
/maintenance
/notifications
/visitors
/reports
/audit-logs
```

---

## Important SEO Note

`robots.txt` controls crawler access, but it is not an authentication or security system.

Sensitive routes must always be protected using:

* Backend authentication middleware
* Role-based authorization
* Protected frontend routes
* API permission checks
* Secure session or token validation

Never rely only on `robots.txt` to protect private user information.

---

# 🚀 Architecture

```text
React Frontend
       │
       ▼
 Redux Toolkit
       │
       ▼
 Axios API
       │
       ▼
Express REST API
       │
       ▼
 Service Layer
       │
       ▼
 MongoDB
```

---

# 📌 Development Workflow

```text
Routes
      ↓
Controllers
      ↓
Services
      ↓
Models
      ↓
Database
```

The backend follows a layered structure:

1. Routes receive the HTTP request.
2. Validators validate request data.
3. Middleware verifies authentication and permissions.
4. Controllers handle the request and response.
5. Services contain business logic.
6. Models communicate with MongoDB.

---

# 📜 Scripts

## Backend Scripts

Run these commands inside the `server` directory:

```bash
npm run dev
```

Starts the backend development server.

```bash
npm start
```

Starts the backend production server.

---

## Frontend Scripts

Run these commands inside `user/UrbanNest`:

```bash
npm run dev
```

Starts the Vite development server.

```bash
npm run build
```

Runs TypeScript checks and creates the production build.

```bash
npm run preview
```

Previews the production build locally.

```bash
npm run lint
```

Checks the project using ESLint.

```bash
npm run format
```

Formats TypeScript and TSX files using Prettier.

```bash
npm run typecheck
```

Runs TypeScript type checking without creating a build.

---

# 🛡 Security

UrbanNest includes multiple security layers:

* Helmet security headers
* CORS configuration
* Password hashing with bcrypt
* JWT access tokens
* JWT refresh tokens
* Role-based authorization
* Protected API routes
* Request validation
* Express rate limiting
* Secure Cloudinary uploads
* Environment-based secrets
* Centralized error handling
* Private route protection
* Restricted crawler access

---



# 📜 License

This repository is private.

All Rights Reserved © UrbanNest.

Unauthorized copying, modification, distribution, or use of this project is prohibited.

---

<div align="center">

### Built with ❤️ using React, TypeScript, Express, MongoDB & Tailwind CSS

**UrbanNest — Connected Communities. Simplified Management.**

</div>
