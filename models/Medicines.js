const db = require("../db");

module.exports = {
  getAllMedicinesByUser: async (userId) => {
    const [rows] = await db.query("SELECT * FROM medicines WHERE user_id = ?", [userId]);
    return rows;
  },

  getMedicineById: async (userId, medicineId) => {
    const [rows] = await db.query("SELECT * FROM medicines WHERE id = ? AND user_id = ?", [medicineId, userId]);
    return rows.length > 0 ? rows[0] : null;
  },

  addMedicineForUser: async (userId, { medicine_name, strength, amount, notes }) => {
    const [result] = await db.query(
      "INSERT INTO medicines (user_id, medicine_name, strength, amount, notes) VALUES (?, ?, ?, ?, ?)",
      [userId, medicine_name, strength, amount, notes]
    );
    return result.insertId;
  },

  updateMedicineForUser: async (userId, medicineId, { medicine_name, strength, amount, notes }) => {
    const [result] = await db.query(
      `UPDATE medicines 
       SET medicine_name = ?, strength = ?, amount = ?, notes = ?
       WHERE id = ? AND user_id = ?`,
      [medicine_name, strength, amount, notes, medicineId, userId]
    );
    return result.affectedRows > 0;
  },

  deleteMedicineForUser: async (userId, medicineId) => {
    const [result] = await db.query(
      "DELETE FROM medicines WHERE id = ? AND user_id = ?",
      [medicineId, userId]
    );
    return result.affectedRows > 0;
  },  

  deleteMultipleMedicines: async (userId, medicineIds) => {
    if (!medicineIds.length) return false;
    const placeholders = medicineIds.map(() => '?').join(',');
    const query = `DELETE FROM medicines WHERE user_id = ? AND id IN (${placeholders})`;
    const [result] = await db.query(query, [userId, ...medicineIds]);
    return result.affectedRows;
  }
};
