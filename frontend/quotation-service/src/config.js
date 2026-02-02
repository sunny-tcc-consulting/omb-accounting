/**
 * Application configuration
 * Values are read from environment variables (injected by Webpack at build time)
 */
const config = {
  // API Configuration
  apiBaseUrl: process.env.API_BASE_URL || '/api/quotations',
  
  // Feature Flags
  useMockData: process.env.USE_MOCK_DATA !== 'false', // Defaults to true if not set to 'false'
  
  // Other constants
  defaultCurrency: 'USD',
  dateFormat: 'YYYY-MM-DD',
};

export default config;