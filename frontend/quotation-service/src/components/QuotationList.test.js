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

describe('QuotationList Component', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Clear DOM
    document.body.innerHTML = '';
    
    // Use fake timers to control debounce and other timeouts
    jest.useFakeTimers();

    // Mock window.alert globally for all tests
    jest.spyOn(window, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    // Run any pending timers to avoid open handles
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  test('should render empty state when no quotations exist', async () => {
    // Arrange
    quotationService.getQuotations.mockResolvedValue([]);
    
    // Act
    const quotationList = new QuotationList(quotationService);
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
      expect(screen.getByText('Network error')).toBeInTheDocument();
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
    
    // Advance timers to trigger debounce
    jest.advanceTimersByTime(300);
    
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
    
    // Advance timers to trigger debounce
    jest.advanceTimersByTime(300);
    
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
    
    // Advance timers to trigger debounce
    jest.advanceTimersByTime(300);
    
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
    
    // Advance timers to trigger debounce
    jest.advanceTimersByTime(300);
    
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
      expect(screen.getByText('Items')).toBeInTheDocument(); // Changed from getByLabelText to getByText
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
    
    // Trigger form submission directly
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

  test('should handle error when creating quotation fails', async () => {
    // Arrange
    quotationService.getQuotations.mockResolvedValue([]);
    quotationService.createQuotation.mockRejectedValue(new Error('Creation failed'));
    
    // Act
    const quotationList = new QuotationList(quotationService);
    quotationList.render(document.body);
    
    await waitFor(() => {
      expect(screen.getByText('Create New Quotation')).toBeInTheDocument();
    });
    
    const createButton = screen.getByText('Create New Quotation');
    fireEvent.click(createButton);
    
    // Fill form
    const customerNameInput = screen.getByLabelText('Customer Name');
    fireEvent.input(customerNameInput, { target: { value: 'New Customer' } });

    const itemDescInput = screen.getByLabelText('Item Description');
    fireEvent.input(itemDescInput, { target: { value: 'Test Item' } });
    
    const saveButton = screen.getByText('Save Quotation');
    fireEvent.click(saveButton);
    
    // Assert
    await waitFor(() => {
      expect(screen.getByText('Creation failed')).toBeInTheDocument();
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

  // Detail view functionality tests
  test('should show quotation details when a quotation is clicked', async () => {
    // Arrange
    const mockQuotations = [
      {
        id: '1',
        customerName: 'John Doe',
        quotationDate: '2025-06-01',
        total: 1000.00,
        status: 'pending',
        items: [
          { description: 'Item 1', quantity: 2, price: 500.00, total: 1000.00 }
        ]
      }
    ];
    
    quotationService.getQuotations.mockResolvedValue(mockQuotations);
    quotationService.getQuotation = jest.fn().mockResolvedValue(mockQuotations[0]);
    
    // Act
    const quotationList = new QuotationList(quotationService);
    quotationList.render(document.body);
    
    await waitFor(() => {
      expect(screen.getByText('Customer: John Doe')).toBeInTheDocument();
    });
    
    // Click on the quotation item
    const quotationItem = screen.getByText('Customer: John Doe').closest('.quotation-item');
    fireEvent.click(quotationItem);
    
    // Assert
    await waitFor(() => {
      expect(screen.getByText('Quotation Details #1')).toBeInTheDocument();
      expect(screen.getByText('Back to List')).toBeInTheDocument();
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getAllByText('$1,000.00').length).toBeGreaterThan(0);
    });
  });

  test('should return to list view from detail view', async () => {
    // Arrange
    const mockQuotations = [
      {
        id: '1',
        customerName: 'John Doe',
        quotationDate: '2025-06-01',
        total: 1000.00,
        status: 'pending',
        items: []
      }
    ];
    
    quotationService.getQuotations.mockResolvedValue(mockQuotations);
    quotationService.getQuotation = jest.fn().mockResolvedValue(mockQuotations[0]);
    
    // Act
    const quotationList = new QuotationList(quotationService);
    quotationList.render(document.body);
    
    await waitFor(() => {
      expect(screen.getByText('Customer: John Doe')).toBeInTheDocument();
    });
    
    // Go to detail view
    const quotationItem = screen.getByText('Customer: John Doe').closest('.quotation-item');
    fireEvent.click(quotationItem);
    
    await waitFor(() => {
      expect(screen.getByText('Back to List')).toBeInTheDocument();
    });
    
    // Click back button
    const backButton = screen.getByText('Back to List');
    fireEvent.click(backButton);
    
    // Assert
    await waitFor(() => {
      expect(screen.getByText('Quotations List')).toBeInTheDocument();
      expect(screen.getByText('Customer: John Doe')).toBeInTheDocument();
    });
  });

  test('should show split quotation button in detail view', async () => {
    // Arrange
    const mockQuotations = [
      {
        id: '1',
        customerName: 'John Doe',
        quotationDate: '2025-06-01',
        total: 1000.00,
        status: 'pending',
        items: []
      }
    ];
    
    quotationService.getQuotations.mockResolvedValue(mockQuotations);
    quotationService.getQuotation = jest.fn().mockResolvedValue(mockQuotations[0]);
    
    // Act
    const quotationList = new QuotationList(quotationService);
    quotationList.render(document.body);
    
    await waitFor(() => {
      expect(screen.getByText('Customer: John Doe')).toBeInTheDocument();
    });
    
    // Go to detail view
    const quotationItem = screen.getByText('Customer: John Doe').closest('.quotation-item');
    fireEvent.click(quotationItem);
    
    // Assert
    await waitFor(() => {
      expect(screen.getByText('Split Quotation')).toBeInTheDocument();
    });
  });

  test('should split quotation when items are selected and confirmed', async () => {
    // Arrange
    const mockQuotations = [
      {
        id: '1',
        customerName: 'John Doe',
        quotationDate: '2025-06-01',
        total: 1500.00,
        status: 'pending',
        items: [
          { description: 'Item 1', quantity: 1, price: 1000.00, total: 1000.00 },
          { description: 'Item 2', quantity: 1, price: 500.00, total: 500.00 }
        ]
      }
    ];
    
    quotationService.getQuotations.mockResolvedValue(mockQuotations);
    quotationService.getQuotation = jest.fn().mockResolvedValue(mockQuotations[0]);
    quotationService.splitQuotation = jest.fn().mockResolvedValue({
      original: { ...mockQuotations[0], items: [mockQuotations[0].items[0]], total: 1000.00 },
      new: { ...mockQuotations[0], id: '2', items: [mockQuotations[0].items[1]], total: 500.00 }
    });
    
    // Act
    const quotationList = new QuotationList(quotationService);
    quotationList.render(document.body);
    
    // Go to detail view
    await waitFor(() => {
      const quotationItem = screen.getByText('Customer: John Doe').closest('.quotation-item');
      fireEvent.click(quotationItem);
    });
    
    // Click split button
    await waitFor(() => {
      const splitBtn = screen.getByText('Split Quotation');
      fireEvent.click(splitBtn);
    });
    
    // Verify split mode UI
    await waitFor(() => {
      expect(screen.getByText('Select items to move to new quotation')).toBeInTheDocument();
      expect(screen.getByText('Confirm Split')).toBeInTheDocument();
      expect(screen.getByText('Cancel Split')).toBeInTheDocument();
      expect(document.querySelectorAll('.split-checkbox').length).toBe(2);
    });
    
    // Select second item
    const checkboxes = document.querySelectorAll('.split-checkbox');
    fireEvent.click(checkboxes[1]); // Select Item 2
    
    // Confirm split
    const confirmBtn = screen.getByText('Confirm Split');
    fireEvent.click(confirmBtn);
    
    // Assert
    await waitFor(() => {
      expect(quotationService.splitQuotation).toHaveBeenCalledWith('1', [1]); // Passing index 1
      expect(screen.getByText('Quotations List')).toBeInTheDocument();
    });
  });

  test('should convert quotation to invoice when convert button is clicked', async () => {
    // Arrange
    const mockQuotations = [
      {
        id: '1',
        customerName: 'John Doe',
        quotationDate: '2025-06-01',
        total: 1000.00,
        status: 'approved',
        items: []
      }
    ];
    
    quotationService.getQuotations.mockResolvedValue(mockQuotations);
    quotationService.getQuotation = jest.fn().mockResolvedValue(mockQuotations[0]);
    quotationService.convertToInvoice = jest.fn().mockResolvedValue({
      success: true,
      message: 'Quotation converted to invoice successfully'
    });
    
    // Mock window.confirm
    jest.spyOn(window, 'confirm').mockReturnValue(true);

    // Act
    const quotationList = new QuotationList(quotationService);
    quotationList.render(document.body);
    
    // Go to detail view
    await waitFor(() => {
      const quotationItem = screen.getByText('Customer: John Doe').closest('.quotation-item');
      fireEvent.click(quotationItem);
    });
    
    // Click convert button
    await waitFor(() => {
      const convertBtn = screen.getByText('Convert to Invoice');
      fireEvent.click(convertBtn);
    });
    
    // Assert
    await waitFor(() => {
      expect(quotationService.convertToInvoice).toHaveBeenCalledWith('1');
    });
  });

  test('should delete quotation when delete button is clicked and confirmed', async () => {
    // Arrange
    const mockQuotations = [
      {
        id: '1',
        customerName: 'John Doe',
        quotationDate: '2025-06-01',
        total: 1000.00,
        status: 'pending',
        items: []
      }
    ];
    
    quotationService.getQuotations.mockResolvedValue(mockQuotations);
    quotationService.getQuotation.mockResolvedValue(mockQuotations[0]);
    quotationService.deleteQuotation = jest.fn().mockResolvedValue({});
    
    // Mock window.confirm
    jest.spyOn(window, 'confirm').mockReturnValue(true);

    // Act
    const quotationList = new QuotationList(quotationService);
    quotationList.render(document.body);
    
    await waitFor(() => {
      expect(screen.getByText('Customer: John Doe')).toBeInTheDocument();
    });
    
    // Go to detail view
    const quotationItem = screen.getByText('Customer: John Doe').closest('.quotation-item');
    fireEvent.click(quotationItem);
    
    await waitFor(() => {
      expect(screen.getByText('Delete Quotation')).toBeInTheDocument();
    });
    
    // Click delete button
    const deleteButton = screen.getByText('Delete Quotation');
    fireEvent.click(deleteButton);
    
    // Assert
    expect(window.confirm).toHaveBeenCalled();
    
    await waitFor(() => {
      expect(quotationService.deleteQuotation).toHaveBeenCalledWith('1');
    });
    
    // Should return to list view (loading state first)
    await waitFor(() => {
      expect(screen.getByText('Quotations List')).toBeInTheDocument();
    });
  });
});
