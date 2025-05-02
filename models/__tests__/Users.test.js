const UsersModel = require('../Users');
const db = require('../../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Mock dependencies
jest.mock('../../db');
jest.mock('jsonwebtoken');
jest.mock('bcrypt');
jest.mock('dotenv', () => ({
  config: jest.fn()
}));

describe('Users Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('checkEmailExists', () => {
    it('should return true if email exists', async () => {
      db.query.mockResolvedValue([[{ id: 1 }]]);
      const result = await UsersModel.checkEmailExists('test@example.com');
      expect(result).toBe(true);
      expect(db.query).toHaveBeenCalledWith(
        'SELECT id FROM users WHERE email = ?',
        ['test@example.com']
      );
    });

    it('should return false if email does not exist', async () => {
      db.query.mockResolvedValue([[]]);
      const result = await UsersModel.checkEmailExists('test@example.com');
      expect(result).toBe(false);
    });

    it('should use caretakers table when type is caretaker', async () => {
      db.query.mockResolvedValue([[{ id: 1 }]]);
      await UsersModel.checkEmailExists('test@example.com', 'caretaker');
      expect(db.query).toHaveBeenCalledWith(
        'SELECT id FROM caretakers WHERE email = ?',
        ['test@example.com']
      );
    });
  });

  describe('registerUser', () => {
    it('should register a user', async () => {
      db.query.mockResolvedValue([{ insertId: 1 }]);
      const result = await UsersModel.registerUser(
        'John', 'john@example.com', 'Doe', 'hashed_password', '1990-01-01'
      );
      
      expect(result).toBe(1);
      const actualQuery = db.query.mock.calls[0][0];
      expect(actualQuery).toContain('INSERT INTO users');
      expect(actualQuery).toContain('VALUES (?, ?, ?, ?, ?, false)');
      expect(db.query.mock.calls[0][1]).toEqual(['John', 'john@example.com', 'Doe', 'hashed_password', '1990-01-01']);
    });

    it('should register a caretaker', async () => {
      db.query.mockResolvedValue([{ insertId: 2 }]);
      const result = await UsersModel.registerUser(
        'Jane', 'jane@example.com', 'Smith', 'hashed_password', null, 'caretaker'
      );
      
      expect(result).toBe(2);
      const actualQuery = db.query.mock.calls[0][0];
      expect(actualQuery).toContain('INSERT INTO caretakers');
      expect(actualQuery).toContain('VALUES (?, ?, ?, ?, false)');
      expect(db.query.mock.calls[0][1]).toEqual(['Jane', 'jane@example.com', 'Smith', 'hashed_password']);
    });
  });

  describe('getUserByEmail', () => {
    it('should return user by email', async () => {
      const mockUser = { id: 1, name: 'John', email: 'john@example.com' };
      db.query.mockResolvedValue([[mockUser]]);
      
      const result = await UsersModel.getUserByEmail('john@example.com');
      expect(result).toEqual(mockUser);
      expect(db.query).toHaveBeenCalledWith(
        'SELECT * FROM users WHERE email = ?',
        ['john@example.com']
      );
    });

    it('should return null if user not found', async () => {
      db.query.mockResolvedValue([[]]);
      const result = await UsersModel.getUserByEmail('nonexistent@example.com');
      expect(result).toBeNull();
    });
  });

  describe('getUserById', () => {
    it('should return user by id', async () => {
      const mockUser = { id: 1, name: 'John', email: 'john@example.com' };
      db.query.mockResolvedValue([[mockUser]]);
      
      const result = await UsersModel.getUserById(1);
      expect(result).toEqual(mockUser);
      expect(db.query).toHaveBeenCalledWith(
        'SELECT * FROM users WHERE id = ?',
        [1]
      );
    });

    it('should return null if user not found by id', async () => {
      db.query.mockResolvedValue([[]]);
      const result = await UsersModel.getUserById(999);
      expect(result).toBeNull();
    });

    it('should query caretakers table when type is caretaker', async () => {
      const mockCaretaker = { id: 1, name: 'Jane', email: 'jane@example.com' };
      db.query.mockResolvedValue([[mockCaretaker]]);
      
      const result = await UsersModel.getUserById(1, 'caretaker');
      expect(result).toEqual(mockCaretaker);
      expect(db.query).toHaveBeenCalledWith(
        'SELECT * FROM caretakers WHERE id = ?',
        [1]
      );
    });
  });

  describe('confirmUser', () => {
    it('should confirm a user account', async () => {
      db.query.mockResolvedValue([{ affectedRows: 1 }]);
      const result = await UsersModel.confirmUser(1);
      expect(result).toBe(true);
      expect(db.query).toHaveBeenCalledWith(
        'UPDATE users SET confirmed = true WHERE id = ?',
        [1]
      );
    });

    it('should return false if user not found', async () => {
      db.query.mockResolvedValue([{ affectedRows: 0 }]);
      const result = await UsersModel.confirmUser(999);
      expect(result).toBe(false);
    });
  });

  describe('generateEmailToken', () => {
    it('should generate a token for email confirmation', () => {
      jwt.sign.mockReturnValue('fake-token');
      const token = UsersModel.generateEmailToken(1);
      expect(token).toBe('fake-token');
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: 1 },
        undefined,
        { expiresIn: '2h' }
      );
    });
  });

  describe('sendConfirmationEmail', () => {
    it('should send a confirmation email with the correct URL', () => {
      const mockTransporter = {
        sendMail: jest.fn().mockResolvedValue(true)
      };
      
      UsersModel.sendConfirmationEmail('test@example.com', 'test-token', mockTransporter);
      
      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: process.env.EMAIL_USER,
        to: 'test@example.com',
        subject: 'Patvirtinkite savo paskyrą',
        html: expect.stringContaining('http://localhost:5169/confirm?x=test-token&t=user')
      });
    });

    it('should include the correct type parameter in URL for caretakers', () => {
      const mockTransporter = {
        sendMail: jest.fn().mockResolvedValue(true)
      };
      
      UsersModel.sendConfirmationEmail('test@example.com', 'test-token', mockTransporter, 'caretaker');
      
      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: process.env.EMAIL_USER,
        to: 'test@example.com',
        subject: 'Patvirtinkite savo paskyrą',
        html: expect.stringContaining('http://localhost:5169/confirm?x=test-token&t=caretaker')
      });
    });
  });

  describe('checkPassword', () => {
    it('should return true for matching password', async () => {
      bcrypt.compare.mockResolvedValue(true);
      const result = await UsersModel.checkPassword('password123', 'hashed_password');
      expect(result).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed_password');
    });

    it('should return false for non-matching password', async () => {
      bcrypt.compare.mockResolvedValue(false);
      const result = await UsersModel.checkPassword('wrong_password', 'hashed_password');
      expect(result).toBe(false);
    });
  });
  
  describe('getCaretakersUsers', () => {
    it('should return all users associated with a caretaker', async () => {
      const mockUsers = [
        { id: 1, name: 'John', surname: 'Doe', email: 'john@example.com', date_of_birth: '1990-01-01', confirmed: 1 },
        { id: 2, name: 'Jane', surname: 'Smith', email: 'jane@example.com', date_of_birth: '1992-05-15', confirmed: 0 }
      ];
      
      db.query.mockResolvedValue([mockUsers]);
      
      const result = await UsersModel.getCaretakersUsers(1);
      expect(result).toEqual(mockUsers);
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('FROM caretaker_users cu'),
        [1]
      );
    });
  });
  
  describe('createCaretakerUser', () => {
    it('should create a caretaker-user association', async () => {
      // First query returns empty array (no existing association)
      db.query.mockResolvedValueOnce([[]]);
      // Second query returns insertId
      db.query.mockResolvedValueOnce([{ insertId: 1 }]);
      
      const result = await UsersModel.createCaretakerUser(1, 2);
      
      expect(result).toBe(1);
      expect(db.query).toHaveBeenNthCalledWith(
        1,
        expect.stringContaining('SELECT * FROM caretaker_users'),
        [1, 2]
      );
      
      expect(db.query).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining('INSERT INTO caretaker_users'),
        [1, 2]
      );
    });
    
    it('should throw error if association already exists', async () => {
      // Return an existing record
      db.query.mockResolvedValueOnce([[{ caretaker_id: 1, user_id: 2 }]]);
      
      await expect(UsersModel.createCaretakerUser(1, 2))
        .rejects
        .toThrow('Naudotojas jau pridėtas arba laukia patvirtinimo.');
    });
  });
  
  describe('removeCaretakerUser', () => {
    it('should remove a caretaker-user association', async () => {
      db.query.mockResolvedValue([{ affectedRows: 1 }]);
      
      const result = await UsersModel.removeCaretakerUser(1, 2);
      
      expect(result).toBe(true);
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM caretaker_users'),
        [1, 2]
      );
    });
    
    it('should return false if no association was removed', async () => {
      db.query.mockResolvedValue([{ affectedRows: 0 }]);
      
      const result = await UsersModel.removeCaretakerUser(1, 999);
      
      expect(result).toBe(false);
    });
  });
  
  describe('generateCaretakerLinkToken', () => {
    it('should generate a token for caretaker-user linking', () => {
      jwt.sign.mockReturnValue('caretaker-link-token');
      
      const token = UsersModel.generateCaretakerLinkToken(1, 2);
      
      expect(token).toBe('caretaker-link-token');
      expect(jwt.sign).toHaveBeenCalledWith(
        { caretakerId: 1, userId: 2 },
        undefined,
        { expiresIn: '2h' }
      );
    });
  });
  
  describe('sendCaretakerLinkEmail', () => {
    it('should send a link email with the correct URL and caretaker info', () => {
      const mockTransporter = {
        sendMail: jest.fn().mockResolvedValue(true)
      };
      
      UsersModel.sendCaretakerLinkEmail('user@example.com', 'link-token', mockTransporter, 'John', 'Doe');
      
      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: process.env.EMAIL_USER,
        to: 'user@example.com',
        subject: 'Globėjo prieigos patvirtinimas',
        html: expect.stringContaining('http://localhost:5169/confirm-caretaker?x=link-token')
      });
      
      // Check if caretaker name and surname are included
      const htmlContent = mockTransporter.sendMail.mock.calls[0][0].html;
      expect(htmlContent).toContain('John Doe');
    });
  });
  
  describe('confirmCaretakerUser', () => {
    it('should confirm a caretaker-user association', async () => {
      db.query.mockResolvedValue([{ affectedRows: 1 }]);
      
      const result = await UsersModel.confirmCaretakerUser(1, 2);
      
      expect(result).toBe(true);
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE caretaker_users'),
        [1, 2]
      );
    });
    
    it('should return false if no association was confirmed', async () => {
      db.query.mockResolvedValue([{ affectedRows: 0 }]);
      
      const result = await UsersModel.confirmCaretakerUser(999, 888);
      
      expect(result).toBe(false);
    });
  });
  
  describe('isCaretakerConfirmed', () => {
    it('should return true if caretaker-user association is confirmed', async () => {
      db.query.mockResolvedValue([[{ confirmed: 1 }]]);
      
      const result = await UsersModel.isCaretakerConfirmed(1, 2);
      
      expect(result).toBe(true);
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT confirmed FROM caretaker_users'),
        [1, 2]
      );
    });
    
    it('should return false if caretaker-user association is not confirmed', async () => {
      db.query.mockResolvedValue([[{ confirmed: 0 }]]);
      
      const result = await UsersModel.isCaretakerConfirmed(1, 2);
      
      expect(result).toBe(false);
    });
    
    it('should return false if no caretaker-user association exists', async () => {
      db.query.mockResolvedValue([[]]);
      
      const result = await UsersModel.isCaretakerConfirmed(999, 888);
      
      expect(result).toBe(false);
    });
  });
  
  describe('generatePasswordResetToken', () => {
    it('should generate a token for password reset', () => {
      jwt.sign.mockReturnValue('password-reset-token');
      
      const token = UsersModel.generatePasswordResetToken(1, 'user');
      
      expect(token).toBe('password-reset-token');
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: 1, type: 'user' },
        undefined,
        { expiresIn: '1h' }
      );
    });
  });
  
  describe('sendPasswordResetEmail', () => {
    it('should send a password reset email with the correct URL', () => {
      const mockTransporter = {
        sendMail: jest.fn().mockResolvedValue(true)
      };
      
      UsersModel.sendPasswordResetEmail('user@example.com', 'reset-token', mockTransporter);
      
      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: process.env.EMAIL_USER,
        to: 'user@example.com',
        subject: 'Slaptažodžio atstatymo užklausa',
        html: expect.stringContaining('http://localhost:5173/reset-password/user/password?token=reset-token')
      });
    });
    
    it('should include the correct type in URL for caretakers', () => {
      const mockTransporter = {
        sendMail: jest.fn().mockResolvedValue(true)
      };
      
      UsersModel.sendPasswordResetEmail('caretaker@example.com', 'reset-token', mockTransporter, 'caretaker');
      
      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: process.env.EMAIL_USER,
        to: 'caretaker@example.com',
        subject: 'Slaptažodžio atstatymo užklausa',
        html: expect.stringContaining('http://localhost:5173/reset-password/caretaker/password?token=reset-token')
      });
    });
  });
  
  describe('updatePassword', () => {
    it('should update user password', async () => {
      db.query.mockResolvedValue([{ affectedRows: 1 }]);
      
      const result = await UsersModel.updatePassword(1, 'new-hash');
      
      expect(result).toBe(true);
      expect(db.query).toHaveBeenCalledWith(
        'UPDATE users SET password = ? WHERE id = ?',
        ['new-hash', 1]
      );
    });
    
    it('should update caretaker password when type is caretaker', async () => {
      db.query.mockResolvedValue([{ affectedRows: 1 }]);
      
      const result = await UsersModel.updatePassword(1, 'new-hash', 'caretaker');
      
      expect(result).toBe(true);
      expect(db.query).toHaveBeenCalledWith(
        'UPDATE caretakers SET password = ? WHERE id = ?',
        ['new-hash', 1]
      );
    });
    
    it('should return false if password update failed', async () => {
      db.query.mockResolvedValue([{ affectedRows: 0 }]);
      
      const result = await UsersModel.updatePassword(999, 'new-hash');
      
      expect(result).toBe(false);
    });
  });
  
  describe('updateUser', () => {
    it('should update user data', async () => {
      db.query.mockResolvedValue([{ affectedRows: 1 }]);
      
      const updateData = { name: 'Updated Name', email: 'updated@example.com' };
      const result = await UsersModel.updateUser(1, updateData);
      
      expect(result).toBe(true);
      expect(db.query).toHaveBeenCalledWith(
        'UPDATE users SET name = ?, email = ? WHERE id = ?',
        ['Updated Name', 'updated@example.com', 1]
      );
    });
    
    it('should update caretaker data when type is caretaker', async () => {
      db.query.mockResolvedValue([{ affectedRows: 1 }]);
      
      const updateData = { name: 'Updated Name', email: 'updated@example.com' };
      const result = await UsersModel.updateUser(1, updateData, 'caretaker');
      
      expect(result).toBe(true);
      expect(db.query).toHaveBeenCalledWith(
        'UPDATE caretakers SET name = ?, email = ? WHERE id = ?',
        ['Updated Name', 'updated@example.com', 1]
      );
    });
    
    it('should return false if user update failed', async () => {
      db.query.mockResolvedValue([{ affectedRows: 0 }]);
      
      const updateData = { name: 'Updated Name' };
      const result = await UsersModel.updateUser(999, updateData);
      
      expect(result).toBe(false);
    });
  });
  
  describe('deleteUser', () => {
    it('should delete a user', async () => {
      db.query.mockResolvedValue([{ affectedRows: 1 }]);
      
      const result = await UsersModel.deleteUser(1);
      
      expect(result).toBe(true);
      expect(db.query).toHaveBeenCalledWith(
        'DELETE FROM users WHERE id = ?',
        [1]
      );
    });
    
    it('should delete a caretaker when type is caretaker', async () => {
      db.query.mockResolvedValue([{ affectedRows: 1 }]);
      
      const result = await UsersModel.deleteUser(1, 'caretaker');
      
      expect(result).toBe(true);
      expect(db.query).toHaveBeenCalledWith(
        'DELETE FROM caretakers WHERE id = ?',
        [1]
      );
    });
    
    it('should return false if user deletion failed', async () => {
      db.query.mockResolvedValue([{ affectedRows: 0 }]);
      
      const result = await UsersModel.deleteUser(999);
      
      expect(result).toBe(false);
    });
  });
}); 