// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock TextEncoder and TextDecoder for Node.js environment
if (!global.TextEncoder) {
  global.TextEncoder = class TextEncoder {
    constructor() {}
    encode() { return new Uint8Array([]); }
    encodeInto() { return { written: 0, read: 0 }; }
  }
}

if (!global.TextDecoder) {
  global.TextDecoder = class TextDecoder {
    constructor() {}
    decode() { return ''; }
    decodeInto() { return { read: 0, written: 0 }; }
  }
}

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock TextEncoder and TextDecoder for Node.js environment
if (!global.TextEncoder) {
  global.TextEncoder = class TextEncoder {
    constructor() {}
    encode() { return new Uint8Array([]); }
    encodeInto() { return { written: 0, read: 0 }; }
  }
}

if (!global.TextDecoder) {
  global.TextDecoder = class TextDecoder {
    constructor() {}
    decode() { return ''; }
    decodeInto() { return { read: 0, written: 0 }; }
  }
}

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Expose the mock to the global scope
global.jsPDF = global.jspdf
global.window = global.window || {}
window.jspdf = global.jspdf
