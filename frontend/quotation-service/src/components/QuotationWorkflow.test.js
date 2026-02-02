const { screen, waitFor, fireEvent } = require('@testing-library/dom');
const QuotationList = require('./QuotationList');

// Mock the quotation service
jest.mock('../services/quotationService', () => ({
  quotationService: {
    getQuotations: jest.fn(),
    createQuotation: jest.fn(),
    getQuotation: jest.fn(),
    deleteQuotation: jest.fn(),
    updateQuotation: jest.fn(),
    searchQuotations: jest.fn(),
    splitQuotation: jest.fn(),
    convertToInvoice: jest.fn()
  }
}));

const { quotationService } = require('../services/quotationService');

describe('Quotation Workflow E2E Simulation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = '';
    jest.useFakeTimers();
    
    // Setup default mock responses
    quotationService.getQuotations.mockResolvedValue([]);
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  test('Complete User Journey: Create -> View -> Split -> Convert -> Delete', async () => {
    // 1. Initialize Component
    const quotationList = new QuotationList(quotationService);
    quotationList.render(document.body);
    
    // 2. Create New Quotation
    // Wait for loading to finish first
    await waitFor(() => {
      expect(screen.queryByText('Loading quotations...')).not.toBeInTheDocument();
    });

    const createBtn = screen.getByText('Create New Quotation');
    fireEvent.click(createBtn);
    
    await waitFor(() => {
      expect(screen.getByText('New Quotation')).toBeInTheDocument();
    });
    
    // Fill form
    fireEvent.input(screen.getByLabelText('Customer Name'), { target: { value: 'E2E User' } });
    fireEvent.input(screen.getByLabelText('Item Description'), { target: { value: 'E2E Item' } });
    fireEvent.input(screen.getByLabelText('Quantity'), { target: { value: '2' } });
    fireEvent.input(screen.getByLabelText('Price'), { target: { value: '100' } });
    
    // Mock create response
    const createdQuotation = {
      id: 'Q-E2E',
      customerName: 'E2E User',
      quotationDate: '2025-06-01',
      total: 200.00,
      status: 'draft',
      items: [{ description: 'E2E Item', quantity: 2, price: 100, total: 200 }]
    };
    quotationService.createQuotation.mockResolvedValue(createdQuotation);
    quotationService.getQuotations.mockResolvedValue([createdQuotation]);
    
    // Save
    fireEvent.click(screen.getByText('Save Quotation'));
    
    await waitFor(() => {
      expect(quotationService.createQuotation).toHaveBeenCalled();
      expect(screen.getByText('Customer: E2E User')).toBeInTheDocument();
    });
    
    // 3. View Details
    quotationService.getQuotation.mockResolvedValue(createdQuotation);
    const item = screen.getByText('Customer: E2E User').closest('.quotation-item');
    fireEvent.click(item);
    
    await waitFor(() => {
      expect(screen.getByText('Quotation Details #Q-E2E')).toBeInTheDocument();
    });
    
    // 4. Split Quotation
    fireEvent.click(screen.getByText('Split Quotation'));
    
    await waitFor(() => {
      expect(screen.getByText('Select items to move to new quotation')).toBeInTheDocument();
    });
    
    // Select item and confirm
    const checkbox = document.querySelector('.split-checkbox');
    fireEvent.click(checkbox);
    
    quotationService.splitQuotation.mockResolvedValue({ success: true });
    // Mock refresh after split
    quotationService.getQuotations.mockResolvedValue([
      { ...createdQuotation, total: 100 }, // Original
      { ...createdQuotation, id: 'Q-E2E-SPLIT', total: 100 } // New
    ]);
    
    fireEvent.click(screen.getByText('Confirm Split'));
    
    await waitFor(() => {
      expect(quotationService.splitQuotation).toHaveBeenCalled();
      expect(screen.getByText('Quotations List')).toBeInTheDocument();
    });
    
    // 5. Convert to Invoice
    // Select the first one again
    quotationService.getQuotation.mockResolvedValue(createdQuotation);
    const itemToConvert = screen.getAllByText('Customer: E2E User')[0].closest('.quotation-item');
    fireEvent.click(itemToConvert);
    
    await waitFor(() => {
      expect(screen.getByText('Convert to Invoice')).toBeInTheDocument();
    });
    
    quotationService.convertToInvoice.mockResolvedValue({ success: true });
    fireEvent.click(screen.getByText('Convert to Invoice'));
    
    await waitFor(() => {
      expect(quotationService.convertToInvoice).toHaveBeenCalledWith('Q-E2E');
    });
    
    // 6. Delete Quotation
    quotationService.deleteQuotation.mockResolvedValue({ success: true });
    // Mock empty list after delete
    quotationService.getQuotations.mockResolvedValue([]);
    
    // Wait for loading to finish if any
    await waitFor(() => {
        expect(screen.queryByText('Loading quotations...')).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Delete Quotation'));
    
    await waitFor(() => {
      expect(quotationService.deleteQuotation).toHaveBeenCalledWith('Q-E2E');
      expect(screen.getByText('No quotations found')).toBeInTheDocument();
    });
  });
});