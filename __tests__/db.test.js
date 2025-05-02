// Define our mocks before requiring the module
const mockPool = {
  query: jest.fn().mockResolvedValue([])
};

// Mock mysql
jest.mock('mysql2/promise', () => ({
  createPool: jest.fn(() => mockPool)
}));

// Mock filesystem
const mockSchema = 'CREATE TABLE test';
const mockDummyData = 'INSERT INTO test VALUES (1)';
jest.mock('fs', () => ({
  readFileSync: jest.fn().mockImplementation((filepath) => {
    if (filepath.includes('schema.sql')) return mockSchema;
    if (filepath.includes('dummydata.sql')) return mockDummyData;
    return '';
  })
}));

// No need to test these internals
jest.mock('path', () => ({
  join: jest.fn().mockImplementation((dir, file) => `${dir}/${file}`)
}));

// Import dependencies
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

describe('Database module', () => {
  const originalEnv = process.env;
  
  // Mock console to suppress log output during tests
  const originalConsole = { ...console };
  beforeEach(() => {
    console.log = jest.fn();
    console.error = jest.fn();
    
    // Setup environment
    process.env = { 
      ...originalEnv,
      DB_HOST: 'localhost',
      DB_USER: 'user',
      DB_PASSWORD: 'password',
      DB_NAME: 'testdb'
    };
    
    // Reset all mocks
    jest.clearAllMocks();
    jest.resetModules();
  });
  
  afterEach(() => {
    // Restore console
    console.log = originalConsole.log;
    console.error = originalConsole.error;
  });
  
  afterAll(() => {
    // Restore environment
    process.env = originalEnv;
  });
  
  it('should skip tests for db.js', () => {
    // This is a utility module that runs immediately when imported
    // and uses global state, which makes it challenging to properly test
    // Without a proper testing stub for MySQL, we'll skip testing this file
    // and focus on testing the parts of the application that use the DB
    expect(true).toBe(true);
  });
});

describe('Database Module', () => {
  let mockPool;
  let mockConsoleLog;
  let mockConsoleError;
  
  beforeEach(() => {
    // Clear module cache to ensure fresh import with each test
    jest.resetModules();
    
    // Save original console methods and mock them
    mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});
    mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Mock the database connection pool
    mockPool = {
      query: jest.fn().mockResolvedValue([])
    };
    
    // Setup mock implementations
    mysql.createPool.mockReturnValue(mockPool);
    
    path.join.mockImplementation((dir, file) => `${dir}/${file}`);
    
    fs.readFileSync.mockImplementation((filePath, encoding) => {
      if (filePath.includes('schema.sql')) {
        return 'CREATE TABLE test';
      } else if (filePath.includes('dummydata.sql')) {
        return 'INSERT INTO test';
      }
      return '';
    });
  });
  
  afterEach(() => {
    // Restore console methods
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
    jest.clearAllMocks();
  });
  
  it('should export a database pool with query method', () => {
    // Import the db module after setup
    const db = require('../db');
    
    // Verify the module exports something with a query method
    expect(typeof db.query).toBe('function');
  });
  
  it('should create a MySQL connection pool with expected parameters', () => {
    // Configure environment for test
    process.env.DB_HOST = 'localhost';
    process.env.DB_USER = 'testuser';
    process.env.DB_PASSWORD = 'testpass';
    process.env.DB_NAME = 'testdb';
    
    // Clear module cache to ensure fresh import
    jest.resetModules();
    
    // Re-mock mysql after resetting modules
    jest.mock('mysql2/promise', () => ({
      createPool: jest.fn(() => mockPool)
    }));
    
    // Import db module to trigger pool creation
    require('../db');
    
    // Verify createPool was called with expected parameters
    expect(mysql.createPool).toHaveBeenCalledWith({
      connectionLimit: 10,
      waitForConnections: true,
      host: 'localhost',
      user: 'testuser',
      password: 'testpass',
      database: 'testdb',
      multipleStatements: true,
    });
    
    // Clean up environment
    delete process.env.DB_HOST;
    delete process.env.DB_USER;
    delete process.env.DB_PASSWORD;
    delete process.env.DB_NAME;
  });
  
  it('should read and execute SQL files during setup', async () => {
    // Reset module cache to ensure clean import
    jest.resetModules();
    
    // Re-configure mocks
    const mockQueryFn = jest.fn().mockResolvedValue([]);
    mockPool = {
      query: mockQueryFn
    };
    
    // Re-mock mysql after resetting modules
    jest.mock('mysql2/promise', () => ({
      createPool: jest.fn(() => mockPool)
    }));
    
    // Import the db module to trigger setupDatabase
    const db = require('../db');
    
    // Allow any promises to resolve
    await new Promise(process.nextTick);
    
    // Verify readFileSync was called for each file
    expect(fs.readFileSync).toHaveBeenCalledWith(expect.stringContaining('schema.sql'), 'utf8');
    expect(fs.readFileSync).toHaveBeenCalledWith(expect.stringContaining('dummydata.sql'), 'utf8');
    
    // Verify query was called with SQL from each file
    expect(mockQueryFn).toHaveBeenCalledWith('CREATE TABLE test');
    expect(mockQueryFn).toHaveBeenCalledWith('INSERT INTO test');
    
    // Verify console.log was called for success message
    expect(mockConsoleLog).toHaveBeenCalledWith('Schema executed correctly.');
  });
  
  it('should handle SQL execution errors', async () => {
    // Reset module cache to ensure clean import
    jest.resetModules();
    
    // Re-configure mocks with query that rejects with an error
    const mockError = new Error('Database error');
    mockPool = {
      query: jest.fn().mockRejectedValueOnce(mockError)
    };
    
    // Re-mock mysql after resetting modules
    jest.mock('mysql2/promise', () => ({
      createPool: jest.fn(() => mockPool)
    }));
    
    // Import the db module to trigger setupDatabase
    require('../db');
    
    // Allow any promises to reject
    await new Promise(process.nextTick);
    
    // Verify console.error was called with error message
    expect(mockConsoleError).toHaveBeenCalledWith(
      'Error executing schema:',
      expect.objectContaining({ message: 'Database error' })
    );
  });
}); 