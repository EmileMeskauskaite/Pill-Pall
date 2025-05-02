const MedicinesController = require('../MedicinesController');
const Medicines = require('../../models/Medicines');

// Mock the Medicines model
jest.mock('../../models/Medicines');

describe('MedicinesController', () => {
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
  
  describe('getAll', () => {
    it('should return all medicines for a user', async () => {
      const mockMedicines = [
        { id: 1, user_id: 1, medicine_name: 'Aspirin' },
        { id: 2, user_id: 1, medicine_name: 'Paracetamol' }
      ];
      
      req.params.userId = '1';
      Medicines.getAllMedicinesByUser.mockResolvedValue(mockMedicines);
      
      await MedicinesController.getAll(req, res);
      
      expect(Medicines.getAllMedicinesByUser).toHaveBeenCalledWith('1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockMedicines);
    });
    
    it('should handle errors and return 500', async () => {
      req.params.userId = '1';
      Medicines.getAllMedicinesByUser.mockRejectedValue(new Error('Database error'));
      
      await MedicinesController.getAll(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error fetching medicines.' });
      expect(console.error).toHaveBeenCalled();
    });
  });
  
  describe('getOne', () => {
    it('should return a specific medicine', async () => {
      const mockMedicine = { id: 1, user_id: 1, medicine_name: 'Aspirin' };
      
      req.params.userId = '1';
      req.params.medicineId = '1';
      Medicines.getMedicineById.mockResolvedValue(mockMedicine);
      
      await MedicinesController.getOne(req, res);
      
      expect(Medicines.getMedicineById).toHaveBeenCalledWith('1', '1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockMedicine);
    });
    
    it('should return 404 if medicine not found', async () => {
      req.params.userId = '1';
      req.params.medicineId = '999';
      Medicines.getMedicineById.mockResolvedValue(null);
      
      await MedicinesController.getOne(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Medicine not found.' });
    });
    
    it('should handle errors and return 500', async () => {
      req.params.userId = '1';
      req.params.medicineId = '1';
      Medicines.getMedicineById.mockRejectedValue(new Error('Database error'));
      
      await MedicinesController.getOne(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error fetching medicine.' });
      expect(console.error).toHaveBeenCalled();
    });
  });
  
  describe('create', () => {
    it('should create a new medicine', async () => {
      req.params.userId = '1';
      req.body = {
        medicine_name: 'Ibuprofen',
        strength: '400mg',
        amount: 25,
        notes: 'For inflammation'
      };
      
      Medicines.addMedicineForUser.mockResolvedValue(3);
      
      await MedicinesController.create(req, res);
      
      expect(Medicines.addMedicineForUser).toHaveBeenCalledWith('1', {
        medicine_name: 'Ibuprofen',
        strength: '400mg',
        amount: 25,
        notes: 'For inflammation'
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: 'Medicine added', id: 3 });
    });
    
    it('should return 400 if required fields are missing', async () => {
      req.params.userId = '1';
      req.body = {
        medicine_name: 'Ibuprofen',
        // missing required fields
      };
      
      await MedicinesController.create(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Missing required fields.' });
      expect(Medicines.addMedicineForUser).not.toHaveBeenCalled();
    });
    
    it('should handle errors and return 500', async () => {
      req.params.userId = '1';
      req.body = {
        medicine_name: 'Ibuprofen',
        strength: '400mg',
        amount: 25,
        notes: 'For inflammation'
      };
      
      Medicines.addMedicineForUser.mockRejectedValue(new Error('Database error'));
      
      await MedicinesController.create(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error adding medicine.' });
      expect(console.error).toHaveBeenCalled();
    });
  });
  
  describe('update', () => {
    it('should update a medicine', async () => {
      req.params.userId = '1';
      req.params.medicineId = '1';
      req.body = {
        medicine_name: 'Aspirin',
        strength: '250mg',
        amount: 60,
        notes: 'Take twice daily'
      };
      
      Medicines.updateMedicineForUser.mockResolvedValue(true);
      
      await MedicinesController.update(req, res);
      
      expect(Medicines.updateMedicineForUser).toHaveBeenCalledWith('1', '1', req.body);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Medicine updated' });
    });
    
    it('should return 404 if medicine not found or not updated', async () => {
      req.params.userId = '1';
      req.params.medicineId = '999';
      req.body = { 
        medicine_name: 'Test', 
        strength: 'Test', 
        amount: 0, 
        notes: 'Test' 
      };
      
      Medicines.updateMedicineForUser.mockResolvedValue(false);
      
      await MedicinesController.update(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Medicine not found or not updated.' });
    });
    
    it('should handle errors and return 500', async () => {
      req.params.userId = '1';
      req.params.medicineId = '1';
      req.body = { 
        medicine_name: 'Test', 
        strength: 'Test', 
        amount: 0, 
        notes: 'Test' 
      };
      
      Medicines.updateMedicineForUser.mockRejectedValue(new Error('Database error'));
      
      await MedicinesController.update(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error updating medicine.' });
      expect(console.error).toHaveBeenCalled();
    });
  });
  
  describe('delete', () => {
    it('should delete a medicine', async () => {
      req.params.userId = '1';
      req.params.medicineId = '1';
      
      Medicines.deleteMedicineForUser.mockResolvedValue(true);
      
      await MedicinesController.delete(req, res);
      
      expect(Medicines.deleteMedicineForUser).toHaveBeenCalledWith('1', '1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Medicine deleted' });
    });
    
    it('should return 404 if medicine not found or not deleted', async () => {
      req.params.userId = '1';
      req.params.medicineId = '999';
      
      Medicines.deleteMedicineForUser.mockResolvedValue(false);
      
      await MedicinesController.delete(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Medicine not found or not deleted.' });
    });
    
    it('should handle errors and return 500', async () => {
      req.params.userId = '1';
      req.params.medicineId = '1';
      
      Medicines.deleteMedicineForUser.mockRejectedValue(new Error('Database error'));
      
      await MedicinesController.delete(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error deleting medicine.' });
      expect(console.error).toHaveBeenCalled();
    });
  });
  
  describe('deleteMultiple', () => {
    it('should delete multiple medicines', async () => {
      req.params.userId = '1';
      req.body = { ids: [1, 2] };
      
      Medicines.deleteMultipleMedicines.mockResolvedValue(2);
      
      await MedicinesController.deleteMultiple(req, res);
      
      expect(Medicines.deleteMultipleMedicines).toHaveBeenCalledWith('1', [1, 2]);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Deleted 2 medicines.' });
    });
    
    it('should handle string-format ids array', async () => {
      req.params.userId = '1';
      req.body = { ids: '[1,2]' };
      
      Medicines.deleteMultipleMedicines.mockResolvedValue(2);
      
      await MedicinesController.deleteMultiple(req, res);
      
      expect(Medicines.deleteMultipleMedicines).toHaveBeenCalledWith('1', [1, 2]);
      expect(res.status).toHaveBeenCalledWith(200);
    });
    
    it('should return 400 if ids is not an array', async () => {
      req.params.userId = '1';
      req.body = { ids: 'not-an-array' };
      
      await MedicinesController.deleteMultiple(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid format for IDs.' });
    });
    
    it('should return 400 if ids array is empty', async () => {
      req.params.userId = '1';
      req.body = { ids: [] };
      
      await MedicinesController.deleteMultiple(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Provide an array of medicine IDs to delete.' });
    });
    
    it('should handle errors and return 500', async () => {
      req.params.userId = '1';
      req.body = { ids: [1, 2] };
      
      Medicines.deleteMultipleMedicines.mockRejectedValue(new Error('Database error'));
      
      await MedicinesController.deleteMultiple(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error deleting medicines.' });
      expect(console.error).toHaveBeenCalled();
    });
  });
}); 