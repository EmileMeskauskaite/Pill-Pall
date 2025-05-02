const db = require('./db');

// Mock the database before all tests
jest.mock('./db');

// Clean up after all tests complete
afterAll(async () => {
  // If there's any actual connection to close
  if (db.end && typeof db.end === 'function') {
    await db.end();
  }
  
  // For extra safety, clear any pending timeouts/intervals
  jest.useRealTimers();
}); 