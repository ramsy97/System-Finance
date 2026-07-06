# Sistem Keuangan - Financial Management System

A premium Financial Management System for small-to-medium enterprises (SMEs). Built with Next.js, Express, TypeScript, PostgreSQL, and Docker.

## Features

- **Dashboard**: Real-time financial overview with key metrics
- **Chart of Accounts**: Manage your full chart of accounts (CoA)
- **Contacts**: Manage customers, suppliers, and vendors
- **Transactions**: Record and track all cash inflows/outflows and transfers
- **Invoices**: Generate and manage sales and purchase invoices
- **Cash & Bank**: Track bank accounts and cash positions with mutation reconciliation
- **Journal Entries**: Double-entry journaling with automatic balance verification
- **Budgets**: Departmental and project-based budget planning with usage tracking
- **Reports**: Trial Balance, Income Statement, Balance Sheet, Cash Flow
- **User Management**: Role-based access control (RBAC) with 5 user roles
- **Audit Logs**: Comprehensive audit trail for all actions
- **2FA**: Two-factor authentication support
- **Export**: PDF invoice generation and Excel report exports

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, TailwindCSS, Shadcn UI, Framer Motion, TanStack Query
- **Backend**: Node.js, Express, TypeScript, Prisma ORM
- **Database**: PostgreSQL 16
- **Auth**: JWT with HTTP-only cookies
- **Container**: Docker & Docker Compose

## Prerequisites

- Docker and Docker Compose installed
- Node.js 20+ (for local development)

## Quick Start

### Using Docker (Recommended)

```bash
# Clone the repository
git clone <repo-url>
cd sistem-keuangan

# Start all services
docker compose up --build

# Run database seed (in another terminal)
docker exec -it sistem-keuangan-api npx tsx src/seed.ts
```

### Manual Setup

#### Backend

```bash
cd Backend
npm install
cp .env.example .env  # Configure your database URL
npx prisma db push     # Create database tables
npm run seed           # Seed with sample data
npm run dev            # Start development server
```

#### Frontend

```bash
cd Frontend
npm install
npm run dev  # Start development server (port 3000)
```

## Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@finance.com | password123 |
| Finance | finance@finance.com | password123 |
| Accounting | accounting@finance.com | password123 |
| Manager | manager@finance.com | password123 |
| Viewer | viewer@finance.com | password123 |

## API Endpoints

Base URL: `http://localhost:4000/api`

### Authentication
- `POST /auth/login` - Login
- `GET /auth/me` - Get current user
- `POST /auth/logout` - Logout
- `POST /auth/change-password` - Change password

### Users
- `GET /users` - List users (Super Admin only)
- `POST /users` - Create user
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### Accounts
- `GET /accounts` - List chart of accounts
- `GET /accounts/:id` - Get account details
- `POST /accounts` - Create account
- `PUT /accounts/:id` - Update account
- `DELETE /accounts/:id` - Deactivate account

### Contacts
- `GET /contacts` - List contacts
- `GET /contacts/:id` - Get contact details
- `POST /contacts` - Create contact
- `PUT /contacts/:id` - Update contact
- `DELETE /contacts/:id` - Deactivate contact

### Transactions
- `GET /transactions` - List transactions
- `GET /transactions/:id` - Get transaction details
- `POST /transactions` - Create transaction
- `PUT /transactions/:id` - Update transaction
- `DELETE /transactions/:id` - Delete transaction
- `POST /transactions/:id/approve` - Approve/reject transaction

### Invoices
- `GET /invoices` - List invoices
- `GET /invoices/overdue` - List overdue invoices
- `GET /invoices/:id` - Get invoice details
- `POST /invoices` - Create invoice
- `PUT /invoices/:id` - Update invoice
- `DELETE /invoices/:id` - Delete invoice
- `POST /invoices/:id/approve` - Approve/reject invoice
- `POST /invoices/:id/send` - Send invoice
- `POST /invoices/:id/payment` - Record payment

### Journal Entries
- `GET /journal-entries` - List journal entries
- `GET /journal-entries/:id` - Get entry details
- `POST /journal-entries` - Create journal entry
- `DELETE /journal-entries/:id` - Delete entry

### Budgets
- `GET /budgets` - List budgets
- `GET /budgets/analytics` - Get budget analytics
- `POST /budgets` - Create budget
- `PUT /budgets/:id` - Update budget
- `DELETE /budgets/:id` - Delete budget

### Cash & Bank
- `GET /banks` - List bank/cash accounts
- `POST /banks` - Create bank/cash account
- `PUT /banks/:id` - Update bank/cash account
- `GET /banks/mutations` - List mutations
- `POST /banks/mutations/:id/reconcile` - Reconcile mutation

### Reports
- `GET /reports/dashboard` - Dashboard statistics
- `GET /reports/trial-balance` - Trial balance
- `GET /reports/income-statement` - Income statement
- `GET /reports/balance-sheet` - Balance sheet
- `GET /reports/cash-flow` - Cash flow report
- `GET /reports/audit-logs` - Audit logs
- `GET /reports/notifications` - Notifications

### Settings
- `GET /settings` - Get company settings
- `PUT /settings` - Update company settings
- `GET /settings/projects` - List projects
- `POST /settings/projects` - Create project
- `GET /settings/departments` - List departments
- `POST /settings/departments` - Create department
- `GET /settings/categories` - List categories
- `POST /settings/categories` - Create category

## Project Structure

```
├── Backend/
│   ├── src/
│   │   ├── config/           # Database and app config
│   │   ├── controllers/      # Route handlers
│   │   ├── middleware/       # Auth, validation, error handling
│   │   ├── routes/           # Route definitions
│   │   ├── services/         # Business logic (PDF, email, etc.)
│   │   ├── utils/            # Helpers, schemas, permissions
│   │   ├── app.ts            # Express app setup
│   │   ├── index.ts          # Entry point
│   │   └── seed.ts           # Database seeder
│   ├── prisma/               # Prisma schema
│   └── uploads/              # File uploads
├── Frontend/
│   ├── src/
│   │   ├── app/              # Next.js pages
│   │   ├── components/       # UI and layout components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── lib/              # API client, utilities
│   │   └── store/            # State management
│   └── public/               # Static assets
├── Docker/                   # Docker configuration
└── docker-compose.yml        # Compose file
```

## Role Permissions

| Module | Super Admin | Finance | Accounting | Manager | Viewer |
|--------|:-----------:|:-------:|:----------:|:-------:|:------:|
| Dashboard | Read | Read | Read | Read | Read |
| Accounts | CRUD | Read | CRU | Read | Read |
| Contacts | CRUD | CRU | CRU | Read | Read |
| Cash/Bank | CRUD | CRU | CRU | Read | Read |
| Transactions | CRUD | CRU | CRU | Approve | Read |
| Invoices | CRUD | CRU | CRU | Approve | Read |
| Journal Entries | CRUD | - | CRU | Read | Read |
| Budgets | CRUD | - | CRU | CRU | Read |
| Reports | Read | Read | Read | Read | Read |
| Settings | CRUD | Read | Read | Read | Read |
| Audit Logs | Read | - | - | Read | - |
