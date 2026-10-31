const values = new Map();
module.exports = {
  createBarePlatform: jest.fn(() => ({
    storage: {
      getItem: async key => values.get(key) ?? null,
      setItem: async (key, value) => void values.set(key, value),
    },
  })),
};
