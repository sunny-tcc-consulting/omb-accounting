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

// Mock jsPDF
jest.mock('jspdf', () => {
  const jsPDFMock = jest.fn(() => {
    const instance = {
      setFont: jest.fn(),
      setFontSize: jest.fn(),
      text: jest.fn(),
      addPage: jest.fn(),
      autoTable: jest.fn((data) => {
        instance.lastAutoTable = {
          finalY: 120,
          table: {
            footer: [],
            header: [],
            body: [],
            footerStyles: {},
            headerStyles: {},
            bodyStyles: {},
            allStyles: {},
            startY: 120,
            endY: 120,
            finalY: 120,
            tableWidth: 0,
            tableHeight: 0,
            width: 0,
            height: 0,
          },
        };
        return instance;
      }),
      setTextColor: jest.fn(),
      setDrawColor: jest.fn(),
      setLineWidth: jest.fn(),
      line: jest.fn(),
      rect: jest.fn(),
      save: jest.fn(),
      getFontList: jest.fn(),
      setFontProperties: jest.fn(),
      addFileToVFS: jest.fn(),
      addImage: jest.fn(),
      setFileVFSName: jest.fn(),
      setFileVFS: jest.fn(),
      setProperties: jest.fn(),
      setFillColor: jest.fn(),
      setLineDash: jest.fn(),
      getLineWidth: jest.fn(),
      getLineDash: jest.fn(),
      getDrawColor: jest.fn(),
      getCurrentPage: jest.fn(),
      setPage: jest.fn(),
      getNumberOfPages: jest.fn(() => 1),
      getNumberOfFonts: jest.fn(() => 0),
      getFontList: jest.fn(() => []),
      getFont: jest.fn(),
      getFontSize: jest.fn(() => 10),
      getFontAscent: jest.fn(() => 0),
      getFontDescent: jest.fn(() => 0),
      getFontHeight: jest.fn(() => 0),
      getFontStringWidth: jest.fn(() => 0),
      getFontStringArrayWidth: jest.fn(() => 0),
      getStringWidth: jest.fn(() => 0),
      getTextDimensions: jest.fn(() => ({ width: 0, height: 0 })),
      getTextLines: jest.fn(() => []),
      splitTextToSize: jest.fn(() => []),
      getCurrentPageInfo: jest.fn(() => ({})),
      getDoc: jest.fn(() => ({})),
      internal: {
        getNumberOfPages: jest.fn(() => 1),
        pageSize: {
          getWidth: jest.fn(() => 210),
          getHeight: jest.fn(() => 297),
        },
        scaleFactor: 1,
      },
    };
    return instance;
  });

  return {
    jsPDF: jsPDFMock,
    default: jsPDFMock,
  };
});

// Mock jsPDF-AutoTable
jest.mock('jspdf-autotable', () => {
  return jest.fn((data, doc) => {
    if (doc && doc.lastAutoTable) {
      doc.lastAutoTable.finalY = 120;
    }
    return doc;
  });
});
