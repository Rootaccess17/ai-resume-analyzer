# AI Resume Analyzer

A full-stack web application that analyzes resumes against a chosen target job role using AI (Google Gemini), scores them for ATS (Applicant Tracking System) readiness, and delivers a structured, downloadable, and automatically emailed PDF report.

Built and tested end-to-end, piece by piece — every route, page, and integration in this document has been manually verified working.

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| Frontend framework | Next.js 15+ (App Router), TypeScript |
| Styling | Tailwind CSS v4 |
| Icons | lucide-react |
| HTTP client | axios |
| Backend framework | Node.js, Express |
| Database | MongoDB (Atlas), Mongoose |
| Authentication | JWT (jsonwebtoken), bcryptjs |
| File upload | Multer (in-memory storage) |
| PDF text extraction | pdf-parse (v2 API) |
| AI analysis | Google Gemini (`gemini-2.5-flash`) via `@google/genai` |
| PDF report generation | PDFKit |
| Email delivery | Nodemailer (Gmail + App Password) |

---

## ✨ Features

### Authentication & Accounts
- Signup, Login, Logout (JWT-based, 7-day token expiry)
- Passwords hashed with bcrypt (10 salt rounds) — never stored in plain text
- Password visibility toggle (eye icon) on every password field
- **Forgot / Reset Password** — secure, single-use, 15-minute-expiry reset tokens emailed to the user
- **Role-based access control** — `user` and `admin` roles, enforced server-side via middleware (not just hidden in the UI)

### Resume Analysis
- Drag-and-drop or click-to-browse PDF upload (PDF only, 5MB limit, validated both client- and server-side)
- **Target role selection** — 15 job roles (Frontend Developer, Backend Developer, Full Stack Developer, Mobile App Developer, Desktop Application Developer, Game Developer, Data Scientist, Data Analyst, DevOps Engineer, Machine Learning Engineer, UI/UX Designer, QA/Test Engineer, Product Manager, Software Developer, General)
- Gemini AI analysis, tailored to the selected role, returns:
  - ATS match score (0–100, color-coded: red/amber/green)
  - Summary
  - Strengths
  - Improvement areas
  - Missing keywords
  - Formatting issues
  - Actionable tips
  - Final recommendation
- Results displayed as clearly separated, labeled cards — not a wall of text

### Reports
- Server-generated PDF report (PDFKit) — styled, sectioned, color-coded score
- Automatically emailed to the user's registered email on every analysis (non-blocking — a failed email never blocks the analysis result itself)
- On-demand re-download from Scan History or Admin panel — regenerated fresh each time, nothing stored on disk

### History & Admin
- **Scan History** tab — every past analysis for the logged-in user, with role, score, date, and a download link
- **Admin Dashboard** (`/admin`, admin-only):
  - Stats: total users, total scans, average score
  - Full user list (passwords never included)
  - Full scan list across all users, with uploader name/email attached
  - Admins can download **any** user's report; regular users can only download their own

### UI / UX
- Global **dark mode** — toggle persists across sessions (localStorage), applied consistently on every page
- Custom **background treatment** on homepage, login, and signup — a wide-format image with a symmetrical gradient overlay (light/dark flat color in the center where content sits, image visible and progressively darkened toward the far left/right edges) — chosen specifically so text contrast is never compromised
- Dashboard and Admin panel intentionally kept on a plain, distraction-free background for focused work
- Responsive layouts throughout

---

## 📁 Project Structure

```
ai-resume-analyzer/
│
├── backend/
│   ├── controllers/
│   │   ├── auth.controller.js       # registerUser, loginUser, forgotPassword, resetPassword
│   │   ├── resume.controller.js     # uploadAndAnalyzeResume, getUserHistory, downloadReport
│   │   └── admin.controller.js      # getAdminDashboardData
│   ├── middleware/
│   │   ├── auth.middleware.js       # protect (JWT verification), authorize (role check)
│   │   └── upload.middleware.js     # multer config -- memory storage, PDF-only, 5MB limit
│   ├── models/
│   │   ├── User.js                  # name, email, password (hashed), role, reset token fields
│   │   └── Resume.js                # userId, fileName, targetRole, atsScore, summary,
│   │                                 # strengths, improvementAreas, missingKeywords,
│   │                                 # formattingIssues, actionableTips, finalRecommendation
│   ├── routes/
│   │   ├── auth.routes.js           # /signup /login /forgot-password /reset-password/:token
│   │   ├── resume.routes.js         # /upload /history /download/:id
│   │   └── admin.routes.js          # /dashboard
│   ├── services/
│   │   ├── ai.service.js            # PDF text extraction (pdf-parse) + Gemini analysis
│   │   ├── pdf.service.js           # PDFKit report generation
│   │   └── email.service.js         # Nodemailer report + reset-link delivery
│   ├── server.js                    # app entry point, DB connection, route mounting
│   ├── package.json
│   ├── .gitignore                   # excludes node_modules/, .env
│   └── .env                         # NOT committed -- see Environment Variables below
│
└── frontend/
    ├── app/
    │   ├── layout.tsx
    │   ├── globals.css              # base theme, Tailwind v4 dark-mode variant
    │   ├── page.tsx                 # homepage -- hero background image + gradient
    │   ├── signup/page.tsx          # hero background image + gradient (indigo-tinted)
    │   ├── login/page.tsx           # hero background image + gradient (indigo-tinted)
    │   ├── forgot-password/page.tsx
    │   ├── reset-password/[token]/page.tsx   # dynamic route, reads token from URL
    │   ├── dashboard/page.tsx       # upload + analysis + history tabs (plain background)
    │   └── admin/page.tsx           # admin-only dashboard (plain background)
    ├── lib/
    │   ├── api.js                   # axios instance, auto-attaches JWT via interceptor
    │   └── useTheme.ts              # dark mode hook (localStorage-persisted)
    ├── public/
    │   ├── favicon.ico
    │   └── hero-bg.jpg              # background image used on homepage/login/signup
    ├── package.json
    └── .gitignore
```

---

## ⚙️ Environment Variables

### Backend -- `backend/.env`

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=a_long_random_secret_string
GEMINI_API_KEY=your_gemini_api_key
EMAIL_USER=your_gmail_address@gmail.com
EMAIL_PASS=your_gmail_app_password
CLIENT_URL=http://localhost:3000
```

| Variable | Where to get it / notes |
|---|---|
| `MONGO_URI` | MongoDB Atlas → Cluster → Connect → Drivers. Must include a database name between the last `/` and `?` (e.g. `.../resume_analyser?...`). If you hit `querySrv ECONNREFUSED`, your network is blocking SRV DNS lookups -- switch the Atlas driver-version dropdown to an older version to get a non-SRV `mongodb://` connection string with explicit host:port addresses instead. |
| `JWT_SECRET` | Any long random string -- signs and verifies login tokens |
| `GEMINI_API_KEY` | Google AI Studio (aistudio.google.com/apikey) |
| `EMAIL_USER` / `EMAIL_PASS` | A Gmail address + an **App Password** (not your normal password) -- generate at myaccount.google.com/apppasswords, requires 2-Step Verification enabled first |
| `CLIENT_URL` | Your frontend's base URL -- used to build password reset email links |

### Frontend

No `.env` file required for local development. `lib/api.js` points directly to `http://localhost:5000/api`. Update that base URL if deploying to production.

---

## 🚀 Running Locally

**Backend:**
```bash
cd backend
npm install
# create .env with the variables above
node server.js
```
Expect to see:
```
📦 MongoDB connected successfully
Server running on http://localhost:5000
```

**Frontend** (separate terminal):
```bash
cd frontend
npm install
npm run dev
```
Runs on `http://localhost:3000`.

Both must be running at the same time -- the frontend talks to the backend directly over HTTP.

---

## 🔑 Creating an Admin Account

There is no self-service "become admin" flow by design. To promote a user:
1. Sign up normally through the app.
2. In MongoDB Atlas → Browse Collections → `users` collection, find that user's document.
3. Edit → change `"role": "user"` to `"role": "admin"` → save.
4. Clear `token` and `user` from the browser's Local Storage (DevTools → Application → Local Storage), then log in again so the new role is picked up.

Admins are redirected to `/admin` on login; regular users go to `/dashboard`.

---

## 🔌 API Reference

All routes are prefixed with `/api`. Protected routes require header: `Authorization: Bearer <token>`.

### Auth -- `/api/auth`
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/signup` | No | Create account → returns user + JWT |
| POST | `/login` | No | Authenticate → returns user + JWT |
| POST | `/forgot-password` | No | Emails a reset link if the email exists (always returns the same generic message either way) |
| POST | `/reset-password/:token` | No | Sets a new password if the token is valid and unexpired |

### Resume -- `/api/resume`
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/upload` | Yes | Multipart form: `resume` (PDF file) + `targetRole` (string). Returns full AI analysis. |
| GET | `/history` | Yes | Returns the logged-in user's past scans, newest first |
| GET | `/download/:id` | Yes | Streams a freshly generated PDF report (owner or admin only) |

### Admin -- `/api/admin`
| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/dashboard` | Yes (admin only) | Returns `totalUsers`, `totalScans`, `avgScore`, full `users` array, full `allResumes` array |

---

## 🧠 How the Analysis Pipeline Works

1. User selects a **target role** and uploads a **PDF resume** on the dashboard.
2. Frontend sends both as `multipart/form-data` to `POST /api/resume/upload`, with the JWT attached automatically (via the axios interceptor in `lib/api.js`).
3. `protect` middleware verifies the JWT and attaches the authenticated user to `req.user`.
4. `upload.middleware.js` (Multer) validates the file is a PDF (≤5MB) and holds it in memory as a buffer -- nothing is written to disk.
5. `ai.service.js`:
   - Extracts raw text from the PDF buffer using `pdf-parse` v2's `PDFParse` class.
   - Builds a role-specific prompt and sends it to Gemini, requesting strict JSON output.
   - Parses and sanitizes the response (clamps score to 0-100, ensures arrays are actually arrays).
6. The result is saved to MongoDB (`Resume` collection), linked to `req.user._id`.
7. `pdf.service.js` (PDFKit) generates a styled PDF report from the saved data.
8. `email.service.js` (Nodemailer) emails that PDF to the user -- wrapped in its own try/catch so an email failure never fails the overall request.
9. The structured JSON result is returned to the frontend and rendered as separate cards: score, summary, strengths, improvement areas, missing keywords, formatting issues, actionable tips, final recommendation.
10. The same report can be re-downloaded anytime via `GET /api/resume/download/:id`, which regenerates the PDF fresh on each request.

---

## 🔒 Security Notes

- Passwords are hashed with bcrypt before saving; the raw password is never stored or logged.
- JWTs expire after 7 days; password reset tokens expire after 15 minutes and are single-use (cleared after a successful reset).
- `forgotPassword` responds identically whether or not the email exists, to avoid leaking which emails are registered.
- Resume downloads are restricted server-side to the resume's owner or an admin -- this check lives in the controller, not just the UI, so it can't be bypassed by calling the API directly.
- Admin-only routes require both a valid JWT (`protect`) and the `admin` role (`authorize('admin')`).
- `.env` is excluded via `.gitignore` in both `backend` and `frontend` -- real credentials are never committed.
- CORS is currently open (`cors()` with default settings) for local development -- restrict this to your actual frontend origin before deploying publicly.

---

## 🛠️ Known Quirks & Troubleshooting Reference

- **`pdf-parse` v2 API differs from v1** -- this project uses `pdf-parse@2.x`: `new PDFParse({ data: buffer })` then `.getText()`, not a plain function call. Reinstalling with a different major version will break `ai.service.js`.
- **Mongoose async pre-save hooks** -- recent Mongoose versions no longer pass a `next` callback into `async` pre-save functions; `User.js`'s hashing hook relies on returning a resolved promise instead of calling `next()` manually.
- **MongoDB Atlas `querySrv ECONNREFUSED`** -- some networks block the DNS `SRV` lookup that `mongodb+srv://` requires. Fix: switch your DNS to `8.8.8.8`/`8.8.4.4`, or use Atlas's non-SRV (`mongodb://`) connection string with explicit shard addresses instead.
- **Duplicate email documents** -- if a user document is ever manually created/edited outside the normal signup flow, double-check no two documents share the same email; `User.findOne({ email })` returns whichever one MongoDB happens to find first, which can cause confusing, inconsistent login behavior.
- **Browser-saved passwords** -- browsers (e.g. Brave/Chrome password manager) can silently autofill an old, stale password on login forms during development/testing. If a login fails unexpectedly despite the backend confirming a correct password via direct API testing, check the browser's saved-password manager before assuming a backend bug.
- **`localhost` is device-specific** -- a link like `http://localhost:3000/...` (e.g. a password reset email) only works on the same machine running the dev server; opening it on a phone or another device will fail to connect, since `localhost` always refers to the device browsing, not the original server.

---

## 🗺️ Possible Future Improvements

- Automatic "first registered user becomes admin" logic, or a proper invite-based admin system
- Rate limiting on auth, upload, and password-reset routes
- Resume version comparison (score trends across multiple uploads over time)
- Support for `.docx` resumes in addition to PDF
- Toast notifications in place of `alert()` throughout the frontend
- Analytics charts on the admin dashboard (scans over time, score distribution by role)
- Move the hero background image logic into a shared component instead of repeating inline styles per page