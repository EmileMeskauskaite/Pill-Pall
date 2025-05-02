// Mock database module
const mockPool = {
  query: jest.fn().mockResolvedValue([]),
  _cleanup: jest.fn()
};

const createPool = jest.fn().mockReturnValue(mockPool);

// Export the mock functionality
module.exports = {
  query: jest.fn().mockImplementation((...args) => mockPool.query(...args)),
  createPool: jest.fn().mockImplementation(() => createPool()),
  mockPool, // Export for direct access in tests
  createPool, // Export for spying in tests
  _reset: () => {
    mockPool.query.mockClear();
    createPool.mockClear();
    module.exports.query.mockClear();
    module.exports.createPool.mockClear();
  }
};

// DO NOT define afterEach here - it should be in the test file 