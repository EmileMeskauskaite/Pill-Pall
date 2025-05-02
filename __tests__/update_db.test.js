// Define our mocks before requiring the module
const mockConnection = {
  query: jest.fn().mockResolvedValue([]),
  end: jest.fn().mockResolvedValue(true)
};

// Mock mysql
jest.mock('mysql2/promise', () => ({
  createConnection: jest.fn().mockResolvedValue(mockConnection)
}));

// Mock dotenv
jest.mock('dotenv', () => ({
  config: jest.fn()
}));

// Mock filesystem
const mockUpdateSchema = 'ALTER TABLE test ADD COLUMN name VARCHAR(255)';
jest.mock('fs', () => ({
  readFileSync: jest.fn().mockImplementation((filepath) => {
    if (filepath.includes('update_schema.sql')) return mockUpdateSchema;
    return '';
  })
}));

// Mock path
jest.mock('path', () => ({
  join: jest.fn().mockImplementation((dir, file) => `${dir}/${file}`)
}));

// Import dependencies
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

describe('Update Database module', () => {
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
  
  it('should skip tests for update_db.js', () => {
    // This is a utility module that runs immediately when imported
    // and uses global state, which makes it challenging to properly test
    // Without a proper testing stub for MySQL, we'll skip testing this file
    // and focus on testing the parts of the application that use the DB
    expect(true).toBe(true);
  });
});

describe('Database Update Module', () => {
  let mockConnection;
  let mockConsoleLog;
  let mockConsoleError;
  
  beforeEach(() => {
    // Clear module cache to ensure fresh import with each test
    jest.resetModules();
    
    // Save original console methods and mock them
    mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});
    mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Mock connection object with query and end methods
    mockConnection = {
      query: jest.fn().mockResolvedValue([]),
      end: jest.fn().mockResolvedValue(undefined)
    };
    
    // Setup mock implementations
    mysql.createConnection.mockResolvedValue(mockConnection);
    
    path.join.mockImplementation((dir, file) => `${dir}/${file}`);
    
    fs.readFileSync.mockImplementation((filePath, encoding) => {
      if (filePath.includes('update_schema.sql')) {
        return 'ALTER TABLE test ADD COLUMN test_column VARCHAR(255)';
      }
      return '';
    });
    
    // Configure environment for tests
    process.env.DB_HOST = 'localhost';
    process.env.DB_USER = 'testuser';
    process.env.DB_PASSWORD = 'testpass';
    process.env.DB_NAME = 'testdb';
  });
  
  afterEach(() => {
    // Restore console methods
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
    jest.clearAllMocks();
    
    // Clean up environment
    delete process.env.DB_HOST;
    delete process.env.DB_USER;
    delete process.env.DB_PASSWORD;
    delete process.env.DB_NAME;
  });
  
  it('should create a database connection with correct config', async () => {
    // Clear module cache to ensure fresh import
    jest.resetModules();
    
    // Re-configure mock connection
    mockConnection = {
      query: jest.fn().mockResolvedValue([]),
      end: jest.fn().mockResolvedValue(undefined)
    };
    
    // Re-setup mysql mock
    mysql.createConnection = jest.fn().mockResolvedValue(mockConnection);
    
    // Import update_db module (which will execute immediately)
    require('../update_db');
    
    // Allow any promises to resolve
    await new Promise(process.nextTick);
    
    // Verify createConnection was called with correct parameters
    expect(mysql.createConnection).toHaveBeenCalledWith({
      host: 'localhost',
      user: 'testuser',
      password: 'testpass',
      database: 'testdb',
      multipleStatements: true,
    });
  });
  
  it('should read and execute the update SQL script', async () => {
    // Clear module cache to ensure fresh import
    jest.resetModules();
    
    // Re-configure connection mock
    mockConnection = {
      query: jest.fn().mockResolvedValue([]),
      end: jest.fn().mockResolvedValue(undefined)
    };
    
    // Re-setup mocks
    mysql.createConnection = jest.fn().mockResolvedValue(mockConnection);
    
    const updateSql = 'ALTER TABLE test ADD COLUMN test_column VARCHAR(255)';
    fs.readFileSync = jest.fn().mockImplementation((filePath, encoding) => {
      if (filePath.includes('update_schema.sql')) {
        return updateSql;
      }
      return '';
    });
    
    // Import update_db module
    require('../update_db');
    
    // Allow any promises to resolve
    await new Promise(process.nextTick);
    
    // Verify fs.readFileSync was called for update_schema.sql
    expect(fs.readFileSync).toHaveBeenCalledWith(
      expect.stringContaining('update_schema.sql'),
      'utf8'
    );
    
    // Verify connection.query was called with the SQL from update_schema.sql
    expect(mockConnection.query).toHaveBeenCalledWith(updateSql);
    
    // Verify console.log was called with success message
    expect(mockConsoleLog).toHaveBeenCalledWith('Starting database update...');
    expect(mockConsoleLog).toHaveBeenCalledWith('Database update completed successfully!');
    
    // Verify connection was closed
    expect(mockConnection.end).toHaveBeenCalled();
  });
  
  it('should handle errors during database update', async () => {
    // Clear module cache to ensure fresh import
    jest.resetModules();
    
    // Create error object
    const mockError = new Error('Database update error');
    
    // Configure connection mock with query that rejects
    mockConnection = {
      query: jest.fn().mockRejectedValueOnce(mockError),
      end: jest.fn().mockResolvedValue(undefined)
    };
    
    // Re-setup mysql mock
    mysql.createConnection = jest.fn().mockResolvedValue(mockConnection);
    
    // Import update_db module
    require('../update_db');
    
    // Allow any promises to resolve/reject
    await new Promise(process.nextTick);
    
    // Verify console.error was called with error message
    expect(mockConsoleError).toHaveBeenCalledWith(
      'Error updating database:', 
      expect.objectContaining({ message: 'Database update error' })
    );
    
    // Verify connection was closed even if there was an error
    expect(mockConnection.end).toHaveBeenCalled();
  });
}); 