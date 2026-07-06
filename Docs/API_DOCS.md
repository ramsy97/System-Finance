# API Documentation - Sistem Keuangan

## Base URL

```
http://localhost:4000/api
```

## Authentication

All endpoints (except login) require authentication via JWT token sent as a cookie (`token`) or Bearer token in the `Authorization` header.

### Login

```
POST /auth/login
Content-Type: application/json

{
  "email": "admin@finance.com",
  "password": "password123"
}

Response: {
  "status": "success",
  "message": "Login successful",
  "data": {
    "token": "jwt-token",
    "user": {
      "id": "uuid",
      "email": "admin@finance.com",
      "name": "Budi Santoso",
      "role": "SUPER_ADMIN",
      "twoFactorEnabled": false
    }
  }
}
```

### Get Current User

```
GET /auth/me
Authorization: Bearer <token>

Response: {
  "status": "success",
  "data": { "id": "uuid", "email": "...", "name": "...", "role": "..." }
}
```

## Accounts

### List Accounts

```
GET /accounts?type=ASSET&isActive=true&search=cash&page=1&limit=10
```

### Create Account

```
POST /accounts
Content-Type: application/json

{
  "code": "1130",
  "name": "Accounts Receivable",
  "type": "ASSET",
  "description": "Customer receivables"
}
```

## Transactions

### List Transactions

```
GET /transactions?type=CASH_IN&startDate=2024-01-01&endDate=2024-12-31&page=1&limit=20
```

### Create Transaction

```
POST /transactions
Content-Type: application/json

{
  "type": "CASH_OUT",
  "date": "2024-06-15",
  "amount": 5000000,
  "accountId": "uuid",
  "categoryId": "uuid",
  "contactId": "uuid",
  "paymentMethod": "TRANSFER",
  "description": "Office rent payment"
}
```

## Invoices

### List Invoices

```
GET /invoices?type=SALES&status=PAID&page=1&limit=20
```

### Create Invoice

```
POST /invoices
Content-Type: application/json

{
  "type": "SALES",
  "contactId": "uuid",
  "date": "2024-06-15",
  "dueDate": "2024-07-15",
  "subtotal": 10000000,
  "taxAmount": 1100000,
  "totalAmount": 11100000,
  "items": [
    {
      "description": "Web Development Service",
      "quantity": 1,
      "unitPrice": 10000000,
      "amount": 10000000
    }
  ]
}
```

### Record Payment

```
POST /invoices/:id/payment
Content-Type: application/json

{
  "amount": 11100000,
  "accountId": "uuid",
  "paymentMethod": "TRANSFER"
}
```

## Journal Entries

### Create Journal Entry

```
POST /journal-entries
Content-Type: application/json

{
  "date": "2024-06-15",
  "type": "GENERAL",
  "description": "Adjustment entry",
  "items": [
    { "accountId": "uuid", "debit": 5000000, "credit": 0 },
    { "accountId": "uuid", "debit": 0, "credit": 5000000 }
  ]
}
```

## Reports

### Dashboard Stats

```
GET /reports/dashboard

Response: {
  "status": "success",
  "data": {
    "revenue": 500000000,
    "expenses": 350000000,
    "netIncome": 150000000,
    "pendingInvoices": 12,
    "totalAccounts": 25,
    "totalContacts": 80,
    "monthlyCashIn": 45000000,
    "monthlyCashOut": 38000000,
    "overdueInvoices": 5,
    "pendingApprovals": 3,
    "recentTransactions": [...]
  }
}
```

### Trial Balance

```
GET /reports/trial-balance?endDate=2024-12-31
```

### Income Statement

```
GET /reports/income-statement?startDate=2024-01-01&endDate=2024-12-31
```

### Balance Sheet

```
GET /reports/balance-sheet
```

### Cash Flow

```
GET /reports/cash-flow?startDate=2024-01-01&endDate=2024-12-31
```

## Pagination

All list endpoints support pagination with these query parameters:
- `page` (default: 1)
- `limit` (default: 10, max: 100)

Response includes pagination metadata:
```json
{
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "totalPages": 15
  }
}
```

## Error Response Format

```json
{
  "status": "error",
  "message": "Error description"
}
```

Validation errors:
```json
{
  "message": "Validation error",
  "errors": [
    { "field": "email", "message": "Invalid email" }
  ]
}
```

## Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request / Validation Error |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 429 | Rate Limit Exceeded |
| 500 | Internal Server Error |

## Enums

### Account Types: `ASSET`, `LIABILITY`, `EQUITY`, `REVENUE`, `EXPENSE`
### Contact Types: `CUSTOMER`, `SUPPLIER`, `VENDOR`
### Invoice Types: `SALES`, `PURCHASE`
### Invoice Status: `DRAFT`, `SENT`, `PARTIALLY_PAID`, `PAID`, `OVERDUE`, `CANCELLED`
### Transaction Types: `CASH_IN`, `CASH_OUT`, `TRANSFER`
### Payment Methods: `CASH`, `TRANSFER`, `QRIS`, `VIRTUAL_ACCOUNT`, `CREDIT_CARD`
### Approval Status: `PENDING`, `APPROVED`, `REJECTED`
