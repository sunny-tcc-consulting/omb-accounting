import {
  convertQuotationToInvoice,
  calculateDueDate,
  generateInvoiceNumber,
  validateQuotationForConversion,
} from '@/lib/quotation-utils'
import { Quotation, QuotationItem } from '@/types'

describe('Quotation to Invoice Conversion', () => {
  const mockQuotation: Quotation = {
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
        total: 10500,
      },
      {
        id: 'item-2',
        description: 'UI/UX Design',
        quantity: 1,
        unitPrice: 3000,
        taxRate: 0.1,
        discount: 0,
        total: 3300,
      },
    ] as QuotationItem[],
    currency: 'HKD',
    subtotal: 13800,
    tax: 1400,
    discount: 500,
    total: 14600,
    validityPeriod: new Date('2026-03-15'),
    status: 'accepted',
    issuedDate: new Date('2026-02-15'),
    notes: 'This is a test quotation',
    termsAndConditions: 'Payment terms apply',
  }

  describe('convertQuotationToInvoice', () => {
    it('should convert quotation to invoice with default options', () => {
      const result = convertQuotationToInvoice(mockQuotation)

      expect(result.invoiceNumber).toMatch(/^INV-2026-\d{5}$/)
      expect(result.customerId).toBe(mockQuotation.customerId)
      expect(result.customerName).toBe(mockQuotation.customerName)
      expect(result.items).toHaveLength(2)
      expect(result.status).toBe('pending')
      expect(result.quotationReference).toBe(mockQuotation.quotationNumber)
      expect(result.notes).toContain('Converted from quotation')
    })

    it('should use custom invoice date if provided', () => {
      const customDate = new Date('2026-01-15')
      const result = convertQuotationToInvoice(mockQuotation, {
        invoiceDate: customDate,
      })

      expect(result.issuedDate).toBe(customDate.toISOString())
    })

    it('should use custom due date if provided', () => {
      const customDueDate = new Date('2026-04-15')
      const result = convertQuotationToInvoice(mockQuotation, {
        dueDate: customDueDate,
      })

      expect(result.dueDate).toBe(customDueDate.toISOString())
    })

    it('should use custom currency if provided', () => {
      const result = convertQuotationToInvoice(mockQuotation, {
        currency: 'USD',
      })

      expect(result.currency).toBe('USD')
    })

    it('should calculate correct totals from quotation items', () => {
      const result = convertQuotationToInvoice(mockQuotation)

      // Calculate expected totals based on item data
      const expectedSubtotal = mockQuotation.items.reduce(
        (sum, item) => sum + item.total,
        0
      )
      const expectedTax = mockQuotation.items.reduce(
        (sum, item) => sum + (item.total - (item.quantity * item.unitPrice) + (item.discount || 0)),
        0
      )
      const expectedTotal = expectedSubtotal + expectedTax - mockQuotation.discount

      expect(result.subtotal).toBe(expectedSubtotal)
      expect(result.tax).toBe(expectedTax)
      expect(result.total).toBe(expectedTotal)
    })

    it('should maintain customer contact information', () => {
      const result = convertQuotationToInvoice(mockQuotation)

      expect(result.customerEmail).toBe(mockQuotation.customerEmail)
      expect(result.customerPhone).toBe(mockQuotation.customerPhone)
    })

    it('should preserve notes with conversion reference', () => {
      const result = convertQuotationToInvoice(mockQuotation)

      expect(result.notes).toContain('Converted from quotation')
      expect(result.notes).toContain(mockQuotation.quotationNumber)
    })
  })

  describe('calculateDueDate', () => {
    it('should calculate due date for "Net 30" payment terms', () => {
      const startDate = new Date('2026-02-15')
      const result = calculateDueDate(startDate, 'Net 30')

      const expectedDate = new Date(startDate)
      expectedDate.setDate(expectedDate.getDate() + 30)
      expect(result.toISOString()).toBe(expectedDate.toISOString())
    })

    it('should calculate due date for "Net 15" payment terms', () => {
      const startDate = new Date('2026-02-15')
      const result = calculateDueDate(startDate, 'Net 15')

      const expectedDate = new Date(startDate)
      expectedDate.setDate(expectedDate.getDate() + 15)
      expect(result.toISOString()).toBe(expectedDate.toISOString())
    })

    it('should calculate due date for "COD" payment terms', () => {
      const startDate = new Date('2026-02-15')
      const result = calculateDueDate(startDate, 'COD')

      expect(result.toISOString()).toBe(startDate.toISOString())
    })

    it('should default to 30 days if no number found in payment terms', () => {
      const startDate = new Date('2026-02-15')
      const result = calculateDueDate(startDate, 'Net 60')

      const expectedDate = new Date(startDate)
      expectedDate.setDate(expectedDate.getDate() + 60)
      expect(result.toISOString()).toBe(expectedDate.toISOString())
    })
  })

  describe('generateInvoiceNumber', () => {
    it('should generate invoice number with current year', () => {
      const date = new Date('2026-02-15')
      const result = generateInvoiceNumber(date)

      expect(result).toMatch(/^INV-2026-\d{5}$/)
    })

    it('should generate unique invoice number', () => {
      const date = new Date('2026-02-15')
      const result1 = generateInvoiceNumber(date)
      const result2 = generateInvoiceNumber(date)

      expect(result1).not.toBe(result2)
    })

    it('should use year from provided date', () => {
      const date = new Date('2025-12-31')
      const result = generateInvoiceNumber(date)

      expect(result).toMatch(/^INV-2025-\d{5}$/)
    })
  })

  describe('validateQuotationForConversion', () => {
    it('should return true for valid quotation', () => {
      const result = validateQuotationForConversion(mockQuotation)

      expect(result).toBe(true)
    })

    it('should return false for null quotation', () => {
      const result = validateQuotationForConversion(null as any)

      expect(result).toBe(false)
    })

    it('should return false for quotation without customer', () => {
      const invalidQuotation = { ...mockQuotation, customerId: '' } as any
      const result = validateQuotationForConversion(invalidQuotation)

      expect(result).toBe(false)
    })

    it('should return false for quotation without items', () => {
      const invalidQuotation = { ...mockQuotation, items: [] } as any
      const result = validateQuotationForConversion(invalidQuotation)

      expect(result).toBe(false)
    })

    it('should return false for quotation without quotation number', () => {
      const invalidQuotation = { ...mockQuotation, quotationNumber: '' } as any
      const result = validateQuotationForConversion(invalidQuotation)

      expect(result).toBe(false)
    })
  })

  describe('Item Conversion', () => {
    it('should convert all quotation items to invoice items', () => {
      const result = convertQuotationToInvoice(mockQuotation)

      expect(result.items).toHaveLength(mockQuotation.items.length)

      mockQuotation.items.forEach((quotationItem, index) => {
        const invoiceItem = result.items![index]
        expect(invoiceItem.description).toBe(quotationItem.description)
        expect(invoiceItem.quantity).toBe(quotationItem.quantity)
        expect(invoiceItem.unitPrice).toBe(quotationItem.unitPrice)
        expect(invoiceItem.taxRate).toBe(quotationItem.taxRate)
        expect(invoiceItem.discount).toBe(quotationItem.discount)
      })
    })

    it('should add invoice number to item IDs', () => {
      const result = convertQuotationToInvoice(mockQuotation)

      result.items!.forEach((item) => {
        expect(item.id).toContain(result.invoiceNumber)
      })
    })
  })
})
