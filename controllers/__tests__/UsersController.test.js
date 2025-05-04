const UsersController = require('../UsersController');
const Users = require('../../models/Users');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

jest.mock('../../models/Users');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('nodemailer');

describe('UsersController', () => {
  let req, res, mockTransporter;

  beforeEach(() => {
    jest.clearAllMocks();

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

    process.env.JWT_SECRET = '43jX5m~$*J}v7';

    mockTransporter = {
      sendMail: jest.fn().mockResolvedValue({ response: 'OK' })
    };
    nodemailer.createTransport.mockReturnValue(mockTransporter);

    jest.spyOn(console, 'error').mockImplementation(() => { });
  });

  describe('registerUser', () => {
    it('should register a new user successfully', async () => {
      req.body = {
        email: 'nonexistent_user@invalid.test',
        password: 'Password123',
        name: 'Test',
        surname: 'User',
        date_of_birth: '1990-01-01'
      };

      Users.checkEmailExists.mockResolvedValue(false);
      bcrypt.hash.mockResolvedValue('hashedPassword');
      Users.registerUser.mockResolvedValue(1);
      Users.generateEmailToken.mockReturnValue('email-token');
      Users.sendConfirmationEmail.mockResolvedValue(true);

      await UsersController.registerUser(req, res);

      Users.checkEmailExists('nonexistent_user@invalid.test', 'user');

      expect(bcrypt.hash).toHaveBeenCalledWith('Password123', 10);
      expect(Users.registerUser).toHaveBeenCalledWith('Test', 'nonexistent_user@invalid.test', 'User', 'hashedPassword', '1990-01-01', 'user');
      expect(Users.generateEmailToken).toHaveBeenCalledWith(1);
      expect(Users.sendConfirmationEmail).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: 'Account created. Check your email.' });
    });

    it('should return 400 if required fields are missing', async () => {
      req.body = { email: 'test@example.com' };

      await UsersController.registerUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'All fields must be filled.' });
      expect(Users.registerUser).not.toHaveBeenCalled();
    });

    it('should return 409 if email already exists', async () => {
      req.body = {
        email: 'mail.testing.emile@gmail.com',
        password: 'Test123456',
        name: 'Test',
        surname: 'User',
        date_of_birth: '1990-01-01'
      };

      Users.checkEmailExists.mockResolvedValue(true);

      await UsersController.registerUser(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ error: 'Email already exists.' });
      expect(Users.registerUser).not.toHaveBeenCalled();
    });

    it('should return 500 if an error occurs during registration', async () => {
      req.body = {
        email: 'test@example.com',
        password: 'Password123',
        name: 'Test',
        surname: 'User',
        date_of_birth: '1990-01-01'
      };


      Users.checkEmailExists.mockResolvedValue(false);
      bcrypt.hash.mockResolvedValue('hashedPassword');
      Users.registerUser.mockRejectedValue(new Error('Database error'));

      await UsersController.registerUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error creating user' });
      expect(console.error).toHaveBeenCalled();
    });
  });

  // Confirm block
  describe('confirm', () => {
    it('should confirm a user successfully', async () => {
      req.query = { x: 'valid-token' };
      jwt.verify.mockReturnValue({ userId: 1 });
      Users.confirmUser.mockResolvedValue(true);
      await UsersController.confirm(req, res);
      expect(jwt.verify).toHaveBeenCalledWith('valid-token', process.env.JWT_SECRET);
      expect(Users.confirmUser).toHaveBeenCalledWith(1, 'user');
      expect(res.redirect).toHaveBeenCalledWith('http://localhost:5173/');
    });

    it('should return 400 if token is missing', async () => {
      req.query = {};
      await UsersController.confirm(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith('Token missing');
    });

    it('should return 404 if user not found', async () => {
      req.query = { x: 'valid-token' };
      jwt.verify.mockReturnValue({ userId: 999 });
      Users.confirmUser.mockResolvedValue(false);
      await UsersController.confirm(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith('User not found');
    });

    it('should return 400 if token is invalid', async () => {
      req.query = { x: 'invalid-token' };
      jwt.verify.mockImplementation(() => { throw new Error('Invalid token'); });
      await UsersController.confirm(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith('Invalid or expired token');
      expect(console.error).toHaveBeenCalled();
    });
  });

  // loginUser block
  describe('loginUser', () => {
    it('should log in a user with valid credentials', async () => {
      req.body = { email: 'test@example.com', password: 'password123' };
      Users.getUserByEmail.mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
        name: 'Test',
        surname: 'User',
        confirmed: true
      });
      Users.checkPassword.mockResolvedValue(true);
      jwt.sign.mockReturnValue('test-token');
      await UsersController.loginUser(req, res);
      expect(Users.getUserByEmail).toHaveBeenCalledWith('test@example.com', 'user');
      expect(Users.checkPassword).toHaveBeenCalledWith('password123', 'hashedPassword');
      expect(jwt.sign).toHaveBeenCalledWith(
        { id: 1, email: 'test@example.com' },
        process.env.JWT_SECRET,
        { expiresIn: '12h' }
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
      req.body = { email: 'nonexistent@example.com', password: 'password123' };
      Users.getUserByEmail.mockResolvedValue(null);
      await UsersController.loginUser(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
    });

    it('should return 403 if email is not confirmed', async () => {
      req.body = { email: 'test@example.com', password: 'password123' };
      Users.getUserByEmail.mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
        confirmed: false
      });
      await UsersController.loginUser(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Please confirm your email before logging in.' });
    });

    it('should return 401 if password is incorrect', async () => {
      req.body = { email: 'test@example.com', password: 'wrongpassword' };
      Users.getUserByEmail.mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
        confirmed: true
      });
      Users.checkPassword.mockResolvedValue(false);
      await UsersController.loginUser(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Wrong password' });
    });

    it('should return 500 if an error occurs during login', async () => {
      req.body = { email: 'test@example.com', password: 'password123' };
      Users.getUserByEmail.mockRejectedValue(new Error('Database error'));
      await UsersController.loginUser(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Login failed' });
      expect(console.error).toHaveBeenCalled();
    });
  });

  // updateUser block
  describe('updateUser', () => {
    it('should update user data successfully', async () => {
      req.params = { userId: '1' };
      req.body = {
        name: 'Updated',
        surname: 'User',
        phone: '9876543210'
      };
      Users.updateUser.mockResolvedValue(true);
      await UsersController.updateUser(req, res);
      expect(Users.updateUser).toHaveBeenCalledWith('1', req.body, 'user');
      expect(res.json).toHaveBeenCalledWith({ message: 'User updated successfully.' });
    });

    it('should convert date_of_birth to a Date object', async () => {
      req.params = { userId: '1' };
      req.body = {
        name: 'Updated',
        surname: 'User',
        date_of_birth: '1990-01-01'
      };
      Users.updateUser.mockResolvedValue(true);
      await UsersController.updateUser(req, res);
      expect(Users.updateUser).toHaveBeenCalledWith('1', {
        ...req.body,
        date_of_birth: expect.any(Date)
      }, 'user');
      expect(res.json).toHaveBeenCalledWith({ message: 'User updated successfully.' });
    });

    it('should return 400 if ID or data is missing', async () => {
      req.params = {};
      req.body = { name: 'Updated', surname: 'User' };
      await UsersController.updateUser(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Missing ID or data to update.' });
      expect(Users.updateUser).not.toHaveBeenCalled();
    });

    it('should return 404 if user not found', async () => {
      req.params = { userId: '999' };
      req.body = { name: 'Updated', surname: 'User' };
      Users.updateUser.mockResolvedValue(false);
      await UsersController.updateUser(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found.' });
    });

    it('should return 500 if an error occurs', async () => {
      req.params = { userId: '1' };
      req.body = { name: 'Updated', surname: 'User' };
      Users.updateUser.mockRejectedValue(new Error('Database error'));
      await UsersController.updateUser(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Could not update user.' });
      expect(console.error).toHaveBeenCalled();
    });
  });

  // deleteUser block
  describe('deleteUser', () => {
    it('should delete a user successfully', async () => {
      req.params = { userId: '1' };
      Users.deleteUser.mockResolvedValue(true);
      await UsersController.deleteUser(req, res);
      expect(Users.deleteUser).toHaveBeenCalledWith('1', 'user');
      expect(res.json).toHaveBeenCalledWith({ message: 'User deleted successfully.' });
    });

    it('should return 400 if ID is missing', async () => {
      req.params = {};
      await UsersController.deleteUser(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Missing ID.' });
      expect(Users.deleteUser).not.toHaveBeenCalled();
    });

    it('should return 404 if user not found', async () => {
      req.params = { userId: '999' };
      Users.deleteUser.mockResolvedValue(false);
      await UsersController.deleteUser(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found.' });
    });

    it('should return 500 if an error occurs', async () => {
      req.params = { userId: '1' };
      Users.deleteUser.mockRejectedValue(new Error('Database error'));
      await UsersController.deleteUser(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Could not delete user.' });
      expect(console.error).toHaveBeenCalled();
    });
  });
});
