// This would be the fixed test file content
const { screen, waitFor, fireEvent } = require('@testing-library/dom');
const QuotationList = require('./QuotationList');

// Mock the quotation service - this should match exactly what component imports
jest.mock('../services/quotationService', () => ({
  quotationService: {
    getQuotations: jest.fn(),
    createQuotation: jest.fn(),
    getQuotation: jest.fn(),
    updateQuotation: jest.fn(),
    deleteQuotation: jest.fn(),
    searchQuotations: jest.fn()
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
    const quotationList = new QuotationList(quotationService);
    quotationList.render(document.body);
    
    // Assert
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
    const quotationList = new QuotationList(quotationService);
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
    const quotationList = new QuotationList(quotationService);
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
    const quotationList = new QuotationList(quotationService);
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
    const quotationList = new QuotationList(quotationService);
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
    const quotationList = new QuotationList(quotationService);
    quotationList.render(document.body);
    
    await waitFor(() => {
      expect(screen.getByText('Customer: John Doe')).toBeInTheDocument();
    });
    
    // Search for "Jane"
    const searchInput = screen.getByPlaceholderText('Search quotations...');
    fireEvent.input(searchInput, { target: { value: 'Jane' } });
    
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
    const quotationList = new QuotationList(quotationService);
    quotationList.render(document.body);
    
    await waitFor(() => {
      expect(screen.getByText('Quotation #Q001')).toBeInTheDocument();
    });
    
    // Search for "Q002"
    const searchInput = screen.getByPlaceholderText('Search quotations...');
    fireEvent.input(searchInput, { target: { value: 'Q002' } });
    
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
    const quotationList = new QuotationList(quotationService);
    quotationList.render(document.body);
    
    await waitFor(() => {
      expect(screen.getByText('Customer: John Doe')).toBeInTheDocument();
    });
    
    // Search for "approved"
    const searchInput = screen.getByPlaceholderText('Search quotations...');
    fireEvent.input(searchInput, { target: { value: 'approved' } });
    
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
    const quotationList = new QuotationList(quotationService);
    quotationList.render(document.body);
    
    await waitFor(() => {
      expect(screen.getByText('Customer: John Doe')).toBeInTheDocument();
    });
    
    // Search for something that doesn't exist
    const searchInput = screen.getByPlaceholderText('Search quotations...');
    fireEvent.input(searchInput, { target: { value: 'nonexistent' } });
    
    // Assert
    await waitFor(() => {
      expect(screen.getByText('No quotations match your search')).toBeInTheDocument();
      expect(screen.queryByText('Customer: John Doe')).not.toBeInTheDocument();
    });
  });

  // Create quotation functionality tests
  test('should render "Create New Quotation" button', async () => {
    // Arrange
    quotationService.getQuotations.mockResolvedValue([]);
    
    // Act
    const quotationList = new QuotationList(quotationService);
    quotationList.render(document.body);
    
    // Assert
    await waitFor(() => {
      expect(screen.getByText('Create New Quotation')).toBeInTheDocument();
    });
  });

  test('should show create quotation form when button is clicked', async () => {
    // Arrange
    quotationService.getQuotations.mockResolvedValue([]);
    
    // Act
    const quotationList = new QuotationList(quotationService);
    quotationList.render(document.body);
    
    await waitFor(() => {
      expect(screen.getByText('Create New Quotation')).toBeInTheDocument();
    });
    
    const createButton = screen.getByText('Create New Quotation');
    fireEvent.click(createButton);
    
    // Assert
    await waitFor(() => {
      expect(screen.getByText('New Quotation')).toBeInTheDocument();
      expect(screen.getByLabelText('Customer Name')).toBeInTheDocument();
      expect(screen.getByText('Items')).toBeInTheDocument();
      expect(screen.getByText('Save Quotation')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });
  });

  test('should validate required fields in create form', async () => {
    // Arrange
    quotationService.getQuotations.mockResolvedValue([]);
    
    // Act
    const quotationList = new QuotationList(quotationService);
    quotationList.render(document.body);
    
    await waitFor(() => {
      expect(screen.getByText('Create New Quotation')).toBeInTheDocument();
    });
    
    const createButton = screen.getByText('Create New Quotation');
    fireEvent.click(createButton);
    
    await waitFor(() => {
      expect(screen.getByText('Save Quotation')).toBeInTheDocument();
    });
    
    // Trigger form submission directly using fireEvent
    const form = document.querySelector('#quotation-form');
    fireEvent.submit(form);
    
    // Assert
    await waitFor(() => {
      expect(screen.getByText('Customer name is required')).toBeInTheDocument();
      expect(screen.getByText('At least one item is required')).toBeInTheDocument();
    });
  });

  test('should create new quotation successfully', async () => {
    // Arrange
    const newQuotationData = {
      customerName: 'New Customer',
      items: [
        { description: 'Item 1', quantity: 2, price: 100.00 }
      ]
    };
    
    const createdQuotation = {
      id: 'Q005',
      customerName: 'New Customer',
      quotationDate: '2025-06-10',
      expiryDate: '2025-07-10',
      total: 200.00,
      status: 'draft',
      items: [
        { description: 'Item 1', quantity: 2, price: 100.00, total: 200.00 }
      ]
    };
    
    quotationService.getQuotations.mockResolvedValue([]);
    quotationService.createQuotation = jest.fn().mockResolvedValue(createdQuotation);
    
    // Act
    const quotationList = new QuotationList(quotationService);
    quotationList.render(document.body);
    
    await waitFor(() => {
      expect(screen.getByText('Create New Quotation')).toBeInTheDocument();
    });
    
    const createButton = screen.getByText('Create New Quotation');
    fireEvent.click(createButton);
    
    await waitFor(() => {
      expect(screen.getByLabelText('Customer Name')).toBeInTheDocument();
    });
    
    // Fill form
    const customerNameInput = screen.getByLabelText('Customer Name');
    fireEvent.input(customerNameInput, { target: { value: 'New Customer' } });
    
    const itemDescInput = screen.getByLabelText('Item Description');
    fireEvent.input(itemDescInput, { target: { value: 'Item 1' } });
    
    const itemQtyInput = screen.getByLabelText('Quantity');
    fireEvent.input(itemQtyInput, { target: { value: '2' } });
    
    const itemPriceInput = screen.getByLabelText('Price');
    fireEvent.input(itemPriceInput, { target: { value: '100.00' } });
    
    const saveButton = screen.getByText('Save Quotation');
    fireEvent.click(saveButton);
    
    // Assert
    await waitFor(() => {
      expect(quotationService.createQuotation).toHaveBeenCalledWith(
        expect.objectContaining({
          customerName: 'New Customer',
          items: expect.arrayContaining([
            expect.objectContaining({
              description: 'Item 1',
              quantity: 2,
              price: 100.00
            })
          ])
        })
      );
    });
    
    // Should return to list view and show new quotation
    await waitFor(() => {
      expect(screen.getByText('Customer: New Customer')).toBeInTheDocument();
      expect(screen.getByText('$200.00')).toBeInTheDocument();
    });
  });

  test('should cancel create quotation and return to list', async () => {
    // Arrange
    quotationService.getQuotations.mockResolvedValue([]);
    
    // Act
    const quotationList = new QuotationList(quotationService);
    quotationList.render(document.body);
    
    await waitFor(() => {
      expect(screen.getByText('Create New Quotation')).toBeInTheDocument();
    });
    
    const createButton = screen.getByText('Create New Quotation');
    fireEvent.click(createButton);
    
    await waitFor(() => {
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });
    
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    // Assert
    await waitFor(() => {
      expect(screen.getByText('Create New Quotation')).toBeInTheDocument();
      expect(screen.queryByText('New Quotation')).not.toBeInTheDocument();
    });
  });
});