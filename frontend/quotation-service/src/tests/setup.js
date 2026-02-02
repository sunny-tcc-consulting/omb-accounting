require('@testing-library/jest-dom');

// Global test setup
global.fetch = require('jest-fetch-mock');

// Mock window.alert and window.confirm globally
// JSDOM does not implement these, so we mock them to avoid errors
Object.defineProperty(window, 'alert', { value: jest.fn() });
Object.defineProperty(window, 'confirm', { value: jest.fn(() => true) });

