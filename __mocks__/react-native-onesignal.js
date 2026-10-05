// The real module needs the native OneSignal SDK, which does not exist under Jest.
const OneSignal = {
  initialize: jest.fn(),
  login: jest.fn(),
  Notifications: {requestPermission: jest.fn(() => Promise.resolve(false))},
  User: {
    addTag: jest.fn(),
    removeTag: jest.fn(),
    getTags: jest.fn(() => Promise.resolve({})),
  },
};
module.exports = {OneSignal};
