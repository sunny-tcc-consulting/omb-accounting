import { ApiQuotationProvider } from './ApiQuotationProvider';

describe('ApiQuotationProvider', () => {
  let provider;
  const baseUrl = '/api/quotations';

  beforeEach(() => {
    provider = new ApiQuotationProvider(baseUrl);
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getQuotations', () => {
    it('should fetch all quotations', async () => {
      const mockQuotations = [{ id: '1', title: 'Test' }];
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockQuotations,
      });

      const result = await provider.getQuotations();

      expect(global.fetch).toHaveBeenCalledWith(baseUrl);
      expect(result).toEqual(mockQuotations);
    });

    it('should throw error when fetch fails', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
      });

      await expect(provider.getQuotations()).rejects.toThrow('Failed to fetch quotations');
    });
  });

  describe('getQuotation', () => {
    it('should fetch a single quotation by id', async () => {
      const mockQuotation = { id: '1', title: 'Test' };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockQuotation,
      });

      const result = await provider.getQuotation('1');

      expect(global.fetch).toHaveBeenCalledWith(`${baseUrl}/1`);
      expect(result).toEqual(mockQuotation);
    });

    it('should return undefined for 404', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const result = await provider.getQuotation('999');
      expect(result).toBeUndefined();
    });

    it('should throw error for other failures', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(provider.getQuotation('1')).rejects.toThrow('Failed to fetch quotation 1');
    });
  });

  describe('createQuotation', () => {
    it('should create a quotation', async () => {
      const newQuotation = { title: 'New Quote' };
      const createdQuotation = { id: '2', ...newQuotation };
      
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => createdQuotation,
      });

      const result = await provider.createQuotation(newQuotation);

      expect(global.fetch).toHaveBeenCalledWith(baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newQuotation),
      });
      expect(result).toEqual(createdQuotation);
    });

    it('should throw error when creation fails', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
      });

      await expect(provider.createQuotation({})).rejects.toThrow('Failed to create quotation');
    });
  });

  describe('updateQuotation', () => {
    it('should update a quotation', async () => {
      const updateData = { title: 'Updated' };
      const updatedQuotation = { id: '1', ...updateData };
      
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => updatedQuotation,
      });

      const result = await provider.updateQuotation('1', updateData);

      expect(global.fetch).toHaveBeenCalledWith(`${baseUrl}/1`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      expect(result).toEqual(updatedQuotation);
    });

    it('should throw error when update fails', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
      });

      await expect(provider.updateQuotation('1', {})).rejects.toThrow('Failed to update quotation 1');
    });
  });

  describe('deleteQuotation', () => {
    it('should delete a quotation', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      await provider.deleteQuotation('1');

      expect(global.fetch).toHaveBeenCalledWith(`${baseUrl}/1`, {
        method: 'DELETE',
      });
    });

    it('should throw error when delete fails', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
      });

      await expect(provider.deleteQuotation('1')).rejects.toThrow('Failed to delete quotation 1');
    });
  });

  describe('searchQuotations', () => {
    it('should search quotations with query param', async () => {
      const query = 'test query';
      const mockResults = [{ id: '1', title: 'test query result' }];
      
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResults,
      });

      const result = await provider.searchQuotations(query);

      expect(global.fetch).toHaveBeenCalledWith(`${baseUrl}?q=test%20query`);
      expect(result).toEqual(mockResults);
    });
  });

  describe('splitQuotation', () => {
    it('should split a quotation', async () => {
      const itemIndices = [0, 2];
      const mockResponse = { success: true, newQuotationId: 'new-id' };
      
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await provider.splitQuotation('1', itemIndices);

      expect(global.fetch).toHaveBeenCalledWith(`${baseUrl}/1/split`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemIndices }),
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('convertToInvoice', () => {
    it('should convert quotation to invoice', async () => {
      const mockResponse = { success: true, invoiceId: 'inv-1' };
      
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await provider.convertToInvoice('1');

      expect(global.fetch).toHaveBeenCalledWith(`${baseUrl}/1/convert`, {
        method: 'POST',
      });
      expect(result).toEqual(mockResponse);
    });
  });
});