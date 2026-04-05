# 💰 Finance Management Backend API

A robust RESTful backend API for managing company financial records, built with **Node.js**, **Express**, and **MongoDB**. Features role-based access control (RBAC), JWT authentication, analytics, and interactive API documentation via Swagger.

> 🔗 **Live API:** [https://financemanagement-nu9k.onrender.com](https://financemanagement-nu9k.onrender.com)
> 📄 **Swagger Docs:** [https://financemanagement-nu9k.onrender.com/api/v1/docs](https://financemanagement-nu9k.onrender.com/api/v1/docs)
> 💻 **GitHub:** [https://github.com/shubhamrsaroj/FinanceManagement](https://github.com/shubhamrsaroj/FinanceManagement)

---

## 🚀 Features

- **JWT Authentication** — Secure login/register with token-based auth
- **Role-Based Access Control** — Three roles: `admin`, `analyst`, `viewer`
- **Financial Records** — Create, read, update, and delete income/expense records
- **Analytics & Dashboard** — Aggregated financial summaries and category breakdowns
- **Pagination** — All list endpoints support `page`, `limit`, `hasNext`, `hasPrev`
- **Full-text Search** — Search across description, category, and tags
- **CSV Export** — Export records to CSV format
- **Soft Delete** — Records are never permanently removed
- **Audit Logging** — Every create/update/delete action is logged to AuditLog
- **Duplicate Detection** — Flags same amount + category within 60 seconds
- **Rate Limiting** — Protection against abuse via `express-rate-limit`
- **Input Validation** — Schema-based request validation with Joi
- **Security Headers** — Hardened headers via Helmet
- **Swagger Docs** — Interactive API docs with auth, schemas, and role restrictions

---

## 🛠️ Tech Stack

| Layer        | Technology                                   |
|--------------|----------------------------------------------|
| Runtime      | Node.js v18+ (ESM modules)                   |
| Framework    | Express.js                                   |
| Database     | MongoDB + Mongoose                           |
| Auth         | JSON Web Tokens (jsonwebtoken)               |
| Validation   | Joi                                          |
| Docs         | Swagger (swagger-jsdoc + swagger-ui-express) |
| Testing      | Jest + Supertest                             |
| Dev Server   | Nodemon                                      |

---

## 📁 Project Structure

```
FinanceManagement/
├── server.js               # Entry point
├── src/
│   ├── app.js              # Express app setup
│   ├── config/             # DB connection, env config, constants & permissions
│   ├── controller/         # Route handlers (auth, records, analytics)
│   ├── middleware/         # Auth, RBAC, error handling, rate limiting
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
   MONGO_URI=mongodb://localhost:27017/finance-db
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

Server runs at `http://localhost:5000`.

---

## 📖 API Documentation

Interactive Swagger docs (request schemas, response shapes, auth requirements, role restrictions):

- **Local:** `http://localhost:5000/api/v1/docs`
- **Live:** [https://financemanagement-nu9k.onrender.com/api/v1/docs](https://financemanagement-nu9k.onrender.com/api/v1/docs)

**To test via Swagger UI:** Register → Login → Copy the token → Click **Authorize**.

---

## 🔑 API Endpoints

### Auth

| Method | Endpoint             | Description              | Access  |
|--------|----------------------|--------------------------|---------|
| POST   | `/api/auth/register` | Register a new user      | Public  |
| POST   | `/api/auth/login`    | Login and get JWT token  | Public  |
| GET    | `/api/auth/profile`  | Get current user profile | Private |

### Financial Records

| Method | Endpoint              | Description             | Access        |
|--------|-----------------------|-------------------------|---------------|
| GET    | `/api/records`        | List records (paginated)| Analyst/Admin |
| POST   | `/api/records`        | Create a new record     | Analyst/Admin |
| GET    | `/api/records/:id`    | Get a single record     | Analyst/Admin |
| PUT    | `/api/records/:id`    | Update a record         | Analyst/Admin |
| DELETE | `/api/records/:id`    | Delete a record         | Admin only    |
| GET    | `/api/records/export` | Export records as CSV   | Analyst/Admin |

### Analytics / Dashboard

| Method | Endpoint          | Description                       | Access    |
|--------|-------------------|-----------------------------------|-----------|
| GET    | `/api/analytics`  | Financial summary & breakdown     | All roles |

---

## 👥 Roles & Permissions

| Role        | Description                                              |
|-------------|----------------------------------------------------------|
| **Viewer**  | Can only view dashboard summary data                     |
| **Analyst** | Can view records, access insights, and export CSV        |
| **Admin**   | Full access — create, update, delete records and users   |

| Permission               | Viewer | Analyst | Admin |
|--------------------------|--------|---------|-------|
| View dashboard summary   | ✅     | ✅      | ✅    |
| Browse individual records| ❌     | ✅      | ✅    |
| View analytics           | ❌     | ✅      | ✅    |
| Create records           | ❌     | ❌      | ✅    |
| Update records           | ❌     | ❌      | ✅    |
| Delete records           | ❌     | ❌      | ✅    |
| Export CSV               | ❌     | ✅      | ✅    |
| Manage users             | ❌     | ❌      | ✅    |

Permissions are declared centrally in `src/config/constants.js` via a `PERMISSIONS` map. Every route references a resource + action, checked by middleware — meaning adding a new role in the future is a single config change.

---

## 🧠 Technical Decisions & Trade-offs

### Framework — Node.js + Express
Chose Express for full control over the middleware pipeline — critical when layering `authenticate → checkRole → checkPermission` in a specific sequence. Considered NestJS but felt the abstraction overhead wasn't justified for this scope.

### Database — MongoDB + Mongoose
Financial records are document-shaped with flexible optional fields (tags, descriptions, metadata). Mongoose pre-save hooks normalize data at the model level (e.g. lowercasing `category`/`type`), so controller calls don't need to remember to do it. Trade-off: no relational integrity enforcement — duplicate detection had to be handled in application code.

### Authentication — Stateless JWT
JWT is stateless and doesn't require server-side session storage. Every request re-fetches the user from the database after token verification — this ensures deactivated accounts are rejected immediately, even if their token hasn't expired. Trade-off: no true token revocation before expiry. A production system would add refresh token rotation.

### Access Control — Two-Layer RBAC
Permissions are enforced at two levels:
1. **Middleware layer** — a central `PERMISSIONS` map in `constants.js` gates every route by resource + action
2. **Controller layer** — handles nuanced logic like what data shape gets returned per role

This separation means adding a new role is one config change, not a hunt through controller logic.

### Records as Company Data, Not Personal Data
The most important design decision. Records are company-wide entries — the `user` field tracks *who entered* a record, not *who owns* it. Viewers get dashboard-only read access. Analysts can browse records and insights. Admins have full management. This matches the brief's finance dashboard scenario for a team, not a personal finance app.

### Soft Delete + Audit Log
Records are never hard-deleted — a `softDelete` flag and `deletedAt` timestamp are set instead. Every mutating operation writes to an `AuditLog` collection. In any financial system, traceability matters more than saving disk space.

---

## ✨ Optional Enhancements

Beyond the core requirements, the following were also implemented:

- **Pagination** on all list endpoints (`page`, `limit`, `hasNext`, `hasPrev`)
- **Full-text search** across `description`, `category`, and `tags`
- **Soft delete** — records are never permanently removed
- **Audit logging** for every create/update/delete action
- **Rate limiting** on create endpoints
- **Duplicate transaction detection** — flags same amount + category within 60 seconds
- **Case-insensitive filtering** — legacy and normalized data both match correctly
- **Swagger / OpenAPI documentation** for every route with full schemas

---

## 🧪 Running Tests

```bash
# Run all tests
npm test

# Run with coverage report
npm run test:coverage
```

Tests cover:
- **Auth** — Register, login, profile access, token validation
- **Records** — CRUD operations, role-based restrictions, validation
- **Analytics** — Summary totals, category breakdowns

---

## 🔒 Security

- Passwords hashed with **bcryptjs**
- All protected routes require a valid **JWT Bearer token**
- HTTP headers hardened with **Helmet**
- Request rate limiting applied globally
- **Never commit your `.env` file** — it is listed in `.gitignore`

---

## ⚠️ Known Limitations

- **No JWT refresh token** — tokens cannot be revoked before expiry
- **No email verification** on registration
- **Swagger enum values** for categories are hardcoded (could dynamically reference `constants.js` — noted as a future improvement)

---

## 📌 Assumptions Made

- Financial records represent **company-wide transactions**, not personal ones
- The `user` field on a record = **who entered it**, not who owns it
- **Viewers** only access the dashboard summary — browsing raw records requires at least Analyst role

---

## 📝 License

This project is for educational/assessment purposes.
