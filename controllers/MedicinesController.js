const Medicines = require("../models/Medicines");

module.exports = {
  getAll: async (req, res) => {
    const userId = req.params.userId;
    try {
      const meds = await Medicines.getAllMedicinesByUser(userId);
      res.status(200).json(meds);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error fetching medicines." });
    }
  },

  getOne: async (req, res) => {
    const { userId, medicineId } = req.params;
    try {
      const medicine = await Medicines.getMedicineById(userId, medicineId);
      if (!medicine) return res.status(404).json({ error: "Medicine not found." });
      res.status(200).json(medicine);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error fetching medicine." });
    }
  },

  create: async (req, res) => {
    const userId = req.params.userId;
    const { medicine_name, strength, amount, notes } = req.body;

    if (!medicine_name || !strength || !amount) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    try {
      const newId = await Medicines.addMedicineForUser(userId, { medicine_name, strength, amount, notes });
      res.status(201).json({ message: "Medicine added", id: newId });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error adding medicine." });
    }
  },

  update: async (req, res) => {
    const { userId, medicineId } = req.params;
    const { medicine_name, strength, amount, notes } = req.body;

    try {
      const updated = await Medicines.updateMedicineForUser(userId, medicineId, { medicine_name, strength, amount, notes });
      if (!updated) return res.status(404).json({ error: "Medicine not found or not updated." });
      res.status(200).json({ message: "Medicine updated" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error updating medicine." });
    }
  },

  delete: async (req, res) => {
    const { userId, medicineId } = req.params;
  
    try {
      const deleted = await Medicines.deleteMedicineForUser(userId, medicineId);
      if (!deleted) return res.status(404).json({ error: "Medicine not found or not deleted." });
      res.status(200).json({ message: "Medicine deleted" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error deleting medicine." });
    }
  },

  deleteMultiple: async (req, res) => {
    const userId = req.params.userId;
    let { ids } = req.body;

    // In case ids array comes as a string
    if (typeof ids === 'string') {
      try {
        ids = JSON.parse(ids);
      } catch (err) {
        return res.status(400).json({ error: "Invalid format for IDs." });
      }
    }

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "Provide an array of medicine IDs to delete." });
    }
  
    try {
      const deletedCount = await Medicines.deleteMultipleMedicines(userId, ids);
      res.status(200).json({ message: `Deleted ${deletedCount} medicines.` });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error deleting medicines." });
    }
  }
};
