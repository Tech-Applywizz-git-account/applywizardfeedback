# 🐛 BugTracker — Feedback Management Portal

A production-ready, full-stack feedback management portal for mobile application beta testing. Built as a monorepo with a React frontend and Node.js/Express backend, powered by Supabase.

## ✨ Features

- 🔐 **Authentication** — Supabase Auth (Email/Password)
- 👥 **Role-Based Access** — Admin and User roles
- 📝 **Feedback Management** — Submit bugs, features, UI issues, crashes
- 🖼️ **Image Uploads** — Drag-and-drop, up to 10 images (Supabase Storage)
- 💬 **Comments** — Timeline-style discussion per feedback
- 📊 **Analytics** — Beautiful admin charts with Recharts
- 🌙 **Dark/Light Mode** — Fully themed with shadcn/ui
- 📱 **Responsive** — Mobile, tablet, desktop
- 🔒 **Security** — Helmet, CORS, rate limiting, RBAC

---

## 🗂 Project Structure

```
applywizzardfeedback/
├── frontend/          # React + Vite + TypeScript + Tailwind
└── backend/           # Node.js + Express + TypeScript + Prisma
```

---

## ⚙️ Environment Setup

### 1. Backend `.env`

Copy `backend/.env.example` to `backend/.env` and fill in:

```env
# Get from: Supabase Dashboard → Project Settings → Database
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"

# Get from: Supabase Dashboard → Project Settings → API
SUPABASE_URL="https://[your-project-ref].supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Generate a strong random string (min 32 chars)
JWT_SECRET="your-super-secret-jwt-key-minimum-32-characters"

PORT=5000
NODE_ENV=development
CORS_ORIGIN="http://localhost:5173"
```

### 2. Frontend `.env`

Copy `frontend/.env.example` to `frontend/.env`:

```env
# Get from: Supabase Dashboard → Project Settings → API
VITE_SUPABASE_URL="https://[your-project-ref].supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key"
VITE_API_BASE_URL="http://localhost:5000/api"
```

---

## 🗄️ Supabase Configuration

### 1. Create a Supabase Project

Go to [supabase.com](https://supabase.com) → New Project

### 2. Create Storage Bucket

In your Supabase dashboard:
1. Go to **Storage** → **New Bucket**
2. Name: `feedback-images`
3. Set **Public** to `true` (for public image URLs)
4. Go to **Policies** → Add the following RLS policy:
   - **INSERT**: Authenticated users can upload
   - **SELECT**: Public can read

**Quick SQL for storage policies:**
```sql
-- Allow authenticated users to upload
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'feedback-images');

-- Allow public read
CREATE POLICY "Allow public read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'feedback-images');

-- Allow users to delete their own files
CREATE POLICY "Allow user delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'feedback-images' AND auth.uid()::text = (storage.foldername(name))[1]);
```

---

## 🚀 Database Migrations

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Run migrations (requires DATABASE_URL to be set)
npm run db:migrate

# Or deploy migrations in production
npm run db:migrate:deploy

# Seed the database (creates default admin user)
npm run db:seed
```

**Default Admin Credentials:**
| Field    | Value              |
|----------|--------------------|
| Email    | admin@example.com  |
| Password | Admin@123          |
| Username | superadmin         |

---

## 💻 Development

### Start Backend

```bash
cd backend
npm install
npm run dev
# Server runs on http://localhost:5000
```

### Start Frontend

```bash
cd frontend
npm install
npm run dev
# App runs on http://localhost:5173
```

---

## 🏗️ Prisma Commands

```bash
cd backend

# Generate Prisma client after schema changes
npm run db:generate

# Create a new migration
npm run db:migrate

# Open Prisma Studio (database GUI)
npm run db:studio

# Run seed
npm run db:seed
```

---

## 📁 API Reference

### Auth
| Method | Endpoint                  | Description          |
|--------|---------------------------|----------------------|
| POST   | `/api/auth/signup`        | Register user        |
| POST   | `/api/auth/login`         | Login                |
| POST   | `/api/auth/logout`        | Logout               |
| POST   | `/api/auth/forgot-password` | Send reset email   |
| POST   | `/api/auth/reset-password` | Reset password      |
| GET    | `/api/auth/me`            | Get current user     |

### Feedback
| Method | Endpoint                       | Description           |
|--------|--------------------------------|-----------------------|
| POST   | `/api/feedback`                | Create feedback       |
| GET    | `/api/feedback`                | Get my feedback       |
| GET    | `/api/feedback/:id`            | Get feedback by ID    |
| DELETE | `/api/feedback/:id`            | Delete feedback       |
| POST   | `/api/feedback/:id/comment`    | Add comment           |
| GET    | `/api/feedback/:id/comments`   | Get comments          |

### Admin
| Method | Endpoint                          | Description         |
|--------|-----------------------------------|---------------------|
| GET    | `/api/admin/stats`                | Analytics stats     |
| GET    | `/api/admin/users`                | List all users      |
| PUT    | `/api/admin/users/:id/promote`    | Promote to admin    |
| PUT    | `/api/admin/users/:id/demote`     | Remove admin role   |
| PUT    | `/api/admin/users/:id/disable`    | Disable account     |
| PUT    | `/api/admin/users/:id/enable`     | Enable account      |
| GET    | `/api/admin/feedback`             | All feedback        |
| PUT    | `/api/admin/feedback/:id/status`  | Update status       |

---

## 🚢 Production Deployment

### Backend

```bash
cd backend
npm run build
npm run db:migrate:deploy
node dist/server.js
```

### Frontend

```bash
cd frontend
npm run build
# Serve the dist/ folder via your hosting provider
```

### Recommended Hosting
- **Frontend**: Vercel, Netlify, Cloudflare Pages
- **Backend**: Railway, Render, Fly.io, AWS EC2
- **Database**: Supabase (managed PostgreSQL)
- **Storage**: Supabase Storage (included)

---

## 🛡️ Security Features

- ✅ Helmet.js security headers
- ✅ CORS with origin allowlist
- ✅ Rate limiting (global, auth, upload)
- ✅ Supabase JWT validation on all protected routes
- ✅ Role-based access control (Admin / User)
- ✅ Zod schema validation on all inputs
- ✅ File type and size validation on uploads
- ✅ No hardcoded secrets

---

## 🧰 Tech Stack

| Layer      | Technology                                    |
|------------|-----------------------------------------------|
| Frontend   | React 18, TypeScript, Vite, Tailwind CSS      |
| UI         | shadcn/ui, Radix UI, Lucide React             |
| State      | Zustand, TanStack Query                       |
| Forms      | React Hook Form + Zod                         |
| Charts     | Recharts                                      |
| Backend    | Node.js, Express, TypeScript                  |
| ORM        | Prisma                                        |
| Database   | Supabase PostgreSQL                           |
| Auth       | Supabase Auth                                 |
| Storage    | Supabase Storage                              |
| Security   | Helmet, express-rate-limit, CORS              |
# applywizardfeedback
