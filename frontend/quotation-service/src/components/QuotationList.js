// QuotationList Component - Minimal implementation to pass tests
class QuotationList {
  constructor() {
    this.quotations = [];
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

    if (this.quotations.length === 0) {
      return '<div class="no-quotations">No quotations found</div>';
    }

    const quotationsHTML = this.quotations.map(quotation => `
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
    }
  }
}

module.exports = QuotationList;
