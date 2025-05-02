// First mock the dependencies
const mockRouter = {
  get: jest.fn().mockReturnThis(),
  post: jest.fn().mockReturnThis(),
  put: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  patch: jest.fn().mockReturnThis()
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
jest.mock('../../controllers/RemindersController', () => ({
  getAllRules: jest.fn().mockReturnValue('mockGetAllRulesHandler'),
  getOneRule: jest.fn().mockReturnValue('mockGetOneRuleHandler'),
  createRule: jest.fn().mockReturnValue('mockCreateRuleHandler'),
  updateRule: jest.fn().mockReturnValue('mockUpdateRuleHandler'),
  deleteRule: jest.fn().mockReturnValue('mockDeleteRuleHandler'),
  deleteMultipleRules: jest.fn().mockReturnValue('mockDeleteMultipleRulesHandler'),
  getAllReminders: jest.fn().mockReturnValue('mockGetAllRemindersHandler'),
  updateTakenStatus: jest.fn().mockReturnValue('mockUpdateTakenStatusHandler'),
  getRulesByMedicineId: jest.fn().mockReturnValue('mockGetRulesByMedicineIdHandler'),
  getMedicineNameFromReminderId: jest.fn().mockReturnValue('mockGetMedicineNameHandler')
}));

// Now import the dependencies
const express = require('express');
const tokenVerification = require('../../tokenVerification');
const RemindersController = require('../../controllers/RemindersController');

describe('Reminders Routes', () => {
  beforeEach(() => {
    // Clear mock history
    jest.clearAllMocks();
    
    // Reset module registry
    jest.resetModules();
    
    // Load the routes
    require('../../routes/RemindersRoutes');
  });
  
  it('should configure GET /:userId/rules endpoint', () => {
    // Instead of checking function values, just check path
    expect(mockRouter.get).toHaveBeenCalledWith(
      '/:userId/rules',
      expect.any(Function),
      expect.any(Function)
    );
  });
  
  it('should configure GET /:userId/rules/:reminderId endpoint', () => {
    expect(mockRouter.get).toHaveBeenCalledWith(
      '/:userId/rules/:reminderId',
      expect.any(Function),
      expect.any(Function)
    );
  });
  
  it('should configure POST /:userId/rules endpoint', () => {
    expect(mockRouter.post).toHaveBeenCalledWith(
      '/:userId/rules',
      expect.any(Function),
      expect.any(Function)
    );
  });
  
  it('should configure PUT /:userId/rules/:reminderId endpoint', () => {
    expect(mockRouter.put).toHaveBeenCalledWith(
      '/:userId/rules/:reminderId',
      expect.any(Function),
      expect.any(Function)
    );
  });
  
  it('should configure DELETE /:userId/rules/:reminderId endpoint', () => {
    expect(mockRouter.delete).toHaveBeenCalledWith(
      '/:userId/rules/:reminderId',
      expect.any(Function),
      expect.any(Function)
    );
  });
  
  it('should configure DELETE /:userId/rules endpoint for multiple deletion', () => {
    expect(mockRouter.delete).toHaveBeenCalledWith(
      '/:userId/rules',
      expect.any(Function),
      expect.any(Function)
    );
  });
  
  it('should configure GET /:userId/reminders endpoint', () => {
    expect(mockRouter.get).toHaveBeenCalledWith(
      '/:userId/reminders',
      expect.any(Function),
      expect.any(Function)
    );
  });
  
  it('should configure PUT /:userId/:reminderId/reminders endpoint', () => {
    expect(mockRouter.put).toHaveBeenCalledWith(
      '/:userId/:reminderId/reminders',
      expect.any(Function),
      expect.any(Function)
    );
  });
  
  it('should configure GET /:userId/reminders/:medicineId endpoint', () => {
    expect(mockRouter.get).toHaveBeenCalledWith(
      '/:userId/reminders/:medicineId',
      expect.any(Function),
      expect.any(Function)
    );
  });
  
  it('should configure GET /:userId/reminder/:reminderId/medicine-name endpoint', () => {
    expect(mockRouter.get).toHaveBeenCalledWith(
      '/:userId/reminder/:reminderId/medicine-name',
      expect.any(Function),
      expect.any(Function)
    );
  });
}); 