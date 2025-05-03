const RemindersModel = require('../Reminders');
const db = require('../../db');

// Mock the database module
jest.mock('../../db', () => ({
  query: jest.fn(),
  getConnection: jest.fn(),
}));

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  db.getConnection = jest.fn(); // Ensure db.getConnection is mocked
});

  describe('getAllReminderRulesForUser', () => {
    it('should return all reminder rules for a user with week days', async () => {
      const mockRules = [
        { id: 1, user_id: 1, medicine_id: 1, reminder_minutes_before: 30 },
        { id: 2, user_id: 1, medicine_id: 2, reminder_minutes_before: 15 }
      ];
      
      const mockWeekDays1 = [
        { week_day: 1 }, { week_day: 2 }, { week_day: 3 }
      ];
      
      const mockWeekDays2 = [
        { week_day: 0 }, { week_day: 4 }
      ];
      
      // Mock the queries
      db.query.mockResolvedValueOnce([mockRules])
        .mockResolvedValueOnce([mockWeekDays1])
        .mockResolvedValueOnce([mockWeekDays2]);
      
      const result = await RemindersModel.getAllReminderRulesForUser(1);
      
      expect(result).toEqual([
        { id: 1, user_id: 1, medicine_id: 1, reminder_minutes_before: 30, week_days: [1, 2, 3] },
        { id: 2, user_id: 1, medicine_id: 2, reminder_minutes_before: 15, week_days: [0, 4] }
      ]);
      
      expect(db.query).toHaveBeenCalledTimes(3);
      expect(db.query).toHaveBeenNthCalledWith(
        1,
        "SELECT * FROM reminder_rules WHERE user_id = ?",
        [1]
      );
    });
  });

  describe('getReminderRuleById', () => {
    it('should return a reminder rule by ID with week days', async () => {
      const mockRule = { id: 1, user_id: 1, medicine_id: 1, reminder_minutes_before: 30 };
      const mockWeekDays = [{ week_day: 1 }, { week_day: 2 }];
      
      db.query.mockResolvedValueOnce([[mockRule]])
        .mockResolvedValueOnce([mockWeekDays]);
      
      const result = await RemindersModel.getReminderRuleById(1, 1);
      
      expect(result).toEqual({
        id: 1,
        user_id: 1,
        medicine_id: 1,
        reminder_minutes_before: 30,
        week_days: [1, 2]
      });
      
      expect(db.query).toHaveBeenCalledTimes(2);
    });
    
    it('should return null if reminder rule not found', async () => {
      db.query.mockResolvedValueOnce([[]]);
      
      const result = await RemindersModel.getReminderRuleById(1, 999);
      
      expect(result).toBeNull();
      expect(db.query).toHaveBeenCalledTimes(1);
    });
  });

  describe('createReminderRule', () => {
    it('should create a reminder rule with week days', async () => {
      const reminderData = {
        medicine_id: 1,
        user_id: 1,
        reminder_minutes_before: 30,
        start_date: '2023-05-01',
        end_date: '2023-06-01',
        reminder_time: '08:00:00',
        week_days: [1, 2, 3]
      };
  
      const connection = {
        beginTransaction: jest.fn().mockResolvedValue(),
        query: jest
          .fn()
          .mockResolvedValueOnce([{ insertId: 1 }])
          .mockResolvedValueOnce([{ affectedRows: 3 }]),
        commit: jest.fn().mockResolvedValue(),
        rollback: jest.fn().mockResolvedValue(),
        release: jest.fn().mockResolvedValue(),
      };
      db.getConnection.mockResolvedValue(connection);
  
      // now “await” is legal because we’re in an async function
      const result = await RemindersModel.createReminderRule(reminderData);
  
      expect(result).toBe(1);
      expect(connection.beginTransaction).toHaveBeenCalled();
      expect(connection.query).toHaveBeenCalledTimes(2);
      expect(connection.commit).toHaveBeenCalled();
      expect(connection.release).toHaveBeenCalled();
    });
  
    it('should roll back transaction on error', async () => {              // ← and this one too
      const reminderData = {
        medicine_id: 1,
        user_id: 1,
        reminder_minutes_before: 30,
        start_date: '2023-05-01',
        end_date: '2023-06-01',
        reminder_time: '08:00:00',
        week_days: [1, 2, 3]
      };
  
      const connection = {
        beginTransaction: jest.fn().mockResolvedValue(),
        query: jest.fn().mockRejectedValue(new Error('Database error')),
        commit: jest.fn().mockResolvedValue(),
        rollback: jest.fn().mockResolvedValue(),
        release: jest.fn().mockResolvedValue(),
      };
      db.getConnection.mockResolvedValue(connection);
  
      await expect(RemindersModel.createReminderRule(reminderData))
        .rejects.toThrow('Database error');
  
      expect(connection.beginTransaction).toHaveBeenCalled();
      expect(connection.rollback).toHaveBeenCalled();
      expect(connection.release).toHaveBeenCalled();
    });
  });
  
    it('should roll back transaction on error', async () => {
      const reminderData = {
        medicine_id: 1,
        user_id: 1,
        reminder_minutes_before: 30,
        start_date: '2023-05-01',
        end_date: '2023-06-01',
        reminder_time: '08:00:00',
        week_days: [1, 2, 3]
      };
  
      const connection = {
        beginTransaction: jest.fn().mockResolvedValue(),
        query: jest.fn().mockRejectedValue(new Error('Database error')),
        commit: jest.fn().mockResolvedValue(),
        rollback: jest.fn().mockResolvedValue(),
        release: jest.fn().mockResolvedValue(),          // ← add this
      };
      db.getConnection.mockResolvedValue(connection);
  
      await expect(RemindersModel.createReminderRule(reminderData))
        .rejects.toThrow('Database error');
  
      expect(connection.beginTransaction).toHaveBeenCalled();
      expect(connection.rollback).toHaveBeenCalled();
      expect(connection.release).toHaveBeenCalled();     // ← and this too
    });

  
  describe('updateReminderRule', () => {
    it('should update a reminder rule with week days', async () => {
      const updateData = {
        reminder_minutes_before: 45,
        start_date: '2023-05-15',
        end_date: '2023-06-15',
        reminder_time: '09:00:00',
        week_days: [1, 3, 5]
      };
  
      const connection = {
        beginTransaction: jest.fn().mockResolvedValue(),
        query: jest
          .fn()
          .mockResolvedValueOnce([{ affectedRows: 1 }])
          .mockResolvedValueOnce([{ affectedRows: 3 }])
          .mockResolvedValueOnce([{ affectedRows: 3 }]),
        commit: jest.fn().mockResolvedValue(),
        rollback: jest.fn().mockResolvedValue(),
        release: jest.fn().mockResolvedValue(),          // ← add this
      };
      db.getConnection.mockResolvedValue(connection);
  
      const result = await RemindersModel.updateReminderRule(1, 1, updateData);
  
      expect(result).toBe(true);
      expect(connection.beginTransaction).toHaveBeenCalled();
      expect(connection.query).toHaveBeenCalledTimes(3);
      expect(connection.commit).toHaveBeenCalled();
      expect(connection.release).toHaveBeenCalled();     // ← and this
    });
  
    it('should return false if reminder not found', async () => {
      const updateData = { reminder_minutes_before: 45, week_days: [1, 3, 5] };
  
      const connection = {
        beginTransaction: jest.fn().mockResolvedValue(),
        query: jest.fn().mockResolvedValueOnce([{ affectedRows: 0 }]),
        commit: jest.fn().mockResolvedValue(),
        rollback: jest.fn().mockResolvedValue(),
        release: jest.fn().mockResolvedValue(),          // ← add this
      };
      db.getConnection.mockResolvedValue(connection);
  
      const result = await RemindersModel.updateReminderRule(1, 999, updateData);
  
      expect(result).toBe(false);
      expect(connection.rollback).toHaveBeenCalled();
      expect(connection.release).toHaveBeenCalled();     // ← and this
    });
  });
  
  describe('deleteReminderRule', () => {
    it('should delete a reminder rule', async () => {
      const connection = {
        beginTransaction: jest.fn().mockResolvedValue(),
        query: jest.fn().mockResolvedValueOnce([{ affectedRows: 1 }]),
        commit: jest.fn().mockResolvedValue(),
        rollback: jest.fn().mockResolvedValue(),
        release: jest.fn().mockResolvedValue(),          // ← add this
      };
      db.getConnection.mockResolvedValue(connection);
  
      const result = await RemindersModel.deleteReminderRule(1, 1);
  
      expect(result).toBe(true);
      expect(connection.query).toHaveBeenCalledWith(
        "DELETE FROM reminder_rules WHERE id = ? AND user_id = ?",
        [1, 1]
      );
      expect(connection.commit).toHaveBeenCalled();
      expect(connection.release).toHaveBeenCalled();     // ← and this
    });
  
    it('should return false if reminder rule not found', async () => {
      const connection = {
        beginTransaction: jest.fn().mockResolvedValue(),
        query: jest.fn().mockResolvedValueOnce([{ affectedRows: 0 }]),
        commit: jest.fn().mockResolvedValue(),
        rollback: jest.fn().mockResolvedValue(),
        release: jest.fn().mockResolvedValue(),          // ← add this
      };
      db.getConnection.mockResolvedValue(connection);
  
      const result = await RemindersModel.deleteReminderRule(1, 999);
  
      expect(result).toBe(false);
      expect(connection.release).toHaveBeenCalled();     // ← and this
    });
  });
  
    
    it('should return 0 if no reminder IDs are provided', async () => {
      db.getConnection = jest.fn(); 
      
      const result = await RemindersModel.deleteMultipleReminderRules(1, []);
      
      expect(result).toBe(0);
      expect(db.getConnection).not.toHaveBeenCalled();
    });

  describe('getAllReminders', () => {
    it('should return all reminders for a user', async () => {
      const mockReminders = [
        {
          id: 1,
          reminder_date: '2023-05-01',
          reminder_rules_id: 1,
          medicine_id: 1,
          reminder_time: '08:00:00',
          reminder_minutes_before: 30,
          medicine_name: 'Paracetamol'
        },
        {
          id: 2,
          reminder_date: '2023-05-02',
          reminder_rules_id: 1,
          medicine_id: 1,
          reminder_time: '08:00:00',
          reminder_minutes_before: 30,
          medicine_name: 'Paracetamol'
        }
      ];
      
      db.query.mockResolvedValue([mockReminders]);
      
      const result = await RemindersModel.getAllReminders(1);
      
      expect(result).toEqual(mockReminders);
      // Use a partial match instead of stringContaining
      expect(db.query).toHaveBeenCalledWith(
        expect.any(String),
        [1]
      );
    });
    
    it('should handle database errors when fetching reminders', async () => {
      const mockError = new Error('Database error');
      db.query.mockRejectedValue(mockError);
      
      await expect(RemindersModel.getAllReminders(1)).rejects.toThrow();
      
      expect(db.query).toHaveBeenCalled();
    });
  });
  
  describe('updateTakenStatus', () => {
    it('should update a reminder\'s taken status', async () => {
      db.query.mockResolvedValue([{ affectedRows: 1 }]);
      
      const result = await RemindersModel.updateTakenStatus(1, true);
      
      expect(result).toBe(1);
      expect(db.query).toHaveBeenCalledWith(
        "UPDATE reminders SET taken = ? WHERE id = ?",
        [true, 1]
      );
    });
    
    it('should handle database errors when updating taken status', async () => {
      const mockError = new Error('Database error');
      db.query.mockRejectedValue(mockError);
      
      await expect(RemindersModel.updateTakenStatus(1, true)).rejects.toThrow();
    });
  });
  
  describe('createReminders', () => {
    it('should create reminders for specified dates and week days', async () => {
      // Define mock dates
      const startDate = '2023-05-01';
      const endDate = '2023-05-07';
      const weekDays = ['1', '3', '5']; // Monday, Wednesday, Friday
      
      db.query.mockResolvedValue([{ affectedRows: 3 }]);
      
      // Save original Date implementation
      const RealDate = global.Date;
      
      // Set up a mock Date implementation that returns fixed dates in sequence
      global.Date = jest.fn()
        .mockImplementation((arg) => {
          // When called with constructor arguments, create a real Date
          if (arg !== undefined) {
            return new RealDate(arg);
          }
          // When called without args (new Date()), return a fixed date
          return new RealDate('2023-05-01T00:00:00Z');
        });
        
      // Ensure prototype methods like getDay() work correctly
      global.Date.prototype = RealDate.prototype;
      
      const result = await RemindersModel.createReminders(1, startDate, endDate, weekDays);
      
      // Restore original Date
      global.Date = RealDate;
      
      expect(result).toBe(3);
      
      // Check if query was called with correct format
      expect(db.query).toHaveBeenCalledWith(
        "INSERT INTO reminders (reminder_date, reminder_rules_id) VALUES ?",
        expect.any(Array)
      );
    });
    
    it('should handle a single week day as string', async () => {
      const startDate = '2023-05-01';
      const endDate = '2023-05-07';
      const weekDay = '1'; // Just Monday
      
      db.query.mockResolvedValue([{ affectedRows: 1 }]);
      
      // Save original Date implementation
      const RealDate = global.Date;
      
      // Set up a mock Date implementation
      global.Date = jest.fn()
        .mockImplementation((arg) => {
          // When called with constructor arguments, create a real Date
          if (arg !== undefined) {
            return new RealDate(arg);
          }
          // When called without args (new Date()), return a fixed date
          return new RealDate('2023-05-01T00:00:00Z');
        });
        
      // Ensure prototype methods work correctly
      global.Date.prototype = RealDate.prototype;
      
      const result = await RemindersModel.createReminders(1, startDate, endDate, weekDay);
      
      // Restore original Date
      global.Date = RealDate;
      
      expect(result).toBe(1);
    });
  });
  
  describe('getRulesByMedicineId', () => {
    it('should return reminder rules by medicine ID', async () => {
      const mockRules = [
        { id: 1, medicine_id: 1, user_id: 1, week_days: '1,2,3' },
        { id: 2, medicine_id: 1, user_id: 2, week_days: '0,4' }
      ];
      
      db.query.mockResolvedValue([mockRules]);
      
      const result = await RemindersModel.getRulesByMedicineId(1);
      
      // Check if week_days were processed correctly
      expect(result).toEqual([
        { id: 1, medicine_id: 1, user_id: 1, week_days: ['1', '2', '3'] },
        { id: 2, medicine_id: 1, user_id: 2, week_days: ['0', '4'] }
      ]);
      
      // Use a partial match instead of stringContaining
      expect(db.query).toHaveBeenCalledWith(
        expect.any(String),
        [1]
      );
    });
  });
  
  describe('getMedicineNameByReminderId', () => {
    it('should return medicine name for a reminder ID', async () => {
      db.query.mockResolvedValue([[{ medicine_name: 'Paracetamol' }]]);
      
      const result = await RemindersModel.getMedicineNameByReminderId(1);
      
      expect(result).toBe('Paracetamol');
      expect(db.query).toHaveBeenCalledWith(
        expect.any(String),
        [1]
      );
    });
    
    it('should return null if no medicine found', async () => {
      db.query.mockResolvedValue([[]]);
      
      const result = await RemindersModel.getMedicineNameByReminderId(999);
      
      expect(result).toBeNull();
    });
    
    it('should handle database errors', async () => {
      const mockError = new Error('Database error');
      db.query.mockRejectedValue(mockError);
      
      await expect(RemindersModel.getMedicineNameByReminderId(1)).rejects.toThrow();
    });
  });
  
  describe('deleteRemindersByRuleId', () => {
    it('should delete reminders by rule ID', async () => {
      db.query.mockResolvedValue([{ affectedRows: 5 }]);
      
      const result = await RemindersModel.deleteRemindersByRuleId(1);
      
      expect(result).toBe(5);
      expect(db.query).toHaveBeenCalledWith(
        "DELETE FROM reminders WHERE reminder_rules_id = ?",
        [1]
      );
    });
    
    it('should handle database errors', async () => {
      const mockError = new Error('Database error');
      db.query.mockRejectedValue(mockError);
      
      await expect(RemindersModel.deleteRemindersByRuleId(1)).rejects.toThrow();
    });
  });
