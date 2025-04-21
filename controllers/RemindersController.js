const Reminders = require("../models/Reminders");

module.exports = {
  getAllRules: async (req, res) => {
    try {
      const { userId } = req.params;
      const reminders = await Reminders.getAllReminderRulesForUser(userId);
      res.status(200).json(reminders);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error retrieving reminders." });
    }
  },

  getOneRule: async (req, res) => {
    try {
      const { userId, reminderId } = req.params;
      const reminder = await Reminders.getReminderRuleById(userId, reminderId);
      if (!reminder)
        return res.status(404).json({ error: "Reminder not found." });
      res.status(200).json(reminder);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error retrieving reminder." });
    }
  },

  createRule: async (req, res) => {
    try {
      const reminderData = req.body;
      const reminderId = await Reminders.createReminderRule(reminderData);
      
      const reminders = await Reminders.createReminders(reminderId, req.body.start_date, req.body.end_date, req.body.week_day);
      res.status(201).json({ id: reminderId });

    } catch (err) {
      
      console.error(err);
      res.status(500).json({ error: "Error creating reminder." });
    }
    
  },

  updateRule: async (req, res) => {
    try {
      const { userId, reminderId } = req.params;
      const updated = await Reminders.updateReminderRule(
        userId,
        reminderId,
        req.body
      );
      if (!updated)
        return res
          .status(404)
          .json({ error: "Reminder not found or not updated." });
      await Reminders.deleteRemindersByRuleId(req.body.id);
      await Reminders.createReminders(req.body.id, req.body.start_date, req.body.end_date, req.body.week_day);
      res.status(200).json({ message: "Reminder updated." });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error updating reminder." });
    }
  },

  deleteRule: async (req, res) => {
    try {
      const { userId, reminderId } = req.params;
      const deleted = await Reminders.deleteReminderRule(userId, reminderId);
      if (!deleted)
        return res
          .status(404)
          .json({ error: "Reminder not found or not deleted." });
      res.status(200).json({ message: "Reminder deleted." });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error deleting reminder." });
    }
  },

  deleteMultipleRules: async (req, res) => {
    try {
      const { userId } = req.params;
      let { ids } = req.body;

      // In case string
      if (typeof ids === "string") {
        try {
          ids = JSON.parse(ids);
        } catch (err) {
          return res.status(400).json({ error: "Invalid format for IDs." });
        }
      }

      if (!Array.isArray(ids) || ids.length === 0) {
        return res
          .status(400)
          .json({
            error: "Provide an array or a string of reminder IDs to delete.",
          });
      }

      const deletedCount = await Reminders.deleteMultipleReminderRules(userId, ids);
      res.status(200).json({ message: `Deleted ${deletedCount} reminder(s).` });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error deleting reminders." });
    }
  },

  // Actual Reminders
  getAllReminders: async (req, res) => {
    try {
      const userId = req.params.userId;
      const reminders = await Reminders.getAllReminders(userId);
      res.status(200).json(reminders);
    } catch (err) {
      res.status(500).json({ error: "Error fetching reminders." });
    }
  },

  updateTakenStatus: async (req, res) => {
    try {
      const reminderId = req.params.reminderId;

      if (!('taken' in req.body)) {
        return res.status(400).json({ error: "Can't find taken field." });
      }

      const updated = await Reminders.updateTakenStatus(reminderId, req.body.taken);
      if (updated > 0) {
        res.status(200).json({ message: "Reminder updated." });
      } else {
        res.status(404).json({ error: "Reminder not found." });
      }
    } catch (err) {
      res.status(500).json({ error: "Error updating reminder." });
    }
  },

  getRulesByMedicineId: async (req, res) => {

    try {
        const { medicineId } = req.params;

        const rules = await Reminders.getRulesByMedicineId(medicineId);

        res.status(200).json(rules);
    } catch (err) {
        console.error(" Error in getRulesByMedicineId:", err);
        res.status(500).json({ error: "Error retrieving rules." });
    }
}



};
