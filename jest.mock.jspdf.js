// Mock jsPDF for jest
const jsPDFMock = jest.fn(() => {
  const instance = {
    setFont: jest.fn(),
    setFontSize: jest.fn(),
    text: jest.fn(),
    addPage: jest.fn(),
    autoTable: jest.fn(() => {
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

jsPDFMock.setProperties = jest.fn();
jsPDFMock.setFontSize = jest.fn();
jsPDFMock.text = jest.fn();
jsPDFMock.autoTable = jest.fn();
jsPDFMock.addPage = jest.fn();
jsPDFMock.save = jest.fn();

module.exports = jsPDFMock;