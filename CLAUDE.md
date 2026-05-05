# CLAUDE.md — HRMS CBC Labs. Inc

## Project
Full-stack HRMS: Django REST API + React TypeScript + PostgreSQL

## Modules Built
1. **Authentication** — Admin/HR signup, Email OTP 2FA, JWT, approval flow
2. **Employees** — Full CRUD, employment history tracking, dashboard stats

## Tech Stack
| Layer    | Technology |
|----------|------------|
| Backend  | Python 3.11, Django 4.2, DRF, SimpleJWT, django-filter |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Zustand |
| Database | PostgreSQL |
| Email    | Gmail SMTP (jadhavpurna008@gmail.com) |

## Key Rules
- Only @cbcinc.ai emails for login/signup
- HR needs Admin approval before login
- OTP sent to email on every login (10 min, single use)
- Employee search = Emp No only
- Employment history auto-saved on any change to: employer, designation, employment_type, location, worksite_address, status, date_of_joining, exit_date, primary_skills, secondary_skills, visa_type, id_status, e_verify_status
- History is immutable — never deleted

## API Endpoints
### Auth
| POST | /api/auth/login/            | Step 1: send OTP     |
| POST | /api/auth/login/verify/     | Step 2: verify OTP   |
| POST | /api/auth/admin/signup/     | Admin signup         |
| POST | /api/auth/hr/signup/        | HR signup            |
| GET  | /api/auth/me/               | Current user         |
| GET  | /api/admin/hrs/             | List HRs (Admin)     |
| POST | /api/admin/hrs/{id}/approve/| Approve HR           |
| POST | /api/admin/hrs/{id}/revoke/ | Revoke HR            |
| DEL  | /api/admin/hrs/{id}/        | Delete HR            |

### Employees (Admin + HR)
| GET    | /api/employees/stats/       | Dashboard stats      |
| GET    | /api/employees/             | List + search by emp_no |
| POST   | /api/employees/             | Add employee         |
| GET    | /api/employees/{id}/        | Full profile + history |
| PATCH  | /api/employees/{id}/        | Update (saves history) |
| DELETE | /api/employees/{id}/        | Delete               |
| GET    | /api/employees/{id}/history/| Employment history   |

## Frontend Routes
| Path                    | Page                  | Access     |
|-------------------------|-----------------------|------------|
| /login                  | LoginPage             | Public     |
| /signup/:role           | SignupPage            | Public     |
| /admin/dashboard        | DashboardPage         | Admin      |
| /admin/hrs              | HRManagementPage      | Admin      |
| /hr/dashboard           | DashboardPage         | HR         |
| /employees              | EmployeesPage         | Admin + HR |
| /employees/new          | EmployeeFormPage      | Admin + HR |
| /employees/:id          | EmployeeProfilePage   | Admin + HR |
| /employees/:id/edit     | EmployeeFormPage      | Admin + HR |

## Employee Fields (from spreadsheet)
ADF Employee Name, Emp No, Gender, DOB, Retire/DOB, Contact Number,
Official Email, Personal Email, Address, Status (Active/Exited/BFNOK),
Employment Type (W2/C2C/1099/FullTime), DOJ, Exit Date, Employer,
Designation, Primary Skills, Secondary Skills, Location,
Worksite Address, Visa Type, ID Status, E-Verify Status
