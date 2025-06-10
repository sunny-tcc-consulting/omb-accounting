// QuotationList Component - Minimal implementation to pass tests
class QuotationList {
  constructor() {
    this.quotations = [];
    this.filteredQuotations = [];
    this.searchTerm = '';
    this.loading = false;
    this.error = null;
    this.container = null;
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
      return '<div class="loading">Loading quotations...</div>';
    }

    if (this.error) {
      return '<div class="error">Error loading quotations</div>';
    }

    // Display search input
    const searchHTML = `
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

    if (this.quotations.length === 0) {
      return searchHTML + '<div class="no-quotations">No quotations found</div>';
    }

    // Determine which quotations to show
    const quotationsToShow = this.searchTerm ? this.filteredQuotations : this.quotations;

    if (quotationsToShow.length === 0 && this.searchTerm) {
      return `
        <div class="quotation-header">Quotations List</div>
        ${searchHTML}
        <div class="no-quotations">No quotations match your search</div>
      `;
    }

    const quotationsHTML = quotationsToShow.map(quotation => `
      <div class="quotation-item">
        <div class="quotation-id">Quotation #${quotation.id}</div>
        <div class="quotation-customer">Customer: ${quotation.customerName}</div>
        <div class="quotation-details">
          <div class="quotation-amount">$${quotation.total.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</div>
          <div class="quotation-date">${quotation.quotationDate}</div>
          <div class="quotation-status status-${quotation.status.toLowerCase()}">${quotation.status}</div>
        </div>
      </div>
    `).join('');

    return `
      <div class="quotation-header">Quotations List</div>
      ${searchHTML}
      <div class="quotations-container">
        ${quotationsHTML}
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
    const searchInput = this.container?.querySelector('#quotation-search');
    if (searchInput) {
      searchInput.addEventListener('input', (event) => {
        this.handleSearch(event.target.value);
      });
    }
  }

  handleSearch(searchTerm) {
    this.searchTerm = searchTerm.toLowerCase();
    
    if (!searchTerm.trim()) {
      this.filteredQuotations = [...this.quotations];
    } else {
      this.filteredQuotations = this.quotations.filter(quotation => {
        return (
          quotation.customerName.toLowerCase().includes(this.searchTerm) ||
          quotation.id.toLowerCase().includes(this.searchTerm) ||
          quotation.status.toLowerCase().includes(this.searchTerm)
        );
      });
    }
    
    this.updateDisplay();
  }
}

module.exports = QuotationList;
