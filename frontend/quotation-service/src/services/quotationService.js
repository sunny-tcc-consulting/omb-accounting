import { MockQuotationProvider } from './providers/MockQuotationProvider';
import { ApiQuotationProvider } from './providers/ApiQuotationProvider';
import config from '../config';

class QuotationServiceFactory {
  static getService() {
    if (config.useMockData) {
      console.log('Using MockQuotationProvider');
      return new MockQuotationProvider();
    }
    console.log('Using ApiQuotationProvider with base URL:', config.apiBaseUrl);
    return new ApiQuotationProvider(config.apiBaseUrl);
  }
}

export const quotationService = QuotationServiceFactory.getService();
