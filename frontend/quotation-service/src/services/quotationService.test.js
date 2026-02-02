const { quotationService } = require('./quotationService');

describe('QuotationService Integration Tests', () => {
  // Since we are testing the mock service itself, we don't need to mock it.
  // We are verifying the logic inside the mock service.

  test('should fetch all quotations', async () => {
    const quotations = await quotationService.getQuotations();
    expect(quotations).toBeDefined();
    expect(Array.isArray(quotations)).toBe(true);
    expect(quotations.length).toBeGreaterThan(0);
    expect(quotations[0]).toHaveProperty('id');
    expect(quotations[0]).toHaveProperty('customerName');
  });

  test('should fetch a single quotation by id', async () => {
    const quotations = await quotationService.getQuotations();
    const firstId = quotations[0].id;
    
    const quotation = await quotationService.getQuotation(firstId);
    expect(quotation).toBeDefined();
    expect(quotation.id).toBe(firstId);
  });

  test('should return undefined for non-existent quotation id', async () => {
    const quotation = await quotationService.getQuotation('non-existent-id');
    expect(quotation).toBeUndefined();
  });

  test('should create a new quotation with correct calculations', async () => {
    const newQuotationData = {
      customerName: 'Test Customer',
      items: [
        { description: 'Test Item', quantity: 2, price: 100.00 }
      ]
    };

    const createdQuotation = await quotationService.createQuotation(newQuotationData);
    
    expect(createdQuotation).toBeDefined();
    expect(createdQuotation.id).toBeDefined();
    expect(createdQuotation.customerName).toBe('Test Customer');
    expect(createdQuotation.status).toBe('draft');
    
    // Verify calculations
    const expectedSubtotal = 200.00; // 2 * 100
    const expectedTax = expectedSubtotal * 0.08;
    const expectedTotal = expectedSubtotal + expectedTax;
    
    expect(createdQuotation.subtotal).toBe(expectedSubtotal);
    expect(createdQuotation.taxAmount).toBe(expectedTax);
    expect(createdQuotation.total).toBe(expectedTotal);
  });

  test('should search quotations by customer name', async () => {
    const results = await quotationService.searchQuotations('John');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].customerName).toContain('John');
  });

  test('should split quotation successfully', async () => {
    const result = await quotationService.splitQuotation('1', [0]);
    expect(result.success).toBe(true);
    expect(result.message).toBe('Quotation split successfully');
  });

  test('should convert quotation to invoice successfully', async () => {
    const result = await quotationService.convertToInvoice('1');
    expect(result.success).toBe(true);
    expect(result.message).toBe('Quotation converted to invoice successfully');
    expect(result.invoiceId).toBe('INV-1');
  });
});