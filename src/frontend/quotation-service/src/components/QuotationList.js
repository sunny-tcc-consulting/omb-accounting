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
        <button class="create-quotation-btn