// First mock the dependencies
const mockRouter = {
  get: jest.fn().mockReturnThis(),
  post: jest.fn().mockReturnThis(),
  put: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis()
};

// Mock express
jest.mock('express', () => ({
  Router: jest.fn(() => mockRouter)
}));

// Mock token verification
jest.mock('../../tokenVerification', () => ({
  verifyUser: jest.fn().mockReturnValue('mockVerifyUserMiddleware')
}));

// Mock controller
jest.mock('../../controllers/MedicinesController', () => ({
  getAll: jest.fn().mockReturnValue('mockGetAllHandler'),
  getOne: jest.fn().mockReturnValue('mockGetOneHandler'),
  create: jest.fn().mockReturnValue('mockCreateHandler'),
  update: jest.fn().mockReturnValue('mockUpdateHandler'),
  delete: jest.fn().mockReturnValue('mockDeleteHandler'),
  deleteMultiple: jest.fn().mockReturnValue('mockDeleteMultipleHandler')
}));

// Mock the original routes file by reading its actual content
jest.mock('../../routes/MedicinesRoutes', () => {
  const originalModule = jest.requireActual('../../routes/MedicinesRoutes');
  // Initialize the module but return mockRouter for assertions
  return mockRouter;
}, { virtual: true });

// Now import the dependencies
const express = require('express');
const tokenVerification = require('../../tokenVerification');
const MedicinesController = require('../../controllers/MedicinesController');

describe('Medicines Routes', () => {
  beforeEach(() => {
    // Clear mock history
    jest.clearAllMocks();
    
    // Reset module registry
    jest.resetModules();
    
    // Load the routes
    require('../../routes/MedicinesRoutes');
  });
  
  it('should configure routes for medicines', () => {
    // Check that routes are configured with proper paths
    // We don't check the specific functions, just that routes were defined
    expect(mockRouter.get).toHaveBeenCalledWith(
      '/:userId/medicines',
      expect.any(Function)
    );
    
    expect(mockRouter.get).toHaveBeenCalledWith(
      '/:userId/medicines/:medicineId',
      expect.any(Function)
    );
    
    expect(mockRouter.post).toHaveBeenCalledWith(
      '/:userId/medicines',
      expect.any(Function)
    );
    
    expect(mockRouter.put).toHaveBeenCalledWith(
      '/:userId/medicines/:medicineId',
      expect.any(Function)
    );
    
    expect(mockRouter.delete).toHaveBeenCalledWith(
      '/:userId/medicines/:medicineId',
      expect.any(Function)
    );
    
    expect(mockRouter.delete).toHaveBeenCalledWith(
      '/:userId/medicines',
      expect.any(Function)
    );
  });
}); 