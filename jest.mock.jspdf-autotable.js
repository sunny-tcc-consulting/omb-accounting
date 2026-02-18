// Mock jsPDF-AutoTable for jest
const autoTableMock = jest.fn((data, doc) => {
  if (doc) {
    doc.lastAutoTable = {
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
  }
});

module.exports = autoTableMock;