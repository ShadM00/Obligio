const instance = {};
module.exports = {
  getCrashlytics: jest.fn(() => instance),
  log: jest.fn(),
  recordError: jest.fn(),
  setCrashlyticsCollectionEnabled: jest.fn(() => Promise.resolve()),
};
