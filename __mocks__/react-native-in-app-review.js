// The real module needs the native review SDKs, which do not exist under Jest.
module.exports = {
  __esModule: true,
  default: {
    isAvailable: jest.fn(() => true),
    RequestInAppReview: jest.fn(() => Promise.resolve(true)),
  },
};
