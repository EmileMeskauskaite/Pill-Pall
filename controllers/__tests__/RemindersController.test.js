const RemindersController = require('../RemindersController');
const Reminders = require('../../models/Reminders');

// Mock the Reminders model
jest.mock('../../models/Reminders');

describe('RemindersController', () => {
  let req, res;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock request and response objects
    req = {
      params: {},
      body: {}
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    // Spy on console.error
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  
  describe('getAllRules', () => {
    it('should return all reminder rules for a user', async () => {
      const mockRules = [
        { id: 1, user_id: 1, medicine_id: 1, week_days: [1, 2, 3] },
        { id: 2, user_id: 1, medicine_id: 2, week_days: [0, 4] }
      ];
      
      req.params.userId = '1';
      Reminders.getAllReminderRulesForUser.mockResolvedValue(mockRules);
      
      await RemindersController.getAllRules(req, res);
      
      expect(Reminders.getAllReminderRulesForUser).toHaveBeenCalledWith('1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockRules);
    });
    
    it('should handle errors and return 500', async () => {
      req.params.userId = '1';
      Reminders.getAllReminderRulesForUser.mockRejectedValue(new Error('Database error'));
      
      await RemindersController.getAllRules(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error retrieving reminders.' });
      expect(console.error).toHaveBeenCalled();
    });
  });
  
  describe('getOneRule', () => {
    it('should return a specific reminder rule', async () => {
      const mockRule = { id: 1, user_id: 1, medicine_id: 1, week_days: [1, 2, 3] };
      
      req.params.userId = '1';
      req.params.reminderId = '1';
      Reminders.getReminderRuleById.mockResolvedValue(mockRule);
      
      await RemindersController.getOneRule(req, res);
      
      expect(Reminders.getReminderRuleById).toHaveBeenCalledWith('1', '1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockRule);
    });
    
    it('should return 404 if reminder rule not found', async () => {
      req.params.userId = '1';
      req.params.reminderId = '999';
      Reminders.getReminderRuleById.mockResolvedValue(null);
      
      await RemindersController.getOneRule(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Reminder not found.' });
    });
    
    it('should handle errors and return 500', async () => {
      req.params.userId = '1';
      req.params.reminderId = '1';
      Reminders.getReminderRuleById.mockRejectedValue(new Error('Database error'));
      
      await RemindersController.getOneRule(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error retrieving reminder.' });
      expect(console.error).toHaveBeenCalled();
    });
  });
  
  describe('createRule', () => {
    it('should create a new reminder rule', async () => {
      req.body = {
        medicine_id: 1,
        user_id: 1,
        reminder_minutes_before: 30,
        start_date: '2023-05-01',
        end_date: '2023-06-01',
        reminder_time: '08:00:00',
        week_days: [1, 2, 3]
      };
      
      Reminders.createReminderRule.mockResolvedValue(3);
      Reminders.createReminders.mockResolvedValue([4, 5, 6]);
      
      await RemindersController.createRule(req, res);
      
      expect(Reminders.createReminderRule).toHaveBeenCalledWith(expect.objectContaining({
        medicine_id: 1,
        week_days: [1, 2, 3]
      }));
      expect(Reminders.createReminders).toHaveBeenCalledWith(
        3, 
        '2023-05-01', 
        '2023-06-01', 
        [1, 2, 3]
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ id: 3 });
    });
    
    it('should return 400 if no week days provided', async () => {
      req.body = {
        medicine_id: 1,
        user_id: 1,
        reminder_minutes_before: 30,
        start_date: '2023-05-01',
        end_date: '2023-06-01',
        reminder_time: '08:00:00',
        week_days: []
      };
      
      await RemindersController.createRule(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'At least one week day must be selected' });
      expect(Reminders.createReminderRule).not.toHaveBeenCalled();
    });
    
    it('should handle errors and return 500', async () => {
      req.body = {
        medicine_id: 1,
        user_id: 1,
        reminder_minutes_before: 30,
        start_date: '2023-05-01',
        end_date: '2023-06-01',
        reminder_time: '08:00:00',
        week_days: [1, 2, 3]
      };
      
      Reminders.createReminderRule.mockRejectedValue(new Error('Database error'));
      
      await RemindersController.createRule(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error creating reminder.' });
      expect(console.error).toHaveBeenCalled();
    });
  });
  
  describe('updateRule', () => {
    it('should update a reminder rule', async () => {
      req.params.userId = '1';
      req.params.reminderId = '1';
      req.body = {
        reminder_minutes_before: 45,
        start_date: '2023-05-15',
        end_date: '2023-06-15',
        reminder_time: '09:00:00',
        week_days: [1, 3, 5]
      };
      
      Reminders.updateReminderRule.mockResolvedValue(true);
      Reminders.deleteRemindersByRuleId.mockResolvedValue(3); // 3 old reminders deleted
      Reminders.createReminders.mockResolvedValue([4, 5, 6]); // 3 new reminders created
      
      await RemindersController.updateRule(req, res);
      
      expect(Reminders.updateReminderRule).toHaveBeenCalledWith(
        '1',
        '1',
        expect.objectContaining({
          reminder_minutes_before: 45,
          week_days: [1, 3, 5]
        })
      );
      expect(Reminders.deleteRemindersByRuleId).toHaveBeenCalledWith('1');
      expect(Reminders.createReminders).toHaveBeenCalledWith(
        '1', 
        '2023-05-15', 
        '2023-06-15', 
        [1, 3, 5]
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Reminder updated successfully.' });
    });
    
    it('should return 400 if no week days provided', async () => {
      req.params.userId = '1';
      req.params.reminderId = '1';
      req.body = {
        reminder_minutes_before: 45,
        start_date: '2023-05-15',
        end_date: '2023-06-15',
        reminder_time: '09:00:00',
        week_days: []
      };
      
      await RemindersController.updateRule(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'At least one week day must be selected' });
      expect(Reminders.updateReminderRule).not.toHaveBeenCalled();
    });
    
    it('should return 404 if reminder rule not found', async () => {
      req.params.userId = '1';
      req.params.reminderId = '999';
      req.body = {
        reminder_minutes_before: 45,
        start_date: '2023-05-15',
        end_date: '2023-06-15',
        reminder_time: '09:00:00',
        week_days: [1, 3, 5]
      };
      
      Reminders.updateReminderRule.mockResolvedValue(false);
      
      await RemindersController.updateRule(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Reminder not found or not updated.' });
    });
    
    it('should handle errors and return 500', async () => {
      req.params.userId = '1';
      req.params.reminderId = '1';
      req.body = {
        reminder_minutes_before: 45,
        start_date: '2023-05-15',
        end_date: '2023-06-15',
        reminder_time: '09:00:00',
        week_days: [1, 3, 5]
      };
      
      Reminders.updateReminderRule.mockRejectedValue(new Error('Database error'));
      
      await RemindersController.updateRule(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error updating reminder.' });
      expect(console.error).toHaveBeenCalled();
    });
  });
  
  describe('deleteRule', () => {
    it('should delete a reminder rule', async () => {
      req.params.userId = '1';
      req.params.reminderId = '1';
      
      Reminders.deleteReminderRule.mockResolvedValue(true);
      
      await RemindersController.deleteRule(req, res);
      
      expect(Reminders.deleteReminderRule).toHaveBeenCalledWith('1', '1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Reminder deleted successfully.' });
    });
    
    it('should return 404 if reminder rule not found', async () => {
      req.params.userId = '1';
      req.params.reminderId = '999';
      
      Reminders.deleteReminderRule.mockResolvedValue(false);
      
      await RemindersController.deleteRule(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Reminder not found or not deleted.' });
    });
    
    it('should handle errors and return 500', async () => {
      req.params.userId = '1';
      req.params.reminderId = '1';
      
      Reminders.deleteReminderRule.mockRejectedValue(new Error('Database error'));
      
      await RemindersController.deleteRule(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error deleting reminder.' });
      expect(console.error).toHaveBeenCalled();
    });
  });
  
  describe('deleteMultipleRules', () => {
    it('should delete multiple reminder rules', async () => {
      req.params.userId = '1';
      req.body = { ids: [1, 2] };
      
      Reminders.deleteMultipleReminderRules.mockResolvedValue(2);
      
      await RemindersController.deleteMultipleRules(req, res);
      
      expect(Reminders.deleteMultipleReminderRules).toHaveBeenCalledWith('1', [1, 2]);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Deleted 2 reminder(s).' });
    });
    
    it('should handle string-format ids array', async () => {
      req.params.userId = '1';
      req.body = { ids: '[1,2]' };
      
      Reminders.deleteMultipleReminderRules.mockResolvedValue(2);
      
      await RemindersController.deleteMultipleRules(req, res);
      
      expect(Reminders.deleteMultipleReminderRules).toHaveBeenCalledWith('1', [1, 2]);
      expect(res.status).toHaveBeenCalledWith(200);
    });
    
    it('should return 400 if ids is not an array', async () => {
      req.params.userId = '1';
      req.body = { ids: 'not-an-array' };
      
      await RemindersController.deleteMultipleRules(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid format for IDs.' });
    });
    
    it('should return 400 if ids array is empty', async () => {
      req.params.userId = '1';
      req.body = { ids: [] };
      
      await RemindersController.deleteMultipleRules(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Provide an array of reminder IDs to delete.' });
    });
    
    it('should handle errors and return 500', async () => {
      req.params.userId = '1';
      req.body = { ids: [1, 2] };
      
      Reminders.deleteMultipleReminderRules.mockRejectedValue(new Error('Database error'));
      
      await RemindersController.deleteMultipleRules(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error deleting reminders.' });
      expect(console.error).toHaveBeenCalled();
    });
  });
  
  describe('getAllReminders', () => {
    it('should return all reminders for a user', async () => {
      const mockReminders = [
        { id: 1, user_id: 1, medicine_name: 'Aspirin' },
        { id: 2, user_id: 1, medicine_name: 'Ibuprofen' }
      ];
      
      req.params.userId = '1';
      Reminders.getAllReminders.mockResolvedValue(mockReminders);
      
      await RemindersController.getAllReminders(req, res);
      
      expect(Reminders.getAllReminders).toHaveBeenCalledWith('1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockReminders);
    });
    
    it('should handle errors and return 500', async () => {
      req.params.userId = '1';
      Reminders.getAllReminders.mockRejectedValue(new Error('Database error'));
      
      await RemindersController.getAllReminders(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error fetching reminders.' });
      expect(console.error).toHaveBeenCalled();
    });
  });
  
  describe('updateTakenStatus', () => {
    it('should update reminder taken status', async () => {
      req.params.reminderId = '1';
      req.body = { taken: true };
      
      Reminders.updateTakenStatus.mockResolvedValue(1);
      
      await RemindersController.updateTakenStatus(req, res);
      
      expect(Reminders.updateTakenStatus).toHaveBeenCalledWith('1', true);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Reminder status updated successfully.' });
    });
    
    it('should return 400 if taken field is missing', async () => {
      req.params.reminderId = '1';
      req.body = {}; // No taken field
      
      await RemindersController.updateTakenStatus(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Missing 'taken' field in request body." });
      expect(Reminders.updateTakenStatus).not.toHaveBeenCalled();
    });
    
    it('should return 404 if reminder not found', async () => {
      req.params.reminderId = '999';
      req.body = { taken: true };
      
      Reminders.updateTakenStatus.mockResolvedValue(0);
      
      await RemindersController.updateTakenStatus(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Reminder not found.' });
    });
    
    it('should handle errors and return 500', async () => {
      req.params.reminderId = '1';
      req.body = { taken: true };
      
      Reminders.updateTakenStatus.mockRejectedValue(new Error('Database error'));
      
      await RemindersController.updateTakenStatus(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error updating reminder status.' });
      expect(console.error).toHaveBeenCalled();
    });
  });
  
  describe('getRulesByMedicineId', () => {
    it('should return all reminder rules for a medicine', async () => {
      const mockRules = [
        { id: 1, medicine_id: 1, week_days: [1, 2, 3] },
        { id: 2, medicine_id: 1, week_days: [0, 4] }
      ];
      
      req.params.medicineId = '1';
      Reminders.getRulesByMedicineId.mockResolvedValue(mockRules);
      
      await RemindersController.getRulesByMedicineId(req, res);
      
      expect(Reminders.getRulesByMedicineId).toHaveBeenCalledWith('1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockRules);
    });
    
    it('should handle errors and return 500', async () => {
      req.params.medicineId = '1';
      Reminders.getRulesByMedicineId.mockRejectedValue(new Error('Database error'));
      
      await RemindersController.getRulesByMedicineId(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error retrieving reminder rules.' });
      expect(console.error).toHaveBeenCalled();
    });
  });
  
  describe('getMedicineNameFromReminderId', () => {
    it('should return medicine name for a reminder', async () => {
      req.params.reminderId = '1';
      Reminders.getMedicineNameByReminderId.mockResolvedValue('Aspirin');
      
      await RemindersController.getMedicineNameFromReminderId(req, res);
      
      expect(Reminders.getMedicineNameByReminderId).toHaveBeenCalledWith('1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ medicine_name: 'Aspirin' });
    });
    
    it('should return 404 if medicine not found', async () => {
      req.params.reminderId = '999';
      Reminders.getMedicineNameByReminderId.mockResolvedValue(null);
      
      await RemindersController.getMedicineNameFromReminderId(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Medicine not found for given reminder.' });
    });
    
    it('should handle errors and return 500', async () => {
      req.params.reminderId = '1';
      Reminders.getMedicineNameByReminderId.mockRejectedValue(new Error('Database error'));
      
      await RemindersController.getMedicineNameFromReminderId(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error retrieving medicine name.' });
      expect(console.error).toHaveBeenCalled();
    });
  });
}); 