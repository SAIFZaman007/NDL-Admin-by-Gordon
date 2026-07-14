# Gordon IT Academy — Admin Dashboard

The admin-only control panel: platform stats, users, courses & lessons,
blog, testimonials, subscription plans, interview questions, practice exam
questions, and About page content.

This app is completely isolated from `../frontend` — separate codebase,
separate build, separate deployment (its own subdomain, e.g.
`admin.yourdomain.com`), separate login. It contains **no** customer/student
site code, and `../frontend` contains no admin code.

Access is restricted to the single admin account seeded in the backend
(`admin@gordon.com` — see `backend/seed.py`). There is no self-registration
here by design.

## Stack

React 19 · React Router 7 · Tailwind CSS 4 · Vite 8 · Axios · Recharts

## Getting started

```bash
cp .env.example .env    # then edit if your backend runs somewhere else
npm install
npm run dev              # http://localhost:3001
```

Requires the backend running locally on `http://localhost:8000`.

Sign in with the seeded admin account:

| Email | Password |
|---|---|
| `admin@gordon.com` | `admin123` |

## How authorization works

There's no separate "admin login" endpoint on the backend — this app signs
in through the exact same `/api/auth/login` endpoint the customer site
uses, then immediately calls `/api/admin/stats`. If that call 403s, the
account isn't the admin account and access is denied client-side too. See
`src/context/AuthContext.jsx`.

## Project structure

```
src/
├── api/client.js           Configured axios instance (auth header, VITE_API_BASE)
├── context/AuthContext.jsx Session state + the login/authorization flow above
├── components/             Sidebar, Topbar, Layout, ProtectedRoute, ui/ primitives
│   └── ui/                 Modal, ConfirmDialog, DataTable, Toggle, StatCard, etc.
│                            (shared building blocks every resource page is built from)
└── pages/                  One file per section
```

## Sections → backend endpoints

| Page | Route | Backend |
|---|---|---|
| Overview | `/` (root) | `GET /api/admin/stats` |
| Users | `/users` | `GET /api/admin/users` (read-only — no admin create/update/delete exists for users) |
| Courses & Lessons | `/courses` | `courses_router` admin CRUD (courses + nested lessons) |
| Blog Posts | `/blog` | `blog_router` admin CRUD + publish toggle |
| Testimonials | `/testimonials` | `testimonials_router` admin CRUD |
| Subscription Plans | `/subscriptions` | `subscriptions_router` admin CRUD |
| Interview Questions | `/interview-questions` | `interview_router` full CRUD |
| Exam Questions | `/exam-questions` | `exams_router` — **list + create only** (the API has no update/delete for questions, so this page doesn't pretend to offer them) |
| About Page Content | `/about` | `about_router` (single-record upsert) |

Nothing here calls an endpoint that doesn't already exist in `backend/app/routers/`.

## Build

```bash
npm run build   # outputs to dist/
npm run preview
```
