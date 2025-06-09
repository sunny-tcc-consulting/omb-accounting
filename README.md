# OMB Accounting System

A microservices-based accounting system built with micro-frontend architecture using Node.js and Test-Driven Development (TDD).

## Project Structure

```
omb-accounting/
├── frontend/                    # Micro-frontend services
│   ├── quotation-service/      # Quotation management UI
│   ├── invoice-service/        # Invoice management UI
│   ├── accounts-service/       # Chart of accounts UI
│   ├── customers-vendors-service/ # Customer & vendor management UI
│   ├── reporting-service/      # Reports and analytics UI
│   ├── settings-service/       # System settings UI
│   ├── user-management-service/ # User and role management UI
│   └── shared/                 # Shared frontend utilities
├── backend/                    # Backend microservices
│   ├── quotation-service/      # Quotation API service
│   ├── invoice-service/        # Invoice API service
│   ├── accounts-service/       # Accounts API service
│   ├── customers-vendors-service/ # Customer & vendor API service
│   ├── reporting-service/      # Reporting API service
│   ├── settings-service/       # Settings API service
│   ├── user-management-service/ # User management API service
│   └── shared/                 # Shared backend utilities
├── tests/                      # Integration and E2E tests
├── docs/                       # Project documentation
├── scripts/                    # Build and deployment scripts
├── database/                   # File-based database storage
└── requirements.md             # Project requirements
```

## Development Approach

### 1. Test-Driven Development (TDD)
- Red → Green → Refactor cycle
- Write tests first, then implement minimal functionality
- Comprehensive test coverage for each service

### 2. Frontend-First Development
- Develop complete frontend with mocked backend APIs
- Ensure frontend works independently
- Replace mocks with real backend services incrementally

### 3. Microservices Architecture
- Independent frontend and backend services
- Each service can be developed, tested, and deployed independently
- Service-specific responsibilities and clear boundaries

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation
```bash
# Install root dependencies
npm install

# Install all service dependencies
npm run install:all
```

### Development
```bash
# Start all services in development mode
npm run dev

# Start only frontend services
npm run dev:frontend

# Start only backend services
npm run dev:backend
```

### Testing
```bash
# Run all tests
npm test

# Run frontend tests only
npm run test:frontend

# Run backend tests only
npm run test:backend
```

## Major Functions

1. **Quotation Management** - Generate and manage price quotes
2. **Invoice Management** - Handle incoming and outgoing invoices
3. **Accounts Management** - Chart of accounts and transactions
4. **Customer & Vendor Management** - Contact relationship management
5. **Reporting** - Financial reports (General Ledger, Balance Sheet, P&L)
6. **Settings** - Company info and document templates
7. **User Management** - User accounts and role-based access control

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+), Web Components
- **Backend**: Node.js, Express.js
- **Database**: File-based JSON storage
- **Testing**: Jest, Testing Library
- **Build Tools**: Webpack, Babel
- **Development**: ESLint, Prettier, Husky

## Contributing

1. Follow TDD approach - write tests first
2. Ensure all tests pass before committing
3. Follow coding standards and linting rules
4. Document any new features or changes
