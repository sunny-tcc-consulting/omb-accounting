// Mock jsPDF-AutoTable
jest.mock('jspdf-autotable', () => {
  return jest.fn((data, doc) => {
    if (doc && doc.lastAutoTable) {
      doc.lastAutoTable.finalY = 120;
    }
    return doc;
  });
});

// Import the functions to test
import { generateInvoicePDF, generateQuotationPDF } from '@/lib/pdf-generator';

describe('PDF Generator', () => {
  const mockInvoice = {
    id: 'inv-1',
    invoiceNumber: 'INV-2026-001',
    customerId: 'cust-1',
    customerName: 'Test Customer',
    customerEmail: 'test@example.com',
    customerPhone: '+852-12345678',
    items: [
      {
        id: 'item-1',
        description: 'Web Development',
        quantity: 2,
        unitPrice: 5000,
        taxRate: 0.1,
        discount: 500,
        total: 9500,
      },
    ],
    currency: 'HKD',
    subtotal: 14000,
    tax: 1400,
    discount: 500,
    total: 14900,
    paymentTerms: 'Due within 30 days',
    dueDate: new Date('2026-03-15'),
    status: 'paid',
    issuedDate: new Date('2026-02-15'),
    paidDate: new Date('2026-02-20'),
    amountPaid: 14900,
    amountRemaining: 0,
    notes: 'Thank you for your business!',
  };

  const mockQuotation = {
    id: 'q-1',
    quotationNumber: 'QT-2026-001',
    customerId: 'cust-1',
    customerName: 'Test Customer',
    customerEmail: 'test@example.com',
    customerPhone: '+852-12345678',
    items: [
      {
        id: 'item-1',
        description: 'Web Development',
        quantity: 2,
        unitPrice: 5000,
        taxRate: 0.1,
        discount: 500,
        total: 9500,
      },
    ],
    currency: 'HKD',
    subtotal: 14000,
    tax: 1400,
    discount: 500,
    total: 14900,
    validityPeriod: new Date('2026-03-15'),
    status: 'accepted',
    issuedDate: new Date('2026-02-15'),
    notes: 'This is a test quotation',
    termsAndConditions: 'Payment terms apply',
  };

  describe('generateInvoicePDF', () => {
    it('should generate a PDF document', () => {
      const doc = generateInvoicePDF(mockInvoice);

      expect(doc).toBeDefined();
      expect(typeof doc.setProperties).toBe('function');
      expect(typeof doc.setFontSize).toBe('function');
      expect(typeof doc.text).toBe('function');
      expect(typeof doc.autoTable).toBe('function');
    });

    it('should handle different currencies', () => {
      const usdInvoice = { ...mockInvoice, currency: 'USD', total: 1900 };
      const usdDoc = generateInvoicePDF(usdInvoice);

      expect(usdDoc).toBeDefined();
    });

    it('should handle different payment statuses', () => {
      const draftInvoice = { ...mockInvoice, status: 'draft' };
      const draftDoc = generateInvoicePDF(draftInvoice);

      expect(draftDoc).toBeDefined();
    });
  });

  describe('generateQuotationPDF', () => {
    it('should generate a PDF document', () => {
      const doc = generateQuotationPDF(mockQuotation);

      expect(doc).toBeDefined();
      expect(typeof doc.setProperties).toBe('function');
      expect(typeof doc.setFontSize).toBe('function');
      expect(typeof doc.text).toBe('function');
      expect(typeof doc.autoTable).toBe('function');
    });

    it('should handle different currencies', () => {
      const usdQuotation = { ...mockQuotation, currency: 'USD', total: 1900 };
      const usdDoc = generateQuotationPDF(usdQuotation);

      expect(usdDoc).toBeDefined();
    });

    it('should handle different quotation statuses', () => {
      const draftQuotation = { ...mockQuotation, status: 'draft' };
      const draftDoc = generateQuotationPDF(draftQuotation);

      expect(draftDoc).toBeDefined();
    });
  });
});
