// Mock quotation service for frontend-first development
class QuotationService {
  constructor() {
    this.baseURL = '/api/quotations';
  }

  async getQuotations() {
    // Mock implementation - will be replaced with real API calls later
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
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
        ]);
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
        
        resolve(newQuotation);
      }, 500); // Simulate API delay
    });
  }

  async updateQuotation(id, quotationData) {
    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ id, ...quotationData });
      }, 200);
    });
  }

  async deleteQuotation(id) {
    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
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
}

const quotationService = new QuotationService();

module.exports = { quotationService };
