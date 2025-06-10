const { screen, waitFor } = require('@testing-library/dom');
const QuotationList = require('./QuotationList');

// Mock the quotation service
jest.mock('../services/quotationService', () => ({
  quotationService: {
    getQuotations: jest.fn()
  }
}));

const { quotationService } = require('../services/quotationService');

describe('QuotationList Component', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Clear DOM
    document.body.innerHTML = '';
  });

  test('should render empty state when no quotations exist', async () => {
    // Arrange
    quotationService.getQuotations.mockResolvedValue([]);
    
    // Act
    const quotationList = new QuotationList();
    quotationList.render(document.body);
    await waitFor(() => {
      expect(screen.getByText('No quotations found')).toBeInTheDocument();
    });
  });

  test('should render list of quotations when data exists', async () => {
    // Arrange
    const mockQuotations = [
      {
        id: '1',
        customerName: 'John Doe',
        quotationDate: '2025-06-01',
        expiryDate: '2025-07-01',
        total: 1000.00,
        status: 'pending'
      },
      {
        id: '2', 
        customerName: 'Jane Smith',
        quotationDate: '2025-06-02',
        expiryDate: '2025-07-02',
        total: 2500.00,
        status: 'approved'
      }
    ];
    
    quotationService.getQuotations.mockResolvedValue(mockQuotations);
    
    // Act
    const quotationList = new QuotationList();
    quotationList.render(document.body);
    
    // Assert
    await waitFor(() => {
      expect(screen.getByText('Customer: John Doe')).toBeInTheDocument();
      expect(screen.getByText('Customer: Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('$1,000.00')).toBeInTheDocument();
      expect(screen.getByText('$2,500.00')).toBeInTheDocument();
    });
  });

  test('should display loading state while fetching quotations', async () => {
    // Arrange
    let resolvePromise;
    const promise = new Promise(resolve => {
      resolvePromise = resolve;
    });
    quotationService.getQuotations.mockReturnValue(promise);
    
    // Act
    const quotationList = new QuotationList();
    quotationList.render(document.body);
    
    // Assert
    expect(screen.getByText('Loading quotations...')).toBeInTheDocument();
    
    // Clean up
    resolvePromise([]);
  });

  test('should handle error state when fetching fails', async () => {
    // Arrange
    quotationService.getQuotations.mockRejectedValue(new Error('Network error'));
    
    // Act
    const quotationList = new QuotationList();
    quotationList.render(document.body);
    
    // Assert
    await waitFor(() => {
      expect(screen.getByText('Error loading quotations')).toBeInTheDocument();
    });
  });

  // Search functionality tests
  test('should render search input field', async () => {
    // Arrange
    quotationService.getQuotations.mockResolvedValue([]);
    
    // Act
    const quotationList = new QuotationList();
    quotationList.render(document.body);
    
    // Assert
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search quotations...')).toBeInTheDocument();
    });
  });

  test('should filter quotations by customer name', async () => {
    // Arrange
    const mockQuotations = [
      {
        id: '1',
        customerName: 'John Doe',
        quotationDate: '2025-06-01',
        total: 1000.00,
        status: 'pending'
      },
      {
        id: '2',
        customerName: 'Jane Smith',
        quotationDate: '2025-06-02',
        total: 2500.00,
        status: 'approved'
      }
    ];
    
    quotationService.getQuotations.mockResolvedValue(mockQuotations);
    
    // Act
    const quotationList = new QuotationList();
    quotationList.render(document.body);
    
    await waitFor(() => {
      expect(screen.getByText('Customer: John Doe')).toBeInTheDocument();
    });
    
    // Search for "Jane"
    const searchInput = screen.getByPlaceholderText('Search quotations...');
    searchInput.value = 'Jane';
    searchInput.dispatchEvent(new Event('input', { bubbles: true }));
    
    // Assert
    await waitFor(() => {
      expect(screen.getByText('Customer: Jane Smith')).toBeInTheDocument();
      expect(screen.queryByText('Customer: John Doe')).not.toBeInTheDocument();
    });
  });

  test('should filter quotations by quotation ID', async () => {
    // Arrange
    const mockQuotations = [
      {
        id: 'Q001',
        customerName: 'John Doe',
        quotationDate: '2025-06-01',
        total: 1000.00,
        status: 'pending'
      },
      {
        id: 'Q002',
        customerName: 'Jane Smith',
        quotationDate: '2025-06-02',
        total: 2500.00,
        status: 'approved'
      }
    ];
    
    quotationService.getQuotations.mockResolvedValue(mockQuotations);
    
    // Act
    const quotationList = new QuotationList();
    quotationList.render(document.body);
    
    await waitFor(() => {
      expect(screen.getByText('Quotation #Q001')).toBeInTheDocument();
    });
    
    // Search for "Q002"
    const searchInput = screen.getByPlaceholderText('Search quotations...');
    searchInput.value = 'Q002';
    searchInput.dispatchEvent(new Event('input', { bubbles: true }));
    
    // Assert
    await waitFor(() => {
      expect(screen.getByText('Quotation #Q002')).toBeInTheDocument();
      expect(screen.queryByText('Quotation #Q001')).not.toBeInTheDocument();
    });
  });

  test('should filter quotations by status', async () => {
    // Arrange
    const mockQuotations = [
      {
        id: '1',
        customerName: 'John Doe',
        quotationDate: '2025-06-01',
        total: 1000.00,
        status: 'pending'
      },
      {
        id: '2',
        customerName: 'Jane Smith',
        quotationDate: '2025-06-02',
        total: 2500.00,
        status: 'approved'
      }
    ];
    
    quotationService.getQuotations.mockResolvedValue(mockQuotations);
    
    // Act
    const quotationList = new QuotationList();
    quotationList.render(document.body);
    
    await waitFor(() => {
      expect(screen.getByText('Customer: John Doe')).toBeInTheDocument();
    });
    
    // Search for "approved"
    const searchInput = screen.getByPlaceholderText('Search quotations...');
    searchInput.value = 'approved';
    searchInput.dispatchEvent(new Event('input', { bubbles: true }));
    
    // Assert
    await waitFor(() => {
      expect(screen.getByText('Customer: Jane Smith')).toBeInTheDocument();
      expect(screen.queryByText('Customer: John Doe')).not.toBeInTheDocument();
    });
  });

  test('should show "no results" message when search returns no matches', async () => {
    // Arrange
    const mockQuotations = [
      {
        id: '1',
        customerName: 'John Doe',
        quotationDate: '2025-06-01',
        total: 1000.00,
        status: 'pending'
      }
    ];
    
    quotationService.getQuotations.mockResolvedValue(mockQuotations);
    
    // Act
    const quotationList = new QuotationList();
    quotationList.render(document.body);
    
    await waitFor(() => {
      expect(screen.getByText('Customer: John Doe')).toBeInTheDocument();
    });
    
    // Search for something that doesn't exist
    const searchInput = screen.getByPlaceholderText('Search quotations...');
    searchInput.value = 'nonexistent';
    searchInput.dispatchEvent(new Event('input', { bubbles: true }));
    
    // Assert
    await waitFor(() => {
      expect(screen.getByText('No quotations match your search')).toBeInTheDocument();
      expect(screen.queryByText('Customer: John Doe')).not.toBeInTheDocument();
    });
  });
});
