# API Reference

Complete API documentation for omb-accounting backend.

---

## Base URL

```
http://localhost:3000/api
```

---

## Authentication

All API routes except `/api/auth/login` and `/api/auth/register` require authentication.

### Login

**Endpoint**: `POST /api/auth/login`

**Request Body**:

```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user-123",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "admin"
    },
    "expiresAt": 1708800000000
  }
}
```

**Error Response** (401 Unauthorized):

```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password"
  }
}
```

### Register

**Endpoint**: `POST /api/auth/register`

**Request Body**:

```json
{
  "email": "newuser@example.com",
  "password": "SecurePass123!",
  "name": "Jane Doe"
}
```

**Response** (201 Created):

```json
{
  "success": true,
  "data": {
    "id": "user-456",
    "email": "newuser@example.com",
    "name": "Jane Doe",
    "role": "user",
    "isActive": true
  }
}
```

### Logout

**Endpoint**: `POST /api/auth/logout`

**Request Headers**:

```
Authorization: Bearer <token>
```

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## Customers

### List All Customers

**Endpoint**: `GET /api/customers`

**Query Parameters**:

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `search` (optional): Search by name or email
- `role` (optional): Filter by role

**Request Headers**:

```
Authorization: Bearer <token>
```

**Response** (200 OK):

```json
{
  "success": true,
  "data": [
    {
      "id": "cust-123",
      "name": "ABC Company Ltd",
      "email": "abc@company.com",
      "phone": "+85212345678",
      "address": "123 Hong Kong Street",
      "created_at": 1708713600000,
      "updated_at": 1708713600000
    }
  ],
  "count": 1,
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

### Create Customer

**Endpoint**: `POST /api/customers`

**Request Body**:

```json
{
  "name": "ABC Company Ltd",
  "email": "abc@company.com",
  "phone": "+85212345678",
  "address": "123 Hong Kong Street"
}
```

**Response** (201 Created):

```json
{
  "success": true,
  "data": {
    "id": "cust-123",
    "name": "ABC Company Ltd",
    "email": "abc@company.com",
    "phone": "+85212345678",
    "address": "123 Hong Kong Street",
    "created_at": 1708713600000,
    "updated_at": 1708713600000
  }
}
```

### Get Customer by ID

**Endpoint**: `GET /api/customers/:id`

**Request Headers**:

```
Authorization: Bearer <token>
```

**Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "id": "cust-123",
    "name": "ABC Company Ltd",
    "email": "abc@company.com",
    "phone": "+85212345678",
    "address": "123 Hong Kong Street",
    "created_at": 1708713600000,
    "updated_at": 1708713600000
  }
}
```

**Error Response** (404 Not Found):

```json
{
  "success": false,
  "error": {
    "code": "CUSTOMER_NOT_FOUND",
    "message": "Customer not found"
  }
}
```

### Update Customer

**Endpoint**: `PUT /api/customers/:id`

**Request Body**:

```json
{
  "name": "ABC Company Ltd (Updated)",
  "email": "updated@company.com"
}
```

**Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "id": "cust-123",
    "name": "ABC Company Ltd (Updated)",
    "email": "updated@company.com",
    "phone": "+85212345678",
    "address": "123 Hong Kong Street",
    "created_at": 1708713600000,
    "updated_at": 1708713600000
  }
}
```

### Delete Customer

**Endpoint**: `DELETE /api/customers/:id`

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Customer deleted successfully"
}
```

---

## Quotations

### List All Quotations

**Endpoint**: `GET /api/quotations`

**Query Parameters**:

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `customerId` (optional): Filter by customer
- `status` (optional): Filter by status

**Request Headers**:

```
Authorization: Bearer <token>
```

**Response** (200 OK):

```json
{
  "success": true,
  "data": [
    {
      "id": "quot-123",
      "quotationNumber": "QT-2026-0001",
      "customerId": "cust-123",
      "customerName": "ABC Company Ltd",
      "items": [
        {
          "description": "Consulting Services",
          "quantity": 10,
          "unitPrice": 1000.0,
          "subtotal": 10000.0
        }
      ],
      "subtotal": 10000.0,
      "tax": 1000.0,
      "total": 11000.0,
      "validUntil": "2026-03-23",
      "status": "draft",
      "created_at": 1708713600000,
      "updated_at": 1708713600000
    }
  ],
  "count": 1
}
```

### Create Quotation

**Endpoint**: `POST /api/quotations`

**Request Body**:

```json
{
  "customerId": "cust-123",
  "items": [
    {
      "description": "Consulting Services",
      "quantity": 10,
      "unitPrice": 1000.0
    }
  ],
  "taxRate": 10,
  "validUntil": "2026-03-23",
  "notes": "Valid for 30 days"
}
```

**Response** (201 Created):

```json
{
  "success": true,
  "data": {
    "id": "quot-123",
    "quotationNumber": "QT-2026-0001",
    "customerId": "cust-123",
    "customerName": "ABC Company Ltd",
    "items": [
      {
        "description": "Consulting Services",
        "quantity": 10,
        "unitPrice": 1000.0,
        "subtotal": 10000.0
      }
    ],
    "subtotal": 10000.0,
    "tax": 1000.0,
    "total": 11000.0,
    "validUntil": "2026-03-23",
    "status": "draft",
    "created_at": 1708713600000,
    "updated_at": 1708713600000
  }
}
```

### Get Quotation by ID

**Endpoint**: `GET /api/quotations/:id`

**Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "id": "quot-123",
    "quotationNumber": "QT-2026-0001",
    "customerId": "cust-123",
    "customerName": "ABC Company Ltd",
    "items": [...],
    "subtotal": 10000.00,
    "tax": 1000.00,
    "total": 11000.00,
    "validUntil": "2026-03-23",
    "status": "draft",
    "created_at": 1708713600000,
    "updated_at": 1708713600000
  }
}
```

---

## Invoices

### List All Invoices

**Endpoint**: `GET /api/invoices`

**Query Parameters**:

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `customerId` (optional): Filter by customer
- `status` (optional): Filter by status

**Request Headers**:

```
Authorization: Bearer <token>
```

**Response** (200 OK):

```json
{
  "success": true,
  "data": [
    {
      "id": "inv-123",
      "invoiceNumber": "INV-2026-0001",
      "customerId": "cust-123",
      "customerName": "ABC Company Ltd",
      "items": [...],
      "subtotal": 10000.00,
      "tax": 1000.00,
      "total": 11000.00,
      "dueDate": "2026-03-08",
      "status": "pending",
      "created_at": 1708713600000,
      "updated_at": 1708713600000
    }
  ],
  "count": 1
}
```

### Create Invoice

**Endpoint**: `POST /api/invoices`

**Request Body**:

```json
{
  "customerId": "cust-123",
  "items": [
    {
      "description": "Consulting Services",
      "quantity": 10,
      "unitPrice": 1000.0
    }
  ],
  "taxRate": 10,
  "dueDate": "2026-03-08",
  "notes": "Payment due within 30 days"
}
```

**Response** (201 Created):

```json
{
  "success": true,
  "data": {
    "id": "inv-123",
    "invoiceNumber": "INV-2026-0001",
    "customerId": "cust-123",
    "customerName": "ABC Company Ltd",
    "items": [...],
    "subtotal": 10000.00,
    "tax": 1000.00,
    "total": 11000.00,
    "dueDate": "2026-03-08",
    "status": "pending",
    "created_at": 1708713600000,
    "updated_at": 1708713600000
  }
}
```

### Get Invoice by ID

**Endpoint**: `GET /api/invoices/:id`

**Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "id": "inv-123",
    "invoiceNumber": "INV-2026-0001",
    "customerId": "cust-123",
    "customerName": "ABC Company Ltd",
    "items": [...],
    "subtotal": 10000.00,
    "tax": 1000.00,
    "total": 11000.00,
    "dueDate": "2026-03-08",
    "status": "pending",
    "created_at": 1708713600000,
    "updated_at": 1708713600000
  }
}
```

---

## Bank

### List Bank Accounts

**Endpoint**: `GET /api/bank/accounts`

**Request Headers**:

```
Authorization: Bearer <token>
```

**Response** (200 OK):

```json
{
  "success": true,
  "data": [
    {
      "id": "acc-123",
      "accountName": "Business Account",
      "accountNumber": "123-456-789",
      "bankName": "HSBC",
      "currentBalance": 15000.0,
      "isPrimary": 1
    }
  ],
  "count": 1
}
```

### Get Bank Overview

**Endpoint**: `GET /api/bank/overview`

**Request Headers**:

```
Authorization: Bearer <token>
```

**Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "accounts": [
      {
        "id": "acc-123",
        "accountName": "Business Account",
        "accountNumber": "123-456-789",
        "currentBalance": 15000.0,
        "isPrimary": 1
      }
    ],
    "totalBalance": 15000.0,
    "transactionCount": 45
  }
}
```

### List Transactions

**Endpoint**: `GET /api/bank/transactions`

**Query Parameters**:

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `accountId` (optional): Filter by account
- `type` (optional): Filter by type (credit/debit)
- `startDate` (optional): Filter by start date
- `endDate` (optional): Filter by end date

**Request Headers**:

```
Authorization: Bearer <token>
```

**Response** (200 OK):

```json
{
  "success": true,
  "data": [
    {
      "id": "txn-123",
      "accountId": "acc-123",
      "amount": 500.0,
      "type": "credit",
      "description": "Deposit",
      "date": 1708713600000,
      "status": "completed"
    }
  ],
  "count": 1
}
```

### Get Reconciliation History

**Endpoint**: `GET /api/bank/reconciliation/:accountId`

**Request Headers**:

```
Authorization: Bearer <token>
```

**Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "accountId": "acc-123",
    "statementBalance": 5000.0,
    "bookBalance": 4950.0,
    "difference": 50.0,
    "matched": 45,
    "unmatched": 3,
    "reconciledAt": 1708713600000
  }
}
```

---

## Audit Logs

### List Audit Logs

**Endpoint**: `GET /api/audit-logs`

**Query Parameters**:

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `userId` (optional): Filter by user
- `tableName` (optional): Filter by table
- `operation` (optional): Filter by operation (CREATE/READ/UPDATE/DELETE)
- `startDate` (optional): Filter by start date
- `endDate` (optional): Filter by end date

**Request Headers**:

```
Authorization: Bearer <token>
```

**Response** (200 OK):

```json
{
  "success": true,
  "data": [
    {
      "id": "audit-123",
      "userId": "user-123",
      "userName": "John Doe",
      "tableName": "customers",
      "operation": "CREATE",
      "recordId": "cust-456",
      "oldValue": null,
      "newValue": JSON.stringify({ name: "New Customer" }),
      "ipAddress": "192.168.1.1",
      "userAgent": "Mozilla/5.0",
      "createdAt": 1708713600000
    }
  ],
  "count": 1
}
```

---

## Error Codes

| Code                  | Description               |
| --------------------- | ------------------------- |
| `INVALID_CREDENTIALS` | Invalid email or password |
| `USER_NOT_FOUND`      | User not found            |
| `CUSTOMER_NOT_FOUND`  | Customer not found        |
| `QUOTATION_NOT_FOUND` | Quotation not found       |
| `INVOICE_NOT_FOUND`   | Invoice not found         |
| `UNAUTHORIZED`        | Missing or invalid token  |
| `FORBIDDEN`           | Insufficient permissions  |
| `VALIDATION_ERROR`    | Invalid request data      |
| `RESOURCE_EXISTS`     | Resource already exists   |
| `INTERNAL_ERROR`      | Internal server error     |

---

## Rate Limiting

- Default rate limit: 100 requests per minute per IP
- Authentication token-based rate limiting also applies

---

## Testing

### cURL Examples

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Get Customers
curl -X GET http://localhost:3000/api/customers \
  -H "Authorization: Bearer <token>"

# Create Customer
curl -X POST http://localhost:3000/api/customers \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Customer","email":"test@example.com"}'
```

---

## Version History

| Version | Date       | Changes                   |
| ------- | ---------- | ------------------------- |
| 1.0.0   | 2026-02-23 | Initial API documentation |

---

**Last Updated**: 2026-02-23
