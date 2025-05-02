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
  verifyUser: jest.fn().mockReturnValue('mockVerifyUserMiddleware'),
  verifyCaretaker: jest.fn().mockReturnValue('mockVerifyCaretakerMiddleware')
}));

// Mock controller
jest.mock('../../controllers/UsersController', () => ({
  registerUser: jest.fn().mockReturnValue('mockRegisterUserHandler'),
  confirm: jest.fn().mockReturnValue('mockConfirmHandler'),
  confirmCaretakerUser: jest.fn().mockReturnValue('mockConfirmCaretakerUserHandler'),
  loginUser: jest.fn().mockReturnValue('mockLoginUserHandler'),
  registerCaretaker: jest.fn().mockReturnValue('mockRegisterCaretakerHandler'),
  loginCaretaker: jest.fn().mockReturnValue('mockLoginCaretakerHandler'),
  requestPasswordReset: jest.fn().mockReturnValue('mockRequestPasswordResetHandler'),
  resetPassword: jest.fn().mockReturnValue('mockResetPasswordHandler'),
  updateUser: jest.fn().mockReturnValue('mockUpdateUserHandler'),
  updateCaretaker: jest.fn().mockReturnValue('mockUpdateCaretakerHandler'),
  deleteUser: jest.fn().mockReturnValue('mockDeleteUserHandler'),
  deleteCaretaker: jest.fn().mockReturnValue('mockDeleteCaretakerHandler'),
  getCaretakerUsers: jest.fn().mockReturnValue('mockGetCaretakerUsersHandler'),
  sendCaretakerConfirmation: jest.fn().mockReturnValue('mockSendCaretakerConfirmationHandler'),
  removeUserFromCaretaker: jest.fn().mockReturnValue('mockRemoveUserFromCaretakerHandler'),
  getUserDataForCaretaker: jest.fn().mockReturnValue('mockGetUserDataForCaretakerHandler')
}));

// Now import the dependencies
const express = require('express');
const tokenVerification = require('../../tokenVerification');
const UsersController = require('../../controllers/UsersController');

describe('Users Routes', () => {
  beforeEach(() => {
    // Clear mock history
    jest.clearAllMocks();
    
    // Reset module registry
    jest.resetModules();
    
    // Load the routes
    require('../../routes/UsersRoutes');
  });
  
  it('should configure authentication routes', () => {
    // Authentication routes
    expect(mockRouter.post).toHaveBeenCalledWith(
      '/register',
      expect.any(Function)
    );
    
    expect(mockRouter.post).toHaveBeenCalledWith(
      '/login',
      expect.any(Function)
    );
    
    expect(mockRouter.post).toHaveBeenCalledWith(
      '/caretaker/register',
      expect.any(Function)
    );
    
    expect(mockRouter.post).toHaveBeenCalledWith(
      '/caretaker/login',
      expect.any(Function)
    );
    
    expect(mockRouter.post).toHaveBeenCalledWith(
      '/request-password-reset',
      expect.any(Function)
    );
    
    expect(mockRouter.post).toHaveBeenCalledWith(
      '/reset-password',
      expect.any(Function)
    );
    
    expect(mockRouter.get).toHaveBeenCalledWith(
      '/confirm',
      expect.any(Function)
    );
    
    expect(mockRouter.get).toHaveBeenCalledWith(
      '/confirm-caretaker',
      expect.any(Function)
    );
  });
  
  it('should configure user management routes', () => {
    // User management
    expect(mockRouter.put).toHaveBeenCalledWith(
      '/user/:userId',
      expect.any(Function),
      expect.any(Function)
    );
    
    expect(mockRouter.delete).toHaveBeenCalledWith(
      '/user/:userId',
      expect.any(Function),
      expect.any(Function)
    );
  });
  
  it('should configure caretaker routes', () => {
    // Caretaker routes
    expect(mockRouter.get).toHaveBeenCalledWith(
      '/caretaker/:caretakerId/users',
      expect.any(Function),
      expect.any(Function)
    );
    
    expect(mockRouter.post).toHaveBeenCalledWith(
      '/:caretakerId/caretaker/add-user',
      expect.any(Function),
      expect.any(Function)
    );
    
    expect(mockRouter.delete).toHaveBeenCalledWith(
      '/:caretakerId/caretaker/remove-user',
      expect.any(Function),
      expect.any(Function)
    );
    
    expect(mockRouter.get).toHaveBeenCalledWith(
      '/caretaker/user-data/:caretakerId/:userId',
      expect.any(Function),
      expect.any(Function)
    );
    
    expect(mockRouter.put).toHaveBeenCalledWith(
      '/caretaker/:caretakerId',
      expect.any(Function),
      expect.any(Function)
    );
    
    expect(mockRouter.delete).toHaveBeenCalledWith(
      '/caretaker/:caretakerId',
      expect.any(Function),
      expect.any(Function)
    );
  });
}); 