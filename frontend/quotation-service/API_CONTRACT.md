# Quotation Service API Contract

This document defines the API contract for the Quotation Service, derived from the frontend mock implementation. These endpoints are expected to be implemented by the backend service.

## Base URL
`/api/quotations`

## Data Models

### Quotation
| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier for the quotation |
| `customerName` | string | Name of the customer |
| `customerAddress` | string | Address of the customer |
| `customerEmail` | string | Email of the customer |
| `customerPhone` | string | Phone number of the customer |
| `quotationDate` | string (ISO Date) | Date the quotation was created (YYYY-MM-DD) |
| `expiryDate` | string (ISO Date) | Expiration date of the quotation (YYYY-MM-DD) |
| `items` | Array<QuotationItem> | List of items in the quotation |
| `subtotal` | number | Sum of all item totals |
| `taxRate` | number | Tax rate applied (e.g., 0.08 for 8%) |
| `taxAmount` | number | Calculated tax amount |
| `total` | number | Final total including tax |
| `status` | string | Status: 'draft', 'pending', 'approved', 'rejected' |
| `terms` | string | Payment terms (e.g., "Net 30") |
| `notes` | string | Additional notes |
| `createdAt` | string (ISO DateTime) | Timestamp of creation |
| `updatedAt` | string (ISO DateTime) | Timestamp of last update |

### QuotationItem
| Field | Type | Description |
|-------|------|-------------|
| `description` | string | Description of the item (or `itemDescription`) |
| `quantity` | number | Quantity of the item |
| `price` | number | Unit price of the item (or `unitPrice`) |
| `total` | number | Line total (quantity * price) (or `lineTotal`) |

## Endpoints

### 1. Get All Quotations
Retrieves a list of all quotations.

- **URL**: `GET /api/quotations`
- **Response**: `200 OK`
- **Body**: `Array<Quotation>`

### 2. Get Quotation by ID
Retrieves details of a specific quotation.

- **URL**: `GET /api/quotations/:id`
- **Response**: `200 OK`
- **Body**: `Quotation`
- **Error**: `404 Not Found` if ID does not exist.

### 3. Create Quotation
Creates a new quotation.

- **URL**: `POST /api/quotations`
- **Body**:
  ```json
  {
    "customerName": "string",
    "items": [
      {
        "description": "string",
        "quantity": number,
        "price": number
      }
    ]
  }
  ```
- **Response**: `201 Created`
- **Body**: `Quotation` (The created object with generated ID and calculated totals)

### 4. Update Quotation
Updates an existing quotation.

- **URL**: `PUT /api/quotations/:id`
- **Body**: Partial `Quotation` object
- **Response**: `200 OK`
- **Body**: `Quotation` (The updated object)
- **Error**: `404 Not Found`

### 5. Delete Quotation
Deletes a quotation.

- **URL**: `DELETE /api/quotations/:id`
- **Response**: `200 OK`
- **Body**: `{ "success": true, "id": "string" }`

### 6. Split Quotation
Splits specific items from an existing quotation into a new quotation.

- **URL**: `POST /api/quotations/:id/split`
- **Body**:
  ```json
  {
    "itemIndices": [0, 2] // Array of indices of items to move
  }
  ```
- **Response**: `200 OK`
- **Body**:
  ```json
  {
    "success": true,
    "message": "Quotation split successfully",
    "newQuotationId": "string"
  }
  ```

### 7. Convert to Invoice
Converts a quotation to an invoice.

- **URL**: `POST /api/quotations/:id/convert`
- **Response**: `200 OK`
- **Body**:
  ```json
  {
    "success": true,
    "message": "Quotation converted to invoice successfully",
    "invoiceId": "string"
  }
  ```