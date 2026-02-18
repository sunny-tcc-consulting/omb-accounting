import React, { useContext } from 'react'
import { render, screen, fireEvent, waitFor, renderHook } from '@testing-library/react'
import { InvoiceContext } from '@/contexts/InvoiceContext'
import { InvoiceFormData } from '@/types'

// Simplified test data
const testInvoice = {
  id: 'test-1',
  invoiceNumber: 'INV-2026-001',
  customerId: 'cust-1',
  customerName: 'Test Customer',
  customerEmail: 'test@example.com',
  customerPhone: '+852-12345678',
  items: [
    {
      id: 'item-1',
      description: 'Service 1',
      quantity: 2,
      unitPrice: 100,
      taxRate: 0.1,
      discount: 0,
      total: 220,
    },
  ],
  currency: 'HKD',
  subtotal: 200,
  tax: 20,
  discount: 0,
  total: 220,
  paymentTerms: 'Due within 30 days',
  dueDate: new Date('2026-03-15'),
  status: 'pending',
  issuedDate: new Date('2026-02-15'),
  amountPaid: 0,
  amountRemaining: 220,
}

// Test context value
const testContextValue = {
  invoices: [testInvoice, { ...testInvoice, id: 'test-2', invoiceNumber: 'INV-2026-002', customerId: 'cust-2' }, { ...testInvoice, id: 'test-3', invoiceNumber: 'INV-2026-003', customerId: 'cust-3' }],
  loading: false,
  error: null,
  addInvoice: jest.fn(async (data: InvoiceFormData) => {
    const items = data.items || []
    const subtotal = items.reduce((sum, item) => sum + (item.total || 0), 0)
    const tax = subtotal * 0.1
    const discount = items.reduce((sum, item) => sum + (item.discount || 0), 0)
    const total = subtotal + tax - discount

    const newInvoice = {
      ...data,
      id: `new-test-${Date.now()}`,
      invoiceNumber: `INV-2026-${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`,
      customerId: data.customerId || 'cust-2',
      customerName: data.customerName || 'Test Customer 2',
      customerEmail: data.customerEmail || 'test2@example.com',
      items,
      currency: 'HKD',
      subtotal,
      tax,
      discount,
      total,
      paymentTerms: 'Due within 30 days',
      dueDate: new Date(),
      status: 'pending',
      issuedDate: new Date(),
      amountPaid: 0,
      amountRemaining: total,
    }

    const updatedInvoices = [...testContextValue.invoices, newInvoice]
    testContextValue.invoices = updatedInvoices

    return newInvoice
  }),
  updateInvoice: jest.fn(async (id: string, updates: any) => {
    const updated = { ...testInvoice, ...updates }
    // Set paidDate when status is paid
    if (updated.status === 'paid') {
      updated.paidDate = new Date()
    }
    const updatedInvoices = [...testContextValue.invoices]
    const index = updatedInvoices.findIndex((inv) => inv.id === id)
    if (index !== -1) {
      updatedInvoices[index] = updated
    }
    testContextValue.invoices = updatedInvoices
    return updated
  }),
  deleteInvoice: jest.fn(async () => {
    const updatedInvoices = testContextValue.invoices.filter((inv) => inv.id !== 'test-1')
    testContextValue.invoices = updatedInvoices
    return
  }),
  getFilteredInvoices: jest.fn((filters?: any) => {
    if (!filters) return [...testContextValue.invoices]
    return testContextValue.invoices.filter((inv) => {
      if (filters.status && inv.status !== filters.status) return false
      if (filters.customerId && inv.customerId !== filters.customerId) return false
      return true
    })
  }),
  getInvoiceById: jest.fn((id: string) => testInvoice.id === id ? testInvoice : undefined),
  generateInvoiceNumber: jest.fn(() => `INV-2026-${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`),
  markAsPaid: jest.fn(async (id: string, amount: number) => {
    const updated = {
      ...testInvoice,
      amountPaid: (testInvoice.amountPaid || 0) + amount,
      amountRemaining: testInvoice.total - ((testInvoice.amountPaid || 0) + amount),
      status: amount >= testInvoice.total ? 'paid' : 'partial',
      paidDate: amount >= testInvoice.total ? new Date() : undefined,
    }
    const updatedInvoices = [...testContextValue.invoices]
    const index = updatedInvoices.findIndex((inv) => inv.id === id)
    if (index !== -1) {
      updatedInvoices[index] = updated
    }
    testContextValue.invoices = updatedInvoices
    return updated
  }),
  updatePaymentStatus: jest.fn(async (id: string, status: any) => {
    const isPaid = status === 'paid' || status === 'partial'
    const updated = {
      ...testInvoice,
      status,
      paidDate: isPaid ? new Date() : undefined,
      amountPaid: isPaid ? testInvoice.total : 0,
      amountRemaining: isPaid ? 0 : testInvoice.total,
    }
    const updatedInvoices = [...testContextValue.invoices]
    const index = updatedInvoices.findIndex((inv) => inv.id === id)
    if (index !== -1) {
      updatedInvoices[index] = updated
    }
    testContextValue.invoices = updatedInvoices
    return updated
  }),
}

// Test component that uses InvoiceContext
function TestComponent() {
  const { invoices, loading, error, getInvoiceById, addInvoice, updateInvoice, deleteInvoice, markAsPaid, getFilteredInvoices } = useContext(InvoiceContext)
  return (
    <div>
      <div data-testid="invoices-count">{invoices ? invoices.length : 0}</div>
      <div data-testid="loading">{loading ? 'loading' : 'loaded'}</div>
      <div data-testid="error">{error || 'no-error'}</div>
    </div>
  )
}

describe('InvoiceContext', () => {
  beforeEach(() => {
    // Reset test context value before each test
    testContextValue.invoices = [testInvoice, { ...testInvoice, id: 'test-2', invoiceNumber: 'INV-2026-002', customerId: 'cust-2' }, { ...testInvoice, id: 'test-3', invoiceNumber: 'INV-2026-003', customerId: 'cust-3' }]
    testContextValue.loading = false
    testContextValue.error = null
    testContextValue.addInvoice.mockClear()
    testContextValue.updateInvoice.mockClear()
    testContextValue.deleteInvoice.mockClear()
    testContextValue.getFilteredInvoices.mockClear()
    testContextValue.getInvoiceById.mockClear()
    testContextValue.generateInvoiceNumber.mockClear()
    testContextValue.markAsPaid.mockClear()
    testContextValue.updatePaymentStatus.mockClear()
  })

  describe('Initial State', () => {
    it('should have invoices in the context', () => {
      render(
        <InvoiceContext.Provider value={testContextValue}>
          <TestComponent />
        </InvoiceContext.Provider>
      )

      const invoicesCount = screen.getByTestId('invoices-count')
      expect(invoicesCount.textContent).toBe('3')

      const loading = screen.getByTestId('loading')
      expect(loading.textContent).toBe('loaded')

      const error = screen.getByTestId('error')
      expect(error.textContent).toBe('no-error')
    })

    it('should have loading state as false initially', () => {
      render(
        <InvoiceContext.Provider value={testContextValue}>
          <TestComponent />
        </InvoiceContext.Provider>
      )

      const loading = screen.getByTestId('loading')
      expect(loading.textContent).toBe('loaded')
    })

    it('should have no error initially', () => {
      render(
        <InvoiceContext.Provider value={testContextValue}>
          <TestComponent />
        </InvoiceContext.Provider>
      )

      const error = screen.getByTestId('error')
      expect(error.textContent).toBe('no-error')
    })
  })

  describe('getInvoiceById', () => {
    it('should return the correct invoice by ID', () => {
      const { result } = renderHook(() => useContext(InvoiceContext), {
        wrapper: ({ children }) => (
          <InvoiceContext.Provider value={testContextValue}>
            {children}
          </InvoiceContext.Provider>
        ),
      })

      const invoice = result.current.getInvoiceById('test-1')

      expect(invoice).toBeDefined()
      expect(invoice?.id).toBe('test-1')
      expect(invoice?.invoiceNumber).toBe('INV-2026-001')
    })

    it('should return undefined for non-existent ID', () => {
      const { result } = renderHook(() => useContext(InvoiceContext), {
        wrapper: ({ children }) => (
          <InvoiceContext.Provider value={testContextValue}>
            {children}
          </InvoiceContext.Provider>
        ),
      })

      const invoice = result.current.getInvoiceById('non-existent')

      expect(invoice).toBeUndefined()
    })
  })

  describe('addInvoice', () => {
    it('should add a new invoice', async () => {
      const { result } = renderHook(() => useContext(InvoiceContext), {
        wrapper: ({ children }) => (
          <InvoiceContext.Provider value={testContextValue}>
            {children}
          </InvoiceContext.Provider>
        ),
      })

      const newInvoice = await result.current.addInvoice({
        customerId: 'cust-2',
        customerName: 'Test Customer 2',
        customerEmail: 'test2@example.com',
        items: [
          {
            id: 'item-1',
            description: 'Service 2',
            quantity: 1,
            unitPrice: 500,
            taxRate: 0,
            discount: 0,
            total: 500,
          },
        ],
      })

      expect(newInvoice).toBeDefined()
      expect(newInvoice?.id).toBeDefined()
      expect(newInvoice?.invoiceNumber).toMatch(/^INV-2026-\d{5}$/)
      expect(result.current.invoices).toHaveLength(4)
    })

    it('should calculate totals correctly', async () => {
      const { result } = renderHook(() => useContext(InvoiceContext), {
        wrapper: ({ children }) => (
          <InvoiceContext.Provider value={testContextValue}>
            {children}
          </InvoiceContext.Provider>
        ),
      })

      const newInvoice = await result.current.addInvoice({
        customerId: 'cust-3',
        customerName: 'Test Customer 3',
        customerEmail: 'test3@example.com',
        items: [
          {
            id: 'item-1',
            description: 'Service 3',
            quantity: 2,
            unitPrice: 300,
            taxRate: 0.1,
            discount: 100,
            total: 500,
          },
          {
            id: 'item-2',
            description: 'Service 4',
            quantity: 1,
            unitPrice: 200,
            taxRate: 0.1,
            discount: 0,
            total: 220,
          },
        ],
      })

      expect(newInvoice?.subtotal).toBe(720)
      expect(newInvoice?.tax).toBe(72)
      expect(newInvoice?.discount).toBe(100)
      expect(newInvoice?.total).toBe(692)
    })
  })

  describe('updateInvoice', () => {
    it('should update an existing invoice', async () => {
      const { result } = renderHook(() => useContext(InvoiceContext), {
        wrapper: ({ children }) => (
          <InvoiceContext.Provider value={testContextValue}>
            {children}
          </InvoiceContext.Provider>
        ),
      })

      const updatedInvoice = await result.current.updateInvoice('test-1', { customerName: 'Updated Customer' })

      expect(updatedInvoice).toBeDefined()
      expect(updatedInvoice?.customerName).toBe('Updated Customer')
      expect(result.current.invoices[0].customerName).toBe('Updated Customer')
    })

    it('should update invoice status', async () => {
      const { result } = renderHook(() => useContext(InvoiceContext), {
        wrapper: ({ children }) => (
          <InvoiceContext.Provider value={testContextValue}>
            {children}
          </InvoiceContext.Provider>
        ),
      })

      const updatedInvoice = await result.current.updateInvoice('test-1', { status: 'paid' })

      expect(updatedInvoice?.status).toBe('paid')
      expect(updatedInvoice?.paidDate).toBeDefined()
      expect(updatedInvoice?.paidDate).toBeInstanceOf(Date)
      expect(result.current.invoices[0].status).toBe('paid')
      expect(result.current.invoices[0].paidDate).toBeDefined()
      expect(result.current.invoices[0].paidDate).toBeInstanceOf(Date)
    })
  })

  describe('deleteInvoice', () => {
    it('should delete an invoice', async () => {
      const { result } = renderHook(() => useContext(InvoiceContext), {
        wrapper: ({ children }) => (
          <InvoiceContext.Provider value={testContextValue}>
            {children}
          </InvoiceContext.Provider>
        ),
      })

      await result.current.deleteInvoice('test-1')

      expect(result.current.invoices).toHaveLength(2)
      expect(result.current.invoices.every((inv) => inv.id !== 'test-1')).toBe(true)
    })
  })

  describe('markAsPaid', () => {
    it('should mark invoice as fully paid', async () => {
      const { result } = renderHook(() => useContext(InvoiceContext), {
        wrapper: ({ children }) => (
          <InvoiceContext.Provider value={testContextValue}>
            {children}
          </InvoiceContext.Provider>
        ),
      })

      const updatedInvoice = await result.current.markAsPaid('test-1', 220)

      expect(updatedInvoice.status).toBe('paid')
      expect(updatedInvoice.amountPaid).toBe(220)
      expect(updatedInvoice.amountRemaining).toBe(0)
      expect(result.current.invoices[0].status).toBe('paid')
      expect(result.current.invoices[0].amountPaid).toBe(220)
      expect(result.current.invoices[0].amountRemaining).toBe(0)
    })

    it('should mark invoice as partial paid', async () => {
      const { result } = renderHook(() => useContext(InvoiceContext), {
        wrapper: ({ children }) => (
          <InvoiceContext.Provider value={testContextValue}>
            {children}
          </InvoiceContext.Provider>
        ),
      })

      const updatedInvoice = await result.current.markAsPaid('test-1', 110)

      expect(updatedInvoice.status).toBe('partial')
      expect(updatedInvoice.amountPaid).toBe(110)
      expect(updatedInvoice.amountRemaining).toBe(110)
      expect(result.current.invoices[0].status).toBe('partial')
      expect(result.current.invoices[0].amountPaid).toBe(110)
      expect(result.current.invoices[0].amountRemaining).toBe(110)
    })
  })

  describe('getFilteredInvoices', () => {
    it('should filter by status', () => {
      const { result } = renderHook(() => useContext(InvoiceContext), {
        wrapper: ({ children }) => (
          <InvoiceContext.Provider value={testContextValue}>
            {children}
          </InvoiceContext.Provider>
        ),
      })

      const filtered = result.current.getFilteredInvoices({ status: 'pending' })

      expect(filtered).toHaveLength(3)
      expect(filtered.every((inv) => inv.status === 'pending')).toBe(true)
    })

    it('should filter by customer', () => {
      const { result } = renderHook(() => useContext(InvoiceContext), {
        wrapper: ({ children }) => (
          <InvoiceContext.Provider value={testContextValue}>
            {children}
          </InvoiceContext.Provider>
        ),
      })

      const filtered = result.current.getFilteredInvoices({ customerId: 'cust-1' })

      expect(filtered).toHaveLength(1)
      expect(filtered[0].customerId).toBe('cust-1')
    })

    it('should return all invoices when no filters provided', () => {
      const { result } = renderHook(() => useContext(InvoiceContext), {
        wrapper: ({ children }) => (
          <InvoiceContext.Provider value={testContextValue}>
            {children}
          </InvoiceContext.Provider>
        ),
      })

      const filtered = result.current.getFilteredInvoices()

      expect(filtered).toHaveLength(3)
    })
  })
})
