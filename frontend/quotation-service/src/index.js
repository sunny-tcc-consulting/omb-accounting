const QuotationList = require('./components/QuotationList');

// Create the main app
function createApp() {
    const app = document.createElement('div');
    app.className = 'app-container';
    
    const title = document.createElement('h1');
    title.textContent = 'OMB Accounting System - Quotations';
    app.appendChild(title);
    
    const quotationListContainer = document.createElement('div');
    app.appendChild(quotationListContainer);
    
    // Initialize QuotationList component
    const quotationList = new QuotationList();
    quotationList.render(quotationListContainer);
    
    return app;
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const root = document.getElementById('root');
    const app = createApp();
    root.appendChild(app);
});
