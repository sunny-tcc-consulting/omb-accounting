// QuotationList Component - Professional implementation with search functionality
/**
 * QuotationList Component
 * 
 * A comprehensive component for managing quotations with features:
 * - List display with search functionality
 * - Create new quotations with validation
 * - Real-time search with debouncing
 * - Responsive design and professional UI
 */
class QuotationList {
  // Configuration constants
  static SEARCH_DEBOUNCE_DELAY = 300; // ms
  static VALIDATION_MESSAGES = {
    CUSTOMER_NAME_REQUIRED: 'Customer name is required',
    AT_LEAST_ONE_ITEM_REQUIRED: 'At least one item is required'
  };

  constructor() {
    this.quotations = [];
    this.filteredQuotations = [];
    this.searchTerm = '';
    this.loading = false;
    this.error = null;
    this.container = null;
    this.searchDebounceTimer = null;
    
    // Create quotation state
    this.showCreateForm = false;
    this.createFormData = {
      customerName: '',
      items: [{ description: '', quantity: 1, price: 0 }]
    };
    this.createFormErrors = {};
  }

  render(parentElement) {
    this.container = document.createElement('div');
    this.container.id = 'quotation-list';
    this.container.className = 'quotation-list';
    
    parentElement.appendChild(this.container);
    this.updateDisplay();
    this.attachEventListeners();
    
    // Auto-load quotations when component is rendered
    this.load();
    
    return this.container;
  }

  getHTML() {
    if (this.loading) {
      return this.getLoadingHTML();
    }

    if (this.error) {
      return this.getErrorHTML();
    }

    // Show create form if in create mode
    if (this.showCreateForm) {
      return this.getCreateFormHTML();
    }

    // Show list view
    return this.getListViewHTML();
  }

  getListViewHTML() {
    const searchHTML = this.getSearchHTML();
    const createButtonHTML = this.getCreateButtonHTML();

    if (this.quotations.length === 0) {
      return createButtonHTML + searchHTML + this.getEmptyStateHTML();
    }

    const quotationsToShow = this.searchTerm ? this.filteredQuotations : this.quotations;

    if (quotationsToShow.length === 0 && this.searchTerm) {
      return this.getNoSearchResultsHTML(createButtonHTML + searchHTML);
    }

    return this.getQuotationListHTML(createButtonHTML + searchHTML, quotationsToShow);
  }

  getCreateButtonHTML() {
    return `
      <div class="create-button-container">
        <button class="create-quotation-btn" id="create-quotation-btn">
          <span class="btn-icon">+</span>
          Create New Quotation
        </button>
      </div>
    `;
  }

  getLoadingHTML() {
    return '<div class="loading">Loading quotations...</div>';
  }

  getErrorHTML() {
    return '<div class="error">Error loading quotations</div>';
  }

  getSearchHTML() {
    return `
      <div class="search-container">
        <input 
          type="text" 
          placeholder="Search quotations..." 
          value="${this.searchTerm}"
          class="search-input"
          id="quotation-search"
        />
      </div>
    `;
  }

  getEmptyStateHTML() {
    return '<div class="no-quotations">No quotations found</div>';
  }

  getNoSearchResultsHTML(headerHTML) {
    return `
      <div class="quotation-header">Quotations List</div>
      ${headerHTML}
      <div class="no-quotations">No quotations match your search</div>
    `;
  }

  getQuotationListHTML(headerHTML, quotationsToShow) {
    const quotationsHTML = quotationsToShow.map(quotation => 
      this.getQuotationItemHTML(quotation)
    ).join('');

    return `
      <div class="quotation-header">Quotations List</div>
      ${headerHTML}
      <div class="quotations-container">
        ${quotationsHTML}
      </div>
    `;
  }

  getQuotationItemHTML(quotation) {
    return `
      <div class="quotation-item">
        <div class="quotation-id">Quotation #${quotation.id}</div>
        <div class="quotation-customer">Customer: ${quotation.customerName}</div>
        <div class="quotation-details">
          <div class="quotation-amount">${this.formatCurrency(quotation.total)}</div>
          <div class="quotation-date">${quotation.quotationDate}</div>
          <div class="quotation-status status-${quotation.status.toLowerCase()}">${quotation.status}</div>
        </div>
      </div>
    `;
  }

  formatCurrency(amount) {
    return `$${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  }

  getCreateFormHTML() {
    const itemsHTML = this.createFormData.items.map((item, index) => `
      <div class="form-item" data-item-index="${index}">
        <div class="form-row">
          <div class="form-group">
            <label for="item-desc-${index}">Item Description</label>
            <input 
              type="text" 
              id="item-desc-${index}" 
              value="${item.description}" 
              placeholder="Enter item description"
              data-field="description"
              data-item-index="${index}"
            />
          </div>
          <div class="form-group">
            <label for="item-qty-${index}">Quantity</label>
            <input 
              type="number" 
              id="item-qty-${index}" 
              value="${item.quantity}" 
              min="1"
              data-field="quantity"
              data-item-index="${index}"
            />
          </div>
          <div class="form-group">
            <label for="item-price-${index}">Price</label>
            <input 
              type="number" 
              id="item-price-${index}" 
              value="${item.price}" 
              min="0"
              step="0.01"
              data-field="price"
              data-item-index="${index}"
            />
          </div>
          <div class="form-group">
            <button type="button" class="remove-item-btn" data-item-index="${index}">Remove</button>
          </div>
        </div>
      </div>
    `).join('');

    return `
      <div class="quotation-header">New Quotation</div>
      <div class="create-form-container">
        <form class="quotation-form" id="quotation-form">
          <div class="form-section">
            <h3>Customer Information</h3>
            <div class="form-group">
              <label for="customer-name">Customer Name</label>
              <input 
                type="text" 
                id="customer-name" 
                value="${this.createFormData.customerName}" 
                placeholder="Enter customer name"
                required
              />
              ${this.createFormErrors.customerName ? `<div class="error-message">${this.createFormErrors.customerName}</div>` : ''}
            </div>
          </div>

          <div class="form-section">
            <h3>Items</h3>
            <div class="items-container">
              ${itemsHTML}
              ${this.createFormErrors.items ? `<div class="error-message">${this.createFormErrors.items}</div>` : ''}
            </div>
            <button type="button" class="add-item-btn" id="add-item-btn">+ Add Item</button>
          </div>

          <div class="form-actions">
            <button type="button" class="cancel-btn" id="cancel-btn">Cancel</button>
            <button type="submit" class="save-btn" id="save-btn">Save Quotation</button>
          </div>
        </form>
      </div>
    `;
  }

  async load() {
    try {
      this.loading = true;
      this.error = null;
      this.updateDisplay();

      // Import the service dynamically to avoid import issues during testing
      const { quotationService } = await import('../services/quotationService');
      this.quotations = await quotationService.getQuotations();
      this.filteredQuotations = [...this.quotations]; // Initialize filtered quotations
      
      this.loading = false;
      this.updateDisplay();
    } catch (error) {
      this.loading = false;
      this.error = error;
      this.updateDisplay();
    }
  }

  updateDisplay() {
    if (this.container) {
      this.container.innerHTML = this.getHTML();
      this.attachEventListeners(); // Re-attach event listeners after DOM update
    }
  }

  attachEventListeners() {
    // Search functionality
    const searchInput = this.container?.querySelector('#quotation-search');
    if (searchInput) {
      searchInput.addEventListener('input', (event) => {
        this.debouncedSearch(event.target.value);
      });
    }

    // Create quotation button
    const createBtn = this.container?.querySelector('#create-quotation-btn');
    if (createBtn) {
      createBtn.addEventListener('click', () => {
        this.showCreateQuotationForm();
      });
    }

    // Create form event listeners
    if (this.showCreateForm) {
      this.attachCreateFormListeners();
    }
  }

  attachCreateFormListeners() {
    // Customer name input
    const customerNameInput = this.container?.querySelector('#customer-name');
    if (customerNameInput) {
      customerNameInput.addEventListener('input', (event) => {
        this.createFormData.customerName = event.target.value;
        this.clearFormError('customerName');
      });
    }

    // Item inputs
    const itemInputs = this.container?.querySelectorAll('[data-field]');
    itemInputs.forEach(input => {
      input.addEventListener('input', (event) => {
        const field = event.target.dataset.field;
        const itemIndex = parseInt(event.target.dataset.itemIndex);
        let value = event.target.value;
        
        if (field === 'quantity') {
          value = parseInt(value) || 1;
        } else if (field === 'price') {
          value = parseFloat(value) || 0;
        }
        
        this.createFormData.items[itemIndex][field] = value;
        this.clearFormError('items');
      });
    });

    // Add item button
    const addItemBtn = this.container?.querySelector('#add-item-btn');
    if (addItemBtn) {
      addItemBtn.addEventListener('click', () => {
        this.addFormItem();
      });
    }

    // Remove item buttons
    const removeItemBtns = this.container?.querySelectorAll('.remove-item-btn');
    removeItemBtns.forEach(btn => {
      btn.addEventListener('click', (event) => {
        const itemIndex = parseInt(event.target.dataset.itemIndex);
        this.removeFormItem(itemIndex);
      });
    });

    // Form submission
    const form = this.container?.querySelector('#quotation-form');
    if (form) {
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        this.handleCreateQuotation();
      });
    }

    // Cancel button
    const cancelBtn = this.container?.querySelector('#cancel-btn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        this.cancelCreateQuotation();
      });
    }
  }

  /**
   * Debounced search with configurable delay
   * @param {string} searchTerm - The search term to filter by
   */
  debouncedSearch(searchTerm) {
    // Clear existing timer for better performance
    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
    }
    
    // Set new timer for debounced search
    this.searchDebounceTimer = setTimeout(() => {
      this.handleSearch(searchTerm);
    }, QuotationList.SEARCH_DEBOUNCE_DELAY);
  }

  handleSearch(searchTerm) {
    this.searchTerm = searchTerm.toLowerCase().trim();
    
    if (!this.searchTerm) {
      this.filteredQuotations = [...this.quotations];
    } else {
      this.filteredQuotations = this.quotations.filter(quotation => 
        this.matchesSearchTerm(quotation)
      );
    }
    
    this.updateDisplay();
  }

  matchesSearchTerm(quotation) {
    const searchFields = [
      quotation.customerName.toLowerCase(),
      quotation.id.toLowerCase(),
      quotation.status.toLowerCase()
    ];
    
    return searchFields.some(field => field.includes(this.searchTerm));
  }

  // Create quotation methods
  showCreateQuotationForm() {
    this.showCreateForm = true;
    this.resetCreateForm();
    this.updateDisplay();
  }

  cancelCreateQuotation() {
    this.showCreateForm = false;
    this.resetCreateForm();
    this.updateDisplay();
  }

  resetCreateForm() {
    this.createFormData = {
      customerName: '',
      items: [{ description: '', quantity: 1, price: 0 }]
    };
    this.createFormErrors = {};
  }

  addFormItem() {
    this.createFormData.items.push({ description: '', quantity: 1, price: 0 });
    this.updateDisplay();
  }

  removeFormItem(index) {
    if (this.createFormData.items.length > 1) {
      this.createFormData.items.splice(index, 1);
      this.updateDisplay();
    }
  }

  clearFormError(field) {
    delete this.createFormErrors[field];
  }

  /**
   * Validates the create quotation form
   * @returns {boolean} True if form is valid, false otherwise
   */
  validateCreateForm() {
    this.createFormErrors = {};
    
    // Validate customer name
    if (!this.createFormData.customerName.trim()) {
      this.createFormErrors.customerName = QuotationList.VALIDATION_MESSAGES.CUSTOMER_NAME_REQUIRED;
    }

    // Validate items
    const validItems = this.createFormData.items.filter(item => 
      item.description.trim() && item.quantity > 0 && item.price >= 0
    );
    
    if (validItems.length === 0) {
      this.createFormErrors.items = QuotationList.VALIDATION_MESSAGES.AT_LEAST_ONE_ITEM_REQUIRED;
    }

    return Object.keys(this.createFormErrors).length === 0;
  }

  async handleCreateQuotation() {
    // Sync form data from DOM before validation
    this.syncFormDataFromDOM();
    
    if (!this.validateCreateForm()) {
      this.updateDisplay(); // Make sure to update display to show errors
      return;
    }

    try {
      this.loading = true;
      this.updateDisplay();

      // Import the service dynamically
      const { quotationService } = await import('../services/quotationService');
      
      // Filter out empty items
      const validItems = this.createFormData.items.filter(item => 
        item.description.trim() && item.quantity > 0 && item.price >= 0
      );

      const quotationData = {
        customerName: this.createFormData.customerName.trim(),
        items: validItems
      };

      const newQuotation = await quotationService.createQuotation(quotationData);
      
      // Add new quotation to the list
      this.quotations.unshift(newQuotation);
      this.filteredQuotations = [...this.quotations];
      
      // Return to list view
      this.showCreateForm = false;
      this.loading = false;
      this.resetCreateForm();
      this.updateDisplay();
      
    } catch (error) {
      this.loading = false;
      this.error = error;
      this.updateDisplay();
    }
  }

  /**
   * Synchronizes form data from DOM inputs before validation
   * This ensures that any user input is captured before form submission
   */
  syncFormDataFromDOM() {
    // Sync customer name
    const customerNameInput = this.container?.querySelector('#customer-name');
    if (customerNameInput) {
      this.createFormData.customerName = customerNameInput.value;
    }

    // Sync item data
    const itemInputs = this.container?.querySelectorAll('[data-field]');
    itemInputs.forEach(input => {
      const field = input.dataset.field;
      const itemIndex = parseInt(input.dataset.itemIndex);
      
      if (this.createFormData.items[itemIndex]) {
        let value = input.value;
        
        if (field === 'quantity') {
          value = parseInt(value) || 1;
        } else if (field === 'price') {
          value = parseFloat(value) || 0;
        }
        
        this.createFormData.items[itemIndex][field] = value;
      }
    });
  }

  // Cleanup method to prevent memory leaks
  destroy() {
    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
    }
    
    // Clear references to prevent memory leaks
    this.container = null;
    this.quotations = [];
    this.filteredQuotations = [];
  }
}

module.exports = QuotationList;
