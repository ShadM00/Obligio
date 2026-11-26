// The real module talks to a native module that does not exist under Jest.
module.exports = {
  __esModule: true,
  default: {
    init: jest.fn(() => Promise.resolve()),
    requestPermission: jest.fn(() => Promise.resolve('granted')),
    setMarketingConsent: jest.fn(() => Promise.resolve()),
  },
};
