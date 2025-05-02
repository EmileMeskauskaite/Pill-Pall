const MedicinesModel = require('../Medicines');
const db = require('../../db');

// Mock the database module
jest.mock('../../db');

describe('Medicines Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllMedicinesByUser', () => {
    it('should return all medicines for a user', async () => {
      const mockMedicines = [
        { id: 1, user_id: 1, medicine_name: 'Aspirin', strength: '500mg', amount: 30, notes: 'Take with food' },
        { id: 2, user_id: 1, medicine_name: 'Paracetamol', strength: '250mg', amount: 20, notes: 'For headache' }
      ];
      
      db.query.mockResolvedValue([mockMedicines]);
      
      const result = await MedicinesModel.getAllMedicinesByUser(1);
      
      expect(result).toEqual(mockMedicines);
      expect(db.query).toHaveBeenCalledWith(
        "SELECT * FROM medicines WHERE user_id = ?",
        [1]
      );
    });
  });

  describe('getMedicineById', () => {
    it('should return a medicine by ID if it exists', async () => {
      const mockMedicine = {
        id: 1, 
        user_id: 1, 
        medicine_name: 'Aspirin', 
        strength: '500mg', 
        amount: 30, 
        notes: 'Take with food'
      };
      
      db.query.mockResolvedValue([[mockMedicine]]);
      
      const result = await MedicinesModel.getMedicineById(1, 1);
      
      expect(result).toEqual(mockMedicine);
      expect(db.query).toHaveBeenCalledWith(
        "SELECT * FROM medicines WHERE id = ? AND user_id = ?",
        [1, 1]
      );
    });

    it('should return null if medicine does not exist', async () => {
      db.query.mockResolvedValue([[]]);
      
      const result = await MedicinesModel.getMedicineById(1, 999);
      
      expect(result).toBeNull();
    });
  });

  describe('addMedicineForUser', () => {
    it('should add a new medicine for a user', async () => {
      const newMedicine = {
        medicine_name: 'Ibuprofen',
        strength: '400mg',
        amount: 25,
        notes: 'For inflammation'
      };
      
      db.query.mockResolvedValue([{ insertId: 3 }]);
      
      const result = await MedicinesModel.addMedicineForUser(1, newMedicine);
      
      expect(result).toBe(3);
      expect(db.query).toHaveBeenCalledWith(
        "INSERT INTO medicines (user_id, medicine_name, strength, amount, notes) VALUES (?, ?, ?, ?, ?)",
        [1, 'Ibuprofen', '400mg', 25, 'For inflammation']
      );
    });
  });

  describe('updateMedicineForUser', () => {
    it('should update a medicine for a user', async () => {
      const updatedMedicine = {
        medicine_name: 'Aspirin',
        strength: '250mg',
        amount: 60,
        notes: 'Take twice daily'
      };
      
      db.query.mockResolvedValue([{ affectedRows: 1 }]);
      
      const result = await MedicinesModel.updateMedicineForUser(1, 1, updatedMedicine);
      
      expect(result).toBe(true);
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE medicines"),
        ['Aspirin', '250mg', 60, 'Take twice daily', 1, 1]
      );
    });

    it('should return false if medicine was not updated', async () => {
      db.query.mockResolvedValue([{ affectedRows: 0 }]);
      
      const result = await MedicinesModel.updateMedicineForUser(1, 999, {
        medicine_name: 'Test',
        strength: 'Test',
        amount: 0,
        notes: 'Test'
      });
      
      expect(result).toBe(false);
    });
  });

  describe('deleteMedicineForUser', () => {
    it('should delete a medicine for a user', async () => {
      db.query.mockResolvedValue([{ affectedRows: 1 }]);
      
      const result = await MedicinesModel.deleteMedicineForUser(1, 1);
      
      expect(result).toBe(true);
      expect(db.query).toHaveBeenCalledWith(
        "DELETE FROM medicines WHERE id = ? AND user_id = ?",
        [1, 1]
      );
    });

    it('should return false if medicine was not deleted', async () => {
      db.query.mockResolvedValue([{ affectedRows: 0 }]);
      
      const result = await MedicinesModel.deleteMedicineForUser(1, 999);
      
      expect(result).toBe(false);
    });
  });

  describe('deleteMultipleMedicines', () => {
    it('should delete multiple medicines for a user', async () => {
      db.query.mockResolvedValue([{ affectedRows: 2 }]);
      
      const result = await MedicinesModel.deleteMultipleMedicines(1, [1, 2]);
      
      expect(result).toBe(2);
      expect(db.query).toHaveBeenCalledWith(
        "DELETE FROM medicines WHERE user_id = ? AND id IN (?,?)",
        [1, 1, 2]
      );
    });

    it('should return false if no ids provided', async () => {
      const result = await MedicinesModel.deleteMultipleMedicines(1, []);
      
      expect(result).toBe(false);
      expect(db.query).not.toHaveBeenCalled();
    });
  });
}); 