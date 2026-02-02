const { screen, waitFor, fireEvent } = require('@testing-library/dom');
const QuotationList = require('./QuotationList');

// Mock service
const { quotationService } = require('../services/quotationService');
jest.mock('../services/quotationService');

describe('QuotationList Data Scenarios', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    jest.clearAllMocks();
  });

  test('should display "No quotations found" when list is empty', async () => {
    quotationService.getQuotations.mockResolvedValue([]);
    const list = new QuotationList(quotationService);
    list.render(document.body);
    
    await waitFor(() => {
      expect(screen.getByText('No quotations found')).toBeInTheDocument();
    });
  });

  test('should handle service error gracefully', async () => {
    quotationService.getQuotations.mockRejectedValue(new Error('Network Error'));
    const list = new QuotationList(quotationService);
    list.render(document.body);
    
    await waitFor(() => {
      // The component renders this.error.message or 'Error loading quotations'
      // Since we passed new Error('Network Error'), it should render 'Network Error'
      expect(screen.getByText('Network Error')).toBeInTheDocument();
    });
  });

  test('should validate negative numbers in form', async () => {
    quotationService.getQuotations.mockResolvedValue([]);
    const list = new QuotationList(quotationService);
    list.render(document.body);
    
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText('Loading quotations...')).not.toBeInTheDocument();
    });

    // Open form
    fireEvent.click(screen.getByText('Create New Quotation'));
    
    // Input negative price
    const priceInput = screen.getByLabelText('Price');
    fireEvent.input(priceInput, { target: { value: '-100' } });
    
    // Try to save
    fireEvent.click(screen.getByText('Save Quotation'));
    
    // Check that service was NOT called (validation blocked it)
    expect(quotationService.createQuotation).not.toHaveBeenCalled();
  });
  
  test('should filter correctly with special characters', async () => {
    const mockQuotations = [
      { id: '1', customerName: 'Alice & Bob', status: 'draft', items: [], total: 100 },
      { id: '2', customerName: 'Charlie', status: 'draft', items: [], total: 200 }
    ];
    quotationService.getQuotations.mockResolvedValue(mockQuotations);
    
    const list = new QuotationList(quotationService);
    list.render(document.body);
    
    await waitFor(() => {
      expect(screen.getByText('Customer: Alice & Bob')).toBeInTheDocument();
    });
    
    const searchInput = screen.getByPlaceholderText('Search quotations...');
    fireEvent.input(searchInput, { target: { value: '&' } });
    
    // Simulate debounce timeout
    jest.useFakeTimers();
    jest.advanceTimersByTime(300);
    jest.useRealTimers();
    
    // Check filtered result
    await waitFor(() => {
        const rows = document.querySelectorAll('.quotation-item');
        expect(rows.length).toBe(1);
    });
    
    expect(screen.getByText('Customer: Alice & Bob')).toBeInTheDocument();
    expect(screen.queryByText('Customer: Charlie')).not.toBeInTheDocument();
  });
});