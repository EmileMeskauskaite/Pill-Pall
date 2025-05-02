const jwt = require('jsonwebtoken');
const { verifyUser, verifyCaretaker } = require('../tokenVerification');

// Mock jwt module
jest.mock('jsonwebtoken');

describe('Token Verification Middleware', () => {
  let req, res, next;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock request, response and next function
    req = {
      headers: {},
      params: {}
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    next = jest.fn();
    
    // Mock console methods
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });
  
  describe('verifyUser middleware', () => {
    it('should return 401 if no token is provided', () => {
      // No authorization header
      verifyUser(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Authentication token is required' });
      expect(next).not.toHaveBeenCalled();
    });
    
    it('should return 401 if token is invalid', () => {
      // Set invalid token
      req.headers.authorization = 'Bearer invalidtoken';
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });
      
      verifyUser(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid or expired token' });
      expect(next).not.toHaveBeenCalled();
    });
    
    it('should return 403 if user ID does not match', () => {
      // Set token but with non-matching user ID
      req.headers.authorization = 'Bearer validtoken';
      req.params.userId = '1';
      jwt.verify.mockReturnValue({ id: '2' }); // Different ID
      
      verifyUser(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized access' });
      expect(next).not.toHaveBeenCalled();
    });
    
    it('should call next() if token is valid and user ID matches', () => {
      // Set valid token with matching ID
      req.headers.authorization = 'Bearer validtoken';
      req.params.userId = '1';
      jwt.verify.mockReturnValue({ id: '1' });
      
      verifyUser(req, res, next);
      
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
  });
  
  describe('verifyCaretaker middleware', () => {
    it('should return 401 if no token is provided', () => {
      verifyCaretaker(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Authentication token is required' });
      expect(next).not.toHaveBeenCalled();
    });
    
    it('should return 401 if token is invalid', () => {
      req.headers.authorization = 'Bearer invalidtoken';
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });
      
      verifyCaretaker(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid or expired token' });
      expect(next).not.toHaveBeenCalled();
    });
    
    it('should return 403 if caretaker ID does not match', () => {
      req.headers.authorization = 'Bearer validtoken';
      req.params.caretakerId = '1';
      jwt.verify.mockReturnValue({ id: '2' }); // Different ID
      
      verifyCaretaker(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized access' });
      expect(next).not.toHaveBeenCalled();
    });
    
    it('should call next() if token is valid and caretaker ID matches', () => {
      req.headers.authorization = 'Bearer validtoken';
      req.params.caretakerId = '1';
      jwt.verify.mockReturnValue({ id: '1' });
      
      verifyCaretaker(req, res, next);
      
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
  });
}); 