# 💰 Finance Management Backend API

A robust RESTful backend API for managing company financial records, built with **Node.js**, **Express**, and **MongoDB**. Features role-based access control (RBAC), JWT authentication, analytics, and interactive API documentation via Swagger.

---

## 🚀 Features

- **JWT Authentication** — Secure login/register with token-based auth
- **Role-Based Access Control** — Three roles: `admin`, `analyst`, `viewer`
- **Financial Records** — Create, read, update, and delete income/expense records
- **Analytics** — Aggregated financial summaries and category breakdowns
- **CSV Export** — Export records to CSV format
- **Audit Logging** — Automatic logging of all record mutations
- **Swagger Docs** — Interactive API docs at `/api-docs`
- **Rate Limiting** — Protection against abuse via `express-rate-limit`
- **Input Validation** — Schema-based request validation with Joi
- **Security Headers** — Hardened headers via Helmet

---

## 🛠️ Tech Stack

| Layer        | Technology                        |
|--------------|-----------------------------------|
| Runtime      | Node.js (ESM modules)             |
| Framework    | Express.js                        |
| Database     | MongoDB + Mongoose                |
| Auth         | JSON Web Tokens (jsonwebtoken)    |
| Validation   | Joi                               |
| Docs         | Swagger (swagger-jsdoc + swagger-ui-express) |
| Testing      | Jest + Supertest                  |
| Dev Server   | Nodemon                           |

---

## 📁 Project Structure

```
FinanceManagement/
├── server.js               # Entry point
├── src/
│   ├── app.js              # Express app setup
│   ├── config/             # DB connection & app config
│   ├── controller/         # Route handlers (auth, records, analytics)
│   ├── middleware/         # Auth, error handling, rate limiting
│   ├── models/             # Mongoose schemas (User, FinancialRecord, AuditLog)
│   ├── routes/             # Express routers
│   │   ├── auth.routes.js
│   │   ├── record.routes.js
│   │   └── analytics.routes.js
│   ├── services/           # Business logic layer
│   ├── utils/              # Helpers (CSV export, response formatters, etc.)
│   └── validators/         # Joi validation schemas
├── tests/
│   ├── auth.test.js
│   ├── records.test.js
│   └── analytics.test.js
├── scripts/
│   └── seed.js             # Database seeder
├── .env.example            # Environment variable template
└── package.json
```

---

## ⚙️ Getting Started

### Prerequisites

- **Node.js** v18+
- **MongoDB** (local instance or MongoDB Atlas)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/shubhamrsaroj/FinanceManagement.git
   cd FinanceManagement
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your values:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/finance-db
   JWT_SECRET=your-super-secret-key-change-this
   JWT_EXPIRE=7d
   NODE_ENV=development
   ```

4. **(Optional) Seed the database**
   ```bash
   npm run seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

The server will be running at `http://localhost:5000`.

---

## 📖 API Documentation

Interactive Swagger docs are available at:

```
http://localhost:5000/api-docs
```

---

## 🔑 API Endpoints

### Auth

| Method | Endpoint             | Description              | Access  |
|--------|----------------------|--------------------------|---------|
| POST   | `/api/auth/register` | Register a new user      | Public  |
| POST   | `/api/auth/login`    | Login and get JWT token  | Public  |
| GET    | `/api/auth/profile`  | Get current user profile | Private |

### Financial Records

| Method | Endpoint               | Description                   | Access        |
|--------|------------------------|-------------------------------|---------------|
| GET    | `/api/records`         | Get all records (company-wide)| All roles     |
| POST   | `/api/records`         | Create a new record           | Admin/Analyst |
| GET    | `/api/records/:id`     | Get a single record           | All roles     |
| PUT    | `/api/records/:id`     | Update a record               | Admin/Analyst |
| DELETE | `/api/records/:id`     | Delete a record               | Admin only    |
| GET    | `/api/records/export`  | Export records as CSV         | All roles     |

### Analytics

| Method | Endpoint             | Description                        | Access    |
|--------|----------------------|------------------------------------|-----------|
| GET    | `/api/analytics`     | Get financial summary & breakdown  | All roles |

---

## 👥 Roles & Permissions

| Permission              | Viewer | Analyst | Admin |
|-------------------------|--------|---------|-------|
| View all records        | ✅     | ✅      | ✅    |
| View analytics          | ✅     | ✅      | ✅    |
| Create records          | ❌     | ✅      | ✅    |
| Update records          | ❌     | ✅      | ✅    |
| Delete records          | ❌     | ❌      | ✅    |
| Export CSV              | ✅     | ✅      | ✅    |

---

## 🧪 Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage report
npm run test:coverage
```

Tests cover:
- **Auth** — Register, login, profile access, token validation
- **Records** — CRUD operations, role-based restrictions, validation
- **Analytics** — Summary totals, category breakdowns

---

## 🔒 Security

- Passwords are hashed using **bcryptjs**
- All protected routes require a valid **JWT Bearer token**
- HTTP headers hardened with **Helmet**
- Request rate limiting applied globally
- **Never commit your `.env` file** — it is listed in `.gitignore`

---

## 📝 License

This project is for educational/assessment purposes.
