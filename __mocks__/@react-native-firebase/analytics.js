// The real module needs the native Firebase SDK, which does not exist under
// Jest. Tests import these shared functions to assert on what was reported.
const instance = {};
module.exports = {
  getAnalytics: jest.fn(() => instance),
  logEvent: jest.fn(() => Promise.resolve()),
  setAnalyticsCollectionEnabled: jest.fn(() => Promise.resolve()),
};
