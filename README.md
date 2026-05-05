# HRMS — CBC Labs. Inc

Human Resource Management System built with **Django + React TypeScript + PostgreSQL**.

---

## Tech Stack

| Layer    | Technology                                      |
|----------|-------------------------------------------------|
| Backend  | Python 3.11, Django 4.2, Django REST Framework  |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS        |
| Database | PostgreSQL 16                                   |
| Email    | SendGrid                                        |
| Auth     | JWT + Email OTP 2-Factor Authentication        |

---

## Features (Current)

- ✅ Admin signup & login
- ✅ HR signup with Admin approval workflow
- ✅ Email OTP 2-Factor Authentication for all users
- ✅ Company email enforcement (`@cbcinc.ai` only)
- ✅ Admin dashboard — approve, revoke, delete HR accounts
- ✅ SendGrid email notifications (OTP codes, HR approval requests, approval confirmations)
- ✅ Role-based access control (Admin / HR)

---

## Prerequisites

| Tool       | Version | Download            |
|------------|---------|---------------------|
| Python     | 3.11+   | python.org          |
| Node.js    | 20+     | nodejs.org          |
| PostgreSQL | 16      | postgresql.org      |
| Git        | Any     | git-scm.com         |

---

## SendGrid Setup (Required for emails)

1. Go to **sendgrid.com** → Sign up for a free account (100 emails/day free forever)
2. Go to **Settings → API Keys → Create API Key**
   - Name: `hrms-api-key`
   - Permissions: **Full Access**
   - Click **Create & View** and copy the key (starts with `SG.`)
3. Go to **Settings → Sender Authentication**
   - Verify a sender email (e.g. `noreply@cbcinc.ai` or your personal email for testing)
   - Follow the verification steps
4. Add to your `backend/.env`:
   ```
   SENDGRID_API_KEY=SG.your-key-here
   SENDGRID_SENDER_EMAIL=noreply@cbcinc.ai
   ```

> **Note for local testing:** If you don't have a verified @cbcinc.ai domain yet, use any verified email as `SENDGRID_SENDER_EMAIL` and test with real emails you own.

---

## Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/<your-username>/hrms-project.git
cd hrms-project
```

### 2. Set up PostgreSQL
Open pgAdmin or psql and run:
```sql
CREATE DATABASE hrms_db;
CREATE USER hrms_user WITH PASSWORD 'hrms_password';
GRANT ALL PRIVILEGES ON DATABASE hrms_db TO hrms_user;
```

### 3. Backend setup
```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Mac / Linux

# Install dependencies
pip install -r requirements.txt

# Create .env file
copy .env.example .env         # Windows
# cp .env.example .env         # Mac / Linux
```

Edit `backend/.env` — fill in your DB credentials and SendGrid API key, then:
```bash
python manage.py makemigrations accounts
python manage.py migrate
python manage.py runserver
```

Backend → **http://localhost:8000**

### 4. Frontend setup
Open a second terminal:
```bash
cd frontend
npm install
copy .env.example .env         # Windows
# cp .env.example .env         # Mac / Linux
npm run dev
```

Frontend → **http://localhost:5173**

---

## Application URLs

| Page              | URL                                  |
|-------------------|--------------------------------------|
| Login             | http://localhost:5173/login          |
| Admin Signup      | http://localhost:5173/signup/admin   |
| HR Signup         | http://localhost:5173/signup/hr      |
| Admin Dashboard   | http://localhost:5173/admin/dashboard|
| HR Dashboard      | http://localhost:5173/hr/dashboard   |
| Django Admin      | http://localhost:8000/admin/         |

---

## How Login Works (2FA)

1. Enter email + password → system validates credentials and **sends a 6-digit OTP** to your email
2. Enter the OTP → system validates it (10-minute expiry, single use) → **JWT tokens issued**
3. All subsequent API calls use the JWT Bearer token

---

## How HR Signup Works

1. HR fills in full name, email, password
2. Account is created with `is_approved = False`
3. **All Admins receive an email** notification with the HR's details
4. Admin logs in → Dashboard → clicks **Approve**
5. **HR receives an approval confirmation email** and can now log in

---

## Environment Variables

### `backend/.env`
```env
SECRET_KEY=your-secret-key-min-50-chars
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DB_NAME=hrms_db
DB_USER=hrms_user
DB_PASSWORD=hrms_password
DB_HOST=localhost
DB_PORT=5432
CORS_ALLOWED_ORIGINS=http://localhost:5173
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxx
SENDGRID_SENDER_EMAIL=noreply@cbcinc.ai
```

### `frontend/.env`
```env
VITE_API_BASE_URL=http://localhost:8000/api
```

---

## Project Structure

```
hrms-project/
├── backend/              # Django REST API
│   ├── apps/accounts/    # Auth, users, OTP, email
│   └── config/           # Settings, URLs
├── frontend/             # React TypeScript app
│   └── src/
│       ├── pages/        # Login, Signup, Admin/HR dashboards
│       ├── components/   # Footer, AuthLayout, ProtectedRoute
│       ├── services/     # API calls
│       └── store/        # Auth state (Zustand)
├── .github/workflows/    # CI/CD
├── CLAUDE.md             # AI assistant guide
└── README.md
```

---

## Contributing

1. Create a branch: `git checkout -b feature/your-feature`
2. Commit: `git commit -m "feat: your change"`
3. Push: `git push origin feature/your-feature`
4. Open a Pull Request

---

© 2025 CBC Labs. Inc. All rights reserved.
