# 🌞 Orbit Green Power Technology — Solar Energy Web App

A full-stack, production-ready solar energy company website built with **React + Vite + Supabase**.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS + Shadcn UI |
| Backend | Supabase Edge Functions (Deno + Hono) |
| Database | Supabase Postgres (KV store via `kv_store_b3c655af` table) |
| Auth | Supabase Auth (email/password) |

---

## ⚙️ Setup

### 1. Clone & Install

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your Supabase credentials:

```bash
cp .env.example .env
```

Edit `.env`:
```env
VITE_SUPABASE_URL=https://ebxmagidhxdmbyhljljj.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_SUPABASE_PROJECT_ID=ebxmagidhxdmbyhljljj
VITE_API_BASE_URL=https://ebxmagidhxdmbyhljljj.supabase.co/functions/v1/make-server-b3c655af
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## 🏗️ Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── LandingPage.tsx      # Public landing page
│   │   ├── AuthModal.tsx        # Login / Register / Admin modal
│   │   ├── CustomerDashboard.tsx # Customer portal
│   │   └── AdminDashboard.tsx   # Admin control panel
│   ├── contexts/
│   │   └── AuthContext.tsx      # Auth state management
│   └── utils/
│       └── api.ts               # All API calls to Supabase
├── lib/
│   └── supabase.ts              # Supabase client (env-var based)
└── styles/
    ├── index.css
    ├── theme.css
    └── tailwind.css

supabase/
└── functions/
    └── server/
        ├── index.tsx            # Hono edge function (all API routes)
        └── kv_store.tsx         # KV store backed by Supabase Postgres
```

---

## 👥 User Roles

| Role | Access |
|------|--------|
| **Customer** | View installation, raise support tickets, view documents & notifications |
| **Admin** | Manage customers, add installations, handle complaints, send notifications, view analytics |

### Admin Registration
Use the **Admin** tab in the auth modal with the secret key: `ADMIN_SECRET_2025`

---

## 🌐 API Routes (Edge Function)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/signup` | No | Customer registration |
| POST | `/auth/admin-signup` | Admin key | Admin registration |
| GET | `/auth/profile` | Bearer | Get user profile |
| PUT | `/auth/profile` | Bearer | Update user profile |
| GET | `/admin/customers` | Admin | List all customers |
| DELETE | `/admin/customers/:id` | Admin | Delete customer |
| GET | `/installation` | Bearer | Get own installation |
| POST | `/admin/installation/:id` | Admin | Create/update installation |
| POST | `/complaints` | Bearer | Submit complaint |
| GET | `/complaints` | Bearer | Get own complaints |
| GET | `/admin/complaints` | Admin | Get all complaints |
| PUT | `/admin/complaints/:id` | Admin | Update complaint status |
| POST | `/documents` | Bearer | Save document |
| GET | `/documents/:userId?` | Bearer | Get documents |
| POST | `/admin/notifications` | Admin | Send notification |
| GET | `/notifications` | Bearer | Get own notifications |
| GET | `/admin/analytics` | Admin | Get analytics data |
| GET | `/plans` | No | Get solar plans |
| POST | `/admin/plans` | Admin | Update solar plans |
| GET | `/testimonials` | No | Get testimonials |

---

## 🚢 Deployment

### Frontend (Vercel / Netlify)
```bash
npm run build
# Deploy the `dist/` folder
```

Set environment variables in your hosting provider:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_API_BASE_URL`

### Edge Function (Supabase)
The edge function is already deployed at:
```
https://ebxmagidhxdmbyhljljj.supabase.co/functions/v1/make-server-b3c655af
```

To redeploy:
```bash
supabase functions deploy server
```

---

## 📞 Contact

**Orbit Green Power Technology**
- 📍 CH. Sambhaji Chowk, Rendal, Tal-Hatkalange, Kolhapur - 416203
- 📞 +91 98765 43210
- 📧 info@orbitgreenpower.com
- 💬 WhatsApp: +91 98765 43210

---

*Invest one Time and Save Money Forever* ☀️