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

  constructor(service = null) {
    this.service = service;
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

    // Detail view state
    this.selectedQuotation = null;
    this.splitMode = false;
    this.selectedSplitItems = new Set();
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

    // Show detail view if a quotation is selected
    if (this.selectedQuotation) {
      return this.getQuotationDetailHTML();
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
        <button class="create-quotation-btn" id="create-quotation-btn" aria-label="Create New Quotation">
          <span class="btn-icon" aria-hidden="true">+</span>
          Create New Quotation
        </button>
      </div>
    `;
  }

  getLoadingHTML() {
    return '<div class="loading">Loading quotations...</div>';
  }

  getErrorHTML() {
    return `<div class="error">${this.error?.message || 'Error loading quotations'}</div>`;
  }

  getSearchHTML() {
    return `
      <div class="search-container">
        <input 
          type="text" 
          placeholder="Search quotations..." 
          aria-label="Search quotations"
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
      <div class="quotation-item" data-id="${quotation.id}">
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

  getQuotationDetailHTML() {
    const quotation = this.selectedQuotation;
    
    const itemsHTML = quotation.items.map((item, index) => `
      <div class="detail-item-row">
        ${this.splitMode ? `
          <div class="detail-item-select">
            <input type="checkbox" class="split-checkbox" data-index="${index}" ${this.selectedSplitItems.has(index) ? 'checked' : ''} aria-label="Select item ${item.description || item.itemDescription || 'Item'}">
          </div>
        ` : ''}
        <div class="detail-item-desc">${item.description || item.itemDescription || 'Item'}</div>
        <div class="detail-item-qty">${item.quantity}</div>
        <div class="detail-item-price">${this.formatCurrency(item.price || item.unitPrice || 0)}</div>
        <div class="detail-item-total">${this.formatCurrency((item.price || item.unitPrice || 0) * item.quantity)}</div>
      </div>
    `).join('');

    return `
      <div class="quotation-header">
        ${this.splitMode ? 'Split Quotation' : `Quotation Details #${quotation.id}`}
      </div>
      <div class="detail-view-container">
        ${this.splitMode ? `
          <div class="split-instruction">Select items to move to new quotation</div>
          <div class="detail-actions">
            <button class="cancel-btn" id="cancel-split-btn">Cancel Split</button>
            <button class="save-btn" id="confirm-split-btn">Confirm Split</button>
          </div>
        ` : `
          <div class="detail-actions">
            <button class="back-btn" id="back-to-list-btn">Back to List</button>
            <button class="split-btn" id="split-quotation-btn">Split Quotation</button>
            <button class="convert-btn" id="convert-quotation-btn">Convert to Invoice</button>
            <button class="delete-btn" id="delete-quotation-btn">Delete Quotation</button>
          </div>
        `}
        
        <div class="detail-section">
          <h3>Customer Information</h3>
          <div class="detail-row">
            <span class="detail-label">Name:</span>
            <span class="detail-value">${quotation.customerName}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Date:</span>
            <span class="detail-value">${quotation.quotationDate}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Status:</span>
            <span class="detail-value status-${quotation.status.toLowerCase()}">${quotation.status}</span>
          </div>
        </div>

        <div class="detail-section">
          <h3>Items</h3>
          <div class="detail-items-header">
            ${this.splitMode ? '<div class="detail-item-select">Select</div>' : ''}
            <div class="detail-item-desc">Description</div>
            <div class="detail-item-qty">Qty</div>
            <div class="detail-item-price">Price</div>
            <div class="detail-item-total">Total</div>
          </div>
          <div class="detail-items-list">
            ${itemsHTML}
          </div>
          <div class="detail-total-row">
            <span class="detail-total-label">Total:</span>
            <span class="detail-total-value">${this.formatCurrency(quotation.total)}</span>
          </div>
        </div>
      </div>
    `;
  }

  formatCurrency(amount) {
    return `$${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  }

  /**
   * Handles switching back to the list view
   */
  handleBackToList() {
    this.selectedQuotation = null;
    this.updateDisplay();
  }

  /**
   * Handles the deletion of a quotation
   * Shows confirmation dialog and updates list on success
   */
  async handleDeleteQuotation() {
    if (!this.selectedQuotation) return;

    if (confirm('Are you sure you want to delete this quotation? This action cannot be undone.')) {
      try {
        this.loading = true;
        this.updateDisplay();

        const quotationService = await this.getService();
        await quotationService.deleteQuotation(this.selectedQuotation.id);
        
        // Return to list and reload
        this.selectedQuotation = null;
        this.quotations = await quotationService.getQuotations();
        this.filteredQuotations = [...this.quotations];
        
        this.loading = false;
        this.updateDisplay();
      } catch (error) {
        this.loading = false;
        this.error = error;
        this.updateDisplay();
      }
    }
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
            <button type="button" class="remove-item-btn" data-item-index="${index}" aria-label="Remove item ${index + 1}">Remove</button>
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

      const quotationService = await this.getService();
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
    this.attachGlobalListeners();

    // Create form event listeners
    if (this.showCreateForm) {
      this.attachCreateFormListeners();
    } 
    // Detail view event listeners
    else if (this.selectedQuotation) {
      this.attachDetailViewListeners();
    } 
    // List view event listeners
    else {
      this.attachListViewListeners();
    }
  }

  attachGlobalListeners() {
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
  }

  attachListViewListeners() {
    const quotationItems = this.container?.querySelectorAll('.quotation-item');
    quotationItems.forEach(item => {
      item.addEventListener('click', () => {
        const id = item.dataset.id;
        this.handleViewQuotation(id);
      });
    });
  }

  attachDetailViewListeners() {
    const backBtn = this.container?.querySelector('#back-to-list-btn');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        this.handleBackToList();
      });
    }

    const splitBtn = this.container?.querySelector('#split-quotation-btn');
    if (splitBtn) {
      splitBtn.addEventListener('click', () => {
        this.handleSplitQuotation();
      });
    }

    const convertBtn = this.container?.querySelector('#convert-quotation-btn');
    if (convertBtn) {
      convertBtn.addEventListener('click', () => {
        this.handleConvertToInvoice();
      });
    }

    const deleteBtn = this.container?.querySelector('#delete-quotation-btn');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => {
        this.handleDeleteQuotation();
      });
    }

    // Split mode listeners
    if (this.splitMode) {
      this.attachSplitModeListeners();
    }
  }

  attachSplitModeListeners() {
    const cancelSplitBtn = this.container?.querySelector('#cancel-split-btn');
    if (cancelSplitBtn) {
      cancelSplitBtn.addEventListener('click', () => {
        this.handleCancelSplit();
      });
    }

    const confirmSplitBtn = this.container?.querySelector('#confirm-split-btn');
    if (confirmSplitBtn) {
      confirmSplitBtn.addEventListener('click', () => {
        this.handleConfirmSplit();
      });
    }

    const checkboxes = this.container?.querySelectorAll('.split-checkbox');
    checkboxes.forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const index = parseInt(e.target.dataset.index);
        if (e.target.checked) {
          this.selectedSplitItems.add(index);
        } else {
          this.selectedSplitItems.delete(index);
        }
      });
    });
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

  /**
   * Handles viewing a specific quotation details
   * @param {string} id - The ID of the quotation to view
   */
  async handleViewQuotation(id) {
    try {
      this.loading = true;
      this.updateDisplay();

      const quotationService = await this.getService();
      this.selectedQuotation = await quotationService.getQuotation(id);
      
      this.loading = false;
      this.updateDisplay();
    } catch (error) {
      this.loading = false;
      this.error = error;
      this.updateDisplay();
    }
  }

  /**
   * Enters the split quotation mode
   */
  handleSplitQuotation() {
    this.splitMode = true;
    this.selectedSplitItems = new Set();
    this.updateDisplay();
  }

  /**
   * Cancels the split mode and returns to normal detail view
   */
  handleCancelSplit() {
    this.splitMode = false;
    this.selectedSplitItems = new Set();
    this.updateDisplay();
  }

  /**
   * Confirms the split operation
   * Validates selection and calls service to split quotation
   */
  async handleConfirmSplit() {
    if (this.selectedSplitItems.size === 0) {
      alert('Please select at least one item to split');
      return;
    }

    try {
      this.loading = true;
      this.updateDisplay();

      const quotationService = await this.getService();
      await quotationService.splitQuotation(this.selectedQuotation.id, Array.from(this.selectedSplitItems));
      
      // Refresh list
      this.quotations = await quotationService.getQuotations();
      this.filteredQuotations = [...this.quotations];
      
      // Return to list view
      this.splitMode = false;
      this.selectedQuotation = null;
      this.loading = false;
      this.updateDisplay();
    } catch (error) {
      this.loading = false;
      this.error = error;
      this.updateDisplay();
    }
  }

  /**
   * Handles converting the current quotation to an invoice
   */
  async handleConvertToInvoice() {
    if (!this.selectedQuotation) return;

    if (confirm('Are you sure you want to convert this quotation to an invoice?')) {
      try {
        this.loading = true;
        this.updateDisplay();

        const quotationService = await this.getService();
        await quotationService.convertToInvoice(this.selectedQuotation.id);
        
        // Refresh list
        this.quotations = await quotationService.getQuotations();
        this.filteredQuotations = [...this.quotations];
        
        // Update selected quotation to reflect new status
        this.selectedQuotation = await quotationService.getQuotation(this.selectedQuotation.id);
        
        this.loading = false;
        this.updateDisplay();
        alert('Quotation converted to invoice successfully!');
      } catch (error) {
        this.loading = false;
        this.error = error;
        this.updateDisplay();
      }
    }
  }

  // Create quotation methods
  /**
   * Shows the create quotation form
   */
  showCreateQuotationForm() {
    this.showCreateForm = true;
    this.resetCreateForm();
    this.updateDisplay();
  }

  /**
   * Cancels quotation creation and returns to list
   */
  cancelCreateQuotation() {
    this.showCreateForm = false;
    this.resetCreateForm();
    this.updateDisplay();
  }

  /**
   * Resets the create form state
   */
  resetCreateForm() {
    this.createFormData = {
      customerName: '',
      items: [{ description: '', quantity: 1, price: 0 }]
    };
    this.createFormErrors = {};
    this.selectedQuotation = null;
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

  /**
   * Handles the submission of the create quotation form
   * Validates input and calls service to create quotation
   */
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

      const quotationService = await this.getService();
      
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

  async getService() {
    if (this.service) {
      return this.service;
    }
    const { quotationService } = await import('../services/quotationService');
    this.service = quotationService;
    return quotationService;
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

