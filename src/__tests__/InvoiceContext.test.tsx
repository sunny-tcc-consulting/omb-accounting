import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
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

// Test component that uses InvoiceContext
function TestComponent() {
  const { invoices, loading, error, getInvoiceById, addInvoice, updateInvoice, deleteInvoice, markAsPaid, getFilteredInvoices } = React.useContext(InvoiceContext)
  return (
    <div>
      <div data-testid="invoices-count">{invoices.length}</div>
      <div data-testid="loading">{loading ? 'loading' : 'loaded'}</div>
      <div data-testid="error">{error || 'no-error'}</div>
    </div>
  )
}

describe('InvoiceContext', () => {
  describe('Initial State', () => {
    it('should have invoices in the context', () => {
      render(
        <InvoiceContext.Provider value={{ ...testInvoice }}>
          <TestComponent />
        </InvoiceContext.Provider>
      )

      const invoicesCount = screen.getByTestId('invoices-count')
      expect(invoicesCount.textContent).toBe('1')
    })

    it('should have loading state as false initially', () => {
      render(
        <InvoiceContext.Provider value={{ ...testInvoice }}>
          <TestComponent />
        </InvoiceContext.Provider>
      )

      const loading = screen.getByTestId('loading')
      expect(loading.textContent).toBe('loaded')
    })

    it('should have no error initially', () => {
      render(
        <InvoiceContext.Provider value={{ ...testInvoice }}>
          <TestComponent />
        </InvoiceContext.Provider>
      )

      const error = screen.getByTestId('error')
      expect(error.textContent).toBe('no-error')
    })
  })

  describe('getInvoiceById', () => {
    it('should return the correct invoice by ID', () => {
      render(
        <InvoiceContext.Provider value={{ ...testInvoice }}>
          <TestComponent />
        </InvoiceContext.Provider>
      )

      const { getInvoiceById } = React.useContext(InvoiceContext)
      const invoice = getInvoiceById('test-1')

      expect(invoice).toBeDefined()
      expect(invoice?.id).toBe('test-1')
      expect(invoice?.invoiceNumber).toBe('INV-2026-001')
    })

    it('should return undefined for non-existent ID', () => {
      render(
        <InvoiceContext.Provider value={{ ...testInvoice }}>
          <TestComponent />
        </InvoiceContext.Provider>
      )

      const { getInvoiceById } = React.useContext(InvoiceContext)
      const invoice = getInvoiceById('non-existent')

      expect(invoice).toBeUndefined()
    })
  })

  describe('addInvoice', () => {
    it('should add a new invoice', async () => {
      render(
        <InvoiceContext.Provider value={{ ...testInvoice }}>
          <TestComponent />
        </InvoiceContext.Provider>
      )

      const { addInvoice, invoices } = React.useContext(InvoiceContext)
      const newInvoice = await addInvoice({
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
      expect(invoices).toHaveLength(2)
    })

    it('should calculate totals correctly', async () => {
      render(
        <InvoiceContext.Provider value={{ ...testInvoice }}>
          <TestComponent />
        </InvoiceContext.Provider>
      )

      const { addInvoice } = React.useContext(InvoiceContext)
      const newInvoice = await addInvoice({
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
        ],
      })

      expect(newInvoice?.subtotal).toBe(500)
      expect(newInvoice?.tax).toBe(60)
      expect(newInvoice?.discount).toBe(100)
      expect(newInvoice?.total).toBe(460)
    })
  })

  describe('updateInvoice', () => {
    it('should update an existing invoice', async () => {
      render(
        <InvoiceContext.Provider value={{ ...testInvoice }}>
          <TestComponent />
        </InvoiceContext.Provider>
      )

      const { updateInvoice, invoices } = React.useContext(InvoiceContext)
      const result = await updateInvoice('test-1', { customerName: 'Updated Customer' })

      expect(result).toBeDefined()
      expect(result?.customerName).toBe('Updated Customer')
      expect(invoices[0].customerName).toBe('Updated Customer')
    })

    it('should update invoice status', async () => {
      render(
        <InvoiceContext.Provider value={{ ...testInvoice }}>
          <TestComponent />
        </InvoiceContext.Provider>
      )

      const { updateInvoice } = React.useContext(InvoiceContext)
      const result = await updateInvoice('test-1', { status: 'paid' })

      expect(result?.status).toBe('paid')
      expect(result?.paidDate).toBeDefined()
    })
  })

  describe('deleteInvoice', () => {
    it('should delete an invoice', async () => {
      render(
        <InvoiceContext.Provider value={{ ...testInvoice }}>
          <TestComponent />
        </InvoiceContext.Provider>
      )

      const { deleteInvoice, invoices } = React.useContext(InvoiceContext)
      await deleteInvoice('test-1')

      expect(invoices).toHaveLength(0)
    })
  })

  describe('markAsPaid', () => {
    it('should mark invoice as fully paid', async () => {
      render(
        <InvoiceContext.Provider value={{ ...testInvoice }}>
          <TestComponent />
        </InvoiceContext.Provider>
      )

      const { markAsPaid, invoices } = React.useContext(InvoiceContext)
      await markAsPaid('test-1', 220)

      expect(invoices[0].status).toBe('paid')
      expect(invoices[0].amountPaid).toBe(220)
      expect(invoices[0].amountRemaining).toBe(0)
    })

    it('should mark invoice as partial paid', async () => {
      render(
        <InvoiceContext.Provider value={{ ...testInvoice }}>
          <TestComponent />
        </InvoiceContext.Provider>
      )

      const { markAsPaid, invoices } = React.useContext(InvoiceContext)
      await markAsPaid('test-1', 110)

      expect(invoices[0].status).toBe('partial')
      expect(invoices[0].amountPaid).toBe(110)
      expect(invoices[0].amountRemaining).toBe(110)
    })
  })

  describe('getFilteredInvoices', () => {
    it('should filter by status', () => {
      render(
        <InvoiceContext.Provider value={{ ...testInvoice }}>
          <TestComponent />
        </InvoiceContext.Provider>
      )

      const { getFilteredInvoices } = React.useContext(InvoiceContext)
      const filtered = getFilteredInvoices({ status: 'pending' })

      expect(filtered.length).toBe(1)
      expect(filtered[0].status).toBe('pending')
    })

    it('should filter by customer', () => {
      render(
        <InvoiceContext.Provider value={{ ...testInvoice }}>
          <TestComponent />
        </InvoiceContext.Provider>
      )

      const { getFilteredInvoices } = React.useContext(InvoiceContext)
      const filtered = getFilteredInvoices({ customerId: 'cust-1' })

      expect(filtered.length).toBe(1)
      expect(filtered[0].customerId).toBe('cust-1')
    })
  })
})
