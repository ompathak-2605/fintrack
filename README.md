# FinTrack — Personal Expense Management System

A full-stack expense tracking and financial planning app built with **Java Spring Boot** and **React**. Log income and expenses, set budgets that warn you before you overspend, and track savings goals with a suggested monthly amount to hit each deadline.

Built from scratch as a learning project, with every phase documented.

---

## Features

**Transactions**
- Add, edit, delete and search income and expenses
- Categories, payment method, merchant, and a Need vs Want tag on every expense
- Filter by type, search by description, merchant or category

**Budgets**
- Set limits per category or overall (daily, weekly or monthly)
- Spending is calculated live from your transactions
- Three statuses: `ON_TRACK`, `WARNING` (80% used), `EXCEEDED`
- Dashboard alerts when a budget is at risk

**Savings Goals**
- Set a target amount and deadline
- Progress percentage, days remaining and a suggested monthly saving
- Goals auto-complete when the target is reached
- Status tracking: `ON_TRACK`, `AT_RISK`, `ACHIEVED`, `OVERDUE`

**Dashboard**
- Net balance, total income and total expenses for the month
- Spending-by-category donut chart and income vs expenses bar chart
- Recent transactions

**Account**
- Register and login with JWT authentication
- Profile page with persona, income and currency settings
- Session persists across page refreshes
- Fully responsive: sidebar on desktop, hamburger menu on mobile

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Java 21, Spring Boot 4.0.7, Spring Security 6, Spring Data JPA, Hibernate |
| Auth | JWT (jjwt 0.12.3), BCrypt password hashing |
| Database | PostgreSQL |
| Frontend | React 18, Vite, Tailwind CSS 3, Framer Motion, Recharts, Axios, Lucide React |
| Build | Maven, npm |
| Deployment | Docker, Vercel (frontend), AWS RDS / Railway (backend and database) |

---

## Architecture

The backend is a layered monolith. Each layer talks only to the layer below it.

```
React (Vite)  →  Controller  →  Service  →  Repository  →  PostgreSQL
```

```
fintrack/
├── src/main/java/com/fintrack/
│   ├── config/       ApiResponse wrapper, CORS, data initializer
│   ├── controller/   REST endpoints
│   ├── dto/          request and response shapes
│   ├── exception/    custom exceptions and global handler
│   ├── model/        JPA entities
│   ├── repository/   Spring Data repositories
│   ├── security/     JWT filter, JWT service, security config
│   └── service/      business logic
fintrack-frontend/
├── src/
│   ├── api/          configured Axios instance
│   ├── components/   Sidebar, MobileNav, modals, cards
│   ├── context/      AuthContext
│   ├── pages/        Login, Register, Dashboard, Transactions, Budgets, Goals, Profile
│   └── utils/        formatting helpers
```

**Design decisions**
- DTOs are separate from entities, so internal fields like password hashes never leave the server.
- Every query is scoped to the logged-in user, so one user can never read another user's data.
- Budget `spentAmount` and goal progress are calculated on every request instead of stored, so they are always current.
- Money uses `BigDecimal`, never `double`.
- All API responses share one wrapper: `{ success, message, data, timestamp }`.

---

## Getting Started

### Prerequisites

- Java 21
- Maven 3.9+
- Node.js 18+
- PostgreSQL

### 1. Clone

```bash
git clone https://github.com/ompathak-2605/fintrack.git
cd fintrack
```

### 2. Create the database

```sql
CREATE DATABASE fintrack_db;
```

### 3. Configure the backend

Copy the example file and add your own PostgreSQL password:

```bash
cd fintrack/src/main/resources
cp application.properties.example application.properties
```

`application.properties` is gitignored, so your credentials are never committed. For production, the app reads these environment variables:

| Variable | Purpose |
|---|---|
| `JDBC_DATABASE_URL` | JDBC connection string, starting with `jdbc:postgresql://` |
| `DATABASE_USERNAME` | Database user |
| `DATABASE_PASSWORD` | Database password |
| `JWT_SECRET` | Secret used to sign tokens (use a long random string) |
| `FRONTEND_URL` | Deployed frontend URL, for CORS |
| `SPRING_PROFILES_ACTIVE` | Set to `prod` to load `application-prod.properties` |

### 4. Run the backend

```bash
cd fintrack
mvn spring-boot:run
```

The API starts on `http://localhost:8081`. On first run, 10 default categories are created automatically.

### 5. Run the frontend

```bash
cd fintrack-frontend
npm install
npm run dev
```

The app opens on `http://localhost:5173`. In development, Vite proxies `/api` requests to the backend, so no extra setup is needed.

### Production API URL

For a deployed frontend, set this environment variable at build time:

```
VITE_API_URL=https://your-backend-url
```

---

## API Reference

All endpoints except `/api/auth/**` require the header `Authorization: Bearer <token>`.

**Auth**

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create an account |
| POST | `/api/auth/login` | Login and receive a JWT |

**Transactions**

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/transactions` | List your transactions |
| GET | `/api/transactions/{id}` | Get one transaction |
| POST | `/api/transactions` | Add a transaction |
| PUT | `/api/transactions/{id}` | Update a transaction |
| DELETE | `/api/transactions/{id}` | Delete a transaction |
| GET | `/api/transactions/summary?start=&end=` | Income, expense, balance and category breakdown |

**Budgets**

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/budgets` | List budgets with live spending |
| GET | `/api/budgets/{id}` | Get one budget |
| POST | `/api/budgets` | Create a budget |
| PUT | `/api/budgets/{id}` | Update a budget |
| DELETE | `/api/budgets/{id}` | Delete a budget |

**Goals**

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/goals` | List all goals |
| GET | `/api/goals/active` | List goals not yet achieved |
| GET | `/api/goals/{id}` | Get one goal |
| POST | `/api/goals` | Create a goal |
| PUT | `/api/goals/{id}` | Update a goal |
| PATCH | `/api/goals/{id}/contribute?amount=` | Add a contribution |
| DELETE | `/api/goals/{id}` | Delete a goal |

**Other**

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/categories` | Default and custom categories |
| GET | `/api/users/profile` | Get your profile |
| PUT | `/api/users/profile` | Update your profile |

**Example response**

```json
{
  "success": true,
  "message": "Transaction added successfully",
  "data": { "id": 1, "amount": 150.00, "type": "EXPENSE", "categoryName": "Food" },
  "timestamp": "2026-08-11T10:30:00"
}
```

---

## Security

- Passwords are hashed with BCrypt (strength 12) and never stored in plain text
- Stateless JWT authentication with 24-hour token expiry
- Every data query is filtered by the authenticated user
- Input validation on all request bodies, with clear field-level error messages
- Secrets live in environment variables or gitignored files, never in the repository

---

## Screenshots

> Add screenshots here: Dashboard, Transactions, Budgets, Goals, and the mobile view.

```
![Dashboard](docs/screenshots/dashboard.png)
![Budgets](docs/screenshots/budgets.png)
![Goals](docs/screenshots/goals.png)
```

---

## Roadmap

- [x] Authentication with JWT
- [x] Transactions with search, filter, edit and delete
- [x] Budgets with live status and dashboard alerts
- [x] Savings goals with monthly suggestions
- [x] Profile management
- [x] Responsive layout
- [ ] Cloud deployment
- [ ] Group expenses and settlements (trips, events, households)
- [ ] AI features with the Claude API: smart categorization and monthly coaching
- [ ] CSV and PDF export
- [ ] Automated tests

---

## Documentation

The `docs` folder holds the planning and phase reports written during development:

- `PROJECT_REQUIREMENTS.md`
- `ARCHITECTURE.md`
- `RULES.md`
- `PHASE1_COMPLETION.md` to `PHASE4_COMPLETION.md`
- `FRONTEND_COMPLETION.md`

---

## Author

**Om Pathak**
BCA student, Maulana Abul Kalam Azad University of Technology, West Bengal

- GitHub: [@ompathak-2605](https://github.com/ompathak-2605)
- Email: ompathak0705@gmail.com