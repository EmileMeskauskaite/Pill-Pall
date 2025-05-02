const request = require('supertest');
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sendMedicineReminders } = require('../SendMedicineReminders');

// Mock setInterval before requiring any modules
const originalSetInterval = global.setInterval;
global.setInterval = jest.fn();

// First mock all dependencies before requiring the modules
jest.mock('express', () => {
  const mockApp = {
    use: jest.fn().mockReturnThis(),
    get: jest.fn().mockReturnThis(),
    listen: jest.fn().mockReturnThis()
  };
  
  const mockExpress = jest.fn(() => mockApp);
  mockExpress.json = jest.fn().mockReturnValue('jsonMiddleware');
  mockExpress.urlencoded = jest.fn().mockReturnValue('urlencodedMiddleware');
  
  return mockExpress;
});

jest.mock('cors', () => jest.fn().mockReturnValue('corsMiddleware'));
jest.mock('../db', () => ({}));
jest.mock('../SendMedicineReminders', () => ({
  sendMedicineReminders: jest.fn()
}));
jest.mock('../routes/UsersRoutes', () => 'mockUserRoutes', { virtual: true });
jest.mock('../routes/MedicinesRoutes', () => 'mockMedicineRoutes', { virtual: true });
jest.mock('../routes/RemindersRoutes', () => 'mockReminderRoutes', { virtual: true });

// Use the already imported mocked modules

describe('Server', () => {
  let mockApp;
  const originalEnv = process.env;
  
  beforeAll(() => {
    // Mock process.env
    process.env = {
      ...originalEnv,
      PORT: '3000',
      JWT_SECRET: 'test-secret'
    };
    
    // Get the mock app
    mockApp = express();
  });
  
  afterAll(() => {
    // Restore original setInterval and process.env
    global.setInterval = originalSetInterval;
    process.env = originalEnv;
    
    // Reset modules
    jest.resetModules();
  });
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Set up root handler mock
    mockApp.get.mockImplementation((path, handler) => {
      if (path === '/') {
        handler({}, {
          status: jest.fn().mockReturnThis(),
          json: jest.fn()
        });
      }
      return mockApp;
    });
  });
  
  it('should set up the Express app, middleware, routes, and start listening', () => {
    // Require the server module to trigger app creation
    require('../server');
    
    // Check middleware setup
    expect(cors).toHaveBeenCalled();
    expect(express.json).toHaveBeenCalled();
    expect(express.urlencoded).toHaveBeenCalledWith({ extended: true });
    
    // Check routes setup
    expect(mockApp.use).toHaveBeenCalledWith('corsMiddleware');
    expect(mockApp.use).toHaveBeenCalledWith('jsonMiddleware');
    expect(mockApp.use).toHaveBeenCalledWith('urlencodedMiddleware');
    expect(mockApp.use).toHaveBeenCalledWith('mockUserRoutes');
    expect(mockApp.use).toHaveBeenCalledWith('mockMedicineRoutes');
    expect(mockApp.use).toHaveBeenCalledWith('mockReminderRoutes');
    
    // Check if root route handler was registered
    expect(mockApp.get).toHaveBeenCalledWith('/', expect.any(Function));
    
    // Check if reminder interval was set up
    expect(global.setInterval).toHaveBeenCalledWith(sendMedicineReminders, 10 * 1000);
    
    // Check if app is listening on the correct port
    expect(mockApp.listen).toHaveBeenCalledWith('3000', expect.any(Function));
  });
}); 