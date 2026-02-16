# omb-accounting 📊

A modern accounting web application designed for small and medium enterprises (SMEs). Built with Next.js 14, TypeScript, and shadcn/ui, this application provides a complete frontend solution for managing customers, quotations, invoices, and PDF generation.

## ✨ Features

### Dashboard 📈
- Financial overview with total income, expenses, and net income
- Recent transactions list
- Financial health indicators
- Responsive sidebar navigation

### Customer Management 👥
- Create, edit, and delete customers
- Customer list with search and filtering
- Customer detail pages
- Customer form with validation
- Mock data generation (15+ customers)

### Quotation Management 📝
- Create quotations with customer selection
- Add line items with description, quantity, unit price, and total
- Set quotation validity period
- Generate unique quotation numbers
- Preview and print quotations
- Quotation list with search and filtering
- Quotation detail and edit pages

### Invoice Management 💰
- Create invoices from scratch
- Automatic invoice number generation
- Customer selection with "Create New" option
- Line item management with tax and discount support
- Payment status tracking (Paid, Partial, Pending, Overdue)
- Invoice list with comprehensive filtering and search
- Invoice detail and edit pages

### Quotation to Invoice Conversion 🔄
- One-click quotation to invoice conversion
- Automatic data transfer (items, customer, payment terms)
- Invoice preview before saving
- Automatic invoice number generation
- Quotation reference tracking

### PDF Generation 📄
- Professional PDF generation for quotations and invoices
- Line items table with autoTable
- Company header and footer
- Automatic totals calculation
- Payment status indicator
- Page numbers
- Download PDF functionality

## 🛠️ Tech Stack

### Frontend Framework
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety and better developer experience
- **Tailwind CSS** - Utility-first CSS framework

### UI Components
- **shadcn/ui** - Modern, accessible component library
- **Radix UI** - Unstyled, accessible component primitives
- **Lucide React** - Beautiful, consistent icon set

### State Management
- **React Context API** - Simple state management for the application

### Data & Utilities
- **Faker.js** - Realistic mock data generation
- **React Hook Form + Zod** - Form validation
- **date-fns** - Date manipulation
- **jsPDF + jsPDF-AutoTable** - PDF generation

## 📁 Project Structure

```
omb-accounting/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (dashboard)/        # Dashboard layout
│   │   │   ├── layout.tsx      # Main layout with providers
│   │   │   ├── page.tsx        # Dashboard home
│   │   │   ├── customers/      # Customer pages
│   │   │   ├── quotations/     # Quotation pages
│   │   │   └── invoices/       # Invoice pages
│   │   └── layout.tsx          # Root layout
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── dashboard/          # Dashboard components
│   │   ├── customers/          # Customer components
│   │   ├── quotations/         # Quotation components
│   │   ├── invoices/           # Invoice components
│   │   └── skeletons/          # Loading skeletons
│   ├── contexts/               # React Context providers
│   │   ├── DataContext.tsx
│   │   ├── CustomerContext.tsx
│   │   ├── QuotationContext.tsx
│   │   └── InvoiceContext.tsx
│   ├── lib/
│   │   ├── mock-data.ts        # Mock data generation
│   │   ├── utils.ts            # Utility functions
│   │   ├── validations.ts      # Zod schemas
│   │   ├── quotation-utils.ts  # Quotation conversion
│   │   └── pdf-generator.ts    # PDF generation
│   └── types/
│       └── index.ts            # TypeScript type definitions
├── public/                     # Static assets
└── package.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- npm, yarn, pnpm, or bun package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd omb-accounting
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📖 Usage

### Dashboard
- View financial overview
- See recent transactions
- Navigate to different sections

### Customer Management
1. Go to **Customers** menu
2. Click **Add Customer** to create a new customer
3. Fill in the customer details (name, email, phone, company, address, tax ID)
4. Click **Save** to create the customer
5. View customer list, search, filter, and edit customers

### Quotation Management
1. Go to **Quotations** menu
2. Click **Create Quotation** to start a new quotation
3. Select a customer or create a new one
4. Add line items with description, quantity, unit price, and discount
5. Set payment terms and validity period
6. Click **Save** to create the quotation
7. View, edit, or delete quotations
8. Preview and print quotations

### Invoice Management
1. Go to **Invoices** menu
2. Click **Create Invoice** to start a new invoice
3. Select a customer or create a new one
4. Add line items with description, quantity, unit price, tax rate, and discount
5. Set payment terms and due date
6. Click **Save** to create the invoice
7. View, edit, or delete invoices
8. Track payment status (Paid, Partial, Pending, Overdue)

### Quotation to Invoice Conversion
1. Go to a quotation in the **Quotations** list
2. Click **轉為發票** (Convert to Invoice)
3. Preview the converted invoice
4. Click **保存發票** (Save Invoice) to create the invoice
5. The invoice will be automatically saved to the invoices list

### PDF Generation
1. Open any quotation or invoice
2. Click **Download PDF** button
3. The PDF will be downloaded with a professional layout
4. Or click **Print** to print directly

## 🎨 Customization

### Company Information
Edit `src/lib/pdf-generator.ts` to update company details:
```typescript
const companyInfo = {
  name: 'Your Company Name',
  address: '123 Business Road, City',
  email: 'info@yourcompany.com',
  phone: '+1 234 567 8900',
};
```

### Data Generation
Customize mock data in `src/lib/mock-data.ts`:
```typescript
export function generateCustomers(count: number): Customer[] {
  // Your custom data generation logic
}
```

### Styling
Customize Tailwind CSS classes in component files:
```tsx
<div className="max-w-4xl mx-auto bg-white p-8">
  {/* Your component */}
</div>
```

## 🧪 Testing

The application currently uses mock data and doesn't have backend integration. To test:

1. **Customer Management**: Create, view, edit, and delete customers
2. **Quotation Management**: Create quotations and convert them to invoices
3. **Invoice Management**: Create invoices and track payment status
4. **PDF Generation**: Download and print PDFs
5. **Search & Filter**: Test search functionality across all lists

## 📝 Code Structure

### Context Providers
- **DataContext**: Manages transactions and financial data
- **CustomerContext**: Manages customer data and operations
- **QuotationContext**: Manages quotation data and operations
- **InvoiceContext**: Manages invoice data and operations

### Component Organization
- **Pages**: Route-level components in `src/app/`
- **Components**: Reusable components in `src/components/`
- **Skeletons**: Loading state components in `src/components/skeletons/`

### Utility Functions
- **mock-data.ts**: Generates realistic test data
- **utils.ts**: Common utility functions
- **validations.ts**: Zod schemas for form validation
- **quotation-utils.ts**: Quotation conversion logic
- **pdf-generator.ts**: PDF generation functions

## 🔮 Future Enhancements

- [ ] Backend API integration
- [ ] Database implementation
- [ ] Real authentication
- [ ] Transaction history with filters
- [ ] Financial reports and charts
- [ ] Category management
- [ ] Email notifications
- [ ] Multi-currency support
- [ ] API documentation

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

- **omb-accounting Team**

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- shadcn/ui for the beautiful components
- Lucide for the icon set
- All contributors and users

---

**Note**: This is a frontend prototype with mock data. No backend or database is currently implemented.
