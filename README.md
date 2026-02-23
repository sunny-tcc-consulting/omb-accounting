# omb-accounting 📊

> A modern accounting web application for small and medium enterprises (SMEs).
> Built with Next.js 16, TypeScript, and shadcn/ui.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Development](#development)
- [Testing](#testing)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)

---

## Features

### Completed (Phase 1-5) ✅

| Module                   | Features                                                                          |
| ------------------------ | --------------------------------------------------------------------------------- |
| **Dashboard**            | Financial overview, key metrics, recent transactions, financial health indicators |
| **Customer Management**  | CRUD operations, search, filtering, validation                                    |
| **Quotation Management** | Create quotations, line items, PDF generation, validity periods                   |
| **Invoice Management**   | Create invoices, line items, tax/discount support, payment tracking               |
| **Quotation → Invoice**  | One-click conversion with automatic data transfer                                 |
| **Audit Reports**        | Trial Balance, Balance Sheet, P&L, General Ledger, Cash Flow                      |
| **PDF Generation**       | Professional PDFs for all documents with company branding                         |
| **User & Roles**         | JWT authentication, role-based access control (admin/user/viewer/manager)         |
| **Session Management**   | Auto-logout, session timeout warnings, activity logging                           |
| **Bank Reconciliation**  | Bank account management, transaction import, statement matching                   |
| **SQLite Backend**       | Local file-based database, repositories, services, audit logging                  |

### Phase 6 (Planned) 🚧

| Module                      | Status  |
| --------------------------- | ------- |
| **Advanced Reports**        | Pending |
| **Data Export**             | Pending |
| **Multi-company Support**   | Pending |
| **Dashboard Customization** | Pending |
| **API Documentation**       | Pending |

---

## Tech Stack

### Core Framework

- **Next.js 14** - App Router, Server Components
- **TypeScript** - Type safety and developer experience
- **React 18** - UI library

### UI & Styling

- **shadcn/ui** - Modern, accessible component library
- **Tailwind CSS** - Utility-first CSS
- **Lucide React** - Icon set
- **Radix UI** - Accessible primitives

### State & Data

- **React Context** - State management
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **SQLite** - Local file-based database

### Utilities

- **date-fns** - Date manipulation
- **jsPDF + AutoTable** - PDF generation
- **bcrypt** - Password hashing
- **jsonwebtoken** - JWT token management

### Quality Assurance

- **Jest** - Unit testing
- **React Testing Library** - Component testing
- **ESLint + Prettier** - Code quality

---

## Project Structure

```
omb-accounting/
├── .specify/                    # Spec-Kit documentation
│   ├── specs/                   # Project specifications
│   │   ├── phase-4-modules/     # Phase 4 detailed specs
│   │   └── phase-5-backend/     # Phase 5 backend specs
│   └── memory/
│       └── constitution.md      # Project governance
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── (dashboard)/         # Dashboard layout
│   │   │   ├── layout.tsx       # Main layout with providers
│   │   │   ├── page.tsx         # Dashboard home
│   │   │   ├── customers/       # Customer pages
│   │   │   ├── quotations/      # Quotation pages
│   │   │   ├── invoices/        # Invoice pages
│   │   │   ├── reports/         # Audit reports
│   │   │   ├── bank/            # Bank reconciliation
│   │   │   └── users/           # User management
│   │   └── api/                 # API routes (13 endpoints)
│   ├── components/
│   │   ├── ui/                  # shadcn/ui components
│   │   ├── auth/                # Authentication components
│   │   ├── dashboard/           # Dashboard components
│   │   ├── customers/           # Customer components
│   │   ├── quotations/          # Quotation components
│   │   ├── invoices/            # Invoice components
│   │   ├── reports/             # Report components
│   │   └── shared/              # Shared components
│   ├── contexts/                # React Context providers
│   ├── hooks/                   # Custom React hooks
│   ├── lib/                     # Utility functions
│   │   ├── database/            # SQLite database layer
│   │   ├── repositories/        # Data access layer (10 entities)
│   │   ├── services/            # Business logic layer (11 services)
│   │   ├── validations/         # Zod schemas
│   │   └── middleware/          # Auth & audit middleware
│   ├── types/                   # TypeScript definitions
│   └── utils/                   # Common utilities
├── docs/                        # Documentation
├── prisma/                      # Database schema (legacy)
└── scripts/                     # Database scripts
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun

### Installation

```bash
# Clone the repository
git clone https://github.com/sunny-tcc-consulting/omb-accounting.git
cd omb-accounting

# Install dependencies
npm install

# Initialize database
npm run db:init

# Start development server
npm run dev

# Open http://localhost:3000
```

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
npm run db:init      # Initialize database
npm run db:seed      # Seed database with sample data
```

---

## Usage

### Dashboard

View financial overview, key metrics, and recent transactions. Navigate to different sections from the sidebar.

### Customer Management

1. Go to **Customers** menu
2. Click **Add Customer** to create
3. Fill in details and save
4. Use search and filters to find customers

### Quotation Management

1. Go to **Quotations** menu
2. Click **Create Quotation**
3. Select customer, add line items
4. Set payment terms and validity
5. Save and preview/print

### Invoice Management

1. Go to **Invoices** menu
2. Click **Create Invoice**
3. Select customer, add line items
4. Set payment terms
5. Track payment status

### Quotation to Invoice

1. Open a quotation
2. Click **Convert to Invoice**
3. Preview and save

### Audit Reports

1. Go to **Reports** menu
2. Select report type (Trial Balance, Balance Sheet, P&L, etc.)
3. Set date range filters
4. View or export to PDF

### Bank Reconciliation

1. Go to **Bank** menu
2. View bank accounts and balances
3. Import bank statements
4. Match transactions automatically
5. Reconcile differences

### User Management (Admin)

1. Go to **Users** menu (admin only)
2. Create new users
3. Assign roles (admin, user, viewer, manager)
4. View session activity logs

---

## Development

### Code Standards

This project follows the [Project Constitution](.specify/memory/constitution.md):

- **TypeScript**: Strict mode enabled
- **Testing**: 80%+ coverage required
- **Commits**: Conventional commit format
- **Reviews**: Self-review before commit

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes and commit
git add .
git commit -m "feat(scope): add new feature"

# Push and create PR
git push origin feature/my-feature
```

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- quotation-utils.test.ts
```

### Spec-Kit Documentation

This project uses [Spec-Kit](https://clawhub.com) for structured development:

| Document            | Purpose                       |
| ------------------- | ----------------------------- |
| `spec.md`           | User stories and requirements |
| `clarifications.md` | Technical decisions           |
| `plan.md`           | Architecture and data models  |
| `tasks.md`          | Implementation tasks          |

**View Phase 4 specs**: [`.specify/specs/phase-4-modules/`](.specify/specs/phase-4-modules/)
**View Phase 5 specs**: [`.specify/specs/phase-5-backend/`](.specify/specs/phase-5-backend/)

---

## Testing

### Test Structure

```
src/
├── __tests__/              # Integration and unit tests
│   ├── pdf-generator.test.ts
│   ├── quotation-utils.test.ts
│   ├── report-context.test.tsx
│   └── InvoiceContext.test.tsx
├── components/
│   ├── ui/
│   │   └── __tests__/      # Component tests
│   │       ├── empty-state.test.tsx
│   │       ├── skeleton.test.tsx
│   │       └── notification.test.tsx
│   └── layout/
│       └── __tests__/      # Layout tests
│           └── navigation.test.tsx
├── lib/
│   ├── __tests__/          # Library tests
│   │   ├── a11y.test.ts
│   │   ├── api-backward-compatibility.test.ts
│   │   └── report-generator.test.ts
│   ├── repositories/
│   │   └── __tests__/      # Repository tests
│   │       └── repository-validation.test.ts
│   ├── services/
│   │   └── __tests__/      # Service tests
│   │       └── service-validation.test.ts
│   └── repositories/
│       └── __tests__/      # API integration tests
│           └── api-integration.test.ts
└── app/
    └── api/
        └── __tests__/      # API tests
            └── api-integration.test.ts
```

### Test Coverage

| Module              | Tests | Coverage |
| ------------------- | ----- | -------- |
| PDF Generator       | 6     | 100%     |
| Quotation Utils     | 21    | 100%     |
| Invoice Context     | 30    | 100%     |
| Report Context      | 7     | 100%     |
| Accessibility Utils | 7     | 100%     |
| API Integration     | 30    | 100%     |
| Repository Layer    | 17    | 100%     |
| Service Layer       | 18    | 100%     |

**Current**: 239/239 tests passing ✅

---

## API Endpoints

### Authentication

| Method | Endpoint           | Description       |
| ------ | ------------------ | ----------------- |
| POST   | /api/auth/login    | User login        |
| POST   | /api/auth/register | User registration |
| POST   | /api/auth/logout   | User logout       |
| GET    | /api/auth/me       | Get current user  |

### Customers

| Method | Endpoint           | Description        |
| ------ | ------------------ | ------------------ |
| GET    | /api/customers     | List all customers |
| POST   | /api/customers     | Create customer    |
| GET    | /api/customers/:id | Get customer by ID |
| PUT    | /api/customers/:id | Update customer    |
| DELETE | /api/customers/:id | Delete customer    |

### Quotations

| Method | Endpoint            | Description         |
| ------ | ------------------- | ------------------- |
| GET    | /api/quotations     | List all quotations |
| POST   | /api/quotations     | Create quotation    |
| GET    | /api/quotations/:id | Get quotation by ID |
| PUT    | /api/quotations/:id | Update quotation    |
| DELETE | /api/quotations/:id | Delete quotation    |

### Invoices

| Method | Endpoint          | Description       |
| ------ | ----------------- | ----------------- |
| GET    | /api/invoices     | List all invoices |
| POST   | /api/invoices     | Create invoice    |
| GET    | /api/invoices/:id | Get invoice by ID |
| PUT    | /api/invoices/:id | Update invoice    |
| DELETE | /api/invoices/:id | Delete invoice    |

### Bank

| Method | Endpoint                     | Description                |
| ------ | ---------------------------- | -------------------------- |
| GET    | /api/bank/accounts           | List bank accounts         |
| GET    | /api/bank/overview           | Bank overview & summary    |
| GET    | /api/bank/transactions       | List transactions          |
| GET    | /api/bank/reconciliation/:id | Get reconciliation history |

### Audit Logs

| Method | Endpoint        | Description                  |
| ------ | --------------- | ---------------------------- |
| GET    | /api/audit-logs | List audit logs with filters |

---

## Database Schema

The application uses SQLite with the following main tables:

| Table               | Description                    |
| ------------------- | ------------------------------ |
| `users`             | User accounts and roles        |
| `customers`         | Customer records               |
| `quotations`        | Quotation documents            |
| `invoices`          | Invoice documents              |
| `journal_entries`   | General ledger entries         |
| `bank_accounts`     | Bank account information       |
| `bank_statements`   | Bank statement records         |
| `bank_transactions` | Individual bank transactions   |
| `audit_logs`        | Audit trail for all operations |
| `sessions`          | User session management        |

---

## Documentation

### User Guide

- [User Documentation](docs/user-guide.md) - Complete user guide

### Developer Documentation

- [Developer Guide](docs/developer-guide.md) - Technical documentation
- [Database Schema](docs/DATABASE_SETUP.md) - SQLite schema and setup

### Phase Documentation

- [Phase 1-3 Summary](docs/phase-1-3-summary.md)
- [Phase 4 Specs](.specify/specs/phase-4-modules/)
- [Phase 5 Backend Specs](.specify/specs/phase-5-backend/)

---

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'feat(scope): add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Branch Strategy

| Branch      | Purpose            |
| ----------- | ------------------ |
| `main`      | Production-ready   |
| `openclaw`  | Development branch |
| `feature/*` | New features       |
| `bugfix/*`  | Bug fixes          |
| `docs/*`    | Documentation      |

---

## Project Status

### Phase 1-3: Complete ✅

- Core accounting features
- Customer, Quotation, Invoice management
- Audit Reports (Trial Balance, Balance Sheet, P&L, GL, Cash Flow)
- PDF generation
- UI/UX improvements

### Phase 4: Complete ✅

- User & Roles management with JWT authentication
- Role-based access control (admin, user, viewer, manager)
- Session management with auto-logout
- Bank Reconciliation module
- Permission system

### Phase 5: Complete (100%) ✅

| Task                           | Status  | Description                          |
| ------------------------------ | ------- | ------------------------------------ |
| 5.1 Database Setup             | ✅ Done | SQLite schema, migrations, seed data |
| 5.2 User Authentication        | ✅ Done | JWT, bcrypt, session management      |
| 5.3 Customer Management        | ✅ Done | Customer CRUD, repository, API       |
| 5.4 Quotation & Invoice        | ✅ Done | Quotation/Invoice persistence        |
| 5.5 Journal Entry & Bank       | ✅ Done | Journal entry, bank reconciliation   |
| 5.6 Audit Logging              | ✅ Done | Audit trail, logging middleware      |
| 5.7 API Backward Compatibility | ✅ Done | Verify all existing APIs work        |
| 5.8 Testing                    | ✅ Done | Unit and integration tests (239)     |
| 5.9 Documentation              | ✅ Done | API docs, database schema docs       |

**Progress**: 9/9 tasks complete (100%) 🎉

**Latest Commit**: `4ffe3ba` - Phase 5.9 Documentation complete

---

## License

MIT License - see [LICENSE](LICENSE) file.

---

## Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Lucide](https://lucide.dev/) - Icons
- [Spec-Kit](https://clawhub.com) - Structured development
- [SQLite](https://www.sqlite.org/) - Embedded database
- All contributors and users

---

**Built with ❤️ for SME accounting needs**
