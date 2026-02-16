// Mock jsPDF
function jsPDFMock() {
  return {
    setProperties: jest.fn(),
    setFontSize: jest.fn(),
    text: jest.fn(),
    autoTable: jest.fn(),
    addPage: jest.fn(),
    save: jest.fn(),
  }
}

jsPDFMock.setProperties = jest.fn()
jsPDFMock.setFontSize = jest.fn()
jsPDFMock.text = jest.fn()
jsPDFMock.autoTable = jest.fn()
jsPDFMock.addPage = jest.fn()
jsPDFMock.save = jest.fn()

module.exports = jsPDFMock
