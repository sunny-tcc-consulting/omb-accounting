# omb-accounting 📊

> A modern accounting web application for small and medium enterprises (SMEs).
> Built with Next.js 14, TypeScript, and shadcn/ui.

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

### Completed (Phase 1-3) ✅

| Module                   | Features                                                                          |
| ------------------------ | --------------------------------------------------------------------------------- |
| **Dashboard**            | Financial overview, key metrics, recent transactions, financial health indicators |
| **Customer Management**  | CRUD operations, search, filtering, validation                                    |
| **Quotation Management** | Create quotations, line items, PDF generation, validity periods                   |
| **Invoice Management**   | Create invoices, line items, tax/discount support, payment tracking               |
| **Quotation → Invoice**  | One-click conversion with automatic data transfer                                 |
| **Audit Reports**        | Trial Balance, Balance Sheet, P&L, General Ledger, Cash Flow                      |
| **PDF Generation**       | Professional PDFs for all documents with company branding                         |
| **UI/UX Polish**         | SummaryCards, ErrorDisplay, responsive design, accessibility                      |

### Phase 4 (Planned) 🚧

| Module                            | Status  |
| --------------------------------- | ------- |
| **Invoice Management (Enhanced)** | Pending |
| **Dashboard & Analytics**         | Pending |
| **Bank Reconciliation**           | Pending |
| **Multi-currency Support**        | Pending |
| **User & Roles**                  | Pending |
| **Email/Notification System**     | Pending |
| **Performance Optimization**      | Pending |
| **Security Hardening**            | Pending |

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

### Utilities

- **date-fns** - Date manipulation
- **jsPDF + AutoTable** - PDF generation
- **Faker.js** - Mock data generation

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
│   │   └── phase-4-modules/     # Phase 4 detailed specs
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
│   │   │   └── reports/         # Audit reports
│   │   └── api/                 # API routes
│   ├── components/
│   │   ├── ui/                  # shadcn/ui components
│   │   ├── dashboard/           # Dashboard components
│   │   ├── customers/           # Customer components
│   │   ├── quotations/          # Quotation components
│   │   ├── invoices/            # Invoice components
│   │   ├── reports/             # Report components
│   │   └── shared/              # Shared components
│   ├── contexts/                # React Context providers
│   ├── lib/                     # Utility functions
│   │   ├── pdf-generator.ts     # PDF generation
│   │   ├── quotation-utils.ts   # Quotation conversion
│   │   ├── validations.ts       # Zod schemas
│   │   └── utils.ts             # Common utilities
│   └── types/                   # TypeScript definitions
├── prisma/                      # Database schema
├── public/                      # Static assets
└── package.json
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
│   └── ui/
│       └── __tests__/      # Component tests
│           ├── empty-state.test.tsx
│           ├── skeleton.test.tsx
│           └── notification.test.tsx
└── lib/
    └── __tests__/          # Library tests
        └── a11y.test.ts
```

### Test Coverage

| Module              | Coverage |
| ------------------- | -------- |
| PDF Generator       | 100%     |
| Quotation Utils     | 100%     |
| Invoice Context     | 100%     |
| Report Context      | 100%     |
| Accessibility Utils | 100%     |

**Current**: 174/174 tests passing ✅

---

## Documentation

### User Guide

- [User Documentation](docs/user-guide.md) - Complete user guide

### Developer Documentation

- [Developer Guide](docs/developer-guide.md) - Technical documentation
- [API Reference](docs/api-reference.md) - API endpoints
- [Data Model](docs/data-model.md) - Database schema

### Phase Documentation

- [Phase 1-3 Summary](docs/phase-1-3-summary.md)
- [Phase 4 Specs](.specify/specs/phase-4-modules/)

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
- 174 tests passing

### Phase 4: In Planning 🚧

See [`.specify/specs/phase-4-modules/`](.specify/specs/phase-4-modules/) for detailed plans.

---

## License

MIT License - see [LICENSE](LICENSE) file.

---

## Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Lucide](https://lucide.dev/) - Icons
- [Spec-Kit](https://clawhub.com) - Structured development
- All contributors and users

---

**Built with ❤️ for SME accounting needs**
