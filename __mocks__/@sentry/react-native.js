// The real module needs its native SDK, which does not exist under Jest.
module.exports = {
  init: jest.fn(),
  wrap: jest.fn(component => component),
};
