import { generateInvoicePDF, generateQuotationPDF } from '@/lib/pdf-generator'
import { jsPDF } from 'jspdf'

// Mock jsPDF
global.jsPDF = jsPDF as any

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
  }

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
  }

  describe('generateInvoicePDF', () => {
    it('should generate a PDF document', () => {
      const doc = generateInvoicePDF(mockInvoice)

      expect(doc).toBeDefined()
      expect(typeof doc.setProperties).toBe('function')
      expect(typeof doc.setFontSize).toBe('function')
      expect(typeof doc.text).toBe('function')
      expect(typeof doc.autoTable).toBe('function')
    })

    it('should include company information', () => {
      const doc = generateInvoicePDF(mockInvoice)

      // Check that company name is set
      expect(doc.setProperties).toHaveBeenCalled()
      const setPropertiesCall = doc.setProperties as jest.Mock
      const properties = setPropertiesCall.mock.calls[0][0]
      expect(properties.title).toContain('INVOICE')
    })

    it('should include invoice number', () => {
      const doc = generateInvoicePDF(mockInvoice)

      // Check that autoTable is called
      expect(doc.autoTable).toHaveBeenCalled()
      const autoTableCall = doc.autoTable as jest.Mock
      const tableConfig = autoTableCall.mock.calls[0][0]
      expect(tableConfig).toBeDefined()
    })

    it('should include customer details', () => {
      const doc = generateInvoicePDF(mockInvoice)

      // Check that text is called for customer details
      expect(doc.text).toHaveBeenCalled()
      const textCalls = doc.text as jest.Mock
      const textArgs = textCalls.mock.calls.flat()
      expect(textArgs.some((arg: string) => arg.includes(mockInvoice.customerName))).toBe(
        true
      )
    })

    it('should include invoice items', () => {
      const doc = generateInvoicePDF(mockInvoice)

      // Check that autoTable is called
      expect(doc.autoTable).toHaveBeenCalled()
      const autoTableCall = doc.autoTable as jest.Mock
      const tableConfig = autoTableCall.mock.calls[0][0]

      // Check that columns are defined
      expect(tableConfig).toBeDefined()
      expect(tableConfig.columns).toBeDefined()
    })

    it('should include totals section', () => {
      const doc = generateInvoicePDF(mockInvoice)

      // Check that text is called for totals
      expect(doc.text).toHaveBeenCalled()
      const textCalls = doc.text as jest.Mock
      const textArgs = textCalls.mock.calls.flat()
      expect(
        textArgs.some((arg: string) => arg.includes('Total: 14900.00'))
      ).toBe(true)
    })

    it('should include payment terms', () => {
      const doc = generateInvoicePDF(mockInvoice)

      // Check that text is called for payment terms
      expect(doc.text).toHaveBeenCalled()
      const textCalls = doc.text as jest.Mock
      const textArgs = textCalls.mock.calls.flat()
      expect(
        textArgs.some((arg: string) => arg.includes('Due within 30 days'))
      ).toBe(true)
    })
  })

  describe('generateQuotationPDF', () => {
    it('should generate a PDF document', () => {
      const doc = generateQuotationPDF(mockQuotation)

      expect(doc).toBeDefined()
      expect(typeof doc.setProperties).toBe('function')
      expect(typeof doc.setFontSize).toBe('function')
      expect(typeof doc.text).toBe('function')
      expect(typeof doc.autoTable).toBe('function')
    })

    it('should include quotation number', () => {
      const doc = generateQuotationPDF(mockQuotation)

      // Check that autoTable is called
      expect(doc.autoTable).toHaveBeenCalled()
      const autoTableCall = doc.autoTable as jest.Mock
      const tableConfig = autoTableCall.mock.calls[0][0]
      expect(tableConfig).toBeDefined()
    })

    it('should include customer details', () => {
      const doc = generateQuotationPDF(mockQuotation)

      // Check that text is called for customer details
      expect(doc.text).toHaveBeenCalled()
      const textCalls = doc.text as jest.Mock
      const textArgs = textCalls.mock.calls.flat()
      expect(textArgs.some((arg: string) => arg.includes(mockQuotation.customerName))).toBe(
        true
      )
    })

    it('should include quotation items', () => {
      const doc = generateQuotationPDF(mockQuotation)

      // Check that autoTable is called
      expect(doc.autoTable).toHaveBeenCalled()
      const autoTableCall = doc.autoTable as jest.Mock
      const tableConfig = autoTableCall.mock.calls[0][0]

      // Check that columns are defined
      expect(tableConfig).toBeDefined()
      expect(tableConfig.columns).toBeDefined()
    })

    it('should include validity period', () => {
      const doc = generateQuotationPDF(mockQuotation)

      // Check that text is called for validity period
      expect(doc.text).toHaveBeenCalled()
      const textCalls = doc.text as jest.Mock
      const textArgs = textCalls.mock.calls.flat()
      expect(
        textArgs.some((arg: string) => arg.includes('Valid until'))
      ).toBe(true)
    })

    it('should include notes and terms', () => {
      const doc = generateQuotationPDF(mockQuotation)

      // Check that text is called for notes
      expect(doc.text).toHaveBeenCalled()
      const textCalls = doc.text as jest.Mock
      const textArgs = textCalls.mock.calls.flat()
      expect(textArgs.some((arg: string) => arg.includes('This is a test quotation'))).toBe(
        true
      )
    })
  })

  describe('PDF Structure', () => {
    it('should follow consistent structure for both documents', () => {
      const invoiceDoc = generateInvoicePDF(mockInvoice)
      const quotationDoc = generateQuotationPDF(mockQuotation)

      // Both should have setProperties method
      expect(typeof invoiceDoc.setProperties).toBe('function')
      expect(typeof quotationDoc.setProperties).toBe('function')

      // Both should have text method
      expect(typeof invoiceDoc.text).toBe('function')
      expect(typeof quotationDoc.text).toBe('function')

      // Both should have autoTable method
      expect(typeof invoiceDoc.autoTable).toBe('function')
      expect(typeof quotationDoc.autoTable).toBe('function')
    })

    it('should handle different currencies', () => {
      const usdInvoice = { ...mockInvoice, currency: 'USD', total: 1900 }
      const usdDoc = generateInvoicePDF(usdInvoice)

      expect(usdDoc).toBeDefined()
    })

    it('should handle different payment statuses', () => {
      const draftInvoice = { ...mockInvoice, status: 'draft' }
      const draftDoc = generateInvoicePDF(draftInvoice)

      expect(draftDoc).toBeDefined()
    })
  })
})
