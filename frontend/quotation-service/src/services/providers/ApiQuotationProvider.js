export class ApiQuotationProvider {
  constructor(baseURL = '/api/quotations') {
    this.baseURL = baseURL;
  }

  async getQuotations() {
    const response = await fetch(this.baseURL);
    if (!response.ok) throw new Error('Failed to fetch quotations');
    return response.json();
  }

  async getQuotation(id) {
    const response = await fetch(`${this.baseURL}/${id}`);
    if (!response.ok) {
      if (response.status === 404) return undefined;
      throw new Error(`Failed to fetch quotation ${id}`);
    }
    return response.json();
  }

  async createQuotation(quotationData) {
    const response = await fetch(this.baseURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(quotationData)
    });
    if (!response.ok) throw new Error('Failed to create quotation');
    return response.json();
  }

  async updateQuotation(id, quotationData) {
    const response = await fetch(`${this.baseURL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(quotationData)
    });
    if (!response.ok) throw new Error(`Failed to update quotation ${id}`);
    return response.json();
  }

  async deleteQuotation(id) {
    const response = await fetch(`${this.baseURL}/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error(`Failed to delete quotation ${id}`);
    return response.json();
  }

  async searchQuotations(query) {
    // Assuming backend supports query param, or we filter client side.
    // Following contract, this might be a GET with query params
    const response = await fetch(`${this.baseURL}?q=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('Failed to search quotations');
    return response.json();
  }

  async splitQuotation(quotationId, itemIndices) {
    const response = await fetch(`${this.baseURL}/${quotationId}/split`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemIndices })
    });
    if (!response.ok) throw new Error('Failed to split quotation');
    return response.json();
  }

  async convertToInvoice(quotationId) {
    const response = await fetch(`${this.baseURL}/${quotationId}/convert`, {
      method: 'POST'
    });
    if (!response.ok) throw new Error('Failed to convert quotation to invoice');
    return response.json();
  }
}