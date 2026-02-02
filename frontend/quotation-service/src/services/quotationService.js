// Mock quotation service for frontend-first development
class QuotationService {
  constructor() {
    this.baseURL = '/api/quotations';
    this.quotations = [
      {
        id: '1',
        customerName: 'John Doe',
        customerAddress: '123 Main St, City, State 12345',
        customerEmail: 'john.doe@email.com',
        customerPhone: '+1-555-123-4567',
        quotationDate: '2025-06-01',
        expiryDate: '2025-07-01',
        items: [
          {
            itemNumber: 'ITEM001',
            itemName: 'Widget A',
            itemDescription: 'High-quality widget for various applications',
            quantity: 10,
            unitPrice: 50.00,
            lineTotal: 500.00
          },
          {
            itemNumber: 'ITEM002',
            itemName: 'Widget B',
            itemDescription: 'Premium widget with advanced features',
            quantity: 5,
            unitPrice: 100.00,
            lineTotal: 500.00
          }
        ],
        subtotal: 1000.00,
        discount: 0,
        taxRate: 0,
        taxAmount: 0,
        total: 1000.00,
        status: 'pending',
        termsAndConditions: 'Payment due within 30 days'
      },
      {
        id: '2',
        customerName: 'Jane Smith',
        customerAddress: '456 Oak Ave, Town, State 67890',
        customerEmail: 'jane.smith@email.com',
        customerPhone: '+1-555-987-6543',
        quotationDate: '2025-06-02',
        expiryDate: '2025-07-02',
        items: [
          {
            itemNumber: 'ITEM003',
            itemName: 'Service Package',
            itemDescription: 'Comprehensive service package',
            quantity: 1,
            unitPrice: 2500.00,
            lineTotal: 2500.00
          }
        ],
        subtotal: 2500.00,
        discount: 0,
        taxRate: 0.08,
        taxAmount: 200.00,
        total: 2700.00,
        status: 'approved',
        termsAndConditions: 'Payment due within 15 days'
      }
    ];
  }

  async getQuotations() {
    // Mock implementation - will be replaced with real API calls later
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...this.quotations]);
      }, 100); // Simulate network delay
    });
  }

  async getQuotation(id) {
    const quotations = await this.getQuotations();
    return quotations.find(q => q.id === id);
  }

  async createQuotation(quotationData) {
    // Mock implementation - will be replaced with real API calls later
    return new Promise((resolve) => {
      setTimeout(() => {
        // Generate new ID
        const newId = 'Q' + String(Date.now()).slice(-3).padStart(3, '0');
        
        // Calculate totals for items
        const itemsWithTotals = quotationData.items.map(item => ({
          ...item,
          total: item.quantity * item.price
        }));
        
        // Calculate total amount
        const total = itemsWithTotals.reduce((sum, item) => sum + item.total, 0);
        
        // Create new quotation
        const newQuotation = {
          id: newId,
          customerName: quotationData.customerName,
          customerAddress: quotationData.customerAddress || '',
          customerEmail: quotationData.customerEmail || '',
          customerPhone: quotationData.customerPhone || '',
          quotationDate: new Date().toISOString().split('T')[0], // Today's date
          expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
          items: itemsWithTotals,
          subtotal: total,
          taxRate: 0.08, // 8% tax
          taxAmount: total * 0.08,
          total: total * 1.08,
          status: 'draft',
          notes: quotationData.notes || '',
          terms: quotationData.terms || 'Net 30',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        this.quotations.push(newQuotation);
        resolve(newQuotation);
      }, 500); // Simulate API delay
    });
  }

  async updateQuotation(id, quotationData) {
    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = this.quotations.findIndex(q => q.id === id);
        if (index !== -1) {
          this.quotations[index] = { ...this.quotations[index], ...quotationData };
          resolve(this.quotations[index]);
        } else {
          resolve(null);
        }
      }, 200);
    });
  }

  async deleteQuotation(id) {
    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        this.quotations = this.quotations.filter(q => q.id !== id);
        resolve({ success: true, id });
      }, 100);
    });
  }

  async searchQuotations(query) {
    const quotations = await this.getQuotations();
    return quotations.filter(q => 
      q.customerName.toLowerCase().includes(query.toLowerCase()) ||
      q.id.toLowerCase().includes(query.toLowerCase())
    );
  }
async splitQuotation(quotationId, itemIndices) {
    // Mock implementation
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const originalQuotation = this.quotations.find(q => q.id === quotationId);
        if (!originalQuotation) {
          reject(new Error('Quotation not found'));
          return;
        }

        // Identify items to move
        const itemsToMove = [];
        const itemsToKeep = [];

        originalQuotation.items.forEach((item, index) => {
          if (itemIndices.includes(index)) {
            itemsToMove.push(item);
          } else {
            itemsToKeep.push(item);
          }
        });

        if (itemsToMove.length === 0) {
          reject(new Error('No items selected for splitting'));
          return;
        }

        // Create new quotation with moved items
        const newId = 'Q' + String(Date.now()).slice(-3).padStart(3, '0') + '-SPLIT';
        const newTotal = itemsToMove.reduce((sum, item) => sum + (item.total || item.lineTotal || 0), 0);
        
        const newQuotation = {
          ...originalQuotation,
          id: newId,
          items: itemsToMove,
          subtotal: newTotal,
          taxAmount: newTotal * (originalQuotation.taxRate || 0),
          total: newTotal * (1 + (originalQuotation.taxRate || 0)),
          status: 'draft', // New split quotation starts as draft
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        // Update original quotation
        const remainingTotal = itemsToKeep.reduce((sum, item) => sum + (item.total || item.lineTotal || 0), 0);
        originalQuotation.items = itemsToKeep;
        originalQuotation.subtotal = remainingTotal;
        originalQuotation.taxAmount = remainingTotal * (originalQuotation.taxRate || 0);
        originalQuotation.total = remainingTotal * (1 + (originalQuotation.taxRate || 0));
        originalQuotation.updatedAt = new Date().toISOString();

        // Add new quotation to list
        this.quotations.push(newQuotation);

        resolve({
          success: true,
          message: 'Quotation split successfully',
          newQuotationId: newId
        });
      }, 100);
    });
  }

  async convertToInvoice(quotationId) {
    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: 'Quotation converted to invoice successfully',
          invoiceId: 'INV-' + quotationId
        });
      }, 100);
    });
  }
}

export const quotationService = new QuotationService();
