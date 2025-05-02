const UsersController = require('../UsersController');
const Users = require('../../models/Users');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// Mock the Users model, bcrypt, jwt, and nodemailer
jest.mock('../../models/Users');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('nodemailer');

describe('UsersController', () => {
  let req, res, mockTransporter;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock request and response objects
    req = {
      params: {},
      body: {},
      query: {}
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
      redirect: jest.fn()
    };
    
    // Mock process.env with the actual JWT_SECRET value
    process.env.JWT_SECRET = '43jX5m~$*J}v7';
    
    // Mock nodemailer
    mockTransporter = {
      sendMail: jest.fn().mockResolvedValue({ response: 'OK' })
    };
    nodemailer.createTransport.mockReturnValue(mockTransporter);
    
    // Spy on console.error
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  
  describe('registerUser', () => {
    it('should register a new user successfully', async () => {
      // Setup request body
      req.body = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test',
        surname: 'User',
        date_of_birth: '1990-01-01'
      };
      
      // Mock user verification
      Users.checkEmailExists.mockResolvedValue(false);
      
      // Mock bcrypt hash
      bcrypt.hash.mockResolvedValue('hashedPassword');
      
      // Mock user creation
      Users.registerUser.mockResolvedValue(1);
      
      // Mock email token generation and sending
      Users.generateEmailToken.mockReturnValue('email-token');
      Users.sendConfirmationEmail.mockResolvedValue(true);
      
      await UsersController.registerUser(req, res);
      
      expect(Users.checkEmailExists).toHaveBeenCalledWith('test@example.com', 'user');
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(Users.registerUser).toHaveBeenCalledWith('Test', 'test@example.com', 'User', 'hashedPassword', '1990-01-01', 'user');
      expect(Users.generateEmailToken).toHaveBeenCalledWith(1);
      expect(Users.sendConfirmationEmail).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Account created. Check your email.'
      });
    });
    
    it('should return 400 if required fields are missing', async () => {
      // Setup request with missing fields
      req.body = {
        email: 'test@example.com',
        // Missing required fields
      };
      
      await UsersController.registerUser(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        error: 'All fields must be filled.' 
      });
      expect(Users.registerUser).not.toHaveBeenCalled();
    });
    
    it('should return 409 if email already exists', async () => {
      // Setup request body
      req.body = {
        email: 'existing@example.com',
        password: 'password123',
        name: 'Test',
        surname: 'User',
        date_of_birth: '1990-01-01'
      };
      
      // Mock email check to return true (email exists)
      Users.checkEmailExists.mockResolvedValue(true);
      
      await UsersController.registerUser(req, res);
      
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ error: 'Email already exists.' });
      expect(Users.registerUser).not.toHaveBeenCalled();
    });
    
    it('should return 500 if an error occurs during registration', async () => {
      // Setup request body
      req.body = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test',
        surname: 'User',
        date_of_birth: '1990-01-01'
      };
      
      // Mock email check
      Users.checkEmailExists.mockResolvedValue(false);
      
      // Mock bcrypt hash
      bcrypt.hash.mockResolvedValue('hashedPassword');
      
      // Mock registration error
      Users.registerUser.mockRejectedValue(new Error('Database error'));
      
      await UsersController.registerUser(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error creating user' });
      expect(console.error).toHaveBeenCalled();
    });
  });
  
  describe('confirm', () => {
    it('should confirm a user successfully', async () => {
      // Setup request query
      req.query = {
        x: 'valid-token'
      };
      
      // Mock JWT verify
      jwt.verify.mockReturnValue({ userId: 1 });
      
      // Mock user confirmation
      Users.confirmUser.mockResolvedValue(true);
      
      await UsersController.confirm(req, res);
      
      expect(jwt.verify).toHaveBeenCalledWith('valid-token', '43jX5m~$*J}v7');
      expect(Users.confirmUser).toHaveBeenCalledWith(1, 'user');
      expect(res.redirect).toHaveBeenCalledWith('http://localhost:5173/');
    });
    
    it('should return 400 if token is missing', async () => {
      // No token in query
      req.query = {};
      
      await UsersController.confirm(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith('Token missing');
      expect(jwt.verify).not.toHaveBeenCalled();
    });
    
    it('should return 404 if user not found', async () => {
      // Setup request query
      req.query = {
        x: 'valid-token'
      };
      
      // Mock JWT verify
      jwt.verify.mockReturnValue({ userId: 999 });
      
      // Mock user confirmation failure
      Users.confirmUser.mockResolvedValue(false);
      
      await UsersController.confirm(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith('User not found');
    });
    
    it('should return 400 if token is invalid', async () => {
      // Setup request query
      req.query = {
        x: 'invalid-token'
      };
      
      // Mock JWT verify to throw an error
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });
      
      await UsersController.confirm(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith('Invalid or expired token');
      expect(console.error).toHaveBeenCalled();
    });
  });
  
  describe('loginUser', () => {
    it('should log in a user with valid credentials', async () => {
      // Setup request body
      req.body = {
        email: 'test@example.com',
        password: 'password123'
      };
      
      // Mock user retrieval
      Users.getUserByEmail.mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
        name: 'Test',
        surname: 'User',
        confirmed: true
      });
      
      // Mock password comparison
      Users.checkPassword.mockResolvedValue(true);
      
      // Mock JWT token generation
      jwt.sign.mockReturnValue('test-token');
      
      await UsersController.loginUser(req, res);
      
      expect(Users.getUserByEmail).toHaveBeenCalledWith('test@example.com', 'user');
      expect(Users.checkPassword).toHaveBeenCalledWith('password123', 'hashedPassword');
      expect(jwt.sign).toHaveBeenCalledWith(
        { id: 1, email: 'test@example.com' }, 
        '43jX5m~$*J}v7', 
        { expiresIn: '1h' }
      );
      expect(res.json).toHaveBeenCalledWith({
        token: 'test-token',
        user: {
          id: 1,
          email: 'test@example.com',
          name: 'Test',
          surname: 'User',
          date_of_birth: undefined
        }
      });
    });
    
    it('should return 404 if user not found', async () => {
      // Setup request body
      req.body = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };
      
      // Mock user retrieval to return null
      Users.getUserByEmail.mockResolvedValue(null);
      
      await UsersController.loginUser(req, res);
      
      expect(Users.getUserByEmail).toHaveBeenCalledWith('nonexistent@example.com', 'user');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
      expect(Users.checkPassword).not.toHaveBeenCalled();
    });
    
    it('should return 403 if email is not confirmed', async () => {
      // Setup request body
      req.body = {
        email: 'test@example.com',
        password: 'password123'
      };
      
      // Mock user retrieval with unconfirmed email
      Users.getUserByEmail.mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
        confirmed: false
      });
      
      await UsersController.loginUser(req, res);
      
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ 
        error: 'Please confirm your email before logging in.' 
      });
      expect(Users.checkPassword).not.toHaveBeenCalled();
    });
    
    it('should return 401 if password is incorrect', async () => {
      // Setup request body
      req.body = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };
      
      // Mock user retrieval
      Users.getUserByEmail.mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
        confirmed: true
      });
      
      // Mock password comparison to return false
      Users.checkPassword.mockResolvedValue(false);
      
      await UsersController.loginUser(req, res);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Wrong password' });
      expect(jwt.sign).not.toHaveBeenCalled();
    });
    
    it('should return 500 if an error occurs during login', async () => {
      // Setup request body
      req.body = {
        email: 'test@example.com',
        password: 'password123'
      };
      
      // Mock user retrieval to throw an error
      Users.getUserByEmail.mockRejectedValue(new Error('Database error'));
      
      await UsersController.loginUser(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Login failed' });
      expect(console.error).toHaveBeenCalled();
    });
  });
  
  describe('updateUser', () => {
    it('should update user data successfully', async () => {
      // Setup request params and body
      req.params = { userId: '1' };
      req.body = {
        name: 'Updated',
        surname: 'User',
        phone: '9876543210'
      };
      
      // Mock user update
      Users.updateUser.mockResolvedValue(true);
      
      await UsersController.updateUser(req, res);
      
      expect(Users.updateUser).toHaveBeenCalledWith('1', req.body, 'user');
      expect(res.json).toHaveBeenCalledWith({ message: 'User updated successfully.' });
    });
    
    it('should convert date_of_birth to a Date object', async () => {
      // Setup request params and body
      req.params = { userId: '1' };
      req.body = {
        name: 'Updated',
        surname: 'User',
        date_of_birth: '1990-01-01'
      };
      
      // Mock user update
      Users.updateUser.mockResolvedValue(true);
      
      await UsersController.updateUser(req, res);
      
      // Check that date_of_birth was converted to a Date object
      expect(Users.updateUser).toHaveBeenCalledWith('1', {
        ...req.body,
        date_of_birth: expect.any(Date)
      }, 'user');
      expect(res.json).toHaveBeenCalledWith({ message: 'User updated successfully.' });
    });
    
    it('should return 400 if ID or data is missing', async () => {
      // Setup request with missing params
      req.params = {};
      req.body = {
        name: 'Updated',
        surname: 'User'
      };
      
      await UsersController.updateUser(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Missing ID or data to update.' });
      expect(Users.updateUser).not.toHaveBeenCalled();
    });
    
    it('should return 404 if user not found', async () => {
      // Setup request params and body
      req.params = { userId: '999' };
      req.body = {
        name: 'Updated',
        surname: 'User'
      };
      
      // Mock user update failure
      Users.updateUser.mockResolvedValue(false);
      
      await UsersController.updateUser(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found.' });
    });
    
    it('should return 500 if an error occurs', async () => {
      // Setup request params and body
      req.params = { userId: '1' };
      req.body = {
        name: 'Updated',
        surname: 'User'
      };
      
      // Mock user update error
      Users.updateUser.mockRejectedValue(new Error('Database error'));
      
      await UsersController.updateUser(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Could not update user.' });
      expect(console.error).toHaveBeenCalled();
    });
  });
  
  describe('deleteUser', () => {
    it('should delete a user successfully', async () => {
      // Setup request params
      req.params = { userId: '1' };
      
      // Mock user deletion
      Users.deleteUser.mockResolvedValue(true);
      
      await UsersController.deleteUser(req, res);
      
      expect(Users.deleteUser).toHaveBeenCalledWith('1', 'user');
      expect(res.json).toHaveBeenCalledWith({ message: 'User deleted successfully.' });
    });
    
    it('should return 400 if ID is missing', async () => {
      // Setup request with missing params
      req.params = {};
      
      await UsersController.deleteUser(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Missing ID.' });
      expect(Users.deleteUser).not.toHaveBeenCalled();
    });
    
    it('should return 404 if user not found', async () => {
      // Setup request params
      req.params = { userId: '999' };
      
      // Mock user deletion failure
      Users.deleteUser.mockResolvedValue(false);
      
      await UsersController.deleteUser(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found.' });
    });
    
    it('should return 500 if an error occurs', async () => {
      // Setup request params
      req.params = { userId: '1' };
      
      // Mock user deletion error
      Users.deleteUser.mockRejectedValue(new Error('Database error'));
      
      await UsersController.deleteUser(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Could not delete user.' });
      expect(console.error).toHaveBeenCalled();
    });
  });
}); 